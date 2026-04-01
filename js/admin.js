// ============================================
// Admin Panel - CRUD Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupModals();
  setupProfileForm();
  setupSocialForm();
  setupCategoryForm();
  setupCertificateForm();
  setupProjectForm();

  // Initial data load
  loadProfile();
  loadSocialLinks();
  loadCategories();
  loadCertificates();
  loadProjects();
});

// ============================================
// NAVIGATION
// ============================================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const sections = document.querySelectorAll('.admin-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.dataset.section;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${target}`).classList.add('active');

      // Close mobile sidebar
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  // Mobile sidebar toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

// ============================================
// MODALS
// ============================================
function setupModals() {
  // Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      document.getElementById(modalId).classList.remove('active');
    });
  });

  // Close on overlay click
  document.querySelectorAll('.admin-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ============================================
// TOAST
// ============================================
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-msg');
  const icon = toast.querySelector('i');

  msg.textContent = message;
  toast.classList.toggle('error', isError);
  icon.className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================
// FILE UPLOAD HELPER
// ============================================
async function uploadFile(bucket, file) {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

// ============================================
// PROFILE
// ============================================
async function loadProfile() {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();

  if (!data) return;

  document.getElementById('p-name').value = data.full_name || '';
  document.getElementById('p-title').value = data.title || '';
  document.getElementById('p-email').value = data.email || '';
  document.getElementById('p-phone').value = data.phone || '';
  document.getElementById('p-location').value = data.location || '';
  document.getElementById('p-bio').value = data.bio || '';
  document.getElementById('p-resume').value = data.resume_url || '';

  if (data.photo_url) {
    document.getElementById('profile-avatar').src = data.photo_url;
  }
}

function setupProfileForm() {
  const form = document.getElementById('profile-form');
  const avatarInput = document.getElementById('avatar-input');

  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById('profile-avatar').src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = window.currentUserId;
    if (!userId) return;

    let photoUrl = null;
    const avatarFile = avatarInput.files[0];
    if (avatarFile) {
      try {
        photoUrl = await uploadFile('avatars', avatarFile);
      } catch (err) {
        showToast('Erro ao fazer upload da foto', true);
        return;
      }
    }

    const profileData = {
      user_id: userId,
      full_name: document.getElementById('p-name').value.trim(),
      title: document.getElementById('p-title').value.trim(),
      email: document.getElementById('p-email').value.trim(),
      phone: document.getElementById('p-phone').value.trim(),
      location: document.getElementById('p-location').value.trim(),
      bio: document.getElementById('p-bio').value.trim(),
      resume_url: document.getElementById('p-resume').value.trim() || null,
    };

    if (photoUrl) profileData.photo_url = photoUrl;

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    let error;
    if (existing) {
      ({ error } = await supabase.from('profiles').update(profileData).eq('user_id', userId));
    } else {
      ({ error } = await supabase.from('profiles').insert(profileData));
    }

    if (error) {
      showToast('Erro ao salvar perfil: ' + error.message, true);
    } else {
      showToast('Perfil salvo com sucesso!');
    }
  });
}

