// ============================================
// MUSIC REACTOR — Reactive ambient glow
// ============================================
const musicReactor = {
  active: false,
  rafId: null,
  el: null,
  glowBass: null,
  glowMid: null,
  glowTreble: null,
  bassSmooth: 0,
  midSmooth: 0,
  trebleSmooth: 0,

  init() {
    this.el = document.getElementById('music-reactor');
    if (!this.el) return;
    this.glowBass = this.el.querySelector('.reactor-glow-bass');
    this.glowMid = this.el.querySelector('.reactor-glow-mid');
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
    const now = performance.now() / 1000;

    // Simulated frequency bands
    const bass = Math.max(0,
      0.4 * Math.sin(now * 1.1) +
      0.3 * Math.sin(now * 1.7 + 0.7) +
      0.15 * Math.sin(now * 0.5 + 2.1) +
      0.1 * Math.sin(now * 3.2) +
      0.05
    );
    const mid = Math.max(0,
      0.35 * Math.sin(now * 2.6 + 1.0) +
      0.25 * Math.sin(now * 3.8 + 0.3) +
      0.2 * Math.sin(now * 1.4 + 1.8) +
      0.1 * Math.sin(now * 5.0) +
      0.1
    );
    const treble = Math.max(0,
      0.3 * Math.sin(now * 6.5 + 0.5) +
      0.25 * Math.sin(now * 8.8 + 1.2) +
      0.2 * Math.sin(now * 5.0 + 2.8) +
      0.15 * Math.sin(now * 11.5) +
      0.1
    );

    // Smooth
    this.bassSmooth += (bass - this.bassSmooth) * 0.08;
    this.midSmooth += (mid - this.midSmooth) * 0.12;
    this.trebleSmooth += (treble - this.trebleSmooth) * 0.18;

    // Glow — more visible intensities
    this.glowBass.style.opacity = Math.min(this.bassSmooth * 0.9, 0.65);
    this.glowMid.style.opacity = Math.min(this.midSmooth * 0.7, 0.5);
    this.glowTreble.style.opacity = Math.min(this.trebleSmooth * 0.55, 0.4);

    this.rafId = requestAnimationFrame(() => this.loop());
  }
};

// ============================================
// YOUTUBE FLOATING PLAYER
// ============================================
const YT_TRACKS_FALLBACK = [
  { id: 'W-IzDrJRTo8', name: 'in your arms — mr kitty (slowed & reverb)' },
  { id: 'AHWUez2Tdpk', name: 'Gemini - Time To Share' },
  { id: 'c9P9kkcEcdc', name: 'Mr. Kitty - 44 days' },
  { id: 'SO4GCctPi4U', name: 'Wicked Game | Synthwave Dark Cover' },
];

let YT_TRACKS = [...YT_TRACKS_FALLBACK];
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
    // Fallback to hardcoded tracks silently
  }
}

function loadYouTubePlayer() {
  ytCurrentTrack = YT_TRACKS[Math.floor(Math.random() * YT_TRACKS.length)];
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

  // Music will start when splash screen is dismissed (dismissSplash calls playVideo)
  // If splash is already gone (e.g. returning visit), show player and let user control
  if (!document.getElementById('splash-overlay')) {
    document.getElementById('music-player').classList.add('visible');
    const tryAutoplay = () => {
      if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
      }
      document.removeEventListener('click', tryAutoplay);
      document.removeEventListener('scroll', tryAutoplay);
      document.removeEventListener('keydown', tryAutoplay);
    };
    document.addEventListener('click', tryAutoplay, { once: false });
    document.addEventListener('scroll', tryAutoplay, { once: false });
    document.addEventListener('keydown', tryAutoplay, { once: false });
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

  // When track ends, play a different random track
  if (ended) {
    let next;
    do {
      next = YT_TRACKS[Math.floor(Math.random() * YT_TRACKS.length)];
    } while (next.id === ytCurrentTrack.id && YT_TRACKS.length > 1);
    ytCurrentTrack = next;
    document.getElementById('music-track-name').textContent = next.name;
    ytPlayer.loadVideoById(next.id);
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
