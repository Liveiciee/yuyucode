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
  SMALL_CODE,
} from './_helpers.jsx';

// Fixtures (keep them defined per file to avoid cross-contamination)
describe('multi-tab array ops', () => {
  bench('open 1 tab (Array spread)', () => {
    const tabs = [];
    const newTab = { path: '/src/App.jsx', content: SMALL_CODE, dirty: false };
    const result = [...tabs, newTab];
    result.length;
  });

  bench('close middle tab from 10', () => {
    const tabs = Array.from({ length: 10 }, (_, i) => ({ path: `/src/file${i}.js`, content: '', dirty: false }));
    const result = tabs.filter((_, i) => i !== 5);
    result.length;
  });

  bench('find active tab from 20', () => {
    const tabs = Array.from({ length: 20 }, (_, i) => ({ path: `/src/file${i}.js`, content: '', dirty: i === 10 }));
    tabs.find(t => t.dirty);
  });

  bench('open 50 tabs sequentially', () => {
    let tabs = [];
    for (let i = 0; i < 50; i++) {
      tabs = [...tabs, { path: `/src/file${i}.js`, content: '', dirty: false }];
    }
    tabs.length;
  });
});
