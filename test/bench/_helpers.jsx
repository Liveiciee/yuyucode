// @vitest-environment node
import { describe, bench } from 'vitest';
import { generateDiff, parseActions } from '../../src/utils.js';
import {
  extractSymbols,
  compressSource,
  extractImports,
  computeSalience,
} from '../../lib/map/index.cjs';

// ── Inline pure functions ──────────────────────────────────────────────
export function getLangExt(path) {
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

export function isEmmetLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return ['html', 'htm', 'jsx', 'tsx', 'css', 'scss'].includes(ext);
}

export function isTsLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return ['ts', 'tsx', 'js', 'jsx'].includes(ext);
}

const CONSOLE_INTERCEPT = '<script>/* intercept */</script>';
export function buildSrcdoc(tabs) {
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

// ── Fixtures ───────────────────────────────────────────────────────────
export const SMALL_CODE = `import React from 'react';
export default function App() {
  return <div>Hello</div>;
}
`;

export const LARGE_CODE = Array.from({ length: 500 }, (_, i) =>
  `const fn${i} = (x) => x * ${i}; // line ${i}`
).join('\n');

export const LARGE_CODE_MODIFIED = LARGE_CODE.replace(/x \* /g, 'x + ');

export const REALISTIC_COMPONENT = `
import { useState, useEffect, useCallback } from 'react';
import { callServer } from '../api.js';
import { parseActions, executeAction } from '../utils.js';

export function useAgentLoop(opts = {}) {
  const [messages, setMessages]   = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [agentStatus, setStatus]  = useState(null);

  const sendMsg = useCallback(async (text) => {
    setStreaming(true);
    setStatus('Thinking...');
    try {
      const result = await callServer({ type: 'exec', command: text });
      const actions = parseActions(result.data || '');
      for (const action of actions) {
        await executeAction(action, opts.folder);
      }
    } finally {
      setStreaming(false);
      setStatus(null);
    }
  }, [opts.folder]);

  useEffect(() => {
    return () => { setStreaming(false); };
  }, []);

  return { messages, streaming, agentStatus, sendMsg };
}
`.trim();

export const LARGE_COMPONENT = Array.from({ length: 10 }, (_, i) =>
  REALISTIC_COMPONENT.replace(/useAgentLoop/g, `useAgentLoop${i}`)
).join('\n\n');

// ── MISSING FIXTURES (INI YANG BIKIN ERROR) ─────────────────────────────
export const UNICODE_CODE = `
const café = "☕";
const japan = "🗾";
export default function テスト() {
  return café + japan;
}
`;

export const ACTION_NONE = `just text without actions`;

export const ACTION_ONE = `
\`\`\`action
{"type":"read_file","path":"src/a.js"}
\`\`\`
`;

export const ACTION_FIVE = Array.from({ length: 5 }, (_, i) => `
\`\`\`action
{"type":"read_file","path":"src/file${i}.js"}
\`\`\`
`).join('\n');

export const ACTION_MIXED = `
text
\`\`\`action
{"type":"read_file","path":"src/a.js"}
\`\`\`
\`\`\`action
INVALID JSON
\`\`\`
more text
`;

// ── OTHER FIXTURES ─────────────────────────────────────────────────────
export const TABS_HTML_CSS_JS = [
  { path: 'index.html', content: '<html><head></head><body></body></html>' },
  { path: 'style.css',  content: 'body{margin:0;padding:0;font-family:sans-serif}h1{color:red}' },
  { path: 'main.js',    content: 'document.querySelector("h1").textContent = "Hello";' },
];

export const TABS_JS_ONLY = [{ path: 'app.js', content: SMALL_CODE }];
export const TABS_EMPTY   = [];

export const EXTENSIONS = ['App.jsx', 'types.ts', 'style.css', 'index.html', 'data.json', 'main.py', 'README.md', 'util.mjs', 'vars.scss', 'comp.tsx'];

export const SALIENCE_FILES = Array.from({ length: 20 }, (_, i) => ({
  rel: `src/module${i}.js`,
  src: `import { helper } from './utils.js';
export function fn${i}(x) { return x + ${i}; }`,
  lines: 2,
}));

export const STRESS_5000 = Array.from({ length: 5000 }, (_, i) =>
  `export const fn${i} = (a, b, c) => { const r = a * ${i} + b - c; return r > 0 ? r : -r; };`
).join('\n');

export const STRESS_5000_ALL_CHANGED = Array.from({ length: 5000 }, (_, i) =>
  `export const fn${i} = (x, y, z) => { const r = x / ${i+1} - y + z; return r < 0 ? r : -r; };`
).join('\n');

export const DEEPLY_NESTED = Array.from({ length: 50 }, (_, i) =>
  `export function level${i}(x) {
${'  '.repeat(i)}return level${i+1} ? level${i+1}(x) : x;
}`
).join('\n');

export const LARGE_UNIQUE_SYMBOLS = Array.from({ length: 200 }, (_, i) =>
  `export function uniqueFunc${i}(a,b){return a*b+${i}}`
).join('\n');
