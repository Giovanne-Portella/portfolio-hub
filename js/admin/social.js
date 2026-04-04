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
    showToast('ExcluÃ­do com sucesso!');
    loadSocialLinks();
  }
};

