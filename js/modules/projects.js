// ============================================
// PROJECTS
// ============================================
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

  // Update section title with total hours
  const projTotalHours = data.reduce((sum, p) => sum + (p.hours || 0), 0);
  const projTitle = document.getElementById('proj-section-title');
  if (projTitle) {
    projTitle.textContent = projTotalHours > 0 ? `Projetos • ${projTotalHours}h` : 'Projetos';
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
      linksHtml.push(`<a href="${escapeAttr(project.github_url)}" target="_blank" rel="noopener noreferrer" class="project-link">
        <i class="fab fa-github"></i> Código
      </a>`);
      linksHtml.push(`<button class="project-link readme-link" onclick="openReadme('${escapeAttr(project.github_url)}', '${escapeAttr(project.title)}')">
        <i class="fas fa-book-open"></i> README
      </button>`);
    }
    if (project.demo_url) {
      linksHtml.push(`<a href="${escapeAttr(project.demo_url)}" target="_blank" rel="noopener noreferrer" class="project-link">
        <i class="fas fa-external-link-alt"></i> Demo
      </a>`);
    }

    return `
      <div class="project-card">
        <div class="project-image-wrapper">
          ${imageHtml}
          ${project.featured ? '<span class="project-featured-badge"><i class="fas fa-star"></i> Destaque</span>' : ''}
        </div>
        <div class="project-body">
          <h3 class="project-title">${escapeHtml(project.title)}</h3>
          <p class="project-description">${escapeHtml(project.description || '')}</p>
          ${project.description && project.description.length > 120 ? '<button class="project-desc-toggle" onclick="this.parentElement.classList.toggle(\'expanded\'); this.textContent = this.parentElement.classList.contains(\'expanded\') ? \'Ver menos\' : \'Ver mais\'">Ver mais</button>' : ''}
          ${techsHtml ? `<div class="project-techs">${techsHtml}</div>` : ''}
          ${project.hours ? `<p class="cert-hours"><i class="fas fa-clock"></i> ${project.hours}h</p>` : ''}
          ${linksHtml.length > 0 ? `<div class="project-links">${linksHtml.join('')}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

