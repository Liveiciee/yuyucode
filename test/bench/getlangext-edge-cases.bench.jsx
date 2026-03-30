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
describe('getLangExt — edge cases', () => {
  bench('null input', () => {
    getLangExt(null);
  });

  bench('undefined input', () => {
    getLangExt(undefined);
  });

  bench('no extension', () => {
    getLangExt('Makefile');
  });

  bench('deeply nested path', () => {
    getLangExt('a/b/c/d/e/f/g/h/i/j/k/Component.tsx');
  });

  bench('500 mixed files (stress)', () => {
    const files = Array.from({ length: 500 }, (_, i) =>
      ['js','jsx','ts','tsx','css','html','json','py','md','unknown'][i % 10] + i
    );
    files.forEach(f => getLangExt(f));
  });
});
