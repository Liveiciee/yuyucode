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
describe('generateDiff (Myers)', () => {
  bench('small diff (4 lines)', () => {
    generateDiff(SMALL_CODE, SMALL_CODE.replace('Hello', 'World'));
  });

  bench('large diff (500 lines, many changes)', () => {
    generateDiff(LARGE_CODE, LARGE_CODE_MODIFIED);
  });

  bench('identical (no diff)', () => {
    generateDiff(LARGE_CODE, LARGE_CODE);
  });
}
