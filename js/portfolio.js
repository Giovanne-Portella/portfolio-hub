// ============================================
// Portfolio - Public Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadSocialLinks();
  loadCertificates();
  loadProjects();
  setupNavbar();
  setupModal();
  setupCollapsible();
  setupTypeInAnimation();
  setupSplashScreen();

  document.getElementById('footer-year').textContent = new Date().getFullYear();
});

// ============================================
// SPLASH SCREEN — Linux Terminal Boot
// ============================================
const splashBootLines = [
  { status: 'ok',   text: 'Initializing system...' },
  { status: 'ok',   text: 'Loading kernel modules...' },
  { status: 'ok',   text: 'Mounting file system...' },
  { status: 'ok',   text: 'Starting network daemon...' },
  { status: 'ok',   text: 'Connecting to Supabase...' },
  { status: 'ok',   text: 'Fetching portfolio data...' },
  { status: 'ok',   text: 'Loading certificates...' },
  { status: 'ok',   text: 'Loading projects...' },
  { status: 'ok',   text: 'Compiling stylesheets...' },
  { status: 'ok',   text: 'Rendering components...' },
  { status: 'info', text: 'All systems operational.' },
];

const splashWelcomeMsg = 'Seja muito bem vindo ao meu cantinho profissional e acadêmico! Aqui você poderá acompanhar os meus projetos e novas qualificações na área da tecnologia!';

let splashAudioCtx = null;

function playKeystroke() {
  if (!splashAudioCtx) return;
  try {
    const dur = 0.035 + Math.random() * 0.015;
    const bufLen = Math.floor(splashAudioCtx.sampleRate * dur);
    const buf = splashAudioCtx.createBuffer(1, bufLen, splashAudioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 4);
    }
    const src = splashAudioCtx.createBufferSource();
    src.buffer = buf;
    const gain = splashAudioCtx.createGain();
    gain.gain.value = 0.06 + Math.random() * 0.03;
    const filter = splashAudioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800 + Math.random() * 1200;
    filter.Q.value = 0.8;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(splashAudioCtx.destination);
    src.start();
  } catch (_) {}
}

function setupSplashScreen() {
  const overlay = document.getElementById('splash-overlay');
  if (!overlay) return;

  const hasVisited = localStorage.getItem('portfolio_visited');

  if (hasVisited) {
    // Return visit — quick welcome back, auto-dismiss
    runReturnSplash(overlay);
  } else {
    // First visit — full boot sequence
    runFirstVisitSplash(overlay);
  }
}

function runFirstVisitSplash(overlay) {
  const body = document.getElementById('splash-body');
  const hint = document.getElementById('splash-click-hint');
  const prompt = document.getElementById('splash-prompt');

  const startBoot = () => {
    overlay.removeEventListener('click', startBoot);
    hint.style.display = 'none';

    try {
      splashAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (splashAudioCtx.state === 'suspended') splashAudioCtx.resume();
    } catch (_) {}

    const cursor = prompt.querySelector('.splash-cursor');
    if (cursor) cursor.remove();

    runBootSequence(body);
  };

  overlay.addEventListener('click', startBoot);
}

function runReturnSplash(overlay) {
  const body = document.getElementById('splash-body');
  const hint = document.getElementById('splash-click-hint');
  const prompt = document.getElementById('splash-prompt');

  // Hide hint and prompt
  if (hint) hint.style.display = 'none';
  if (prompt) prompt.style.display = 'none';

  // Show welcome back message with typing effect
  const welcomeEl = document.createElement('div');
  welcomeEl.className = 'splash-welcome-text';
  welcomeEl.style.marginTop = '0';
  body.appendChild(welcomeEl);

  const msg = 'Seja bem vindo novamente!';
  let i = 0;

  function typeChar() {
    if (i < msg.length) {
      welcomeEl.innerHTML = msg.substring(0, i + 1) + '<span class="splash-welcome-cursor">█</span>';
      i++;
      setTimeout(typeChar, 35 + Math.random() * 25);
    } else {
      welcomeEl.textContent = msg;
      // Auto-dismiss after a short pause
      setTimeout(() => dismissSplash(), 1800);
    }
  }

  // Small delay then start typing
  setTimeout(typeChar, 500);
}

