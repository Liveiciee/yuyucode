# Themes

YuyuCode ships with four built-in themes and a `mybrand.js` template for custom themes. Every component reads colour tokens from the active theme — zero hardcoded colours in component JSX.

## Built-in Themes

| Theme | Key | Character |
|-------|-----|-----------|
| Obsidian Warm | `obsidian` | Dark amber, CRT scanlines, phosphor glow |
| Aurora | `aurora` | Cool greens and teals, northern lights |
| Ink | `ink` | Near-black, minimal, typographic |
| Neon | `neon` | High contrast, vivid accents |

Switch with `/theme` → opens the theme builder panel.

---

## Token Structure

Every theme exports a flat token object. Components receive this as the `T` prop:

```javascript
const theme = {
  // ── Global colours ─────────────────────────────
  bg:           '#0e0c09',   // main background
  bg2:          '#131108',   // elevated surface
  bg3:          '#1a1710',   // card / panel
  border:       'rgba(255,255,255,.05)',
  borderSoft:   'rgba(255,255,255,.03)',
  text:         '#ede8d8',   // primary text
  textSec:      '#c4bc9c',   // secondary text
  textMute:     '#3a3428',   // muted / placeholder

  accent:       '#d97706',               // primary accent
  accentBg:     'rgba(217,119,6,.09)',
  accentBorder: 'rgba(217,119,6,.22)',

  success:      '#4ade80',
  successBg:    'rgba(74,222,128,.08)',
  error:        '#f87171',
  errorBg:      'rgba(248,113,113,.1)',
  warning:      '#fbbf24',
  warningBg:    'rgba(251,191,36,.08)',

  // ── Atmosphere (background glow blobs) ─────────
  atm: [
    { color: 'rgba(217,119,6,.06)', x: '88%', y: '55%', size: '55%' },
    { color: 'rgba(99,102,241,.03)', x: '-12%', y: '-18%', size: '48%' },
  ],
  scanlines: true,  // enable CRT scanline effect

  // ── Component-specific tokens ───────────────────
  header: { bg, logoGrad, logoShadow, titleColor, accentColor, statusDot, metaColor },
  bubble: {
    user:     { bg, border, color, shadow, radius },
    ai:       { bg, border, color, shadow, radius },
    thinking: { color, dotBg, dotGlow },
  },
  chip:  { border, bg, color, check },
  code:  { bg, border, color },
  input: { focusBorder, focusShadow, caret, sendGrad, sendShadow },
  slash: { cmdColor, descColor },
  pulse: 'rgba(217,119,6,.5)',

  // ── CSS injected into <ThemeEffects> ───────────
  css: `
    @keyframes crtScan { ... }
    .crt-flicker { ... }
  `,

  // ── Dynamic effect functions ────────────────────
  fx: {
    aiBubble:   () => ({ boxShadow: '...' }),
    userBubble: () => ({ boxShadow: '...' }),
    glowBorder: (color, intensity) => ({ boxShadow: '...' }),
    codeBlock:  () => ({ boxShadow: '...' }),
    chipOk:     () => ({ boxShadow: '...' }),
    glowText:   (color) => ({ textShadow: '...' }),
    inputFocus: () => ({ boxShadow: '...' }),
  },
};
```

---

## Creating a Custom Theme

`src/themes/mybrand.js` is a template. Copy it, modify the tokens, then register it:

**1. Copy the template:**
```bash
cp src/themes/mybrand.js src/themes/mytheme.js
```

**2. Edit `src/themes/mytheme.js`:**
```javascript
const theme = {
  name: 'My Theme',
  bg:     '#0d0d0d',
  accent: '#7c3aed',   // change to your brand colour
  // ... rest of tokens
};
export default theme;
```

**3. Register in `src/themes/index.js`:**
```javascript
import mytheme from './mytheme.js';

export const THEMES_MAP = {
  obsidian,
  aurora,
  ink,
  neon,
  mytheme,   // add here
};
```

The theme is immediately available in `/theme`.

---

## Atmosphere Effects

The `atm` array defines radial gradient blobs rendered behind all content:

```javascript
atm: [
  { color: 'rgba(124,58,237,.08)', x: '80%', y: '20%', size: '60%' },
  { color: 'rgba(16,185,129,.04)', x: '-10%', y: '70%', size: '45%' },
],
```

Each blob: `color` (rgba with low opacity), `x`/`y` (CSS position), `size` (CSS percentage). Up to any number of blobs — typically 2–3 for performance on ARM64.

## CRT / Scanlines

```javascript
scanlines: true,
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
`
```

`scanlines: true` enables the sweep animation. The `css` string is injected into `<ThemeEffects>` via a `<style>` tag. Use it for theme-specific keyframes, class definitions, or any CSS that needs to be globally available.

## Dynamic Effects (`fx`)

The `fx` functions return inline style objects — called at render time for effects that need to respond to state:

```javascript
// Component usage
style={{ ...T.fx?.glowBorder(T.accent, 1.5) }}
style={{ ...T.fx?.glowText(T.accent) }}
```

This lets themes define glow intensities, shadow colours, and blur radii without hardcoding them in components.
