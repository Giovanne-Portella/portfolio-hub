// ============================================
// TERMINAL TYPING ANIMATION ON SCROLL
// ============================================
function setupTypeInAnimation() {
  const elements = document.querySelectorAll('.type-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
        typeElement(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  elements.forEach(el => observer.observe(el));
}

function typeElement(el) {
  el.dataset.typeTarget = el.textContent;
  el.textContent = '';
  el.classList.add('visible', 'typing', 'typed');

  let i = 0;
  const initialLen = el.dataset.typeTarget.length || 1;
  // Cap total typing time at ~1.2s; short texts get a slight pause per char
  const speed = Math.min(35, Math.max(3, 1200 / initialLen));

  function typeChar() {
    const target = el.dataset.typeTarget;
    if (i < target.length) {
      // Set full prefix each tick so async title updates are picked up correctly
      el.textContent = target.substring(0, i + 1);
      i++;
      setTimeout(typeChar, speed);
    } else {
      // Remove cursor after typing is done
      setTimeout(() => el.classList.remove('typing'), 400);
    }
  }

  typeChar();
}

