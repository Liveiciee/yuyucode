// ── FileEditor — CodeMirror 6 · Multi-tab · Vim · Emmet · Ghost Text · Minimap · Lint ──
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Save } from 'lucide-react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment, StateEffect, StateField } from '@codemirror/state';
import { Decoration, WidgetType, ViewPlugin, keymap } from '@codemirror/view';
import { linter, lintGutter } from '@codemirror/lint';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { vim } from '@replit/codemirror-vim';
import { abbreviationTracker, expandAbbreviation } from '@emmetio/codemirror6-plugin';
import { callServer } from '../api.js';

// ── Language detector ────────────────────────────────────────────────────────
function getLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': case 'mjs': case 'cjs': return javascript();
    case 'jsx':            return javascript({ jsx: true });
    case 'ts':             return javascript({ typescript: true });
    case 'tsx':            return javascript({ jsx: true, typescript: true });
    case 'css': case 'scss': case 'sass': return css();
    case 'html': case 'htm': return html();
    case 'json':           return json();
    case 'py':             return python();
    case 'md': case 'mdx': return markdown();
    default:               return javascript();
  }
}

function isEmmetLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return ['html', 'htm', 'jsx', 'tsx', 'css', 'scss'].includes(ext);
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
    '.cm-matchingBracket': { backgroundColor: accentBg, outline: '1px solid ' + accent + '44', borderRadius: '2px' },
    '.cm-searchMatch': { backgroundColor: accentBg, borderRadius: '2px' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: accent + '44' },
    '.cm-tooltip': { backgroundColor: bg2, border: '1px solid ' + border,
      borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,.5)' },
    '.cm-tooltip-autocomplete > ul > li': { padding: '4px 10px' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: accentBg, color: accent },
    '.cm-panels': { backgroundColor: bg2, borderBottom: '1px solid ' + border },
    '.cm-panel.cm-search': { padding: '6px 10px', gap: '6px' },
    '.cm-panel.cm-search input': { backgroundColor: bg3, border: '1px solid ' + border,
      borderRadius: '6px', color: text, padding: '4px 8px', outline: 'none' },
    '.cm-panel.cm-search button': { backgroundColor: bg3, border: '1px solid ' + border,
      borderRadius: '6px', color: text, padding: '4px 10px', cursor: 'pointer' },
    // Lint gutter
    '.cm-gutter-lint': { width: '14px' },
    '.cm-lint-marker-error': { color: error },
    '.cm-lint-marker-warning': { color: warning },
    // Vim status bar
    '.cm-vim-panel': { backgroundColor: bg2, borderTop: '1px solid ' + border,
      color: textMute, fontSize: '11px', padding: '2px 8px', fontFamily: 'monospace' },
    '.cm-vim-panel input': { backgroundColor: 'transparent', border: 'none', color: text,
      outline: 'none', fontFamily: 'monospace' },
  }, { dark: true });
}

// ── Ghost text extension ──────────────────────────────────────────────────────
const setGhostEffect   = StateEffect.define();
const clearGhostEffect = StateEffect.define();

const ghostField = StateField.define({
  create: () => ({ text: '', pos: 0 }),
  update(val, tr) {
    if (tr.docChanged) return { text: '', pos: 0 };
    for (const e of tr.effects) {
      if (e.is(setGhostEffect))   return e.value;
      if (e.is(clearGhostEffect)) return { text: '', pos: 0 };
    }
    return val;
  },
});

class GhostWidget extends WidgetType {
  constructor(text) { super(); this.text = text; }
  toDOM() {
    const span = document.createElement('span');
    span.textContent = this.text;
    span.style.cssText = 'opacity:0.38;color:inherit;pointer-events:none;';
    return span;
  }
  eq(other) { return this.text === other.text; }
  ignoreEvent() { return true; }
}

const ghostDecorations = EditorView.decorations.compute([ghostField], state => {
  const { text, pos } = state.field(ghostField);
  if (!text || pos > state.doc.length) return Decoration.none;
  return Decoration.set([
    Decoration.widget({ widget: new GhostWidget(text), side: 1 }).range(pos),
  ]);
});

