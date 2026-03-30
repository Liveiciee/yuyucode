// ── Obsidian Warm ──────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

import { createTheme } from './factory.js';

export default createTheme({
  name:    'Obsidian Warm',
  accent:  '#d97706',

  bg:           '#0e0c09',
  bg2:          '#131108',
  bg3:          '#1a1710',
  border:       'rgba(255,255,255,.05)',
  borderSoft:   'rgba(255,255,255,.03)',
  text:         '#ede8d8',
  textSec:      '#c4bc9c',
  textMute:     '#3a3428',
  accentBg:     'rgba(217,119,6,.09)',
  accentBorder: 'rgba(217,119,6,.22)',
  success:      '#4ade80',
  successBg:    'rgba(74,222,128,.08)',
  error:        '#f87171',
  errorBg:      'rgba(248,113,113,.1)',
  warning:      '#fbbf24',
  warningBg:    'rgba(251,191,36,.08)',

  atm: [
    { color:'rgba(217,119,6,.06)',  x:'88%',  y:'55%',  size:'55%' },
    { color:'rgba(99,102,241,.03)', x:'-12%', y:'-18%', size:'48%' },
  ],
  scanlines: true,

  header: {
    bg:          'rgba(18,15,8,.9)',
    logoGrad:    'linear-gradient(135deg,#d97706,#b45309)',
    logoShadow:  '0 0 18px rgba(217,119,6,.35), 0 0 36px rgba(217,119,6,.15)',
    titleColor:  '#ede8d8',
    accentColor: 'rgba(217,119,6,.65)',
    statusDot:   'rgba(0,255,140,.45)',
    metaColor:   '#38332a',
  },

  bubble: {
    user: {
      bg:     'rgba(217,119,6,.09)',
      border: 'rgba(217,119,6,.2)',
      color:  '#ede0c0',
      shadow: '0 2px 16px rgba(0,0,0,.5)',
      radius: '16px 4px 16px 16px',
    },
    ai: {
      bg:     'rgba(255,255,255,.03)',
      border: 'rgba(255,255,255,.055)',
      color:  '#c4bc9c',
      shadow: '0 2px 10px rgba(0,0,0,.3)',
      radius: '4px 16px 16px 16px',
    },
    thinking: {
      color:   'rgba(217,119,6,.45)',
      dotBg:   'rgba(217,119,6,.35)',
      dotGlow: 'rgba(217,119,6,.4)',
    },
  },

  chip:  { border:'rgba(0,255,140,.14)', bg:'rgba(0,255,140,.04)', color:'rgba(0,200,110,.55)', check:'rgba(0,200,100,.5)' },
  code:  { bg:'rgba(0,0,0,.5)', border:'1px solid rgba(217,119,6,.08)', color:'rgba(210,160,70,.6)' },
  input: {
    focusBorder: 'rgba(217,119,6,.28)',
    focusShadow: '0 0 0 3px rgba(217,119,6,.07)',
    caret:       '#d97706',
    sendGrad:    'linear-gradient(135deg,#d97706,#b45309)',
    sendShadow:  '0 0 14px rgba(217,119,6,.35), 0 0 28px rgba(217,119,6,.15)',
  },
  slash: { cmdColor:'rgba(217,119,6,.85)', descColor:'#2e2818' },
  pulse: 'rgba(217,119,6,.5)',

  css: `
    @keyframes crtScan {
      0%   { transform:translateY(-4px); opacity:.03; }
      100% { transform:translateY(100vh); opacity:.03; }
    }
    @keyframes crtFlicker {
      0%,97%,100% { opacity:1; }
      98%          { opacity:.92; }
      99%          { opacity:.96; }
    }
    @keyframes phosphorGlow {
      0%,100% { filter:brightness(1) sepia(.05); }
      50%     { filter:brightness(1.04) sepia(.08); }
    }
    .crt-flicker { animation:crtFlicker 8s linear infinite; }
    .phosphor-text { text-shadow:0 0 4px rgba(217,119,6,.2); }
    .obsidian-border-glow {
      box-shadow:0 0 8px rgba(217,119,6,.12), inset 0 0 4px rgba(217,119,6,.04);
    }
  `,

  // fx fully covered by factory defaults — no override needed
});
