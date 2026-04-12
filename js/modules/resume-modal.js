// ============================================
// RESUME MODAL
// ============================================

// Populated by profile.js after Supabase load
let _resumeUrl = null;

function setResumeUrl(url) {
  _resumeUrl = url || null;

  // Show/hide button depending on whether a resume exists
  const btns = document.querySelectorAll('.navbar-resume-btn, .mobile-resume-btn');
  btns.forEach(btn => {
    btn.style.display = _resumeUrl ? '' : 'none';
  });
}

function openResumeModal() {
  if (!_resumeUrl) return;

  const overlay = document.getElementById('resume-modal-overlay');
  const body    = document.getElementById('resume-modal-body');

  // Build viewer content
  const isPdf = _resumeUrl.toLowerCase().includes('.pdf') ||
                _resumeUrl.toLowerCase().includes('/object/public/');

  body.innerHTML = '';

  if (isPdf) {
    // Use Google Docs PDF viewer for best cross-browser experience
    const encoded = encodeURIComponent(_resumeUrl);
    const viewerUrl = `https://docs.google.com/viewer?url=${encoded}&embedded=true`;

    const iframe = document.createElement('iframe');
    iframe.src = viewerUrl;
    iframe.title = 'Currículo';
    iframe.style.width  = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.allow = 'fullscreen';
    body.appendChild(iframe);
  } else {
    // Image fallback
    const img = document.createElement('img');
    img.src = _resumeUrl;
    img.alt = 'Currículo';
    img.style.cssText = 'max-width:100%;max-height:80vh;object-fit:contain;display:block;margin:0 auto;';
    body.appendChild(img);
  }

  // Update download link
  const dlBtn = document.getElementById('resume-download-btn');
  if (dlBtn) {
    dlBtn.href = _resumeUrl;
    dlBtn.download = 'curriculo.pdf';
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
  const overlay = document.getElementById('resume-modal-overlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';

  // Clear iframe src to stop loading
  const body = document.getElementById('resume-modal-body');
  if (body) body.innerHTML = '';
}

function setupResumeModal() {
  const overlay  = document.getElementById('resume-modal-overlay');
  const closeBtn = document.getElementById('resume-close-btn');

  if (!overlay) return;

  closeBtn?.addEventListener('click', closeResumeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeResumeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeResumeModal();
    }
  });

  // Trigger buttons (navbar + mobile menu)
  document.querySelectorAll('.navbar-resume-btn, .mobile-resume-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openResumeModal();
    });
  });

  // Hide buttons by default until profile is loaded
  document.querySelectorAll('.navbar-resume-btn, .mobile-resume-btn').forEach(btn => {
    btn.style.display = 'none';
  });
}
