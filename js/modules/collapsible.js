// ============================================
// COLLAPSIBLE SECTIONS (with localStorage memory)
// ============================================
const COLLAPSE_STORAGE_KEY = 'portfolio_sections_state';

function getSectionsState() {
  try {
    return JSON.parse(localStorage.getItem(COLLAPSE_STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveSectionState(targetId, isCollapsed) {
  const state = getSectionsState();
  state[targetId] = isCollapsed;
  localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(state));
}

function setupCollapsible() {
  const savedState = getSectionsState();

  document.querySelectorAll('.collapsible-header').forEach(header => {
    const targetId = header.dataset.target;
    const body = document.getElementById(targetId);
    if (!body) return;

    const icon = header.querySelector('.collapse-toggle i');

    // On first visit (no saved state), default to collapsed
    // If there's saved state, use it
    const isCollapsed = savedState[targetId] !== undefined ? savedState[targetId] : true;

    if (isCollapsed) {
      body.classList.add('collapsed');
      icon.className = 'fas fa-chevron-down';
    } else {
      body.classList.remove('collapsed');
      icon.className = 'fas fa-chevron-up';
    }

    // Only attach listener once (skip if already bound)
    if (header.dataset.collapseBound) return;
    header.dataset.collapseBound = '1';

    header.addEventListener('click', (e) => {
      // Don't collapse when clicking copy-link button
      if (e.target.closest('.cert-copy-link')) return;

      body.classList.toggle('collapsed');
      const nowCollapsed = body.classList.contains('collapsed');
      
      icon.className = nowCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
      saveSectionState(targetId, nowCollapsed);
    });
  });
}

