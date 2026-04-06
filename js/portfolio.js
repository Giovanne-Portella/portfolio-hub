// ============================================
// Portfolio - Public Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadSocialLinks();
  loadCertificates();
  loadProjects();
  loadCompanies();
  setupNavbar();
  setupModal();
  setupCollapsible();
  setupTypeInAnimation();
  setupSplashScreen();

  document.getElementById('footer-year').textContent = new Date().getFullYear();
});

