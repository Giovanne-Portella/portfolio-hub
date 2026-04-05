// ============================================
// NAVBAR
// ============================================
function setupNavbar() {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('mobile-menu');

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => menu.classList.remove('active'));
  });

  // Brand click: scroll to top and clear URL params/hash
  const brand = document.querySelector('.navbar-brand');
  if (brand) {
    brand.addEventListener('click', (e) => {
      e.preventDefault();
      history.replaceState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
}

