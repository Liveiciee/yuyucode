import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Preferences } from "@capacitor/preferences";
import { callServer } from '../api.js';
import { THEMES, MODELS } from '../constants.js';

// ─── BOTTOM SHEET (reusable mobile-first wrapper) ─────────────────────────────
export function BottomSheet({ children, onClose, height='88%', noPad:_noPad=false }) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(null);

  function onTouchStart(e) { startY.current = e.touches[0].clientY; setDragging(true); }
  function onTouchMove(e) {
    if (startY.current === null) return;
    const delta = Math.max(0, e.touches[0].clientY - startY.current);
    setDragY(delta);
  }
  function onTouchEnd() {
    if (dragY > 110) { onClose(); } else { setDragY(0); }
    setDragging(false); startY.current = null;
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:99,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.55)'}} />
      <div style={{
        position:'relative', background:'#111113',
        borderRadius:'18px 18px 0 0',
        maxHeight:height, display:'flex', flexDirection:'column',
        transform:`translateY(${dragY}px)`,
        transition: dragging ? 'none' : 'transform .3s cubic-bezier(.32,.72,0,1)',
        boxShadow:'0 -8px 40px rgba(0,0,0,.6)',
      }}>
        {/* drag handle zone */}
        <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          style={{padding:'10px 0 4px',display:'flex',justifyContent:'center',flexShrink:0,touchAction:'none',cursor:'grab'}}>
          <div style={{width:'40px',height:'4px',borderRadius:'2px',background:'rgba(255,255,255,.18)'}} />
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',paddingBottom:'env(safe-area-inset-bottom,8px)'}}>
          {children}
        </div>
      </div>
    </div>
  );
}


export function GitDiffPanel({ folder, onClose }) {
  const [diff, setDiff] = useState('');
  const [loading, setLoading] = useState(true);
  const [staged, setStaged] = useState(false);

  async function load(s) {
    setLoading(true);
    const cmd = s ? 'git diff --cached' : 'git diff';
    const r = await callServer({ type:'exec', path:folder, command:cmd });
    setDiff(r.data || '(tidak ada perubahan)');
    setLoading(false);
  }

  useEffect(() => { load(false); }, []);

  function renderDiff(text) {
    return text.split('\n').map((line, i) => {
      let color = 'rgba(255,255,255,.5)';
      let bg = 'transparent';
      if (line.startsWith('+++') || line.startsWith('---')) color = 'rgba(255,255,255,.3)';
      else if (line.startsWith('+')) { color = '#4ade80'; bg = 'rgba(74,222,128,.04)'; }
      else if (line.startsWith('-')) { color = '#f87171'; bg = 'rgba(248,113,113,.04)'; }
      else if (line.startsWith('@@')) { color = '#a78bfa'; bg = 'rgba(124,58,237,.06)'; }
      else if (line.startsWith('diff ')) { color = '#60a5fa'; bg = 'rgba(96,165,250,.04)'; }
      return <div key={i} style={{ color, background:bg, fontFamily:'monospace', fontSize:'11px', lineHeight:'1.6', padding:'0 12px', whiteSpace:'pre-wrap', wordBreak:'break-all' }}>{line||' '}</div>;
    });
  }

  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,.02)',flexShrink:0}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:'#f0f0f0',flex:1}}>◐ Git Diff</span>
        <button onClick={()=>{setStaged(false);load(false);}} style={{background:!staged?'rgba(255,255,255,.1)':'none',border:'1px solid rgba(255,255,255,.1)',borderRadius:'5px',padding:'2px 8px',color:!staged?'#f0f0f0':'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer'}}>unstaged</button>
        <button onClick={()=>{setStaged(true);load(true);}} style={{background:staged?'rgba(255,255,255,.1)':'none',border:'1px solid rgba(255,255,255,.1)',borderRadius:'5px',padding:'2px 8px',color:staged?'#f0f0f0':'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer'}}>staged</button>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'8px 0'}}>
        {loading ? <div style={{padding:'16px',color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Loading···</div> : renderDiff(diff)}
      </div>
  </BottomSheet>
  );
}

