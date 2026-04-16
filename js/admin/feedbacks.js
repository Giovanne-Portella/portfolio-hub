// ============================================
// FEEDBACKS (ADMIN) — Solicitações
// ============================================

let _allFeedbacks = [];
let _currentFeedbackFilter = 'all';
let _feedbackViewId = null;   // ID do feedback aberto no modal

// ============================================
// LOAD & RENDER
// ============================================
async function loadFeedbacksAdmin() {
  const container = document.getElementById('feedbacks-list');

  const { data, error } = await supabase
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Erro ao carregar feedbacks.</p>
      </div>`;
    return;
  }

  _allFeedbacks = data || [];

  // Update pending badge on sidebar nav item
  const pendingCount = _allFeedbacks.filter(f => !f.approved).length;
  const sideBadge = document.getElementById('feedbacks-pending-badge');
  if (sideBadge) {
    sideBadge.textContent = pendingCount;
    sideBadge.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
  }

  // Update count in filter tab
  const tabBadge = document.getElementById('pending-count-badge');
  if (tabBadge) {
    tabBadge.textContent = pendingCount > 0 ? pendingCount : '';
  }

  renderFeedbacks();
}

function renderFeedbacks() {
  const container = document.getElementById('feedbacks-list');

  let filtered = _allFeedbacks;
  if (_currentFeedbackFilter === 'pending')  filtered = _allFeedbacks.filter(f => !f.approved);
  if (_currentFeedbackFilter === 'approved') filtered = _allFeedbacks.filter(f =>  f.approved);

  if (filtered.length === 0) {
    const msgs = {
      all:      'Nenhum feedback recebido ainda.',
      pending:  'Nenhum feedback pendente.',
      approved: 'Nenhum feedback aprovado.',
    };
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>${msgs[_currentFeedbackFilter]}</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(fb => {
    const date    = new Date(fb.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const excerpt = fb.feedback.length > 120
      ? fb.feedback.substring(0, 120) + '…'
      : fb.feedback;

    const statusBadge = fb.approved
      ? '<span class="item-badge badge-success"><i class="fas fa-check"></i> Aprovado</span>'
      : '<span class="item-badge badge-pending"><i class="fas fa-clock"></i> Pendente</span>';

    const quickAction = !fb.approved
      ? `<button class="btn btn-sm btn-approve" onclick="approveFeedback('${fb.id}')" title="Aprovar">
           <i class="fas fa-check"></i> Aprovar
         </button>`
      : `<button class="btn btn-sm btn-revoke" onclick="revokeFeedback('${fb.id}')" title="Revogar">
           <i class="fas fa-times"></i> Revogar
         </button>`;

    return `
      <div class="item-card feedback-card" data-id="${fb.id}">
        <div class="item-info">
          <div class="item-name">
            ${esc(fb.name)}
            <span class="feedback-profession">&nbsp;·&nbsp;${esc(fb.profession)}</span>
            ${statusBadge}
          </div>
          <div class="feedback-excerpt">${esc(excerpt)}</div>
          <div class="item-meta">
            <span><i class="fas fa-calendar-alt"></i> ${date}</span>
          </div>
        </div>
        <div class="item-actions feedback-actions">
          <button class="btn btn-sm btn-primary" onclick="openFeedbackModal('${fb.id}')" title="Ler completo">
            <i class="fas fa-eye"></i> Ver
          </button>
          ${quickAction}
          <button class="btn btn-sm btn-icon btn-danger" onclick="deleteFeedback('${fb.id}')" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// SETUP (filter tabs)
// ============================================
function setupFeedbacksAdmin() {
  document.querySelectorAll('.feedback-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.feedback-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _currentFeedbackFilter = btn.dataset.filter;
      renderFeedbacks();
    });
  });
}

// ============================================
// ACTIONS
// ============================================
async function approveFeedback(id) {
  const { error } = await supabase
    .from('feedbacks')
    .update({ approved: true })
    .eq('id', id);

  if (error) { showToast('Erro ao aprovar feedback.', true); return; }
  showToast('Feedback aprovado e agora visível no portfolio!');
  await loadFeedbacksAdmin();
}

