// @vitest-environment node
import { describe, bench } from 'vitest';
import {
  buildSrcdoc,
} from './_helpers.jsx';

describe('buildSrcdoc — edge cases', () => {
  bench('giant JS (500 lines)', () => {
    return buildSrcdoc([{ path: 'app.js', content: LARGE_CODE }]);
  });

  bench('20 tabs (only first html/css/js matter)', () => {
    return buildSrcdoc(TABS_200.slice(0, 20));
  });

  bench('unicode content', () => {
    return buildSrcdoc([{ path: 'app.jsx', content: UNICODE_CODE }]);
  });
});
