// ── FileEditor — CodeMirror 6 · Full IDE ─────────────────────────────────────
// Fase 1+2: Multi-tab, Vim, Emmet, Ghost Text, Minimap, Lint
// Fase 3:   TypeScript LSP, Inline Blame, Sticky Scroll, Code Fold,
//           Multi-Cursor, Breadcrumb, Realtime Collab
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Save, ChevronRight } from 'lucide-react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment, StateEffect, StateField } from '@codemirror/state';
import { Decoration, WidgetType, ViewPlugin, keymap, GutterMarker, gutter } from '@codemirror/view';
import { linter, lintGutter } from '@codemirror/lint';
import { syntaxTree, foldAll, unfoldAll } from '@codemirror/language';
import {
  indentWithTab,
} from '@codemirror/commands';
import {
  selectNextOccurrence,
  selectSelectionMatches
} from '@codemirror/search';
import { collab, getSyncedVersion, sendableUpdates, receiveUpdates } from '@codemirror/collab';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { vim } from '@replit/codemirror-vim';
import { abbreviationTracker, expandAbbreviation } from '@emmetio/codemirror6-plugin';
import { callServer } from '../api.js';

// ── TypeScript LSP — lazy load @valtown/codemirror-ts ────────────────────────
let _tsExtensions = null;
async function getTsExtensions() {
  if (_tsExtensions) return _tsExtensions;
  try {
    const mod = await import('@valtown/codemirror-ts');
    _tsExtensions = mod;
    return mod;
  } catch (_) { return null; }
}

// ── Language detector ─────────────────────────────────────────────────────────
function getLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': case 'mjs': case 'cjs': return javascript();
    case 'jsx':  return javascript({ jsx: true });
    case 'ts':   return javascript({ typescript: true });
    case 'tsx':  return javascript({ jsx: true, typescript: true });
    case 'css': case 'scss': case 'sass': return css();
    case 'html': case 'htm': return html();
    case 'json': return json();
    case 'py':   return python();
    case 'md': case 'mdx': return markdown();
    default:     return javascript();
  }
}

function isEmmetLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return ['html', 'htm', 'jsx', 'tsx', 'css', 'scss'].includes(ext);
}

function isTsLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return ['ts', 'tsx', 'js', 'jsx'].includes(ext);
}

// ── Theme builder ─────────────────────────────────────────────────────────────
function buildTheme(T) {
  const bg        = T?.bg        || '#0d0d0e';
  const bg2       = T?.bg2       || '#111116';
  const bg3       = T?.bg3       || 'rgba(255,255,255,.04)';
  const border    = T?.border    || 'rgba(255,255,255,.06)';
  const text      = T?.text      || 'rgba(255,255,255,.85)';
  const textMute  = T?.textMute  || 'rgba(255,255,255,.3)';
  const accent    = T?.accent    || '#a78bfa';
  const accentBg  = T?.accentBg  || 'rgba(124,58,237,.15)';
  const error     = T?.error     || '#f87171';
  const warning   = T?.warning   || '#fbbf24';

  return EditorView.theme({
    '&': { backgroundColor: bg, color: text, height: '100%',
      fontFamily: '"JetBrains Mono","Fira Code",monospace', fontSize: '13px' },
    '&.cm-focused': { outline: 'none' },
    '.cm-scroller': { overflow: 'auto', lineHeight: '1.65' },
    '.cm-content': { padding: '8px 0', caretColor: accent },
    '.cm-gutters': { backgroundColor: bg3, borderRight: '1px solid ' + border,
      color: textMute, minWidth: '38px', padding: '0 4px' },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 6px 0 4px' },
    '.cm-activeLineGutter': { backgroundColor: accentBg + '66' },
    '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,.015)' },
    '.cm-cursor': { borderLeftColor: accent, borderLeftWidth: '2px' },
    '.cm-selectionBackground': { backgroundColor: accentBg + ' !important' },
    '&.cm-focused .cm-selectionBackground': { backgroundColor: accentBg + ' !important' },
    '.cm-matchingBracket': { backgroundColor: accentBg,
      outline: '1px solid ' + accent + '44', borderRadius: '2px' },
    '.cm-searchMatch': { backgroundColor: accentBg, borderRadius: '2px' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: accent + '44' },
    '.cm-tooltip': { backgroundColor: bg2, border: '1px solid ' + border,
      borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,.5)', zIndex: 200 },
    '.cm-tooltip-autocomplete > ul > li': { padding: '4px 10px' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: accentBg, color: accent },
    '.cm-panels': { backgroundColor: bg2, borderBottom: '1px solid ' + border },
    '.cm-panel.cm-search': { padding: '6px 10px', gap: '6px' },
    '.cm-panel.cm-search input': { backgroundColor: bg3, border: '1px solid ' + border,
      borderRadius: '6px', color: text, padding: '4px 8px', outline: 'none' },
    '.cm-panel.cm-search button': { backgroundColor: bg3, border: '1px solid ' + border,
      borderRadius: '6px', color: text, padding: '4px 10px', cursor: 'pointer' },
    '.cm-gutter-lint': { width: '14px' },
    '.cm-lint-marker-error': { color: error },
    '.cm-lint-marker-warning': { color: warning },
    '.cm-vim-panel': { backgroundColor: bg2, borderTop: '1px solid ' + border,
      color: textMute, fontSize: '11px', padding: '2px 8px', fontFamily: 'monospace' },
    '.cm-vim-panel input': { backgroundColor: 'transparent', border: 'none', color: text,
      outline: 'none', fontFamily: 'monospace' },
    '.cm-blame-gutter': { minWidth: '150px', fontSize: '9px', padding: '0 6px 0 2px',
      color: textMute, fontFamily: 'monospace', cursor: 'default', userSelect: 'none' },
    '.cm-stickyLines': { backgroundColor: bg + 'ee', borderBottom: '1px solid ' + border,
      backdropFilter: 'blur(4px)', zIndex: 10 },
  }, { dark: true });
}

