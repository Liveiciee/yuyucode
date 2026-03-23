// ── ProjectManager — browse, switch, create projects ──────────────────────────
import React, { useState, useRef } from 'react';
import { FolderOpen, Plus, Trash2, ChevronRight, Clock, FolderPlus, X } from 'lucide-react';
import { callServer } from '../api.js';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0)  return d + 'h lalu';
  if (h > 0)  return h + 'j lalu';
  if (m > 0)  return m + 'm lalu';
  return 'baru saja';
}

export function ProjectManager({ T, project, onClose, onSwitchProject }) {
  const [tab, setTab]             = useState('recent');   // 'recent' | 'browse' | 'new'
  const [browsePath, setBrowsePath] = useState(project.folder?.split('/').slice(0, -1).join('/') || '/data/data/com.termux/files/home');
  const [browseItems, setBrowseItems] = useState(null);
  const [browsing, setBrowsing]   = useState(false);
  const [newPath, setNewPath]     = useState('');
  const [newName, setNewName]     = useState('');
  const [creating, setCreating]   = useState(false);
  const [createMsg, setCreateMsg] = useState('');
  const inputRef = useRef(null);

  // ── Browse ────────────────────────────────────────────────────────────────

  async function loadDir(path) {
    setBrowsing(true);
    setBrowsePath(path);
    const r = await callServer({ type: 'list', path });
    if (r.ok && Array.isArray(r.data)) {
      setBrowseItems(r.data.filter(f => f.isDir).sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      setBrowseItems([]);
    }
    setBrowsing(false);
  }

  function goUp() {
    const parent = browsePath.split('/').slice(0, -1).join('/') || '/';
    loadDir(parent);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async function handleCreate() {
    const base = newPath.trim() || '/data/data/com.termux/files/home';
    const name = newName.trim();
    if (!name) { setCreateMsg('Nama project wajib diisi'); return; }
    const fullPath = base.replace(/\/$/, '') + '/' + name;
    setCreating(true);
    setCreateMsg('Membuat folder...');
    const r = await callServer({ type: 'mkdir', path: fullPath });
    if (r.ok) {
      setCreateMsg('✅ Berhasil! Membuka project...');
      setTimeout(() => { onSwitchProject(fullPath); onClose(); }, 600);
    } else {
      setCreateMsg('❌ Gagal: ' + (r.data || 'unknown error'));
    }
    setCreating(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const tabStyle = (active) => ({
    flex: 1, padding: '8px', background: active ? T.accentBg : 'none',
    border: 'none', borderBottom: active ? '2px solid ' + T.accent : '2px solid transparent',
    color: active ? T.accent : T.textMute, fontSize: '12px', cursor: 'pointer',
    fontWeight: active ? '600' : '400',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'flex-end',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: '100%', maxHeight: '80vh', background: T.bg2,
        borderRadius: '20px 20px 0 0', border: '1px solid ' + T.border,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: T.text }}>Projects</div>
            <div style={{ fontSize: '11px', color: T.textMute, marginTop: '2px' }}>
              Aktif: <span style={{ color: T.accent, fontFamily: 'monospace' }}>{project.folder?.split('/').pop()}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMute, cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid ' + T.border, flexShrink: 0, marginTop: '12px' }}>
          <button style={tabStyle(tab === 'recent')} onClick={() => setTab('recent')}>
            <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Recent
          </button>
          <button style={tabStyle(tab === 'browse')} onClick={() => { setTab('browse'); if (!browseItems) loadDir(browsePath); }}>
            <FolderOpen size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Browse
          </button>
          <button style={tabStyle(tab === 'new')} onClick={() => setTab('new')}>
            <Plus size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />New
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>

          {/* ── Recent ── */}
          {tab === 'recent' && (
            <>
              {project.recentProjects.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: T.textMute, fontSize: '13px' }}>
                  Belum ada project yang pernah dibuka.<br />
                  <span style={{ fontSize: '11px', opacity: .6 }}>Buka atau buat project baru di tab Browse / New.</span>
                </div>
              ) : project.recentProjects.map(p => (
                <div key={p.path} style={{
                  display: 'flex', alignItems: 'center', padding: '10px 16px',
                  borderBottom: '1px solid ' + T.border + '44', gap: '12px',
                  background: p.path === project.folder ? T.accentBg : 'transparent',
                  cursor: 'pointer',
                }} onClick={() => { onSwitchProject(p.path); onClose(); }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: p.path === project.folder ? T.accentBg : T.bg3,
                    border: '1px solid ' + (p.path === project.folder ? T.accentBorder : T.border),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <FolderOpen size={16} color={p.path === project.folder ? T.accent : T.textMute} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: p.path === project.folder ? T.accent : T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                      {p.path === project.folder && <span style={{ fontSize: '10px', color: T.accent, marginLeft: '6px', opacity: .7 }}>• aktif</span>}
                    </div>
                    <div style={{ fontSize: '10px', color: T.textMute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', marginTop: '2px' }}>
                      {p.path}
                    </div>
                    <div style={{ fontSize: '10px', color: T.textMute, marginTop: '2px', opacity: .6 }}>
                      {timeAgo(p.lastOpened)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); project.removeRecentProject(p.path); }}
                      style={{ background: 'none', border: 'none', color: T.textMute, cursor: 'pointer', padding: '4px', opacity: .5 }}>
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={14} color={T.textMute} style={{ opacity: .4 }} />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── Browse ── */}
          {tab === 'browse' && (
            <div style={{ padding: '8px 0' }}>
              {/* Path bar */}
              <div style={{ padding: '0 16px 8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button onClick={goUp} style={{ background: T.bg3, border: '1px solid ' + T.border, borderRadius: '6px', padding: '4px 8px', color: T.textSec, fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>
                  ↑ Up
                </button>
                <div style={{ flex: 1, fontSize: '10px', color: T.textMute, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {browsePath}
                </div>
                <button onClick={() => { onSwitchProject(browsePath); onClose(); }}
                  style={{ background: T.accentBg, border: '1px solid ' + T.accentBorder, borderRadius: '6px', padding: '4px 10px', color: T.accent, fontSize: '11px', cursor: 'pointer', flexShrink: 0, fontWeight: '600' }}>
                  Buka ini
                </button>
              </div>

              {browsing && <div style={{ padding: '16px', textAlign: 'center', color: T.textMute, fontSize: '12px' }}>Loading...</div>}

              {!browsing && browseItems && browseItems.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: T.textMute, fontSize: '12px' }}>Folder kosong</div>
              )}

              {!browsing && browseItems && browseItems.map(item => (
                <div key={item.name} onClick={() => loadDir(browsePath.replace(/\/$/, '') + '/' + item.name)}
                  style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', gap: '10px', borderBottom: '1px solid ' + T.border + '22' }}>
                  <FolderOpen size={15} color={T.textMute} />
                  <span style={{ flex: 1, fontSize: '13px', color: T.text }}>{item.name}</span>
                  <ChevronRight size={13} color={T.textMute} style={{ opacity: .4 }} />
                </div>
              ))}
            </div>
          )}

          {/* ── New ── */}
          {tab === 'new' && (
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: T.textMute, marginBottom: '12px' }}>
                Buat folder project baru
              </div>

              <label style={{ fontSize: '11px', color: T.textSec, display: 'block', marginBottom: '4px' }}>Nama project</label>
              <input ref={inputRef} value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="myproject"
                style={{ width: '100%', background: T.bg3, border: '1px solid ' + T.border, borderRadius: '8px', padding: '8px 10px', color: T.text, fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px', fontFamily: 'monospace' }} />

              <label style={{ fontSize: '11px', color: T.textSec, display: 'block', marginBottom: '4px' }}>Lokasi (opsional)</label>
              <input value={newPath} onChange={e => setNewPath(e.target.value)}
                placeholder="/data/data/com.termux/files/home"
                style={{ width: '100%', background: T.bg3, border: '1px solid ' + T.border, borderRadius: '8px', padding: '8px 10px', color: T.text, fontSize: '11px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px', fontFamily: 'monospace' }} />

              {createMsg && (
                <div style={{ fontSize: '12px', color: createMsg.startsWith('✅') ? T.success : createMsg.startsWith('❌') ? T.error : T.textMute, marginBottom: '12px' }}>
                  {createMsg}
                </div>
              )}

              <button onClick={handleCreate} disabled={creating || !newName.trim()}
                style={{ width: '100%', background: T.accentBg, border: '1px solid ' + T.accentBorder, borderRadius: '10px', padding: '12px', color: T.accent, fontSize: '13px', cursor: creating ? 'wait' : 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: !newName.trim() ? .5 : 1 }}>
                <FolderPlus size={15} />
                {creating ? 'Membuat...' : 'Buat Project'}
              </button>

              <div style={{ marginTop: '20px', padding: '12px', background: T.bg3, borderRadius: '8px', fontSize: '11px', color: T.textMute, lineHeight: '1.6' }}>
                💡 <strong style={{ color: T.textSec }}>Scaffold</strong> — Setelah buka project baru, ketik <code style={{ color: T.accent }}>/scaffold react</code> atau <code style={{ color: T.accent }}>/scaffold node</code> untuk generate struktur awal.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
