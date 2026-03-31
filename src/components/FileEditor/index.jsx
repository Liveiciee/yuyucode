// src/components/FileEditor/index.jsx
import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef, lazy, Suspense } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState, Compartment, StateEffect } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import * as commandsModule from '@codemirror/commands';
const { keymap } = commandsModule;
import { foldAll, unfoldAll } from '@codemirror/language';
import { Save } from 'lucide-react';
import { getLang, buildTheme, isTsLang } from './editorUtils.js';
import { makeBlameGutter, fetchBlame } from './blame.js';
import { buildOptionalExtensions } from './optionalExtensions.js';
import { getTsExtensions } from './tsExtensions.js';
// Import fungsi WebSocket terpusat
import { getWebSocket } from '../../api/websocket.js';

const Minimap = lazy(() => import("./minimap.jsx"));
const Breadcrumb = lazy(() => import("./breadcrumb.jsx"));

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
  // Kita tidak lagi membuat instance baru, hanya menyimpan referensi listener jika perlu
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

  // Mount editor
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
        keymap.of([]),
        themeComp.current.of(buildTheme(T)),
        langComp.current.of(getLang(tab?.path)),
        optsComp.current.of(buildOptionalExtensions(editorConfig, tab?.path, folder, collabWsRef)),
        blameComp.current.of([]),
        updateListener,
        EditorView.lineWrapping,
      ],
    });
    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
  }, []); // eslint-disable-line

  // Theme sync
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({ effects: themeComp.current.reconfigure(buildTheme(T)) });
  }, [T]);

  // Language sync
  useEffect(() => {
    if (!viewRef.current || !tab?.path) return;
    viewRef.current.dispatch({ effects: langComp.current.reconfigure(getLang(tab.path)) });
  }, [tab?.path]);

  // Optional extensions sync
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: optsComp.current.reconfigure(
        buildOptionalExtensions(editorConfig, tab?.path, folder, collabWsRef)
      ),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorConfig?.vimMode, editorConfig?.emmet, editorConfig?.ghostText, editorConfig?.lint, editorConfig?.multiCursor, editorConfig?.collab]);

  // Blame toggle
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

  // Blame gutter update
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: blameComp.current.reconfigure(blameData ? makeBlameGutter(blameData) : []),
    });
  }, [blameData]);

  // TS LSP
  useEffect(() => {
    if (!editorConfig?.tsLsp || !tab?.path || !isTsLang(tab.path)) { setTimeout(() => setTsReady(false), 0); return; }
    let cancelled = false;
    getTsExtensions().then(mod => {
      if (cancelled || !mod) return;
      setTsReady(true);
    });
    return () => { cancelled = true; };
  }, [editorConfig?.tsLsp, tab?.path]);

  // Collab WS - MODIFIED: Menggunakan shared WebSocket
  useEffect(() => {
    if (!editorConfig?.collab || !editorConfig?.collabRoom) {
      // Jika fitur collab mati, kita tidak perlu melakukan apa-apa khusus pada shared WS
      // karena listener spesifik akan di-cleanup di return function.
      collabWsRef.current = null;
      return;
    }

    // Ambil instance WebSocket global
    const ws = getWebSocket();
    
    if (!ws) {
      console.warn('FileEditor: Shared WebSocket not initialized yet.');
      return;
    }

    collabWsRef.current = ws;

    // Handler pesan khusus untuk kolaborasi di file ini
    const handleMessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        // Filter hanya pesan collab_updates untuk room/file ini
        if (msg.type !== 'collab_updates' || msg.room !== editorConfig.collabRoom || !viewRef.current) return;
        
        // TODO: Implement receiveUpdates logic di sini
        // Contoh: applyChanges(viewRef.current, msg.changes);
        console.log('Collab update received:', msg);
      } catch (_) {}
    };

    // Daftarkan listener
    ws.addEventListener('message', handleMessage);

    // Kirim join event saat mount
    ws.send(JSON.stringify({ 
      type: 'collab_join', 
      room: editorConfig.collabRoom, 
      file: tab?.path 
    }));

    // Cleanup: Hapus listener saat unmount atau ganti file
    return () => {
      ws.removeEventListener('message', handleMessage);
      // Opsional: Kirim leave event
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
          type: 'collab_leave', 
          room: editorConfig.collabRoom, 
          file: tab?.path 
        }));
      }
      collabWsRef.current = null;
    };
  }, [editorConfig?.collab, editorConfig?.collabRoom, tab?.path]);

  // Tab swap
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
          keymap.of([]),
          themeComp.current.of(buildTheme(T)),
          langComp.current.of(getLang(tab.path)),
          optsComp.current.of(buildOptionalExtensions(editorConfig, tab.path, folder, collabWsRef)),
          blameComp.current.of(blameData ? makeBlameGutter(blameData) : []),
          updateListener,
          EditorView.lineWrapping,
        ],
      });
      view.setState(newState);
    }
    prevPathRef.current = tab.path;
    setTimeout(() => setSaved(true), 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab?.path]);

  // External content sync
  useEffect(() => {
    if (!viewRef.current || !tab?.content) return;
    if (prevPathRef.current !== tab.path) return;
    const current = viewRef.current.state.doc.toString();
    if (current !== tab.content) {
      viewRef.current.dispatch({ changes: { from: 0, to: current.length, insert: tab.content } });
      setTimeout(() => setSaved(true), 0);
    }
  }, [tab?.content, tab?.path]);

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

        {editorConfig?.vimMode   && <span style={{ fontSize: '9px', color: T_accent,   fontFamily: 'monospace', flexShrink: 0 }}>VIM</span>}
        {editorConfig?.ghostText && <span style={{ fontSize: '9px', color: T_success,  fontFamily: 'monospace', flexShrink: 0 }}>AI</span>}
        {editorConfig?.lint      && <span style={{ fontSize: '9px', color: T_warning,  fontFamily: 'monospace', flexShrink: 0 }}>LINT</span>}
        {tsReady                 && <span style={{ fontSize: '9px', color: '#38bdf8',  fontFamily: 'monospace', flexShrink: 0 }}>TS</span>}
        {editorConfig?.collab    && <span style={{ fontSize: '9px', color: '#f59e0b',  fontFamily: 'monospace', flexShrink: 0 }}>LIVE</span>}
        {blameLoading            && <span style={{ fontSize: '9px', color: T_textMute, fontFamily: 'monospace', flexShrink: 0 }}>blame···</span>}

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

      <Suspense fallback={<div style={{ height: 22 }} />}>
        <Breadcrumb viewRef={viewRef} T={T} />
      </Suspense>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <div ref={containerRef} style={{ flex: 1, overflow: 'hidden' }}/>
        {editorConfig?.minimap && (
          <Suspense fallback={null}>
            <Minimap viewRef={viewRef} T={T} />
          </Suspense>
        )}
      </div>
    </div>
  );
});
