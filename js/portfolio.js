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
async function loadCertificates() {
  const container = document.getElementById('certificates-container');

  // Load categories
  const { data: categories, error: catError } = await supabase
    .from('certificate_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (catError || !categories || categories.length === 0) {
    container.innerHTML = `
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
    container.innerHTML = '<p class="empty-state">Erro ao carregar certificados.</p>';
    return;
  }

  container.innerHTML = '';

  categories.forEach((category, idx) => {
    const categoryCerts = (certs || []).filter(c => c.category_id === category.id);
    const completedCount = categoryCerts.filter(c => c.completed).length;
    const totalCount = categoryCerts.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const swiperID = `swiper-${idx}`;

    const html = `
      <div class="cert-category" data-aos="fade-up">
        <div class="category-header">
          <div class="category-title-row">
            <h3 class="category-title">${escapeHtml(category.name)}</h3>
            <span class="category-count">${completedCount} de ${totalCount} concluídos</span>
          </div>
          ${category.description ? `<p class="category-description">${escapeHtml(category.description)}</p>` : ''}
          <div class="category-progress">
            <div class="category-progress-bar" style="width: ${progress}%"></div>
          </div>
        </div>

        ${categoryCerts.length > 0 ? `
          <div class="cert-carousel-wrapper">
            <div class="swiper" id="${swiperID}">
              <div class="swiper-wrapper">
                ${categoryCerts.map(cert => createCertCard(cert)).join('')}
              </div>
              <div class="swiper-pagination"></div>
            </div>
            <div class="swiper-button-prev swiper-prev-${idx}"></div>
            <div class="swiper-button-next swiper-next-${idx}"></div>
          </div>
        ` : `
          <div class="empty-state">
            <i class="fas fa-plus-circle"></i>
            <p>Nenhum certificado nesta categoria.</p>
          </div>
        `}
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);

    // Initialize Swiper for this category
    if (categoryCerts.length > 0) {
      new Swiper(`#${swiperID}`, {
        slidesPerView: 1,
        spaceBetween: 16,
        pagination: {
          el: `#${swiperID} .swiper-pagination`,
          clickable: true,
        },
        navigation: {
          nextEl: `.swiper-next-${idx}`,
          prevEl: `.swiper-prev-${idx}`,
        },
        breakpoints: {
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        },
      });
    }
  });

  // Render PDF thumbnails after all cards are inserted
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

    modal.classList.add('active');
  });
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
