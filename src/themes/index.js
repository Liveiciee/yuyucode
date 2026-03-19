// ── Theme Registry ────────────────────────────────────────────────────────────
// Tambah theme baru di sini:
//   1. Buat file di src/themes/namabaru.js (copy dari template)
//   2. import namabaru from './namabaru.js'
//   3. Tambah ke THEMES_MAP
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

// Key yang valid untuk disimpan ke Preferences
export const THEME_KEYS = Object.keys(THEMES_MAP);

// Default fallback
export const DEFAULT_THEME = 'obsidian';
