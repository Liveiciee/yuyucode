// ── Aurora Glass ───────────────────────────────────────────────────────────────
// Efek: glassmorphism real, aurora bands bergerak, backdrop blur, refraction
// ─────────────────────────────────────────────────────────────────────────────

const theme = {
  name: 'Aurora Glass',

  bg:           '#080612',
  bg2:          'rgba(12,9,22,.95)',
  bg3:          '#100e1e',
  border:       'rgba(255,255,255,.07)',
  borderSoft:   'rgba(255,255,255,.04)',
  text:         '#ece8ff',
  textSec:      '#b8b0d8',
  textMute:     '#2e2a48',
  accent:       '#8b5cf6',
  accentBg:     'rgba(139,92,246,.12)',
  accentBorder: 'rgba(139,92,246,.28)',
  success:      '#34d399',
  successBg:    'rgba(52,211,153,.08)',
  error:        '#f87171',
  errorBg:      'rgba(248,113,113,.1)',
  warning:      '#fbbf24',
  warningBg:    'rgba(251,191,36,.08)',

  atm: [
    { color:'rgba(99,102,241,.18)',  x:'-10%', y:'-20%', size:'65%' },
    { color:'rgba(236,72,153,.12)',  x:'85%',  y:'55%',  size:'55%' },
    { color:'rgba(52,211,153,.08)',  x:'40%',  y:'80%',  size:'40%' },
    { color:'rgba(251,191,36,.06)',  x:'80%',  y:'-10%', size:'30%' },
  ],
  scanlines: false,

  header: {
    bg:          'rgba(8,6,18,.85)',
    logoGrad:    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    logoShadow:  '0 4px 20px rgba(139,92,246,.4)',
    titleColor:  '#ece8ff',
    accentColor: 'rgba(139,92,246,.7)',
    statusDot:   'rgba(52,211,153,.6)',
    metaColor:   '#2e2a48',
  },

  bubble: {
    user: {
      bg:     'rgba(139,92,246,.12)',
      border: 'rgba(139,92,246,.24)',
      color:  '#e8e0ff',
      shadow: '0 4px 24px rgba(139,92,246,.16)',
      radius: '16px 4px 16px 16px',
    },
    ai: {
      bg:     'rgba(255,255,255,.05)',
      border: 'rgba(255,255,255,.1)',
      color:  '#c0b8e8',
      shadow: '0 4px 20px rgba(0,0,0,.2)',
      radius: '4px 16px 16px 16px',
    },
    thinking: {
      color:   'rgba(139,92,246,.55)',
      dotBg:   'rgba(99,102,241,.4)',
      dotGlow: 'rgba(139,92,246,.5)',
    },
  },

  chip:  { border:'rgba(139,92,246,.22)', bg:'rgba(139,92,246,.07)', color:'rgba(167,139,250,.75)', check:'rgba(52,211,153,.5)' },
  code:  { bg:'rgba(8,6,18,.7)',          border:'1px solid rgba(139,92,246,.12)', color:'rgba(185,160,255,.65)' },
  input: {
    focusBorder: 'rgba(139,92,246,.35)',
    focusShadow: '0 0 0 3px rgba(139,92,246,.08)',
    caret: '#a78bfa',
    sendGrad: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    sendShadow: '0 4px 16px rgba(139,92,246,.4)',
  },
  slash: { cmdColor:'rgba(167,139,250,.9)', descColor:'#2e2a48' },
  pulse: 'rgba(139,92,246,.6)',

  css: `
    @keyframes auroraFloat1 {
      0%,100% { transform:translate(0,0) scale(1); }
      33%     { transform:translate(3%,2%) scale(1.04); }
      66%     { transform:translate(-2%,3%) scale(.97); }
    }
    @keyframes auroraFloat2 {
      0%,100% { transform:translate(0,0) scale(1); }
      40%     { transform:translate(-4%,-2%) scale(1.06); }
      75%     { transform:translate(3%,-3%) scale(.95); }
    }
    @keyframes auroraFloat3 {
      0%,100% { transform:translate(0,0) scale(1); }
      50%     { transform:translate(2%,4%) scale(1.08); }
    }
    @keyframes glassShimmer {
      0%,100% { opacity:.07; }
      50%     { opacity:.13; }
    }
    .aurora-bubble-user {
      backdrop-filter: blur(16px) saturate(1.5);
      -webkit-backdrop-filter: blur(16px) saturate(1.5);
    }
    .aurora-bubble-ai {
      backdrop-filter: blur(12px) saturate(1.3);
      -webkit-backdrop-filter: blur(12px) saturate(1.3);
    }
    .aurora-chip {
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
  `,

  fx: {
    aiBubble: () => ({
      backdropFilter: 'blur(12px) saturate(1.3)',
      WebkitBackdropFilter: 'blur(12px) saturate(1.3)',
    }),
    userBubble: () => ({
      backdropFilter: 'blur(16px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
      boxShadow: '0 8px 32px rgba(139,92,246,.18), inset 0 1px 0 rgba(255,255,255,.1)',
    }),
    glowBorder: (color='#8b5cf6') => ({
      boxShadow: `0 0 0 1px ${color}22, 0 4px 20px ${color}18`,
    }),
    codeBlock: () => ({
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05)',
    }),
    chipOk: () => ({
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }),
    glowText: () => ({}), // Aurora tidak pakai text glow
    inputFocus: () => ({
      boxShadow: '0 0 0 1px rgba(139,92,246,.35), 0 0 24px rgba(139,92,246,.12)',
      backdropFilter: 'blur(4px)',
    }),
  },
};

export default theme;
