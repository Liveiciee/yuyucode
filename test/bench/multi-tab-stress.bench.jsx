// @vitest-environment node
import { describe, bench } from 'vitest';
import { TABS_200 } from './_helpers.jsx';

describe('multi-tab — stress', () => {
  bench('open 200 tabs sequentially', () => {
    let tabs = [];
    for (let i = 0; i < 200; i++) {
      tabs = [...tabs, { path: `/src/file${i}.js`, content: '', dirty: false }];
    }
    return tabs.length;
  });

  bench('find dirty tab from 200', () => {
    return TABS_200.find(t => t.dirty);
  });

  bench('close all dirty tabs from 200', () => {
    return TABS_200.filter(t => !t.dirty);
  });

  bench('reorder — move last to first (200 tabs)', () => {
    const t = [...TABS_200];
    t.unshift(t.pop());
    return t.length;
  });
});