const ghostAcceptKeymap = keymap.of([{
  key: 'Tab',
  run(view) {
    const { text, pos } = view.state.field(ghostField);
    if (!text) return false;
    view.dispatch({
      changes: { from: pos, insert: text },
      effects: clearGhostEffect.of(null),
      selection: { anchor: pos + text.length },
    });
    return true;
  },
}, {
  key: 'Escape',
  run(view) {
    const { text } = view.state.field(ghostField);
    if (!text) return false;
    view.dispatch({ effects: clearGhostEffect.of(null) });
    return true;
  },
}]);

async function fetchAISuggestion(prefix) {
  const key = import.meta?.env?.VITE_CEREBRAS_API_KEY || '';
  if (!key) return null;
  try {
    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1-8b',
        max_tokens: 60,
        temperature: 0.15,
        messages: [
          { role: 'system', content: 'You complete code. Reply ONLY with the completion text, nothing else. No markdown, no backticks.' },
          { role: 'user', content: 'Complete this code from where it ends:\n' + prefix.slice(-600) },
        ],
        stop: ['\n\n', '```', '// ---', '/* ---'],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (_) {
    return null;
  }
}

function makeGhostPlugin() {
  return ViewPlugin.fromClass(class {
    timer = null;
    update(upd) {
      if (!upd.docChanged) return;
      clearTimeout(this.timer);
      const { text } = upd.view.state.field(ghostField);
      if (text) upd.view.dispatch({ effects: clearGhostEffect.of(null) });
      this.timer = setTimeout(() => {
        const view = upd.view;
        if (view.isDestroyed) return;
        const pos    = view.state.selection.main.head;
        const prefix = view.state.doc.sliceString(0, pos);
        const lastLine = prefix.split('\n').pop() || '';
        if (lastLine.trim().length < 3) return;
        fetchAISuggestion(prefix).then(text => {
          if (!text || view.isDestroyed) return;
          const curPos = view.state.selection.main.head;
          if (curPos !== pos) return; // cursor moved — stale
          view.dispatch({ effects: setGhostEffect.of({ text, pos }) });
        });
      }, 900);
    }
    destroy() { clearTimeout(this.timer); }
  });
}

// ── Syntax-only lint (node --check for .js, JSON.parse for .json) ─────────────
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
        return [{ from: lineObj.from, to: lineObj.to, severity: 'error',
          message: (r.data || '').split('\n')[0] }];
      } catch (_) { return []; }
    }, { delay: 1200 });
  }

  return null;
}

