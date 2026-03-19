import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { callServer } from '../api.js';
import { executeAction, resolvePath } from '../utils.js';

export function useFileStore() {
  // ── File view / edit ──
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent]   = useState(null);
  const [activeTab, setActiveTab]       = useState('chat');
  const [editMode, setEditMode]         = useState(false);
  const [splitView, setSplitView]       = useState(false);

  // ── Lists ──
  const [recentFiles, setRecentFilesRaw] = useState([]);
  const [pinnedFiles, setPinnedFilesRaw] = useState([]);
  const [editHistory, setEditHistory]    = useState([]);

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

  // ── openFile ──
  async function openFile(path) {
    setSelectedFile(path);
    setActiveTab('file');
    setEditMode(false);
    const r = await callServer({ type: 'read', path });
    setFileContent(r.ok ? r.data : 'Error: ' + r.data);
    const next = [path, ...recentFiles.filter(f => f !== path)].slice(0, 8);
    setRecentFiles(next);
  }

  // ── saveFile ──
  async function saveFile(content, onMsg) {
    if (!selectedFile) return;
    setEditHistory(h => [...h.slice(-9), { path: selectedFile, content: fileContent || '' }]);
    const r = await callServer({ type: 'write', path: selectedFile, content });
    if (r.ok) {
      setFileContent(content);
      onMsg?.('💾 Saved: ' + selectedFile.split('/').pop());
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
    const msg = messages[idx];
    const targets = targetPath === '__all__'
      ? (msg.actions || []).filter(a => a.type === 'write_file' && !a.executed)
      : (msg.actions || []).filter(a => a.type === 'write_file' && !a.executed && (targetPath ? a.path === targetPath : true));

    if (!ok) {
      setMessages(m => m.map((x, i) => i === idx
        ? { ...x, actions: x.actions?.map(a => targets.includes(a) ? { ...a, executed: true, result: { ok: false, data: 'Dibatalkan.' } } : a) }
        : x));
      return;
    }

    const backups = [];
    for (const a of targets) {
      const backup = await callServer({ type: 'read', path: resolvePath(folder, a.path) });
      if (backup.ok) { backups.push({ path: resolvePath(folder, a.path), content: backup.data }); a.original = backup.data; }
    }
    if (backups.length) setEditHistory(h => [...h.slice(-(10 - backups.length)), ...backups]);

    const results = await Promise.all(targets.map(a => executeAction(a, folder)));
    const failed = results.filter(r => !r.ok);
    if (failed.length > 0 && targets.length > 1) {
      await Promise.all(backups.map(b => callServer({ type: 'write', path: b.path, content: b.content })));
      setMessages(m => [...m, { role: 'assistant', content: '❌ Atomic write gagal (' + failed.length + ' file). Rollback.' }]);
      return;
    }

    results.forEach((r, i) => { targets[i].result = r; targets[i].executed = true; });
    setMessages(m => m.map((x, i) => i === idx ? { ...x } : x));
    if (targets.length > 1) setMessages(m => [...m, { role: 'assistant', content: '✅ ' + targets.length + ' file berhasil ditulis~', actions: [] }]);
    await runHooksV2(hooks?.postWrite || [], targets.map(a => a.path).join(','), folder);

    // Syntax verify
    if (permissions?.exec) {
      for (const wr of targets) {
        const ext = (wr.path || '').split('.').pop().toLowerCase();
        let verifyCmd = null;
        const absPath = resolvePath(folder, wr.path);
        if (['js', 'cjs', 'mjs'].includes(ext)) verifyCmd = `node --check "${absPath}" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
        else if (ext === 'json') verifyCmd = `python3 -m json.tool "${absPath}" > /dev/null 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
        else if (ext === 'sh') verifyCmd = `bash -n "${absPath}" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
        if (!verifyCmd) continue;
        const vr = await callServer({ type: 'exec', path: folder, command: verifyCmd });
        const vOut = (vr.data || '').trim();
        if (!vOut) continue;
        if (vOut.includes('SYNTAX_ERR') || (vOut.toLowerCase().includes('error') && !vOut.includes('SYNTAX_OK'))) {
          const fname = (wr.path || '').split('/').pop();
          setMessages(m => [...m, { role: 'assistant', content: 'Syntax error di ' + fname + ':\n```\n' + vOut.slice(0, 300) + '\n```', actions: [] }]);
        }
      }
    }
  }

  return {
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
