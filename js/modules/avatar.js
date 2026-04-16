// ============================================
// PIXEL ART AVATAR — Scroll companion
// Grid: 20×32 logical pixels, 5px each = 100×160 SVG
//
// SVG uses semantic <g> groups so CSS can animate
// each limb independently (Minecraft-style swing):
//   .avatar-left-leg   .avatar-right-leg
//   .avatar-left-arm   .avatar-right-arm
//   .avatar-head
// ============================================

const PX    = 5;
const GW    = 20;
const GH    = 32;
const SVG_W = GW * PX;  // 100
const SVG_H = GH * PX;  // 160

// ── Default config ──────────────────────────
const AVATAR_DEFAULTS = {
  skinTone:     '#f5c5a3',
  hairStyle:    'short',
  hairColor:    '#3a2010',
  beardStyle:   'none',
  beardColor:   '#3a2010',
  eyeColor:     '#3a6ea8',
  shirtStyle:   'tshirt',
  shirtColor:   '#2a4a7f',
  pantsColor:   '#2c3a5a',
  shoeColor:    '#1a1a1a',
  glassesStyle: 'none',
  glassesColor: '#58a6ff',
  accessory:    'none',
  allowedStates: null,   // null = allow all autonomous states
};

// Autonomous states that can be toggled by the user
const ALL_AUTONOMOUS_STATES = ['walk', 'dance', 'bored', 'phone', 'stretch', 'look', 'code', 'wave', 'study', 'think', 'celebrate', 'point'];

// ── Section → state map ──────────────────────
const SECTION_STATES = {
  hero:                  { state: 'wave',      bubble: 'Olá! Seja bem vindo! 👋' },
  about:                 { state: 'idle',      bubble: 'Esse sou eu 😄' },
  'github-contributions':{ state: 'code',      bubble: 'Codar é minha paixão!' },
  projects:              { state: 'code',      bubble: 'Veja o que eu construí! 💻' },
  certificates:          { state: 'study',     bubble: 'Sempre aprendendo! 📚' },
  companies:             { state: 'walk',      bubble: 'Minha jornada profissional.' },
  feedbacks:             { state: 'celebrate', bubble: 'O que falam de mim! 🌟' },
  contact:               { state: 'wave',      bubble: 'Vamos conversar? 💬' },
};

const IDLE_BUBBLES = [
  null, null,
  'Pixel by pixel 🎮',
  'Bom código = arte 🖥️',
  'JavaScript todo dia 💻',
  'Deploy na sexta? 😅',
  null, null,
];

// ── Runtime state ──────────────────────────
let _cfg            = { ...AVATAR_DEFAULTS };
let _state          = 'idle';
let _bubbleTimer    = null;
let _currentSection = 'hero';
let _musicOn        = false;
let _avatarEl       = null;
let _spriteEl       = null;
let _bubbleEl       = null;
let _labelEl        = null;
let _idleTimeout    = null;

// ── Action queue (Fase 1) ──────────────────
let _stateStartTime = 0;          // when current state was applied
let _pendingState   = null;       // { state, bubble, dur } awaiting min-duration
let _pendingTimer   = null;       // timeout id for pending transition

// ── AI context (Fase 3) ────────────────────
// Populated by profile.js / projects.js / certificates.js after Supabase load.
window._avatarCtx = {
  name:     null,   // profile.full_name
  title:    null,   // profile.title
  company:  null,   // profile.company_name
  projects: [],     // string[] — project titles (up to 5)
  certs:    [],     // string[] — certificate names (up to 5)
};

// ============================================
// SVG HELPERS
// ============================================
function p(x, y, w, h, fill) {
  return `<rect x="${x*PX}" y="${y*PX}" width="${w*PX}" height="${h*PX}" fill="${fill}"/>`;
}

// Hex color + alpha 0‥1 → #RRGGBBAA rect
function pa(x, y, w, h, fill, alpha) {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return p(x, y, w, h, fill.substring(0, 7) + a);
}