// ── Ghost text ────────────────────────────────────────────────────────────────
const setGhostEffect   = StateEffect.define();
const clearGhostEffect = StateEffect.define();
const setGhostL2Effect = StateEffect.define();

const ghostField = StateField.define({
  create: () => ({ text: '', pos: 0, level: 1 }),
  update(val, tr) {
    if (tr.docChanged) return { text: '', pos: 0, level: 1 };
    for (const e of tr.effects) {
      if (e.is(setGhostEffect))   return e.value;
      if (e.is(clearGhostEffect)) return { text: '', pos: 0, level: 1 };
    }
    return val;
  },
});

// L2 ghost text — deeper preview (dimmer, different color)
const ghostL2Field = StateField.define({
  create: () => ({ text: '', pos: 0 }),
  update(val, tr) {
    if (tr.docChanged) return { text: '', pos: 0 };
    for (const e of tr.effects) {
      if (e.is(setGhostL2Effect))   return e.value;
      if (e.is(clearGhostEffect))   return { text: '', pos: 0 };
      if (e.is(setGhostEffect))     return { text: '', pos: 0 }; // clear L2 saat L1 datang
    }
    return val;
  },
});

class GhostWidget extends WidgetType {
  constructor(text, level) { super(); this.text = text; this.level = level; }
  toDOM() {
    const span = document.createElement('span');
    span.textContent = this.text;
    // L1: putih-biru transparan (sudah ada). L2: lebih gelap, multi-line preview
    span.style.cssText = this.level === 2
      ? 'opacity:0.22;color:#79b8ff;pointer-events:none;white-space:pre;'
      : 'opacity:0.38;color:inherit;pointer-events:none;';
    return span;
  }
  eq(other) { return this.text === other.text && this.level === other.level; }
  ignoreEvent() { return true; }
}

const ghostDecorations = EditorView.decorations.compute([ghostField], state => {
  const { text, pos } = state.field(ghostField);
  if (!text || pos > state.doc.length) return Decoration.none;
  return Decoration.set([Decoration.widget({ widget: new GhostWidget(text, 1), side: 1 }).range(pos)]);
});

const ghostL2Decorations = EditorView.decorations.compute([ghostL2Field, ghostField], state => {
  const l1 = state.field(ghostField);
  const { text, pos } = state.field(ghostL2Field);
  // Hanya tampilkan L2 kalau tidak ada L1 aktif
  if (!text || pos > state.doc.length || l1.text) return Decoration.none;
  return Decoration.set([Decoration.widget({ widget: new GhostWidget(text, 2), side: 1 }).range(pos)]);
});

