// ============================================
// MUSIC REACTOR — BPM-driven ambient glow
// ============================================

// BPM pode ser alterado aqui (padrão: 120)
const REACTOR_BPM = 120;

const musicReactor = {
  active:       false,
  rafId:        null,
  el:           null,
  glowBass:     null,
  glowMid:      null,
  glowTreble:   null,

  // Envelopes independentes para cada camada (0–1, decaem por frame)
  bassEnv:      0,
  midEnv:       0,
  trebleEnv:    0,

  // Rastreia qual "beat" já foi disparado para evitar re-trigger
  lastBeat:    -1,
  lastHalf:    -1,
  lastEighth:  -1,

  init() {
    this.el = document.getElementById('music-reactor');
    if (!this.el) return;
    this.glowBass   = this.el.querySelector('.reactor-glow-bass');
    this.glowMid    = this.el.querySelector('.reactor-glow-mid');
    this.glowTreble = this.el.querySelector('.reactor-glow-treble');
  },

  start() {
    if (!this.el) this.init();
    if (!this.el) return;
    this.active = true;
    this.el.classList.add('active');
    if (!this.rafId) this.loop();
  },

  stop() {
    this.active = false;
    if (this.el) this.el.classList.remove('active');
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  loop() {
    if (!this.active) return;

    const now       = performance.now() / 1000;
    const bps       = REACTOR_BPM / 60;          // beats por segundo
    const beatPos   = now * bps;                  // posição contínua em beats
    const beatIndex = Math.floor(beatPos);        // índice inteiro do beat atual
    const beatPhase = beatPos - beatIndex;        // 0..1 dentro do beat atual

    // ── Posição dentro do compasso de 4/4 ──
    const barBeat   = beatIndex % 4;              // 0,1,2,3 dentro do compasso

    // -- KICK: beats 0 e 2 de cada compasso (down-beat)
    if (beatIndex !== this.lastBeat && (barBeat === 0 || barBeat === 2)) {
      this.bassEnv  = 1.0;
      this.midEnv   = Math.max(this.midEnv, 0.45);
      this.lastBeat = beatIndex;
    }

    // -- SNARE: beats 1 e 3 (off-beat) — dispara mid + leve treble
    const halfIndex = Math.floor(beatPos);
    if (beatIndex !== this.lastHalf && (barBeat === 1 || barBeat === 3)) {
      this.midEnv    = 1.0;
      this.trebleEnv = Math.max(this.trebleEnv, 0.55);
      this.lastHalf  = beatIndex;
    }

    // -- HI-HAT: a cada 1/2 beat (colcheias) — treble rápido
    const eighthIndex = Math.floor(beatPos * 2);
    if (eighthIndex !== this.lastEighth) {
      this.trebleEnv = Math.max(this.trebleEnv, 0.70);
      this.lastEighth = eighthIndex;
    }

    // ── Decaimento exponencial por frame (~60fps) ──
    // Kick decai lento (boom prolongado), treble decai rápido (click seco)
    this.bassEnv   *= 0.955;   // ~1.2s para zerar
    this.midEnv    *= 0.930;   // ~0.7s
    this.trebleEnv *= 0.880;   // ~0.35s — seco como hi-hat

    // ── Breath: oscilação suave entre os beats para não ficar "morto" ──
    const breath = 0.10 + 0.06 * Math.sin(now * bps * Math.PI);

    // ── Opacidades finais ──
    this.glowBass.style.opacity   = Math.min(this.bassEnv   * 0.92 + breath, 0.92);
    this.glowMid.style.opacity    = Math.min(this.midEnv    * 0.82 + breath * 0.6, 0.85);
    this.glowTreble.style.opacity = Math.min(this.trebleEnv * 0.75,           0.78);

    this.rafId = requestAnimationFrame(() => this.loop());
  }
};

// ============================================
// YOUTUBE FLOATING PLAYER
// ============================================
let YT_TRACKS = [];
let ytShuffle = localStorage.getItem('portfolio_shuffle') !== 'false'; // default true
let ytTrackIndex = 0;
let ytPlayer = null;
let ytIsPlaying = false;
let ytCurrentTrack = null;
let ytVolume = parseInt(localStorage.getItem('portfolio_volume') ?? '100', 10);

async function loadRadioTracks() {
  try {
    const { data, error } = await supabase
      .from('radio_tracks')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      YT_TRACKS = data.map(t => ({ id: t.youtube_id, name: t.name }));
    }
  } catch (e) {
    // No tracks available
  }
}