async function revokeFeedback(id) {
  const { error } = await supabase
    .from('feedbacks')
    .update({ approved: false })
    .eq('id', id);

  if (error) { showToast('Erro ao revogar aprovação.', true); return; }
  showToast('Aprovação revogada. Feedback removido do portfolio.');
  await loadFeedbacksAdmin();
}

async function deleteFeedback(id) {
  if (!confirm('Tem certeza que deseja excluir este feedback permanentemente?')) return;

  const { error } = await supabase
    .from('feedbacks')
    .delete()
    .eq('id', id);

  if (error) { showToast('Erro ao excluir feedback.', true); return; }
  showToast('Feedback excluído.');
  await loadFeedbacksAdmin();
}

// ============================================
// MODAL — Visualizar feedback completo
// ============================================
function openFeedbackModal(id) {
  const fb = _allFeedbacks.find(f => f.id === id);
  if (!fb) return;

  _feedbackViewId = id;

  // Cabeçalho
  document.getElementById('fv-name').textContent = fb.name;
  const date = new Date(fb.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  document.getElementById('fv-meta').textContent = `${fb.profession} · ${date}`;

  // Status
  const statusRow = document.getElementById('fv-status-row');
  statusRow.innerHTML = fb.approved
    ? '<span class="item-badge badge-success"><i class="fas fa-check"></i> Aprovado — visível no portfolio</span>'
    : '<span class="item-badge badge-pending"><i class="fas fa-clock"></i> Pendente — aguardando aprovação</span>';

  // Texto completo
  document.getElementById('fv-body').textContent = fb.feedback;

  // Rede social
  const socialDiv  = document.getElementById('fv-social');
  const socialLink = document.getElementById('fv-social-link');
  const socialIcon = document.getElementById('fv-social-icon');
  const socialLabel = document.getElementById('fv-social-label');
  const socialHidden = document.getElementById('fv-social-hidden');

  if (fb.linkedin_url) {
    socialDiv.style.display = '';
    const s = detectSocialAdmin(fb.linkedin_url);
    socialIcon.className = s.icon;
    socialLabel.textContent = `Ver ${s.label}`;
    socialLink.href = fb.linkedin_url;
    socialHidden.textContent = fb.show_linkedin ? '(visível no portfolio)' : '(oculto no portfolio)';
  } else {
    socialDiv.style.display = 'none';
  }

  // Botões de ação
  document.getElementById('fv-approve-btn').style.display = fb.approved ? 'none' : '';
  document.getElementById('fv-revoke-btn').style.display  = fb.approved ? '' : 'none';

  openModal('modal-feedback-view');
}

function detectSocialAdmin(url) {
  try {
    const host = new URL(url.startsWith('http') ? url : 'https://' + url).hostname.replace('www.', '');
    if (host.includes('linkedin.com'))  return { icon: 'fab fa-linkedin',  label: 'LinkedIn'  };
    if (host.includes('instagram.com')) return { icon: 'fab fa-instagram', label: 'Instagram' };
    if (host.includes('github.com'))    return { icon: 'fab fa-github',    label: 'GitHub'    };
    if (host.includes('x.com') || host.includes('twitter.com')) return { icon: 'fab fa-x-twitter', label: 'X' };
    if (host.includes('youtube.com'))   return { icon: 'fab fa-youtube',   label: 'YouTube'   };
    if (host.includes('facebook.com'))  return { icon: 'fab fa-facebook',  label: 'Facebook'  };
    if (host.includes('tiktok.com'))    return { icon: 'fab fa-tiktok',    label: 'TikTok'    };
  } catch (_) {}
  return { icon: 'fas fa-link', label: 'perfil' };
}

async function fvApprove() {
  await approveFeedback(_feedbackViewId);
  closeModal('modal-feedback-view');
}

async function fvRevoke() {
  await revokeFeedback(_feedbackViewId);
  closeModal('modal-feedback-view');
}

async function fvDelete() {
  closeModal('modal-feedback-view');
  await deleteFeedback(_feedbackViewId);
}
