// ============================================
// RESUME MODAL — PDF.js viewer com zoom
// ============================================

let _resumeUrl  = null;
let _pdfDoc     = null;
let _currentPage = 1;
let _totalPages  = 1;
let _scale       = 1.2;   // zoom inicial
const SCALE_STEP = 0.25;
const SCALE_MIN  = 0.5;
const SCALE_MAX  = 3.0;

function setResumeUrl(url) {
  _resumeUrl = url || null;

  const btn = document.getElementById('hero-resume-btn');
  if (btn) btn.style.display = _resumeUrl ? '' : 'none';
}

// ---- Rendering ----
async function renderPage(num) {
  const canvas  = document.getElementById('resume-canvas');
  const ctx     = canvas.getContext('2d');

  const page    = await _pdfDoc.getPage(num);
  const viewport = page.getViewport({ scale: _scale });

  canvas.width  = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  // Update page indicator
  document.getElementById('resume-page-num').textContent = num;
  document.getElementById('resume-page-total').textContent = _totalPages;
  document.getElementById('resume-prev-page').disabled = num <= 1;
  document.getElementById('resume-next-page').disabled = num >= _totalPages;
  document.getElementById('resume-zoom-out').disabled  = _scale <= SCALE_MIN;
  document.getElementById('resume-zoom-in').disabled   = _scale >= SCALE_MAX;
  document.getElementById('resume-zoom-label').textContent = Math.round(_scale * 100) + '%';
}

async function loadPdf(url) {
  const body = document.getElementById('resume-modal-body');

  // Show loading
  body.innerHTML = `
    <div class="resume-modal-empty">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Carregando currículo...</p>
    </div>`;

  try {
    _pdfDoc = await pdfjsLib.getDocument(url).promise;
    _totalPages  = _pdfDoc.numPages;
    _currentPage = 1;

    // Build canvas viewer
    body.innerHTML = `
      <div class="resume-pdf-toolbar">
        <div class="resume-pdf-nav">
          <button class="resume-ctrl-btn" id="resume-prev-page" title="Página anterior" disabled>
            <i class="fas fa-chevron-left"></i>
          </button>
          <span>Página <strong id="resume-page-num">1</strong> / <strong id="resume-page-total">1</strong></span>
          <button class="resume-ctrl-btn" id="resume-next-page" title="Próxima página">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="resume-pdf-zoom">
          <button class="resume-ctrl-btn" id="resume-zoom-out" title="Diminuir zoom">
            <i class="fas fa-search-minus"></i>
          </button>
          <span id="resume-zoom-label">120%</span>
          <button class="resume-ctrl-btn" id="resume-zoom-in" title="Aumentar zoom">
            <i class="fas fa-search-plus"></i>
          </button>
        </div>
      </div>
      <div class="resume-pdf-scroll">
        <canvas id="resume-canvas"></canvas>
      </div>`;

    // Wire controls
    document.getElementById('resume-prev-page').addEventListener('click', () => {
      if (_currentPage > 1) { _currentPage--; renderPage(_currentPage); }
    });
    document.getElementById('resume-next-page').addEventListener('click', () => {
      if (_currentPage < _totalPages) { _currentPage++; renderPage(_currentPage); }
    });
    document.getElementById('resume-zoom-out').addEventListener('click', () => {
      if (_scale > SCALE_MIN) { _scale = Math.max(SCALE_MIN, _scale - SCALE_STEP); renderPage(_currentPage); }
    });
    document.getElementById('resume-zoom-in').addEventListener('click', () => {
      if (_scale < SCALE_MAX) { _scale = Math.min(SCALE_MAX, _scale + SCALE_STEP); renderPage(_currentPage); }
    });

    await renderPage(_currentPage);

  } catch (err) {
    body.innerHTML = `
      <div class="resume-modal-empty">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Não foi possível carregar o PDF.</p>
      </div>`;
  }
}

// ---- Open / Close ----
function openResumeModal() {
  if (!_resumeUrl) return;

  const overlay = document.getElementById('resume-modal-overlay');

  // Update download link
  const dlBtn = document.getElementById('resume-download-btn');
  if (dlBtn) {
    dlBtn.href = _resumeUrl;
    dlBtn.download = 'curriculo.pdf';
  }

  _scale = 1.2;
  loadPdf(_resumeUrl);

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
  const overlay = document.getElementById('resume-modal-overlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  _pdfDoc = null;

  const body = document.getElementById('resume-modal-body');
  if (body) body.innerHTML = '';
}

// ---- Setup ----
function setupResumeModal() {
  const overlay  = document.getElementById('resume-modal-overlay');
  const closeBtn = document.getElementById('resume-close-btn');

  if (!overlay) return;

  closeBtn?.addEventListener('click', closeResumeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeResumeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeResumeModal();
  });

  // Hero button
  document.getElementById('hero-resume-btn')?.addEventListener('click', openResumeModal);

  // Hide button by default until profile loads
  const btn = document.getElementById('hero-resume-btn');
  if (btn) btn.style.display = 'none';
}
