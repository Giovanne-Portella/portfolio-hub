// ============================================
// Portfolio - Public Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadSocialLinks();
  loadCertificates();
  loadProjects();
  loadCompanies();
  loadFeedbacks();
  setupNavbar();
  setupModal();
  setupResumeModal();
  setupCollapsible();
  setupTypeInAnimation();
  setupSplashScreen();
  setupAvatar(); // Avatar starts with defaults; config applied after profile loads

  document.getElementById('footer-year').textContent = new Date().getFullYear();
});

