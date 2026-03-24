import React, { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { Zap, Bookmark, Check, X, Save, Shield, List, GitMerge, Plug, Key, Settings } from 'lucide-react';
import { BottomSheet } from './panels.base.jsx';
import { resolveTheme } from './themeUtils.js';

// ─── CUSTOM ACTIONS PANEL ─────────────────────────────────────────────────────
export function CustomActionsPanel({ folder:_folder, onRun, onClose, T }) {

  const { bg3, border, borderMed, text, textMute, accent, accentBg, accentBorder } = resolveTheme(T);
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
        <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}><Zap size={14}/> Custom Actions</span>
        <button onClick={()=>setAdding(!adding)} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'10px',cursor:'pointer',marginRight:'8px'}}>+ New</button>
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
      </div>
      {adding&&(
        <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'10px',padding:'10px',background:bg3,borderRadius:'8px'}}>
          <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Label (e.g. Deploy)"
            style={{background:bg3,border:'1px solid '+borderMed,borderRadius:'6px',padding:'5px 10px',color:text,fontSize:'12px',outline:'none'}}/>
          <input value={newCmd} onChange={e=>setNewCmd(e.target.value)} placeholder="Command (e.g. npm run deploy)"
            style={{background:bg3,border:'1px solid '+borderMed,borderRadius:'6px',padding:'5px 10px',color:text,fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <button onClick={add} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'6px',padding:'5px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}><Save size={13}/> Simpan</button>
        </div>
      )}
      <div style={{flex:1,overflowY:'auto'}}>
        {actions.length===0&&<div style={{color:textMute,fontSize:'12px'}}>Belum ada custom action. Tambah shortcut command favoritmu~</div>}
        {actions.map(a=>(
          <div key={a.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',marginBottom:'4px',background:bg3,border:'1px solid '+border,borderRadius:'7px'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:'12px',color:text,fontWeight:'500'}}>{a.label}</div>
              <div style={{fontSize:'10px',color:textMute,fontFamily:'monospace'}}>{a.cmd}</div>
            </div>
            <button onClick={()=>{onRun(a.cmd);onClose();}} style={{background:accentBg,border:'1px solid '+accentBorder,borderRadius:'5px',padding:'2px 8px',color:accent,fontSize:'10px',cursor:'pointer'}}>▶ Run</button>
            <button onClick={()=>save(actions.filter(x=>x.id!==a.id))} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer'}}><X size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  </BottomSheet>
  );
}

// ─── SHORTCUTS PANEL ──────────────────────────────────────────────────────────

// ─── SHORTCUTS PANEL ──────────────────────────────────────────────────────────
export function ShortcutsPanel({ onClose, T }) {

  const { bg3, border, text, textSec, textMute, accent } = resolveTheme(T);
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
        <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}>⌨ Keyboard Shortcuts</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
      </div>
      {shortcuts.map(([key,desc],i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'6px 0',borderBottom:'1px solid '+border}}>
          <code style={{background:bg3,padding:'2px 8px',borderRadius:'4px',fontSize:'12px',color:accent,fontFamily:'monospace',flexShrink:0,minWidth:'120px'}}>{key}</code>
          <span style={{fontSize:'12px',color:textSec}}>{desc}</span>
        </div>
      ))}
    </div>
  </BottomSheet>
  );
}

// ─── GIT BLAME PANEL ──────────────────────────────────────────────────────────

