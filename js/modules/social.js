// ============================================
// SOCIAL LINKS
// ============================================
async function loadSocialLinks() {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) return;

  const heroSocial = document.getElementById('hero-social');
  const footerSocial = document.getElementById('footer-social');

  heroSocial.innerHTML = '';
  footerSocial.innerHTML = '';

  data.forEach(link => {
    const icon = `<a href="${escapeAttr(link.url)}" target="_blank" rel="noopener noreferrer" 
                     class="social-icon" title="${escapeHtml(link.platform)}">
                    <i class="fab ${escapeAttr(link.icon)}"></i>
                  </a>`;
    heroSocial.insertAdjacentHTML('beforeend', icon);
    footerSocial.insertAdjacentHTML('beforeend', icon);
  });
}

