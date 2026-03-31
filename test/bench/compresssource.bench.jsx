// @vitest-environment node
import { describe, bench } from 'vitest';
import {
  compressSource,
  SMALL_CODE,
  LARGE_CODE,
  REALISTIC_COMPONENT,
  LARGE_COMPONENT,
} from './_helpers.jsx';

describe('compressSource', () => {
  bench('small file (4 lines)', () => {
    return compressSource(SMALL_CODE, 'App.jsx');
  });

  bench('realistic component (\~50 lines)', () => {
    return compressSource(REALISTIC_COMPONENT, 'useAgentLoop.js');
  });

  bench('large file (500 lines)', () => {
    return compressSource(LARGE_CODE, 'utils.js');
  });

  bench('large component (10x realistic, \~500 lines)', () => {
    return compressSource(LARGE_COMPONENT, 'hooks.js');
  });

  bench('non-code file (early return)', () => {
    return compressSource('body { color: red }', 'style.css');
  });
});
