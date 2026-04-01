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

  document.getElementById('footer-year').textContent = new Date().getFullYear();
});

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

  // GitHub contributions
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
let activeSwiperInstance = null;

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
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const item = document.createElement('div');
    item.className = 'cert-sidebar-item';
    item.dataset.categoryId = category.id;
    item.innerHTML = `
      <div class="cert-sidebar-info">
        <span class="cert-sidebar-name">${escapeHtml(category.name)}</span>
        ${category.description ? `<span class="cert-sidebar-desc">${escapeHtml(category.description)}</span>` : ''}
        <span class="cert-sidebar-count">${completedCount} de ${totalCount} concluídos</span>
      </div>
      <div class="cert-sidebar-progress">
        <div class="cert-sidebar-progress-bar" style="width: ${progress}%"></div>
      </div>
    `;
    item.addEventListener('click', () => selectCategory(category.id));
    sidebar.appendChild(item);
  });

  // Re-attach collapsible handlers
  setupCollapsible();

  // Re-observe type-in elements (setupCollapsible clones headers, removing observers)
  setupTypeInAnimation();

  // Handle deep link to specific certificate
  handleCertDeepLink();
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

  // Destroy previous Swiper instance
  if (activeSwiperInstance) {
    activeSwiperInstance.destroy(true, true);
    activeSwiperInstance = null;
  }

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

  const swiperID = `swiper-active`;

  content.innerHTML = `
    <div class="cert-main-header">
      <h3>${escapeHtml(category.name)}</h3>
      ${category.description ? `<p>${escapeHtml(category.description)}</p>` : ''}
    </div>
    <div class="cert-carousel-wrapper">
      <div class="swiper" id="${swiperID}">
        <div class="swiper-wrapper">
          ${categoryCerts.map(cert => createCertCard(cert)).join('')}
        </div>
        <div class="swiper-pagination"></div>
      </div>
      <div class="swiper-button-prev swiper-prev-active"></div>
      <div class="swiper-button-next swiper-next-active"></div>
    </div>
  `;

  // Initialize Swiper
  activeSwiperInstance = new Swiper(`#${swiperID}`, {
    slidesPerView: 1,
    spaceBetween: 16,
    pagination: {
      el: `#${swiperID} .swiper-pagination`,
      clickable: true,
    },
    navigation: {
      nextEl: `.swiper-next-active`,
      prevEl: `.swiper-prev-active`,
    },
    breakpoints: {
      480: { slidesPerView: 2 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });

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
      imageHtml = `<img src="${escapeAttr(cert.image_url)}" alt="${escapeAttr(cert.name)}" class="cert-image" loading="lazy">`;
    }
  } else {
    imageHtml = `<div class="cert-placeholder"><i class="fas fa-certificate"></i></div>`;
  }

  return `
    <div class="swiper-slide">
      <div class="cert-card" 
           id="cert-${cert.id}"
           data-cert-id="${escapeAttr(cert.id)}"
           data-cert-name="${escapeAttr(cert.name)}" 
           data-cert-issuer="${escapeAttr(cert.issuer || '')}"
           data-cert-date="${escapeAttr(dateStr)}"
           data-cert-image="${escapeAttr(cert.image_url || '')}"
           data-cert-url="${escapeAttr(cert.credential_url || '')}">
        <div class="cert-image-wrapper">
          ${imageHtml}
          ${statusHtml}
        </div>
        <div class="cert-info">
          <p class="cert-name">${escapeHtml(cert.name)}</p>
          ${cert.issuer ? `<p class="cert-issuer">${escapeHtml(cert.issuer)}</p>` : ''}
          ${dateStr ? `<p class="cert-date">${dateStr}</p>` : ''}
        </div>
        <button class="cert-copy-link" onclick="event.stopPropagation(); copyCertLink('${cert.id}')" title="Copiar link deste certificado">
          <i class="fas fa-link"></i>
        </button>
      </div>
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
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.4 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.error('Erro ao renderizar thumbnail PDF:', err);
      // Show fallback icon
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

    document.getElementById('modal-cert-name').textContent = name || '';
    document.getElementById('modal-cert-issuer').textContent = issuer || '';
    document.getElementById('modal-cert-date').textContent = date ? `Concluído em ${date}` : '';

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
          ${techsHtml ? `<div class="project-techs">${techsHtml}</div>` : ''}
          ${linksHtml.length > 0 ? `<div class="project-links">${linksHtml.join('')}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

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
// GITHUB DATA
// ============================================
let ghUsername = '';