// ─── FILE HISTORY PANEL ───────────────────────────────────────────────────────
export function FileHistoryPanel({ folder, filePath, onClose }) {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(null);

  useEffect(() => {
    const rel = filePath.replace(folder+'/', '');
    callServer({type:'exec', path:folder, command:`git log --oneline -20 -- "${rel}"`}).then(r => {
      if (r.ok && r.data) {
        const lines = r.data.trim().split('\n').filter(Boolean).map(l => {
          const [hash, ...rest] = l.split(' ');
          return { hash, msg: rest.join(' ') };
        });
        setCommits(lines);
      }
      setLoading(false);
    });
  }, [filePath]);

  async function preview(hash) {
    const rel = filePath.replace(folder+'/', '');
    const r = await callServer({type:'exec', path:folder, command:`git show ${hash}:"${rel}" 2>/dev/null`});
    if (r.ok) setPreviewing({ hash, content: r.data });
  }

  async function restore(hash) {
    const rel = filePath.replace(folder+'/', '');
    await callServer({type:'exec', path:folder, command:`git checkout ${hash} -- "${rel}"`});
    onClose();
  }

  return (
    <BottomSheet onClose={onClose}>
      <div style={{display:'flex',flexDirection:'row',flex:1,overflow:'hidden'}}>
      <div style={{width:'200px',borderRight:'1px solid rgba(255,255,255,.08)',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center'}}>
          <span style={{fontSize:'12px',fontWeight:'600',color:'#f0f0f0',flex:1}}>📜 File History</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'14px',cursor:'pointer'}}>×</button>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {loading&&<div style={{padding:'8px',color:'rgba(255,255,255,.3)',fontSize:'11px'}}>Loading···</div>}
          {commits.map(c=>(
            <div key={c.hash} onClick={()=>preview(c.hash)}
              style={{padding:'7px 10px',borderBottom:'1px solid rgba(255,255,255,.04)',cursor:'pointer',background:previewing?.hash===c.hash?'rgba(124,58,237,.15)':'transparent'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
              onMouseLeave={e=>e.currentTarget.style.background=previewing?.hash===c.hash?'rgba(124,58,237,.15)':'transparent'}>
              <div style={{fontSize:'10px',color:'#a78bfa',fontFamily:'monospace'}}>{c.hash}</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.6)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.msg}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {previewing ? (
          <>
            <div style={{padding:'6px 12px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',gap:'8px',alignItems:'center',flexShrink:0}}>
              <span style={{fontSize:'11px',color:'rgba(255,255,255,.4)',fontFamily:'monospace',flex:1}}>{previewing.hash}</span>
              <button onClick={()=>restore(previewing.hash)} style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.2)',borderRadius:'5px',padding:'2px 8px',color:'#f87171',fontSize:'10px',cursor:'pointer'}}>⏪ Restore</button>
            </div>
            <div style={{flex:1,overflow:'auto',display:'flex',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.6'}}>
              <div style={{padding:'8px 6px',color:'rgba(255,255,255,.2)',textAlign:'right',userSelect:'none',borderRight:'1px solid rgba(255,255,255,.05)',minWidth:'32px',flexShrink:0}}>
                {(previewing.content||'').split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
              </div>
              <pre style={{margin:0,padding:'8px 12px',whiteSpace:'pre-wrap',wordBreak:'break-word',color:'rgba(255,255,255,.7)',flex:1}}>{previewing.content}</pre>
            </div>
          </>
        ) : (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,.2)',fontSize:'12px'}}>Pilih commit untuk preview</div>
        )}
      </div>
      </div>
  </BottomSheet>
  );
}

// ─── CUSTOM ACTIONS PANEL ─────────────────────────────────────────────────────
export function CustomActionsPanel({ folder:_folder, onRun, onClose }) {
  const [actions, setActions] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newCmd, setNewCmd] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Preferences.get({key:'yc_custom_actions'}).then(r => {
      if (r.value) try { setActions(JSON.parse(r.value)); } catch (_e) { }
    });
  }, []);

  function save(list) {
    setActions(list);
    Preferences.set({key:'yc_custom_actions', value:JSON.stringify(list)});
  }

  function add() {
    if (!newLabel.trim() || !newCmd.trim()) return;
    save([...actions, {id:Date.now(), label:newLabel.trim(), cmd:newCmd.trim()}]);
    setNewLabel(''); setNewCmd(''); setAdding(false);
  }

  return (
    <BottomSheet onClose={onClose}><div style={{padding:'0 16px 8px',display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
        <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>⚡ Custom Actions</span>
        <button onClick={()=>setAdding(!adding)} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'10px',cursor:'pointer',marginRight:'8px'}}>+ New</button>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      {adding&&(
        <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'10px',padding:'10px',background:'rgba(255,255,255,.03)',borderRadius:'8px'}}>
          <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Label (e.g. Deploy)"
            style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'5px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none'}}/>
          <input value={newCmd} onChange={e=>setNewCmd(e.target.value)} placeholder="Command (e.g. npm run deploy)"
            style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'5px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <button onClick={add} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'6px',padding:'5px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}>Simpan</button>
        </div>
      )}
      <div style={{flex:1,overflowY:'auto'}}>
        {actions.length===0&&<div style={{color:'rgba(255,255,255,.2)',fontSize:'12px'}}>Belum ada custom action. Tambah shortcut command favoritmu~</div>}
        {actions.map(a=>(
          <div key={a.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',marginBottom:'4px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'7px'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,.8)',fontWeight:'500'}}>{a.label}</div>
              <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)',fontFamily:'monospace'}}>{a.cmd}</div>
            </div>
            <button onClick={()=>{onRun(a.cmd);onClose();}} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'5px',padding:'2px 8px',color:'#a78bfa',fontSize:'10px',cursor:'pointer'}}>▶ Run</button>
            <button onClick={()=>save(actions.filter(x=>x.id!==a.id))} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer'}}>×</button>
          </div>
        ))}
      </div>
    </div>
  </BottomSheet>
  );
}

