// ============================================
// RADIO TRACKS
// ============================================
async function loadRadioTracksAdmin() {
  const container = document.getElementById('radio-list');

  const { data, error } = await supabase
    .from('radio_tracks')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-music"></i>
        <p>Nenhuma música cadastrada.</p>
      </div>`;
    return;
  }

  container.innerHTML = data.map(track => `
    <div class="item-card${track.active ? '' : ' item-inactive'}">
      <div class="item-info">
        <div class="item-name">
          <i class="fas fa-music"></i> ${esc(track.name)}
        </div>
        <div class="item-meta">
          <span>ID: ${esc(track.youtube_id)}</span>
          <span class="item-badge ${track.active ? 'badge-success' : 'badge-muted'}">${track.active ? 'Ativa' : 'Inativa'}</span>
        </div>
      </div>
      <div class="item-actions">
        <a href="https://www.youtube.com/watch?v=${encodeURIComponent(track.youtube_id)}" target="_blank" class="btn btn-sm btn-icon" title="Abrir no YouTube">
          <i class="fab fa-youtube"></i>
        </a>
        <button class="btn btn-sm btn-icon" onclick="editTrack('${track.id}')" title="Editar">
          <i class="fas fa-pen"></i>
        </button>
        <button class="btn btn-sm btn-icon btn-danger" onclick="deleteTrack('${track.id}')" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function setupRadioForm() {
  document.getElementById('btn-add-track').addEventListener('click', () => {
    document.getElementById('modal-track-title').textContent = 'Nova Música';
    document.getElementById('track-form').reset();
    document.getElementById('track-id').value = '';
    document.getElementById('track-active').checked = true;
    openModal('modal-track');
  });

  document.getElementById('track-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = window.currentUserId;
    const id = document.getElementById('track-id').value;

    const trackData = {
      user_id: userId,
      name: document.getElementById('track-name').value.trim(),
      youtube_id: document.getElementById('track-youtube-id').value.trim(),
      display_order: parseInt(document.getElementById('track-order').value) || 0,
      active: document.getElementById('track-active').checked,
    };

    if (!trackData.name || !trackData.youtube_id) {
      showToast('Preencha nome e ID do YouTube', true);
      return;
    }

    let error;
    if (id) {
      ({ error } = await supabase.from('radio_tracks').update(trackData).eq('id', id));
    } else {
      ({ error } = await supabase.from('radio_tracks').insert(trackData));
    }

    if (error) {
      showToast('Erro: ' + error.message, true);
    } else {
      showToast('Música salva!');
      closeModal('modal-track');
      loadRadioTracksAdmin();
    }
  });
}

window.editTrack = async function(id) {
  const { data } = await supabase.from('radio_tracks').select('*').eq('id', id).single();
  if (!data) return;

  document.getElementById('modal-track-title').textContent = 'Editar Música';
  document.getElementById('track-id').value = data.id;
  document.getElementById('track-name').value = data.name;
  document.getElementById('track-youtube-id').value = data.youtube_id;
  document.getElementById('track-order').value = data.display_order;
  document.getElementById('track-active').checked = data.active;
  openModal('modal-track');
};

window.deleteTrack = async function(id) {
  if (!confirm('Deseja excluir esta música?')) return;
  const { error } = await supabase.from('radio_tracks').delete().eq('id', id);
  if (error) {
    showToast('Erro ao excluir', true);
  } else {
    showToast('Excluído com sucesso!');
    loadRadioTracksAdmin();
  }
};
