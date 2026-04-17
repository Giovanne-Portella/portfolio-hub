// ============================================
// PROJECTS
// ============================================
let _projectsData = [];

async function loadProjects() {
  const container = document.getElementById('projects-container');

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1">
        <i class="fas fa-code-branch"></i>
        <p>Nenhum projeto cadastrado ainda.</p>
      </div>`;
    return;
  }

  // Cache para o modal
  _projectsData = data;

  // AI context — títulos dos projetos para o avatar speech
  if (window._avatarCtx) {
    window._avatarCtx.projects = data.slice(0, 5).map(p => p.title);
  }

  // Update section title with total hours
  const projTotalHours = data.reduce((sum, p) => sum + (p.hours || 0), 0);
  const projTitle = document.getElementById('proj-section-title');
  if (projTitle) {
    const newProjTitle = projTotalHours > 0 ? `Projetos • ${projTotalHours}h` : 'Projetos';
    if (projTitle.classList.contains('typing')) {
      projTitle.dataset.typeTarget = newProjTitle;
    } else {
      projTitle.textContent = newProjTitle;
    }
  }

  container.innerHTML = data.map(project => {
    const imageHtml = project.image_url
      ? `<img src="${escapeAttr(project.image_url)}" alt="${escapeAttr(project.title)}" class="project-image" loading="lazy">`
      : `<div class="project-placeholder"><i class="fas fa-code"></i></div>`;

    const techsHtml = (project.technologies || [])
      .map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`)
      .join('');

    const linksHtml = [];
    if (project.github_url) {
      linksHtml.push(`<a href="${safeUrl(project.github_url)}" target="_blank" rel="noopener noreferrer" class="project-link">
        <i class="fab fa-github"></i> Código
      </a>`);
      linksHtml.push(`<button class="project-link readme-link" onclick="openReadme('${escapeAttr(project.github_url)}', '${escapeAttr(project.title)}')">
        <i class="fas fa-book-open"></i> README
      </button>`);
    }
    if (project.demo_url) {
      linksHtml.push(`<a href="${safeUrl(project.demo_url)}" target="_blank" rel="noopener noreferrer" class="project-link">
        <i class="fas fa-external-link-alt"></i> Demo
      </a>`);
    }

    const pid = escapeAttr(String(project.id));

    return `
      <div class="project-card" data-project-id="${pid}">
        <div class="project-image-wrapper">
          ${imageHtml}
          ${project.featured ? '<span class="project-featured-badge"><i class="fas fa-star"></i> Destaque</span>' : ''}
        </div>
        <div class="project-body">
          <h3 class="project-title">${escapeHtml(project.title)}</h3>
          <p class="project-description">${escapeHtml(project.description || '')}</p>
          ${project.description && project.description.length > 100
            ? `<button class="project-read-more" onclick="openProjectModal('${pid}')">▼ Ver mais</button>`
            : ''}
          ${techsHtml ? `<div class="project-techs">${techsHtml}</div>` : ''}
          ${project.hours ? `<p class="cert-hours"><i class="fas fa-clock"></i> ${project.hours}h</p>` : ''}
          ${linksHtml.length > 0 ? `<div class="project-links">${linksHtml.join('')}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  setupProjectModal();
}

// ============================================
// PROJECT MODAL
// ============================================
function openProjectModal(id) {
  const p = _projectsData.find(x => String(x.id) === String(id));
  if (!p) return;

  // Título da barra terminal — slug do nome do projeto
  const titleBar = document.getElementById('pm-title-bar');
  if (titleBar) {
    const slug = p.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    titleBar.textContent = `~/${slug}.md`;
  }

  // Imagem
  const imgWrap = document.getElementById('pm-image');
  if (imgWrap) {
    if (p.image_url) {
      imgWrap.innerHTML = `<img src="${escapeAttr(p.image_url)}" alt="${escapeAttr(p.title)}">`;
      imgWrap.style.display = '';
    } else {
      imgWrap.innerHTML = `<div class="project-placeholder"><i class="fas fa-code"></i></div>`;
      imgWrap.style.display = '';
    }
  }

  // Título + badge
  const titleEl = document.getElementById('pm-title');
  if (titleEl) titleEl.textContent = p.title;

  const badgeEl = document.getElementById('pm-badge');
  if (badgeEl) badgeEl.style.display = p.featured ? '' : 'none';

  // Descrição
  const descEl = document.getElementById('pm-desc');
  if (descEl) descEl.textContent = p.description || '';

  // Tecnologias
  const techsEl = document.getElementById('pm-techs');
  if (techsEl) {
    if (p.technologies && p.technologies.length) {
      techsEl.innerHTML = p.technologies.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');
      techsEl.style.display = '';
    } else {
      techsEl.style.display = 'none';
    }
  }

  // Horas
  const hoursEl  = document.getElementById('pm-hours');
  const hoursVal = document.getElementById('pm-hours-val');
  if (hoursEl && hoursVal) {
    if (p.hours) {
      hoursVal.textContent = `${p.hours}h`;
      hoursEl.style.display = '';
    } else {
      hoursEl.style.display = 'none';
    }
  }

  // Links no footer
  const linksEl = document.getElementById('pm-links');
  if (linksEl) {
    const links = [];
    if (p.github_url) {
      links.push(`<a href="${safeUrl(p.github_url)}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fab fa-github"></i> Código</a>`);
      links.push(`<button class="project-link readme-link" onclick="openReadme('${escapeAttr(p.github_url)}','${escapeAttr(p.title)}')"><i class="fas fa-book-open"></i> README</button>`);
    }
    if (p.demo_url) {
      links.push(`<a href="${safeUrl(p.demo_url)}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fas fa-external-link-alt"></i> Demo</a>`);
    }
    linksEl.innerHTML = links.join('');
  }

  document.getElementById('project-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.openProjectModal = openProjectModal;

function closeProjectModal() {
  document.getElementById('project-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function setupProjectModal() {
  const overlay = document.getElementById('project-modal-overlay');
  if (!overlay || overlay.dataset.setup) return;
  overlay.dataset.setup = '1';

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeProjectModal();
  });
  document.getElementById('project-modal-close')?.addEventListener('click', closeProjectModal);
  document.getElementById('project-modal-btn-close')?.addEventListener('click', closeProjectModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeProjectModal();
  });
}
