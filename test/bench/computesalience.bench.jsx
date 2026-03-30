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
describe('computeSalience', () => {
  bench('20 pre-built file data objects', () => {
    // Pure scoring pass — no disk I/O, uses pre-built fixtures
    const importCount = {};
    for (const d of SALIENCE_FILES) {
      for (const dep of extractImports(d.src)) {
        for (const key of SALIENCE_FILES.map(f => f.rel)) {
          const base = key.replace(/\.(jsx?|tsx?)$/, '').split('/').pop();
          if (dep === base || dep.endsWith('/' + base)) {
            importCount[key] = (importCount[key] || 0) + 1;
          }
        }
      }
    }
    for (const d of SALIENCE_FILES) {
      const importedBy = importCount[d.rel] || 0;
      d.salience = (importedBy * 3) + 1 + Math.round(1000 / Math.max(d.lines, 1));
    }
  });
});