async function loadGitHubData(username) {
  ghUsername = username;
  const wrapper = document.getElementById('github-graph-wrapper');
  const statsEl = document.getElementById('github-stats');

  try {
    // Fetch user profile from GitHub API
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
    if (!userRes.ok) throw new Error('GitHub user not found');
    const user = await userRes.json();

    // Stats
    document.getElementById('gh-public-repos').textContent = user.public_repos || 0;
    document.getElementById('gh-followers').textContent = user.followers || 0;

    // Get total stars from repos
    let totalStars = 0;
    try {
      const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=stargazers_count`);
      if (reposRes.ok) {
        const repos = await reposRes.json();
        totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
      }
    } catch {}
    document.getElementById('gh-stars').textContent = totalStars;

    statsEl.style.display = '';

    // Build year selector + load contribution graph
    const createdYear = new Date(user.created_at).getFullYear();
    const currentYear = new Date().getFullYear();
    buildYearSelector(createdYear, currentYear, wrapper);
    await loadContributionGraph(username, wrapper, 'last');

  } catch (err) {
    console.error('Erro ao carregar dados do GitHub:', err);
    wrapper.innerHTML = `
      <div class="empty-state">
        <i class="fab fa-github"></i>
        <p>Não foi possível carregar as contribuições do GitHub.</p>
      </div>`;
  }
}

function buildYearSelector(startYear, endYear, wrapper) {
  // Insert year tabs before the graph wrapper
  let tabsEl = document.getElementById('gh-year-tabs');
  if (tabsEl) tabsEl.remove();

  tabsEl = document.createElement('div');
  tabsEl.id = 'gh-year-tabs';
  tabsEl.className = 'gh-year-tabs';

  // "Last year" tab
  const lastBtn = document.createElement('button');
  lastBtn.className = 'gh-year-tab active';
  lastBtn.textContent = 'Último ano';
  lastBtn.dataset.year = 'last';
  lastBtn.addEventListener('click', () => switchYear('last'));
  tabsEl.appendChild(lastBtn);

  // Per-year tabs (newest first)
  for (let y = endYear; y >= startYear; y--) {
    const btn = document.createElement('button');
    btn.className = 'gh-year-tab';
    btn.textContent = y;
    btn.dataset.year = y;
    btn.addEventListener('click', () => switchYear(String(y)));
    tabsEl.appendChild(btn);
  }

  wrapper.parentNode.insertBefore(tabsEl, wrapper);
}

async function switchYear(year) {
  // Update active tab
  document.querySelectorAll('.gh-year-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.year === year);
  });

  const wrapper = document.getElementById('github-graph-wrapper');
  wrapper.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>';

  await loadContributionGraph(ghUsername, wrapper, year);
}

async function loadContributionGraph(username, wrapper, yearParam) {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=${yearParam}`);
    if (!res.ok) throw new Error('Failed to fetch contributions');
    const data = await res.json();

    const contributions = data.contributions || [];
    if (contributions.length === 0) throw new Error('No contribution data');

    // Calculate total from API response
    let totalContrib;
    if (yearParam === 'last') {
      totalContrib = data.total && data.total['lastYear'] != null ? data.total['lastYear'] : contributions.reduce((s, d) => s + d.count, 0);
    } else {
      totalContrib = data.total && data.total[yearParam] != null ? data.total[yearParam] : contributions.reduce((s, d) => s + d.count, 0);
    }
    document.getElementById('gh-total-contributions').textContent = totalContrib;

    const dayLabels = ['Dom', 'Seg', '', 'Qua', '', 'Sex', ''];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Use the API's own date range directly — parse as local dates
    const parseDateLocal = (str) => {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d);
    };

    const firstDate = parseDateLocal(contributions[0].date);
    const lastDate = parseDateLocal(contributions[contributions.length - 1].date);

    // Align firstDate to previous Sunday
    const startDate = new Date(firstDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Build contribution map
    const contribMap = {};
    contributions.forEach(c => {
      contribMap[c.date] = { count: c.count, level: c.level };
    });

    // Build weeks from startDate through lastDate
    const weeks = [];
    const monthMarkers = [];
    let lastMonth = -1;
    const cursor = new Date(startDate);
    let w = 0;

    while (cursor <= lastDate) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
        const entry = contribMap[key] || { count: 0, level: 0 };
        const isPast = cursor > lastDate;

        if (d === 0 && cursor.getMonth() !== lastMonth) {
          monthMarkers.push({ week: w, month: monthNames[cursor.getMonth()] });
          lastMonth = cursor.getMonth();
        }

        week.push({ key, count: entry.count, level: entry.level, isFuture: isPast });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
      w++;
    }

    const totalWeeks = weeks.length;

    // Build the graph HTML
    const monthsHtml = monthMarkers.map(m => {
      return `<span class="github-graph-month" style="grid-column:${m.week + 1}">${m.month}</span>`;
    }).join('');

    const colsHtml = weeks.map(week => {
      const cells = week.map(day => {
        if (day.isFuture) return `<div class="github-graph-cell" style="visibility:hidden"></div>`;
        return `<div class="github-graph-cell" data-level="${day.level}" title="${day.count} contribuições em ${day.key}"></div>`;
      }).join('');
      return `<div class="github-graph-col">${cells}</div>`;
    }).join('');

    const daysHtml = dayLabels.map(l => `<div class="github-graph-day">${l}</div>`).join('');

    wrapper.innerHTML = `
      <div class="github-graph-body">
        <div class="github-graph-days">${daysHtml}</div>
        <div>
          <div class="github-graph-months" style="display:grid; grid-template-columns: repeat(${totalWeeks}, 15px);">
            ${monthsHtml}
          </div>
          <div class="github-graph">${colsHtml}</div>
        </div>
      </div>
      <div class="github-graph-legend">
        <span>Menos</span>
        <div class="github-graph-cell"></div>
        <div class="github-graph-cell" data-level="1"></div>
        <div class="github-graph-cell" data-level="2"></div>
        <div class="github-graph-cell" data-level="3"></div>
        <div class="github-graph-cell" data-level="4"></div>
        <span>Mais</span>
      </div>
      <a href="https://github.com/${escapeAttr(username)}" target="_blank" rel="noopener noreferrer" class="github-profile-link">
        <i class="fab fa-github"></i> Ver perfil no GitHub
      </a>
    `;
  } catch (err) {
    console.error('Erro ao gerar gráfico de contribuições:', err);
    wrapper.innerHTML = `
      <div class="empty-state">
        <i class="fab fa-github"></i>
        <p>Não foi possível carregar o gráfico de contribuições.</p>
      </div>`;
  }
}

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
  // Autoplay on first user interaction
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

  document.getElementById('music-player').classList.add('visible');
}

function onYTStateChange(event) {
  const playing = event.data === YT.PlayerState.PLAYING;
  const ended = event.data === YT.PlayerState.ENDED;

  if (playing && !ytIsPlaying) {
    ytIsPlaying = true;
    updateMusicIcon();
    showMusicToast(ytCurrentTrack.name);
  } else if (!playing && ytIsPlaying) {
    ytIsPlaying = false;
    updateMusicIcon();
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
