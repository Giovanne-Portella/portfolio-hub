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
          ${cat.description ? `<span>${esc(cat.description.substring(0, 80))}${cat.description.length > 80 ? '...' : ''}</span>` : '<span>Sem descriÃ§Ã£o</span>'}
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
  if (!confirm('Excluir esta categoria? Todos os certificados desta categoria tambÃ©m serÃ£o excluÃ­dos.')) return;
  const { error } = await supabase.from('certificate_categories').delete().eq('id', id);
  if (error) {
    showToast('Erro ao excluir', true);
  } else {
    showToast('Categoria excluÃ­da!');
    loadCategories();
    loadCertificates();
  }
};

