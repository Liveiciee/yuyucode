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
describe('compressSource — stress & edge cases', () => {
  bench('5000 line file', () => {
    compressSource(STRESS_5000, 'stress.js');
  });

  bench('200 unique symbol names (compression resistant)', () => {
    compressSource(LARGE_UNIQUE_SYMBOLS, 'symbols.js');
  });

  bench('unicode source', () => {
    compressSource(UNICODE_CODE, 'unicode.jsx');
  });

  bench('empty string', () => {
    compressSource('', 'empty.js');
  });

  bench('single line (1 char)', () => {
    compressSource('x', 'x.js');
  });
});
