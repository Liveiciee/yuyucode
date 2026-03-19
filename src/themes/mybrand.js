// ── YuyuCode Theme Schema ────────────────────────────────────────────────────
// Copy file ini, rename, isi token-nya, lalu import di src/theme.js
// Semua nilai adalah CSS color string — hex, rgba, gradient, apapun valid.
// ─────────────────────────────────────────────────────────────────────────────

/** @type {import('./schema').YuyuTheme} */
const theme = {
  name: 'My Custom Theme',   // nama yang muncul di app

  // ── Global ────────────────────────────────────────────────────────────────
  bg:          '#111',       // background utama app
  scanlines:   true,         // efek scanline subtle (true/false)

  // ── Atmosphere (glow blobs di bg) ─────────────────────────────────────────
  atm: [
    { color: 'rgba(99,102,241,.1)', x: '-15%', y: '-20%', size: '60%' },
    { color: 'rgba(217,119,6,.07)', x: '90%',  y: '60%',  size: '45%' },
  ],

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    bg:          'rgba(20,18,16,.88)',
    border:      'rgba(255,255,255,.05)',
    logoGrad:    'linear-gradient(135deg,#d97706,#b45309)',
    logoShadow:  '0 4px 16px rgba(217,119,6,.28)',
    titleColor:  '#ede8de',
    accentColor: 'rgba(217,119,6,.65)',    // warna "code" di logo
    statusDot:   'rgba(0,255,140,.4)',     // dot online indicator
    metaColor:   '#38342e',               // text model/effort
    btnBg:       'rgba(255,255,255,.025)',
    btnBorder:   'rgba(255,255,255,.06)',
    btnColor:    'rgba(64,57,50,.5)',
    btnHoverBg:  'rgba(255,255,255,.06)',
    btnHoverColor: '#8a8070',
  },

  // ── Chat Bubbles ──────────────────────────────────────────────────────────
  bubble: {
    user: {
      bg:     'rgba(217,119,6,.09)',
      border: 'rgba(217,119,6,.18)',
      color:  '#ede0c8',
      shadow: '0 4px 20px rgba(0,0,0,.3)',
    },
    ai: {
      bg:     'rgba(255,255,255,.033)',
      border: 'rgba(255,255,255,.055)',
      color:  '#c4bcb0',
      shadow: '0 2px 12px rgba(0,0,0,.2)',
    },
    thinking: {
      color:   'rgba(217,119,6,.4)',
      dotBg:   'rgba(217,119,6,.3)',
      dotGlow: 'rgba(217,119,6,.35)',
    },
  },

  // ── Action Chips ──────────────────────────────────────────────────────────
  chip: {
    border: 'rgba(0,255,140,.16)',
    bg:     'rgba(0,255,140,.04)',
    color:  'rgba(0,220,120,.55)',
    check:  'rgba(0,200,100,.5)',
  },

  // ── Code Blocks (di dalam AI bubble) ─────────────────────────────────────
  code: {
    bg:     'rgba(0,0,0,.4)',
    border: '1px solid rgba(217,119,6,.07)',
    color:  'rgba(200,160,80,.55)',
  },

  // ── Loading dots ──────────────────────────────────────────────────────────
  pulse: 'rgba(217,119,6,.45)',

  // ── Input Area ────────────────────────────────────────────────────────────
  input: {
    areaBg:      'rgba(15,13,11,.92)',
    areaBorder:  'rgba(255,255,255,.045)',
    boxBg:       'rgba(255,255,255,.035)',
    boxBorder:   'rgba(255,255,255,.07)',
    focusBorder: 'rgba(217,119,6,.22)',
    focusShadow: '0 0 0 3px rgba(217,119,6,.06)',
    color:       '#d8d0c4',
    caret:       '#d97706',
    placeholder: '#302820',
    cameraBg:    'rgba(255,255,255,.03)',
    cameraBorder:'rgba(255,255,255,.07)',
    cameraColor: '#4a4540',
    sendGrad:    'linear-gradient(135deg,#d97706,#b45309)',
    sendShadow:  '0 3px 12px rgba(217,119,6,.3)',
  },

  // ── Slash Command Popup ───────────────────────────────────────────────────
  slash: {
    bg:        'rgba(18,16,14,.97)',
    border:    'rgba(255,255,255,.08)',
    shadow:    '0 -12px 40px rgba(0,0,0,.5)',
    divider:   'rgba(255,255,255,.04)',
    hoverBg:   'rgba(255,255,255,.04)',
    cmdColor:  'rgba(217,119,6,.85)',
    descColor: '#302820',
  },

  // ── File Tree (sidebar) ───────────────────────────────────────────────────
  tree: {
    bg:           '#0e0c0a',
    border:       'rgba(255,255,255,.05)',
    itemColor:    '#585048',
    itemHoverBg:  'rgba(255,255,255,.04)',
    itemActiveBg: 'rgba(217,119,6,.08)',
    itemActiveColor: '#d97706',
    folderColor:  '#c8a060',
  },

  // ── Accent (warna utama — dipakai untuk highlight, selected, dsb) ─────────
  accent: '#d97706',
};

export default theme;
