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
describe('extractSymbols', () => {
  bench('small file (4 lines)', () => {
    extractSymbols(SMALL_CODE, 'App.jsx');
  });

  bench('realistic component (~50 lines)', () => {
    extractSymbols(REALISTIC_COMPONENT, 'useAgentLoop.js');
  });

  bench('large file (10 components, ~500 lines)', () => {
    extractSymbols(LARGE_COMPONENT, 'hooks.js');
  });

  bench('non-code file (early return)', () => {
    extractSymbols('body { color: red }', 'style.css');
  });
}
