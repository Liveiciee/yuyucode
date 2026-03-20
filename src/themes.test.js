import { describe, it, expect } from 'vitest';
import { THEMES_MAP, THEME_KEYS, DEFAULT_THEME } from './themes/index.js';

// ── Required top-level tokens every theme must have ──────────────────────────
const REQUIRED_GLOBAL = [
  'name', 'bg', 'bg2', 'bg3',
  'border', 'text', 'textSec', 'textMute',
  'accent', 'accentBg', 'accentBorder',
  'success', 'successBg', 'error', 'errorBg',
  'warning', 'warningBg',
  'atm', 'scanlines',
  'bubble', 'chip', 'code', 'input', 'slash', 'pulse',
  'css', 'fx', 'header', 'borderSoft',
];

const REQUIRED_BUBBLE  = ['user', 'ai', 'thinking'];
const REQUIRED_BUBBLE_LEAF = ['bg', 'border', 'color', 'shadow'];
const REQUIRED_FX      = ['aiBubble', 'userBubble', 'glowBorder', 'codeBlock', 'chipOk', 'glowText', 'inputFocus'];
const REQUIRED_INPUT   = ['focusBorder', 'focusShadow', 'caret', 'sendGrad', 'sendShadow'];
const REQUIRED_SLASH   = ['cmdColor', 'descColor'];
const REQUIRED_CHIP    = ['border', 'bg', 'color', 'check'];
const REQUIRED_CODE    = ['bg', 'border', 'color'];
const REQUIRED_HEADER  = ['bg', 'logoGrad', 'titleColor', 'accentColor', 'statusDot', 'metaColor'];