// ── Minimap canvas component ───────────────────────────────────────────────────
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
      const ctx  = canvas.getContext('2d');
      const W    = canvas.width;
      const H    = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = T?.bg3 || 'rgba(255,255,255,.03)';
      ctx.fillRect(0, 0, W, H);

      if (!view) { frameRef.current = requestAnimationFrame(draw); return; }

      const doc      = view.state.doc;
      const totalLines = doc.lines;
      const lineH    = Math.max(1, H / Math.max(totalLines, 1));

      // Draw code lines as colored blocks
      for (let i = 1; i <= totalLines; i++) {
        const line = doc.line(i);
        const src  = line.text;
        const len  = Math.min(src.trimStart().length, src.length);
        const indent = src.length - src.trimStart().length;

        if (len === 0) { continue; }

        // Color by content type (heuristic)
        let color = T?.textMute || 'rgba(255,255,255,.15)';
        if (/^\s*(\/\/|#|<!--|\/\*)/.test(src)) color = (T?.success || '#4ade80') + '55';
        else if (/^\s*(import|export|from|require)/.test(src)) color = (T?.accent || '#a78bfa') + '88';
        else if (/^\s*(function|const|let|var|class|def|return)/.test(src)) color = (T?.accentBorder || '#7c3aed') + 'aa';
        else if (/^\s*['"<]/.test(src)) color = (T?.warning || '#fbbf24') + '66';

        const y = ((i - 1) / Math.max(totalLines - 1, 1)) * (H - lineH);
        const xStart = Math.min(indent * 0.7, W * 0.3);
        const xEnd   = Math.min(xStart + len * 0.85, W - 2);
        ctx.fillStyle = color;
        ctx.fillRect(xStart, y, Math.max(xEnd - xStart, 1), Math.max(lineH * 0.7, 1));
      }

      // Viewport indicator
      try {
        const { scrollTop, scrollHeight, clientHeight } = view.scrollDOM;
        if (scrollHeight > clientHeight) {
          const ratio = clientHeight / scrollHeight;
          const vpH   = H * ratio;
          const vpY   = (scrollTop / scrollHeight) * H;
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
    <canvas
      ref={canvasRef}
      width={64}
      height={300}
      style={{
        width: '64px',
        height: '100%',
        flexShrink: 0,
        cursor: 'pointer',
        borderLeft: '1px solid ' + (T?.border || 'rgba(255,255,255,.06)'),
      }}
      onClick={e => {
        const view = viewRef.current;
        if (!view) return;
        const rect  = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientY - rect.top) / rect.height;
        const doc   = view.state.doc;
        const line  = Math.max(1, Math.min(Math.round(ratio * doc.lines), doc.lines));
        const pos   = doc.line(line).from;
        view.dispatch({ selection: { anchor: pos }, scrollIntoView: true });
      }}
    />
  );
}

// ── Main FileEditor component ─────────────────────────────────────────────────
export const FileEditor = forwardRef(function FileEditor(
  { tab, onSave, onClose, T, editorConfig, folder },
  ref
) {
  const containerRef = useRef(null);
  const viewRef      = useRef(null);
  const themeComp    = useRef(new Compartment());
  const langComp     = useRef(new Compartment());
  const optsComp     = useRef(new Compartment());
  const [saved,  setSaved]  = useState(true);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });

  const T_bg3         = T?.bg3           || 'rgba(255,255,255,.04)';
  const T_border      = T?.border        || 'rgba(255,255,255,.06)';
  const T_textMute    = T?.textMute      || 'rgba(255,255,255,.3)';
  const T_accent      = T?.accent        || '#a78bfa';
  const T_accentBg    = T?.accentBg      || 'rgba(124,58,237,.2)';
  const T_accentBorder = T?.accentBorder || 'rgba(124,58,237,.35)';
  const T_success     = T?.success       || '#4ade80';
  const T_successBg   = T?.successBg     || 'rgba(74,222,128,.12)';
  const T_warning     = T?.warning       || '#fbbf24';

  // ── Expose insert() + focus() via ref ───────────────────────────────────────
  useImperativeHandle(ref, () => ({
    insert(text) {
      const view = viewRef.current;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
      view.focus();
    },
    focus() {
      viewRef.current?.focus();
    },
  }));

  // ── Build optional extensions from editorConfig ──────────────────────────
  function buildOptionalExtensions(cfg, path, fldr) {
    const exts = [];
    if (cfg?.vimMode)       exts.push(vim({ status: true }));
    if (cfg?.emmet && isEmmetLang(path)) {
      exts.push(abbreviationTracker());
      exts.push(keymap.of([{ key: 'Ctrl-e', run: expandAbbreviation }]));
    }
    if (cfg?.ghostText)     exts.push(ghostField, ghostDecorations, ghostAcceptKeymap, makeGhostPlugin());
    if (cfg?.lint) {
      const linterExt = makeSyntaxLinter(path, fldr);
      if (linterExt) exts.push(linterExt, lintGutter());
    }
    return exts;
  }

  // ── Mount CodeMirror once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) setSaved(false);
      if (update.selectionSet) {
        const pos  = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);
        setCursor({ line: line.number, col: pos - line.from + 1 });
      }
    });

    const state = EditorState.create({
      doc: tab?.content || '',
      extensions: [
        basicSetup,
        themeComp.current.of(buildTheme(T)),
        langComp.current.of(getLang(tab?.path)),
        optsComp.current.of(buildOptionalExtensions(editorConfig, tab?.path, folder)),
        updateListener,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => { view.destroy(); viewRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync theme changes ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({ effects: themeComp.current.reconfigure(buildTheme(T)) });
  }, [T]);

  // ── Sync language when tab path changes ─────────────────────────────────────
  useEffect(() => {
    if (!viewRef.current || !tab?.path) return;
    viewRef.current.dispatch({ effects: langComp.current.reconfigure(getLang(tab.path)) });
  }, [tab?.path]); 

  // ── Sync optional extensions when editorConfig changes ──────────────────────
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: optsComp.current.reconfigure(
        buildOptionalExtensions(editorConfig, tab?.path, folder)
      ),
    });
  }, [editorConfig?.vimMode, editorConfig?.emmet, editorConfig?.ghostText, editorConfig?.lint]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync content when tab changes (EditorView.setState for state swap) ──────
  const prevPathRef = useRef(null);
  const savedStatesRef = useRef(new Map()); // path → EditorState

  useEffect(() => {
    const view = viewRef.current;
    if (!view || !tab?.path) return;

    const oldPath = prevPathRef.current;

    // Save old state if we're switching paths
    if (oldPath && oldPath !== tab.path) {
      savedStatesRef.current.set(oldPath, view.state);
    }

    // Restore or create state for new path
    const existing = savedStatesRef.current.get(tab.path);
    if (existing && oldPath !== tab.path) {
      view.setState(existing);
    } else if (!oldPath || oldPath !== tab.path) {
      // First time opening this path
      const updateListener = EditorView.updateListener.of(update => {
        if (update.docChanged) setSaved(false);
        if (update.selectionSet) {
          const pos  = update.state.selection.main.head;
          const line = update.state.doc.lineAt(pos);
          setCursor({ line: line.number, col: pos - line.from + 1 });
        }
      });
      const newState = EditorState.create({
        doc: tab.content || '',
        extensions: [
          basicSetup,
          themeComp.current.of(buildTheme(T)),
          langComp.current.of(getLang(tab.path)),
          optsComp.current.of(buildOptionalExtensions(editorConfig, tab.path, folder)),
          updateListener,
          EditorView.lineWrapping,
        ],
      });
      view.setState(newState);
    }

    prevPathRef.current = tab.path;
    setTimeout(() => setSaved(true), 0);
  }, [tab?.path]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync content changes from external writes (agent loop etc.) ─────────────
  useEffect(() => {
    if (!viewRef.current || !tab?.content) return;
    // Only update if the path hasn't changed (avoid overwriting state swap)
    if (prevPathRef.current !== tab.path) return;
    const current = viewRef.current.state.doc.toString();
    if (current !== tab.content) {
      viewRef.current.dispatch({
        changes: { from: 0, to: current.length, insert: tab.content },
      });
      setTimeout(() => setSaved(true), 0);
    }
  }, [tab?.content, tab?.path]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!viewRef.current) return;
    await onSave(viewRef.current.state.doc.toString());
    setSaved(true);
  }, [onSave]);

  // Ctrl+S
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
    borderRadius: '7px', padding: '5px 12px',
    color: active ? T_accent : T_textMute,
    fontSize: '11px', cursor: 'pointer', minHeight: '32px', whiteSpace: 'nowrap',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        padding: '5px 10px', borderBottom: '1px solid ' + T_border,
        display: 'flex', alignItems: 'center', gap: '5px',
        background: T_bg3, flexShrink: 0, overflowX: 'auto',
      }}>
        <span style={{ fontSize: '11px', color: T_textMute, fontFamily: 'monospace',
          flexShrink: 0, maxWidth: '140px', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tab?.path?.split('/').pop() || ''}
        </span>
        <div style={{ flex: 1 }}/>

        {/* Feature badges */}
        {editorConfig?.vimMode     && <span style={{ fontSize: '10px', color: T_accent, fontFamily: 'monospace' }}>VIM</span>}
        {editorConfig?.ghostText   && <span style={{ fontSize: '10px', color: T_success, fontFamily: 'monospace' }}>AI</span>}
        {editorConfig?.lint        && <span style={{ fontSize: '10px', color: T?.warning || '#fbbf24', fontFamily: 'monospace' }}>LINT</span>}

        {/* Unsaved dot */}
        {!saved && <span style={{ fontSize: '10px', color: T_warning, flexShrink: 0 }}>●</span>}

        {/* Cursor pos */}
        <span style={{ fontSize: '10px', color: T_textMute, fontFamily: 'monospace', flexShrink: 0 }}>
          {cursor.line}:{cursor.col}
        </span>

        {/* Save button */}
        <button onClick={save}
          style={{ ...tbBtn(false), background: T_successBg,
            border: '1px solid rgba(74,222,128,.25)',
            color: T_success, fontWeight: '500',
            display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Save size={12}/> Save
        </button>

        {/* Close */}
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', color: T_textMute,
            fontSize: '18px', cursor: 'pointer', padding: '2px 4px', flexShrink: 0,
            lineHeight: 1 }}>
          ×
        </button>
      </div>

      {/* Editor + optional minimap */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}/>
        {editorConfig?.minimap && <Minimap viewRef={viewRef} T={T}/>}
      </div>
    </div>
  );
});
