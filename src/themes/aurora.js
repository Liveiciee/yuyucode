// ── Aurora Glass ──────────────────────────────────────────────────────────────
const theme = {
  name: 'Aurora Glass',

  bg:           '#0d0c14',
  bg2:          'rgba(16,14,22,.95)',
  bg3:          '#1a1828',
  border:       'rgba(255,255,255,.06)',
  borderSoft:   'rgba(255,255,255,.03)',
  text:         '#e8e4ff',
  textSec:      '#c4bccc',
  textMute:     '#3a3458',
  accent:       '#6366f1',
  accentBg:     'rgba(99,102,241,.13)',
  accentBorder: 'rgba(99,102,241,.25)',
  success:      '#4ade80',
  successBg:    'rgba(74,222,128,.08)',
  error:        '#f87171',
  errorBg:      'rgba(248,113,113,.1)',
  warning:      '#fbbf24',
  warningBg:    'rgba(251,191,36,.08)',

  atm: [
    { color: 'rgba(99,102,241,.13)', x: '-15%', y: '-20%', size: '60%' },
    { color: 'rgba(236,72,153,.09)', x: '90%',  y: '60%',  size: '50%' },
  ],
  scanlines: true,

  header: {
    bg:          'rgba(16,14,22,.88)',
    logoGrad:    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    logoShadow:  '0 4px 16px rgba(99,102,241,.3)',
    titleColor:  '#e8e4ff',
    accentColor: 'rgba(139,92,246,.65)',
    statusDot:   'rgba(139,92,246,.5)',
    metaColor:   '#2e2a40',
  },

  bubble: {
    user: { bg:'rgba(99,102,241,.13)', border:'rgba(99,102,241,.22)', color:'#dddaf5', shadow:'0 4px 20px rgba(99,102,241,.12)', radius:'16px 4px 16px 16px' },
    ai:   { bg:'rgba(255,255,255,.035)', border:'rgba(255,255,255,.06)', color:'#c4bccc', shadow:'0 2px 12px rgba(0,0,0,.2)', radius:'4px 16px 16px 16px' },
    thinking: { color:'rgba(139,92,246,.45)', dotBg:'rgba(99,102,241,.35)', dotGlow:'rgba(99,102,241,.4)' },
  },

  chip:  { border:'rgba(139,92,246,.2)', bg:'rgba(139,92,246,.06)', color:'rgba(160,130,246,.65)', check:'rgba(139,92,246,.5)' },
  code:  { bg:'rgba(0,0,0,.4)', border:'1px solid rgba(139,92,246,.1)', color:'rgba(180,160,255,.65)' },
  input: { focusBorder:'rgba(139,92,246,.3)', focusShadow:'0 0 0 3px rgba(139,92,246,.07)', caret:'#8b5cf6', sendGrad:'linear-gradient(135deg,#6366f1,#8b5cf6)', sendShadow:'0 3px 12px rgba(99,102,241,.35)' },
  slash: { cmdColor:'rgba(139,92,246,.85)', descColor:'#342e50' },
  pulse: 'rgba(139,92,246,.5)',
};

export default theme;
