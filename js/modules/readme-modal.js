// ============================================
// README MODAL
// ============================================
async function openReadme(githubUrl, projectTitle) {
  const overlay = document.getElementById('readme-modal-overlay');
  const body = document.getElementById('readme-terminal-body');
  const title = document.getElementById('readme-terminal-title');

  // Extract owner/repo from github URL
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
  if (!match) {
    body.innerHTML = '<p class="readme-error">URL do GitHub inválida.</p>';
    overlay.classList.add('active');
    return;
  }

  const [, owner, repo] = match;
  title.textContent = `~/${repo.replace(/\.git$/, '')}/README.md`;
  body.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Carregando README...</div>';
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  try {
    const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo.replace(/\.git$/, ''))}/readme`, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    });

    if (!res.ok) throw new Error('README não encontrado');
    const markdown = await res.text();

    // Configure marked for safe rendering
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    // Sanitize: render markdown then strip dangerous tags
    const rendered = DOMPurify.sanitize(marked.parse(markdown), {
      ADD_TAGS: ['img'],
      ADD_ATTR: ['src', 'alt', 'href', 'target', 'rel'],
    });

    body.innerHTML = `<div class="readme-content">${rendered}</div>`;

    // Fix relative image URLs to point to GitHub raw
    body.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http')) {
        img.src = `https://raw.githubusercontent.com/${owner}/${repo.replace(/\.git$/, '')}/main/${src}`;
      }
    });

    // Open links in new tab
    body.querySelectorAll('a').forEach(a => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });

  } catch (err) {
    body.innerHTML = `<p class="readme-error"><i class="fas fa-exclamation-triangle"></i> ${escapeHtml(err.message)}</p>`;
  }
}

function closeReadmeModal() {
  document.getElementById('readme-modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('readme-close-btn').addEventListener('click', closeReadmeModal);
  document.getElementById('readme-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeReadmeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeReadmeModal();
  });
});