// ─── SHORTCUTS PANEL ──────────────────────────────────────────────────────────
export function ShortcutsPanel({ onClose }) {
  const shortcuts = [
    ['Ctrl+S', 'Save file (di editor)'],
    ['Tab', 'Indent 2 spasi (di editor)'],
    ['↑↓ (input kosong)', 'History command'],
    ['Enter', 'Kirim pesan'],
    ['Shift+Enter', 'Newline di input'],
    ['☰', 'Toggle sidebar'],
    ['⌨', 'Toggle terminal'],
    ['🔍', 'Search across files'],
    ['+ Context', 'Tambah file ke context'],
    ['📜 log', 'Git log file ini'],
    ['Tanya Yuyu', 'Tanya tentang file ini'],
  ];
  return (
    <BottomSheet onClose={onClose}><div style={{padding:'0 16px 8px',display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
        <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>⌨ Keyboard Shortcuts</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      {shortcuts.map(([key,desc],i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
          <code style={{background:'rgba(255,255,255,.08)',padding:'2px 8px',borderRadius:'4px',fontSize:'12px',color:'#a78bfa',fontFamily:'monospace',flexShrink:0,minWidth:'120px'}}>{key}</code>
          <span style={{fontSize:'12px',color:'rgba(255,255,255,.55)'}}>{desc}</span>
        </div>
      ))}
    </div>
  </BottomSheet>
  );
}

// ─── GIT BLAME PANEL ──────────────────────────────────────────────────────────
export function GitBlamePanel({ folder, filePath, onClose }) {
  const [blame, setBlame] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rel = filePath.replace(folder+'/', '');
    callServer({type:'exec', path:folder, command:`git blame --line-porcelain "${rel}" 2>/dev/null | grep -E "^(author |author-time |summary )" | paste - - - | head -200`}).then(r => {
      if (!r.ok || !r.data) { setLoading(false); return; }
      const lines = r.data.trim().split('\n').map(line => {
        const parts = line.split('\t');
        const author = (parts[0]||'').replace('author ','');
        const time = new Date(parseInt((parts[1]||'').replace('author-time ',''))*1000).toLocaleDateString('id');
        const summary = (parts[2]||'').replace('summary ','').slice(0,30);
        return { author, time, summary };
      });
      setBlame(lines);
      setLoading(false);
    });
  }, [filePath]);

  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',background:'rgba(255,255,255,.02)',flexShrink:0}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:'#f0f0f0',flex:1}}>👁 Git Blame — {filePath.split('/').pop()}</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      <div style={{flex:1,overflowY:'auto',fontFamily:'monospace',fontSize:'11px'}}>
        {loading && <div style={{padding:'16px',color:'rgba(255,255,255,.3)'}}>Loading···</div>}
        {blame.map((b,i) => (
          <div key={i} style={{display:'flex',gap:'8px',padding:'2px 12px',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <span style={{color:'rgba(99,102,241,.7)',minWidth:'70px',flexShrink:0}}>{b.time}</span>
            <span style={{color:'rgba(74,222,128,.6)',minWidth:'80px',flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.author}</span>
            <span style={{color:'rgba(255,255,255,.35)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.summary}</span>
          </div>
        ))}
      </div>
  </BottomSheet>
  );
}

// ─── SNIPPET LIBRARY ──────────────────────────────────────────────────────────
export function SnippetLibrary({ onInsert, onClose }) {
  const [snippets, setSnippets] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Preferences.get({key:'yc_snippets'}).then(r => {
      if (r.value) try { setSnippets(JSON.parse(r.value)); } catch (_e) { }
    });
  }, []);

  function save(list) {
    setSnippets(list);
    Preferences.set({key:'yc_snippets', value:JSON.stringify(list)});
  }

  function addSnippet() {
    if (!newTitle.trim() || !newCode.trim()) return;
    save([...snippets, {id:Date.now(), title:newTitle.trim(), code:newCode.trim()}]);
    setNewTitle(''); setNewCode(''); setAdding(false);
  }

  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,.02)',flexShrink:0}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:'#f0f0f0',flex:1}}>✦ Snippet Library</span>
        <button onClick={()=>setAdding(!adding)} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}>+ New</button>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      {adding && (
        <div style={{padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',flexDirection:'column',gap:'6px',flexShrink:0}}>
          <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Snippet title..."
            style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'5px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none'}}/>
          <textarea value={newCode} onChange={e=>setNewCode(e.target.value)} placeholder="Code..." rows={4}
            style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'5px 10px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace',resize:'none'}}/>
          <button onClick={addSnippet} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'6px',padding:'5px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}>Simpan</button>
        </div>
      )}
      <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
        {snippets.length===0 && <div style={{color:'rgba(255,255,255,.2)',fontSize:'12px',padding:'8px'}}>Belum ada snippet~</div>}
        {snippets.map(s => (
          <div key={s.id} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px',padding:'8px 10px',marginBottom:'6px'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'4px'}}>
              <span style={{fontSize:'12px',color:'rgba(255,255,255,.7)',fontWeight:'500',flex:1}}>{s.title}</span>
              <button onClick={()=>onInsert(s.code)} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'4px',padding:'1px 7px',color:'#a78bfa',fontSize:'10px',cursor:'pointer',marginRight:'4px'}}>insert</button>
              <button onClick={()=>save(snippets.filter(x=>x.id!==s.id))} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer'}}>×</button>
            </div>
            <pre style={{margin:0,fontSize:'10px',color:'rgba(255,255,255,.4)',fontFamily:'monospace',whiteSpace:'pre-wrap',wordBreak:'break-all',maxHeight:'60px',overflow:'hidden'}}>{s.code}</pre>
          </div>
        ))}
      </div>
  </BottomSheet>
  );
}

