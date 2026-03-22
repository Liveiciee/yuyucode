// ── Ink & Paper ────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

const theme = {
  name: 'Ink & Paper',

  bg:           '#0c0b09',
  bg2:          '#111009',
  bg3:          '#171510',
  border:       'rgba(210,190,150,.08)',
  borderSoft:   'rgba(210,190,150,.04)',
  text:         '#f0ece0',
  textSec:      '#b8b09a',
  textMute:     '#3a3228',
  accent:       '#c8a97e',
  accentBg:     'rgba(200,169,126,.1)',
  accentBorder: 'rgba(200,169,126,.22)',
  success:      '#7ec882',
  successBg:    'rgba(126,200,130,.08)',
  error:        '#c87e7e',
  errorBg:      'rgba(200,126,126,.1)',
  warning:      '#c8b47e',
  warningBg:    'rgba(200,180,126,.08)',

  atm: [
    { color:'rgba(200,169,126,.05)', x:'50%', y:'-5%', size:'90%' },
  ],
  scanlines: false,

  header: {
    bg:          '#111009',
    logoGrad:    'linear-gradient(135deg,#c8a97e,#7a5c30)',
    logoShadow:  '0 2px 12px rgba(200,169,126,.2)',
    titleColor:  '#f0ece0',
    accentColor: 'rgba(200,169,126,.6)',
    statusDot:   'rgba(126,200,130,.5)',
    metaColor:   '#2e2820',
  },

  bubble: {
    user: {
      bg:     '#1a1712',
      border: 'rgba(200,169,126,.16)',
      color:  '#ece4d0',
      shadow: '0 2px 12px rgba(0,0,0,.5)',
      radius: '14px 4px 14px 14px',
    },
    ai: {
      bg:     'transparent',
      border: 'transparent',
      color:  '#b8b09a',
      shadow: 'none',
      radius: '0',
    },
    thinking: {
      color:   'rgba(200,169,126,.4)',
      dotBg:   'rgba(200,169,126,.3)',
      dotGlow: 'rgba(200,169,126,.2)',
    },
  },

  chip:  { border:'rgba(200,169,126,.16)', bg:'rgba(200,169,126,.05)', color:'rgba(200,169,126,.6)', check:'rgba(126,200,130,.4)' },
  code:  { bg:'rgba(0,0,0,.35)', border:'1px solid rgba(200,169,126,.1)', color:'rgba(200,169,126,.6)' },
  input: {
    focusBorder: 'rgba(200,169,126,.3)',
    focusShadow: '0 0 0 2px rgba(200,169,126,.06)',
    caret: '#c8a97e',
    sendGrad: 'linear-gradient(135deg,#c8a97e,#7a5c30)',
    sendShadow: '0 2px 10px rgba(200,169,126,.25)',
  },
  slash: { cmdColor:'rgba(200,169,126,.85)', descColor:'#302820' },
  pulse: 'rgba(200,169,126,.5)',

  css: `
    @keyframes inkGrainShift {
      0%   { transform:translate(0,0); }
      20%  { transform:translate(-1px,1px); }
      40%  { transform:translate(1px,-1px); }
      60%  { transform:translate(-1px,-1px); }
      80%  { transform:translate(1px,1px); }
      100% { transform:translate(0,0); }
    }
    /* Brushstroke hr divider */
    .ink-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(200,169,126,.3) 20%, rgba(200,169,126,.5) 50%, rgba(200,169,126,.3) 80%, transparent);
      position: relative;
    }
    .ink-divider::after {
      content: '';
      position: absolute;
      top: -1px; left: 30%; right: 30%;
      height: 3px;
      background: rgba(200,169,126,.12);
      filter: blur(2px);
    }
    /* AI message — no bubble, just left rule */
    .ink-ai-msg {
      border-left: 2px solid rgba(200,169,126,.2);
      padding-left: 14px;
      margin-left: 2px;
    }
  `,

  fx: {
    aiBubble: () => ({
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      borderLeft: '2px solid rgba(200,169,126,.2)',
      paddingLeft: '14px',
      borderRadius: '0',
    }),
    userBubble: () => ({
      boxShadow: '0 1px 4px rgba(0,0,0,.6)',
    }),
    glowBorder: () => ({}), // No glow in ink
    codeBlock: () => ({
      borderLeft: '3px solid rgba(200,169,126,.25)',
      borderRadius: '0 8px 8px 0',
    }),
    chipOk: () => ({}),
    glowText: () => ({}),
    inputFocus: () => ({
      boxShadow: 'inset 0 -1px 0 rgba(200,169,126,.35)',
    }),
  },
};

export default theme;
