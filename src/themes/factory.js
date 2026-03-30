// ── Theme Factory ─────────────────────────────────────────────────────────────
// Single source of truth for theme shape + default fx generators.
// Each theme file calls createTheme() and only overrides what's unique.
// Default fx are derived from `accent` (6-digit hex) using 8-digit hex alpha:
//   e.g. '#d97706' + '1a' → '#d977061a' (≈10% opacity) — valid CSS.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{ accent: string, fx?: object, [key: string]: any }} spec
 * @returns {import('./index').YuyuTheme}
 */
export function createTheme({ accent, fx: fxOverride = {}, ...rest }) {
  const defaultFx = {
    aiBubble:   () => ({ boxShadow: '0 2px 12px rgba(0,0,0,.4)' }),
    userBubble: () => ({ boxShadow: `0 0 12px ${accent}1a, 0 2px 16px rgba(0,0,0,.4)` }),
    glowBorder: (color = accent, intensity = 1) => ({
      boxShadow: `0 0 ${8 * intensity}px ${color}22, inset 0 0 ${4 * intensity}px ${color}08`,
    }),
    codeBlock:  () => ({ boxShadow: `0 0 1px ${accent}26, inset 0 0 6px rgba(0,0,0,.3)` }),
    chipOk:     () => ({ boxShadow: '0 0 6px rgba(0,200,110,.18)' }),
    glowText:   (color = accent) => ({ textShadow: `0 0 4px ${color}44` }),
    inputFocus: () => ({ boxShadow: `0 0 0 1px ${accent}40, 0 0 10px ${accent}1a` }),
  };

  return { accent, ...rest, fx: { ...defaultFx, ...fxOverride } };
}