// ============================================
// AVATAR SVG BUILDER
// ============================================
function buildAvatarSVG(cfg) {
  const c = { ...AVATAR_DEFAULTS, ...cfg };

  // — colours —
  const sk   = c.skinTone;
  const skD  = darken(sk, 22);
  const skDD = darken(sk, 42);
  const skL  = lighten(sk, 14);
  const skLL = lighten(sk, 28);
  const hc   = c.hairColor;
  const hcD  = darken(hc, 28);
  const hcDD = darken(hc, 50);
  const hcL  = lighten(hc, 24);
  const hcLL = lighten(hc, 44);
  const sc   = c.shirtColor;
  const scD  = darken(sc, 26);
  const scL  = lighten(sc, 22);
  const pc   = c.pantsColor;
  const pcD  = darken(pc, 26);
  const shc  = c.shoeColor;
  const shcL = lighten(shc, 28);
  const ec   = c.eyeColor;
  const ecD  = darken(ec, 24);
  const ecL  = lighten(ec, 28);

  // — section buffers —
  const legL  = [];  // left leg + shoe
  const legR  = [];  // right leg + shoe
  const armL  = [];  // left sleeve + hand
  const armR  = [];  // right sleeve + hand
  const torso = [];  // shirt body (no sleeves) + belt
  const head  = [];  // neck up to hair

  // ── GROUND SHADOW ──────────────────────────
  const shadow = `<ellipse cx="${SVG_W/2}" cy="${SVG_H-2}" rx="${SVG_W*0.30}" ry="3.5" fill="rgba(0,0,0,0.20)"/>`;

  // ── LEFT LEG ───────────────────────────────
  legL.push(p(3, 21, 6, 7, pc));
  legL.push(p(3, 21, 1, 7, lighten(pc, 12)));
  legL.push(p(8, 21, 1, 7, pcD));
  legL.push(p(5, 23, 1, 5, darken(pc, 10)));
  legL.push(p(4, 27, 4, 1, darken(pc, 14)));
  legL.push(p(2, 28, 7, 2, shc));
  legL.push(p(2, 27, 6, 1, shcL));
  legL.push(p(2, 28, 1, 2, lighten(shc, 14)));
  legL.push(p(8, 28, 1, 2, darken(shc, 16)));
  legL.push(p(2, 29, 7, 1, darken(shc, 24)));  // sole thickness

  // ── RIGHT LEG ──────────────────────────────
  legR.push(p(11, 21, 6, 7, pc));
  legR.push(p(11, 21, 1, 7, lighten(pc, 12)));
  legR.push(p(16, 21, 1, 7, pcD));
  legR.push(p(14, 23, 1, 5, darken(pc, 10)));
  legR.push(p(12, 27, 4, 1, darken(pc, 14)));
  legR.push(p(11, 28, 7, 2, shc));
  legR.push(p(11, 27, 6, 1, shcL));
  legR.push(p(11, 28, 1, 2, lighten(shc, 14)));
  legR.push(p(17, 28, 1, 2, darken(shc, 16)));
  legR.push(p(11, 29, 7, 1, darken(shc, 24)));

  // ── BELT + CROTCH (static, drawn over legs) ─
  torso.push(p(9,  21, 2, 2, pcD));
  torso.push(p(3,  20, 14, 1, darken(pc, 38)));
  torso.push(p(8,  20, 4,  1, darken(pc, 48)));
  torso.push(p(9,  19, 2,  1, '#c8a040'));
  torso.push(p(9,  19, 1,  1, '#e0c060'));

  // ── SHIRT + ARMS ────────────────────────────
  const addHand = (isLeft) => {
    const buf = isLeft ? armL : armR;
    const hx  = isLeft ? 0 : 18;
    buf.push(p(hx, 15, 2, 3, sk));
    buf.push(p(hx, 15, 1, 3, skL));
    buf.push(p(hx, 15, 2, 1, darken(sk, 6)));  // knuckle line
    buf.push(p(isLeft ? 1 : 19, 17, 1, 1, skD));
  };

  if (c.shirtStyle === 'tshirt') {
    torso.push(p(3, 13, 14, 7, sc));
    torso.push(p(3, 13, 1, 7, scL));
    torso.push(p(16, 13, 1, 7, scD));
    torso.push(p(3, 19, 14, 1, scD));
    torso.push(p(4, 14, 3, 1, lighten(sc, 10)));
    torso.push(p(13, 14, 3, 1, lighten(sc, 10)));
    torso.push(p(8, 13, 4, 1, darken(sc, 32)));
    torso.push(p(9, 14, 2, 1, darken(sc, 24)));
    torso.push(p(9, 15, 1, 4, darken(sc, 14)));
    armL.push(p(1, 13, 2, 5, sc)); armL.push(p(1, 13, 1, 5, scL)); armL.push(p(1, 17, 2, 1, scD));
    armR.push(p(17, 13, 2, 5, sc)); armR.push(p(17, 13, 1, 5, darken(sc,6))); armR.push(p(17, 17, 2, 1, scD));

  } else if (c.shirtStyle === 'hoodie') {
    const hood = darken(sc, 32); const pock = darken(sc, 20);
    torso.push(p(3, 13, 14, 7, sc)); torso.push(p(3, 13, 1, 7, scL)); torso.push(p(16, 13, 1, 7, scD));
    torso.push(p(3, 19, 14, 1, scD)); torso.push(p(5, 12, 10, 2, hood)); torso.push(p(6, 11, 8, 1, hood));
    torso.push(p(6, 12, 1, 2, lighten(hood,14))); torso.push(p(14, 12, 1, 2, darken(hood,12)));
    torso.push(p(9, 13, 2, 7, darken(sc,24))); torso.push(p(9, 13, 2, 1, darken(sc,34)));
    torso.push(p(6, 16, 8, 3, pock)); torso.push(p(6, 16, 1, 3, lighten(pock,12)));
    torso.push(p(7, 16, 6, 1, lighten(pock,7))); torso.push(p(13, 16, 1, 3, darken(pock,10)));
    torso.push(p(8, 13, 1, 3, darken(sc,40))); torso.push(p(11, 13, 1, 3, darken(sc,40)));
    armL.push(p(1, 13, 2, 6, sc)); armL.push(p(1, 13, 1, 6, scL)); armL.push(p(1, 17, 2, 1, hood));
    armR.push(p(17, 13, 2, 6, sc)); armR.push(p(17, 13, 1, 6, darken(sc,6))); armR.push(p(17, 17, 2, 1, hood));

  } else if (c.shirtStyle === 'suit') {
    const tie = '#cc3030';
    torso.push(p(3, 13, 14, 7, sc)); torso.push(p(3, 13, 1, 7, scL)); torso.push(p(16, 13, 1, 7, scD));
    torso.push(p(3, 19, 14, 1, scD)); torso.push(p(8, 13, 4, 6, '#e8e8e8')); torso.push(p(9, 13, 2, 6, '#f5f5f5'));
    torso.push(p(5, 13, 3, 5, scL)); torso.push(p(12, 13, 3, 5, scL));
    torso.push(p(5, 13, 1, 3, darken(sc,10))); torso.push(p(14, 13, 1, 3, darken(sc,10)));
    torso.push(p(5, 16, 3, 2, darken(scL,14)));
    torso.push(p(9, 13, 2, 5, tie)); torso.push(p(9, 13, 2, 1, darken(tie,20)));
    torso.push(p(8, 17, 4, 2, darken(tie,14))); torso.push(p(9, 17, 2, 1, lighten(tie,10)));
    torso.push(p(13, 14, 2, 1, '#fff')); torso.push(p(13, 14, 1, 2, '#ddd'));
    torso.push(p(9, 18, 1, 1, darken(sc,32))); torso.push(p(10, 18, 1, 1, darken(sc,32)));
    armL.push(p(1, 13, 2, 5, sc)); armL.push(p(1, 13, 1, 5, scL)); armL.push(p(1, 17, 2, 1, '#e8e8e8'));
    armR.push(p(17, 13, 2, 5, sc)); armR.push(p(17, 13, 1, 5, darken(sc,6))); armR.push(p(17, 17, 2, 1, '#e8e8e8'));

  } else if (c.shirtStyle === 'polo') {
    torso.push(p(3, 13, 14, 7, sc)); torso.push(p(3, 13, 1, 7, scL)); torso.push(p(16, 13, 1, 7, scD));
    torso.push(p(3, 19, 14, 1, scD)); torso.push(p(7, 12, 6, 2, lighten(sc,20))); torso.push(p(8, 12, 4, 1, lighten(sc,28)));
    torso.push(p(7, 13, 1, 1, scD)); torso.push(p(12, 13, 1, 1, scD));
    torso.push(p(9, 13, 2, 1, darken(sc,30))); torso.push(p(9, 14, 2, 3, darken(sc,20)));
    torso.push(p(9, 15, 1, 1, darken(sc,34))); torso.push(p(9, 17, 1, 1, darken(sc,34)));
    armL.push(p(1, 13, 2, 5, sc)); armL.push(p(1, 13, 1, 5, scL)); armL.push(p(1, 15, 2, 1, lighten(sc,30)));
    armR.push(p(17, 13, 2, 5, sc)); armR.push(p(17, 13, 1, 5, darken(sc,6))); armR.push(p(17, 15, 2, 1, lighten(sc,30)));

  } else { // tank
    torso.push(p(4, 13, 12, 7, sc)); torso.push(p(4, 13, 1, 7, scL)); torso.push(p(15, 13, 1, 7, scD));
    torso.push(p(4, 19, 12, 1, scD)); torso.push(p(5, 13, 2, 2, scD)); torso.push(p(13, 13, 2, 2, scD));
    armL.push(p(1, 13, 3, 5, sk)); armL.push(p(1, 13, 1, 5, skL));
    armR.push(p(16, 13, 3, 5, sk)); armR.push(p(16, 13, 1, 5, darken(sk,4)));
  }

  addHand(true);
  addHand(false);

  // ── HEAD GROUP ─────────────────────────────
  const H = head;

  // Neck (inside head group → tilts with head)
  H.push(p(8, 11, 4, 2, sk));
  H.push(p(8, 11, 1, 2, skL));
  H.push(p(11, 11, 1, 2, skD));
  H.push(p(9, 12, 2, 1, darken(sk, 10)));
  H.push(p(8, 12, 1, 1, skD));
  H.push(p(11, 12, 1, 1, skDD));

  // Head base — oval with 3-D shading
  H.push(p(4, 3, 12, 9, sk));
  H.push(p(3, 4, 1, 7, sk));
  H.push(p(16, 4, 1, 7, sk));
  // Forehead highlight (rounded top)
  H.push(p(6, 3, 6, 2, skLL));
  H.push(p(7, 3, 4, 1, lighten(skLL, 10)));
  // Side depth shading
  H.push(p(4, 4, 1, 8, skL));
  H.push(p(15, 4, 1, 8, skD));
  H.push(p(3, 5, 1, 5, darken(sk, 8)));
  H.push(p(16, 5, 1, 5, skD));
  // Chin
  H.push(p(5, 11, 10, 1, skD));
  H.push(p(6, 11, 8, 1, sk));
  H.push(p(7, 11, 6, 1, darken(sk, 12)));
  // Cheek blush
  H.push(pa(4, 7, 2, 2, '#e89090', 0.28));
  H.push(pa(14, 7, 2, 2, '#e89090', 0.28));
  // Ears with depth
  H.push(p(2, 5, 2, 3, sk));  H.push(p(16, 5, 2, 3, sk));
  H.push(p(2, 5, 1, 3, skL)); H.push(p(16, 5, 1, 3, lighten(sk, 6)));
  H.push(p(2, 6, 1, 1, skDD)); H.push(p(16, 6, 1, 1, skDD));  // canals
  H.push(p(3, 7, 1, 1, skD));  H.push(p(17, 7, 1, 1, skD));

  // ── EYEBROWS — arched and expressive ────────
  const ebC = darken(hc, 10);
  const ebD = darken(hc, 26);
  // Left brow
  H.push(p(5, 4, 1, 1, ebC));    // outer tail
  H.push(p(6, 3, 2, 1, ebD));    // arch
  H.push(p(7, 3, 1, 1, ebC));    // peak
  H.push(p(8, 4, 1, 1, ebD));    // inner end
  H.push(p(6, 4, 1, 1, darken(ebD, 8)));
  // Right brow
  H.push(p(14, 4, 1, 1, ebC));
  H.push(p(12, 3, 2, 1, ebD));
  H.push(p(12, 3, 1, 1, ebC));
  H.push(p(11, 4, 1, 1, ebD));
  H.push(p(13, 4, 1, 1, darken(ebD, 8)));

  // ── EYES — large, expressive ─────────────────
  const eyeWhite = '#f6f6f8';
  const eyeRim   = darken(sk, 18);
  // Socket shadow
  H.push(p(5, 5, 4, 3, darken(sk, 7)));
  H.push(p(11, 5, 4, 3, darken(sk, 7)));
  // Whites
  H.push(p(5, 5, 4, 2, eyeWhite));
  H.push(p(11, 5, 4, 2, eyeWhite));
  // Iris 2×2
  H.push(p(6, 5, 2, 2, ec));    H.push(p(12, 5, 2, 2, ec));
  H.push(p(6, 5, 2, 1, ecL));   H.push(p(6, 6, 2, 1, ecD));
  H.push(p(12, 5, 2, 1, ecL));  H.push(p(12, 6, 2, 1, ecD));
  // Pupil
  H.push(p(7, 5, 1, 2, '#0d0d1c')); H.push(p(13, 5, 1, 2, '#0d0d1c'));
  // Specular glint
  H.push(pa(7, 5, 1, 1, '#ffffff', 0.82)); H.push(pa(13, 5, 1, 1, '#ffffff', 0.82));
  H.push(pa(6, 6, 1, 1, '#ffffff', 0.40)); H.push(pa(12, 6, 1, 1, '#ffffff', 0.40));
  // Upper eyelid rim
  H.push(p(5, 5, 4, 1, eyeRim)); H.push(p(11, 5, 4, 1, eyeRim));
  // Lash dots
  H.push(p(5, 4, 1, 1, darken(sk, 28))); H.push(p(8, 4, 1, 1, darken(sk, 28)));
  H.push(p(11, 4, 1, 1, darken(sk, 28))); H.push(p(14, 4, 1, 1, darken(sk, 28)));
  // Lower lid
  H.push(pa(5, 7, 4, 1, skD, 0.56)); H.push(pa(11, 7, 4, 1, skD, 0.56));

  // Blink layer (CSS-animated)
  H.push(`<g class="avatar-blink-layer" style="transform-origin:50% 37.5%;">`);
  H.push(p(5, 5, 4, 2, sk)); H.push(p(11, 5, 4, 2, sk));
  H.push(p(5, 6, 4, 1, skD)); H.push(p(11, 6, 4, 1, skD));  // crease
  H.push(`</g>`);

  // ── NOSE ────────────────────────────────────
  H.push(p(9, 6, 2, 2, darken(sk, 12)));
  H.push(p(9, 6, 1, 2, darken(sk, 7)));
  H.push(p(8, 8, 1, 1, skD)); H.push(p(11, 8, 1, 1, skD));
  H.push(p(9, 8, 2, 1, darken(sk, 16)));
  H.push(p(9, 7, 1, 1, skL));  // tip highlight

  // ── MOUTH — always closed ────────────────────
  H.push(`<g id="avatar-mouth">${buildMouth('smile')}</g>`);

  // ── BEARD ────────────────────────────────────
  if (c.beardStyle !== 'none') {
    const bc   = c.beardColor;
    const bcL  = lighten(bc, 20);
    const bcD  = darken(bc, 20);
    const bcDD = darken(bc, 42);

    if (c.beardStyle === 'stubble') {
      [[6,9,0.42],[8,9,0.38],[10,9,0.40],[12,9,0.38],[14,9,0.44],
       [5,10,0.50],[7,10,0.46],[9,10,0.54],[11,10,0.46],[13,10,0.50],[15,10,0.44],
       [6,11,0.48],[8,11,0.44],[10,11,0.46],[12,11,0.42],[14,11,0.48],
       [8,8,0.28],[9,8,0.24],[10,8,0.24],[11,8,0.28]
      ].forEach(([dx,dy,a]) => H.push(pa(dx,dy,1,1,bc,a)));
      H.push(pa(9,10,2,1,bc,0.60)); H.push(pa(9,11,2,1,bc,0.54));

    } else if (c.beardStyle === 'mustache') {
      H.push(p(7,7,6,1,bc)); H.push(p(7,7,2,1,bcL)); H.push(p(11,7,2,1,bcD));
      H.push(p(6,7,1,1,bcDD)); H.push(p(13,7,1,1,bcDD));
      H.push(pa(8,7,4,1,bcDD,0.40)); H.push(pa(7,8,6,1,bc,0.22));

    } else if (c.beardStyle === 'goatee') {
      H.push(p(8,7,4,1,bc)); H.push(p(8,7,2,1,bcL));
      H.push(pa(7,8,6,1,bc,0.22));
      H.push(p(8,10,4,1,bc)); H.push(p(8,10,2,1,bcL)); H.push(p(10,10,2,1,bcD));
      H.push(p(8,11,4,1,bc)); H.push(p(8,11,1,1,bcL)); H.push(p(9,11,2,1,bcDD)); H.push(p(11,11,1,1,bcD));
      H.push(p(9,12,2,1,bcD)); H.push(p(9,12,1,1,bcDD));
      H.push(pa(9,9,2,1,bc,0.40));

    } else if (c.beardStyle === 'full') {
      // Mustache row 7
      H.push(p(7,7,6,1,bc)); H.push(p(7,7,2,1,bcL)); H.push(p(11,7,2,1,bcD));
      H.push(p(6,7,1,1,bcDD)); H.push(p(13,7,1,1,bcDD));
      H.push(pa(8,8,4,1,bc,0.30));
      // Cheek coverage rows 8-9
      H.push(p(4,8,2,1,darken(bc,6))); H.push(p(14,8,2,1,darken(bc,6)));
      H.push(p(4,9,3,1,bc)); H.push(p(4,9,1,1,bcL));
      H.push(p(13,9,3,1,bc)); H.push(p(15,9,1,1,bcD));
      // Jaw rows 10-11
      H.push(p(4,10,12,1,bc)); H.push(p(4,10,2,1,bcL)); H.push(p(14,10,2,1,bcD));
      H.push(p(8,10,1,1,bcDD)); H.push(p(11,10,1,1,bcDD));
      H.push(p(4,11,12,1,bc)); H.push(p(5,11,1,1,bcL)); H.push(p(14,11,1,1,bcD));
      H.push(p(9,11,2,1,bcDD));
      // Chin row 12
      H.push(p(5,12,10,1,bcD)); H.push(p(6,12,8,1,bc)); H.push(p(9,12,2,1,bcDD));
      // Skin blend at edges
      H.push(pa(4,9,1,1,sk,0.38)); H.push(pa(15,9,1,1,sk,0.38));
    }
  }

  // ── HAIR ────────────────────────────────────
  if (c.hairStyle !== 'bald') {
    const buildHair = () => {
      const h = [];
      if (c.hairStyle === 'short') {
        h.push(p(4,0,12,4,hc)); h.push(p(3,1,1,4,hc)); h.push(p(16,1,1,4,hc));
        h.push(p(4,3,12,1,hcD)); h.push(p(3,2,1,2,hcD)); h.push(p(16,2,1,2,hcD));
        h.push(p(5,0,5,1,hcLL)); h.push(p(6,1,3,1,hcL)); h.push(p(4,0,1,2,hcL));
        h.push(p(8,0,4,1,hcDD)); h.push(p(9,1,2,1,hcD));
        h.push(p(3,4,1,2,hc)); h.push(p(3,5,1,1,hcD));
        h.push(p(16,4,1,2,hc)); h.push(p(17,5,1,1,hcD));
        h.push(p(4,4,1,1,hcD)); h.push(p(15,4,1,1,hcD));

      } else if (c.hairStyle === 'medium') {
        h.push(p(3,0,14,4,hc)); h.push(p(2,1,1,6,hc)); h.push(p(17,1,1,6,hc));
        h.push(p(3,3,14,1,hcD)); h.push(p(2,4,1,3,hcD)); h.push(p(17,4,1,3,hcD));
        h.push(p(5,0,5,1,hcLL)); h.push(p(6,1,3,1,hcL)); h.push(p(4,0,1,2,hcL));
        h.push(p(8,0,4,1,hcDD));
        h.push(p(2,5,2,3,hc)); h.push(p(16,5,2,3,hc));
        h.push(p(2,6,1,2,hcL)); h.push(p(17,6,1,2,hcD));
        h.push(p(2,7,1,1,hcD)); h.push(p(17,7,1,1,hcD));

      } else if (c.hairStyle === 'long') {
        h.push(p(3,0,14,4,hc)); h.push(p(2,1,1,11,hc)); h.push(p(17,1,1,11,hc));
        h.push(p(3,3,14,1,hcD)); h.push(p(5,0,5,1,hcLL)); h.push(p(6,1,3,1,hcL));
        h.push(p(4,0,1,2,hcL)); h.push(p(8,0,4,1,hcDD));
        h.push(p(2,5,2,8,hc)); h.push(p(16,5,2,8,hc));
        h.push(p(2,6,1,5,hcL)); h.push(p(17,6,1,5,hcD));
        h.push(p(2,9,2,1,hcDD)); h.push(p(16,9,2,1,hcDD));
        h.push(p(2,11,1,2,hcD)); h.push(p(17,11,1,2,hcD));
        h.push(p(2,13,1,1,hcDD)); h.push(p(17,13,1,1,hcDD));
        h.push(pa(3,7,1,3,hcL,0.55)); h.push(pa(16,7,1,3,hcD,0.55));

      } else if (c.hairStyle === 'curly') {
        h.push(p(3,0,14,5,hc)); h.push(p(2,1,2,5,hc)); h.push(p(16,1,2,5,hc));
        h.push(p(3,0,2,1,hcD)); h.push(p(15,0,2,1,hcD));
        h.push(p(2,2,1,3,hcL)); h.push(p(17,2,1,3,hcL));
        h.push(p(4,0,2,1,hcLL)); h.push(p(7,0,2,1,hcLL)); h.push(p(11,0,2,1,hcLL)); h.push(p(14,0,1,1,hcL));
        h.push(p(5,1,1,1,hcDD)); h.push(p(8,1,1,1,hcDD)); h.push(p(11,1,1,1,hcDD));
        h.push(p(6,0,1,1,hcD)); h.push(p(9,0,1,1,hcD)); h.push(p(13,0,1,1,hcD));
        h.push(p(4,2,1,1,hcD)); h.push(p(7,2,1,1,hcD)); h.push(p(12,2,1,1,hcD)); h.push(p(15,2,1,1,hcD));
        h.push(p(5,3,1,1,hcLL)); h.push(p(10,3,1,1,hcLL)); h.push(p(14,3,1,1,hcL));
        h.push(p(3,4,1,1,hcDD)); h.push(p(16,4,1,1,hcDD));
        h.push(p(2,5,2,3,hc)); h.push(p(16,5,2,3,hc));
        h.push(p(2,6,1,1,hcLL)); h.push(p(17,6,1,1,hcL));
        h.push(p(2,7,1,1,hcD)); h.push(p(17,7,1,1,hcDD));

      } else if (c.hairStyle === 'fade') {
        h.push(p(4,0,12,3,hc)); h.push(p(4,0,5,1,hcLL)); h.push(p(6,1,3,1,hcL));
        h.push(p(8,0,4,1,hcDD)); h.push(p(4,2,12,1,hcD));
        h.push(p(3,1,1,2,hcD)); h.push(p(16,1,1,2,hcD));
        h.push(pa(3,2,1,2,hc,0.72)); h.push(pa(16,2,1,2,hc,0.72));
        h.push(pa(3,4,1,1,hc,0.42)); h.push(pa(16,4,1,1,hc,0.42));
        h.push(pa(3,5,1,1,hc,0.16)); h.push(pa(16,5,1,1,hc,0.16));
        h.push(p(5,0,1,1,hcD)); h.push(p(9,0,1,1,hcD)); h.push(p(13,0,1,1,hcD));

      } else if (c.hairStyle === 'mohawk') {
        h.push(p(8,0,4,5,hc)); h.push(p(9,0,2,5,hcL));
        h.push(p(8,0,1,5,hcD)); h.push(p(11,0,1,5,hcD));
        h.push(p(9,0,2,1,hcLL)); h.push(p(8,1,1,1,hcDD)); h.push(p(11,1,1,1,hcDD));
        h.push(p(8,4,4,1,hcDD));
        h.push(p(9,2,1,2,hcLL)); h.push(p(10,1,1,2,hcD));
        h.push(pa(3,4,1,2,hc,0.20)); h.push(pa(16,4,1,2,hc,0.20));
      }
      return h.join('');
    };
    H.push(buildHair());
  }

  // ── GLASSES ──────────────────────────────────
  if (c.glassesStyle !== 'none') {
    const isSun   = c.glassesStyle === 'sunglasses';
    const gf      = isSun ? '#0d0d1a' : 'rgba(140,200,255,0.18)';
    const gBorder = isSun ? '#1a1a1a' : (c.glassesColor || '#58a6ff');
    H.push(p(5,5,4,2,gf)); H.push(p(11,5,4,2,gf));
    if (c.glassesStyle === 'round') {
      H.push(`<rect x="${5*PX}" y="${5*PX}" width="${4*PX}" height="${2*PX}" fill="none" stroke="${gBorder}" stroke-width="1.5" rx="5"/>`);
      H.push(`<rect x="${11*PX}" y="${5*PX}" width="${4*PX}" height="${2*PX}" fill="none" stroke="${gBorder}" stroke-width="1.5" rx="5"/>`);
    } else if (c.glassesStyle === 'square') {
      H.push(`<rect x="${5*PX}" y="${5*PX}" width="${4*PX}" height="${2*PX}" fill="none" stroke="${gBorder}" stroke-width="2"/>`);
      H.push(`<rect x="${11*PX}" y="${5*PX}" width="${4*PX}" height="${2*PX}" fill="none" stroke="${gBorder}" stroke-width="2"/>`);
    } else if (c.glassesStyle === 'pixel') {
      [5, 11].forEach(ox => {
        H.push(p(ox,5,4,1,gBorder)); H.push(p(ox,6,4,1,gBorder));
        H.push(p(ox,5,1,2,gBorder)); H.push(p(ox+3,5,1,2,gBorder));
        H.push(p(ox+1,5,2,1,gf));
      });
    } else if (isSun) {
      H.push(p(5,5,1,1,'#2a2a44')); H.push(p(11,5,1,1,'#2a2a44'));
      H.push(`<rect x="${5*PX}" y="${5*PX}" width="${4*PX}" height="${2*PX}" fill="none" stroke="#1a1a1a" stroke-width="1.5" rx="2"/>`);
      H.push(`<rect x="${11*PX}" y="${5*PX}" width="${4*PX}" height="${2*PX}" fill="none" stroke="#1a1a1a" stroke-width="1.5" rx="2"/>`);
    }
    const bc2 = gBorder === '#1a1a1a' ? '#222' : gBorder;
    H.push(p(9,6,2,1,bc2)); H.push(p(3,6,2,1,bc2)); H.push(p(15,6,2,1,bc2));
  }

  // ── ACCESSORY ────────────────────────────────
  if (c.accessory === 'headphones') {
    H.push(`<path d="M ${4*PX} ${3*PX} Q ${10*PX} ${-2*PX} ${16*PX} ${3*PX}" fill="none" stroke="#1a1a1a" stroke-width="${PX-1}"/>`);
    H.push(p(1,4,3,4,'#111')); H.push(p(1,5,3,2,'#222')); H.push(p(1,5,1,2,'#ff6b6b'));
    H.push(p(16,4,3,4,'#111')); H.push(p(16,5,3,2,'#222')); H.push(p(18,5,1,2,'#ff6b6b'));
  } else if (c.accessory === 'cap') {
    const capC=hc, capD=darken(hc,24), capL=lighten(hc,24);
    H.push(p(3,0,14,4,capC)); H.push(p(3,0,1,4,capL)); H.push(p(16,0,1,4,capD));
    H.push(p(4,0,5,1,lighten(capC,18))); H.push(p(2,3,16,2,capD));
    H.push(p(2,3,1,2,capL)); H.push(p(17,3,1,2,darken(capD,12)));
    H.push(p(8,1,4,2,darken(capC,34))); H.push(p(9,1,2,1,capL)); H.push(p(9,0,2,1,capD));
  } else if (c.accessory === 'beanie') {
    const banC=hc, banD=darken(hc,28), banL=lighten(hc,28);
    H.push(p(3,0,14,5,banC)); H.push(p(2,1,1,4,banC)); H.push(p(17,1,1,4,banC));
    H.push(p(3,0,1,5,banL)); H.push(p(16,0,1,5,banD));
    H.push(p(2,4,16,2,banD)); H.push(p(2,4,1,2,banL)); H.push(p(17,4,1,2,darken(banD,10)));
    for (let i=3; i<16; i+=3) H.push(p(i,4,1,2,lighten(banD,8)));
    H.push(p(8,0,4,1,lighten(banC,34))); H.push(p(9,0,2,1,lighten(banC,46)));
  } else if (c.accessory === 'crown') {
    const gold='#f0b000', goldL='#f8d040', goldD='#b07800';
    H.push(p(3,2,14,3,gold)); H.push(p(3,0,3,2,gold)); H.push(p(8,0,4,3,gold)); H.push(p(14,0,3,2,gold));
    H.push(p(3,0,1,2,goldL)); H.push(p(8,0,1,3,goldL)); H.push(p(14,0,1,2,goldL)); H.push(p(3,2,1,3,goldL));
    H.push(p(4,0,1,1,lighten(goldL,12))); H.push(p(9,0,1,1,lighten(goldL,12)));
    H.push(p(5,3,2,1,'#e04040')); H.push(p(9,2,2,1,'#40a0e0')); H.push(p(13,3,2,1,'#40e080'));
    H.push(p(3,4,14,1,goldD)); H.push(p(16,2,1,3,goldD));
  }

  // ── PHONE PROP ─────────────────────────────
  // Shows the BACK of the phone (camera side) since
  // the character holds it facing themselves.
  // Head CSS-tilts down to look at it.
  const phone = [
    p(12,13,5,9,'#1a1a2e'),           // phone back (body)
    p(12,13,5,1,'#2a2a42'),           // top edge
    p(12,21,5,1,'#2a2a42'),           // bottom edge
    p(12,13,1,9,'#252545'),           // left edge highlight
    p(16,13,1,9,'#0f0f1e'),           // right edge shadow
    p(13,14,3,3,'#111120'),           // camera housing
    p(13,14,1,1,'#3a3a60'),           // lens 1 glint
    p(14,15,1,1,'#222240'),           // lens 2
    p(13,16,1,1,'#1a1a30'),           // lens 3
    p(13,18,3,1,'#20203a'),           // branding stripe
    p(16,15,1,2,'#222236'),           // side button R
    p(12,16,1,1,'#222236'),           // side button L
  ].join('');

  // ── BOOK PROP ──────────────────────────────
  // Open book held at chest height, both arms bend forward to hold it.
  // Head CSS-tilts down to read.
  const book = [
    // Spine (slightly taller than pages, 3D depth)
    p(9,13,2,8,'#5a3018'),            // spine body
    p(9,13,1,8,'#7a4a20'),            // spine left highlight
    // Left page
    p(5,14,4,6,'#f0ecd8'),            // page surface
    p(5,14,4,1,'#d8d4c0'),            // top fold shadow
    p(5,19,4,1,'#c8c4b0'),            // bottom edge
    p(5,14,1,6,'#e0dcc8'),            // outer left edge curl
    // Right page (in slight shadow)
    p(11,14,4,6,'#e4e0cc'),           // page surface
    p(11,14,4,1,'#ccc8b4'),           // top fold shadow
    p(11,19,4,1,'#b8b4a0'),           // bottom edge
    // Text lines — left page
    p(6,15,3,1,'#aaa590'), p(6,16,2,1,'#aaa590'),
    p(6,17,3,1,'#aaa590'), p(6,18,2,1,'#aaa590'),
    // Text lines — right page
    p(12,15,2,1,'#9a9580'), p(12,16,3,1,'#9a9580'),
    p(12,17,2,1,'#9a9580'), p(12,18,3,1,'#9a9580'),
  ].join('');

  // ── CODE STATE PROPS ────────────────────────
  // avatar-code-bg : large desktop monitor rendered BEFORE the character groups
  //   (starts at grid y = -8, i.e. 40px above SVG top — visible via overflow:visible)
  // avatar-code-fg : back-of-head overlay rendered AFTER the head group
  //   (completely covers the front-facing face with back-of-head pixels)
  // CSS adds translateY(35px) to .avatar-sprite-wrap when .coding is on companion,
  //   pushing the whole scene down so ~70% of the monitor screen stays visible.

  // — Desktop monitor (diagonal view: extends to the LEFT of character) —
  // Character body overlaps right ~30%, leaving ~70% of screen visible on the left.
  // Companion shifts right: 36px→0 in CSS so the leftward overflow stays in viewport.
  // Frame: 20×15 grid = 100×75px (4:3 ratio — proper monitor proportions)
  const monitorBg = [
    p(-14,-8,20,15,'#252838'),             // outer frame (20×15)
    p(-14,-8,20, 1,'#353850'),             // top edge highlight
    p(-14,-8, 1,15,'#353850'),             // left edge highlight
    p(  5,-8, 1,15,'#151825'),             // right edge shadow
    p(-14, 6,20, 1,'#151825'),             // bottom frame edge (y=-8+15-1=6)
    p(-13,-7,18,13,'#0a0e18'),             // screen dark bg (18×13)
    // Screen glow
    pa(-13,-7,18, 1,'#40c860',0.07),       // top glow row
    pa(-13,-7, 1,13,'#40c860',0.06),       // left glow col
    // Terminal code lines (y -6 to 4, within 13-row screen)
    p(-12,-6, 7,1,'#236d35'), p(-10,-6,3,1,'#3daa55'),
    p(-12,-5,11,1,'#1e5a2c'),
    p(-12,-4, 5,1,'#236d35'), p(-12,-4,2,1,'#3daa55'),
    p(-12,-3, 9,1,'#236d35'),
    p(-12,-2, 4,1,'#236d35'), p( -7,-2,5,1,'#1e5a2c'),
    p(-12,-1, 8,1,'#236d35'),
    p(-12, 0, 6,1,'#1e5a2c'),
    p(-12, 1, 9,1,'#236d35'),
    p(-12, 2, 5,1,'#236d35'),
    p(-12, 3, 4,1,'#1e5a2c'),
    p(-12, 4, 7,1,'#236d35'),
    // Blinking cursor
    `<g id="avatar-laptop-cursor">${p(-4,-6,1,1,'#5de87a')}</g>`,
    // Monitor stand + base
    p(-5, 7, 2,3,'#1e1c2e'),
    p(-7,10, 6,1,'#1e1c2e'),
    p(-7,10, 1,1,'#2c2a42'),              // base highlight
  ].join('');

  // — Back-of-body overlay (covers head + torso + arms from behind) —
  const codeBackHead = [
    // ── HEAD (back view) ──────────────────────────
    p(4,3,12,9,sk), p(3,4,1,7,sk), p(16,4,1,7,sk),
    // Shading REVERSED (light on right, shadow on left from behind)
    p(4,4,1,8,skD), p(15,4,1,8,skL),
    p(3,5,1,5,darken(sk,10)), p(16,5,1,5,darken(sk,6)),
    pa(6,3,8,2,darken(sk,10),0.45),        // top-of-head curved shadow
    // Ears (same position, shading reversed)
    p(2,5,2,3,sk), p(16,5,2,3,sk),
    p(2,5,1,3,skD), p(16,5,1,3,skL),
    p(2,6,1,1,skDD), p(16,6,1,1,skDD),
    // Neck (reversed side shading)
    p(8,11,4,2,sk), p(8,11,1,2,skL), p(11,11,1,2,skD),
    // ── TORSO (back view) — covers all front shirt details ──────
    // Collar/hood back
    p(7,12,6,1,scD), p(8,12,4,1,darken(scD,16)),
    // Shirt back body
    p(3,13,14,7,sc),
    p(3,13,1,7,scD),              // left DARKER (reversed shading)
    p(16,13,1,7,scL),             // right lighter
    p(4,13,3,1,darken(sc,10)),    // left shoulder line
    p(13,13,3,1,darken(sc,10)),   // right shoulder line
    p(9,13,2,7,darken(sc,22)),    // centre back seam
    p(3,19,14,1,scD),             // shirt hem
    // Hoodie hood back seam
    ...(c.shirtStyle === 'hoodie' ? [
      p(5,12,10,1,darken(sc,30)), p(6,11,8,1,darken(sc,30)),
    ] : []),
    // Belt (same from both sides)
    p(3,20,14,1,darken(pc,38)), p(8,20,4,1,darken(pc,48)),
    // ── ARMS (back view) — covers sleeve fronts ─────────────────
    p(1,13,2,6,sc),  p(1,13,1,6,scD),  p(1,18,2,1,scD),   // left sleeve
    p(17,13,2,6,sc), p(17,13,1,6,scL), p(17,18,2,1,scD),  // right sleeve
    // Hands from behind (skin, reversed highlights)
    p(0,15,2,3,sk), p(0,15,1,3,skD), p(1,17,1,1,skD),     // left hand
    p(18,15,2,3,sk), p(19,15,1,3,skL), p(18,17,1,1,skD),  // right hand
    // ── HAIR from behind ────────────────────────────────────────
    ...(c.hairStyle !== 'bald' ? [
      p(4,0,12,5,hc),
      p(3,1,1,5,hcD),  p(16,1,1,5,hcL),
      p(4,4,12,1,hcD), p(5,0,5,1,hcLL), p(6,1,3,1,hcL), p(9,0,4,1,hcDD),
      p(3,4,1,2,hcD),  p(16,4,1,2,hcL),
      ...(c.hairStyle==='medium'||c.hairStyle==='long' ? [
        p(2,5,2,3,hc), p(16,5,2,3,hc),
      ] : []),
    ] : []),
    // Glasses temples from behind
    ...(c.glassesStyle !== 'none' ? (() => {
      const gc = c.glassesStyle === 'sunglasses' ? '#1a1a1a' : (c.glassesColor || '#58a6ff');
      return [p(3,5,1,1,gc), p(16,5,1,1,gc)];
    })() : []),
  ].join('');

  // ── ASSEMBLE ──────────────────────────────
  return `<svg xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 ${SVG_W} ${SVG_H}"
  width="${SVG_W}" height="${SVG_H}">
${shadow}
<g id="avatar-code-bg" style="display:none">${monitorBg}</g>
<g class="avatar-left-leg">${legL.join('')}</g>
<g class="avatar-right-leg">${legR.join('')}</g>
${torso.join('\n')}
<g class="avatar-left-arm">${armL.join('')}</g>
<g class="avatar-right-arm">${armR.join('')}</g>
<g class="avatar-head">${H.join('\n')}</g>
<g id="avatar-phone" style="display:none">${phone}</g>
<g id="avatar-book"  style="display:none">${book}</g>
<g id="avatar-code-fg" style="display:none">${codeBackHead}</g>
</svg>`;
}

