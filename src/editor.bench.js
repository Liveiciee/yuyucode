import { describe, bench } from 'vitest';
import { generateDiff } from './utils.js';

// ── Inline pure functions ─────────────────────────────────────────────────────
function getLangExt(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  const map = {
    js: 'javascript', mjs: 'javascript', cjs: 'javascript',
    jsx: 'javascript-jsx', ts: 'typescript', tsx: 'typescript-jsx',
    css: 'css', scss: 'css', sass: 'css',
    html: 'html', htm: 'html',
    json: 'json', py: 'python',
    md: 'markdown', mdx: 'markdown',
  };
  return map[ext] || 'javascript';
}

function isEmmetLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return ['html', 'htm', 'jsx', 'tsx', 'css', 'scss'].includes(ext);
}

function isTsLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return ['ts', 'tsx', 'js', 'jsx'].includes(ext);
}

const CONSOLE_INTERCEPT = '<script>/* intercept */</script>';
function buildSrcdoc(tabs) {
  const htmlTab = tabs.find(t => /\.html?$/.test(t.path));
  const cssTab  = tabs.find(t => /\.s?css$/.test(t.path));
  const jsTab   = tabs.find(t => /\.[jt]sx?$/.test(t.path) && !/\.test\.|\.spec\./.test(t.path));
  if (htmlTab) {
    let html = htmlTab.content || '';
    if (cssTab && !html.includes('<style')) html = html.replace('</head>', `<style>${cssTab.content}</style></head>`);
    if (jsTab  && !html.includes('<script')) html = html.replace('</body>', `<script>${jsTab.content}</script></body>`);
    return CONSOLE_INTERCEPT + html;
  }
  return `<!DOCTYPE html><html><head>${cssTab ? `<style>${cssTab.content}</style>` : ''}${CONSOLE_INTERCEPT}</head><body>${jsTab ? `<script type="module">${jsTab.content}</script>` : '<p>No file</p>'}</body></html>`;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────
const SMALL_CODE = `import React from 'react';\nexport default function App() {\n  return <div>Hello</div>;\n}\n`;
const LARGE_CODE = Array.from({ length: 500 }, (_, i) =>
  `const fn${i} = (x) => x * ${i}; // line ${i}`
).join('\n');
const LARGE_CODE_MODIFIED = LARGE_CODE.replace(/x \* /g, 'x + ');

const TABS_HTML_CSS_JS = [
  { path: 'index.html', content: '<html><head></head><body></body></html>' },
  { path: 'style.css',  content: 'body{margin:0;padding:0;font-family:sans-serif}h1{color:red}' },
  { path: 'main.js',    content: 'document.querySelector("h1").textContent = "Hello";' },
];
const TABS_JS_ONLY = [{ path: 'app.js', content: SMALL_CODE }];
const TABS_EMPTY   = [];

const EXTENSIONS = ['App.jsx', 'types.ts', 'style.css', 'index.html', 'data.json', 'main.py', 'README.md', 'util.mjs', 'vars.scss', 'comp.tsx'];

// ── getLang benchmark ─────────────────────────────────────────────────────────
describe('getLangExt', () => {
  bench('single call — jsx', () => {
    getLangExt('App.jsx');
  });

  bench('10 mixed extensions', () => {
    EXTENSIONS.forEach(f => getLangExt(f));
  });
});

// ── isEmmetLang benchmark ─────────────────────────────────────────────────────
describe('isEmmetLang', () => {
  bench('single call — jsx', () => {
    isEmmetLang('App.jsx');
  });

  bench('10 mixed', () => {
    EXTENSIONS.forEach(f => isEmmetLang(f));
  });
});

// ── isTsLang benchmark ───────────────────────────────────────────────────────
describe('isTsLang', () => {
  bench('single call — ts', () => {
    isTsLang('types.ts');
  });

  bench('10 mixed', () => {
    EXTENSIONS.forEach(f => isTsLang(f));
  });
});

// ── buildSrcdoc benchmark ─────────────────────────────────────────────────────
describe('buildSrcdoc', () => {
  bench('empty tabs', () => {
    buildSrcdoc(TABS_EMPTY);
  });

  bench('js only', () => {
    buildSrcdoc(TABS_JS_ONLY);
  });

  bench('html + css + js', () => {
    buildSrcdoc(TABS_HTML_CSS_JS);
  });
});

// ── generateDiff benchmark ────────────────────────────────────────────────────
describe('generateDiff (Myers)', () => {
  bench('small diff (4 lines)', () => {
    generateDiff(SMALL_CODE, SMALL_CODE.replace('Hello', 'World'));
  });

  bench('large diff (500 lines, many changes)', () => {
    generateDiff(LARGE_CODE, LARGE_CODE_MODIFIED);
  });

  bench('identical (no diff)', () => {
    generateDiff(LARGE_CODE, LARGE_CODE);
  });
});

// ── Multi-tab state operations (pure JS, no hook) ─────────────────────────────
describe('multi-tab array ops', () => {
  bench('open 1 tab (Array spread)', () => {
    const tabs = [];
    const newTab = { path: '/src/App.jsx', content: SMALL_CODE, dirty: false };
    const result = [...tabs, newTab];
    result.length; // prevent dead-code elimination
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
