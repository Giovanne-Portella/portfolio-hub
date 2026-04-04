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
    document.getElementById('about-bio').textContent = data.bio;
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

  // GitHub & Tech stats
  if (data.github_username) {
    loadGitHubData(data.github_username);
  }
}