// ─── SNIPPET LIBRARY ──────────────────────────────────────────────────────────
export function SnippetLibrary({ onInsert, onClose, T }) {

  const { bg3, border, borderMed, text, textMute, accent, accentBg, accentBorder, textSec } = resolveTheme(T);
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
      <div style={{padding:'8px 12px',borderBottom:'1px solid '+border,display:'flex',alignItems:'center',gap:'8px',background:bg3,flexShrink:0}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:text,flex:1}}><Bookmark size={14}/> Snippet Library</span>
        <button onClick={()=>setAdding(!adding)} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}>+ New</button>
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
      </div>
      {adding && (
        <div style={{padding:'10px 12px',borderBottom:'1px solid '+border,display:'flex',flexDirection:'column',gap:'6px',flexShrink:0}}>
          <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Snippet title..."
            style={{background:bg3,border:'1px solid '+borderMed,borderRadius:'6px',padding:'5px 10px',color:text,fontSize:'12px',outline:'none'}}/>
          <textarea value={newCode} onChange={e=>setNewCode(e.target.value)} placeholder="Code..." rows={4}
            style={{background:bg3,border:'1px solid '+borderMed,borderRadius:'6px',padding:'5px 10px',color:text,fontSize:'11px',outline:'none',fontFamily:'monospace',resize:'none'}}/>
          <button onClick={addSnippet} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'6px',padding:'5px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}><Save size={13}/> Simpan</button>
        </div>
      )}
      <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
        {snippets.length===0 && <div style={{color:textMute,fontSize:'12px',padding:'8px'}}>Belum ada snippet~</div>}
        {snippets.map(s => (
          <div key={s.id} style={{background:bg3,border:'1px solid '+border,borderRadius:'8px',padding:'8px 10px',marginBottom:'6px'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'4px'}}>
              <span style={{fontSize:'12px',color:textSec,fontWeight:'500',flex:1}}>{s.title}</span>
              <button onClick={()=>onInsert(s.code)} style={{background:accentBg,border:'1px solid '+accentBorder,borderRadius:'4px',padding:'1px 7px',color:accent,fontSize:'10px',cursor:'pointer',marginRight:'4px'}}>insert</button>
              <button onClick={()=>save(snippets.filter(x=>x.id!==s.id))} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer'}}><X size={16}/></button>
            </div>
            <pre style={{margin:0,fontSize:'10px',color:textMute,fontFamily:'monospace',whiteSpace:'pre-wrap',wordBreak:'break-all',maxHeight:'60px',overflow:'hidden'}}>{s.code}</pre>
          </div>
        ))}
      </div>
  </BottomSheet>
  );
}

// ─── THEME BUILDER ────────────────────────────────────────────────────────────

// ─── THEME BUILDER ────────────────────────────────────────────────────────────
export function ThemeBuilder({ onClose, themeKey, themesMap, themeKeys, onTheme, T }) {
  const { bg3, border, borderMed, text, textMute } = resolveTheme(T);
  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 16px',display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'16px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}>Pilih Theme</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px',overflowY:'auto'}}>
          {(themeKeys||[]).map(key => {
            const th = themesMap?.[key];
            if (!th) return null;
            const active = key === themeKey;
            return (
              <button key={key} onClick={()=>{ onTheme(key); onClose(); }} style={{
                display:'flex', alignItems:'center', gap:'14px',
                padding:'12px 14px', borderRadius:'12px', cursor:'pointer', textAlign:'left',
                background: active ? bg3 : 'rgba(255,255,255,.02)',
                border: active ? '1px solid '+borderMed : '1px solid '+border,
                transition:'all .15s',
              }}>
                {/* accent swatch */}
                <div style={{
                  width:32, height:32, borderRadius:8, flexShrink:0,
                  background: th.header?.logoGrad || th.accent || '#888',
                  boxShadow: active ? '0 0 12px '+th.accent+'66' : 'none',
                }}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',fontWeight:active?'700':'500',color:active?text:textMute}}>{th.name||key}</div>
                  <div style={{fontSize:'10px',color:textMute,marginTop:'2px',fontFamily:'monospace'}}>{th.accent}</div>
                </div>
                {active && <span style={{fontSize:'11px',color:th.accent||'#888'}}><Check size={11}/> aktif</span>}
              </button>
            );
          })}
        </div>
        <div style={{marginTop:'14px',padding:'10px 12px',borderRadius:'8px',background:bg3,border:'1px solid '+border}}>
          <div style={{fontSize:'10px',color:textMute,lineHeight:'1.5'}}>
            Tambah theme: buat file <span style={{fontFamily:'monospace',color:textMute}}>src/themes/nama.js</span> lalu tambah import di <span style={{fontFamily:'monospace',color:textMute}}>src/themes/index.js</span>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

// ─── COMMAND PALETTE ──────────────────────────────────────────────────────────

