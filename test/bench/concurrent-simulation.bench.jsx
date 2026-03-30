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
describe('concurrent simulation', () => {
  bench('10 extractSymbols in parallel (Promise.all)', async () => {
    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        Promise.resolve(extractSymbols(REALISTIC_COMPONENT, `file${i}.js`))
      )
    );
  });

  bench('10 compressSource in parallel', async () => {
    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        Promise.resolve(compressSource(REALISTIC_COMPONENT, `file${i}.js`))
      )
    );
  });

  bench('10 generateDiff in parallel', async () => {
    await Promise.all(
      Array.from({ length: 10 }, () =>
        Promise.resolve(generateDiff(LARGE_CODE, LARGE_CODE_MODIFIED))
      )
    );
  });

  bench('50 parseActions in parallel', async () => {
    await Promise.all(
      Array.from({ length: 50 }, () =>
        Promise.resolve(parseActions(ACTION_MIXED))
      )
    );
  });

  bench('mixed workload — 5 ops all types concurrently', async () => {
    await Promise.all([
      Promise.resolve(extractSymbols(REALISTIC_COMPONENT, 'a.js')),
      Promise.resolve(compressSource(REALISTIC_COMPONENT, 'b.js')),
      Promise.resolve(generateDiff(LARGE_CODE, LARGE_CODE_MODIFIED)),
      Promise.resolve(parseActions(ACTION_FIVE)),
      Promise.resolve(extractImports(FIFTY_IMPORTS)),
    ]);
  });
});
