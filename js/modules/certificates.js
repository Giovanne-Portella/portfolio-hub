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
        <span class="cert-sidebar-more">Ver mais</span>
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
    const newCertTitle = certTotalHours > 0 ? `Certificados • ${certTotalHours}h` : 'Certificados';
    // If type-in animation is mid-flight, update the target it's reading from
    if (certTitle.classList.contains('typing')) {
      certTitle.dataset.typeTarget = newCertTitle;
    } else {
      certTitle.textContent = newCertTitle;
    }
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

  // Detect text overflow and add "Ver mais" toggle
  sidebar.querySelectorAll('.cert-sidebar-item').forEach(item => {
    const nameEl = item.querySelector('.cert-sidebar-name');
    const descEl = item.querySelector('.cert-sidebar-desc');
    const moreEl = item.querySelector('.cert-sidebar-more');

    requestAnimationFrame(() => {
      const nameOverflows = nameEl && nameEl.scrollHeight > nameEl.clientHeight + 1;
      const descOverflows = descEl && descEl.scrollHeight > descEl.clientHeight + 1;

      if (nameOverflows || descOverflows) {
        item.classList.add('has-overflow');
      }
    });

    if (moreEl) {
      moreEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = item.classList.toggle('expanded');
        moreEl.textContent = isExpanded ? 'Ver menos' : 'Ver mais';
      });
    }
  });

  if (!sidebar.parentElement.classList.contains('cert-sidebar-wrapper')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'cert-sidebar-wrapper';
    sidebar.parentElement.insertBefore(wrapper, sidebar);
    wrapper.appendChild(sidebar);

    // Right arrow
    const arrowRight = document.createElement('div');
    arrowRight.className = 'cert-scroll-arrow';
    arrowRight.innerHTML = '<i class="fas fa-chevron-right"></i>';
    wrapper.appendChild(arrowRight);

    // Left arrow
    const arrowLeft = document.createElement('div');
    arrowLeft.className = 'cert-scroll-arrow-left hidden';
    arrowLeft.innerHTML = '<i class="fas fa-chevron-left"></i>';
    wrapper.appendChild(arrowLeft);

    const updateArrows = () => {
      const maxScroll = sidebar.scrollWidth - sidebar.clientWidth;
      const atEnd = sidebar.scrollLeft >= maxScroll - 10;
      const noOverflow = maxScroll <= 0;
      // Only one arrow at a time: right until end, then left
      arrowRight.classList.toggle('hidden', atEnd || noOverflow);
      arrowLeft.classList.toggle('hidden', !atEnd || noOverflow);
    };

    sidebar.addEventListener('scroll', updateArrows, { passive: true });
    requestAnimationFrame(() => requestAnimationFrame(updateArrows));
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

  const hasPdfs = categoryCerts.some(c => c.image_url && c.image_url.toLowerCase().endsWith('.pdf'));

  content.innerHTML = `
    <div class="cert-main-header">
      <h3>${escapeHtml(category.name)}</h3>
      ${category.description ? `<p>${escapeHtml(category.description)}</p>` : ''}
    </div>
    <div class="cert-grid${hasPdfs ? ' cert-grid-hidden' : ''}">
      ${categoryCerts.map(cert => createCertCard(cert)).join('')}
    </div>
  `;

  // Render PDF thumbnails (reveals grid when done)
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
// PDF THUMBNAIL RENDERING — parallel with progress bar
// ============================================
async function renderPdfThumbnails() {
  const canvases = Array.from(document.querySelectorAll('.cert-pdf-thumb'));
  const certGrid = document.querySelector('.cert-grid');

  if (canvases.length === 0 || !certGrid) return;

  const total = canvases.length;
  let done = 0;

  // Insert Linux-style loading overlay before the grid
  const overlay = document.createElement('div');
  overlay.className = 'cert-loading-overlay';
  overlay.innerHTML = `
    <div class="cert-loading-label">
      <span class="cert-loading-prompt">$</span>
      Renderizando certificados PDF...<span class="cert-loading-cursor"></span>
    </div>
    <div class="cert-loading-bar-row">
      <div class="cert-loading-track">
        <div class="cert-loading-fill" id="cert-loading-fill"></div>
      </div>
      <span class="cert-loading-pct" id="cert-loading-pct">0%</span>
      <span class="cert-loading-count" id="cert-loading-count">0 / ${total}</span>
    </div>
  `;
  certGrid.parentElement.insertBefore(overlay, certGrid);

  function updateProgress() {
    done++;
    const pct = Math.round((done / total) * 100);
    const fill = document.getElementById('cert-loading-fill');
    const pctEl = document.getElementById('cert-loading-pct');
    const countEl = document.getElementById('cert-loading-count');
    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    if (countEl) countEl.textContent = `${done} / ${total}`;
  }

  async function renderOne(canvas) {
    const pdfUrl = canvas.dataset.pdfUrl;
    if (!pdfUrl) { updateProgress(); return; }
    try {
      const wrapper = canvas.closest('.cert-image-wrapper');
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const page = await pdf.getPage(1);
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
    updateProgress();
  }

  // Render all PDFs in parallel
  await Promise.allSettled(canvases.map(renderOne));

  // Let 100% register visually before revealing
  await new Promise(r => setTimeout(r, 300));

  overlay.remove();
  certGrid.classList.remove('cert-grid-hidden');
  certGrid.classList.add('cert-grid-reveal');
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

