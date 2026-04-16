// ============================================
// PROFILE
// ============================================
async function loadProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) return;

  // Hero
  if (data.full_name) {
    document.getElementById('hero-name').textContent = data.full_name;
    document.getElementById('nav-name').textContent = data.full_name.split(' ')[0];
    document.getElementById('footer-name').textContent = data.full_name;
    document.getElementById('footer-bottom-name').textContent = data.full_name;
    document.title = `${data.full_name} - Portfolio`;
  }

  if (data.title) {
    document.getElementById('hero-title').textContent = data.title;
    document.getElementById('footer-title').textContent = data.title;
  }

  if (data.location) {
    const locEl = document.getElementById('hero-location');
    locEl.querySelector('span').textContent = data.location;
    locEl.style.display = '';
    const infoLoc = document.getElementById('info-location');
    infoLoc.querySelector('.info-value').textContent = data.location;
    infoLoc.style.display = '';
  }

  if (data.photo_url) {
    document.getElementById('hero-avatar').src = data.photo_url;
  }

  // About
  if (data.bio) {
    const bioEl = document.getElementById('about-bio');
    if (bioEl.classList.contains('typed')) {
      // Already typed (placeholder was animated) — just swap text instantly
      bioEl.textContent = data.bio;
      bioEl.dataset.typeTarget = data.bio;
    } else if (bioEl.dataset.typeTarget) {
      // Animation queued but hasn't fired yet — update the target text
      bioEl.textContent = data.bio;
      bioEl.dataset.typeTarget = data.bio;
    } else {
      // No animation interaction yet — set text for future type-in
      bioEl.textContent = data.bio;
    }
  }

  if (data.email) {
    const el = document.getElementById('info-email');
    el.querySelector('.info-value').textContent = data.email;
    el.style.display = '';
  }

  if (data.phone) {
    const el = document.getElementById('info-phone');
    el.querySelector('.info-value').textContent = data.phone;
    el.style.display = '';
  }

  // WhatsApp
  if (data.whatsapp_number) {
    const el = document.getElementById('info-whatsapp');
    const link = el.querySelector('.info-link');
    const cleanNum = data.whatsapp_number.replace(/\D/g, '');
    link.href = `https://wa.me/${cleanNum}`;
    link.textContent = data.whatsapp_number;
    el.style.display = '';
  }

  // Company
  if (data.company_name) {
    const el = document.getElementById('info-company');
    const valueEl = el.querySelector('.info-value');
    if (data.company_url) {
      const link = document.createElement('a');
      link.href = data.company_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = data.company_name;
      link.style.color = 'var(--accent)';
      link.style.textDecoration = 'none';
      valueEl.textContent = '';
      valueEl.appendChild(link);
    } else {
      valueEl.textContent = data.company_name;
    }
    el.style.display = '';

    if (data.company_start_date) {
      const timeEl = document.getElementById('info-company-time');
      timeEl.textContent = calcTimeSince(data.company_start_date);
    }
  }

  // Footer — contatos detalhados
  if (data.location) {
    const el = document.getElementById('footer-location');
    document.getElementById('footer-location-value').textContent = data.location;
    if (el) el.style.display = '';
  }

  if (data.email) {
    const el = document.getElementById('footer-email');
    const link = document.getElementById('footer-email-link');
    if (link) { link.href = `mailto:${data.email}`; link.textContent = data.email; }
    if (el) el.style.display = '';
  }

  if (data.phone) {
    const el = document.getElementById('footer-phone');
    document.getElementById('footer-phone-value').textContent = data.phone;
    if (el) el.style.display = '';
  }

  if (data.whatsapp_number) {
    const el = document.getElementById('footer-whatsapp');
    const link = document.getElementById('footer-whatsapp-link');
    const cleanNum = data.whatsapp_number.replace(/\D/g, '');
    if (link) { link.href = `https://wa.me/${cleanNum}`; link.textContent = data.whatsapp_number; }
    if (el) el.style.display = '';
  }

  if (data.company_name) {
    const el = document.getElementById('footer-company');
    const span = document.getElementById('footer-company-value');
    if (span) {
      if (data.company_url) {
        span.innerHTML = `<a href="${data.company_url}" target="_blank" rel="noopener noreferrer">${data.company_name}</a>`;
      } else {
        span.textContent = data.company_name;
      }
    }
    if (el) el.style.display = '';
  }

  // AI context — nome, título e empresa para o avatar speech
  if (window._avatarCtx) {
    window._avatarCtx.name    = data.full_name    || null;
    window._avatarCtx.title   = data.title        || null;
    window._avatarCtx.company = data.company_name || null;
  }

  // GitHub & Tech stats
  if (data.github_username) {
    loadGitHubData(data.github_username);
  }

  // Resume modal
  if (typeof setResumeUrl === 'function') {
    setResumeUrl(data.resume_url || null);
  }

  // Avatar config
  if (typeof updateAvatarConfig === 'function' && data.avatar_config) {
    try {
      const cfg = typeof data.avatar_config === 'string'
        ? JSON.parse(data.avatar_config)
        : data.avatar_config;
      updateAvatarConfig(cfg);
    } catch (_) {}
  }
}