async function runBootSequence(body) {
  // Phase 1: Boot lines with progress bar
  const progressDiv = document.createElement('div');
  progressDiv.innerHTML = `
    <div class="splash-progress-container">
      <div class="splash-progress-bar"><div class="splash-progress-fill" id="splash-fill"></div></div>
      <span class="splash-progress-pct" id="splash-pct">0%</span>
    </div>`;
  body.appendChild(progressDiv);

  const fill = document.getElementById('splash-fill');
  const pct = document.getElementById('splash-pct');

  for (let i = 0; i < splashBootLines.length; i++) {
    const line = splashBootLines[i];
    const el = document.createElement('div');
    el.className = 'splash-boot-line';

    let tag = '';
    if (line.status === 'ok') tag = '<span class="splash-ok">[ OK ]</span>';
    else if (line.status === 'fail') tag = '<span class="splash-fail">[FAIL]</span>';
    else tag = '<span class="splash-info">[INFO]</span>';

    el.innerHTML = `${tag} ${line.text}`;
    body.insertBefore(el, progressDiv);

    const progress = Math.round(((i + 1) / splashBootLines.length) * 100);
    fill.style.width = progress + '%';
    pct.textContent = progress + '%';

    // Auto-scroll terminal body
    body.scrollTop = body.scrollHeight;

    await sleep(120 + Math.random() * 180);
  }

  await sleep(400);

  // Phase 2: Welcome message typing
  const welcomeEl = document.createElement('div');
  welcomeEl.className = 'splash-welcome-text';
  welcomeEl.innerHTML = '<span class="splash-welcome-cursor">█</span>';
  body.appendChild(welcomeEl);
  body.scrollTop = body.scrollHeight;

  await sleep(300);

  let typed = '';
  for (let i = 0; i < splashWelcomeMsg.length; i++) {
    typed += splashWelcomeMsg[i];
    welcomeEl.innerHTML = typed + '<span class="splash-welcome-cursor">█</span>';
    playKeystroke();
    body.scrollTop = body.scrollHeight;
    await sleep(25 + Math.random() * 20);
  }

  // Remove cursor
  await sleep(200);
  welcomeEl.textContent = splashWelcomeMsg;

  // Phase 3: Show "Prosseguir" button
  const btnDiv = document.createElement('div');
  btnDiv.className = 'splash-btn-container';
  btnDiv.innerHTML = '<button class="splash-btn" id="splash-proceed">▸ Prosseguir</button>';
  body.appendChild(btnDiv);
  body.scrollTop = body.scrollHeight;

  document.getElementById('splash-proceed').addEventListener('click', (e) => {
    e.stopPropagation();
    dismissSplash();
  });
}

function dismissSplash() {
  const overlay = document.getElementById('splash-overlay');
  overlay.classList.add('dismissed');

  // Mark as visited so next load gets the quick splash
  localStorage.setItem('portfolio_visited', '1');

  // Reveal site content
  document.body.classList.remove('site-loading');
  document.body.classList.add('site-loaded');

  // Clean up audio context
  if (splashAudioCtx) {
    splashAudioCtx.close().catch(() => {});
    splashAudioCtx = null;
  }

  // Start music playback — the click qualifies as user gesture
  // On return splash (auto-dismiss), there's no user gesture, so set up fallback
  if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
    ytPlayer.playVideo();
  }
  document.getElementById('music-player').classList.add('visible');

  // Fallback: if playVideo didn't work (no gesture), play on first interaction
  if (!ytIsPlaying) {
    const tryPlay = () => {
      if (ytPlayer && typeof ytPlayer.playVideo === 'function') ytPlayer.playVideo();
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('scroll', tryPlay);
    };
    document.addEventListener('click', tryPlay, { once: true });
    document.addEventListener('scroll', tryPlay, { once: true });
  }

  // Remove overlay from DOM after transition
  setTimeout(() => overlay.remove(), 1000);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ============================================
// NAVBAR
// ============================================
function setupNavbar() {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('mobile-menu');

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => menu.classList.remove('active'));
  });

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
}

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

// ============================================
// SOCIAL LINKS
// ============================================
async function loadSocialLinks() {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) return;

  const heroSocial = document.getElementById('hero-social');
  const footerSocial = document.getElementById('footer-social');

  heroSocial.innerHTML = '';
  footerSocial.innerHTML = '';

  data.forEach(link => {
    const icon = `<a href="${escapeAttr(link.url)}" target="_blank" rel="noopener noreferrer" 
                     class="social-icon" title="${escapeHtml(link.platform)}">
                    <i class="fab ${escapeAttr(link.icon)}"></i>
                  </a>`;
    heroSocial.insertAdjacentHTML('beforeend', icon);
    footerSocial.insertAdjacentHTML('beforeend', icon);
  });
}

// ============================================
// CERTIFICATES
// ============================================
let allCategories = [];
let allCerts = [];
let activeCategoryId = null;

