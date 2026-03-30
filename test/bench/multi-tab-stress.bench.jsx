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
describe('multi-tab — stress', () => {
  bench('open 200 tabs sequentially', () => {
    let tabs = [];
    for (let i = 0; i < 200; i++) {
      tabs = [...tabs, { path: `/src/file${i}.js`, content: '', dirty: false }];
    }
    tabs.length;
  });

  bench('find dirty tab from 200', () => {
    TABS_200.find(t => t.dirty);
  });

  bench('close all dirty tabs from 200', () => {
    TABS_200.filter(t => !t.dirty);
  });

  bench('reorder — move last to first (200 tabs)', () => {
    const t = [...TABS_200];
    t.unshift(t.pop());
    t.length;
  });
});