// ============================================
// SOCIAL LINKS
// ============================================
async function loadSocialLinks() {
  const container = document.getElementById('social-list');

  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-share-alt"></i>
        <p>Nenhuma rede social cadastrada.</p>
      </div>`;
    return;
  }

  container.innerHTML = data.map(link => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-name">
          <i class="fab ${esc(link.icon)}"></i> ${esc(link.platform)}
        </div>
        <div class="item-meta">
          <span>${esc(link.url)}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-icon" onclick="editSocial('${link.id}')" title="Editar">
          <i class="fas fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-icon btn-danger" onclick="deleteSocial('${link.id}')" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function setupSocialForm() {
  document.getElementById('btn-add-social').addEventListener('click', () => {
    document.getElementById('modal-social-title').textContent = 'Adicionar Rede Social';
    document.getElementById('social-form').reset();
    document.getElementById('s-id').value = '';
    openModal('modal-social');
  });

  // Auto-fill icon based on platform
  document.getElementById('s-platform').addEventListener('change', (e) => {
    const icons = {
      'LinkedIn': 'fa-linkedin', 'GitHub': 'fa-github', 'Instagram': 'fa-instagram',
      'Twitter/X': 'fa-x-twitter', 'YouTube': 'fa-youtube', 'Facebook': 'fa-facebook',
      'Discord': 'fa-discord', 'WhatsApp': 'fa-whatsapp', 'Telegram': 'fa-telegram',
      'Website': 'fa-globe', 'Outro': 'fa-link'
    };
    document.getElementById('s-icon').value = icons[e.target.value] || 'fa-link';
  });

  document.getElementById('social-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = window.currentUserId;
    const id = document.getElementById('s-id').value;

    const linkData = {
      user_id: userId,
      platform: document.getElementById('s-platform').value,
      url: document.getElementById('s-url').value.trim(),
      icon: document.getElementById('s-icon').value.trim(),
      display_order: parseInt(document.getElementById('s-order').value) || 0,
    };

    let error;
    if (id) {
      ({ error } = await supabase.from('social_links').update(linkData).eq('id', id));
    } else {
      ({ error } = await supabase.from('social_links').insert(linkData));
    }

    if (error) {
      showToast('Erro: ' + error.message, true);
    } else {
      showToast('Rede social salva!');
      closeModal('modal-social');
      loadSocialLinks();
    }
  });
}

window.editSocial = async function(id) {
  const { data } = await supabase.from('social_links').select('*').eq('id', id).single();
  if (!data) return;

  document.getElementById('modal-social-title').textContent = 'Editar Rede Social';
  document.getElementById('s-id').value = data.id;
  document.getElementById('s-platform').value = data.platform;
  document.getElementById('s-url').value = data.url;
  document.getElementById('s-icon').value = data.icon;
  document.getElementById('s-order').value = data.display_order;
  openModal('modal-social');
};

window.deleteSocial = async function(id) {
  if (!confirm('Deseja excluir esta rede social?')) return;
  const { error } = await supabase.from('social_links').delete().eq('id', id);
  if (error) {
    showToast('Erro ao excluir', true);
  } else {
    showToast('Excluído com sucesso!');
    loadSocialLinks();
  }
};

// ============================================
// CATEGORIES
// ============================================
let categoriesCache = [];

async function loadCategories() {
  const container = document.getElementById('categories-list');

  const { data, error } = await supabase
    .from('certificate_categories')
    .select('*')
    .order('display_order', { ascending: true });

  categoriesCache = data || [];

  // Update category dropdowns
  updateCategoryDropdowns();

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>Nenhuma categoria cadastrada.</p>
      </div>`;
    return;
  }

  container.innerHTML = data.map(cat => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-name">${esc(cat.name)}</div>
        <div class="item-meta">
          ${cat.description ? `<span>${esc(cat.description.substring(0, 80))}${cat.description.length > 80 ? '...' : ''}</span>` : '<span>Sem descrição</span>'}
          <span>Ordem: ${cat.display_order}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-sm btn-icon" onclick="editCategory('${cat.id}')" title="Editar">
          <i class="fas fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-icon btn-danger" onclick="deleteCategory('${cat.id}')" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function updateCategoryDropdowns() {
  const certCatSelect = document.getElementById('cert-category');
  const filterSelect = document.getElementById('cert-filter-cat');

  const options = categoriesCache.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

  certCatSelect.innerHTML = '<option value="">Selecione uma categoria</option>' + options;
  filterSelect.innerHTML = '<option value="">Todas</option>' + options;
}

function setupCategoryForm() {
  document.getElementById('btn-add-category').addEventListener('click', () => {
    document.getElementById('modal-category-title').textContent = 'Nova Categoria';
    document.getElementById('category-form').reset();
    document.getElementById('cat-id').value = '';
    openModal('modal-category');
  });

  document.getElementById('category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = window.currentUserId;
    const id = document.getElementById('cat-id').value;

    const catData = {
      user_id: userId,
      name: document.getElementById('cat-name').value.trim(),
      description: document.getElementById('cat-description').value.trim() || null,
      display_order: parseInt(document.getElementById('cat-order').value) || 0,
    };

    let error;
    if (id) {
      ({ error } = await supabase.from('certificate_categories').update(catData).eq('id', id));
    } else {
      ({ error } = await supabase.from('certificate_categories').insert(catData));
    }

    if (error) {
      showToast('Erro: ' + error.message, true);
    } else {
      showToast('Categoria salva!');
      closeModal('modal-category');
      loadCategories();
    }
  });
}

window.editCategory = async function(id) {
  const { data } = await supabase.from('certificate_categories').select('*').eq('id', id).single();
  if (!data) return;

  document.getElementById('modal-category-title').textContent = 'Editar Categoria';
  document.getElementById('cat-id').value = data.id;
  document.getElementById('cat-name').value = data.name;
  document.getElementById('cat-description').value = data.description || '';
  document.getElementById('cat-order').value = data.display_order;
  openModal('modal-category');
};

window.deleteCategory = async function(id) {
  if (!confirm('Excluir esta categoria? Todos os certificados desta categoria também serão excluídos.')) return;
  const { error } = await supabase.from('certificate_categories').delete().eq('id', id);
  if (error) {
    showToast('Erro ao excluir', true);
  } else {
    showToast('Categoria excluída!');
    loadCategories();
    loadCertificates();
  }
};

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
      ? '<span class="item-badge badge-completed"><i class="fas fa-check"></i> Concluído</span>'
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
}

function setupCertificateForm() {
  document.getElementById('btn-add-cert').addEventListener('click', () => {
    document.getElementById('modal-cert-title').textContent = 'Novo Certificado';
    document.getElementById('cert-form').reset();
    document.getElementById('cert-id').value = '';
    document.getElementById('cert-image-preview').style.display = 'none';
    document.getElementById('cert-pdf-preview').style.display = 'none';
    document.getElementById('cert-progress-group').style.display = '';
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

  openModal('modal-cert');
};

window.deleteCert = async function(id) {
  if (!confirm('Deseja excluir este certificado?')) return;
  const { error } = await supabase.from('certificates').delete().eq('id', id);
  if (error) {
    showToast('Erro ao excluir', true);
  } else {
    showToast('Certificado excluído!');
    loadCertificates();
  }
};

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
    showToast('Projeto excluído!');
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
