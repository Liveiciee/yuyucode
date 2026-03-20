// @vitest-environment node
import { describe, it, expect } from 'vitest';

// ── Inline buildSrcdoc (copied — cannot import component directly in jsdom) ───
const CONSOLE_INTERCEPT = '<script>/* console intercept */</script>';

function buildSrcdoc(tabs) {
  const htmlTab = tabs.find(t => /\.html?$/.test(t.path));
  const cssTab  = tabs.find(t => /\.s?css$/.test(t.path));
  const jsTab   = tabs.find(t => /\.[jt]sx?$/.test(t.path) && !/\.test\.|\.spec\./.test(t.path));

  if (htmlTab) {
    let html = htmlTab.content || '';
    if (cssTab && !html.includes('<link') && !html.includes('<style')) {
      html = html.replace('</head>', `<style>${cssTab.content}</style></head>`);
    }
    if (jsTab && !html.includes('<script')) {
      html = html.replace('</body>', `<script>${jsTab.content}</script></body>`);
    }
    return CONSOLE_INTERCEPT + html;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${cssTab ? `<style>${cssTab.content}</style>` : ''}
${CONSOLE_INTERCEPT}
</head><body>
<div id="app"></div>
${jsTab ? `<script type="module">${jsTab.content}</script>` : '<p style="font:14px monospace;padding:16px;opacity:.5">No JS / HTML file open</p>'}
</body></html>`;
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('buildSrcdoc', () => {
  it('returns synthesized doc when no html tab', () => {
    const result = buildSrcdoc([]);
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('No JS / HTML file open');
  });

  it('injects css into synthesized doc', () => {
    const tabs = [{ path: 'style.css', content: 'body{color:red}' }];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<style>body{color:red}</style>');
  });

  it('injects js module into synthesized doc', () => {
    const tabs = [{ path: 'main.js', content: 'console.log(1)' }];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<script type="module">console.log(1)</script>');
  });

  it('uses html tab as base when present', () => {
    const tabs = [{ path: 'index.html', content: '<html><head></head><body></body></html>' }];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<html><head></head><body></body></html>');
    expect(result).toContain(CONSOLE_INTERCEPT);
  });

  it('injects css into html tab head', () => {
    const tabs = [
      { path: 'index.html', content: '<html><head></head><body></body></html>' },
      { path: 'style.css',  content: 'h1{color:blue}' },
    ];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<style>h1{color:blue}</style>');
  });

  it('injects js into html tab body', () => {
    const tabs = [
      { path: 'index.html', content: '<html><head></head><body></body></html>' },
      { path: 'app.js',     content: 'alert(1)' },
    ];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<script>alert(1)</script>');
  });

  it('does not inject css if html already has <link>', () => {
    const tabs = [
      { path: 'index.html', content: '<html><head><link rel="stylesheet" href="x.css"></head><body></body></html>' },
      { path: 'style.css',  content: 'h1{color:blue}' },
    ];
    const result = buildSrcdoc(tabs);
    expect(result).not.toContain('<style>h1{color:blue}</style>');
  });

  it('does not inject js if html already has <script>', () => {
    const tabs = [
      { path: 'index.html', content: '<html><head></head><body><script>existing()</script></body></html>' },
      { path: 'app.js',     content: 'new()' },
    ];
    const result = buildSrcdoc(tabs);
    // Should not inject new script
    expect(result).not.toContain('<script>new()</script>');
  });

  it('skips .test.js files for js tab', () => {
    const tabs = [
      { path: 'app.test.js', content: 'it("x", () => {})' },
      { path: 'main.js',     content: 'real()' },
    ];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('real()');
    expect(result).not.toContain('it("x"');
  });

  it('handles tsx as js tab', () => {
    const tabs = [{ path: 'App.tsx', content: 'export default () => <div/>' }];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('export default () => <div/>');
  });

  it('handles .scss as css tab', () => {
    const tabs = [{ path: 'vars.scss', content: '$c: red' }];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('<style>$c: red</style>');
  });

  it('picks first html tab when multiple exist', () => {
    const tabs = [
      { path: 'index.html', content: '<html><head></head><body>first</body></html>' },
      { path: 'other.html', content: '<html><head></head><body>second</body></html>' },
    ];
    const result = buildSrcdoc(tabs);
    expect(result).toContain('first');
  });
});
