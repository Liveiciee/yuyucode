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
describe('parseActions (agent loop hot path)', () => {
  bench('no action blocks', () => {
    parseActions(ACTION_NONE);
  });

  bench('1 action block', () => {
    parseActions(ACTION_ONE);
  });

  bench('5 action blocks', () => {
    parseActions(ACTION_FIVE);
  });

  bench('mixed — valid + invalid + non-action blocks', () => {
    parseActions(ACTION_MIXED);
  });
});
