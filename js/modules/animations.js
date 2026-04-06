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
  // Generation counter — if target changes mid-type, old loop dies
  el._typeGen = (el._typeGen || 0) + 1;
  const gen = el._typeGen;

  el.dataset.typeTarget = el.textContent;
  el.textContent = '';
  el.classList.add('visible', 'typing', 'typed');

  let i = 0;

  function typeChar() {
    // Abort if a newer typeElement call started or target was swapped
    if (el._typeGen !== gen) return;

    const target = el.dataset.typeTarget;
    const len = target.length || 1;
    // Recalculate speed each tick so async text swaps get the right pace
    const speed = Math.min(35, Math.max(3, 1200 / len));

    if (i < target.length) {
      el.textContent = target.substring(0, i + 1);
      i++;
      setTimeout(typeChar, speed);
    } else {
      setTimeout(() => el.classList.remove('typing'), 400);
    }
  }

  typeChar();
}