// ============================================
// MOUTH EXPRESSIONS — simple pixel shapes
// 3–5 dark pixels only (Minecraft-style legibility)
// ============================================
function buildMouth(expression) {
  const m = '#1a0805';   // dark brown-black line

  switch (expression) {
    case 'smile':
      // U-shape: corners low, centre high
      return [p(8,9,1,1,m), p(9,8,2,1,m), p(11,9,1,1,m)].join('');

    case 'grin':
      // Wide smile
      return [p(7,9,1,1,m), p(8,8,4,1,m), p(12,9,1,1,m)].join('');

    case 'serious':
      // Flat line
      return p(8,8,4,1,m);

    case 'bored':
      // Upside-down U = frown
      return [p(8,8,1,1,m), p(9,9,2,1,m), p(11,8,1,1,m)].join('');

    case 'surprised':
      // Small square = open-ish
      return [p(9,8,2,1,m), p(9,9,2,1,m)].join('');

    case 'wave':
      // Same as grin
      return [p(7,9,1,1,m), p(8,8,4,1,m), p(12,9,1,1,m)].join('');

    case 'smirk':
      // Right-side raised
      return [p(8,9,1,1,m), p(9,8,3,1,m)].join('');

    default:
      return buildMouth('smile');
  }
}

// ============================================
// COLOR HELPERS
// ============================================
function darken(hex, amount) {
  if (!hex || hex.length < 7) return hex || '#888';
  const n = parseInt(hex.replace('#','').substring(0,6), 16);
  const r = Math.max(0, (n>>16) - amount);
  const g = Math.max(0, ((n>>8)&0xff) - amount);
  const b = Math.max(0, (n&0xff) - amount);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function lighten(hex, amount) {
  if (!hex || hex.length < 7) return hex || '#888';
  const n = parseInt(hex.replace('#','').substring(0,6), 16);
  const r = Math.min(255, (n>>16) + amount);
  const g = Math.min(255, ((n>>8)&0xff) + amount);
  const b = Math.min(255, (n&0xff) + amount);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ============================================
// STATE MACHINE
// ============================================
const STATE_EXPRESSION = {
  idle:      'smile',   walk:      'smile',   dance:     'grin',
  bored:     'bored',   phone:     'serious', wave:      'wave',
  serious:   'serious', stretch:   'smile',   look:      'smile',
  code:      'serious', study:     'smile',
  think:     'serious', celebrate: 'grin',    point:     'smile',
};

// Minimum ms a state plays before a queued transition can fire.
// idle/walk = 0 so section changes feel instant when currently passive.
const STATE_MIN_DURATION = {
  idle: 0, walk: 0, dance: 900,
  bored: 2500, phone: 2200, wave: 900,
  stretch: 2400, look: 1800, code: 2000, study: 2800,
  think: 2000, celebrate: 1500, point: 1200,
};

function updateMouth(expression) {
  if (!_avatarEl) return;
  const mg = _avatarEl.querySelector('#avatar-mouth');
  if (mg) mg.innerHTML = buildMouth(expression);
}

function setPhoneProp(visible) {
  if (!_avatarEl) return;
  const pe = _avatarEl.querySelector('#avatar-phone');
  if (pe) pe.style.display = visible ? '' : 'none';
}

function setCodeProps(visible) {
  if (!_avatarEl) return;
  const bg = _avatarEl.querySelector('#avatar-code-bg');
  if (bg) bg.style.display = visible ? '' : 'none';
  const fg = _avatarEl.querySelector('#avatar-code-fg');
  if (fg) fg.style.display = visible ? '' : 'none';
}

function setBookProp(visible) {
  if (!_avatarEl) return;
  const bk = _avatarEl.querySelector('#avatar-book');
  if (bk) bk.style.display = visible ? '' : 'none';
}

function isStateAllowed(state) {
  if (state === 'idle' || state === 'walk') return true;  // always available
  const allowed = _cfg.allowedStates;
  if (!allowed || !Array.isArray(allowed)) return true;  // null = allow all
  return allowed.includes(state);
}

function applyState(state) {
  _state = state;
  _stateStartTime = Date.now();
  // Cancel any queued transition — this call is now authoritative
  clearTimeout(_pendingTimer);
  _pendingState = null;

  if (!_spriteEl) return;
  _spriteEl.setAttribute('class', 'avatar-sprite state-' + state);
  updateMouth(STATE_EXPRESSION[state] || 'smile');
  setPhoneProp(state === 'phone');
  setBookProp(state === 'study');
  setCodeProps(state === 'code');
  if (_avatarEl) {
    _avatarEl.classList.toggle('walking',    state === 'walk');
    _avatarEl.classList.toggle('looking',    state === 'look');
    _avatarEl.classList.toggle('coding',     state === 'code');
    _avatarEl.classList.toggle('thinking',   state === 'think');
    _avatarEl.classList.toggle('celebrating',state === 'celebrate');
  }
}

// ============================================
// REQUEST STATE — queue-aware transition
// ============================================
// Use this instead of applyState() for section/autonomous transitions.
// If the current state hasn't reached its minimum play time, the
// request is buffered and only one pending slot is kept (latest wins).
// Direct click interactions should still call applyState() to feel
// instantaneous.
function requestState(state, bubble, bubbleDuration) {
  const elapsed = Date.now() - _stateStartTime;
  const minDur  = STATE_MIN_DURATION[_state] || 0;

  const commit = () => {
    applyState(state);
    if (bubble) showBubble(bubble, bubbleDuration || 3500);
  };

  if (elapsed >= minDur) {
    commit();
  } else {
    // Overwrite any previously queued state (latest always wins)
    clearTimeout(_pendingTimer);
    _pendingState = state;
    _pendingTimer = setTimeout(() => {
      if (_pendingState === state) {   // still the latest request?
        _pendingState = null;
        commit();
      }
    }, minDur - elapsed);
  }
}

// ============================================
// SPEECH BUBBLE
// ============================================
function showBubble(text, duration = 4000) {
  if (!_bubbleEl || !text) return;
  clearTimeout(_bubbleTimer);
  _bubbleEl.textContent = text;
  _bubbleEl.classList.add('show');
  _bubbleTimer = setTimeout(() => _bubbleEl.classList.remove('show'), duration);
}

// ============================================
// AI BUBBLE (Fase 3)
// ============================================
const AI_ENDPOINT    = '/.netlify/functions/avatar-speech';
const AI_COOLDOWN_MS = 90_000;   // min ms between calls
let   _lastAICall    = -Infinity;

// Fetches an AI-generated speech bubble for the given section.
// Returns the bubble string on success, or null on any failure/rate-limit.
// Always non-blocking — callers must use .then() and handle null gracefully.
async function fetchAIBubble(section) {
  if (Date.now() - _lastAICall < AI_COOLDOWN_MS) return null;
  _lastAICall = Date.now();

  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, ctx: window._avatarCtx }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const { bubble } = await res.json();
    return bubble || null;
  } catch {
    return null;  // silently degrade — hardcoded bubbles always available
  }
}