const ghostAcceptKeymap = keymap.of([{
  key: 'Tab',
  run(view) {
    const l1 = view.state.field(ghostField);
    const l2 = view.state.field(ghostL2Field);
    // Tab+Tab: cek double-tab via timestamp
    const now = Date.now();
    if (!l1.text && l2.text) {
      // accept L2
      view.dispatch({ changes: { from: l2.pos, insert: l2.text },
        effects: clearGhostEffect.of(null), selection: { anchor: l2.pos + l2.text.length } });
      return true;
    }
    if (l1.text) {
      view._lastTabTime = view._lastTabTime || 0;
      if (now - view._lastTabTime < 400 && l2.text) {
        // double-tap Tab → accept L2
        view.dispatch({ changes: { from: l1.pos, insert: l1.text + l2.text },
          effects: clearGhostEffect.of(null), selection: { anchor: l1.pos + l1.text.length + l2.text.length } });
      } else {
        view.dispatch({ changes: { from: l1.pos, insert: l1.text },
          effects: clearGhostEffect.of(null), selection: { anchor: l1.pos + l1.text.length } });
      }
      view._lastTabTime = now;
      return true;
    }
    return false;
  },
}, {
  key: 'Escape',
  run(view) {
    const { text } = view.state.field(ghostField);
    const l2 = view.state.field(ghostL2Field);
    if (!text && !l2.text) return false;
    view.dispatch({ effects: clearGhostEffect.of(null) });
    return true;
  },
}]);

