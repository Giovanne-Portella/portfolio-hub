// ============================================
// CERTIFICATES
// ============================================
async function loadCertificates(filterCategoryId) {
  const container = document.getElementById('certs-list');

  let query = supabase
    .from('certificates')
    .select('*, certificate_categories(name)')
    .order('display_order', { ascending: true });

  if (filterCategoryId) {
    query = query.eq('category_id', filterCategoryId);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-certificate"></i>
        <p>Nenhum certificado cadastrado.</p>
      </div>`;
    return;
  }

  container.innerHTML = data.map(cert => {
    const catName = cert.certificate_categories?.name || 'Sem categoria';
    const statusBadge = cert.completed
      ? '<span class="item-badge badge-completed"><i class="fas fa-check"></i> ConcluÃ­do</span>'
      : `<span class="item-badge badge-progress">${cert.progress}%</span>`;

    return `
      <div class="item-card">
        ${cert.image_url ? `<img src="${esc(cert.image_url)}" class="item-thumb" alt="">` : ''}
        <div class="item-info">
          <div class="item-name">${esc(cert.name)} ${statusBadge}</div>
          <div class="item-meta">
            <span><i class="fas fa-folder"></i> ${esc(catName)}</span>
            ${cert.issuer ? `<span>${esc(cert.issuer)}</span>` : ''}
            ${cert.completed_at ? `<span>${new Date(cert.completed_at).toLocaleDateString('pt-BR')}</span>` : ''}
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-sm btn-icon" onclick="editCert('${cert.id}')" title="Editar">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-icon btn-danger" onclick="deleteCert('${cert.id}')" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Auto-detect hours for PDFs missing hours (run once silently)
  if (!autoDetectCertHours._ran) {
    autoDetectCertHours._ran = true;
    autoDetectCertHours().then(updated => {
      if (updated) loadCertificates(filterCategoryId);
    });
  }
}

function setupCertificateForm() {
  document.getElementById('btn-add-cert').addEventListener('click', () => {
    document.getElementById('modal-cert-title').textContent = 'Novo Certificado';
    document.getElementById('cert-form').reset();
    document.getElementById('cert-id').value = '';
    document.getElementById('cert-image-preview').style.display = 'none';
    document.getElementById('cert-pdf-preview').style.display = 'none';
    document.getElementById('cert-progress-group').style.display = '';
    document.getElementById('cert-has-project').checked = false;
    document.getElementById('cert-project-files-area').style.display = 'none';
    document.getElementById('cert-project-files-list').innerHTML = '<p class="text-muted">Salve o certificado primeiro para adicionar arquivos.</p>';
    document.getElementById('cert-hours').value = '';
    openModal('modal-cert');
  });

  // Filter by category
  document.getElementById('cert-filter-cat').addEventListener('change', (e) => {
    loadCertificates(e.target.value || undefined);
  });

  // Toggle progress field based on completed checkbox
  document.getElementById('cert-completed').addEventListener('change', (e) => {
    document.getElementById('cert-progress-group').style.display = e.target.checked ? 'none' : '';
    if (e.target.checked) {
      document.getElementById('cert-progress').value = 100;
    }
  });

  // Mark manual edit on hours field
  document.getElementById('cert-hours').addEventListener('input', function() {
    this.dataset.manual = this.value ? '1' : '';
  });

  // File preview (image or PDF)
  document.getElementById('cert-image-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgPreview = document.getElementById('cert-image-preview');
    const pdfPreview = document.getElementById('cert-pdf-preview');
    imgPreview.style.display = 'none';
    pdfPreview.style.display = 'none';

    if (file.type === 'application/pdf') {
      // Render first page of PDF as preview
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        pdfPreview.width = viewport.width;
        pdfPreview.height = viewport.height;
        const ctx = pdfPreview.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        pdfPreview.style.display = '';

        // Auto-extract hours from PDF text
        const hoursField = document.getElementById('cert-hours');
        if (!hoursField.dataset.manual) {
          const hours = await extractHoursFromPdf(pdf);
          if (hours) hoursField.value = hours;
        }
      } catch (err) {
        console.error('Erro ao renderizar PDF:', err);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        imgPreview.src = ev.target.result;
        imgPreview.style.display = '';
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('cert-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = window.currentUserId;
    const id = document.getElementById('cert-id').value;

    let imageUrl = null;
    const imageFile = document.getElementById('cert-image-input').files[0];
    if (imageFile) {
      try {
        imageUrl = await uploadFile('certificates', imageFile);
      } catch (err) {
        showToast('Erro ao fazer upload do arquivo', true);
        return;
      }
    }

    const completed = document.getElementById('cert-completed').checked;
    const certData = {
      user_id: userId,
      category_id: document.getElementById('cert-category').value,
      name: document.getElementById('cert-name').value.trim(),
      issuer: document.getElementById('cert-issuer').value.trim() || null,
      credential_url: document.getElementById('cert-credential-url').value.trim() || null,
      completed: completed,
      completed_at: completed && document.getElementById('cert-date').value
        ? document.getElementById('cert-date').value
        : null,
      progress: completed ? 100 : parseInt(document.getElementById('cert-progress').value) || 0,
      display_order: parseInt(document.getElementById('cert-order').value) || 0,
      hours: parseInt(document.getElementById('cert-hours').value) || null,
    };

    if (imageUrl) certData.image_url = imageUrl;

    let error;
    if (id) {
      ({ error } = await supabase.from('certificates').update(certData).eq('id', id));
    } else {
      ({ error } = await supabase.from('certificates').insert(certData));
    }

    if (error) {
      showToast('Erro: ' + error.message, true);
    } else {
      showToast('Certificado salvo!');
      closeModal('modal-cert');
      loadCertificates();
    }
  });
}

// Extract hours from PDF text content
async function extractHoursFromPdf(pdf) {
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // Join without separator â€” PDF.js items often include their own spacing
    // Then normalize whitespace to avoid split characters like "8 0" â†’ "80"
    const pageText = textContent.items.map(item => item.str).join('');
    fullText += ' ' + pageText;
  }
  fullText = fullText.replace(/\s+/g, ' ');
  // Match patterns: "80 horas", "80horas", "80 Horas", "80h", "80 HORAS", "80 Hora"
  const match = fullText.match(/(\d+)\s*h(?:oras?)?\b/i);
  return match ? parseInt(match[1]) : null;
}

// Auto-detect hours for existing certs with PDFs and no hours set
async function autoDetectCertHours() {
  const { data: certs } = await supabase
    .from('certificates')
    .select('id, image_url, hours')
    .is('hours', null)
    .ilike('image_url', '%.pdf');

  if (!certs || certs.length === 0) return false;

  let updated = false;
  for (const cert of certs) {
    try {
      const pdf = await pdfjsLib.getDocument(cert.image_url).promise;
      const hours = await extractHoursFromPdf(pdf);
      if (hours) {
        await supabase.from('certificates').update({ hours }).eq('id', cert.id);
        updated = true;
      }
    } catch (err) {
      console.error(`Erro ao extrair horas do cert ${cert.id}:`, err);
    }
  }
  return updated;
}

window.editCert = async function(id) {
  const { data } = await supabase.from('certificates').select('*').eq('id', id).single();
  if (!data) return;

  document.getElementById('modal-cert-title').textContent = 'Editar Certificado';
  document.getElementById('cert-id').value = data.id;
  document.getElementById('cert-category').value = data.category_id;
  document.getElementById('cert-name').value = data.name;
  document.getElementById('cert-issuer').value = data.issuer || '';
  document.getElementById('cert-credential-url').value = data.credential_url || '';
  document.getElementById('cert-completed').checked = data.completed;
  document.getElementById('cert-date').value = data.completed_at ? data.completed_at.split('T')[0] : '';
  document.getElementById('cert-progress').value = data.progress;
  document.getElementById('cert-order').value = data.display_order;
  document.getElementById('cert-hours').value = data.hours || '';
  document.getElementById('cert-hours').dataset.manual = data.hours ? '1' : '';
  document.getElementById('cert-progress-group').style.display = data.completed ? 'none' : '';

  const preview = document.getElementById('cert-image-preview');
  const pdfPreview = document.getElementById('cert-pdf-preview');
  preview.style.display = 'none';
  pdfPreview.style.display = 'none';

  if (data.image_url) {
    if (data.image_url.toLowerCase().endsWith('.pdf')) {
      // Render first page of existing PDF as preview
      try {
        const pdf = await pdfjsLib.getDocument(data.image_url).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        pdfPreview.width = viewport.width;
        pdfPreview.height = viewport.height;
        const ctx = pdfPreview.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        pdfPreview.style.display = '';
      } catch (err) {
        console.error('Erro ao renderizar PDF:', err);
      }
    } else {
      preview.src = data.image_url;
      preview.style.display = '';
    }
  }

  // Load project files for this certificate
  const { data: filesData } = await supabase
    .from('certificate_project_files')
    .select('id')
    .eq('certificate_id', data.id)
    .limit(1);

  const hasFiles = filesData && filesData.length > 0;
  document.getElementById('cert-has-project').checked = hasFiles;
  document.getElementById('cert-project-files-area').style.display = hasFiles ? '' : 'none';
  loadCertProjectFiles(data.id);

  openModal('modal-cert');
};

window.deleteCert = async function(id) {
  if (!confirm('Deseja excluir este certificado?')) return;
  const { error } = await supabase.from('certificates').delete().eq('id', id);
  if (error) {
    showToast('Erro ao excluir', true);
  } else {
    showToast('Certificado excluÃ­do!');
    loadCertificates();
  }
};

