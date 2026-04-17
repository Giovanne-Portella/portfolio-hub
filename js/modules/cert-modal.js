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
      <a href="${safeUrl(f.file_url)}" target="_blank" rel="noopener noreferrer" class="project-file-item" download>
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

