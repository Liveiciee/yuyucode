// @vitest-environment node
import { describe, bench } from 'vitest';
import {
  getLangExt,
  isEmmetLang,
  isTsLang,
  buildSrcdoc,
  generateDiff,
  parseActions,
  extractSymbols,
  compressSource,
  extractImports,
  computeSalience,
} from './_helpers.jsx';

// Fixtures (keep them defined per file to avoid cross-contamination)
describe('generateDiff — stress & worst case', () => {
  bench('5000 lines identical (no diff — best case)', () => {
    generateDiff(STRESS_5000, STRESS_5000);
  });

  bench('5000 lines all changed (worst case Myers)', () => {
    generateDiff(STRESS_5000, STRESS_5000_ALL_CHANGED);
  });

  bench('unicode diff', () => {
    generateDiff(UNICODE_CODE, UNICODE_CODE.replace('☕', '🍵').replace('🗾', '🌏'));
  });

  bench('empty → 500 lines (insert everything)', () => {
    generateDiff('', LARGE_CODE);
  });

  bench('500 lines → empty (delete everything)', () => {
    generateDiff(LARGE_CODE, '');
  });
});