// ─── THEME BUILDER ────────────────────────────────────────────────────────────
export function ThemeBuilder({ current, onSave, onClose }) {
  const [t, setT] = useState({...current});
  const fields = [
    {key:'bg', label:'Background'},
    {key:'bg2', label:'Surface'},
    {key:'text', label:'Text'},
    {key:'accent', label:'Accent'},
    {key:'border', label:'Border'},
  ];
  return (
    <BottomSheet onClose={onClose}><div style={{padding:'0 16px 8px',display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
        <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🎨 Theme Builder</span>
        <button onClick={()=>onSave(t)} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 10px',color:'#4ade80',fontSize:'11px',cursor:'pointer',marginRight:'8px'}}>Simpan</button>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        {fields.map(f=>(
          <div key={f.key} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
            <span style={{fontSize:'12px',color:'rgba(255,255,255,.6)',width:'70px',flexShrink:0}}>{f.label}</span>
            <input type="color" value={t[f.key]?.startsWith('#')?t[f.key]:'#1a1a2e'}
              onChange={e=>setT(prev=>({...prev,[f.key]:e.target.value}))}
              style={{width:'36px',height:'28px',border:'none',borderRadius:'4px',cursor:'pointer',padding:0,background:'none'}}/>
            <input value={t[f.key]||''} onChange={e=>setT(prev=>({...prev,[f.key]:e.target.value}))}
              style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'4px 8px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace'}}/>
          </div>
        ))}
        <div style={{marginTop:'16px',padding:'12px',borderRadius:'8px',background:t.bg,border:'1px solid '+(t.border||'rgba(255,255,255,.1)')}}>
          <div style={{fontSize:'12px',color:t.text,marginBottom:'4px',fontWeight:'600'}}>Preview</div>
          <div style={{fontSize:'11px',color:t.text,opacity:.6}}>Ini tampilan dengan theme-mu~</div>
          <div style={{display:'inline-block',background:t.accent,borderRadius:'4px',padding:'2px 8px',fontSize:'10px',color:'white',marginTop:'6px'}}>Button</div>
        </div>
      </div>
    </div>
  </BottomSheet>
  );
}

