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
} from './_helpers.js';

// Fixtures (keep them defined per file to avoid cross-contamination)
describe('getLangExt', () => {
  bench('single call — jsx', () => {
    getLangExt('App.jsx');
  });

  bench('10 mixed extensions', () => {
    EXTENSIONS.forEach(f => getLangExt(f));
  });
}
