// ============================================
// CERTIFICATE PROJECT FILES
// ============================================
function setupCertProjectFiles() {
  const checkbox = document.getElementById('cert-has-project');
  const area = document.getElementById('cert-project-files-area');

  checkbox.addEventListener('change', () => {
    area.style.display = checkbox.checked ? '' : 'none';
  });

  document.getElementById('btn-add-project-file').addEventListener('click', async () => {
    const certId = document.getElementById('cert-id').value;
    if (!certId) {
      showToast('Salve o certificado primeiro antes de adicionar arquivos', true);
      return;
    }

    const fileInput = document.getElementById('cert-project-file-input');
    const file = fileInput.files[0];
    if (!file) {
      showToast('Selecione um arquivo', true);
      return;
    }

    const description = document.getElementById('cert-project-file-desc').value.trim() || null;

    try {
      const fileUrl = await uploadFile('project-files', file);

      const { error } = await supabase.from('certificate_project_files').insert({
        certificate_id: certId,
        file_name: file.name,
        file_url: fileUrl,
        description: description,
      });

      if (error) throw error;

      showToast('Arquivo adicionado!');
      fileInput.value = '';
      document.getElementById('cert-project-file-desc').value = '';
      loadCertProjectFiles(certId);
    } catch (err) {
      showToast('Erro ao adicionar arquivo: ' + (err.message || err), true);
    }
  });
}

async function loadCertProjectFiles(certId) {
  const container = document.getElementById('cert-project-files-list');
  if (!certId) {
    container.innerHTML = '<p class="text-muted">Salve o certificado primeiro para adicionar arquivos.</p>';
    return;
  }

  const { data, error } = await supabase
    .from('certificate_project_files')
    .select('*')
    .eq('certificate_id', certId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    container.innerHTML = '<p class="text-muted">Nenhum arquivo vinculado.</p>';
    return;
  }

  const fileIcons = {
    'xlsx': 'fa-file-excel', 'xls': 'fa-file-excel', 'csv': 'fa-file-csv',
    'pdf': 'fa-file-pdf', 'doc': 'fa-file-word', 'docx': 'fa-file-word',
    'ppt': 'fa-file-powerpoint', 'pptx': 'fa-file-powerpoint',
    'pbix': 'fa-chart-bar', 'sql': 'fa-database',
    'zip': 'fa-file-archive', 'rar': 'fa-file-archive',
  };

  container.innerHTML = data.map(f => {
    const ext = f.file_name.split('.').pop().toLowerCase();
    const icon = fileIcons[ext] || 'fa-file';
    return `
      <div class="project-file-row">
        <div class="project-file-info">
          <i class="fas ${icon}"></i>
          <span>${esc(f.file_name)}</span>
          ${f.description ? `<small>${esc(f.description)}</small>` : ''}
        </div>
        <div class="project-file-actions">
          <a href="${esc(f.file_url)}" target="_blank" class="btn btn-sm btn-icon" title="Baixar">
            <i class="fas fa-download"></i>
          </a>
          <button class="btn btn-sm btn-icon btn-danger" onclick="deleteProjectFile('${f.id}', '${f.certificate_id}')" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.deleteProjectFile = async function(fileId, certId) {
  if (!confirm('Excluir este arquivo?')) return;
  const { error } = await supabase.from('certificate_project_files').delete().eq('id', fileId);
  if (error) {
    showToast('Erro ao excluir arquivo', true);
  } else {
    showToast('Arquivo excluÃ­do!');
    loadCertProjectFiles(certId);
  }
};

