// ============================================
// CONTRIBUIÇÃO DE DESENVOLVIMENTO COM EMPRESAS
// ============================================
async function loadCompanies() {
  const section = document.getElementById('companies');
  const grid = document.getElementById('companies-grid');
  if (!section || !grid) return;

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  grid.innerHTML = data.map(company => {
    const logoHtml = company.logo_url
      ? `<img src="${escapeAttr(company.logo_url)}" alt="${escapeAttr(company.name)}" class="company-logo">`
      : `<div class="company-logo-placeholder"><i class="fas fa-building"></i></div>`;

    const descHtml = company.description
      ? `<p class="company-description">${escapeHtml(company.description)}</p>`
      : '';

    const linkHtml = company.website_url
      ? `<a href="${safeUrl(company.website_url)}" target="_blank" rel="noopener noreferrer" class="company-link">
          <i class="fas fa-external-link-alt"></i> Visitar site
        </a>`
      : '';

    return `
      <div class="company-card">
        ${logoHtml}
        <span class="company-name">${escapeHtml(company.name)}</span>
        ${descHtml}
        ${linkHtml}
      </div>
    `;
  }).join('');
}