function pickNextTrack() {
  if (YT_TRACKS.length === 0) return null;
  if (ytShuffle) {
    let next;
    do {
      next = YT_TRACKS[Math.floor(Math.random() * YT_TRACKS.length)];
    } while (next.id === (ytCurrentTrack && ytCurrentTrack.id) && YT_TRACKS.length > 1);
    ytTrackIndex = YT_TRACKS.indexOf(next);
    return next;
  } else {
    ytTrackIndex = (ytTrackIndex + 1) % YT_TRACKS.length;
    return YT_TRACKS[ytTrackIndex];
  }
}

function skipTrack() {
  const next = pickNextTrack();
  if (!next || !ytPlayer) return;
  ytCurrentTrack = next;
  document.getElementById('music-track-name').textContent = next.name;
  ytPlayer.loadVideoById(next.id);
}

function loadYouTubePlayer() {
  if (YT_TRACKS.length === 0) return;
  if (ytShuffle) {
    ytTrackIndex = Math.floor(Math.random() * YT_TRACKS.length);
  }
  ytCurrentTrack = YT_TRACKS[ytTrackIndex];
  document.getElementById('music-track-name').textContent = ytCurrentTrack.name;

  // Load the YouTube IFrame API
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

// YouTube IFrame API calls this globally when ready
window.onYouTubeIframeAPIReady = () => {
  ytPlayer = new YT.Player('yt-player-container', {
    height: '0',
    width: '0',
    videoId: ytCurrentTrack.id,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
    },
    events: {
      onReady: onYTPlayerReady,
      onStateChange: onYTStateChange,
    },
  });
};

function onYTPlayerReady() {
  // Apply saved volume
  if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
    ytPlayer.setVolume(ytVolume);
  }
  updateVolumeUI(ytVolume);

  // Signal that the player is ready, then attempt to play
  window._ytPlayerReady = true;
  _tryStartMusic();
}

// Called both from onYTPlayerReady and from dismissSplash.
// Only actually plays when BOTH the player is ready AND the splash was dismissed.
function _tryStartMusic() {
  if (!window._ytPlayerReady) return;         // player not loaded yet
  if (!window._splashDismissed) return;       // user hasn't cleared the splash yet

  document.getElementById('music-player')?.classList.add('visible');

  if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
    ytPlayer.playVideo();
  }
}

function onYTStateChange(event) {
  const playing = event.data === YT.PlayerState.PLAYING;
  const ended = event.data === YT.PlayerState.ENDED;
  const playerEl = document.getElementById('music-player');

  if (playing && !ytIsPlaying) {
    ytIsPlaying = true;
    updateMusicIcon();
    showMusicToast(ytCurrentTrack.name);
    musicReactor.start();
    if (playerEl) playerEl.classList.add('playing');
  } else if (!playing && ytIsPlaying) {
    ytIsPlaying = false;
    updateMusicIcon();
    musicReactor.stop();
    if (playerEl) playerEl.classList.remove('playing');
  }

  // When track ends, play next track
  if (ended) {
    skipTrack();
  }
}

