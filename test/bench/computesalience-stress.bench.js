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
describe('computeSalience — stress', () => {
  bench('200 files with cross-imports', () => {
    const importCount = {};
    for (const d of SALIENCE_200) {
      for (const dep of extractImports(d.src)) {
        for (const key of SALIENCE_200.map(f => f.rel)) {
          const base = key.replace(/\.(jsx?|tsx?)$/, '').split('/').pop();
          if (dep === base || dep.endsWith('/' + base)) {
            importCount[key] = (importCount[key] || 0) + 1;
          }
        }
      }
    }
    for (const d of SALIENCE_200) {
      const importedBy = importCount[d.rel] || 0;
      d.salience = (importedBy * 3) + 1 + Math.round(1000 / Math.max(d.lines, 1));
    }
  });
}