// ============================================
// SECTION TRANSITIONS
// ============================================
function transitionToSection(sectionId) {
  if (_currentSection === sectionId) return;
  _currentSection = sectionId;
  const data = SECTION_STATES[sectionId];
  if (!data) return;
  const stateToUse = isStateAllowed(data.state) ? data.state : 'idle';
  requestState(stateToUse, data.bubble, 3500);

  // 30% chance: enrich bubble with AI-generated line (async, non-blocking).
  // Shows ~1-2s after the hardcoded bubble, giving a "thinking" feel.
  if (Math.random() < 0.30) {
    fetchAIBubble(sectionId).then(aiBubble => {
      if (aiBubble && _currentSection === sectionId) {
        showBubble(aiBubble, 4500);
      }
    });
  }
}

function setupScrollObserver() {
  const sections = Object.keys(SECTION_STATES).map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0.25) transitionToSection(e.target.id);
    });
  }, { threshold: [0.25], rootMargin: '-5% 0px -5% 0px' });
  sections.forEach(s => obs.observe(s));
}

// ============================================
// MUSIC INTEGRATION
// ============================================
function setAvatarMusicState(playing) {
  _musicOn = playing;
  if (!_avatarEl) return;
  if (playing) {
    _avatarEl.classList.add('music-on');
    if (_state === 'idle' || _state === 'look') requestState('dance');
  } else {
    _avatarEl.classList.remove('music-on');
    if (_state === 'dance') requestState('idle');
  }
}

