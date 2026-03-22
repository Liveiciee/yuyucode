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

// ══════════════════════════════════════════════════════════════════════════════
// HARDCORE BENCH SUITE — edge cases, stress, worst-case, concurrent simulation
// ══════════════════════════════════════════════════════════════════════════════

// ── Extreme fixtures ──────────────────────────────────────────────────────────

// 5000 line file — 10x current large
const STRESS_5000 = Array.from({ length: 5000 }, (_, i) =>
  `export const fn${i} = (a, b, c) => { const r = a * ${i} + b - c; return r > 0 ? r : -r; };`
).join('\n');

// Adversarial: ALL changes (worst case for Myers diff)
const STRESS_5000_ALL_CHANGED = Array.from({ length: 5000 }, (_, i) =>
  `export const fn${i} = (x, y, z) => { const r = x / ${i+1} - y + z; return r < 0 ? r : -r; };`
).join('\n');

// Unicode nightmare — emoji, RTL, CJK, zero-width
const UNICODE_CODE = `
import { useState } from 'react';
// 日本語コメント — ✨ emoji in comment — \u202E reversed \u202C — zero\u200Bwidth
export function Ñoño({ café = '☕', 日本 = '🗾' }) {
  const [状態, set状態] = useState(null);
  const λ = (x) => x * Math.PI; // λ function
  return <div aria-label="🎉">{café} {日本}</div>;
}
`.trim();

// Deep nesting — worst case for extractSymbols parser
const DEEPLY_NESTED = Array.from({ length: 50 }, (_, i) =>
  `export function level${i}(x) {\n${'  '.repeat(i)}return level${i+1} ? level${i+1}(x) : x;\n}`
).join('\n');

// Pathological regex input — many action-like patterns that aren't actions
const ACTION_PATHOLOGICAL = Array.from({ length: 100 }, (_, i) =>
  `Step ${i}: use \`\`\`pseudo\ncode block ${i}\n\`\`\` and also \`\`\`action\nNOT JSON at all !!@#$%^&*()\n\`\`\``
).join('\n');

// 20 valid action blocks (stress for agent loop)
const ACTION_20_VALID = Array.from({ length: 20 }, (_, i) =>
  `\`\`\`action\n{"type":"read_file","path":"src/file${i}.js","encoding":"utf8"}\n\`\`\``
).join('\n');

// 200 tabs — extreme multi-tab
const TABS_200 = Array.from({ length: 200 }, (_, i) => ({
  path: `/src/components/Component${i}.jsx`,
  content: SMALL_CODE,
  dirty: i % 7 === 0,
}));

// Giant import list — 50 imports
const FIFTY_IMPORTS = Array.from({ length: 50 }, (_, i) =>
  `import { fn${i}, util${i} } from './module${i}.js';`
).join('\n') + '\n\nexport default function App() { return null; }';

// Repeated compressSource target — worst case: many unique symbols
const LARGE_UNIQUE_SYMBOLS = Array.from({ length: 200 }, (_, i) =>
  `export function uniqueFunc${i}Abcdef(param${i}X, param${i}Y) {\n  const result${i} = param${i}X * param${i}Y + ${i};\n  return result${i};\n}`
).join('\n');

// Salience stress — 200 files with cross-imports
const SALIENCE_200 = Array.from({ length: 200 }, (_, i) => ({
  rel: `src/module${i}.js`,
  src: `import { helper } from './utils.js';\nimport { fn${(i+1)%200} } from './module${(i+1)%200}.js';\nexport function fn${i}(x) { return x + ${i}; }`,
  lines: 3,
}));

// ── Edge cases: getLangExt ────────────────────────────────────────────────────
describe('getLangExt — edge cases', () => {
  bench('null input', () => {
    getLangExt(null);
  });

  bench('undefined input', () => {
    getLangExt(undefined);
  });

  bench('no extension', () => {
    getLangExt('Makefile');
  });

  bench('deeply nested path', () => {
    getLangExt('a/b/c/d/e/f/g/h/i/j/k/Component.tsx');
  });

  bench('500 mixed files (stress)', () => {
    const files = Array.from({ length: 500 }, (_, i) =>
      ['js','jsx','ts','tsx','css','html','json','py','md','unknown'][i % 10] + i
    );
    files.forEach(f => getLangExt(f));
  });
});

// ── Edge cases: buildSrcdoc ───────────────────────────────────────────────────
describe('buildSrcdoc — edge cases', () => {
  bench('giant JS (500 lines)', () => {
    buildSrcdoc([{ path: 'app.js', content: LARGE_CODE }]);
  });

  bench('20 tabs (only first html/css/js matter)', () => {
    buildSrcdoc(TABS_200.slice(0, 20));
  });

  bench('unicode content', () => {
    buildSrcdoc([{ path: 'app.jsx', content: UNICODE_CODE }]);
  });
});

