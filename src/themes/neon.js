// ── Neon Terminal ──────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

import { createTheme } from './factory.js';

export default createTheme({
  name:    'Neon Terminal',
  accent:  '#00ff8c',

  bg:           '#03050a',
  bg2:          'rgba(4,7,12,.97)',
  bg3:          '#080d14',
  border:       'rgba(0,255,140,.1)',
  borderSoft:   'rgba(0,255,140,.05)',
  text:         '#c8ffea',
  textSec:      'rgba(150,235,195,.8)',
  textMute:     '#0b1c12',
  accentBg:     'rgba(0,255,140,.07)',
  accentBorder: 'rgba(0,255,140,.22)',
  success:      '#00ff8c',
  successBg:    'rgba(0,255,140,.08)',
  error:        '#ff4466',
  errorBg:      'rgba(255,68,102,.1)',
  warning:      '#ffcc00',
  warningBg:    'rgba(255,204,0,.08)',

  atm: [
    { color:'rgba(0,255,140,.08)', x:'-5%', y:'-15%', size:'55%' },
    { color:'rgba(0,180,255,.06)', x:'88%', y:'65%',  size:'45%' },
    { color:'rgba(120,0,255,.04)', x:'45%', y:'90%',  size:'35%' },
  ],
  scanlines: true,

  header: {
    bg:          'rgba(3,5,10,.92)',
    logoGrad:    'linear-gradient(135deg,#00ff8c,#00ccff)',
    logoShadow:  '0 0 20px rgba(0,255,140,.5), 0 0 40px rgba(0,255,140,.2)',
    titleColor:  '#c8ffea',
    accentColor: 'rgba(0,255,140,.6)',
    statusDot:   '#00ff8c',
    metaColor:   '#0b1c12',
  },

  bubble: {
    user: {
      bg:     'rgba(0,180,255,.07)',
      border: 'rgba(0,180,255,.22)',
      color:  'rgba(180,240,255,.9)',
      shadow: '0 0 24px rgba(0,180,255,.12), 0 0 48px rgba(0,180,255,.06)',
      radius: '16px 4px 16px 16px',
    },
    ai: {
      bg:     'rgba(0,255,140,.04)',
      border: 'rgba(0,255,140,.12)',
      color:  'rgba(150,235,195,.85)',
      shadow: '0 0 20px rgba(0,255,140,.08)',
      radius: '4px 16px 16px 16px',
    },
    thinking: {
      color:   'rgba(0,255,140,.5)',
      dotBg:   'rgba(0,255,140,.4)',
      dotGlow: 'rgba(0,255,140,.6)',
    },
  },

  chip:  { border:'rgba(0,255,140,.2)', bg:'rgba(0,255,140,.04)', color:'rgba(0,220,130,.7)', check:'rgba(0,255,140,.5)' },
  code:  { bg:'rgba(0,0,0,.6)', border:'1px solid rgba(0,255,140,.1)', color:'rgba(0,230,120,.65)' },
  input: {
    focusBorder: 'rgba(0,255,140,.35)',
    focusShadow: '0 0 0 3px rgba(0,255,140,.07)',
    caret:       '#00ff8c',
    sendGrad:    'linear-gradient(135deg,#00ff8c,#00ccaa)',
    sendShadow:  '0 0 16px rgba(0,255,140,.4), 0 0 32px rgba(0,255,140,.2)',
  },
  slash: { cmdColor:'rgba(0,255,140,.9)', descColor:'#0b1c12' },
  pulse: '#00ff8c',

  css: `
    @keyframes neonFlicker {
      0%,19%,21%,23%,25%,54%,56%,100% { opacity:1; }
      20%,24%,55% { opacity:.6; }
    }
    @keyframes neonPulse {
      0%,100% { opacity:.85; filter:brightness(1); }
      50%     { opacity:1;   filter:brightness(1.15); }
    }
    @keyframes neonScan {
      0%   { transform:translateY(-100%); }
      100% { transform:translateY(100vh); }
    }
    @keyframes gridPan {
      0%   { background-position:0 0; }
      100% { background-position:40px 40px; }
    }
    .neon-text {
      text-shadow:0 0 7px #00ff8c, 0 0 14px #00ff8c88, 0 0 28px #00ff8c44;
      animation:neonFlicker 6s linear infinite;
    }
    .neon-border      { box-shadow:0 0 6px rgba(0,255,140,.5), 0 0 14px rgba(0,255,140,.25), inset 0 0 6px rgba(0,255,140,.08); }
    .neon-border-blue { box-shadow:0 0 6px rgba(0,180,255,.5), 0 0 14px rgba(0,180,255,.25), inset 0 0 6px rgba(0,180,255,.08); }
  `,

  // Neon uses a multi-layer glow formula + blue userBubble — all fx overridden
  fx: {
    glowBorder: (color = '#00ff8c', intensity = 1) => ({
      boxShadow: `0 0 ${6*intensity}px ${color}88, 0 0 ${14*intensity}px ${color}44, inset 0 0 ${5*intensity}px ${color}11`,
    }),
    aiBubble:   () => ({ boxShadow: '0 0 20px rgba(0,255,140,.08), 0 0 40px rgba(0,255,140,.04)' }),
    userBubble: () => ({ boxShadow: '0 0 20px rgba(0,180,255,.14), 0 0 40px rgba(0,180,255,.06)' }),
    glowText:   (color = '#00ff8c') => ({
      textShadow: `0 0 7px ${color}, 0 0 14px ${color}88, 0 0 28px ${color}44`,
    }),
    codeBlock:  () => ({ boxShadow: '0 0 1px rgba(0,255,140,.2), 0 0 8px rgba(0,255,140,.06)' }),
    chipOk:     () => ({ boxShadow: '0 0 8px rgba(0,255,140,.25)' }),
    inputFocus: () => ({ boxShadow: '0 0 0 1px rgba(0,255,140,.3), 0 0 12px rgba(0,255,140,.12)' }),
  },
});
