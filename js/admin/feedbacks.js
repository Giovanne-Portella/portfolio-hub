// ============================================
// FEEDBACKS (ADMIN) — Solicitações
// ============================================

let _allFeedbacks = [];
let _currentFeedbackFilter = 'all';

// ============================================
// LOAD & RENDER
// ============================================
async function loadFeedbacksAdmin() {
  const container = document.getElementById('feedbacks-list');

  const { data, error } = await supabase
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Erro ao carregar feedbacks.</p>
      </div>`;
    return;
  }

  _allFeedbacks = data || [];

  // Update pending badge on sidebar nav item
  const pendingCount = _allFeedbacks.filter(f => !f.approved).length;
  const sideBadge = document.getElementById('feedbacks-pending-badge');
  if (sideBadge) {
    sideBadge.textContent = pendingCount;
    sideBadge.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
  }

  // Update count in filter tab
  const tabBadge = document.getElementById('pending-count-badge');
  if (tabBadge) {
    tabBadge.textContent = pendingCount > 0 ? pendingCount : '';
  }

  renderFeedbacks();
}

function renderFeedbacks() {
  const container = document.getElementById('feedbacks-list');

  let filtered = _allFeedbacks;
  if (_currentFeedbackFilter === 'pending')  filtered = _allFeedbacks.filter(f => !f.approved);
  if (_currentFeedbackFilter === 'approved') filtered = _allFeedbacks.filter(f =>  f.approved);

  if (filtered.length === 0) {
    const msgs = {
      all:      'Nenhum feedback recebido ainda.',
      pending:  'Nenhum feedback pendente.',
      approved: 'Nenhum feedback aprovado.',
    };
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>${msgs[_currentFeedbackFilter]}</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(fb => {
    const date    = new Date(fb.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const excerpt = fb.feedback.length > 160
      ? fb.feedback.substring(0, 160) + '…'
      : fb.feedback;

    const statusBadge = fb.approved
      ? '<span class="item-badge badge-success"><i class="fas fa-check"></i> Aprovado</span>'
      : '<span class="item-badge badge-pending"><i class="fas fa-clock"></i> Pendente</span>';

    const actionBtn = !fb.approved
      ? `<button class="btn btn-sm btn-approve" onclick="approveFeedback('${fb.id}')" title="Aprovar feedback">
           <i class="fas fa-check"></i> Aprovar
         </button>`
      : `<button class="btn btn-sm btn-revoke" onclick="revokeFeedback('${fb.id}')" title="Revogar aprovação">
           <i class="fas fa-times"></i> Revogar
         </button>`;

    const linkedinLink = fb.linkedin_url
      ? `<span><i class="fab fa-linkedin"></i> <a href="${esc(fb.linkedin_url)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>${fb.show_linkedin ? ' <em>(visível)</em>' : ' <em>(oculto)</em>'}</span>`
      : '<span><i class="fab fa-linkedin"></i> Sem LinkedIn</span>';

    return `
      <div class="item-card feedback-card" data-id="${fb.id}">
        <div class="item-info">
          <div class="item-name">
            ${esc(fb.name)}
            <span class="feedback-profession">&nbsp;·&nbsp;${esc(fb.profession)}</span>
            ${statusBadge}
          </div>
          <div class="feedback-excerpt">${esc(excerpt)}</div>
          <div class="item-meta">
            <span><i class="fas fa-calendar-alt"></i> ${date}</span>
            ${linkedinLink}
          </div>
        </div>
        <div class="item-actions feedback-actions">
          ${actionBtn}
          <button class="btn btn-sm btn-icon btn-danger" onclick="deleteFeedback('${fb.id}')" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// SETUP (filter tabs)
// ============================================
function setupFeedbacksAdmin() {
  document.querySelectorAll('.feedback-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.feedback-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _currentFeedbackFilter = btn.dataset.filter;
      renderFeedbacks();
    });
  });
}

// ============================================
// ACTIONS
// ============================================
async function approveFeedback(id) {
  const { error } = await supabase
    .from('feedbacks')
    .update({ approved: true })
    .eq('id', id);

  if (error) { showToast('Erro ao aprovar feedback.', true); return; }
  showToast('Feedback aprovado e agora visível no portfolio!');
  await loadFeedbacksAdmin();
}

async function revokeFeedback(id) {
  const { error } = await supabase
    .from('feedbacks')
    .update({ approved: false })
    .eq('id', id);

  if (error) { showToast('Erro ao revogar aprovação.', true); return; }
  showToast('Aprovação revogada. Feedback removido do portfolio.');
  await loadFeedbacksAdmin();
}

async function deleteFeedback(id) {
  if (!confirm('Tem certeza que deseja excluir este feedback permanentemente?')) return;

  const { error } = await supabase
    .from('feedbacks')
    .delete()
    .eq('id', id);

  if (error) { showToast('Erro ao excluir feedback.', true); return; }
  showToast('Feedback excluído.');
  await loadFeedbacksAdmin();
}