// ── DeployPanel ───────────────────────────────────────────────────────────────
export function DeployPanel({ deployLog, loading, onDeploy, onClose, T }) {
  const { border, text, textMute, accent, accentBg, accentBorder, bg2, textSec } = resolveTheme(T);
  return (
    <BottomSheet onClose={onClose} T={T}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}>Deploy</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'12px'}}>
          {['github','vercel','netlify','railway'].map(p=>(
            <button key={p} onClick={()=>onDeploy(p)} disabled={loading}
              style={{background:accentBg,border:'1px solid '+accentBorder,borderRadius:'8px',padding:'8px 16px',color:accent,fontSize:'12px',cursor:'pointer',fontWeight:'500'}}>
              {p==='github'?'↑ Git Push':p==='vercel'?'▲ Vercel':p==='netlify'?'◈ Netlify':'⊟ Railway'}
            </button>
          ))}
        </div>
        {deployLog
          ? <div style={{flex:1,background:bg2,border:'1px solid '+border,borderRadius:'8px',padding:'12px',fontFamily:'monospace',fontSize:'11px',color:textSec,overflowY:'auto',whiteSpace:'pre-wrap'}}>{deployLog}</div>
          : <div style={{color:textMute,fontSize:'12px'}}>Pilih platform untuk deploy~</div>
        }
      </div>
    </BottomSheet>
  );
}

// ── McpPanel ──────────────────────────────────────────────────────────────────

