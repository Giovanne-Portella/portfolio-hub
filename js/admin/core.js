// ============================================
// NAVIGATION
// ============================================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const sections = document.querySelectorAll('.admin-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.dataset.section;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${target}`).classList.add('active');

      // Close mobile sidebar
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  // Mobile sidebar toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

// ============================================
// MODALS
// ============================================
function setupModals() {
  // Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      document.getElementById(modalId).classList.remove('active');
    });
  });

  // Close on overlay click
  document.querySelectorAll('.admin-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ============================================
// TOAST
// ============================================
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-msg');
  const icon = toast.querySelector('i');

  msg.textContent = message;
  toast.classList.toggle('error', isError);
  icon.className = isError ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================
// FILE UPLOAD HELPER
// ============================================

// Allowed MIME types per bucket (defense-in-depth — server-side Storage RLS
// is the authoritative gate; this prevents accidental wrong-file uploads).
const ALLOWED_MIME_TYPES = {
  avatars:           ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  resumes:           ['application/pdf'],
  certificates:      ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  projects:          ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  companies:         ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  'project-files':   [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/octet-stream', // .pbix, .ipynb
    'application/json',
    'text/plain',
    'text/xml', 'application/xml',
    'application/zip', 'application/x-rar-compressed', 'application/vnd.rar',
    'text/x-python', 'application/x-python-code',
  ],
};

async function uploadFile(bucket, file) {
  const allowed = ALLOWED_MIME_TYPES[bucket];
  if (allowed && !allowed.includes(file.type)) {
    throw new Error(`Tipo de arquivo não permitido: ${file.type || '(desconhecido)'}`);
  }

  const ext = file.name.split('.').pop().replace(/[^a-zA-Z0-9]/g, '');
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

