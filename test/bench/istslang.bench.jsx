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
describe('isTsLang', () => {
  bench('single call — ts', () => {
    isTsLang('types.ts');
  });

  bench('10 mixed', () => {
    EXTENSIONS.forEach(f => isTsLang(f));
  });
});
