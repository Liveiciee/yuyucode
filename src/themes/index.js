// ── Theme Registry ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

import obsidian from './obsidian.js';
import aurora   from './aurora.js';
import ink      from './ink.js';
import neon     from './neon.js';

export const THEMES_MAP = {
  obsidian,
  aurora,
  ink,
  neon,
};

export const THEME_KEYS = Object.keys(THEMES_MAP);

export const DEFAULT_THEME = 'obsidian';
