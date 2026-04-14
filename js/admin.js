// ============================================
// Admin Panel - CRUD Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupModals();
  setupProfileForm();
  setupSocialForm();
  setupCategoryForm();
  setupCertificateForm();
  setupCertProjectFiles();
  setupProjectForm();
  setupCompanyForm();
  setupRadioForm();
  setupAvatarEditor();
  setupFeedbacksAdmin();

  // Initial data load
  loadProfile();
  loadSocialLinks();
  loadCategories();
  loadCertificates();
  loadProjects();
  loadCompaniesAdmin();
  loadRadioTracksAdmin();
  loadAvatarConfig();
  loadFeedbacksAdmin();
});

