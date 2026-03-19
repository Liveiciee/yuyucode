// ── Ink & Paper ───────────────────────────────────────────────────────────────
const theme = {
  name: 'Ink & Paper',

  bg:           '#0e0e0e',
  bg2:          '#131313',
  bg3:          '#1a1816',
  border:       'rgba(255,255,255,.05)',
  borderSoft:   'rgba(255,255,255,.03)',
  text:         '#f0ece4',
  textSec:      '#b8b0a4',
  textMute:     '#3a3228',
  accent:       '#c8a97e',
  accentBg:     'rgba(200,169,126,.1)',
  accentBorder: 'rgba(200,169,126,.2)',
  success:      '#4ade80',
  successBg:    'rgba(74,222,128,.08)',
  error:        '#f87171',
  errorBg:      'rgba(248,113,113,.1)',
  warning:      '#fbbf24',
  warningBg:    'rgba(251,191,36,.08)',

  atm: [
    { color: 'rgba(200,169,126,.04)', x: '50%', y: '-10%', size: '80%' },
  ],
  scanlines: false,

  header: {
    bg:          '#131313',
    logoGrad:    'linear-gradient(135deg,#c8a97e,#8a6a40)',
    logoShadow:  '0 4px 14px rgba(200,169,126,.2)',
    titleColor:  '#f0ece4',
    accentColor: 'rgba(200,169,126,.55)',
    statusDot:   'rgba(200,169,126,.45)',
    metaColor:   '#2e2a24',
  },

  bubble: {
    user: { bg:'#181614', border:'rgba(200,169,126,.14)', color:'#e8e0d0', shadow:'0 2px 16px rgba(0,0,0,.4)', radius:'16px 4px 16px 16px' },
    ai:   { bg:'#141210', border:'rgba(255,255,255,.05)',  color:'#b8b0a4', shadow:'none', radius:'4px 16px 16px 16px' },
    thinking: { color:'rgba(200,169,126,.38)', dotBg:'rgba(200,169,126,.28)', dotGlow:'rgba(200,169,126,.3)' },
  },

  chip:  { border:'rgba(200,169,126,.18)', bg:'rgba(200,169,126,.05)', color:'rgba(200,169,126,.55)', check:'rgba(200,169,126,.4)' },
  code:  { bg:'rgba(0,0,0,.45)', border:'1px solid rgba(200,169,126,.08)', color:'rgba(200,169,126,.55)' },
  input: { focusBorder:'rgba(200,169,126,.22)', focusShadow:'0 0 0 3px rgba(200,169,126,.05)', caret:'#c8a97e', sendGrad:'linear-gradient(135deg,#c8a97e,#8a6a40)', sendShadow:'0 3px 12px rgba(200,169,126,.25)' },
  slash: { cmdColor:'rgba(200,169,126,.8)', descColor:'#302820' },
  pulse: 'rgba(200,169,126,.45)',
};

export default theme;
