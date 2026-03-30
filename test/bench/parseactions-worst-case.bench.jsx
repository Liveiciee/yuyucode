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
describe('parseActions — worst case', () => {
  bench('100 fake action blocks (all invalid JSON)', () => {
    parseActions(ACTION_PATHOLOGICAL);
  });

  bench('20 valid action blocks', () => {
    parseActions(ACTION_20_VALID);
  });

  bench('empty string', () => {
    parseActions('');
  });

  bench('10MB-ish text — no actions', () => {
    parseActions('x'.repeat(100_000));
  });
});
