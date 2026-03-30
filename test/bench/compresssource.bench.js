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
describe('compressSource', () => {
  bench('small file (4 lines)', () => {
    compressSource(SMALL_CODE, 'App.jsx');
  });

  bench('realistic component (~50 lines)', () => {
    compressSource(REALISTIC_COMPONENT, 'useAgentLoop.js');
  });

  bench('large file (500 lines)', () => {
    compressSource(LARGE_CODE, 'utils.js');
  });

  bench('large component (10x realistic, ~500 lines)', () => {
    compressSource(LARGE_COMPONENT, 'hooks.js');
  });

  bench('non-code file (early return)', () => {
    compressSource('body { color: red }', 'style.css');
  });
}
