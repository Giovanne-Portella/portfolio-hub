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
  setupResumeModal();
  setupCollapsible();
  setupTypeInAnimation();
  setupSplashScreen();

  document.getElementById('footer-year').textContent = new Date().getFullYear();
});