async function loadCertificates() {
  const sidebar = document.getElementById('cert-sidebar');

  // Load categories
  const { data: categories, error: catError } = await supabase
    .from('certificate_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (catError || !categories || categories.length === 0) {
    sidebar.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-certificate"></i>
        <p>Nenhum certificado cadastrado ainda.</p>
      </div>`;
    return;
  }

  // Load all certificates
  const { data: certs, error: certError } = await supabase
    .from('certificates')
    .select('*')
    .order('display_order', { ascending: true });

  if (certError) {
    sidebar.innerHTML = '<p class="empty-state">Erro ao carregar certificados.</p>';
    return;
  }

  allCategories = categories;
  allCerts = certs || [];

  // Build sidebar list
  sidebar.innerHTML = '';

  categories.forEach(category => {
    const categoryCerts = allCerts.filter(c => c.category_id === category.id);
    const completedCount = categoryCerts.filter(c => c.completed).length;
    const totalCount = categoryCerts.length;
    const totalHours = categoryCerts.reduce((sum, c) => sum + (c.hours || 0), 0);
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const item = document.createElement('div');
    item.className = 'cert-sidebar-item';
    item.dataset.categoryId = category.id;
    item.innerHTML = `
      <div class="cert-sidebar-info">
        <span class="cert-sidebar-name">${escapeHtml(category.name)}</span>
        ${category.description ? `<span class="cert-sidebar-desc">${escapeHtml(category.description)}</span>` : ''}
        <span class="cert-sidebar-count">${completedCount} de ${totalCount} concluídos${totalHours > 0 ? ` • ${totalHours}h` : ''}</span>
      </div>
      <div class="cert-sidebar-progress">
        <div class="cert-sidebar-progress-bar" style="width: ${progress}%"></div>
      </div>
    `;
    item.addEventListener('click', () => selectCategory(category.id));
    sidebar.appendChild(item);
  });

  // Update section title with total hours
  const certTotalHours = allCerts.reduce((sum, c) => sum + (c.hours || 0), 0);
  const certTitle = document.getElementById('cert-section-title');
  if (certTitle) {
    certTitle.textContent = certTotalHours > 0 ? `Certificados • ${certTotalHours}h` : 'Certificados';
  }

  // Re-attach collapsible handlers
  setupCollapsible();

  // Re-observe type-in elements (setupCollapsible clones headers, removing observers)
  setupTypeInAnimation();

  // Setup mobile scroll indicators for sidebar
  setupCertSidebarScroll();

  // Handle deep link to specific certificate
  handleCertDeepLink();
}

function setupCertSidebarScroll() {
  const sidebar = document.getElementById('cert-sidebar');
  if (!sidebar || window.innerWidth > 768) return;

  if (!sidebar.parentElement.classList.contains('cert-sidebar-wrapper')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'cert-sidebar-wrapper';
    sidebar.parentElement.insertBefore(wrapper, sidebar);
    wrapper.appendChild(sidebar);

    // Floating arrow on the right edge
    const arrow = document.createElement('div');
    arrow.className = 'cert-scroll-arrow';
    arrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
    wrapper.appendChild(arrow);

    const updateArrow = () => {
      const maxScroll = sidebar.scrollWidth - sidebar.clientWidth;
      // Hide arrow when scrolled to end or no overflow
      arrow.classList.toggle('hidden', sidebar.scrollLeft >= maxScroll - 10 || maxScroll <= 0);
    };

    sidebar.addEventListener('scroll', updateArrow, { passive: true });
    requestAnimationFrame(() => requestAnimationFrame(updateArrow));
  }
}

function selectCategory(categoryId) {
  // Update sidebar active state
  document.querySelectorAll('.cert-sidebar-item').forEach(el => {
    el.classList.toggle('active', el.dataset.categoryId === categoryId);
  });

  activeCategoryId = categoryId;

  const category = allCategories.find(c => c.id === categoryId);
  const categoryCerts = allCerts.filter(c => c.category_id === categoryId);

  const placeholder = document.getElementById('cert-placeholder');
  const content = document.getElementById('cert-main-content');

  placeholder.style.display = 'none';
  content.style.display = '';

  if (categoryCerts.length === 0) {
    content.innerHTML = `
      <div class="cert-main-header">
        <h3>${escapeHtml(category.name)}</h3>
      </div>
      <div class="empty-state">
        <i class="fas fa-plus-circle"></i>
        <p>Nenhum certificado nesta categoria.</p>
      </div>`;
    return;
  }

  content.innerHTML = `
    <div class="cert-main-header">
      <h3>${escapeHtml(category.name)}</h3>
      ${category.description ? `<p>${escapeHtml(category.description)}</p>` : ''}
    </div>
    <div class="cert-grid">
      ${categoryCerts.map(cert => createCertCard(cert)).join('')}
    </div>
  `;

  // Render PDF thumbnails
  renderPdfThumbnails();
}

function createCertCard(cert) {
  const dateStr = cert.completed_at
    ? new Date(cert.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : '';

  const statusHtml = cert.completed
    ? '<div class="cert-status completed"><i class="fas fa-check"></i></div>'
    : `<div class="cert-status in-progress">${cert.progress}%</div>`;

  const isPdf = cert.image_url && cert.image_url.toLowerCase().endsWith('.pdf');

  let imageHtml;
  if (cert.image_url) {
    if (isPdf) {
      imageHtml = `<canvas class="cert-image cert-pdf-thumb" data-pdf-url="${escapeAttr(cert.image_url)}" loading="lazy"></canvas>`;
    } else {
      imageHtml = `<img src="${escapeAttr(cert.image_url)}" alt="${escapeAttr(cert.name)}" class="cert-image">`;
    }
  } else {
    imageHtml = `<div class="cert-placeholder"><i class="fas fa-certificate"></i></div>`;
  }

  return `
      <div class="cert-card" 
           id="cert-${cert.id}"
           data-cert-id="${escapeAttr(cert.id)}"
           data-cert-name="${escapeAttr(cert.name)}" 
           data-cert-issuer="${escapeAttr(cert.issuer || '')}"
           data-cert-date="${escapeAttr(dateStr)}"
           data-cert-image="${escapeAttr(cert.image_url || '')}"
           data-cert-url="${escapeAttr(cert.credential_url || '')}"
           data-cert-hours="${cert.hours || ''}">
        <div class="cert-image-wrapper">
          ${imageHtml}
          ${statusHtml}
        </div>
        <div class="cert-info">
          <p class="cert-name">${escapeHtml(cert.name)}</p>
          ${cert.issuer ? `<p class="cert-issuer">${escapeHtml(cert.issuer)}</p>` : ''}
          ${dateStr ? `<p class="cert-date">${dateStr}</p>` : ''}
          ${cert.hours ? `<p class="cert-hours"><i class="fas fa-clock"></i> ${cert.hours}h</p>` : ''}
        </div>
        <button class="cert-copy-link" onclick="event.stopPropagation(); copyCertLink('${cert.id}')" title="Copiar link deste certificado">
          <i class="fas fa-link"></i>
        </button>
      </div>
  `;
}

// ============================================
// PDF THUMBNAIL RENDERING
// ============================================
async function renderPdfThumbnails() {
  const canvases = document.querySelectorAll('.cert-pdf-thumb');
  for (const canvas of canvases) {
    const pdfUrl = canvas.dataset.pdfUrl;
    if (!pdfUrl) continue;
    try {
      // Get wrapper dimensions to set canvas size before rendering
      const wrapper = canvas.closest('.cert-image-wrapper');
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const page = await pdf.getPage(1);
      // Scale to fit wrapper size at device pixel ratio
      const naturalViewport = page.getViewport({ scale: 1 });
      const scale = (rect.width * dpr) / naturalViewport.width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.error('Erro ao renderizar thumbnail PDF:', err);
      canvas.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'cert-placeholder';
      placeholder.innerHTML = '<i class="fas fa-file-pdf" style="color:#e74c3c"></i>';
      canvas.parentElement.insertBefore(placeholder, canvas);
    }
  }
}

// ============================================
// COPY CERT LINK
// ============================================
function copyCertLink(certId) {
  const url = `${window.location.origin}${window.location.pathname}?cert=${certId}#certificates`;
  navigator.clipboard.writeText(url).then(() => {
    showCopyToast('Link copiado!');
  }).catch(() => {
    // Fallback
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showCopyToast('Link copiado!');
  });
}
window.copyCertLink = copyCertLink;

function showCopyToast(msg) {
  let toast = document.getElementById('copy-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copy-toast';
    toast.className = 'copy-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ============================================
// DEEP LINK HANDLER
// ============================================
function handleCertDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const certId = params.get('cert');
  if (!certId) return;

  // Find which category this cert belongs to
  const cert = allCerts.find(c => c.id === certId);
  if (!cert) return;

  // Expand the certificates section if collapsed
  const certBody = document.getElementById('certificates-body');
  if (certBody && certBody.classList.contains('collapsed')) {
    certBody.classList.remove('collapsed');
    const header = document.querySelector('[data-target="certificates-body"]');
    if (header) {
      const icon = header.querySelector('.collapse-toggle i');
      if (icon) icon.className = 'fas fa-chevron-up';
      saveSectionState('certificates-body', false);
    }
  }

  // Select the category
  selectCategory(cert.category_id);

  setTimeout(() => {
    const card = document.getElementById(`cert-${certId}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('cert-highlight');
      setTimeout(() => card.classList.remove('cert-highlight'), 3000);
      card.click();
    }
  }, 500);
}

// ============================================
// COLLAPSIBLE SECTIONS (with localStorage memory)
// ============================================
const COLLAPSE_STORAGE_KEY = 'portfolio_sections_state';

function getSectionsState() {
  try {
    return JSON.parse(localStorage.getItem(COLLAPSE_STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveSectionState(targetId, isCollapsed) {
  const state = getSectionsState();
  state[targetId] = isCollapsed;
  localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(state));
}

function setupCollapsible() {
  const savedState = getSectionsState();

  document.querySelectorAll('.collapsible-header').forEach(header => {
    const targetId = header.dataset.target;
    const body = document.getElementById(targetId);
    if (!body) return;

    const icon = header.querySelector('.collapse-toggle i');

    // On first visit (no saved state), default to collapsed
    // If there's saved state, use it
    const isCollapsed = savedState[targetId] !== undefined ? savedState[targetId] : true;

    if (isCollapsed) {
      body.classList.add('collapsed');
      icon.className = 'fas fa-chevron-down';
    } else {
      body.classList.remove('collapsed');
      icon.className = 'fas fa-chevron-up';
    }

    // Only attach listener once (skip if already bound)
    if (header.dataset.collapseBound) return;
    header.dataset.collapseBound = '1';

    header.addEventListener('click', (e) => {
      // Don't collapse when clicking copy-link button
      if (e.target.closest('.cert-copy-link')) return;

      body.classList.toggle('collapsed');
      const nowCollapsed = body.classList.contains('collapsed');
      
      icon.className = nowCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
      saveSectionState(targetId, nowCollapsed);
    });
  });
}

// ============================================
// SLUG HELPER
// ============================================
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================
// CERTIFICATE MODAL
// ============================================
function setupModal() {
  const modal = document.getElementById('cert-modal');
  const closeBtn = document.getElementById('modal-close');

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('active');
  });

  // Delegate click on cert cards
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.cert-card');
    if (!card) return;
    // Don't open modal if clicking copy link
    if (e.target.closest('.cert-copy-link')) return;

    const certId = card.dataset.certId;
    const name = card.dataset.certName;
    const issuer = card.dataset.certIssuer;
    const date = card.dataset.certDate;
    const image = card.dataset.certImage;
    const url = card.dataset.certUrl;
    const hours = card.dataset.certHours;

    document.getElementById('modal-cert-name').textContent = name || '';
    document.getElementById('modal-cert-issuer').textContent = issuer || '';
    document.getElementById('modal-cert-date').textContent = date ? `Concluído em ${date}` : '';

    const hoursEl = document.getElementById('modal-cert-hours');
    if (hours) {
      hoursEl.innerHTML = `<i class="fas fa-clock"></i> ${hours}h de carga horária`;
      hoursEl.style.display = '';
    } else {
      hoursEl.style.display = 'none';
    }

    const modalImage = document.getElementById('modal-image');
    const modalPdf = document.getElementById('modal-pdf');
    const isPdf = image && image.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      modalImage.style.display = 'none';
      modalPdf.src = image;
      modalPdf.style.display = '';
    } else if (image) {
      modalPdf.style.display = 'none';
      modalPdf.src = '';
      modalImage.src = image;
      modalImage.style.display = '';
    } else {
      modalImage.style.display = 'none';
      modalPdf.style.display = 'none';
      modalPdf.src = '';
    }

    const linkEl = document.getElementById('modal-cert-link');
    if (url) {
      linkEl.href = url;
      linkEl.style.display = '';
    } else {
      linkEl.style.display = 'none';
    }

    // Copy link button in modal
    const copyBtn = document.getElementById('modal-copy-link');
    if (copyBtn) {
      copyBtn.onclick = () => copyCertLink(certId);
    }

    // Load project files
    loadCertProjectFiles(certId);

    modal.classList.add('active');
  });
}

// ============================================
// CERTIFICATE PROJECT FILES
// ============================================
async function loadCertProjectFiles(certId) {
  const container = document.getElementById('modal-project-files');
  if (!container) return;

  container.innerHTML = '';

  const { data, error } = await supabase
    .from('certificate_project_files')
    .select('*')
    .eq('certificate_id', certId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = '';
  const fileIcons = {
    'xlsx': 'fa-file-excel', 'xls': 'fa-file-excel', 'csv': 'fa-file-csv',
    'pdf': 'fa-file-pdf', 'doc': 'fa-file-word', 'docx': 'fa-file-word',
    'ppt': 'fa-file-powerpoint', 'pptx': 'fa-file-powerpoint',
    'pbix': 'fa-chart-bar', 'sql': 'fa-database',
    'zip': 'fa-file-archive', 'rar': 'fa-file-archive',
  };

  const html = data.map(f => {
    const ext = f.file_name.split('.').pop().toLowerCase();
    const icon = fileIcons[ext] || 'fa-file';
    return `
      <a href="${escapeAttr(f.file_url)}" target="_blank" rel="noopener noreferrer" class="project-file-item" download>
        <i class="fas ${icon}"></i>
        <span>${escapeHtml(f.file_name)}</span>
        ${f.description ? `<small>${escapeHtml(f.description)}</small>` : ''}
      </a>
    `;
  }).join('');

  container.innerHTML = `
    <div class="project-files-header">
      <i class="fas fa-folder-open"></i> Arquivos do Projeto
    </div>
    ${html}
  `;
}

// ============================================
// PROJECTS
// ============================================
async function loadProjects() {
  const container = document.getElementById('projects-container');

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <i class="fas fa-code-branch"></i>
        <p>Nenhum projeto cadastrado ainda.</p>
      </div>`;
    return;
  }

  // Update section title with total hours
  const projTotalHours = data.reduce((sum, p) => sum + (p.hours || 0), 0);
  const projTitle = document.getElementById('proj-section-title');
  if (projTitle) {
    projTitle.textContent = projTotalHours > 0 ? `Projetos • ${projTotalHours}h` : 'Projetos';
  }

  container.innerHTML = data.map(project => {
    const imageHtml = project.image_url
      ? `<img src="${escapeAttr(project.image_url)}" alt="${escapeAttr(project.title)}" class="project-image" loading="lazy">`
      : `<div class="project-placeholder"><i class="fas fa-code"></i></div>`;

    const techsHtml = (project.technologies || [])
      .map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`)
      .join('');

    const linksHtml = [];
    if (project.github_url) {
      linksHtml.push(`<a href="${escapeAttr(project.github_url)}" target="_blank" rel="noopener noreferrer" class="project-link">
        <i class="fab fa-github"></i> Código
      </a>`);
      linksHtml.push(`<button class="project-link readme-link" onclick="openReadme('${escapeAttr(project.github_url)}', '${escapeAttr(project.title)}')">
        <i class="fas fa-book-open"></i> README
      </button>`);
    }
    if (project.demo_url) {
      linksHtml.push(`<a href="${escapeAttr(project.demo_url)}" target="_blank" rel="noopener noreferrer" class="project-link">
        <i class="fas fa-external-link-alt"></i> Demo
      </a>`);
    }

    return `
      <div class="project-card">
        <div class="project-image-wrapper">
          ${imageHtml}
          ${project.featured ? '<span class="project-featured-badge"><i class="fas fa-star"></i> Destaque</span>' : ''}
        </div>
        <div class="project-body">
          <h3 class="project-title">${escapeHtml(project.title)}</h3>
          <p class="project-description">${escapeHtml(project.description || '')}</p>
          ${project.description && project.description.length > 120 ? '<button class="project-desc-toggle" onclick="this.parentElement.classList.toggle(\'expanded\'); this.textContent = this.parentElement.classList.contains(\'expanded\') ? \'Ver menos\' : \'Ver mais\'">Ver mais</button>' : ''}
          ${techsHtml ? `<div class="project-techs">${techsHtml}</div>` : ''}
          ${project.hours ? `<p class="cert-hours"><i class="fas fa-clock"></i> ${project.hours}h</p>` : ''}
          ${linksHtml.length > 0 ? `<div class="project-links">${linksHtml.join('')}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// README MODAL
// ============================================
async function openReadme(githubUrl, projectTitle) {
  const overlay = document.getElementById('readme-modal-overlay');
  const body = document.getElementById('readme-terminal-body');
  const title = document.getElementById('readme-terminal-title');

  // Extract owner/repo from github URL
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
  if (!match) {
    body.innerHTML = '<p class="readme-error">URL do GitHub inválida.</p>';
    overlay.classList.add('active');
    return;
  }

  const [, owner, repo] = match;
  title.textContent = `~/${repo.replace(/\.git$/, '')}/README.md`;
  body.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando README...</div>';
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  try {
    const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo.replace(/\.git$/, ''))}/readme`, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    });

    if (!res.ok) throw new Error('README não encontrado');
    const markdown = await res.text();

    // Configure marked for safe rendering
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Sanitize: render markdown then strip dangerous tags
    const rendered = DOMPurify.sanitize(marked.parse(markdown), {
      ADD_TAGS: ['img'],
      ADD_ATTR: ['src', 'alt', 'href', 'target', 'rel'],
    });

    body.innerHTML = `<div class="readme-content">${rendered}</div>`;

    // Fix relative image URLs to point to GitHub raw
    body.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http')) {
        img.src = `https://raw.githubusercontent.com/${owner}/${repo.replace(/\.git$/, '')}/main/${src}`;
      }
    });

    // Open links in new tab
    body.querySelectorAll('a').forEach(a => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });

  } catch (err) {
    body.innerHTML = `<p class="readme-error"><i class="fas fa-exclamation-triangle"></i> ${escapeHtml(err.message)}</p>`;
  }
}

