// ── FileEditor — CodeMirror 6 ─────────────────────────────────────────────────
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Save } from 'lucide-react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';

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

function buildTheme(T) {
  const bg        = T?.bg        || '#0d0d0e';
  const bg2       = T?.bg2       || '#111116';
  const bg3       = T?.bg3       || 'rgba(255,255,255,.04)';
  const border    = T?.border    || 'rgba(255,255,255,.06)';
  const text      = T?.text      || 'rgba(255,255,255,.85)';
  const textMute  = T?.textMute  || 'rgba(255,255,255,.3)';
  const accent    = T?.accent    || '#a78bfa';
  const accentBg  = T?.accentBg  || 'rgba(124,58,237,.15)';

  return EditorView.theme({
    '&': {
      backgroundColor: bg,
      color: text,
      height: '100%',
      fontFamily: '"JetBrains Mono","Fira Code",monospace',
      fontSize: '13px',
    },
    '&.cm-focused': { outline: 'none' },
    '.cm-scroller': { overflow: 'auto', lineHeight: '1.65' },
    '.cm-content': { padding: '8px 0', caretColor: accent },
    '.cm-gutters': {
      backgroundColor: bg3,
      borderRight: '1px solid ' + border,
      color: textMute,
      minWidth: '38px',
      padding: '0 4px',
    },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 6px 0 4px' },
    '.cm-activeLineGutter': { backgroundColor: accentBg + '66' },
    '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,.015)' },
    '.cm-cursor': { borderLeftColor: accent, borderLeftWidth: '2px' },
    '.cm-selectionBackground': { backgroundColor: accentBg + ' !important' },
    '&.cm-focused .cm-selectionBackground': { backgroundColor: accentBg + ' !important' },
    '.cm-matchingBracket': {
      backgroundColor: accentBg,
      outline: '1px solid ' + accent + '44',
      borderRadius: '2px',
    },
    '.cm-searchMatch': { backgroundColor: accentBg, borderRadius: '2px' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: accent + '44' },
    '.cm-tooltip': {
      backgroundColor: bg2,
      border: '1px solid ' + border,
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,.5)',
    },
    '.cm-tooltip-autocomplete > ul > li': { padding: '4px 10px' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      backgroundColor: accentBg,
      color: accent,
    },
    '.cm-panels': { backgroundColor: bg2, borderBottom: '1px solid ' + border },
    '.cm-panel.cm-search': { padding: '6px 10px', gap: '6px' },
    '.cm-panel.cm-search input': {
      backgroundColor: bg3,
      border: '1px solid ' + border,
      borderRadius: '6px',
      color: text,
      padding: '4px 8px',
      outline: 'none',
    },
    '.cm-panel.cm-search button': {
      backgroundColor: bg3,
      border: '1px solid ' + border,
      borderRadius: '6px',
      color: text,
      padding: '4px 10px',
      cursor: 'pointer',
    },
  }, { dark: true });
}

export function FileEditor({ path, content, onSave, onClose, T }) {
  const containerRef = useRef(null);
  const viewRef      = useRef(null);
  const themeComp    = useRef(new Compartment());
  const langComp     = useRef(new Compartment());
  const [saved,      setSaved]      = useState(true);
  const [cursor,     setCursor]     = useState({ line: 1, col: 1 });

  const bg3          = T?.bg3           || 'rgba(255,255,255,.04)';
  const border       = T?.border        || 'rgba(255,255,255,.06)';
  const textMute     = T?.textMute      || 'rgba(255,255,255,.3)';
  const accent       = T?.accent        || '#a78bfa';
  const accentBg     = T?.accentBg      || 'rgba(124,58,237,.2)';
  const accentBorder = T?.accentBorder  || 'rgba(124,58,237,.35)';
  const success      = T?.success       || '#4ade80';
  const successBg    = T?.successBg     || 'rgba(74,222,128,.12)';
  const warning      = T?.warning       || '#fbbf24';

  // ── Mount CodeMirror ────────────────────────────────────────────────────────
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
      doc: content || '',
      extensions: [
        basicSetup,
        themeComp.current.of(buildTheme(T)),
        langComp.current.of(getLang(path)),
        updateListener,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => { view.destroy(); viewRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update theme when T changes ─────────────────────────────────────────────
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: themeComp.current.reconfigure(buildTheme(T)),
    });
  }, [T]);

  // ── Update lang when path changes ───────────────────────────────────────────
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: langComp.current.reconfigure(getLang(path)),
    });
  }, [path]);

  // ── Sync external content changes (e.g. file reloaded) ─────────────────────
  useEffect(() => {
    if (!viewRef.current) return;
    const current = viewRef.current.state.doc.toString();
    if (current !== content) {
      viewRef.current.dispatch({
        changes: { from: 0, to: current.length, insert: content || '' },
      });
      setTimeout(() => setSaved(true), 0);
    }
  }, [content]);

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
    background: active ? accentBg : bg3,
    border: '1px solid ' + (active ? accentBorder : border),
    borderRadius: '7px', padding: '7px 14px',
    color: active ? accent : textMute,
    fontSize: '12px', cursor: 'pointer', minHeight: '36px', whiteSpace: 'nowrap',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ padding: '6px 10px', borderBottom: '1px solid ' + border,
        display: 'flex', alignItems: 'center', gap: '6px',
        background: bg3, flexShrink: 0, overflowX: 'auto' }}>
        <span style={{ fontSize: '11px', color: textMute, fontFamily: 'monospace',
          flexShrink: 0, maxWidth: '140px', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {path?.split('/').pop()}
        </span>
        <div style={{ flex: 1 }}/>
        {!saved && <span style={{ fontSize: '10px', color: warning, flexShrink: 0 }}>●</span>}
        <span style={{ fontSize: '10px', color: textMute,
          fontFamily: 'monospace', flexShrink: 0 }}>
          {cursor.line}:{cursor.col}
        </span>
        <button onClick={save}
          style={{ ...tbBtn(false), background: successBg,
            border: '1px solid rgba(74,222,128,.25)',
            color: success, fontWeight: '500',
            display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Save size={13}/> Save
        </button>
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', color: textMute,
            fontSize: '18px', cursor: 'pointer', padding: '4px 6px', flexShrink: 0 }}>
          ×
        </button>
      </div>

      {/* CodeMirror container */}
      <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}/>
    </div>
  );
}