// ═══════════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════════
describe('Theme registry', () => {
  it('THEME_KEYS matches THEMES_MAP keys', () => {
    expect(THEME_KEYS).toEqual(Object.keys(THEMES_MAP));
  });

  it('DEFAULT_THEME is in THEMES_MAP', () => {
    expect(THEMES_MAP[DEFAULT_THEME]).toBeDefined();
  });

  it('has exactly 4 themes', () => {
    expect(THEME_KEYS).toHaveLength(4);
  });

  it('includes obsidian, aurora, ink, neon', () => {
    expect(THEME_KEYS).toContain('obsidian');
    expect(THEME_KEYS).toContain('aurora');
    expect(THEME_KEYS).toContain('ink');
    expect(THEME_KEYS).toContain('neon');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Per-theme schema validation
// ═══════════════════════════════════════════════════════════════════════════════
for (const key of ['obsidian', 'aurora', 'ink', 'neon']) {
  describe(`${key} theme schema`, () => {
    const T = THEMES_MAP[key];

    it('has all required global tokens', () => {
      for (const token of REQUIRED_GLOBAL) {
        expect(T, `${key} missing '${token}'`).toHaveProperty(token);
      }
    });

    it('name is a non-empty string', () => {
      expect(typeof T.name).toBe('string');
      expect(T.name.length).toBeGreaterThan(0);
    });

    it('bg/bg2/bg3 are colour strings', () => {
      for (const prop of ['bg', 'bg2', 'bg3']) {
        expect(typeof T[prop]).toBe('string');
        expect(T[prop].length).toBeGreaterThan(0);
      }
    });

    it('accent is a valid CSS colour string', () => {
      expect(typeof T.accent).toBe('string');
      expect(T.accent).toMatch(/^(#|rgba?)/);
    });

    it('atm is a non-empty array of orb objects', () => {
      expect(Array.isArray(T.atm)).toBe(true);
      expect(T.atm.length).toBeGreaterThan(0);
      for (const orb of T.atm) {
        expect(orb).toHaveProperty('color');
        expect(orb).toHaveProperty('x');
        expect(orb).toHaveProperty('y');
        expect(orb).toHaveProperty('size');
      }
    });

    it('scanlines is a boolean', () => {
      expect(typeof T.scanlines).toBe('boolean');
    });

    it('bubble has user, ai, thinking sub-objects', () => {
      for (const sub of REQUIRED_BUBBLE) {
        expect(T.bubble, `${key}.bubble missing '${sub}'`).toHaveProperty(sub);
      }
    });

    it('bubble.user and bubble.ai have required leaf tokens', () => {
      for (const leaf of REQUIRED_BUBBLE_LEAF) {
        expect(T.bubble.user, `bubble.user missing '${leaf}'`).toHaveProperty(leaf);
        expect(T.bubble.ai,   `bubble.ai missing '${leaf}'`).toHaveProperty(leaf);
      }
    });

    it('bubble.thinking has color, dotBg, dotGlow', () => {
      expect(T.bubble.thinking).toHaveProperty('color');
      expect(T.bubble.thinking).toHaveProperty('dotBg');
      expect(T.bubble.thinking).toHaveProperty('dotGlow');
    });

    it('chip has all required keys', () => {
      for (const k of REQUIRED_CHIP) {
        expect(T.chip, `chip missing '${k}'`).toHaveProperty(k);
      }
    });

    it('code has bg, border, color', () => {
      for (const k of REQUIRED_CODE) {
        expect(T.code, `code missing '${k}'`).toHaveProperty(k);
      }
    });

    it('input has required keys', () => {
      for (const k of REQUIRED_INPUT) {
        expect(T.input, `input missing '${k}'`).toHaveProperty(k);
      }
    });

    it('slash has cmdColor and descColor', () => {
      for (const k of REQUIRED_SLASH) {
        expect(T.slash, `slash missing '${k}'`).toHaveProperty(k);
      }
    });

    it('pulse is a colour string', () => {
      expect(typeof T.pulse).toBe('string');
      expect(T.pulse.length).toBeGreaterThan(0);
    });

    it('css is a non-empty string containing @keyframes', () => {
      expect(typeof T.css).toBe('string');
      expect(T.css.length).toBeGreaterThan(0);
      expect(T.css).toContain('@keyframes');
    });

    it('fx has all required function keys', () => {
      for (const k of REQUIRED_FX) {
        expect(typeof T.fx[k], `fx.${k} should be a function`).toBe('function');
      }
    });

    it('fx.aiBubble() returns a plain object', () => {
      const result = T.fx.aiBubble();
      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
      // Obsidian/Neon use boxShadow; Aurora uses backdropFilter; Ink uses borderLeft
      expect(Object.keys(result).length).toBeGreaterThanOrEqual(0);
    });

    it('fx.userBubble() returns a plain object', () => {
      const result = T.fx.userBubble();
      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
    });

    it('fx.glowBorder() returns a plain object', () => {
      const r1 = T.fx.glowBorder();
      const r2 = T.fx.glowBorder('#ff0000', 2);
      expect(typeof r1).toBe('object');
      expect(typeof r2).toBe('object');
    });

    it('fx.glowBorder uses provided color in output (when supported)', () => {
      const result = T.fx.glowBorder('#aabbcc', 1);
      // Some themes (Ink) return {} intentionally — just verify no throw
      expect(typeof result).toBe('object');
      if (result.boxShadow) {
        expect(result.boxShadow).toContain('#aabbcc');
      }
    });

    it('fx.glowText() returns a plain object', () => {
      const result = T.fx.glowText();
      expect(typeof result).toBe('object');
      // Aurora and Ink intentionally return {} (no text glow needed)
    });

    it('fx.inputFocus() returns a plain object', () => {
      expect(typeof T.fx.inputFocus()).toBe('object');
    });

    it('fx.codeBlock() returns a plain object', () => {
      expect(typeof T.fx.codeBlock()).toBe('object');
    });

    it('fx.chipOk() returns a plain object', () => {
      expect(typeof T.fx.chipOk()).toBe('object');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Cross-theme consistency
// ═══════════════════════════════════════════════════════════════════════════════
describe('Cross-theme consistency', () => {
  it('all themes have distinct accent colours', () => {
    const accents = THEME_KEYS.map(k => THEMES_MAP[k].accent);
    const unique = new Set(accents);
    expect(unique.size).toBe(THEME_KEYS.length);
  });

  it('all theme names are distinct', () => {
    const names = THEME_KEYS.map(k => THEMES_MAP[k].name);
    expect(new Set(names).size).toBe(THEME_KEYS.length);
  });

  it('all themes have the same set of top-level keys', () => {
    const keysets = THEME_KEYS.map(k => Object.keys(THEMES_MAP[k]).sort().join(','));
    expect(new Set(keysets).size).toBe(1);
  });
});
