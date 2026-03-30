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
describe('isEmmetLang', () => {
  bench('single call — jsx', () => {
    isEmmetLang('App.jsx');
  });

  bench('10 mixed', () => {
    EXTENSIONS.forEach(f => isEmmetLang(f));
  });
});
