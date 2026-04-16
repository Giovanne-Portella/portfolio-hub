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

  // Cache para o modal
  _feedbacksData = feedbacks;

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
    const swiper = new Swiper('.feedbacks-swiper', {
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
        640: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 },
      },
    });

    // Retoma autoplay ao navegar para outro slide
    swiper.on('slideChange', () => swiper.autoplay.start());

    // Botões "Ver mais / Ver menos"
    // "Ver mais" → abre modal com feedback completo
    document.querySelectorAll('.feedback-read-more').forEach(btn => {
      const textEl = btn.previousElementSibling;

      // Esconde o botão se o texto não estiver sendo cortado
      if (textEl && textEl.scrollHeight <= textEl.clientHeight + 2) {
        btn.style.display = 'none';
        return;
      }

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.closest('.swiper-slide').dataset.feedbackId;
        openFeedbackModal(id);
        swiper.autoplay.stop();
      });
    });
  });

  // Configura o modal (só uma vez)
  setupFeedbackModal();

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

  return `
    <div class="swiper-slide" data-feedback-id="${escapeAttr(f.id)}">
      <div class="feedback-card">
        <div class="feedback-quote"><i class="fas fa-quote-left"></i></div>
        <div class="feedback-text-wrapper">
          <p class="feedback-text">${escapeHtml(f.feedback)}</p>
          <button type="button" class="feedback-read-more">▼ Ver mais</button>
        </div>
        <hr class="feedback-divider">
        <div class="feedback-author">
          <div class="feedback-avatar">${escapeHtml(initials)}</div>
          <div class="feedback-info">
            <span class="feedback-name">${escapeHtml(f.name)}</span>
            <span class="feedback-profession">${escapeHtml(f.profession)}</span>
            ${social ? `<span class="feedback-linkedin"><i class="${social.icon}"></i> ${social.label}</span>` : ''}
          </div>
        </div>
      </div>
    </div>`;
}

// ============================================
// MODAL de feedback completo
// ============================================
let _feedbacksData = [];   // cache para o modal

function openFeedbackModal(id) {
  const f = _feedbacksData.find(x => x.id === id);
  if (!f) return;

  const initials = f.name
    .split(' ').filter(w => w.length > 0)
    .slice(0, 2).map(w => w[0].toUpperCase()).join('');

  document.getElementById('fm-avatar').textContent     = initials;
  document.getElementById('fm-name').textContent       = f.name;
  document.getElementById('fm-profession').textContent = f.profession;
  document.getElementById('fm-text').textContent       = f.feedback;

  const socialEl = document.getElementById('fm-social');
  if (f.show_linkedin && f.linkedin_url) {
    const s = detectSocial(f.linkedin_url);
    document.getElementById('fm-social-icon').className  = s.icon;
    document.getElementById('fm-social-label').textContent = `Ver ${s.label}`;
    socialEl.href = f.linkedin_url;
    socialEl.style.display = '';
  } else {
    socialEl.style.display = 'none';
  }

  document.getElementById('feedback-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFeedbackModal() {
  document.getElementById('feedback-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function setupFeedbackModal() {
  const overlay = document.getElementById('feedback-modal-overlay');
  if (!overlay) return;

  // Fecha ao clicar fora
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeFeedbackModal();
  });

  // Botões de fechar
  document.getElementById('feedback-modal-close').addEventListener('click', closeFeedbackModal);
  document.getElementById('feedback-modal-btn-close').addEventListener('click', closeFeedbackModal);

  // ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFeedbackModal();
  });
}

function addFeedbackNavLink() {
  // Injeta link de "Feedbacks" no navbar desktop e no menu mobile,
  // ANTES do link "Contato", apenas se ainda não existir.
  if (document.getElementById('nav-feedbacks-link')) return;

  // Navbar desktop — insere antes do <li> que contém #contact
  const navLinks = document.querySelector('.navbar-links');
  if (navLinks) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="#feedbacks" id="nav-feedbacks-link">Feedbacks</a>';
    const contatoLi = Array.from(navLinks.querySelectorAll('li'))
      .find(el => el.querySelector('a[href="#contact"]'));
    navLinks.insertBefore(li, contatoLi || null);
  }

  // Menu mobile — insere antes do <a href="#contact">
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    const a = document.createElement('a');
    a.href = '#feedbacks';
    a.className = 'mobile-link';
    a.textContent = 'Feedbacks';
    const contatoA = mobileMenu.querySelector('a[href="#contact"]');
    mobileMenu.insertBefore(a, contatoA || null);
  }
}
