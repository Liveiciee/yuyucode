// ── My Brand Theme — Template untuk Custom Theme ────────────────────────────
// Duplikat field yang ingin kamu ganti, hapus sisanya.
// fx tidak perlu di-override kalau pakai warm-glow defaults (accent berbasis).
// ─────────────────────────────────────────────────────────────────────────────

/** @type {import('./index').YuyuTheme} */
import { createTheme } from './factory.js';

export default createTheme({
  name:    'My Brand',
  accent:  '#d97706',

  // ── Global colours ──────────────────────────────────────────────────────────
  bg:           '#111',
  bg2:          '#161412',
  bg3:          '#1c1916',
  border:       'rgba(255,255,255,.05)',
  borderSoft:   'rgba(255,255,255,.03)',
  text:         '#ede8d8',
  textSec:      '#c4b8a0',
  textMute:     '#3a3428',
  accentBg:     'rgba(217,119,6,.09)',
  accentBorder: 'rgba(217,119,6,.22)',
  success:      '#4ade80',
  successBg:    'rgba(74,222,128,.08)',
  error:        '#f87171',
  errorBg:      'rgba(248,113,113,.1)',
  warning:      '#fbbf24',
  warningBg:    'rgba(251,191,36,.08)',

  // ── Atmosphere ───────────────────────────────────────────────────────────────
  atm: [
    { color:'rgba(217,119,6,.08)', x:'88%',  y:'55%',  size:'55%' },
    { color:'rgba(99,102,241,.04)', x:'-12%', y:'-18%', size:'48%' },
  ],
  scanlines: true,

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    bg:          'rgba(20,18,16,.88)',
    logoGrad:    'linear-gradient(135deg,#d97706,#b45309)',
    logoShadow:  '0 4px 16px rgba(217,119,6,.28)',
    titleColor:  '#ede8de',
    accentColor: 'rgba(217,119,6,.65)',
    statusDot:   'rgba(0,255,140,.4)',
    metaColor:   '#38342e',
  },

  // ── Chat Bubbles ──────────────────────────────────────────────────────────────
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

  // ── Action Chips ──────────────────────────────────────────────────────────────
  chip: { border:'rgba(0,255,140,.16)', bg:'rgba(0,255,140,.04)', color:'rgba(0,220,120,.55)', check:'rgba(0,200,100,.5)' },

  // ── Code Blocks ───────────────────────────────────────────────────────────────
  code: { bg:'rgba(0,0,0,.4)', border:'1px solid rgba(217,119,6,.07)', color:'rgba(200,160,80,.55)' },

  // ── Input ─────────────────────────────────────────────────────────────────────
  input: {
    focusBorder: 'rgba(217,119,6,.22)',
    focusShadow: '0 0 0 3px rgba(217,119,6,.06)',
    caret:       '#d97706',
    sendGrad:    'linear-gradient(135deg,#d97706,#b45309)',
    sendShadow:  '0 3px 12px rgba(217,119,6,.3)',
  },

  // ── Slash Command ─────────────────────────────────────────────────────────────
  slash: { cmdColor:'rgba(217,119,6,.85)', descColor:'#302820' },

  // ── Loading dots ──────────────────────────────────────────────────────────────
  pulse: 'rgba(217,119,6,.45)',

  // ── CSS & Animations ──────────────────────────────────────────────────────────
  css: `
    @keyframes mybrandPulse {
      0%,100% { opacity:.8; }
      50%     { opacity:1; }
    }
  `,

  // fx fully covered by factory defaults — override here if needed
});