// ── Stress: generateDiff ─────────────────────────────────────────────────────
describe('generateDiff — stress & worst case', () => {
  bench('5000 lines identical (no diff — best case)', () => {
    generateDiff(STRESS_5000, STRESS_5000);
  });

  bench('5000 lines all changed (worst case Myers)', () => {
    generateDiff(STRESS_5000, STRESS_5000_ALL_CHANGED);
  });

  bench('unicode diff', () => {
    generateDiff(UNICODE_CODE, UNICODE_CODE.replace('☕', '🍵').replace('🗾', '🌏'));
  });

  bench('empty → 500 lines (insert everything)', () => {
    generateDiff('', LARGE_CODE);
  });

  bench('500 lines → empty (delete everything)', () => {
    generateDiff(LARGE_CODE, '');
  });
});

// ── Stress: multi-tab ────────────────────────────────────────────────────────
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

// ── Stress: extractSymbols ───────────────────────────────────────────────────
describe('extractSymbols — stress & edge cases', () => {
  bench('5000 line file', () => {
    extractSymbols(STRESS_5000, 'stress.js');
  });

  bench('unicode source', () => {
    extractSymbols(UNICODE_CODE, 'unicode.jsx');
  });

  bench('deeply nested (50 levels)', () => {
    extractSymbols(DEEPLY_NESTED, 'nested.js');
  });

  bench('200 unique symbols', () => {
    extractSymbols(LARGE_UNIQUE_SYMBOLS, 'symbols.js');
  });

  bench('empty string', () => {
    extractSymbols('', 'empty.js');
  });
});

// ── Stress: compressSource ───────────────────────────────────────────────────
describe('compressSource — stress & edge cases', () => {
  bench('5000 line file', () => {
    compressSource(STRESS_5000, 'stress.js');
  });

  bench('200 unique symbol names (compression resistant)', () => {
    compressSource(LARGE_UNIQUE_SYMBOLS, 'symbols.js');
  });

  bench('unicode source', () => {
    compressSource(UNICODE_CODE, 'unicode.jsx');
  });

  bench('empty string', () => {
    compressSource('', 'empty.js');
  });

  bench('single line (1 char)', () => {
    compressSource('x', 'x.js');
  });
});

// ── Stress: extractImports ───────────────────────────────────────────────────
describe('extractImports — stress & edge cases', () => {
  bench('50 imports', () => {
    extractImports(FIFTY_IMPORTS);
  });

  bench('unicode import paths', () => {
    extractImports(`import { fn } from './módulo-ñoño.js';\nimport { x } from './日本語.js';`);
  });

  bench('empty string', () => {
    extractImports('');
  });

  bench('malformed import (no from)', () => {
    extractImports(`import something broken\nexport default null;`);
  });
});

// ── Worst case: parseActions ──────────────────────────────────────────────────
describe('parseActions — worst case', () => {
  bench('100 fake action blocks (all invalid JSON)', () => {
    parseActions(ACTION_PATHOLOGICAL);
  });

  bench('20 valid action blocks', () => {
    parseActions(ACTION_20_VALID);
  });

  bench('empty string', () => {
    parseActions('');
  });

  bench('10MB-ish text — no actions', () => {
    parseActions('x'.repeat(100_000));
  });
});

// ── Concurrent simulation (Promise.all batches) ───────────────────────────────
describe('concurrent simulation', () => {
  bench('10 extractSymbols in parallel (Promise.all)', async () => {
    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        Promise.resolve(extractSymbols(REALISTIC_COMPONENT, `file${i}.js`))
      )
    );
  });

  bench('10 compressSource in parallel', async () => {
    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        Promise.resolve(compressSource(REALISTIC_COMPONENT, `file${i}.js`))
      )
    );
  });

  bench('10 generateDiff in parallel', async () => {
    await Promise.all(
      Array.from({ length: 10 }, () =>
        Promise.resolve(generateDiff(LARGE_CODE, LARGE_CODE_MODIFIED))
      )
    );
  });

  bench('50 parseActions in parallel', async () => {
    await Promise.all(
      Array.from({ length: 50 }, () =>
        Promise.resolve(parseActions(ACTION_MIXED))
      )
    );
  });

  bench('mixed workload — 5 ops all types concurrently', async () => {
    await Promise.all([
      Promise.resolve(extractSymbols(REALISTIC_COMPONENT, 'a.js')),
      Promise.resolve(compressSource(REALISTIC_COMPONENT, 'b.js')),
      Promise.resolve(generateDiff(LARGE_CODE, LARGE_CODE_MODIFIED)),
      Promise.resolve(parseActions(ACTION_FIVE)),
      Promise.resolve(extractImports(FIFTY_IMPORTS)),
    ]);
  });
});

// ── computeSalience — stress ──────────────────────────────────────────────────
describe('computeSalience — stress', () => {
  bench('200 files with cross-imports', () => {
    const importCount = {};
    for (const d of SALIENCE_200) {
      for (const dep of extractImports(d.src)) {
        for (const key of SALIENCE_200.map(f => f.rel)) {
          const base = key.replace(/\.(jsx?|tsx?)$/, '').split('/').pop();
          if (dep === base || dep.endsWith('/' + base)) {
            importCount[key] = (importCount[key] || 0) + 1;
          }
        }
      }
    }
    for (const d of SALIENCE_200) {
      const importedBy = importCount[d.rel] || 0;
      d.salience = (importedBy * 3) + 1 + Math.round(1000 / Math.max(d.lines, 1));
    }
  });
});