function updateMusicIcon() {
  const icon = document.getElementById('music-toggle-icon');
  icon.className = ytIsPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function showMusicToast(name) {
  let toast = document.getElementById('music-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'music-toast';
    toast.className = 'music-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fas fa-music"></i> Tocando: ${escapeHtml(name)}`;
  toast.classList.add('show');
  // Dismiss on tap (mobile)
  toast.ontouchstart = () => toast.classList.remove('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// Volume UI helpers
function updateVolumeUI(vol) {
  const fill = document.getElementById('music-volume-fill');
  const input = document.getElementById('music-volume-input');
  const icon = document.getElementById('music-vol-icon');
  const label = document.getElementById('music-volume-label');
  const track = fill ? fill.parentElement : null;
  if (fill) fill.style.height = vol + '%';
  if (track) track.style.setProperty('--thumb-pos', vol + '%');
  if (input) input.value = vol;
  if (label) label.textContent = vol;
  if (icon) {
    if (vol === 0) icon.className = 'fas fa-volume-mute';
    else if (vol < 50) icon.className = 'fas fa-volume-down';
    else icon.className = 'fas fa-volume-up';
  }
}

function setVolume(vol) {
  ytVolume = Math.max(0, Math.min(100, vol));
  if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
    ytPlayer.setVolume(ytVolume);
  }
  localStorage.setItem('portfolio_volume', String(ytVolume));
  updateVolumeUI(ytVolume);
}

// Toggle button & init
document.addEventListener('DOMContentLoaded', async () => {
  // Load tracks from Supabase before starting YT
  await loadRadioTracks();

  const btn = document.getElementById('music-toggle');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
        if (ytIsPlaying) {
          ytPlayer.pauseVideo();
        } else {
          ytPlayer.playVideo();
        }
      }
    });
  }

  // Shuffle toggle
  const shuffleBtn = document.getElementById('music-shuffle');
  if (shuffleBtn) {
    if (ytShuffle) shuffleBtn.classList.add('active');
    else shuffleBtn.classList.remove('active');
    shuffleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ytShuffle = !ytShuffle;
      localStorage.setItem('portfolio_shuffle', String(ytShuffle));
      shuffleBtn.classList.toggle('active', ytShuffle);
    });
  }

  // Skip track
  const skipBtn = document.getElementById('music-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      skipTrack();
    });
  }

  // ---- Collapse / expand logic ----
  const playerEl  = document.getElementById('music-player');
  const controls  = document.getElementById('music-controls');
  let collapseTimer = null;

  function scheduleCollapse(delay) {
    clearTimeout(collapseTimer);
    collapseTimer = setTimeout(() => {
      playerEl.classList.add('collapsed');
      closeVolume();
    }, delay);
  }

  // ---- Volume control ----
  const volBtn = document.getElementById('music-vol-btn');
  const volInput = document.getElementById('music-volume-input');
  const volPopup = document.getElementById('music-volume-popup');
  let volOpen = false;

  function openVolume() {
    volOpen = true;
    playerEl.classList.add('vol-open');
    clearTimeout(collapseTimer);
  }

  function closeVolume() {
    volOpen = false;
    playerEl.classList.remove('vol-open');
  }

  if (volBtn) {
    volBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (volOpen) {
        closeVolume();
        scheduleCollapse(2000);
      } else {
        openVolume();
      }
    });
    volBtn.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
  }

  if (volPopup) {
    // Prevent any interaction on the popup from collapsing the player
    volPopup.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    volPopup.addEventListener('mousedown', (e) => e.stopPropagation());
    volPopup.addEventListener('click', (e) => e.stopPropagation());
  }

  if (volInput) {
    volInput.addEventListener('input', (e) => {
      e.stopPropagation();
      setVolume(parseInt(e.target.value, 10));
    });
    volInput.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    volInput.addEventListener('mousedown', (e) => e.stopPropagation());
    volInput.addEventListener('change', (e) => e.stopPropagation());
  }

  // Close volume popup when clicking/tapping outside
  document.addEventListener('click', (e) => {
    if (volOpen && !volPopup.contains(e.target) && e.target !== volBtn && !volBtn.contains(e.target)) {
      closeVolume();
      scheduleCollapse(1500);
    }
  });

  // Initialize volume UI with saved value
  updateVolumeUI(ytVolume);

  // Auto-collapse 2s after the player becomes visible
  const visibleObserver = new MutationObserver(() => {
    if (playerEl.classList.contains('visible')) {
      visibleObserver.disconnect();
      scheduleCollapse(2000);
    }
  });
  visibleObserver.observe(playerEl, { attributes: true, attributeFilter: ['class'] });
  // Handle case where it's already visible
  if (playerEl.classList.contains('visible')) {
    visibleObserver.disconnect();
    scheduleCollapse(2000);
  }

  // Desktop: hover to expand / mouseleave to collapse
  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

  controls.addEventListener('mouseenter', () => {
    if (isTouchDevice()) return;
    clearTimeout(collapseTimer);
    playerEl.classList.remove('collapsed');
  });

  controls.addEventListener('mouseleave', () => {
    if (isTouchDevice()) return;
    if (volOpen) return; // Don't collapse while adjusting volume
    scheduleCollapse(800);
  });

  // Mobile: tap to toggle collapse; tap outside when expanded → collapse
  controls.addEventListener('touchstart', (e) => {
    if (playerEl.classList.contains('collapsed')) {
      // Expand
      e.preventDefault();
      playerEl.classList.remove('collapsed');
      scheduleCollapse(5000);
    }
    // When expanded, touches on the btn are handled normally (play/pause)
  }, { passive: false });

  document.addEventListener('touchstart', (e) => {
    if (!playerEl.classList.contains('collapsed') && !playerEl.contains(e.target)) {
      closeVolume();
      playerEl.classList.add('collapsed');
      clearTimeout(collapseTimer);
    }
  }, { passive: true });

  loadYouTubePlayer();
});
