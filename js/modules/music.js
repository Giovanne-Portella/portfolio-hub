// ============================================
// MUSIC REACTOR — Smooth ambient glow
// ============================================
const musicReactor = {
  active:   false,
  rafId:    null,
  el:       null,
  glowBass: null,
  glowMid:  null,
  glowTreble: null,

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

    // Cada camada oscila em períodos longos e primos entre si
    // para nunca se sincronizarem completamente — fluxo orgânico e contínuo
    const t = performance.now() / 1000;

    // Bass: ciclo lento de ~8s, nunca some completamente (mín 0.18)
    const bass = 0.18 +
      0.38 * (0.5 + 0.5 * Math.sin(t * 0.78)) *
      (0.85 + 0.15 * Math.sin(t * 0.31 + 1.2));

    // Mid: ciclo ~11s, levemente defasado
    const mid = 0.12 +
      0.32 * (0.5 + 0.5 * Math.sin(t * 0.57 + 2.1)) *
      (0.80 + 0.20 * Math.sin(t * 0.23 + 0.7));

    // Treble: ciclo ~6s, mais rápido que os outros mas ainda suave
    const treble = 0.08 +
      0.28 * (0.5 + 0.5 * Math.sin(t * 1.05 + 4.3)) *
      (0.75 + 0.25 * Math.sin(t * 0.41 + 2.9));

    this.glowBass.style.opacity   = bass.toFixed(3);
    this.glowMid.style.opacity    = mid.toFixed(3);
    this.glowTreble.style.opacity = treble.toFixed(3);

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
      onError: onYTError,
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
  const buffering = event.data === YT.PlayerState.BUFFERING;
  const playerEl = document.getElementById('music-player');

  // Clear any pending buffering watchdog
  clearTimeout(window._ytBufferWatchdog);

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

  // If stuck buffering for more than 8 s, auto-skip (restricted/geo-blocked video)
  if (buffering) {
    window._ytBufferWatchdog = setTimeout(() => {
      const state = ytPlayer && typeof ytPlayer.getPlayerState === 'function'
        ? ytPlayer.getPlayerState()
        : -1;
      if (state === YT.PlayerState.BUFFERING) skipTrack();
    }, 8000);
  }
}

// Video unavailable / embedding disabled → skip immediately
function onYTError() {
  clearTimeout(window._ytBufferWatchdog);
  skipTrack();
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
