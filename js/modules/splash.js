// ============================================
// SPLASH SCREEN — Linux Terminal Boot
// ============================================
const splashBootLines = [
  { status: 'ok',   text: 'Initializing system...' },
  { status: 'ok',   text: 'Loading kernel modules...' },
  { status: 'ok',   text: 'Mounting file system...' },
  { status: 'ok',   text: 'Starting network daemon...' },
  { status: 'ok',   text: 'Connecting to Supabase...' },
  { status: 'ok',   text: 'Fetching portfolio data...' },
  { status: 'ok',   text: 'Loading certificates...' },
  { status: 'ok',   text: 'Loading projects...' },
  { status: 'ok',   text: 'Compiling stylesheets...' },
  { status: 'ok',   text: 'Rendering components...' },
  { status: 'info', text: 'All systems operational.' },
];

const splashWelcomeMsg = 'Seja muito bem vindo ao meu cantinho profissional e acadêmico! Aqui você poderá acompanhar os meus projetos e novas qualificações na área da tecnologia!';

let splashAudioCtx = null;

function playKeystroke() {
  if (!splashAudioCtx) return;
  try {
    const dur = 0.035 + Math.random() * 0.015;
    const bufLen = Math.floor(splashAudioCtx.sampleRate * dur);
    const buf = splashAudioCtx.createBuffer(1, bufLen, splashAudioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 4);
    }
    const src = splashAudioCtx.createBufferSource();
    src.buffer = buf;
    const gain = splashAudioCtx.createGain();
    gain.gain.value = 0.06 + Math.random() * 0.03;
    const filter = splashAudioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800 + Math.random() * 1200;
    filter.Q.value = 0.8;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(splashAudioCtx.destination);
    src.start();
  } catch (_) {}
}

function setupSplashScreen() {
  const overlay = document.getElementById('splash-overlay');
  if (!overlay) return;

  const hasVisited = localStorage.getItem('portfolio_visited');

  if (hasVisited) {
    // Return visit — quick welcome back, auto-dismiss
    runReturnSplash(overlay);
  } else {
    // First visit — full boot sequence
    runFirstVisitSplash(overlay);
  }
}

function runFirstVisitSplash(overlay) {
  const body = document.getElementById('splash-body');
  const hint = document.getElementById('splash-click-hint');
  const prompt = document.getElementById('splash-prompt');

  const startBoot = () => {
    overlay.removeEventListener('click', startBoot);
    hint.style.display = 'none';

    try {
      splashAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (splashAudioCtx.state === 'suspended') splashAudioCtx.resume();
    } catch (_) {}

    const cursor = prompt.querySelector('.splash-cursor');
    if (cursor) cursor.remove();

    runBootSequence(body);
  };

  overlay.addEventListener('click', startBoot);
}

function runReturnSplash(overlay) {
  const body = document.getElementById('splash-body');
  const hint = document.getElementById('splash-click-hint');
  const prompt = document.getElementById('splash-prompt');

  // Hide hint and prompt
  if (hint) hint.style.display = 'none';
  if (prompt) prompt.style.display = 'none';

  // Show welcome back message with typing effect
  const welcomeEl = document.createElement('div');
  welcomeEl.className = 'splash-welcome-text';
  welcomeEl.style.marginTop = '0';
  body.appendChild(welcomeEl);

  const msg = 'Seja bem vindo novamente!';
  let i = 0;
  let typingDone = false;

  function typeChar() {
    if (i < msg.length) {
      welcomeEl.innerHTML = msg.substring(0, i + 1) + '<span class="splash-welcome-cursor">█</span>';
      i++;
      setTimeout(typeChar, 35 + Math.random() * 25);
    } else {
      welcomeEl.textContent = msg;
      typingDone = true;
      // Auto-dismiss after short pause — but overlay itself becomes clickable too
      setTimeout(() => dismissSplash(), 1800);
    }
  }

  // Allow user to click/tap to dismiss early (guarantees user gesture for autoplay)
  overlay.addEventListener('click', () => {
    if (typingDone || i > 0) dismissSplash();
  }, { once: true });

  // Small delay then start typing
  setTimeout(typeChar, 500);
}

async function runBootSequence(body) {
  // Phase 1: Boot lines with progress bar
  const progressDiv = document.createElement('div');
  progressDiv.innerHTML = `
    <div class="splash-progress-container">
      <div class="splash-progress-bar"><div class="splash-progress-fill" id="splash-fill"></div></div>
      <span class="splash-progress-pct" id="splash-pct">0%</span>
    </div>`;
  body.appendChild(progressDiv);

  const fill = document.getElementById('splash-fill');
  const pct = document.getElementById('splash-pct');

  for (let i = 0; i < splashBootLines.length; i++) {
    const line = splashBootLines[i];
    const el = document.createElement('div');
    el.className = 'splash-boot-line';

    let tag = '';
    if (line.status === 'ok') tag = '<span class="splash-ok">[ OK ]</span>';
    else if (line.status === 'fail') tag = '<span class="splash-fail">[FAIL]</span>';
    else tag = '<span class="splash-info">[INFO]</span>';

    el.innerHTML = `${tag} ${line.text}`;
    body.insertBefore(el, progressDiv);

    const progress = Math.round(((i + 1) / splashBootLines.length) * 100);
    fill.style.width = progress + '%';
    pct.textContent = progress + '%';

    // Auto-scroll terminal body
    body.scrollTop = body.scrollHeight;

    await sleep(120 + Math.random() * 180);
  }

  await sleep(400);

  // Phase 2: Welcome message typing
  const welcomeEl = document.createElement('div');
  welcomeEl.className = 'splash-welcome-text';
  welcomeEl.innerHTML = '<span class="splash-welcome-cursor">█</span>';
  body.appendChild(welcomeEl);
  body.scrollTop = body.scrollHeight;

  await sleep(300);

  let typed = '';
  for (let i = 0; i < splashWelcomeMsg.length; i++) {
    typed += splashWelcomeMsg[i];
    welcomeEl.innerHTML = typed + '<span class="splash-welcome-cursor">█</span>';
    playKeystroke();
    body.scrollTop = body.scrollHeight;
    await sleep(25 + Math.random() * 20);
  }

  // Remove cursor
  await sleep(200);
  welcomeEl.textContent = splashWelcomeMsg;

  // Phase 3: Show "Prosseguir" button
  const btnDiv = document.createElement('div');
  btnDiv.className = 'splash-btn-container';
  btnDiv.innerHTML = '<button class="splash-btn" id="splash-proceed">▸ Prosseguir</button>';
  body.appendChild(btnDiv);
  body.scrollTop = body.scrollHeight;

  document.getElementById('splash-proceed').addEventListener('click', (e) => {
    e.stopPropagation();
    dismissSplash();
  });
}

function dismissSplash() {
  const overlay = document.getElementById('splash-overlay');
  overlay.classList.add('dismissed');

  // Mark as visited so next load gets the quick splash
  localStorage.setItem('portfolio_visited', '1');

  // Reveal site content
  document.body.classList.remove('site-loading');
  document.body.classList.add('site-loaded');

  // Clean up audio context
  if (splashAudioCtx) {
    splashAudioCtx.close().catch(() => {});
    splashAudioCtx = null;
  }

  // Signal that the user has interacted and dismissed the splash.
  // _tryStartMusic() will play as soon as the YT player is also ready.
  window._splashDismissed = true;
  if (typeof _tryStartMusic === 'function') _tryStartMusic();

  // Remove overlay from DOM after transition
  setTimeout(() => overlay.remove(), 1000);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