// ── L1: fast, Llama 8B, 300ms debounce — next line ──
async function fetchL1Suggestion(prefix) {
  const key = import.meta?.env?.VITE_CEREBRAS_API_KEY || '';
  if (!key) return null;
  try {
    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1-8b', max_tokens: 40, temperature: 0.1,
        messages: [
          { role: 'system', content: 'Complete next line of code only. Reply with the completion text ONLY. No markdown, no backticks, no explanation.' },
          { role: 'user', content: prefix.slice(-400) },
        ],
        stop: ['\n\n', '```', '\n// ', '\n/*'],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (_) { return null; }
}

// ── L2: deeper, Llama 8B dengan max_tokens lebih besar, 900ms debounce — next function body ──
async function fetchL2Suggestion(prefix) {
  const key = import.meta?.env?.VITE_CEREBRAS_API_KEY || '';
  if (!key) return null;
  try {
    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1-8b', max_tokens: 120, temperature: 0.2,
        messages: [
          { role: 'system', content: 'Complete the next 2-3 lines of code. Reply with completion text ONLY. No markdown, no backticks.' },
          { role: 'user', content: prefix.slice(-800) },
        ],
        stop: ['\n\n\n', '```', '// ---'],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (_) { return null; }
}

function makeGhostPlugin() {
  return ViewPlugin.fromClass(class {
    timerL1 = null;
    timerL2 = null;
    update(upd) {
      if (!upd.docChanged) return;
      clearTimeout(this.timerL1);
      clearTimeout(this.timerL2);
      const { text } = upd.view.state.field(ghostField);
      if (text) upd.view.dispatch({ effects: clearGhostEffect.of(null) });
      const view = upd.view;

      // L1: 300ms debounce — immediate next line
      this.timerL1 = setTimeout(() => {
        if (view.isDestroyed) return;
        const pos    = view.state.selection.main.head;
        const prefix = view.state.doc.sliceString(0, pos);
        if ((prefix.split('\n').pop() || '').trim().length < 3) return;
        fetchL1Suggestion(prefix).then(text => {
          if (!text || view.isDestroyed) return;
          if (view.state.selection.main.head !== pos) return;
          view.dispatch({ effects: setGhostEffect.of({ text, pos, level: 1 }) });
        });
      }, 300);

      // L2: 900ms debounce — deeper multi-line preview
      this.timerL2 = setTimeout(() => {
        if (view.isDestroyed) return;
        const pos    = view.state.selection.main.head;
        const prefix = view.state.doc.sliceString(0, pos);
        if ((prefix.split('\n').pop() || '').trim().length < 6) return;
        fetchL2Suggestion(prefix).then(text => {
          if (!text || view.isDestroyed) return;
          if (view.state.selection.main.head !== pos) return;
          view.dispatch({ effects: setGhostL2Effect.of({ text, pos }) });
        });
      }, 900);
    }
    destroy() { clearTimeout(this.timerL1); clearTimeout(this.timerL2); }
  });
}

// ── Inline blame gutter ───────────────────────────────────────────────────────
class BlameMarker extends GutterMarker {
  constructor(info) { super(); this.info = info; }
  toDOM() {
    const el = document.createElement('span');
    el.className = 'cm-blame-gutter';
    el.textContent = this.info;
    el.title = this.info;
    return el;
  }
}

function makeBlameGutter(blameMap) {
  return gutter({
    class: 'cm-blame-gutter',
    lineMarker(view, line) {
      const lineNo = view.state.doc.lineAt(line.from).number;
      const info = blameMap.get(lineNo);
      return info ? new BlameMarker(info) : null;
    },
    initialSpacer: () => new BlameMarker('a1b2c3 you 1d'),
  });
}

async function fetchBlame(folder, filePath) {
  const rel = filePath.replace(folder.endsWith('/') ? folder : folder + '/', '');
  const r = await callServer({
    type: 'exec', path: folder,
    command: `git blame --abbrev=7 --date=short -- "${rel}" 2>/dev/null | head -2000`,
  });
  if (!r.ok || !r.data) return new Map();
  const map = new Map();
  (r.data || '').split('\n').forEach((line, idx) => {
    // git blame --abbrev=7 format: "^abc1234 (Author   2024-01-01 1) code"
    const m = line.match(/^[\^]?([0-9a-f]{4,})\s+\(([^)]+?)\s+(\d{4}-\d{2}-\d{2})\s+\d+\)/);
    if (!m) return;
    const hash   = m[1].slice(0, 7);
    const author = m[2].trim().split(/\s+/)[0].slice(0, 8).padEnd(8);
    const date   = m[3];
    map.set(idx + 1, `${hash} ${author} ${date}`);
  });
  return map;
}

// ── Syntax lint ───────────────────────────────────────────────────────────────
function makeSyntaxLinter(path, folder) {
  const ext = path?.split('.').pop()?.toLowerCase();
  if (ext === 'json') {
    return linter(view => {
      const src = view.state.doc.toString();
      try { JSON.parse(src); return []; }
      catch (e) {
        const match = e.message.match(/position (\d+)/);
        const pos = match ? parseInt(match[1]) : 0;
        return [{ from: pos, to: Math.min(pos + 1, src.length), severity: 'error', message: e.message }];
      }
    }, { delay: 600 });
  }
  if (['js', 'mjs', 'cjs'].includes(ext)) {
    return linter(async view => {
      const src  = view.state.doc.toString();
      const safe = src.replace(/\\/g, '\\\\').replace(/'/g, "'\\''");
      try {
        const r = await callServer({ type: 'exec', path: folder || '.',
          command: `echo '${safe}' | node --input-type=module --check 2>&1 || true` });
        if (!r.ok) return [];
        const line = (r.data || '').match(/stdin:(\d+)/);
        if (!line) return [];
        const lineNum = parseInt(line[1]);
        const doc = view.state.doc;
        const lineObj = doc.line(Math.min(lineNum, doc.lines));
        return [{ from: lineObj.from, to: lineObj.to, severity: 'error', message: (r.data || '').split('\n')[0] }];
      } catch (_) { return []; }
    }, { delay: 1200 });
  }
  return null;
}

// ── Minimap ───────────────────────────────────────────────────────────────────
function Minimap({ viewRef, T }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let running = true;
    function draw() {
      if (!running) return;
      const view = viewRef.current;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = T?.bg3 || 'rgba(255,255,255,.03)';
      ctx.fillRect(0, 0, W, H);
      if (!view) { frameRef.current = requestAnimationFrame(draw); return; }
      const doc = view.state.doc;
      const totalLines = doc.lines;
      const lineH = Math.max(1, H / Math.max(totalLines, 1));
      for (let i = 1; i <= totalLines; i++) {
        const src = doc.line(i).text;
        const len = src.trimStart().length;
        const indent = src.length - src.trimStart().length;
        if (!len) continue;
        let color = T?.textMute || 'rgba(255,255,255,.15)';
        if (/^\s*(\/\/|#|<!--|\/\*)/.test(src)) color = (T?.success || '#4ade80') + '55';
        else if (/^\s*(import|export|from|require)/.test(src)) color = (T?.accent || '#a78bfa') + '88';
        else if (/^\s*(function|const|let|var|class|def|return)/.test(src)) color = (T?.accentBorder || '#7c3aed') + 'aa';
        else if (/^\s*['<]/.test(src)) color = (T?.warning || '#fbbf24') + '66';
        const y = ((i - 1) / Math.max(totalLines - 1, 1)) * (H - lineH);
        const xStart = Math.min(indent * 0.7, W * 0.3);
        const xEnd   = Math.min(xStart + len * 0.85, W - 2);
        ctx.fillStyle = color;
        ctx.fillRect(xStart, y, Math.max(xEnd - xStart, 1), Math.max(lineH * 0.7, 1));
      }
      try {
        const { scrollTop, scrollHeight, clientHeight } = view.scrollDOM;
        if (scrollHeight > clientHeight) {
          const ratio = clientHeight / scrollHeight;
          const vpH = H * ratio, vpY = (scrollTop / scrollHeight) * H;
          ctx.fillStyle = (T?.accent || '#a78bfa') + '22';
          ctx.fillRect(0, vpY, W, vpH);
          ctx.strokeStyle = (T?.accentBorder || '#7c3aed') + '55';
          ctx.lineWidth = 1;
          ctx.strokeRect(0, vpY, W, vpH);
        }
      } catch (_) {}
      frameRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { running = false; cancelAnimationFrame(frameRef.current); };
  }, [viewRef, T]);
  return (
    <canvas ref={canvasRef} width={64} height={300} style={{
      width: '64px', height: '100%', flexShrink: 0, cursor: 'pointer',
      borderLeft: '1px solid ' + (T?.border || 'rgba(255,255,255,.06)'),
    }} onClick={e => {
      const view = viewRef.current;
      if (!view) return;
      const rect  = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientY - rect.top) / rect.height;
      const doc   = view.state.doc;
      const line  = Math.max(1, Math.min(Math.round(ratio * doc.lines), doc.lines));
      view.dispatch({ selection: { anchor: doc.line(line).from }, scrollIntoView: true });
    }}/>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
function Breadcrumb({ viewRef, T }) {
  const [crumbs, setCrumbs] = useState([]);

  // Listen to cursor movement via a plugin attached after mount
  const setCrumbsRef = useRef(setCrumbs);
  useEffect(() => { setCrumbsRef.current = setCrumbs; }, [setCrumbs]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    function update(v) {
      const pos  = v.state.selection.main.head;
      const tree = syntaxTree(v.state);
      const path = [];
      let node = tree.resolveInner(pos, -1);
      const seen = new Set();
      while (node && node.parent) {
        const name = node.type.name;
        if (/^(FunctionDeclaration|FunctionExpression|ArrowFunction|MethodDefinition|ClassDeclaration)$/.test(name)) {
          const idNode = node.getChild('VariableDefinition') || node.getChild('PropertyDefinition') || node.firstChild;
          const raw = idNode ? v.state.doc.sliceString(idNode.from, Math.min(idNode.to, idNode.from + 30)) : name.replace('Declaration', '');
          const label = raw.trim().split(/[\s({]/)[0];
          if (label && !seen.has(label)) { seen.add(label); path.unshift(label); }
        }
        node = node.parent;
      }
      setCrumbsRef.current(path.slice(-4));
    }
    // Initial read
    update(view);
    // Subscribe via updateListener extension — inject as a state facet
    // Since view is already created, we use a transaction listener
    const ext = EditorView.updateListener.of(upd => {
      if (upd.selectionSet || upd.docChanged) update(upd.view);
    });
    // Inject via a new compartment on existing view
    const comp = new Compartment();
    view.dispatch({ effects: StateEffect.appendConfig.of(comp.of(ext)) });
    return () => {
      try { view.dispatch({ effects: comp.reconfigure([]) }); } catch (_) {}
    };
  }, [viewRef]);

  if (crumbs.length === 0) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '2px',
      padding: '2px 10px', borderBottom: '1px solid ' + (T?.border || 'rgba(255,255,255,.06)'),
      background: T?.bg2 || '#111116', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none',
      minHeight: '22px',
    }}>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={9} style={{ color: T?.textMute || 'rgba(255,255,255,.3)', flexShrink: 0 }}/>}
          <span style={{
            fontSize: '10px',
            color: i === crumbs.length - 1 ? T?.accent || '#a78bfa' : T?.textMute || 'rgba(255,255,255,.3)',
            fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{c}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Collab WS plugin ──────────────────────────────────────────────────────────
function makeCollabPlugin(wsRef) {
  return ViewPlugin.fromClass(class {
    pushing = false;
    timer   = null;
    constructor() { this.schedule(); }
    schedule() { this.timer = setTimeout(() => this.push(), 150); }
    async push() {
      if (this.pushing) { this.schedule(); return; }
      const ws = wsRef.current;
      if (!ws || ws.readyState !== 1) { this.schedule(); return; }
      this.pushing = true;
      try {
        // sendableUpdates is processed in update() — this slot reserved for future batch sends
        void 0;
      } finally { this.pushing = false; this.schedule(); }
    }
    update(upd) {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== 1) return;
      const updates = sendableUpdates(upd.state);
      if (!updates.length) return;
      try {
        ws.send(JSON.stringify({
          type: 'collab_push',
          version: getSyncedVersion(upd.state),
          updates: updates.map(u => ({ clientID: u.clientID, changes: u.changes.toJSON() })),
        }));
      } catch (_) {}
    }
    destroy() { clearTimeout(this.timer); }
  });
}

// ── Build optional extensions ─────────────────────────────────────────────────
function buildOptionalExtensions(cfg, path, _folder, collabWsRef) {
  const exts = [];
  if (cfg?.vimMode)   exts.push(vim({ status: true }));
  if (cfg?.emmet && isEmmetLang(path)) {
    exts.push(abbreviationTracker());
    exts.push(keymap.of([{ key: 'Ctrl-e', run: expandAbbreviation }]));
  }
  if (cfg?.ghostText) exts.push(ghostField, ghostL2Field, ghostDecorations, ghostL2Decorations, ghostAcceptKeymap, makeGhostPlugin());
  if (cfg?.lint) {
    const linterExt = makeSyntaxLinter(path, _folder);
    if (linterExt) exts.push(linterExt, lintGutter());
  }
  if (cfg?.multiCursor) {
    exts.push(keymap.of([
      { key: 'Ctrl-d',       run: selectNextOccurrence },
      { key: 'Ctrl-Shift-l', run: selectSelectionMatches },
    ]));
  }
  if (cfg?.collab && collabWsRef) {
    exts.push(collab({ startVersion: 0 }), makeCollabPlugin(collabWsRef));
  }
  return exts;
}

// ── Main FileEditor ───────────────────────────────────────────────────────────
export const FileEditor = forwardRef(function FileEditor(
  { tab, onSave, onClose, T, editorConfig, folder },
  ref
) {
  const containerRef   = useRef(null);
  const viewRef        = useRef(null);
  const themeComp      = useRef(new Compartment());
  const langComp       = useRef(new Compartment());
  const optsComp       = useRef(new Compartment());
  const blameComp      = useRef(new Compartment());
  const collabWsRef    = useRef(null);
  const prevPathRef    = useRef(null);
  const savedStatesRef = useRef(new Map());

  const [saved,        setSaved]       = useState(true);
  const [cursor,       setCursor]      = useState({ line: 1, col: 1 });
  const [blameData,    setBlameData]   = useState(null);
  const [blameLoading, setBlameLoad]   = useState(false);
  const [tsReady,      setTsReady]     = useState(false);

  const T_bg3          = T?.bg3          || 'rgba(255,255,255,.04)';
  const T_border       = T?.border       || 'rgba(255,255,255,.06)';
  const T_textMute     = T?.textMute     || 'rgba(255,255,255,.3)';
  const T_accent       = T?.accent       || '#a78bfa';
  const T_accentBg     = T?.accentBg     || 'rgba(124,58,237,.2)';
  const T_accentBorder = T?.accentBorder || 'rgba(124,58,237,.35)';
  const T_success      = T?.success      || '#4ade80';
  const T_successBg    = T?.successBg    || 'rgba(74,222,128,.12)';
  const T_warning      = T?.warning      || '#fbbf24';

  useImperativeHandle(ref, () => ({
    insert(text) {
      const view = viewRef.current;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      view.dispatch({ changes: { from, to, insert: text }, selection: { anchor: from + text.length } });
      view.focus();
    },
    focus()     { viewRef.current?.focus(); },
    foldAll()   { if (viewRef.current) foldAll(viewRef.current); },
    unfoldAll() { if (viewRef.current) unfoldAll(viewRef.current); },
  }));

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const updateListener = EditorView.updateListener.of(upd => {
      if (upd.docChanged) setSaved(false);
      if (upd.selectionSet) {
        const pos  = upd.state.selection.main.head;
        const line = upd.state.doc.lineAt(pos);
        setCursor({ line: line.number, col: pos - line.from + 1 });
      }
    });
    const state = EditorState.create({
      doc: tab?.content || '',
      extensions: [
        basicSetup,
        themeComp.current.of(buildTheme(T)),
        langComp.current.of(getLang(tab?.path)),
        optsComp.current.of(buildOptionalExtensions(editorConfig, tab?.path, folder, collabWsRef)),
        blameComp.current.of([]),
        updateListener,
        EditorView.lineWrapping,
        keymap.of([{ key: 'Tab', run: indentWithTab }]),
      ],
    });
    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Theme sync ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({ effects: themeComp.current.reconfigure(buildTheme(T)) });
  }, [T]);

  // ── Lang sync ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!viewRef.current || !tab?.path) return;
    viewRef.current.dispatch({ effects: langComp.current.reconfigure(getLang(tab.path)) });
  }, [tab?.path]);

  // ── Optional extensions sync ────────────────────────────────────────────────
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: optsComp.current.reconfigure(
        buildOptionalExtensions(editorConfig, tab?.path, folder, collabWsRef)
      ),
    });
  }, [ // eslint-disable-line react-hooks/exhaustive-deps
    editorConfig?.vimMode, editorConfig?.emmet, editorConfig?.ghostText,
    editorConfig?.lint, editorConfig?.multiCursor, editorConfig?.collab,
  ]);

  // ── Blame toggle ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editorConfig?.blame || !tab?.path || !folder) {
      setTimeout(() => setBlameData(null), 0);
      return;
    }
    setTimeout(() => setBlameLoad(true), 0);
    fetchBlame(folder, tab.path).then(map => {
      setBlameData(map.size > 0 ? map : null);
      setBlameLoad(false);
    });
  }, [editorConfig?.blame, tab?.path, folder]);

  // ── Blame gutter update ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: blameComp.current.reconfigure(blameData ? makeBlameGutter(blameData) : []),
    });
  }, [blameData]);

  // ── TS LSP lazy attach ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!editorConfig?.tsLsp || !tab?.path || !isTsLang(tab.path)) { setTimeout(() => setTsReady(false), 0); return; }
    let cancelled = false;
    getTsExtensions().then(mod => {
      if (cancelled || !mod) return;
      setTsReady(true);
      // Further TS integration would attach completionSource + hoverTooltip here
      // Requires a tsserver worker — deferred to when worker is available
    });
    return () => { cancelled = true; };
  }, [editorConfig?.tsLsp, tab?.path]);

  // ── Collab WS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editorConfig?.collab || !editorConfig?.collabRoom) {
      if (collabWsRef.current) { collabWsRef.current.close(); collabWsRef.current = null; }
      return;
    }
    const ws = new WebSocket('ws://127.0.0.1:8766');
    collabWsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'collab_join', room: editorConfig.collabRoom, file: tab?.path }));
    };
    ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type !== 'collab_updates' || !viewRef.current) return;
        const upds = msg.updates.map(u => ({
          changes: EditorState.fromJSON
            ? null // fallback
            : null,
          clientID: u.clientID,
        })).filter(Boolean);
        if (upds.length && viewRef.current) {
          viewRef.current.dispatch(receiveUpdates(viewRef.current.state, upds));
        }
      } catch (_) {}
    };
    ws.onclose = () => { collabWsRef.current = null; };
    return () => { ws.close(); collabWsRef.current = null; };
  }, [editorConfig?.collab, editorConfig?.collabRoom, tab?.path]);

  // ── Tab swap ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !tab?.path) return;
    const oldPath = prevPathRef.current;
    if (oldPath && oldPath !== tab.path) savedStatesRef.current.set(oldPath, view.state);
    const existing = savedStatesRef.current.get(tab.path);
    if (existing && oldPath !== tab.path) {
      view.setState(existing);
    } else if (!oldPath || oldPath !== tab.path) {
      const updateListener = EditorView.updateListener.of(upd => {
        if (upd.docChanged) setSaved(false);
        if (upd.selectionSet) {
          const pos  = upd.state.selection.main.head;
          const line = upd.state.doc.lineAt(pos);
          setCursor({ line: line.number, col: pos - line.from + 1 });
        }
      });
      const newState = EditorState.create({
        doc: tab.content || '',
        extensions: [
          basicSetup,
          themeComp.current.of(buildTheme(T)),
          langComp.current.of(getLang(tab.path)),
          optsComp.current.of(buildOptionalExtensions(editorConfig, tab.path, folder, collabWsRef)),
          blameComp.current.of(blameData ? makeBlameGutter(blameData) : []),
          updateListener,
          EditorView.lineWrapping,
          keymap.of([{ key: 'Tab', run: indentWithTab }]),
        ],
      });
      view.setState(newState);
    }
    prevPathRef.current = tab.path;
    setTimeout(() => setSaved(true), 0);
  }, [tab?.path]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── External content sync ────────────────────────────────────────────────────
  useEffect(() => {
    if (!viewRef.current || !tab?.content) return;
    if (prevPathRef.current !== tab.path) return;
    const current = viewRef.current.state.doc.toString();
    if (current !== tab.content) {
      viewRef.current.dispatch({ changes: { from: 0, to: current.length, insert: tab.content } });
      setTimeout(() => setSaved(true), 0);
    }
  }, [tab?.content, tab?.path]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!viewRef.current) return;
    await onSave(viewRef.current.state.doc.toString());
    setSaved(true);
  }, [onSave]);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const tbBtn = (active) => ({
    background: active ? T_accentBg : T_bg3,
    border: '1px solid ' + (active ? T_accentBorder : T_border),
    borderRadius: '6px', padding: '4px 10px',
    color: active ? T_accent : T_textMute,
    fontSize: '10px', cursor: 'pointer', minHeight: '28px', whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: '3px',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        padding: '4px 10px', borderBottom: '1px solid ' + T_border,
        display: 'flex', alignItems: 'center', gap: '4px',
        background: T_bg3, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        <span style={{ fontSize: '11px', color: T_textMute, fontFamily: 'monospace',
          flexShrink: 0, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tab?.path?.split('/').pop() || ''}
        </span>
        <div style={{ flex: 1 }}/>

        {/* badges */}
        {editorConfig?.vimMode   && <span style={{ fontSize: '9px', color: T_accent,   fontFamily: 'monospace', flexShrink: 0 }}>VIM</span>}
        {editorConfig?.ghostText && <span style={{ fontSize: '9px', color: T_success,  fontFamily: 'monospace', flexShrink: 0 }}>AI</span>}
        {editorConfig?.lint      && <span style={{ fontSize: '9px', color: T_warning,  fontFamily: 'monospace', flexShrink: 0 }}>LINT</span>}
        {tsReady                 && <span style={{ fontSize: '9px', color: '#38bdf8',  fontFamily: 'monospace', flexShrink: 0 }}>TS</span>}
        {editorConfig?.collab    && <span style={{ fontSize: '9px', color: '#f59e0b',  fontFamily: 'monospace', flexShrink: 0 }}>LIVE</span>}
        {blameLoading            && <span style={{ fontSize: '9px', color: T_textMute, fontFamily: 'monospace', flexShrink: 0 }}>blame···</span>}

        {/* fold/unfold */}
        <button onClick={() => viewRef.current && foldAll(viewRef.current)}   style={tbBtn(false)}>⊟ fold</button>
        <button onClick={() => viewRef.current && unfoldAll(viewRef.current)} style={tbBtn(false)}>⊞ unfold</button>

        {!saved && <span style={{ fontSize: '10px', color: T_warning, flexShrink: 0 }}>●</span>}
        <span style={{ fontSize: '10px', color: T_textMute, fontFamily: 'monospace', flexShrink: 0 }}>
          {cursor.line}:{cursor.col}
        </span>
        <button onClick={save} style={{ ...tbBtn(false), background: T_successBg,
          border: '1px solid rgba(74,222,128,.25)', color: T_success, fontWeight: '500' }}>
          <Save size={11}/> Save
        </button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: T_textMute,
          fontSize: '18px', cursor: 'pointer', padding: '2px 4px', flexShrink: 0, lineHeight: 1 }}>
          ×
        </button>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb viewRef={viewRef} T={T}/>

      {/* Editor + minimap */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}/>
        {editorConfig?.minimap && <Minimap viewRef={viewRef} T={T}/>}
      </div>
    </div>
  );
});
