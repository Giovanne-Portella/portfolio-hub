// ============================================
// GITHUB DATA & TECH STATS
// ============================================

// Known language colors (GitHub style)
const LANG_COLORS = {
  'JavaScript': '#f1e05a',
  'TypeScript': '#3178c6',
  'Python': '#3572A5',
  'Java': '#b07219',
  'PHP': '#4F5D95',
  'C#': '#178600',
  'C++': '#f34b7d',
  'C': '#555555',
  'Ruby': '#701516',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'Dart': '#00B4AB',
  'Vue': '#41b883',
  'Svelte': '#ff3e00',
  'Lua': '#000080',
  'R': '#198CE7',
  'Elixir': '#6e4a7e',
  'Scala': '#c22d40',
  'HTML': '#e34c26',
  'HTML5': '#e34c26',
  'CSS': '#563d7c',
  'CSS3': '#563d7c',
  'Supabase': '#3ecf8e',
  'Netlify': '#00c7b7',
  'React': '#61dafb',
  'Node.js': '#339933',
  'Node': '#339933',
  'Angular': '#dd0031',
  'Next.js': '#ffffff',
  'Docker': '#2496ed',
  'PostgreSQL': '#336791',
  'MongoDB': '#47a248',
  'MySQL': '#4479a1',
  'Firebase': '#ffca28',
  'Tailwind': '#06b6d4',
  'Bootstrap': '#7952b3',
  'Git': '#f05032',
  'Linux': '#fcc624',
  'AWS': '#ff9900',
  'Azure': '#0078d4',
};

async function loadGitHubData(username) {
  const statsEl = document.getElementById('github-stats');

  try {
    // Fetch user profile + repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`),
    ]);


    if (!userRes.ok) throw new Error('GitHub user not found');
    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    // Basic stats
    document.getElementById('gh-public-repos').textContent = user.public_repos || 0;
    document.getElementById('gh-followers').textContent = user.followers || 0;

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    document.getElementById('gh-stars').textContent = totalStars;

    statsEl.style.display = '';

    // Commits per week (from contributions API)
    try {
      const contribRes = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`);
      if (contribRes.ok) {
        const contribData = await contribRes.json();
        const contributions = contribData.contributions || [];
        // Last 4 weeks average
        const last28 = contributions.slice(-28);
        const totalLast28 = last28.reduce((s, d) => s + d.count, 0);
        const avgPerWeek = Math.round(totalLast28 / 4);
        document.getElementById('gh-commits-week').textContent = avgPerWeek;
      }
    } catch {}

    // Build tech badges from repos + projects
    await buildTechBadges(repos);

    // Load organizations
    await loadGitHubOrgs(username);

    // GitHub profile link
    const linkContainer = document.getElementById('gh-profile-link-container');
    linkContainer.innerHTML = `
      <a href="https://github.com/${escapeAttr(username)}" target="_blank" rel="noopener noreferrer" class="github-profile-link">
        <i class="fab fa-github"></i> Ver perfil no GitHub
      </a>`;
    linkContainer.style.display = '';

  } catch (err) {
    console.error('Erro ao carregar dados do GitHub:', err);
  }
}

async function buildTechBadges(repos) {
  const wrapper = document.getElementById('tech-stats-wrapper');
  const grid = document.getElementById('tech-stats-grid');

  const techSet = new Set();

  // 1) Languages from GitHub repos (skip forks)
  repos.forEach(r => {
    if (r.fork) return;
    if (r.language) techSet.add(r.language);
  });

  // 2) Technologies from Supabase projects
  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('technologies');

    if (projects) {
      projects.forEach(p => {
        (p.technologies || []).forEach(t => {
          const name = t.trim();
          if (name) techSet.add(name);
        });
      });
    }
  } catch {}

  if (techSet.size === 0) return;

  const fallbackColors = ['#58a6ff', '#39d353', '#f0883e', '#bc8cff', '#ff6b6b', '#79c0ff', '#56d4dd', '#e3b341', '#f778ba', '#8b949e'];

  const techs = Array.from(techSet).sort((a, b) => a.localeCompare(b));

  grid.innerHTML = techs.map((tech, i) => {
    const color = LANG_COLORS[tech] || fallbackColors[i % fallbackColors.length];
    return `
      <div class="tech-badge" style="border-color:${color}">
        <span class="tech-badge-dot" style="background:${color}"></span>
        <span class="tech-badge-name">${escapeHtml(tech)}</span>
      </div>
    `;
  }).join('');

  wrapper.style.display = '';
}

// ============================================
// GITHUB ORGANIZATIONS
// ============================================
async function loadGitHubOrgs(username) {
  const wrapper = document.getElementById('gh-orgs-wrapper');
  const grid = document.getElementById('gh-orgs-grid');
  if (!wrapper || !grid) return;

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/orgs`);
    if (!res.ok) return;
    const orgs = await res.json();
    if (!Array.isArray(orgs) || orgs.length === 0) return;

    grid.innerHTML = orgs.map(org => `
      <a href="https://github.com/${escapeAttr(org.login)}" target="_blank" rel="noopener noreferrer" class="gh-org-card">
        <img src="${escapeAttr(org.avatar_url)}" alt="${escapeAttr(org.login)}" class="gh-org-avatar">
        <div class="gh-org-info">
          <span class="gh-org-name">${escapeHtml(org.login)}</span>
          ${org.description ? `<span class="gh-org-desc">${escapeHtml(org.description)}</span>` : ''}
        </div>
      </a>
    `).join('');

    wrapper.style.display = '';
  } catch {}
}

