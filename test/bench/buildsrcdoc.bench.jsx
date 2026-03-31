// @vitest-environment node
import { describe, bench } from 'vitest';
import { buildSrcdoc } from './_helpers.jsx';

describe('buildSrcdoc', () => {
  bench('empty tabs', () => {
    return buildSrcdoc(TABS_EMPTY);
  });

  bench('js only', () => {
    return buildSrcdoc(TABS_JS_ONLY);
  });

  bench('html + css + js', () => {
    return buildSrcdoc(TABS_HTML_CSS_JS);
  });
});