// ─── COMMAND PALETTE ──────────────────────────────────────────────────────────
export function CommandPalette({ onClose, onRun:_onRun, folder:_folder, memories, checkpoints, model, models,
  onModelChange, onNewChat, theme, onThemeChange, showSidebar, onToggleSidebar,
  onShowMemory, onShowCheckpoints, onShowMCP, onShowGitHub, onShowDeploy,
  onShowDiff, onShowSearch, onShowSnippets, onShowCustomActions,
  onShowSessions, onShowPermissions, onShowPlugins, onShowConfig,
  runTests, generateCommitMsg, exportChat, compactContext }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(()=>{ setTimeout(()=>inputRef.current?.focus(),50); }, []);

  const sections = [
    { label: 'Chat', items: [
      { icon:'💬', label:'New chat', sub:'Mulai sesi baru', action:()=>{ onNewChat(); onClose(); } },
      { icon:'📤', label:'Export chat', sub:'Simpan ke .md', action:()=>{ exportChat(); onClose(); } },
      { icon:'📦', label:'Compact context', sub:'Kompres history', action:()=>{ compactContext(); onClose(); } },
    ]},
    { label: 'Git', items: [
      { icon:'◐', label:'Git diff', sub:'Lihat perubahan', action:()=>{ onShowDiff(); onClose(); } },
      { icon:'✦', label:'Generate commit', sub:'AI-powered commit msg', action:()=>{ generateCommitMsg(); onClose(); } },
      { icon:'▶', label:'Run tests', sub:'npm test + lint', action:()=>{ runTests(); onClose(); } },
    ]},
    { label: 'Tools', items: [
      { icon:'🔌', label:'MCP Tools', sub:'Model Context Protocol', action:()=>{ onShowMCP(); onClose(); } },
      { icon:'⑂', label:'GitHub', sub:'Issues & PRs', action:()=>{ onShowGitHub(); onClose(); } },
      { icon:'🚀', label:'Deploy', sub:'Vercel / Netlify / Railway', action:()=>{ onShowDeploy(); onClose(); } },
      { icon:'💾', label:'Sessions', sub:'Sesi tersimpan', action:()=>{ onShowSessions&&onShowSessions(); onClose(); } },
      { icon:'🔐', label:'Permissions', sub:'Kelola tool permissions', action:()=>{ onShowPermissions&&onShowPermissions(); onClose(); } },
      { icon:'🔌', label:'Plugins', sub:'Plugin marketplace', action:()=>{ onShowPlugins&&onShowPlugins(); onClose(); } },
      { icon:'⚙️', label:'Config', sub:'Settings interaktif', action:()=>{ onShowConfig&&onShowConfig(); onClose(); } },
      { icon:'✂', label:'Snippets', sub:'Code snippet library', action:()=>{ onShowSnippets(); onClose(); } },
      { icon:'⚡', label:'Custom actions', sub:'Shortcut commands', action:()=>{ onShowCustomActions(); onClose(); } },
    ]},
    { label: 'Memory', items: [
      { icon:'🧠', label:`Memories (${memories.length})`, sub:'Auto-learned patterns', action:()=>{ onShowMemory(); onClose(); } },
      { icon:'📍', label:`Checkpoints (${checkpoints.length})`, sub:'Session snapshots', action:()=>{ onShowCheckpoints(); onClose(); } },
    ]},
    { label: 'View', items: [
      { icon:'🔍', label:'Search files', sub:'Grep across project', action:()=>{ onShowSearch(); onClose(); } },
      { icon:'☰', label:'Toggle sidebar', sub: showSidebar?'Sembunyikan':'Tampilkan', action:()=>{ onToggleSidebar(); onClose(); } },
      { icon:'🎨', label:'Theme: '+theme, sub:'dark / darker / midnight', action:()=>{ const themes=['dark','darker','midnight']; const i=themes.indexOf(theme); onThemeChange(themes[(i+1)%3]); onClose(); } },
    ]},
    { label: 'AI Model', items: models.map(m=>({
      icon: model===m.id ? '●' : '○',
      label: m.label,
      sub: m.provider||'cerebras',
      action:()=>{ onModelChange(m.id); onClose(); }
    }))}
  ];

  const allItems = sections.flatMap(s=>s.items.map(i=>({...i,_section:s.label})));
  const filtered = q ? allItems.filter(i=>
    i.label.toLowerCase().includes(q.toLowerCase()) ||
    i.sub.toLowerCase().includes(q.toLowerCase())
  ) : null;

  const display = filtered ? [{label:'Results', items:filtered}] : sections;

  return (
    <BottomSheet onClose={onClose} height='95%'>
      <div style={{width:'100%',display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          <span style={{fontSize:'13px',color:'rgba(255,255,255,.3)'}}>⌘</span>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Escape') onClose(); }}
            placeholder="Cari action atau ketik command..."
            style={{flex:1,background:'none',border:'none',outline:'none',color:'#f0f0f0',fontSize:'13px',fontFamily:'inherit'}}/>
          {q && <button onClick={()=>setQ('')} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',cursor:'pointer',fontSize:'12px'}}>✕</button>}
        </div>
        <div style={{maxHeight:'60vh',overflowY:'auto',padding:'6px'}}>
          {display.map(section=>(
            <div key={section.label}>
              {!q && <div style={{padding:'6px 10px 3px',fontSize:'9px',letterSpacing:'.08em',color:'rgba(255,255,255,.25)',textTransform:'uppercase',fontWeight:'600'}}>{section.label}</div>}
              {section.items.map((item,i)=>(
                <div key={i} onClick={item.action}
                  style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',borderRadius:'7px',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{fontSize:'14px',width:'20px',textAlign:'center',flexShrink:0}}>{item.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'12px',color:'#e8e8e8',fontWeight:'500'}}>{item.label}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,.35)',marginTop:'1px'}}>{item.sub}</div>
                  </div>
                  {item._section&&q&&<span style={{fontSize:'9px',color:'rgba(255,255,255,.2)',flexShrink:0}}>{item._section}</span>}
                </div>
              ))}
            </div>
          ))}
          {filtered&&filtered.length===0&&<div style={{padding:'16px',textAlign:'center',color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Tidak ada hasil untuk "{q}"</div>}
        </div>
        <div style={{padding:'6px 14px',borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',gap:'12px'}}>
          <span style={{fontSize:'10px',color:'rgba(255,255,255,.2)'}}>↵ pilih</span>
          <span style={{fontSize:'10px',color:'rgba(255,255,255,.2)'}}>esc tutup</span>
          <span style={{fontSize:'10px',color:'rgba(255,255,255,.2)'}}>/ untuk slash commands</span>
        </div>
      </div>
  </BottomSheet>
  );
}

// ─── DEP GRAPH PANEL (d3 force layout) ───────────────────────────────────────
export function DepGraphPanel({ depGraph, onClose }) {
  const containerRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (!depGraph || !containerRef.current) return;
    const el = containerRef.current;
    const W = el.clientWidth || 340;
    const H = el.clientHeight || 420;

    d3.select(el).selectAll('*').remove();

    // Support both new {nodes, edges} format and legacy {file, imports} format
    let nodes, links;
    if (depGraph.nodes && depGraph.edges) {
      nodes = depGraph.nodes.map(n => ({ ...n }));
      links = depGraph.edges.map(e => ({ source: e.source, target: e.target }));
    } else {
      // Legacy fallback
      nodes = [
        { id: depGraph.file, type: 'root', label: depGraph.file },
        ...(depGraph.imports||[]).map(imp => ({
          id: imp,
          type: imp.startsWith('.') ? 'local' : 'external',
          label: imp.split('/').pop().replace(/\.(jsx?|tsx?)$/, ''),
        })),
      ];
      links = (depGraph.imports||[]).map(imp => ({ source: depGraph.file, target: imp }));
    }

    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H);

    // Arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'dep-arrow').attr('viewBox', '0 -4 8 8')
      .attr('refX', 22).attr('refY', 0)
      .attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
      .append('path').attr('d', 'M0,-4L8,0L0,4').attr('fill', 'rgba(124,58,237,.45)');

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(28));

    const link = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', 'rgba(124,58,237,.3)').attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#dep-arrow)');

    const COLOR = { root: '#7c3aed', local: '#059669', external: '#1d4ed8' };
    const RADIUS = { root: 18, local: 13, external: 10 };

    const node = svg.append('g').selectAll('g').data(nodes).join('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on('mouseenter', (_, d) => setHovered(d.id))
      .on('mouseleave', () => setHovered(null));

    node.append('circle')
      .attr('r', d => RADIUS[d.type] || 10)
      .attr('fill', d => COLOR[d.type])
      .attr('fill-opacity', 0.85)
      .attr('stroke', 'rgba(255,255,255,.2)').attr('stroke-width', 1.5);

    node.append('text')
      .text(d => d.label.length > 14 ? d.label.slice(0, 12) + '…' : d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => (RADIUS[d.type] || 10) + 13)
      .attr('fill', 'rgba(255,255,255,.65)')
      .attr('font-size', '9px').attr('font-family', 'monospace')
      .style('pointer-events', 'none');

    sim.on('tick', () => {
      link
        .attr('x1', d => Math.max(20, Math.min(W - 20, d.source.x)))
        .attr('y1', d => Math.max(20, Math.min(H - 20, d.source.y)))
        .attr('x2', d => Math.max(20, Math.min(W - 20, d.target.x)))
        .attr('y2', d => Math.max(20, Math.min(H - 20, d.target.y)));
      node.attr('transform', d =>
        `translate(${Math.max(20, Math.min(W - 20, d.x))},${Math.max(20, Math.min(H - 20, d.y))})`
      );
    });

    return () => { sim.stop(); d3.select(el).selectAll('*').remove(); };
  }, [depGraph]);

  const localCount = depGraph?.nodes
    ? depGraph.nodes.filter(n => n.type === 'local').length
    : (depGraph?.imports||[]).filter(i => i.startsWith('.')).length;
  const extCount = depGraph?.nodes
    ? depGraph.nodes.filter(n => n.type === 'external').length
    : (depGraph?.imports||[]).filter(i => !i.startsWith('.')).length;
  const edgeCount = depGraph?.edges?.length || depGraph?.imports?.length || 0;

  return (
    <BottomSheet onClose={onClose} height='92%'>
      <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:'8px',flexShrink:0,background:'rgba(255,255,255,.02)'}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🕸 Dep Graph — <span style={{fontFamily:'monospace',color:'#a78bfa'}}>{depGraph?.file}</span></span>
        <span style={{fontSize:'10px',color:'rgba(5,150,105,.7)'}}>● {localCount} local</span>
        <span style={{fontSize:'10px',color:'rgba(96,165,250,.7)'}}>● {extCount} npm</span>
        <span style={{fontSize:'10px',color:'rgba(255,255,255,.25)'}}>→ {edgeCount} edges</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      {hovered && (
        <div style={{padding:'4px 12px',background:'rgba(124,58,237,.08)',borderBottom:'1px solid rgba(124,58,237,.15)',fontSize:'10px',color:'#a78bfa',fontFamily:'monospace',flexShrink:0}}>
          {hovered}
        </div>
      )}
      <div ref={containerRef} style={{flex:1,position:'relative',overflow:'hidden'}} />
      <div style={{padding:'5px 12px',borderTop:'1px solid rgba(255,255,255,.05)',display:'flex',gap:'14px',flexShrink:0,background:'rgba(255,255,255,.01)'}}>
        <span style={{fontSize:'9px',color:'rgba(124,58,237,.7)'}}>● root</span>
        <span style={{fontSize:'9px',color:'rgba(5,150,105,.7)'}}>● local</span>
        <span style={{fontSize:'9px',color:'rgba(29,78,216,.7)'}}>● npm</span>
        <span style={{fontSize:'9px',color:'rgba(255,255,255,.2)',marginLeft:'auto'}}>drag nodes to reposition</span>
      </div>
  </BottomSheet>
  );
}

// ─── ELICITATION PANEL (AI-requested dynamic form) ───────────────────────────
export function ElicitationPanel({ data, onSubmit, onDismiss }) {
  const [values, setValues] = useState(() => {
    const init = {};
    (data.fields || []).forEach(f => { init[f.name] = f.default || ''; });
    return init;
  });

  function set(name, val) { setValues(v => ({ ...v, [name]: val })); }

  function handleSubmit() {
    const result = Object.entries(values)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    onSubmit(result);
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.78)',zIndex:210,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{background:'#111113',border:'1px solid rgba(124,58,237,.25)',borderRadius:'14px',padding:'20px',width:'100%',maxWidth:'380px',boxShadow:'0 24px 60px rgba(0,0,0,.8)'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',gap:'10px',marginBottom:'14px'}}>
          <span style={{fontSize:'18px'}}>✦</span>
          <div style={{flex:1}}>
            <div style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0'}}>{data.title || 'Input diperlukan'}</div>
            {data.description && <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)',marginTop:'3px'}}>{data.description}</div>}
          </div>
          <button onClick={onDismiss} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:'16px',cursor:'pointer',flexShrink:0}}>×</button>
        </div>

        {/* Fields */}
        <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'16px'}}>
          {(data.fields || []).map(field => (
            <div key={field.name}>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.5)',marginBottom:'4px'}}>{field.label}</div>
              {field.type === 'select' ? (
                <select value={values[field.name]} onChange={e => set(field.name, e.target.value)}
                  style={{width:'100%',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'8px',padding:'8px 10px',color:'#f0f0f0',fontSize:'13px',outline:'none',boxSizing:'border-box'}}>
                  <option value="">Pilih···</option>
                  {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : field.type === 'checkbox' ? (
                <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',padding:'4px 0'}}>
                  <input type="checkbox" checked={!!values[field.name]}
                    onChange={e => set(field.name, e.target.checked)}
                    style={{width:'15px',height:'15px',accentColor:'#7c3aed'}} />
                  <span style={{fontSize:'12px',color:'rgba(255,255,255,.6)'}}>{field.placeholder || field.label}</span>
                </label>
              ) : field.type === 'textarea' ? (
                <textarea value={values[field.name]} onChange={e => set(field.name, e.target.value)}
                  placeholder={field.placeholder || ''} rows={3}
                  style={{width:'100%',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'8px',padding:'8px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none',resize:'none',fontFamily:'inherit',boxSizing:'border-box'}} />
              ) : (
                <input value={values[field.name]} onChange={e => set(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                  style={{width:'100%',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'8px',padding:'8px 10px',color:'#f0f0f0',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={onDismiss}
            style={{flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'8px',padding:'9px',color:'rgba(255,255,255,.4)',fontSize:'12px',cursor:'pointer'}}>
            Batal
          </button>
          <button onClick={handleSubmit}
            style={{flex:2,background:'#7c3aed',border:'none',borderRadius:'8px',padding:'9px',color:'white',fontSize:'12px',cursor:'pointer',fontWeight:'600'}}>
            Kirim →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MERGE CONFLICT PANEL ─────────────────────────────────────────────────────
export function MergeConflictPanel({ data, folder, onResolved, onAborted, onClose }) {
  const [resolving, setResolving] = useState(false);
  const [previews, setPreviews]   = useState({});
  const [status, setStatus]       = useState('');

  async function loadPreview(cf) {
    const r = await callServer({ type: 'read', path: folder + '/' + cf });
    if (r.ok) setPreviews(p => ({ ...p, [cf]: r.data }));
  }

  async function resolve(strategy) {
    setResolving(true);
    setStatus('Resolving (' + strategy + ')···');
    if (strategy === 'ours') {
      await callServer({ type: 'exec', path: folder, command: 'git checkout --ours -- . && git add -A' });
    } else {
      await callServer({ type: 'exec', path: folder, command: 'git checkout --theirs -- . && git add -A' });
    }
    const commit = await callServer({ type: 'exec', path: folder, command: `git commit -m "merge: resolve conflicts via ${strategy}"` });
    setResolving(false);
    if (commit.ok) {
      setStatus('✅ Resolved!');
      setTimeout(() => onResolved(strategy), 800);
    } else {
      setStatus('❌ Commit gagal: ' + (commit.data || '').slice(0, 80));
    }
  }

  async function abortMerge() {
    setResolving(true);
    setStatus('Aborting···');
    await callServer({ type: 'exec', path: folder, command: 'git merge --abort' });
    setResolving(false);
    onAborted();
  }

  const conflictList = data?.conflicts || [];
  const previewData  = data?.previews || [];

  return (
    <BottomSheet onClose={onClose}><div style={{padding:'0 16px 8px',display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',marginBottom:'10px'}}>
        <span style={{fontSize:'14px',fontWeight:'600',color:'#f87171',flex:1}}>⚠ Merge Conflict — {conflictList.length} file</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>

      <div style={{background:'rgba(248,113,113,.06)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'8px',padding:'9px 12px',marginBottom:'12px',fontSize:'11px',color:'rgba(255,255,255,.55)',lineHeight:'1.6'}}>
        Branch <span style={{color:'#a78bfa',fontFamily:'monospace'}}>{data?.branch}</span> konflik dengan main.<br/>
        Task: <em style={{color:'rgba(255,255,255,.4)'}}>{data?.task?.slice(0, 80)}</em>
      </div>

      {/* Conflict files */}
      <div style={{flex:1,overflowY:'auto',marginBottom:'12px'}}>
        {conflictList.map((cf, i) => {
          const preview = previews[cf] || previewData.find(p => p.file === cf)?.snippet;
          return (
            <div key={cf} style={{padding:'9px 12px',marginBottom:'6px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(248,113,113,.12)',borderRadius:'8px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:preview?'6px':'0'}}>
                <span style={{fontSize:'10px',color:'#f87171'}}>⚠</span>
                <span style={{fontSize:'12px',color:'rgba(255,255,255,.8)',fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cf}</span>
                <button onClick={() => loadPreview(cf)}
                  style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'4px',padding:'2px 7px',color:'rgba(255,255,255,.4)',fontSize:'9px',cursor:'pointer',flexShrink:0}}>
                  preview
                </button>
              </div>
              {preview && (
                <pre style={{margin:0,padding:'6px 8px',background:'rgba(0,0,0,.5)',borderRadius:'5px',fontSize:'9px',color:'rgba(255,255,255,.45)',fontFamily:'monospace',maxHeight:'90px',overflow:'auto',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
                  {preview.slice(0, 400)}
                </pre>
              )}
            </div>
          );
        })}
      </div>

      {/* Status */}
      {status && (
        <div style={{padding:'6px 10px',marginBottom:'8px',borderRadius:'6px',background:'rgba(255,255,255,.04)',fontSize:'11px',color:status.startsWith('✅')?'#4ade80':status.startsWith('❌')?'#f87171':'rgba(255,255,255,.5)',textAlign:'center'}}>
          {status}
        </div>
      )}

      {/* Actions */}
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={() => resolve('ours')} disabled={resolving}
            style={{flex:1,background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:'8px',padding:'10px 8px',color:'#818cf8',fontSize:'11px',cursor:'pointer',fontWeight:'500',opacity:resolving?.5:1}}>
            ← Pakai main (ours)
          </button>
          <button onClick={() => resolve('theirs')} disabled={resolving}
            style={{flex:1,background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'8px',padding:'10px 8px',color:'#4ade80',fontSize:'11px',cursor:'pointer',fontWeight:'500',opacity:resolving?.5:1}}>
            Pakai agent (theirs) →
          </button>
        </div>
        <button onClick={abortMerge} disabled={resolving}
          style={{background:'rgba(248,113,113,.07)',border:'1px solid rgba(248,113,113,.14)',borderRadius:'8px',padding:'8px',color:'#f87171',fontSize:'11px',cursor:'pointer',opacity:resolving?.5:1}}>
          ✕ Abort merge
        </button>
      </div>
    </div>
  </BottomSheet>
  );
}
