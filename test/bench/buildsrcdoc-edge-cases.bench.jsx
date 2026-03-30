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
describe('buildSrcdoc — edge cases', () => {
  bench('giant JS (500 lines)', () => {
    buildSrcdoc([{ path: 'app.js', content: LARGE_CODE }]);
  });

  bench('20 tabs (only first html/css/js matter)', () => {
    buildSrcdoc(TABS_200.slice(0, 20));
  });

  bench('unicode content', () => {
    buildSrcdoc([{ path: 'app.jsx', content: UNICODE_CODE }]);
  });
});
