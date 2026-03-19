// ── Neon Terminal ─────────────────────────────────────────────────────────────
const theme = {
  name: 'Neon Terminal',

  bg:           '#030508',
  bg2:          'rgba(4,7,10,.95)',
  bg3:          '#0a0f14',
  border:       'rgba(0,255,140,.08)',
  borderSoft:   'rgba(0,255,140,.04)',
  text:         '#d0ffe8',
  textSec:      'rgba(160,240,200,.75)',
  textMute:     '#0e2016',
  accent:       '#00c875',
  accentBg:     'rgba(0,255,140,.08)',
  accentBorder: 'rgba(0,255,140,.2)',
  success:      '#00ff8c',
  successBg:    'rgba(0,255,140,.08)',
  error:        '#f87171',
  errorBg:      'rgba(248,113,113,.1)',
  warning:      '#fbbf24',
  warningBg:    'rgba(251,191,36,.08)',

  atm: [
    { color: 'rgba(0,255,140,.05)', x: '-10%', y: '-10%', size: '50%' },
    { color: 'rgba(0,200,255,.03)', x: '90%',  y: '70%',  size: '40%' },
  ],
  scanlines: true,

  header: {
    bg:          'rgba(4,7,10,.9)',
    logoGrad:    'linear-gradient(135deg,#00ff8c,#00c8ff)',
    logoShadow:  '0 4px 16px rgba(0,255,140,.2)',
    titleColor:  '#d0ffe8',
    accentColor: 'rgba(0,255,140,.5)',
    statusDot:   'rgba(0,255,140,.55)',
    metaColor:   '#0e2016',
  },

  bubble: {
    user: { bg:'rgba(0,200,255,.06)', border:'rgba(0,200,255,.18)', color:'rgba(180,235,255,.85)', shadow:'0 0 20px rgba(0,200,255,.06)', radius:'16px 4px 16px 16px' },
    ai:   { bg:'rgba(0,255,140,.04)', border:'rgba(0,255,140,.1)',  color:'rgba(160,240,200,.75)', shadow:'0 0 20px rgba(0,255,140,.04)', radius:'4px 16px 16px 16px' },
    thinking: { color:'rgba(0,255,140,.35)', dotBg:'rgba(0,255,140,.3)', dotGlow:'rgba(0,255,140,.4)' },
  },

  chip:  { border:'rgba(0,255,140,.18)', bg:'rgba(0,255,140,.04)', color:'rgba(0,220,120,.55)', check:'rgba(0,255,140,.4)' },
  code:  { bg:'rgba(0,0,0,.5)', border:'1px solid rgba(0,255,140,.08)', color:'rgba(0,220,120,.6)' },
  input: { focusBorder:'rgba(0,255,140,.3)', focusShadow:'0 0 0 3px rgba(0,255,140,.06)', caret:'#00ff8c', sendGrad:'linear-gradient(135deg,#00c875,#00a860)', sendShadow:'0 3px 12px rgba(0,255,140,.25)' },
  slash: { cmdColor:'rgba(0,255,140,.8)', descColor:'#0e2016' },
  pulse: 'rgba(0,255,140,.5)',
};

export default theme;