function closeReadmeModal() {
  document.getElementById('readme-modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('readme-close-btn').addEventListener('click', closeReadmeModal);
  document.getElementById('readme-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeReadmeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeReadmeModal();
  });
});

// ============================================
// UTILS - XSS Prevention
// ============================================
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

// ============================================
// TERMINAL TYPING ANIMATION ON SCROLL
// ============================================
function setupTypeInAnimation() {
  const elements = document.querySelectorAll('.type-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
        typeElement(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  elements.forEach(el => observer.observe(el));
}

function typeElement(el) {
  const fullText = el.textContent;
  el.textContent = '';
  el.classList.add('visible', 'typing');
  el.classList.add('typed');

  let i = 0;
  // Cap total typing time at ~1.2s; short texts get a slight pause per char
  const speed = Math.min(35, Math.max(3, 1200 / fullText.length));

  function typeChar() {
    if (i < fullText.length) {
      el.textContent += fullText.charAt(i);
      i++;
      setTimeout(typeChar, speed);
    } else {
      // Remove cursor after typing is done
      setTimeout(() => el.classList.remove('typing'), 400);
    }
  }

  typeChar();
}

// ============================================
// TIME SINCE CALCULATOR (Company duration)
// ============================================
function calcTimeSince(dateStr) {
  const start = new Date(dateStr);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} ${months > 1 ? 'meses' : 'mês'}`);
  if (parts.length === 0) parts.push('Menos de 1 mês');

  const formatted = start.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  return `${formatted} — presente · ${parts.join(' e ')}`;
}

// ============================================
// GITHUB DATA & TECH STATS
// ============================================

// Known language colors (GitHub style)
const LANG_COLORS = {
  'JavaScript': '#f1e05a',
  'TypeScript': '#3178c6',
  'Python': '#3572A5',
  'Java': '#b07219',
  'PHP': '#4F5D95',
  'C#': '#178600',
  'C++': '#f34b7d',
  'C': '#555555',
  'Ruby': '#701516',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'Dart': '#00B4AB',
  'Vue': '#41b883',
  'Svelte': '#ff3e00',
  'Lua': '#000080',
  'R': '#198CE7',
  'Elixir': '#6e4a7e',
  'Scala': '#c22d40',
  'HTML': '#e34c26',
  'HTML5': '#e34c26',
  'CSS': '#563d7c',
  'CSS3': '#563d7c',
  'Supabase': '#3ecf8e',
  'Netlify': '#00c7b7',
  'React': '#61dafb',
  'Node.js': '#339933',
  'Node': '#339933',
  'Angular': '#dd0031',
  'Next.js': '#ffffff',
  'Docker': '#2496ed',
  'PostgreSQL': '#336791',
  'MongoDB': '#47a248',
  'MySQL': '#4479a1',
  'Firebase': '#ffca28',
  'Tailwind': '#06b6d4',
  'Bootstrap': '#7952b3',
  'Git': '#f05032',
  'Linux': '#fcc624',
  'AWS': '#ff9900',
  'Azure': '#0078d4',
};

async function loadGitHubData(username) {
  const statsEl = document.getElementById('github-stats');

  try {
    // Fetch user profile + repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`),
    ]);

    if (!userRes.ok) throw new Error('GitHub user not found');
    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    // Basic stats
    document.getElementById('gh-public-repos').textContent = user.public_repos || 0;
    document.getElementById('gh-followers').textContent = user.followers || 0;

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    document.getElementById('gh-stars').textContent = totalStars;

    statsEl.style.display = '';

    // Commits per week (from contributions API)
    try {
      const contribRes = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`);
      if (contribRes.ok) {
        const contribData = await contribRes.json();
        const contributions = contribData.contributions || [];
        // Last 4 weeks average
        const last28 = contributions.slice(-28);
        const totalLast28 = last28.reduce((s, d) => s + d.count, 0);
        const avgPerWeek = Math.round(totalLast28 / 4);
        document.getElementById('gh-commits-week').textContent = avgPerWeek;
      }
    } catch {}

    // Build tech badges from repos + projects
    await buildTechBadges(repos);

    // GitHub profile link
    const linkContainer = document.getElementById('gh-profile-link-container');
    linkContainer.innerHTML = `
      <a href="https://github.com/${escapeAttr(username)}" target="_blank" rel="noopener noreferrer" class="github-profile-link">
        <i class="fab fa-github"></i> Ver perfil no GitHub
      </a>`;
    linkContainer.style.display = '';

  } catch (err) {
    console.error('Erro ao carregar dados do GitHub:', err);
  }
}

async function buildTechBadges(repos) {
  const wrapper = document.getElementById('tech-stats-wrapper');
  const grid = document.getElementById('tech-stats-grid');

  const techSet = new Set();

  // 1) Languages from GitHub repos (skip forks)
  repos.forEach(r => {
    if (r.fork) return;
    if (r.language) techSet.add(r.language);
  });

  // 2) Technologies from Supabase projects
  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('technologies');

    if (projects) {
      projects.forEach(p => {
        (p.technologies || []).forEach(t => {
          const name = t.trim();
          if (name) techSet.add(name);
        });
      });
    }
  } catch {}

  if (techSet.size === 0) return;

  const fallbackColors = ['#58a6ff', '#39d353', '#f0883e', '#bc8cff', '#ff6b6b', '#79c0ff', '#56d4dd', '#e3b341', '#f778ba', '#8b949e'];

  const techs = Array.from(techSet).sort((a, b) => a.localeCompare(b));

  grid.innerHTML = techs.map((tech, i) => {
    const color = LANG_COLORS[tech] || fallbackColors[i % fallbackColors.length];
    return `
      <div class="tech-badge" style="border-color:${color}">
        <span class="tech-badge-dot" style="background:${color}"></span>
        <span class="tech-badge-name">${escapeHtml(tech)}</span>
      </div>
    `;
  }).join('');

  wrapper.style.display = '';
}

// ============================================
// MUSIC REACTOR — Reactive ambient glow
// ============================================
const musicReactor = {
  active: false,
  rafId: null,
  el: null,
  glowBass: null,
  glowMid: null,
  glowTreble: null,
  bassSmooth: 0,
  midSmooth: 0,
  trebleSmooth: 0,

  init() {
    this.el = document.getElementById('music-reactor');
    if (!this.el) return;
    this.glowBass = this.el.querySelector('.reactor-glow-bass');
    this.glowMid = this.el.querySelector('.reactor-glow-mid');
    this.glowTreble = this.el.querySelector('.reactor-glow-treble');
  },

  start() {
    if (!this.el) this.init();
    if (!this.el) return;
    this.active = true;
    this.el.classList.add('active');
    if (!this.rafId) this.loop();
  },

  stop() {
    this.active = false;
    if (this.el) this.el.classList.remove('active');
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  loop() {
    if (!this.active) return;
    const now = performance.now() / 1000;

    // Simulated frequency bands
    const bass = Math.max(0,
      0.4 * Math.sin(now * 1.1) +
      0.3 * Math.sin(now * 1.7 + 0.7) +
      0.15 * Math.sin(now * 0.5 + 2.1) +
      0.1 * Math.sin(now * 3.2) +
      0.05
    );
    const mid = Math.max(0,
      0.35 * Math.sin(now * 2.6 + 1.0) +
      0.25 * Math.sin(now * 3.8 + 0.3) +
      0.2 * Math.sin(now * 1.4 + 1.8) +
      0.1 * Math.sin(now * 5.0) +
      0.1
    );
    const treble = Math.max(0,
      0.3 * Math.sin(now * 6.5 + 0.5) +
      0.25 * Math.sin(now * 8.8 + 1.2) +
      0.2 * Math.sin(now * 5.0 + 2.8) +
      0.15 * Math.sin(now * 11.5) +
      0.1
    );

    // Smooth
    this.bassSmooth += (bass - this.bassSmooth) * 0.08;
    this.midSmooth += (mid - this.midSmooth) * 0.12;
    this.trebleSmooth += (treble - this.trebleSmooth) * 0.18;

    // Glow — more visible intensities
    this.glowBass.style.opacity = Math.min(this.bassSmooth * 0.9, 0.65);
    this.glowMid.style.opacity = Math.min(this.midSmooth * 0.7, 0.5);
    this.glowTreble.style.opacity = Math.min(this.trebleSmooth * 0.55, 0.4);

    this.rafId = requestAnimationFrame(() => this.loop());
  }
};

// ============================================
// YOUTUBE FLOATING PLAYER
// ============================================
const YT_TRACKS = [
  { id: 'W-IzDrJRTo8', name: 'in your arms — mr kitty (slowed & reverb)' },
  { id: 'AHWUez2Tdpk', name: 'Gemini - Time To Share' },
  { id: 'c9P9kkcEcdc', name: 'Mr. Kitty - 44 days' },
  { id: 'SO4GCctPi4U', name: 'Wicked Game | Synthwave Dark Cover' },
];

let ytPlayer = null;
let ytIsPlaying = false;
let ytCurrentTrack = null;

function loadYouTubePlayer() {
  ytCurrentTrack = YT_TRACKS[Math.floor(Math.random() * YT_TRACKS.length)];
  document.getElementById('music-track-name').textContent = ytCurrentTrack.name;

  // Load the YouTube IFrame API
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

// YouTube IFrame API calls this globally when ready
window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new YT.Player('yt-player-container', {
    height: '0',
    width: '0',
    videoId: ytCurrentTrack.id,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
    },
    events: {
      onReady: onYTPlayerReady,
      onStateChange: onYTStateChange,
    },
  });
};

function onYTPlayerReady() {
  // Music will start when splash screen is dismissed (dismissSplash calls playVideo)
  // If splash is already gone (e.g. returning visit), show player and let user control
  if (!document.getElementById('splash-overlay')) {
    document.getElementById('music-player').classList.add('visible');
    const tryAutoplay = () => {
      if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
      }
      document.removeEventListener('click', tryAutoplay);
      document.removeEventListener('scroll', tryAutoplay);
      document.removeEventListener('keydown', tryAutoplay);
    };
    document.addEventListener('click', tryAutoplay, { once: false });
    document.addEventListener('scroll', tryAutoplay, { once: false });
    document.addEventListener('keydown', tryAutoplay, { once: false });
  }
}

function onYTStateChange(event) {
  const playing = event.data === YT.PlayerState.PLAYING;
  const ended = event.data === YT.PlayerState.ENDED;

  if (playing && !ytIsPlaying) {
    ytIsPlaying = true;
    updateMusicIcon();
    showMusicToast(ytCurrentTrack.name);
    musicReactor.start();
  } else if (!playing && ytIsPlaying) {
    ytIsPlaying = false;
    updateMusicIcon();
    musicReactor.stop();
  }

  // When track ends, play a different random track
  if (ended) {
    let next;
    do {
      next = YT_TRACKS[Math.floor(Math.random() * YT_TRACKS.length)];
    } while (next.id === ytCurrentTrack.id && YT_TRACKS.length > 1);
    ytCurrentTrack = next;
    document.getElementById('music-track-name').textContent = next.name;
    ytPlayer.loadVideoById(next.id);
  }
}

function updateMusicIcon() {
  const icon = document.getElementById('music-toggle-icon');
  icon.className = ytIsPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function showMusicToast(name) {
  let toast = document.getElementById('music-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'music-toast';
    toast.className = 'music-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fas fa-music"></i> Tocando: ${escapeHtml(name)}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// Toggle button & init
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('music-toggle');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
        if (ytIsPlaying) {
          ytPlayer.pauseVideo();
        } else {
          ytPlayer.playVideo();
        }
      }
    });
  }
  loadYouTubePlayer();
});
