// ============================================
// ADMIN — Avatar Editor
// Uses buildAvatarSVG() and buildMouth() from js/modules/avatar.js
// ============================================

let _adminCfg = { ...AVATAR_DEFAULTS };
let _adminSvgEl = null;  // the live <svg> in admin-avatar-canvas
let _adminPreviewState = 'idle';

// ============================================
// RENDER PREVIEW
// ============================================
function renderAdminPreview() {
  const canvas = document.getElementById('admin-avatar-canvas');
  if (!canvas) return;

  // Inject SVG
  canvas.innerHTML = buildAvatarSVG(_adminCfg);
  _adminSvgEl = canvas.querySelector('svg');

  if (_adminSvgEl) {
    // Force pixel art rendering
    _adminSvgEl.style.cssText =
      'width:100px;height:160px;display:block;image-rendering:pixelated;image-rendering:crisp-edges;';
    // Apply current state animation
    _adminSvgEl.setAttribute('class', 'avatar-sprite state-' + _adminPreviewState);
    // Apply current mouth expression
    const mouthG = _adminSvgEl.querySelector('#avatar-mouth');
    if (mouthG) {
      const expr = STATE_EXPRESSION[_adminPreviewState] || 'smile';
      mouthG.innerHTML = buildMouth(expr);
    }
    // Show phone/laptop/book props
    const phoneG = _adminSvgEl.querySelector('#avatar-phone');
    if (phoneG) phoneG.style.display = _adminPreviewState === 'phone' ? '' : 'none';
    const bookG = _adminSvgEl.querySelector('#avatar-book');
    if (bookG) bookG.style.display = _adminPreviewState === 'study' ? '' : 'none';
    const codeBg = _adminSvgEl.querySelector('#avatar-code-bg');
    if (codeBg) codeBg.style.display = _adminPreviewState === 'code' ? '' : 'none';
    const codeFg = _adminSvgEl.querySelector('#avatar-code-fg');
    if (codeFg) codeFg.style.display = _adminPreviewState === 'code' ? '' : 'none';
  }
}

// ============================================
// SELECTION UI REFRESH
// ============================================
function refreshAdminSelections() {
  // Swatches with data-value
  document.querySelectorAll('#section-avatar .avatar-swatch[data-key][data-value]').forEach(el => {
    el.classList.toggle('selected', _adminCfg[el.dataset.key] === el.dataset.value);
  });

  // Option chips (single-value)
  document.querySelectorAll('#section-avatar .avatar-opt-chip[data-key]').forEach(el => {
    el.classList.toggle('selected', _adminCfg[el.dataset.key] === el.dataset.value);
  });

  // Sync custom color inputs to current value
  ['skinTone','hairColor','beardColor','eyeColor','shirtColor','pantsColor','glassesColor'].forEach(key => {
    const inp = document.querySelector(
      `#section-avatar .avatar-swatch[data-key="${key}"] .swatch-color-input`
    );
    if (inp && _adminCfg[key] && _adminCfg[key].startsWith('#') && _adminCfg[key].length === 7) {
      inp.value = _adminCfg[key];
    }
  });

  // Allowed states toggles (multi-value array)
  document.querySelectorAll('#section-avatar .state-toggle').forEach(el => {
    const state = el.dataset.state;
    const allowed = _adminCfg.allowedStates;
    const isOn = !allowed || !Array.isArray(allowed) || allowed.includes(state);
    el.classList.toggle('selected', isOn);
  });
}

// ============================================
// WIRE UP CONTROLS
// ============================================
function setupAvatarEditor() {
  const section = document.getElementById('section-avatar');
  if (!section) return;

  // ── Preset swatch clicks ──
  section.querySelectorAll('.avatar-swatch[data-key][data-value]').forEach(el => {
    el.addEventListener('click', () => {
      _adminCfg[el.dataset.key] = el.dataset.value;
      refreshAdminSelections();
      renderAdminPreview();
    });
  });

  // ── Custom color pickers ──
  section.querySelectorAll('.swatch-color-input').forEach(input => {
    const swatch = input.closest('.avatar-swatch');
    const key = swatch && swatch.dataset.key;
    if (!key) return;

    input.addEventListener('input', (e) => {
      _adminCfg[key] = e.target.value;
      // Remove selected from presets for this key
      section.querySelectorAll(`.avatar-swatch[data-key="${key}"][data-value]`)
             .forEach(s => s.classList.remove('selected'));
      renderAdminPreview();
    });
  });

  // ── Option chips ──
  section.querySelectorAll('.avatar-opt-chip[data-key]').forEach(el => {
    el.addEventListener('click', () => {
      _adminCfg[el.dataset.key] = el.dataset.value;
      refreshAdminSelections();
      renderAdminPreview();
    });
  });

  // ── Allowed states toggles (multi-select) ──
  section.querySelectorAll('.state-toggle').forEach(el => {
    el.addEventListener('click', () => {
      // Initialize allowedStates if null (means all allowed)
      if (!_adminCfg.allowedStates || !Array.isArray(_adminCfg.allowedStates)) {
        _adminCfg.allowedStates = [...ALL_AUTONOMOUS_STATES];
      }
      const state = el.dataset.state;
      const idx = _adminCfg.allowedStates.indexOf(state);
      if (idx >= 0) {
        _adminCfg.allowedStates.splice(idx, 1);
        el.classList.remove('selected');
      } else {
        _adminCfg.allowedStates.push(state);
        el.classList.add('selected');
      }
    });
  });

  // ── State preview chips ──
  section.querySelectorAll('.avatar-state-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      section.querySelectorAll('.avatar-state-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      _adminPreviewState = chip.dataset.state;
      renderAdminPreview();
    });
  });

  // ── Save button ──
  document.getElementById('btn-save-avatar')?.addEventListener('click', saveAvatarToSupabase);

  // Initial render
  renderAdminPreview();
  refreshAdminSelections();

  // Mark first state chip as active
  const firstChip = section.querySelector('.avatar-state-chip');
  if (firstChip) firstChip.classList.add('active');
}

// ============================================
// LOAD FROM SUPABASE
// ============================================
async function loadAvatarConfig() {
  const { data } = await supabase
    .from('profiles')
    .select('avatar_config')
    .limit(1)
    .single();

  if (data?.avatar_config) {
    try {
      const parsed = typeof data.avatar_config === 'string'
        ? JSON.parse(data.avatar_config)
        : data.avatar_config;
      _adminCfg = { ...AVATAR_DEFAULTS, ...parsed };
    } catch (_) {}
  }

  renderAdminPreview();
  refreshAdminSelections();
}

// ============================================
// SAVE TO SUPABASE
// ============================================
async function saveAvatarToSupabase() {
  const userId = window.currentUserId;
  if (!userId) { showToast('Usuário não autenticado.', true); return; }

  const btn = document.getElementById('btn-save-avatar');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...'; }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_config: _adminCfg })
    .eq('user_id', userId);

  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Salvar Avatar'; }

  if (error) {
    showToast('Erro ao salvar: ' + error.message, true);
  } else {
    showToast('Avatar salvo com sucesso! ✓');
  }
}