// ── McpPanel ──────────────────────────────────────────────────────────────────
export function McpPanel({ mcpTools, folder: _folder, onResult, onClose, T }) {

  const { bg3, text, textMute } = resolveTheme(T);
  const defaultTools = [['git',['status','log','diff']],['fetch',['browse']],['sqlite',['tables']],['github',['issues','pulls']],['system',['disk','memory']],['filesystem',['list']]];
  const entries = Object.keys(mcpTools).length > 0 ? Object.entries(mcpTools) : defaultTools;
  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}>MCP Tools</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        {Object.keys(mcpTools).length === 0 && (
          <div style={{color:textMute,fontSize:'12px',padding:'8px 0'}}>Tidak ada MCP tools terdeteksi dari server.<br/>Pastikan yuyu-server.js sudah jalan.</div>
        )}
        {entries.map(([tool, actions])=>(
          <div key={tool} style={{padding:'10px 12px',marginBottom:'6px',background:bg3,border:'1px solid rgba(74,222,128,.1)',borderRadius:'8px'}}>
            <span style={{fontSize:'13px',color:'#4ade80',fontFamily:'monospace',fontWeight:'600'}}>{tool}</span>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'6px'}}>
              {(Array.isArray(actions)?actions:Object.keys(actions)).map(act=>(
                <button key={act} onClick={()=>onResult(tool,act)}
                  style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'4px',padding:'2px 8px',color:'rgba(74,222,128,.8)',fontSize:'10px',cursor:'pointer',fontFamily:'monospace'}}>{act}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

// ── GitHubPanel ───────────────────────────────────────────────────────────────

// ── GitHubPanel ───────────────────────────────────────────────────────────────
export function GitHubPanel({ githubRepo, githubToken, githubData, onRepoChange, onTokenChange, onFetch, onAskYuyu, onClose, T }) {
  const { bg3, border, borderMed, text, textMute, accent, accentBg, accentBorder } = resolveTheme(T);
  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}>⑂ GitHub</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'12px'}}>
          <input value={githubRepo} onChange={e=>onRepoChange(e.target.value)} placeholder="owner/repo" style={{background:bg3,border:'1px solid '+borderMed,borderRadius:'6px',padding:'7px 10px',color:text,fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <input value={githubToken} onChange={e=>onTokenChange(e.target.value)} placeholder="GitHub token" type="password" style={{background:bg3,border:'1px solid '+borderMed,borderRadius:'6px',padding:'7px 10px',color:text,fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <div style={{display:'flex',gap:'6px'}}>
            <button onClick={()=>onFetch('issues')} style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:'6px',padding:'5px 12px',color:'#818cf8',fontSize:'11px',cursor:'pointer',flex:1}}><List size={13}/> Issues</button>
            <button onClick={()=>onFetch('pulls')} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'6px',padding:'5px 12px',color:'#4ade80',fontSize:'11px',cursor:'pointer',flex:1}}><GitMerge size={13}/> PRs</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {githubData&&Array.isArray(githubData.data)&&githubData.data.map((item,i)=>(
            <div key={i} style={{padding:'8px 10px',marginBottom:'4px',background:bg3,border:'1px solid '+border,borderRadius:'7px'}}>
              <div style={{fontSize:'12px',color:text,marginBottom:'2px'}}>#{item.number} {item.title}</div>
              <div style={{fontSize:'10px',color:textMute}}>{item.state} · {item.user?.login}</div>
              <button onClick={()=>onAskYuyu(item)} style={{background:accentBg,border:'1px solid '+accentBorder,borderRadius:'4px',padding:'2px 7px',color:accent,fontSize:'10px',cursor:'pointer',marginTop:'4px'}}>Ask Yuyu</button>
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}

// ── SessionsPanel ─────────────────────────────────────────────────────────────

// ── SessionsPanel ─────────────────────────────────────────────────────────────
export function SessionsPanel({ sessions, onRestore, onClose, T }) {
  const { bg3, border, text, textMute, accent, accentBg, accentBorder } = resolveTheme(T);
  return (
    <BottomSheet onClose={onClose} T={T}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}><Save size={14}/> Saved Sessions</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        {sessions.length===0&&<div style={{color:textMute,fontSize:'12px'}}>Belum ada sesi tersimpan. Ketik /save~</div>}
        <div style={{flex:1,overflowY:'auto'}}>
          {sessions.map(s=>(
            <div key={s.id} style={{padding:'10px 12px',marginBottom:'6px',background:bg3,border:'1px solid '+border,borderRadius:'8px',display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',color:text,fontWeight:'500'}}>{s.name}</div>
                <div style={{fontSize:'10px',color:textMute}}>{s.folder} · {new Date(s.savedAt).toLocaleString('id')} · {s.messages?.length||0} pesan</div>
              </div>
              <button onClick={()=>onRestore(s)} style={{background:accentBg,border:'1px solid '+accentBorder,borderRadius:'6px',padding:'4px 10px',color:accent,fontSize:'11px',cursor:'pointer'}}>Restore</button>
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}

// ── PermissionsPanel ──────────────────────────────────────────────────────────

// ── PermissionsPanel ──────────────────────────────────────────────────────────
export function PermissionsPanel({ permissions, accentColor:_accentColor, onToggle, onReset, onClose, T }) {

  const { border, text, textMute } = resolveTheme(T);
  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}><Shield size={14}/> Tool Permissions</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {Object.entries(permissions).map(([tool,allowed])=>(
            <div key={tool} style={{display:'flex',alignItems:'center',padding:'10px 0',borderBottom:'1px solid '+border}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',color:text,fontFamily:'monospace'}}>{tool}</div>
                <div style={{fontSize:'10px',color:textMute}}>{allowed?'Auto-run':'Butuh konfirmasi'}</div>
              </div>
              <div onClick={()=>onToggle(tool)} style={{width:'42px',height:'24px',borderRadius:'12px',background:allowed?T.accent:'rgba(255,255,255,.1)',cursor:'pointer',position:'relative',transition:'all .2s',flexShrink:0}}>
                <div style={{position:'absolute',top:'3px',left:allowed?'21px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'white',transition:'all .2s'}}/>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onReset} style={{marginTop:'12px',background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.2)',borderRadius:'10px',padding:'10px',color:'#f87171',fontSize:'12px',cursor:'pointer',minHeight:'44px'}}>Reset ke Default</button>
      </div>
    </BottomSheet>
  );
}


// ── PluginsPanel ──────────────────────────────────────────────────────────────
// ── PluginsPanel ──────────────────────────────────────────────────────────────
const BUILTIN_PLUGINS = [
  {id:'auto_commit',  name:'Auto Commit',   desc:'Commit otomatis setelah write_file', hookType:'postWrite', cmd:'cd {{context}} && git add -A && git commit -m "auto: yuyu save $(date +%H:%M)"'},
  {id:'lint_on_save', name:'Lint on Save',  desc:'ESLint check sebelum save',          hookType:'preWrite',  cmd:'cd {{context}} && npx eslint src --max-warnings 0 2>&1 | tail -5'},
  {id:'test_runner',  name:'Test Runner',   desc:'Jalankan tests setelah write',       hookType:'postWrite', cmd:'cd {{context}} && npm test -- --watchAll=false --passWithNoTests 2>&1 | tail -10'},
  {id:'auto_push',   name:'Git Auto Push', desc:'Push ke remote setelah commit',       hookType:'postWrite', cmd:'node yugit.cjs "auto push"'},
];
export function PluginsPanel({ activePlugins, folder, onToggle, onClose, T }) {
  const { bg3, border, text, textMute, success } = resolveTheme(T);
  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}><Plug size={14}/> Plugin Marketplace</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        {BUILTIN_PLUGINS.map(p=>{
          const isActive=!!activePlugins[p.id];
          return (
            <div key={p.id} style={{padding:'10px 12px',marginBottom:'8px',background:isActive?'rgba(74,222,128,.04)':bg3,border:'1px solid '+(isActive?'rgba(74,222,128,.18)':border),borderRadius:'8px',display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',color:isActive?success:text,fontWeight:'500',marginBottom:'2px'}}>{p.name}</div>
                <div style={{fontSize:'11px',color:textMute,marginBottom:'3px'}}>{p.desc}</div>
                <div style={{fontSize:'9px',color:textMute,fontFamily:'monospace'}}>{p.hookType}</div>
              </div>
              <div onClick={()=>onToggle(p,isActive,folder)} style={{width:'42px',height:'24px',borderRadius:'12px',background:isActive?'#4ade80':'rgba(255,255,255,.1)',cursor:'pointer',position:'relative',transition:'all .2s',flexShrink:0}}>
                <div style={{position:'absolute',top:'3px',left:isActive?'21px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'white',transition:'all .2s'}}/>
              </div>
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}

// ── ConfigPanel ───────────────────────────────────────────────────────────────
export function ConfigPanel({
  effort, fontSize, theme, model, thinkingEnabled, models,
  onEffort, onFontSize, onTheme, onModel, onThinking,
  vimMode, onVimMode,
  showMinimap, onMinimap,
  ghostTextEnabled, onGhostText,
  lintEnabled, onLint,
  tsLspEnabled, onTsLsp,
  blameEnabled, onBlame,
  multiCursor, onMultiCursor,
  stickyScroll, onStickyScroll,
  collabEnabled, onCollab,
  diffReview, onDiffReview,
  onClose, T,
}) {
  const { bg3, border, text, textMute, accentBg, accentBorder, accent, success, successBg, warning } = resolveTheme(T);

  const configs = [
    { label: 'Effort Level', value: effort,           options: ['low','medium','high'],        onChange: onEffort },
    { label: 'Font Size',    value: String(fontSize),  options: ['12','13','14','15','16'],     onChange: v => onFontSize(parseInt(v)) },
    { label: 'Theme',        value: theme,             options: ['obsidian','aurora','ink','neon'], onChange: onTheme },
    { label: 'Model',        value: model,             options: models.map(m => m.id),          onChange: onModel },
  ];

  const makeToggle = (label, sublabel, value, onToggle, color, bg, br) =>
    ({ label, sublabel, value, onToggle, color, bg, br });

  const fase12 = [
    makeToggle('Vim Mode',       'hjkl, normal/insert/visual',         vimMode,          onVimMode,    accent,  accentBg,  accentBorder),
    makeToggle('AI Ghost Text',  'inline suggestion, Tab to accept',   ghostTextEnabled, onGhostText,  success, successBg, success+'44'),
    makeToggle('Minimap',        'canvas scroll map side panel',       showMinimap,      onMinimap,    accent,  accentBg,  accentBorder),
    makeToggle('Inline Lint',    'syntax errors in gutter',            lintEnabled,      onLint,       warning, 'rgba(251,191,36,.1)', warning+'44'),
  ];

  const fase3 = [
    makeToggle('TypeScript LSP', 'autocomplete, hover types (TS/JS)', tsLspEnabled,  onTsLsp,       '#38bdf8', 'rgba(56,189,248,.1)',  '#38bdf844'),
    makeToggle('Inline Blame',   'git blame per line in gutter',       blameEnabled,  onBlame,       '#f59e0b', 'rgba(245,158,11,.1)', '#f59e0b44'),
    makeToggle('Multi-Cursor',   'Ctrl+D select next, Ctrl+Shift+L',  multiCursor,   onMultiCursor, success,   successBg,             success+'44'),
    makeToggle('Sticky Scroll',  'scope header stays at top',         stickyScroll,  onStickyScroll,accent,    accentBg,              accentBorder),
    makeToggle('Realtime Collab','sync edits across devices via WS',  collabEnabled, onCollab,      '#f59e0b', 'rgba(245,158,11,.1)', '#f59e0b44'),
    makeToggle('Diff Review',    'lihat diff sebelum agent apply patch/write', diffReview, onDiffReview, '#a78bfa', 'rgba(167,139,250,.1)', '#a78bfa44'),
  ];

  function ToggleRow({ t }) {
    return (
      <div style={{ padding: '10px 12px', background: t.value ? 'rgba(255,255,255,.025)' : bg3,
        border: '1px solid ' + (t.value ? t.br : border), borderRadius: '8px',
        display: 'flex', alignItems: 'center', gap: '10px', transition: 'all .15s' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', color: t.value ? t.color : text, fontWeight: t.value ? '600' : '400' }}>{t.label}</div>
          <div style={{ fontSize: '10px', color: textMute, marginTop: '2px' }}>{t.sublabel}</div>
        </div>
        <div onClick={() => t.onToggle?.(!t.value)}
          style={{ width: '40px', height: '22px', borderRadius: '11px', flexShrink: 0, cursor: 'pointer',
            background: t.value ? t.color : 'rgba(255,255,255,.12)', position: 'relative', transition: 'background .2s' }}>
          <div style={{ position: 'absolute', top: '3px', left: t.value ? '20px' : '3px', width: '16px', height: '16px',
            borderRadius: '50%', background: 'white', transition: 'left .2s' }}/>
        </div>
      </div>
    );
  }

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ padding: '0 16px 8px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: text, flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={14}/> Config
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: textMute, fontSize: '16px', cursor: 'pointer' }}><X size={16}/></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {configs.map(cfg => (
            <div key={cfg.label} style={{ padding: '10px 12px', background: bg3, border: '1px solid ' + border, borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: textMute, marginBottom: '6px' }}>{cfg.label}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {cfg.options.map(opt => (
                  <button key={opt} onClick={() => cfg.onChange(opt)}
                    style={{ background: cfg.value === opt ? accentBg : bg3, border: '1px solid ' + (cfg.value === opt ? accentBorder : border),
                      borderRadius: '6px', padding: '4px 10px', color: cfg.value === opt ? accent : textMute,
                      fontSize: '11px', cursor: 'pointer', fontFamily: 'monospace' }}>
                    {opt.length > 20 ? opt.slice(0, 20) + '…' : opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ padding: '10px 12px', background: bg3, border: '1px solid ' + border, borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: textMute, marginBottom: '6px' }}>Extended Thinking</div>
            <button onClick={onThinking}
              style={{ background: thinkingEnabled ? accentBg : bg3, border: '1px solid ' + (thinkingEnabled ? accentBorder : border),
                borderRadius: '6px', padding: '4px 10px', color: thinkingEnabled ? accent : textMute, fontSize: '11px', cursor: 'pointer' }}>
              {thinkingEnabled ? '✓ ON' : '○ OFF'}
            </button>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: textMute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600', padding: '2px 0' }}>
              Editor — Fase 1+2
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {fase12.map(t => <ToggleRow key={t.label} t={t}/>)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: textMute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600', padding: '2px 0' }}>
              Editor — Fase 3
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {fase3.map(t => <ToggleRow key={t.label} t={t}/>)}
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}


