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
describe('extractImports', () => {
  bench('small file — 1 import', () => {
    extractImports(SMALL_CODE);
  });

  bench('realistic component — 3 imports', () => {
    extractImports(REALISTIC_COMPONENT);
  });

  bench('no imports', () => {
    extractImports(LARGE_CODE);
  });
}
