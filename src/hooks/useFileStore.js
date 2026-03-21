import { useState, useRef, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { callServer } from '../api.js';
import { executeAction, resolvePath } from '../utils.js';

// ── Module-level helpers for handleApprove ───────────────────────────────────
async function _backupFiles(targets, folder) {
  const backups = [];
  for (const a of targets) {
    const backup = await callServer({ type: 'read', path: resolvePath(folder, a.path) });
    if (backup.ok) { backups.push({ path: resolvePath(folder, a.path), content: backup.data }); a.original = backup.data; }
  }
  return backups;
}

function _getSyntaxCmd(ext, absPath) {
  if (['js', 'cjs', 'mjs'].includes(ext)) return `node --check "${absPath}" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
  if (ext === 'json') return `python3 -m json.tool "${absPath}" > /dev/null 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
  if (ext === 'sh')   return `bash -n "${absPath}" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
  return null;
}

async function _verifySyntaxBatch(targets, folder, setMessages) {
  for (const wr of targets) {
    const ext  = (wr.path || '').split('.').pop().toLowerCase();
    const cmd  = _getSyntaxCmd(ext, resolvePath(folder, wr.path));
    if (!cmd) continue;
    const vr   = await callServer({ type: 'exec', path: folder, command: cmd });
    const vOut = (vr.data || '').trim();
    if (!vOut) continue;
    const hasErr = vOut.includes('SYNTAX_ERR') || (vOut.toLowerCase().includes('error') && !vOut.includes('SYNTAX_OK'));
    if (hasErr) {
      const fname = (wr.path || '').split('/').pop();
      setMessages(m => [...m, { role: 'assistant', content: 'Syntax error di ' + fname + ':\n```\n' + vOut.slice(0, 300) + '\n```', actions: [] }]);
    }
  }
}

export function useFileStore() {
  // ── Multi-tab state ──
  const [openTabs, setOpenTabs]       = useState([]);   // [{path, content, dirty}]
  const [activeTabIdx, setActiveTabIdxRaw] = useState(0);

  // ── Legacy single-view state (still used for some flows) ──
  const [activeTab, setActiveTab]     = useState('chat'); // 'chat' | 'file'
  const [editMode, setEditMode]       = useState(false);
  const [splitView, setSplitView]     = useState(false);

  // ── Derived compat ──
  const selectedFile = openTabs[activeTabIdx]?.path  ?? null;
  const fileContent  = openTabs[activeTabIdx]?.content ?? null;

  // ── Lists ──
  const [recentFiles, setRecentFilesRaw] = useState([]);
  const [pinnedFiles, setPinnedFilesRaw] = useState([]);
  const [editHistory, setEditHistory]    = useState([]);

  // Ref to always read the latest openTabs in async contexts
  const openTabsRef = useRef(openTabs);
  const activeTabIdxRef = useRef(activeTabIdx);
  useEffect(() => { openTabsRef.current = openTabs; });
  useEffect(() => { activeTabIdxRef.current = activeTabIdx; });

  // ── Persisted setters ──
  function setRecentFiles(next) {
    setRecentFilesRaw(next);
    Preferences.set({ key: 'yc_recent', value: JSON.stringify(next) });
  }
  function setPinnedFiles(next) {
    setPinnedFilesRaw(next);
    Preferences.set({ key: 'yc_pinned', value: JSON.stringify(next) });
  }

  // ── Load from Preferences ──
  function loadFilePrefs({ pinned, recent }) {
    if (pinned) { try { setPinnedFilesRaw(JSON.parse(pinned)); } catch (_e) { } }
    if (recent) { try { setRecentFilesRaw(JSON.parse(recent)); } catch (_e) { } }
  }

  // ── setActiveTabIdx (also switches to file tab) ──
  function setActiveTabIdx(idx) {
    setActiveTabIdxRaw(idx);
    if (idx >= 0 && openTabsRef.current.length > 0) {
      setActiveTab('file');
    }
  }

  // ── openFile — opens in existing tab or new tab ──
  async function openFile(path) {
    // Check if already open
    const existing = openTabsRef.current.findIndex(t => t.path === path);
    if (existing >= 0) {
      setActiveTabIdx(existing);
      setActiveTab('file');
      setEditMode(false);
      return;
    }

    // Load content
    setActiveTab('file');
    setEditMode(false);
    const r = await callServer({ type: 'read', path });
    const content = r.ok ? r.data : ('Error: ' + r.data);

    setOpenTabs(prev => {
      const newTabs = [...prev, { path, content, dirty: false }];
      setActiveTabIdxRaw(newTabs.length - 1);
      return newTabs;
    });

    // Recent files
    const next = [path, ...recentFiles.filter(f => f !== path)].slice(0, 8);
    setRecentFiles(next);
  }

  // ── closeTab ──
  function closeTab(idx) {
    const tabs = openTabsRef.current;
    if (tabs.length === 0) return;

    setOpenTabs(prev => {
      const newTabs = prev.filter((_, i) => i !== idx);
      if (newTabs.length === 0) {
        setActiveTabIdxRaw(0);
        setActiveTab('chat');
      } else {
        const newActive = Math.min(activeTabIdxRef.current, newTabs.length - 1);
        setActiveTabIdxRaw(Math.max(0, newActive));
      }
      return newTabs;
    });
  }

  // ── updateTabContent — marks a tab dirty (from editor changes) ──
  function updateTabContent(idx, content) {
    setOpenTabs(prev => prev.map((t, i) =>
      i === idx ? { ...t, content, dirty: true } : t
    ));
  }

  // ── saveFile — saves current active tab to server ──
  async function saveFile(content, onMsg) {
    const tab = openTabsRef.current[activeTabIdxRef.current];
    if (!tab) return;
    setEditHistory(h => [...h.slice(-9), { path: tab.path, content: tab.content }]);
    const r = await callServer({ type: 'write', path: tab.path, content });
    if (r.ok) {
      setOpenTabs(prev => prev.map((t, i) =>
        i === activeTabIdxRef.current ? { ...t, content, dirty: false } : t
      ));
      onMsg?.('💾 Saved: ' + tab.path.split('/').pop());
    }
  }

  // ── Backward compat setters ──
  function setSelectedFile(path) {
    if (!path) {
      const idx = activeTabIdxRef.current;
      if (openTabsRef.current.length > 0) closeTab(idx);
      else setActiveTab('chat');
      return;
    }
    openFile(path);
  }

  function setFileContent(content) {
    const idx = activeTabIdxRef.current;
    if (idx >= 0 && openTabsRef.current.length > idx) {
      updateTabContent(idx, content);
    }
  }

  // ── togglePin ──
  function togglePin(path) {
    const next = pinnedFiles.includes(path)
      ? pinnedFiles.filter(f => f !== path)
      : [...pinnedFiles, path];
    setPinnedFiles(next);
  }

  // ── undoLastEdit ──
  async function undoLastEdit(onMsg) {
    const last = editHistory[editHistory.length - 1];
    if (!last) return;
    await callServer({ type: 'write', path: last.path, content: last.content });
    setEditHistory(h => h.slice(0, -1));
    onMsg?.('↩ Undo: ' + last.path.split('/').pop());
  }

  // ── readFilesParallel ──
  async function readFilesParallel(paths, folder) {
    const results = await Promise.all(
      paths.map(p => callServer({ type: 'read', path: resolvePath(folder, p) }))
    );
    return paths.reduce((acc, p, i) => ({ ...acc, [p]: results[i] }), {});
  }

  // ── handleApprove (write file batch with backup + rollback) ──
  async function handleApprove(idx, ok, targetPath, messages, setMessages, folder, hooks, runHooksV2, permissions) {
    const msg     = messages[idx];
    const targets = targetPath === '__all__'
      ? (msg.actions || []).filter(a => a.type === 'write_file' && !a.executed)
      : (msg.actions || []).filter(a => a.type === 'write_file' && !a.executed && (!targetPath || a.path === targetPath));

    if (!ok) {
      setMessages(m => m.map((x, i) => i === idx
        ? { ...x, actions: x.actions?.map(a => targets.includes(a)
            ? { ...a, executed: true, result: { ok: false, data: 'Dibatalkan.' } } : a) }
        : x));
      return;
    }

    const backups = await _backupFiles(targets, folder);
    if (backups.length) setEditHistory(h => [...h.slice(-(10 - backups.length)), ...backups]);

    const results = await Promise.all(targets.map(a => executeAction(a, folder)));
    const failed  = results.filter(r => !r.ok);

    if (failed.length > 0 && targets.length > 1) {
      await Promise.all(backups.map(b => callServer({ type: 'write', path: b.path, content: b.content })));
      setMessages(m => [...m, { role: 'assistant', content: '❌ Atomic write gagal (' + failed.length + ' file). Rollback.' }]);
      return;
    }

    results.forEach((r, i) => { targets[i].result = r; targets[i].executed = true; });
    setMessages(m => m.map((x, i) => i === idx ? { ...x } : x));
    if (targets.length > 1)
      setMessages(m => [...m, { role: 'assistant', content: '✅ ' + targets.length + ' file berhasil ditulis~', actions: [] }]);
    await runHooksV2(hooks?.postWrite || [], targets.map(a => a.path).join(','), folder);

    if (permissions?.exec) await _verifySyntaxBatch(targets, folder, setMessages);
  }

  return {
    // Multi-tab
    openTabs, setOpenTabs,
    activeTabIdx, setActiveTabIdx,
    closeTab, updateTabContent,

    // Backward compat derived
    selectedFile, setSelectedFile,
    fileContent, setFileContent,

    // Legacy view state
    activeTab, setActiveTab,
    editMode, setEditMode,
    splitView, setSplitView,

    // Lists
    recentFiles, setRecentFiles,
    pinnedFiles, setPinnedFiles,
    editHistory, setEditHistory,

    // Actions
    loadFilePrefs,
    openFile, saveFile, togglePin, undoLastEdit,
    readFilesParallel, handleApprove,
  };
}
