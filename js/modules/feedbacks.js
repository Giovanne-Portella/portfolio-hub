// ============================================
// FEEDBACKS — Carrossel de depoimentos
// ============================================
// Busca feedbacks aprovados do Supabase e
// renderiza um Swiper na seção #feedbacks.
//
// ⚠️ Após fazer o deploy do formulário no Netlify,
//    substitua FEEDBACK_FORM_URL pela URL real.
// ============================================

const FEEDBACK_FORM_URL = 'https://feedbacks-forms-gm.netlify.app/';

async function loadFeedbacks() {
  try {
    const { data: feedbacks, error } = await window.supabase
      .from('feedbacks')
      .select('id, name, profession, feedback, linkedin_url, show_linkedin, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error || !feedbacks || feedbacks.length === 0) {
      renderFeedbacksEmpty();
      return;
    }

    renderFeedbacks(feedbacks);
  } catch (_) {
    // silently fail — seção permanece oculta
  }
}

function renderFeedbacks(feedbacks) {
  const section   = document.getElementById('feedbacks');
  const container = document.getElementById('feedbacks-container');
  const ctaLink   = document.getElementById('feedbacks-cta-link');

  if (!section || !container) return;

  // Preenche os slides
  container.innerHTML = feedbacks.map(buildSlide).join('');

  // Atualiza o link do CTA
  if (ctaLink && FEEDBACK_FORM_URL !== '#') {
    ctaLink.href = FEEDBACK_FORM_URL;
  }

  // Exibe a seção
  section.style.display = '';

  // Inicializa Swiper (aguarda o DOM estar pronto)
  requestAnimationFrame(() => {
    new Swiper('.feedbacks-swiper', {
      slidesPerView: 1,
      spaceBetween: 20,
      grabCursor: true,
      loop: feedbacks.length > 3,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: '.feedbacks-pagination',
        clickable: true,
      },
      navigation: {
        prevEl: '.feedbacks-prev',
        nextEl: '.feedbacks-next',
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },
    });
  });

  // Adiciona link de Feedbacks ao navbar dinâmicamente
  addFeedbackNavLink();
}

function renderFeedbacksEmpty() {
  // Se não há feedbacks aprovados, exibe a seção mesmo assim
  // só com o CTA para incentivar o primeiro feedback
  const section   = document.getElementById('feedbacks');
  const container = document.getElementById('feedbacks-container');
  const ctaLink   = document.getElementById('feedbacks-cta-link');

  if (!section || !container) return;
  if (FEEDBACK_FORM_URL === '#') return; // só exibe se o link estiver configurado

  container.innerHTML = `
    <div class="feedbacks-empty">
      <i class="fas fa-comment-slash"></i>
      <p>Ainda não há feedbacks. Seja o primeiro!</p>
    </div>`;

  if (ctaLink) ctaLink.href = FEEDBACK_FORM_URL;

  section.style.display = '';
  addFeedbackNavLink();
}

function detectSocial(url) {
  try {
    const host = new URL(url.startsWith('http') ? url : 'https://' + url).hostname.replace('www.', '');
    if (host.includes('linkedin.com'))  return { icon: 'fab fa-linkedin',   label: 'LinkedIn'   };
    if (host.includes('instagram.com')) return { icon: 'fab fa-instagram',  label: 'Instagram'  };
    if (host.includes('github.com'))    return { icon: 'fab fa-github',     label: 'GitHub'     };
    if (host.includes('x.com') || host.includes('twitter.com')) return { icon: 'fab fa-x-twitter', label: 'X' };
    if (host.includes('youtube.com'))   return { icon: 'fab fa-youtube',    label: 'YouTube'    };
    if (host.includes('facebook.com'))  return { icon: 'fab fa-facebook',   label: 'Facebook'   };
    if (host.includes('tiktok.com'))    return { icon: 'fab fa-tiktok',     label: 'TikTok'     };
    if (host.includes('discord.com'))   return { icon: 'fab fa-discord',    label: 'Discord'    };
    if (host.includes('telegram.org') || host.includes('t.me')) return { icon: 'fab fa-telegram', label: 'Telegram' };
    if (host.includes('behance.net'))   return { icon: 'fab fa-behance',    label: 'Behance'    };
    if (host.includes('dribbble.com'))  return { icon: 'fab fa-dribbble',   label: 'Dribbble'   };
  } catch (_) {}
  return { icon: 'fas fa-link', label: 'Perfil' };
}

function buildSlide(f) {
  const initials = f.name
    .split(' ')
    .filter(w => w.length > 0)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  const social = (f.show_linkedin && f.linkedin_url) ? detectSocial(f.linkedin_url) : null;
  const socialBadge = social
    ? `<a href="${escapeAttr(f.linkedin_url)}" target="_blank" rel="noopener noreferrer" class="feedback-linkedin">
         <i class="${social.icon}"></i> Ver ${social.label}
       </a>`
    : '';

  return `
    <div class="swiper-slide">
      <div class="feedback-card">
        <div class="feedback-quote"><i class="fas fa-quote-left"></i></div>
        <p class="feedback-text">${escapeHtml(f.feedback)}</p>
        <hr class="feedback-divider">
        <div class="feedback-author">
          <div class="feedback-avatar">${escapeHtml(initials)}</div>
          <div class="feedback-info">
            <span class="feedback-name">${escapeHtml(f.name)}</span>
            <span class="feedback-profession">${escapeHtml(f.profession)}</span>
            ${socialBadge}
          </div>
        </div>
      </div>
    </div>`;
}

function addFeedbackNavLink() {
  // Injeta link de "Feedbacks" no navbar desktop e no menu mobile,
  // apenas se ainda não existir.
  if (document.getElementById('nav-feedbacks-link')) return;

  // Navbar desktop
  const navLinks = document.querySelector('.navbar-links');
  if (navLinks) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="#feedbacks" id="nav-feedbacks-link">Feedbacks</a>';
    navLinks.appendChild(li);
  }

  // Menu mobile
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    const a = document.createElement('a');
    a.href = '#feedbacks';
    a.className = 'mobile-link';
    a.textContent = 'Feedbacks';
    mobileMenu.appendChild(a);
  }
}
