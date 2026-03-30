// @vitest-environment node
import { describe, bench } from 'vitest';
import { generateDiff, parseActions } from '../../src/utils.js';
import {
  extractSymbols,
  compressSource,
  extractImports,
  computeSalience,
} from '../../yuyu-map.cjs';

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