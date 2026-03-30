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
describe('extractImports — stress & edge cases', () => {
  bench('50 imports', () => {
    extractImports(FIFTY_IMPORTS);
  });

  bench('unicode import paths', () => {
    extractImports(`import { fn } from './módulo-ñoño.js';\nimport { x } from './日本語.js';`);
  });

  bench('empty string', () => {
    extractImports('');
  });

  bench('malformed import (no from)', () => {
    extractImports(`import something broken\nexport default null;`);
  });
});
