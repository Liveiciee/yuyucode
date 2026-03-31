// @vitest-environment node
import { describe, bench } from 'vitest';
import {
  compressSource,
  STRESS_5000,
  LARGE_UNIQUE_SYMBOLS,
  UNICODE_CODE,
} from './_helpers.jsx';

describe('compressSource — stress & edge cases', () => {
  bench('5000 line file', () => {
    return compressSource(STRESS_5000, 'stress.js');
  });

  bench('200 unique symbol names (compression resistant)', () => {
    return compressSource(LARGE_UNIQUE_SYMBOLS, 'symbols.js');
  });

  bench('unicode source', () => {
    return compressSource(UNICODE_CODE, 'unicode.jsx');
  });

  bench('empty string', () => {
    return compressSource('', 'empty.js');
  });

  bench('single line (1 char)', () => {
    return compressSource('x', 'x.js');
  });
});