// ============================================
// CLICK INTERACTION
// ============================================
const CLICK_REACTIONS = [
  { state: 'wave',  bubble: 'Oi! 👋' },
  { state: 'wave',  bubble: 'Que bom te ver!' },
  { state: 'idle',  bubble: 'Posso ajudar?' },
  { state: 'dance', bubble: 'Vamos dançar? 🎵' },
  { state: 'code',  bubble: 'Olha o que estou fazendo! 💻' },
];
let _clickIndex = 0;

function onAvatarClick() {
  const r = CLICK_REACTIONS[_clickIndex % CLICK_REACTIONS.length];
  _clickIndex++;
  applyState(r.state);
  showBubble(r.bubble, 3000);
  setTimeout(() => {
    const d = SECTION_STATES[_currentSection];
    if (d) applyState(d.state);
  }, 3500);
}

// ============================================
// IDLE AUTONOMOUS BEHAVIOUR
// ============================================
function scheduleIdleBehavior(quick = false) {
  clearTimeout(_idleTimeout);
  const delay = quick
    ? (1500 + Math.random() * 2000)   // fires quickly after scroll stops
    : (8000 + Math.random() * 12000); // normal cadence
  _idleTimeout = setTimeout(() => {
    if (_musicOn) { scheduleIdleBehavior(); return; }

    // restore() reads _currentSection at call-time so it always returns
    // to the correct section state even if the user scrolled during behavior.
    const restore = () => {
      const d = SECTION_STATES[_currentSection];
      if (d) applyState(isStateAllowed(d.state) ? d.state : 'idle');
      scheduleIdleBehavior();
    };

    const roll = Math.random();

    // ── bored (10%) ───────────────────────────
    if (roll < 0.10 && isStateAllowed('bored')) {
      requestState('bored');
      setTimeout(restore, 5000);

    // ── phone (18%) ───────────────────────────
    } else if (roll < 0.28 && isStateAllowed('phone')) {
      requestState('phone');
      const msgs = ['📱 ...', 'Hmm...', '📲 notificação!', '🔔 mensagem nova'];
      showBubble(msgs[Math.floor(Math.random() * msgs.length)], 3000);
      setTimeout(restore, 5500);

    // ── study (10%) ───────────────────────────
    } else if (roll < 0.38 && isStateAllowed('study')) {
      requestState('study');
      const studyMsgs = ['📖 lendo...', 'Bom livro!', 'Aprendendo algo novo 🎓', 'Página boa essa...'];
      showBubble(studyMsgs[Math.floor(Math.random() * studyMsgs.length)], 3500);
      setTimeout(restore, 6000);

    // ── stretch (8%) ──────────────────────────
    } else if (roll < 0.46 && isStateAllowed('stretch')) {
      requestState('stretch');
      showBubble('*estica* 🙆', 2000);
      setTimeout(restore, 2800);

    // ── look (10%) ────────────────────────────
    } else if (roll < 0.56 && isStateAllowed('look')) {
      requestState('look');
      setTimeout(restore, 4500);

    // ── code (10%) ────────────────────────────
    } else if (roll < 0.66 && isStateAllowed('code')) {
      requestState('code');
      const codeMsgs = ['const x = ...', '🖥️ debugando...', 'git commit -m "fix"', '// TODO: 😅'];
      showBubble(codeMsgs[Math.floor(Math.random() * codeMsgs.length)], 4000);
      setTimeout(restore, 6000);

    // ── think (10%) ───────────────────────────
    } else if (roll < 0.76 && isStateAllowed('think')) {
      requestState('think');
      const thinkMsgs = ['Hmm... 🤔', 'Deixa eu pensar...', 'Boa ideia essa...', '🧠 processando...'];
      showBubble(thinkMsgs[Math.floor(Math.random() * thinkMsgs.length)], 3000);
      setTimeout(restore, 4500);

    // ── celebrate (7%) ────────────────────────
    } else if (roll < 0.83 && isStateAllowed('celebrate')) {
      requestState('celebrate');
      const celebrateMsgs = ['🎉 Mais um projeto!', 'Isso merece comemorar!', '🚀 Let\'s go!', '✨ Bora!'];
      showBubble(celebrateMsgs[Math.floor(Math.random() * celebrateMsgs.length)], 2500);
      setTimeout(restore, 3000);

    // ── point (5%) ────────────────────────────
    } else if (roll < 0.88 && isStateAllowed('point')) {
      requestState('point');
      const pointMsgs = ['Olha isso! 👆', 'Veja aqui!', '⬆️ Confira!', 'Não perca isso!'];
      showBubble(pointMsgs[Math.floor(Math.random() * pointMsgs.length)], 2500);
      setTimeout(restore, 3200);

    // ── idle bubble (12%) ─────────────────────
    } else {
      if (Math.random() < 0.20) {
        // Try AI bubble — falls back to hardcoded if API unavailable or rate-limited
        fetchAIBubble(_currentSection).then(aiBubble => {
          const fallback = IDLE_BUBBLES[Math.floor(Math.random() * IDLE_BUBBLES.length)];
          showBubble(aiBubble || fallback || '', 3500);
        });
      } else {
        const msg = IDLE_BUBBLES[Math.floor(Math.random() * IDLE_BUBBLES.length)];
        if (msg) showBubble(msg, 3000);
      }
      scheduleIdleBehavior();
    }
  }, delay);
}

