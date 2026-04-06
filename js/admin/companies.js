// ============================================
// COMPANIES (ADMIN)
// ============================================
async function loadCompaniesAdmin() {
  const container = document.getElementById('companies-list');

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-building"></i>
        <p>Nenhuma empresa cadastrada.</p>
      </div>`;
    return;
  }

  container.innerHTML = data.map(c => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-name">
          ${c.logo_url ? `<img src="${esc(c.logo_url)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;margin-right:8px;vertical-align:middle;">` : '<i class="fas fa-building"></i> '}
          ${esc(c.name)}
        </div>
        <div class="item-meta">
          ${c.website_url ? `<span><i class="fas fa-link"></i> ${esc(c.website_url)}</span>` : '<span>Sem site</span>'}
          ${c.description ? `<span>${esc(c.description.substring(0, 60))}${c.description.length > 60 ? '...' : ''}</span>` : ''}
        </div>
      </div>
      <div class="item-actions">
        ${c.website_url ? `<a href="${esc(c.website_url)}" target="_blank" class="btn btn-sm btn-icon" title="Abrir site"><i class="fas fa-external-link-alt"></i></a>` : ''}
        <button class="btn btn-sm btn-icon" onclick="editCompany('${c.id}')" title="Editar">
          <i class="fas fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-icon btn-danger" onclick="deleteCompany('${c.id}')" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function setupCompanyForm() {
  document.getElementById('btn-add-company').addEventListener('click', () => {
    document.getElementById('modal-company-title').textContent = 'Nova Empresa';
    document.getElementById('company-form').reset();
    document.getElementById('company-id').value = '';
    document.getElementById('company-logo-preview').innerHTML = '';
    openModal('modal-company');
  });

  document.getElementById('company-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = window.currentUserId;
    const id = document.getElementById('company-id').value;

    const companyData = {
      user_id: userId,
      name: document.getElementById('company-name').value.trim(),
      website_url: document.getElementById('company-website').value.trim() || null,
      description: document.getElementById('company-description').value.trim() || null,
      display_order: parseInt(document.getElementById('company-order').value) || 0,
    };

    if (!companyData.name) {
      showToast('Preencha o nome da empresa', true);
      return;
    }

    // Upload logo if selected
    const logoFile = document.getElementById('company-logo-file').files[0];
    if (logoFile) {
      const url = await uploadFile('companies', logoFile);
      if (url) companyData.logo_url = url;
    }

    let error;
    if (id) {
      ({ error } = await supabase.from('companies').update(companyData).eq('id', id));
    } else {
      ({ error } = await supabase.from('companies').insert(companyData));
    }

    if (error) {
      showToast('Erro: ' + error.message, true);
    } else {
      showToast('Empresa salva!');
      closeModal('modal-company');
      loadCompaniesAdmin();
    }
  });

  // Logo preview
  document.getElementById('company-logo-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('company-logo-preview');
    if (file) {
      const url = URL.createObjectURL(file);
      preview.innerHTML = `<img src="${url}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;margin-top:8px;">`;
    } else {
      preview.innerHTML = '';
    }
  });
}

window.editCompany = async function(id) {
  const { data } = await supabase.from('companies').select('*').eq('id', id).single();
  if (!data) return;

  document.getElementById('modal-company-title').textContent = 'Editar Empresa';
  document.getElementById('company-id').value = data.id;
  document.getElementById('company-name').value = data.name;
  document.getElementById('company-website').value = data.website_url || '';
  document.getElementById('company-description').value = data.description || '';
  document.getElementById('company-order').value = data.display_order;

  const preview = document.getElementById('company-logo-preview');
  if (data.logo_url) {
    preview.innerHTML = `<img src="${esc(data.logo_url)}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;margin-top:8px;">`;
  } else {
    preview.innerHTML = '';
  }

  openModal('modal-company');
};

window.deleteCompany = async function(id) {
  if (!confirm('Deseja excluir esta empresa?')) return;
  const { error } = await supabase.from('companies').delete().eq('id', id);
  if (error) {
    showToast('Erro ao excluir', true);
  } else {
    showToast('Excluído com sucesso!');
    loadCompaniesAdmin();
  }
};
