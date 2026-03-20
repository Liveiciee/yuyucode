// ── My Brand Theme — Template untuk Custom Theme ────────────────────────────
// TEMPLATE: Ini bukan tema aktif. Copy, rename, isi token, import di index.js.
// Lihat src/themes/obsidian.js untuk referensi skema lengkap.
// ─────────────────────────────────────────────────────────────────────────────

/** @type {import('./index').YuyuTheme} */
const theme = {
  name: 'My Brand',

  // ── Global colours ────────────────────────────────────────────────────────
  bg:           '#111',
  bg2:          '#161412',
  bg3:          '#1c1916',
  border:       'rgba(255,255,255,.05)',
  borderSoft:   'rgba(255,255,255,.03)',
  text:         '#ede8d8',
  textSec:      '#c4b8a0',
  textMute:     '#3a3428',
  accent:       '#d97706',
  accentBg:     'rgba(217,119,6,.09)',
  accentBorder: 'rgba(217,119,6,.22)',
  success:      '#4ade80',
  successBg:    'rgba(74,222,128,.08)',
  error:        '#f87171',
  errorBg:      'rgba(248,113,113,.1)',
  warning:      '#fbbf24',
  warningBg:    'rgba(251,191,36,.08)',

  // ── Atmosphere (glow blobs di bg) ─────────────────────────────────────────
  atm: [
    { color: 'rgba(217,119,6,.08)', x: '88%',  y: '55%', size: '55%' },
    { color: 'rgba(99,102,241,.04)', x: '-12%', y: '-18%', size: '48%' },
  ],
  scanlines: true,

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    bg:          'rgba(20,18,16,.88)',
    logoGrad:    'linear-gradient(135deg,#d97706,#b45309)',
    logoShadow:  '0 4px 16px rgba(217,119,6,.28)',
    titleColor:  '#ede8de',
    accentColor: 'rgba(217,119,6,.65)',
    statusDot:   'rgba(0,255,140,.4)',
    metaColor:   '#38342e',
  },

  // ── Chat Bubbles ──────────────────────────────────────────────────────────
  bubble: {
    user: {
      bg:     'rgba(217,119,6,.09)',
      border: 'rgba(217,119,6,.18)',
      color:  '#ede0c8',
      shadow: '0 4px 20px rgba(0,0,0,.3)',
      radius: '16px 4px 16px 16px',
    },
    ai: {
      bg:     'rgba(255,255,255,.033)',
      border: 'rgba(255,255,255,.055)',
      color:  '#c4bcb0',
      shadow: '0 2px 12px rgba(0,0,0,.2)',
      radius: '4px 16px 16px 16px',
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

  // ── Code Blocks ───────────────────────────────────────────────────────────
  code: {
    bg:     'rgba(0,0,0,.4)',
    border: '1px solid rgba(217,119,6,.07)',
    color:  'rgba(200,160,80,.55)',
  },

  // ── Loading dots ──────────────────────────────────────────────────────────
  pulse: 'rgba(217,119,6,.45)',

  // ── Input Area ────────────────────────────────────────────────────────────
  input: {
    focusBorder: 'rgba(217,119,6,.22)',
    focusShadow: '0 0 0 3px rgba(217,119,6,.06)',
    caret:       '#d97706',
    sendGrad:    'linear-gradient(135deg,#d97706,#b45309)',
    sendShadow:  '0 3px 12px rgba(217,119,6,.3)',
  },

  // ── Slash Command Popup ───────────────────────────────────────────────────
  slash: {
    cmdColor:  'rgba(217,119,6,.85)',
    descColor: '#302820',
  },

  // ── Per-theme CSS & Animations ────────────────────────────────────────────
  css: `
    @keyframes mybrandPulse {
      0%,100% { opacity:.8; }
      50%     { opacity:1; }
    }
  `,

  // ── Visual FX helpers (dipakai oleh MsgBubble) ───────────────────────────
  fx: {
    aiBubble:   () => ({ boxShadow: '0 2px 12px rgba(0,0,0,.4)' }),
    userBubble: () => ({ boxShadow: '0 0 12px rgba(217,119,6,.1), 0 2px 16px rgba(0,0,0,.4)' }),
    glowBorder: (color='#d97706', intensity=1) => ({
      boxShadow: `0 0 ${8*intensity}px ${color}22, inset 0 0 ${4*intensity}px ${color}08`,
    }),
    codeBlock:  () => ({ boxShadow: '0 0 1px rgba(217,119,6,.15), inset 0 0 6px rgba(0,0,0,.3)' }),
    chipOk:     () => ({ boxShadow: '0 0 6px rgba(0,200,110,.18)' }),
    glowText:   (color='#d97706') => ({ textShadow: `0 0 4px ${color}44` }),
    inputFocus: () => ({ boxShadow: '0 0 0 1px rgba(217,119,6,.25), 0 0 10px rgba(217,119,6,.1)' }),
  },
};

export default theme;
