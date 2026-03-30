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
describe('extractSymbols — stress & edge cases', () => {
  bench('5000 line file', () => {
    extractSymbols(STRESS_5000, 'stress.js');
  });

  bench('unicode source', () => {
    extractSymbols(UNICODE_CODE, 'unicode.jsx');
  });

  bench('deeply nested (50 levels)', () => {
    extractSymbols(DEEPLY_NESTED, 'nested.js');
  });

  bench('200 unique symbols', () => {
    extractSymbols(LARGE_UNIQUE_SYMBOLS, 'symbols.js');
  });

  bench('empty string', () => {
    extractSymbols('', 'empty.js');
  });
});
