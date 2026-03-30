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
describe('buildSrcdoc', () => {
  bench('empty tabs', () => {
    buildSrcdoc(TABS_EMPTY);
  });

  bench('js only', () => {
    buildSrcdoc(TABS_JS_ONLY);
  });

  bench('html + css + js', () => {
    buildSrcdoc(TABS_HTML_CSS_JS);
  });
});
