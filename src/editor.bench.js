// @vitest-environment node
import { describe, bench } from 'vitest';
import { generateDiff } from './utils.js';
import {
  extractSymbols,
  compressSource,
  extractImports,
} from '../yuyu-map.cjs';

// ── Inline pure functions (copied from FileEditor — cannot import component) ──
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

// Realistic component — what yuyu-map actually processes
const REALISTIC_COMPONENT = `
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

export function buildSystemPrompt(config) {
  const { memories, skills, handoff, map } = config;
  const parts = [];
  if (handoff) parts.push('## Handoff\\n' + handoff);
  if (map)     parts.push('## Map\\n' + map);
  if (memories?.length) parts.push('## Memories\\n' + memories.map(m => '- ' + m.text).join('\\n'));
  if (skills?.length)   parts.push('## Skills\\n' + skills.map(s => s.content).join('\\n\\n'));
  return parts.join('\\n\\n---\\n\\n');
}

export const EFFORT_CONFIG = {
  low:    { maxIter: 3,  maxTokens: 8000 },
  medium: { maxIter: 6,  maxTokens: 16000 },
  high:   { maxIter: 10, maxTokens: 32000 },
};

export default useAgentLoop;
`.trim();

const LARGE_COMPONENT = Array.from({ length: 10 }, (_, i) => REALISTIC_COMPONENT.replace(/useAgentLoop/g, `useAgentLoop${i}`)).join('\n\n');

const TABS_HTML_CSS_JS = [
  { path: 'index.html', content: '<html><head></head><body></body></html>' },
  { path: 'style.css',  content: 'body{margin:0;padding:0;font-family:sans-serif}h1{color:red}' },
  { path: 'main.js',    content: 'document.querySelector("h1").textContent = "Hello";' },
];
const TABS_JS_ONLY = [{ path: 'app.js', content: SMALL_CODE }];
const TABS_EMPTY   = [];

const EXTENSIONS = ['App.jsx', 'types.ts', 'style.css', 'index.html', 'data.json', 'main.py', 'README.md', 'util.mjs', 'vars.scss', 'comp.tsx'];

// Fixtures for computeSalience
const SALIENCE_FILES = Array.from({ length: 20 }, (_, i) => ({
  rel: `src/module${i}.js`,
  src: `import { helper } from './utils.js';\nexport function fn${i}(x) { return x + ${i}; }\n`,
  lines: 2,
}));

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

// ── extractSymbols benchmark (NEW) ───────────────────────────────────────────
describe('extractSymbols', () => {
  bench('small file (4 lines)', () => {
    extractSymbols(SMALL_CODE, 'App.jsx');
  });

  bench('realistic component (~50 lines)', () => {
    extractSymbols(REALISTIC_COMPONENT, 'useAgentLoop.js');
  });

  bench('large file (10 components, ~500 lines)', () => {
    extractSymbols(LARGE_COMPONENT, 'hooks.js');
  });

  bench('non-code file (early return)', () => {
    extractSymbols('body { color: red }', 'style.css');
  });
});

// ── compressSource benchmark (NEW) ────────────────────────────────────────────
describe('compressSource', () => {
  bench('small file (4 lines)', () => {
    compressSource(SMALL_CODE, 'App.jsx');
  });

  bench('realistic component (~50 lines)', () => {
    compressSource(REALISTIC_COMPONENT, 'useAgentLoop.js');
  });

  bench('large file (500 lines)', () => {
    compressSource(LARGE_CODE, 'utils.js');
  });

  bench('large component (10x realistic, ~500 lines)', () => {
    compressSource(LARGE_COMPONENT, 'hooks.js');
  });

  bench('non-code file (early return)', () => {
    compressSource('body { color: red }', 'style.css');
  });
});

// ── extractImports benchmark (NEW) ────────────────────────────────────────────
describe('extractImports', () => {
  bench('small file — 1 import', () => {
    extractImports(SMALL_CODE);
  });

  bench('realistic component — 3 imports', () => {
    extractImports(REALISTIC_COMPONENT);
  });

  bench('no imports', () => {
    extractImports(LARGE_CODE);
  });
});

// ── computeSalience benchmark (NEW) ───────────────────────────────────────────
describe('computeSalience', () => {
  bench('20 pre-built file data objects', () => {
    // Pure scoring pass — no disk I/O, uses pre-built fixtures
    const importCount = {};
    for (const d of SALIENCE_FILES) {
      for (const dep of extractImports(d.src)) {
        for (const key of SALIENCE_FILES.map(f => f.rel)) {
          const base = key.replace(/\.(jsx?|tsx?)$/, '').split('/').pop();
          if (dep === base || dep.endsWith('/' + base)) {
            importCount[key] = (importCount[key] || 0) + 1;
          }
        }
      }
    }
    for (const d of SALIENCE_FILES) {
      const importedBy = importCount[d.rel] || 0;
      d.salience = (importedBy * 3) + 1 + Math.round(1000 / Math.max(d.lines, 1));
    }
  });
});

// ── parseActions hot path benchmark (NEW) ─────────────────────────────────────
import { parseActions } from './utils.js';

const ACTION_NONE     = 'This is a plain response with no action blocks at all.';
const ACTION_ONE      = '```action\n{"type":"read_file","path":"src/App.jsx"}\n```';
const ACTION_FIVE     = Array.from({ length: 5 }, (_, i) =>
  `\`\`\`action\n{"type":"read_file","path":"src/file${i}.js"}\n\`\`\``
).join('\n');
const ACTION_MIXED    = [
  '```action\n{"type":"read_file","path":"a.js"}\n```',
  'Some explanation text in between the actions.',
  '```js\nconst x = 1;\n```',
  '```action\n{"type":"exec","command":"npm test"}\n```',
  '```action\nNOT VALID JSON\n```',
  '```action\n{"type":"write_file","path":"out.txt","content":"done"}\n```',
].join('\n');

describe('parseActions (agent loop hot path)', () => {
  bench('no action blocks', () => {
    parseActions(ACTION_NONE);
  });

  bench('1 action block', () => {
    parseActions(ACTION_ONE);
  });

  bench('5 action blocks', () => {
    parseActions(ACTION_FIVE);
  });

  bench('mixed — valid + invalid + non-action blocks', () => {
    parseActions(ACTION_MIXED);
  });
});
