// ============================================
// Auth Guard - Protects admin pages
// ============================================

(async function authGuard() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = './login.html';
    return;
  }

  // Store user_id for later use
  window.currentUserId = session.user.id;

  // Setup logout buttons
  document.getElementById('btn-logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.href = './login.html';
  });

  document.getElementById('btn-logout-mobile')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.href = './login.html';
  });

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      window.location.href = './login.html';
    }
  });
})();