// ============================================
// PUBLIC: UPDATE CONFIG
// ============================================
function updateAvatarConfig(cfg) {
  _cfg = { ...AVATAR_DEFAULTS, ...cfg };
  if (!_avatarEl) return;
  const wrap = _avatarEl.querySelector('.avatar-sprite-wrap');
  if (!wrap) return;
  wrap.innerHTML = buildAvatarSVG(_cfg);
  _spriteEl = wrap.querySelector('svg');
  if (_spriteEl) {
    _spriteEl.setAttribute('class', 'avatar-sprite state-' + _state);
    _spriteEl.addEventListener('click', onAvatarClick);
  }
  updateMouth(STATE_EXPRESSION[_state] || 'smile');
  setPhoneProp(_state === 'phone');
  setBookProp(_state === 'study');
}

// ============================================
// INIT
// ============================================
function setupAvatar(cfg) {
  _avatarEl = document.getElementById('avatar-companion');
  if (!_avatarEl) return;

  _bubbleEl = _avatarEl.querySelector('.avatar-bubble');
  _labelEl  = _avatarEl.querySelector('.avatar-section-label');

  if (cfg) _cfg = { ...AVATAR_DEFAULTS, ...cfg };

  const wrap = _avatarEl.querySelector('.avatar-sprite-wrap');
  if (wrap) {
    wrap.innerHTML = buildAvatarSVG(_cfg);
    _spriteEl = wrap.querySelector('svg');
    if (_spriteEl) {
      _spriteEl.setAttribute('class', 'avatar-sprite state-idle');
      _spriteEl.addEventListener('click', onAvatarClick);
    }
  }

  applyState('idle');
  setupScrollObserver();
  scheduleIdleBehavior();

  // Re-trigger idle quickly after scrolling stops (so phone/study etc. appear promptly)
  let _scrollStopTimer = null;
  window.addEventListener('scroll', () => {
    clearTimeout(_scrollStopTimer);
    _scrollStopTimer = setTimeout(() => {
      // Only quick-trigger if currently in a section-driven state (not mid-behavior)
      const sectionState = SECTION_STATES[_currentSection]?.state ?? 'idle';
      if (_state === sectionState || _state === 'idle') {
        clearTimeout(_idleTimeout);
        scheduleIdleBehavior(true);
      }
    }, 3000);
  }, { passive: true });

  function tryShow() {
    if (window._splashDismissed || document.body.classList.contains('site-loaded')) {
      setTimeout(() => _avatarEl.classList.add('visible'), 1400);
    } else {
      setTimeout(tryShow, 300);
    }
  }
  tryShow();

  if (typeof musicReactor !== 'undefined') {
    const _origStart = musicReactor.start.bind(musicReactor);
    const _origStop  = musicReactor.stop.bind(musicReactor);
    musicReactor.start = function() { _origStart(); setAvatarMusicState(true); };
    musicReactor.stop  = function() { _origStop();  setAvatarMusicState(false); };
  }
}
