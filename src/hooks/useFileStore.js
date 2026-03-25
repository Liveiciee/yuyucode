import { useState, useRef, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { callServer } from '../api.js';
import { resolvePath } from '../utils.js';
import { getWriteTargets, applyWriteBatch } from './approvalHelpers.js';

export function useFileStore() {
  // ── Multi-tab state ──
  const [openTabs, setOpenTabs]       = useState([]);
  const [activeTabIdx, setActiveTabIdxRaw] = useState(0);

  // ── Legacy single-view state ──
  const [activeTab, setActiveTab]     = useState('chat');
  const [editMode, setEditMode]       = useState(false);
  const [splitView, setSplitView]     = useState(false);

  // ── Derived ──
  const selectedFile = openTabs[activeTabIdx]?.path  ?? null;
  const fileContent  = openTabs[activeTabIdx]?.content ?? null;

  // ── Lists ──
  const [recentFiles, setRecentFilesRaw] = useState([]);
  const [pinnedFiles, setPinnedFilesRaw] = useState([]);
  const [editHistory, setEditHistory]    = useState([]);

  const openTabsRef = useRef(openTabs);
  const activeTabIdxRef = useRef(activeTabIdx);
  useEffect(() => { openTabsRef.current = openTabs; }, [openTabs]);
  useEffect(() => { activeTabIdxRef.current = activeTabIdx; }, [activeTabIdx]);

  // ── Persisted setters ──
  function setRecentFiles(next) {
    setRecentFilesRaw(next);
    Preferences.set({ key: 'yc_recent', value: JSON.stringify(next) });
  }
  function setPinnedFiles(next) {
    setPinnedFilesRaw(next);
    Preferences.set({ key: 'yc_pinned', value: JSON.stringify(next) });
  }

  function loadFilePrefs({ pinned, recent }) {
    if (pinned) { try { setPinnedFilesRaw(JSON.parse(pinned)); } catch (_) {} }
    if (recent) { try { setRecentFilesRaw(JSON.parse(recent)); } catch (_) {} }
  }

  function setActiveTabIdx(idx) {
    setActiveTabIdxRaw(idx);
    if (idx >= 0 && openTabsRef.current.length > 0) setActiveTab('file');
  }

  // ── openFile ──
  async function openFile(path) {
    const existing = openTabsRef.current.findIndex(t => t.path === path);
    if (existing >= 0) {
      setActiveTabIdx(existing);
      setActiveTab('file');
      setEditMode(false);
      return;
    }

    setActiveTab('file');
    setEditMode(false);
    const r = await callServer({ type: 'read', path });
    const content = r?.ok ? r?.data : ('Error: ' + (r?.data || 'Unknown error'));

    setOpenTabs(prev => {
      const newTabs = [...prev, { path, content, dirty: false }];
      setActiveTabIdxRaw(newTabs.length - 1);
      return newTabs;
    });

    const next = [path, ...recentFiles.filter(f => f !== path)].slice(0, 8);
    setRecentFiles(next);
  }

  // ── saveFile — FIXED: handle r.ok === false and r undefined ──
  async function saveFile(content, onMsg) {
    const tab = openTabsRef.current[activeTabIdxRef.current];
    if (!tab) return;

    setEditHistory(h => [...h.slice(-9), { path: tab.path, content: tab.content }]);

    const r = await callServer({ type: 'write', path: tab.path, content });

    // FIX: Check if r exists and has ok property
    if (r && r.ok === true) {
      setOpenTabs(prev => prev.map((t, i) =>
        i === activeTabIdxRef.current ? { ...t, content, dirty: false } : t
      ));
      onMsg?.('💾 Saved: ' + tab.path.split('/').pop());
    } else {
      onMsg?.('❌ Save failed: ' + (r?.data || 'Unknown error'));
    }
  }

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

  function updateTabContent(idx, content) {
    setOpenTabs(prev => prev.map((t, i) =>
      i === idx ? { ...t, content, dirty: true } : t
    ));
  }

  function setSelectedFile(path) {
    if (!path) {
      if (openTabsRef.current.length > 0) closeTab(activeTabIdxRef.current);
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

  function togglePin(path) {
    const next = pinnedFiles.includes(path)
      ? pinnedFiles.filter(f => f !== path)
      : [...pinnedFiles, path];
    setPinnedFiles(next);
  }

  async function undoLastEdit(onMsg) {
    const last = editHistory[editHistory.length - 1];
    if (!last) return;
    await callServer({ type: 'write', path: last.path, content: last.content });
    setEditHistory(h => h.slice(0, -1));
    onMsg?.('↩ Undo: ' + last.path.split('/').pop());
  }

  async function readFilesParallel(paths, folder) {
    const results = await Promise.all(
      paths.map(p => callServer({ type: 'read', path: resolvePath(folder, p) }))
    );
    return paths.reduce((acc, p, i) => ({ ...acc, [p]: results[i] }), {});
  }

  async function handleApprove(idx, ok, targetPath, messages, setMessages, folder, hooks, _runHooksV2, permissions) {
    const msg = messages[idx];
    const targets = getWriteTargets(msg, targetPath);
    if (!ok) {
      setMessages(m => m.map((x, i) => i === idx
        ? { ...x, actions: x.actions?.map(a => targets.includes(a) ? { ...a, executed: true, result: { ok: false, data: 'Dibatalkan.' } } : a) }
        : x));
      return;
    }
    await applyWriteBatch({ targets, folder, idx, setEditHistory, setMessages, hooks, permissions });
  }

  return {
    openTabs, setOpenTabs,
    activeTabIdx, setActiveTabIdx,
    closeTab, updateTabContent,

    selectedFile, setSelectedFile,
    fileContent, setFileContent,

    activeTab, setActiveTab,
    editMode, setEditMode,
    splitView, setSplitView,

    recentFiles, setRecentFiles,
    pinnedFiles, setPinnedFiles,
    editHistory, setEditHistory,

    loadFilePrefs,
    openFile, saveFile, togglePin, undoLastEdit,
    readFilesParallel, handleApprove,
  };
}
