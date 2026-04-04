// ============================================
// PROJECTS
// ============================================
async function loadProjects() {
  const container = document.getElementById('projects-list');

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-code-branch"></i>
        <p>Nenhum projeto cadastrado.</p>
      </div>`;
    return;
  }

  container.innerHTML = data.map(proj => {
    const techs = (proj.technologies || []).join(', ');
    return `
      <div class="item-card">
        ${proj.image_url ? `<img src="${esc(proj.image_url)}" class="item-thumb" alt="">` : ''}
        <div class="item-info">
          <div class="item-name">
            ${esc(proj.title)}
            ${proj.featured ? '<span class="item-badge badge-featured"><i class="fas fa-star"></i> Destaque</span>' : ''}
          </div>
          <div class="item-meta">
            ${techs ? `<span>${esc(techs)}</span>` : ''}
            ${proj.github_url ? '<span><i class="fab fa-github"></i> GitHub</span>' : ''}
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-sm btn-icon" onclick="editProject('${proj.id}')" title="Editar">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-icon btn-danger" onclick="deleteProject('${proj.id}')" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function setupProjectForm() {
  document.getElementById('btn-add-project').addEventListener('click', () => {
    document.getElementById('modal-project-title').textContent = 'Novo Projeto';
    document.getElementById('project-form').reset();
    document.getElementById('proj-id').value = '';
    document.getElementById('proj-image-preview').style.display = 'none';
    document.getElementById('proj-hours').value = '';
    openModal('modal-project');
  });

  // Image preview
  document.getElementById('proj-image-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const preview = document.getElementById('proj-image-preview');
        preview.src = ev.target.result;
        preview.style.display = '';
      };
      reader.readAsDataURL(file);
    }
  });

  // Auto-fetch technologies from GitHub repo URL
  const projGithubInput = document.getElementById('proj-github');
  projGithubInput.addEventListener('change', fetchRepoLanguages);
  projGithubInput.addEventListener('paste', (e) => {
    setTimeout(fetchRepoLanguages, 100);
  });

  async function fetchRepoLanguages() {
    const url = projGithubInput.value.trim();
    const match = url.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
    if (!match) return;

    const [, owner, repo] = match;
    const techsInput = document.getElementById('proj-techs');

    try {
      const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo.replace(/\.git$/, ''))}/languages`);
      if (!res.ok) return;
      const languages = await res.json();
      const langs = Object.keys(languages);
      if (langs.length === 0) return;

      // Merge with existing techs (don't overwrite manual entries)
      const existing = techsInput.value.trim()
        ? techsInput.value.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      const merged = [...new Set([...langs, ...existing])];
      techsInput.value = merged.join(', ');

      showToast(`Tecnologias detectadas: ${langs.join(', ')}`);
    } catch {}
  }

  document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = window.currentUserId;
    const id = document.getElementById('proj-id').value;

    let imageUrl = null;
    const imageFile = document.getElementById('proj-image-input').files[0];
    if (imageFile) {
      try {
        imageUrl = await uploadFile('projects', imageFile);
      } catch (err) {
        showToast('Erro ao fazer upload da imagem', true);
        return;
      }
    }

    const techsRaw = document.getElementById('proj-techs').value.trim();
    const technologies = techsRaw ? techsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    const projData = {
      user_id: userId,
      title: document.getElementById('proj-title').value.trim(),
      description: document.getElementById('proj-description').value.trim() || null,
      github_url: document.getElementById('proj-github').value.trim() || null,
      demo_url: document.getElementById('proj-demo').value.trim() || null,
      technologies: technologies,
      featured: document.getElementById('proj-featured').checked,
      display_order: parseInt(document.getElementById('proj-order').value) || 0,
      hours: parseInt(document.getElementById('proj-hours').value) || null,
    };

    if (imageUrl) projData.image_url = imageUrl;

    let error;
    if (id) {
      ({ error } = await supabase.from('projects').update(projData).eq('id', id));
    } else {
      ({ error } = await supabase.from('projects').insert(projData));
    }

    if (error) {
      showToast('Erro: ' + error.message, true);
    } else {
      showToast('Projeto salvo!');
      closeModal('modal-project');
      loadProjects();
    }
  });
}

window.editProject = async function(id) {
  const { data } = await supabase.from('projects').select('*').eq('id', id).single();
  if (!data) return;

  document.getElementById('modal-project-title').textContent = 'Editar Projeto';
  document.getElementById('proj-id').value = data.id;
  document.getElementById('proj-title').value = data.title;
  document.getElementById('proj-description').value = data.description || '';
  document.getElementById('proj-github').value = data.github_url || '';
  document.getElementById('proj-demo').value = data.demo_url || '';
  document.getElementById('proj-techs').value = (data.technologies || []).join(', ');
  document.getElementById('proj-featured').checked = data.featured;
  document.getElementById('proj-order').value = data.display_order;
  document.getElementById('proj-hours').value = data.hours || '';

  const preview = document.getElementById('proj-image-preview');
  if (data.image_url) {
    preview.src = data.image_url;
    preview.style.display = '';
  } else {
    preview.style.display = 'none';
  }

  openModal('modal-project');
};

window.deleteProject = async function(id) {
  if (!confirm('Deseja excluir este projeto?')) return;
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    showToast('Erro ao excluir', true);
  } else {
    showToast('Projeto excluÃ­do!');
    loadProjects();
  }
};

// ============================================
// UTILS
// ============================================
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
