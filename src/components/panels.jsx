import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Preferences } from "@capacitor/preferences";
import { callServer } from '../api.js';
import { THEMES, MODELS } from '../constants.js';
import { Settings, GitBranch, Search, Plug, Github, Key, Puzzle, Brain, MapPin, Scissors, Bookmark, Zap, Globe, RotateCcw, Trash2, Check, X, ChevronDown, ChevronUp, ChevronRight, AlertTriangle, Eye, ScrollText, Pin, FileText, Pencil, Copy, Package, Terminal, Play, Square, ArrowRight, GitMerge, Plus, RefreshCw, BookOpen, Layers, Palette, Save, Upload, Download, Power, Shield, List, History, GitCompare, XCircle, MessageSquare, Network } from 'lucide-react';

// ─── BOTTOM SHEET (reusable mobile-first wrapper) ─────────────────────────────
export function BottomSheet({ children, onClose, height='88%', noPad:_noPad=false, T }) {
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
        position:'relative', background:T?.bg2||'#111113',
        borderRadius:'18px 18px 0 0',
        maxHeight:height, display:'flex', flexDirection:'column',
        transform:`translateY(${dragY}px)`,
        transition: dragging ? 'none' : 'transform .3s cubic-bezier(.32,.72,0,1)',
        boxShadow:'0 -8px 40px rgba(0,0,0,.6)',
      }}>
        {/* drag handle zone */}
        <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          style={{padding:'10px 0 4px',display:'flex',justifyContent:'center',flexShrink:0,touchAction:'none',cursor:'grab'}}>
          <div style={{width:'40px',height:'4px',borderRadius:'2px',background:(T?.border||'rgba(255,255,255,.18)')}} />
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',paddingBottom:'env(safe-area-inset-bottom,8px)'}}>
          {children}
        </div>
      </div>
    </div>
  );
}


export function GitComparePanel({ folder, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
  const borderMed  = T?.borderMed  || 'rgba(255,255,255,.1)';
  const [diff, setDiff]       = useState('');
  const [loading, setLoading] = useState(true);
  const [staged, setStaged]   = useState(false);
  const [view, setView]       = useState('unified'); // 'unified' | 'split'
  const [stats, setStats]     = useState({ added:0, removed:0, files:0 });

  async function load(s) {
    setLoading(true);
    const cmd = s ? 'git diff --cached' : 'git diff';
    const r   = await callServer({ type:'exec', path:folder, command: cmd });
    const raw = r.data || '';
    setDiff(raw);
    // Compute stats
    const lines   = raw.split('\n');
    const added   = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length;
    const removed = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length;
    const files   = lines.filter(l => l.startsWith('diff --git')).length;
    setStats({ added, removed, files });
    setLoading(false);
  }

  useEffect(() => { load(false); }, []); // eslint-disable-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

  function lineStyle(line) {
    if (line.startsWith('diff --git'))  return { color:'#60a5fa', bg:'rgba(96,165,250,.06)',   bold:true };
    if (line.startsWith('@@'))           return { color:'#a78bfa', bg:'rgba(124,58,237,.08)',  bold:false };
    if (line.startsWith('+++') || line.startsWith('---')) return { color:'rgba(255,255,255,.3)', bg:'transparent', bold:false };
    if (line.startsWith('+'))            return { color:'#4ade80', bg:'rgba(74,222,128,.07)',   bold:false };
    if (line.startsWith('-'))            return { color:'#f87171', bg:'rgba(248,113,113,.07)',  bold:false };
    return { color:textSec, bg:'transparent', bold:false };
  }

  function renderUnified() {
    let _fileHeader = '';
    return diff.split('\n').map((line, i) => {
      if (line.startsWith('diff --git')) _fileHeader = line.replace('diff --git a/', '').split(' b/')[0];
      const { color, bg, bold } = lineStyle(line);
      const lineNum = line.startsWith('@@') ? null :
        line.startsWith('+') ? <span style={{color:'rgba(74,222,128,.4)',userSelect:'none',marginRight:'8px',fontSize:'9px'}}>+</span> :
        line.startsWith('-') ? <span style={{color:'rgba(248,113,113,.4)',userSelect:'none',marginRight:'8px',fontSize:'9px'}}>-</span> : null;
      return (
        <div key={i} style={{background:bg, display:'flex', alignItems:'flex-start'}}>
          <div style={{width:'3px',flexShrink:0,background:line.startsWith('+')?'#4ade80':line.startsWith('-')?'#f87171':'transparent',alignSelf:'stretch'}}/>
          <div style={{padding:'0 8px 0 6px',flex:1,fontFamily:'monospace',fontSize:'11px',lineHeight:'1.7',color,fontWeight:bold?'600':'400',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
            {lineNum}{line||' '}
          </div>
        </div>
      );
    });
  }

  function renderSplit() {
    // Parse hunk into left (old) and right (new) columns
    const hunks = [];
    let currentFile = '';
    diff.split('\n').forEach(line => {
      if (line.startsWith('diff --git')) { currentFile = line.replace('diff --git a/', '').split(' b/')[0]; return; }
      if (line.startsWith('---') || line.startsWith('+++')) return;
      if (line.startsWith('@@')) { hunks.push({ file: currentFile, header: line, pairs: [] }); return; }
      if (!hunks.length) return;
      const last = hunks[hunks.length - 1];
      if (line.startsWith('+')) last.pairs.push({ left: null, right: line.slice(1) });
      else if (line.startsWith('-')) {
        // Try to pair with next + line
        const nextUnpaired = last.pairs.findIndex(p => p.left === null && p.right !== null);
        if (nextUnpaired !== -1) last.pairs[nextUnpaired].left = line.slice(1);
        else last.pairs.push({ left: line.slice(1), right: null });
      }
      else last.pairs.push({ left: line, right: line });
    });

    return hunks.map((hunk, hi) => (
      <div key={hi} style={{marginBottom:'12px'}}>
        <div style={{padding:'4px 10px',background:accentBg,color:accent,fontSize:'10px',fontFamily:'monospace',borderBottom:'1px solid '+accentBorder}}>
          {hunk.file} {hunk.header}
        </div>
        <div style={{display:'flex'}}>
          {/* Left (old) */}
          <div style={{flex:1,borderRight:'1px solid '+border}}>
            {hunk.pairs.map((p,i) => (
              <div key={i} style={{padding:'0 8px',background:p.left===null?'rgba(74,222,128,.03)':p.right===null?'rgba(248,113,113,.07)':'transparent',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.7',color:p.right===null?'#f87171':'rgba(255,255,255,.5)',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
                {p.left ?? <span style={{opacity:.2}}>···</span>}
              </div>
            ))}
          </div>
          {/* Right (new) */}
          <div style={{flex:1}}>
            {hunk.pairs.map((p,i) => (
              <div key={i} style={{padding:'0 8px',background:p.right===null?'rgba(248,113,113,.03)':p.left===null?'rgba(74,222,128,.07)':'transparent',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.7',color:p.left===null?'#4ade80':'rgba(255,255,255,.55)',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
                {p.right ?? <span style={{opacity:.2}}>···</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    ));
  }

  const tabBtn = (label, active, onClick) => (
    <button onClick={onClick} style={{background:active?'rgba(255,255,255,.1)':'none',border:'1px solid '+(active?borderMed:border),borderRadius:'5px',padding:'3px 9px',color:active?text:textMute,fontSize:'11px',cursor:'pointer'}}>{label}</button>
  );

  return (
    <BottomSheet onClose={onClose}>
      {/* Header */}
      <div style={{padding:'8px 12px',borderBottom:'1px solid '+border,display:'flex',alignItems:'center',gap:'6px',background:bg3,flexShrink:0,flexWrap:'wrap'}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:text,marginRight:'4px'}}>◐ Git Diff</span>
        {/* Stats */}
        {!loading&&<>
          <span style={{fontSize:'10px',color:textMute}}>{stats.files} file</span>
          <span style={{fontSize:'10px',color:'#4ade80',fontFamily:'monospace'}}>+{stats.added}</span>
          <span style={{fontSize:'10px',color:'#f87171',fontFamily:'monospace'}}>-{stats.removed}</span>
        </>}
        <div style={{flex:1}}/>
        {tabBtn('unstaged', !staged, ()=>{setStaged(false);load(false);})}
        {tabBtn('staged',    staged, ()=>{setStaged(true);load(true);})}
        <div style={{width:'1px',height:'16px',background:borderMed}}/>
        {tabBtn('unified', view==='unified', ()=>setView('unified'))}
        {tabBtn('split',   view==='split',   ()=>setView('split'))}
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer',marginLeft:'2px'}}><X size={16}/></button>
      </div>
      {/* Diff content */}
      <div style={{flex:1,overflowY:'auto',padding:'4px 0'}}>
        {loading
          ? <div style={{padding:'16px',color:textMute,fontSize:'12px'}}>Loading···</div>
          : !diff.trim()
          ? <div style={{padding:'16px',color:textMute,fontSize:'12px'}}>Tidak ada perubahan~</div>
          : view==='split' ? renderSplit() : renderUnified()
        }
      </div>
    </BottomSheet>
  );
}

// ─── FILE HISTORY PANEL ───────────────────────────────────────────────────────
export function FileHistoryPanel({ folder, filePath, onClose, T }) {

  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
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
  }, [filePath, folder]);

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
      <div style={{width:'200px',borderRight:'1px solid '+border,display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'8px 12px',borderBottom:'1px solid '+border,display:'flex',alignItems:'center'}}>
          <span style={{fontSize:'12px',fontWeight:'600',color:text,flex:1}}><ScrollText size={14}/> File History</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'14px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {loading&&<div style={{padding:'8px',color:textMute,fontSize:'11px'}}>Loading···</div>}
          {commits.map(c=>(
            <div key={c.hash} onClick={()=>preview(c.hash)}
              style={{padding:'7px 10px',borderBottom:'1px solid '+border,cursor:'pointer',background:previewing?.hash===c.hash?'rgba(124,58,237,.15)':'transparent'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
              onMouseLeave={e=>e.currentTarget.style.background=previewing?.hash===c.hash?'rgba(124,58,237,.15)':'transparent'}>
              <div style={{fontSize:'10px',color:accent,fontFamily:'monospace'}}>{c.hash}</div>
              <div style={{fontSize:'11px',color:textSec,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.msg}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {previewing ? (
          <>
            <div style={{padding:'6px 12px',borderBottom:'1px solid '+border,display:'flex',gap:'8px',alignItems:'center',flexShrink:0}}>
              <span style={{fontSize:'11px',color:textMute,fontFamily:'monospace',flex:1}}>{previewing.hash}</span>
              <button onClick={()=>restore(previewing.hash)} style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.2)',borderRadius:'5px',padding:'2px 8px',color:'#f87171',fontSize:'10px',cursor:'pointer'}}>⏪ Restore</button>
            </div>
            <div style={{flex:1,overflow:'auto',display:'flex',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.6'}}>
              <div style={{padding:'8px 6px',color:textMute,textAlign:'right',userSelect:'none',borderRight:'1px solid '+border,minWidth:'32px',flexShrink:0}}>
                {(previewing.content||'').split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
              </div>
              <pre style={{margin:0,padding:'8px 12px',whiteSpace:'pre-wrap',wordBreak:'break-word',color:textSec,flex:1}}>{previewing.content}</pre>
            </div>
          </>
        ) : (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:textMute,fontSize:'12px'}}>Pilih commit untuk preview</div>
        )}
      </div>
      </div>
  </BottomSheet>
  );
}

// ─── CUSTOM ACTIONS PANEL ─────────────────────────────────────────────────────
export function CustomActionsPanel({ folder:_folder, onRun, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const borderMed  = T?.borderMed  || 'rgba(255,255,255,.1)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
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
export function ShortcutsPanel({ onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
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
export function GitBlamePanel({ folder, filePath, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
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
  }, [filePath, folder]);

  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'8px 12px',borderBottom:'1px solid '+border,display:'flex',alignItems:'center',background:bg3,flexShrink:0}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:text,flex:1}}><Eye size={14}/> Git Blame — {filePath.split('/').pop()}</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
      </div>
      <div style={{flex:1,overflowY:'auto',fontFamily:'monospace',fontSize:'11px'}}>
        {loading && <div style={{padding:'16px',color:textMute}}>Loading···</div>}
        {blame.map((b,i) => (
          <div key={i} style={{display:'flex',gap:'8px',padding:'2px 12px',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <span style={{color:'rgba(99,102,241,.7)',minWidth:'70px',flexShrink:0}}>{b.time}</span>
            <span style={{color:'rgba(74,222,128,.6)',minWidth:'80px',flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.author}</span>
            <span style={{color:textMute,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.summary}</span>
          </div>
        ))}
      </div>
  </BottomSheet>
  );
}

// ─── SNIPPET LIBRARY ──────────────────────────────────────────────────────────
export function SnippetLibrary({ onInsert, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const borderMed  = T?.borderMed  || 'rgba(255,255,255,.1)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
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
// ThemeBuilder diganti ThemePicker — theme kini dari file src/themes/*.js
export function ThemeBuilder({ onClose, themeKey, themesMap, themeKeys, onTheme, T }) {
  const bg3      = T?.bg3      || 'rgba(255,255,255,.04)';
  const border   = T?.border   || 'rgba(255,255,255,.06)';
  const borderMed = T?.borderMed || 'rgba(255,255,255,.1)';
  const text     = T?.text     || '#f0f0f0';
  const textMute = T?.textMute || 'rgba(255,255,255,.3)';
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
export function CommandPalette({ onClose, onRun:_onRun, folder:_folder, memories, checkpoints, model, models, T,
  onModelChange, onNewChat, theme, onThemeChange, showSidebar, onToggleSidebar,
  onShowMemory, onShowCheckpoints, onShowMCP, onShowGitHub, onShowDeploy,
  onShowDiff, onShowSearch, onShowSnippets, onShowCustomActions,
  onShowSessions, onShowPermissions, onShowPlugins, onShowConfig,
  onShowSkills,
  runTests, generateCommitMsg, exportChat, compactContext }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(()=>{ setTimeout(()=>inputRef.current?.focus(),50); }, []);

  const sections = [
    { label: 'Chat', items: [
      { icon:'chat', label:'New chat', sub:'Mulai sesi baru', action:()=>{ onNewChat(); onClose(); } },
      { icon:'upload', label:'Export chat', sub:'Simpan ke .md', action:()=>{ exportChat(); onClose(); } },
      { icon:'package', label:'Compact context', sub:'Kompres history', action:()=>{ compactContext(); onClose(); } },
    ]},
    { label: 'Git', items: [
      { icon:'gitdiff', label:'Git diff', sub:'Lihat perubahan', action:()=>{ onShowDiff(); onClose(); } },
      { icon:'plus', label:'Generate commit', sub:'AI-powered commit msg', action:()=>{ generateCommitMsg(); onClose(); } },
      { icon:'play', label:'Run tests', sub:'npm test + lint', action:()=>{ runTests(); onClose(); } },
    ]},
    { label: 'Tools', items: [
      { icon:'plug', label:'MCP Tools', sub:'Model Context Protocol', action:()=>{ onShowMCP(); onClose(); } },
      { icon:'github', label:'GitHub', sub:'Issues & PRs', action:()=>{ onShowGitHub(); onClose(); } },
      { icon:'rocket', label:'Deploy', sub:'Vercel / Netlify / Railway', action:()=>{ onShowDeploy(); onClose(); } },
      { icon:'save', label:'Sessions', sub:'Sesi tersimpan', action:()=>{ onShowSessions&&onShowSessions(); onClose(); } },
      { icon:'key', label:'Permissions', sub:'Kelola tool permissions', action:()=>{ onShowPermissions&&onShowPermissions(); onClose(); } },
      { icon:'plug', label:'Plugins', sub:'Plugin marketplace', action:()=>{ onShowPlugins&&onShowPlugins(); onClose(); } },
      { icon:'settings', label:'Config', sub:'Settings interaktif', action:()=>{ onShowConfig&&onShowConfig(); onClose(); } },
      { icon:'puzzle', label:'Skills', sub:'Kelola & upload skill files', action:()=>{ onShowSkills&&onShowSkills(); onClose(); } },
      { icon:'scissors', label:'Snippets', sub:'Code snippet library', action:()=>{ onShowSnippets(); onClose(); } },
      { icon:'zap', label:'Custom actions', sub:'Shortcut commands', action:()=>{ onShowCustomActions(); onClose(); } },
    ]},
    { label: 'Memory', items: [
      { icon:'brain', label:`Memories (${memories.length})`, sub:'Auto-learned patterns', action:()=>{ onShowMemory(); onClose(); } },
      { icon:'mappin', label:`Checkpoints (${checkpoints.length})`, sub:'Session snapshots', action:()=>{ onShowCheckpoints(); onClose(); } },
    ]},
    { label: 'View', items: [
      { icon:'search', label:'Search files', sub:'Grep across project', action:()=>{ onShowSearch(); onClose(); } },
      { icon:'menu', label:'Toggle sidebar', sub: showSidebar?'Sembunyikan':'Tampilkan', action:()=>{ onToggleSidebar(); onClose(); } },
      { icon:'palette', label:'Theme: '+theme, sub:'obsidian / aurora / ink / neon', action:()=>{ const themes=['obsidian','aurora','ink','neon']; const i=themes.indexOf(theme); onThemeChange(themes[(i+1)%themes.length]); onClose(); } },
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
        <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 14px',borderBottom:'1px solid '+border}}>
          <span style={{fontSize:'13px',color:textMute}}>⌘</span>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Escape') onClose(); }}
            placeholder="Cari action atau ketik command..."
            style={{flex:1,background:'none',border:'none',outline:'none',color:text,fontSize:'13px',fontFamily:'inherit'}}/>
          {q && <button onClick={()=>setQ('')} style={{background:'none',border:'none',color:textMute,cursor:'pointer',fontSize:'12px'}}><X size={14}/></button>}
        </div>
        <div style={{maxHeight:'60vh',overflowY:'auto',padding:'6px'}}>
          {display.map(section=>(
            <div key={section.label}>
              {!q && <div style={{padding:'6px 10px 3px',fontSize:'9px',letterSpacing:'.08em',color:textMute,textTransform:'uppercase',fontWeight:'600'}}>{section.label}</div>}
              {section.items.map((item,i)=>(
                <div key={i} onClick={item.action}
                  style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',borderRadius:'7px',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background=bg3}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{fontSize:'14px',width:'20px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{(()=>{
                    const iconMap = {
                      chat:<MessageSquare size={14}/>, upload:<Upload size={14}/>, package:<Package size={14}/>,
                      plug:<Plug size={14}/>, save:<Save size={14}/>, key:<Key size={14}/>,
                      puzzle:<Puzzle size={14}/>, zap:<Zap size={14}/>, search:<Search size={14}/>,
                      menu:<List size={14}/>, settings:<Settings size={14}/>, eye:<Eye size={14}/>,
                      gitdiff:<GitCompare size={14}/>, plus:<Plus size={14}/>, play:<Play size={14}/>,
                      github:<Github size={14}/>, rocket:<Zap size={14}/>, scissors:<Scissors size={14}/>,
                      brain:<Brain size={14}/>, mappin:<MapPin size={14}/>, history:<History size={14}/>, palette:<Palette size={14}/>,
                    };
                    return iconMap[item.icon] || <span style={{fontSize:'13px'}}>{item.icon}</span>;
                  })()}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'12px',color:text,fontWeight:'500'}}>{item.label}</div>
                    <div style={{fontSize:'10px',color:textMute,marginTop:'1px'}}>{item.sub}</div>
                  </div>
                  {item._section&&q&&<span style={{fontSize:'9px',color:textMute,flexShrink:0}}>{item._section}</span>}
                </div>
              ))}
            </div>
          ))}
          {filtered&&filtered.length===0&&<div style={{padding:'16px',textAlign:'center',color:textMute,fontSize:'12px'}}>Tidak ada hasil untuk "{q}"</div>}
        </div>
        <div style={{padding:'6px 14px',borderTop:'1px solid '+border,display:'flex',gap:'12px'}}>
          <span style={{fontSize:'10px',color:textMute}}>↵ pilih</span>
          <span style={{fontSize:'10px',color:textMute}}>esc tutup</span>
          <span style={{fontSize:'10px',color:textMute}}>/ untuk slash commands</span>
        </div>
      </div>
  </BottomSheet>
  );
}

// ─── DEP GRAPH PANEL (d3 force layout) ───────────────────────────────────────
export function DepGraphPanel({ depGraph, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
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
      .attr('stroke', T?.border||'rgba(255,255,255,.2)').attr('stroke-width', 1.5);

    node.append('text')
      .text(d => d.label.length > 14 ? d.label.slice(0, 12) + '…' : d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => (RADIUS[d.type] || 10) + 13)
      .attr('fill', T?.textSec||'rgba(255,255,255,.65)')
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
  }, [depGraph]); // eslint-disable-line react-hooks/exhaustive-deps

  const localCount = depGraph?.nodes
    ? depGraph.nodes.filter(n => n.type === 'local').length
    : (depGraph?.imports||[]).filter(i => i.startsWith('.')).length;
  const extCount = depGraph?.nodes
    ? depGraph.nodes.filter(n => n.type === 'external').length
    : (depGraph?.imports||[]).filter(i => !i.startsWith('.')).length;
  const edgeCount = depGraph?.edges?.length || depGraph?.imports?.length || 0;

  return (
    <BottomSheet onClose={onClose} height='92%'>
      <div style={{padding:'8px 12px',borderBottom:'1px solid '+border,display:'flex',alignItems:'center',gap:'8px',flexShrink:0,background:bg3}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:text,flex:1}}><Network size={14}/> Dep Graph — <span style={{fontFamily:'monospace',color:accent}}>{depGraph?.file}</span></span>
        <span style={{fontSize:'10px',color:'rgba(5,150,105,.7)'}}>● {localCount} local</span>
        <span style={{fontSize:'10px',color:'rgba(96,165,250,.7)'}}>● {extCount} npm</span>
        <span style={{fontSize:'10px',color:textMute}}>→ {edgeCount} edges</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
      </div>
      {hovered && (
        <div style={{padding:'4px 12px',background:accentBg,borderBottom:'1px solid '+accentBorder,fontSize:'10px',color:accent,fontFamily:'monospace',flexShrink:0}}>
          {hovered}
        </div>
      )}
      <div ref={containerRef} style={{flex:1,position:'relative',overflow:'hidden'}} />
      <div style={{padding:'5px 12px',borderTop:'1px solid '+border,display:'flex',gap:'14px',flexShrink:0,background:'rgba(255,255,255,.01)'}}>
        <span style={{fontSize:'9px',color:'rgba(124,58,237,.7)'}}>● root</span>
        <span style={{fontSize:'9px',color:'rgba(5,150,105,.7)'}}>● local</span>
        <span style={{fontSize:'9px',color:'rgba(29,78,216,.7)'}}>● npm</span>
        <span style={{fontSize:'9px',color:textMute,marginLeft:'auto'}}>drag nodes to reposition</span>
      </div>
  </BottomSheet>
  );
}

// ─── ELICITATION PANEL (AI-requested dynamic form) ───────────────────────────
export function ElicitationPanel({ data, onSubmit, onDismiss, T }) {

  const bg2        = T?.bg2        || '#131108';
  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const borderMed  = T?.borderMed  || 'rgba(255,255,255,.1)';
  const text       = T?.text       || '#f0f0f0';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
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
      <div style={{background:bg2,border:'1px solid '+accentBorder,borderRadius:'14px',padding:'20px',width:'100%',maxWidth:'380px',boxShadow:'0 24px 60px rgba(0,0,0,.8)'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',gap:'10px',marginBottom:'14px'}}>
          <span style={{fontSize:'18px'}}><Plus size={13}/></span>
          <div style={{flex:1}}>
            <div style={{fontSize:'14px',fontWeight:'600',color:text}}>{data.title || 'Input diperlukan'}</div>
            {data.description && <div style={{fontSize:'11px',color:textMute,marginTop:'3px'}}>{data.description}</div>}
          </div>
          <button onClick={onDismiss} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer',flexShrink:0}}><X size={16}/></button>
        </div>

        {/* Fields */}
        <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'16px'}}>
          {(data.fields || []).map(field => (
            <div key={field.name}>
              <div style={{fontSize:'11px',color:textSec,marginBottom:'4px'}}>{field.label}</div>
              {field.type === 'select' ? (
                <select value={values[field.name]} onChange={e => set(field.name, e.target.value)}
                  style={{width:'100%',background:bg3,border:'1px solid '+borderMed,borderRadius:'8px',padding:'8px 10px',color:text,fontSize:'13px',outline:'none',boxSizing:'border-box'}}>
                  <option value="">Pilih···</option>
                  {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : field.type === 'checkbox' ? (
                <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',padding:'4px 0'}}>
                  <input type="checkbox" checked={!!values[field.name]}
                    onChange={e => set(field.name, e.target.checked)}
                    style={{width:'15px',height:'15px',accentColor:'#7c3aed'}} />
                  <span style={{fontSize:'12px',color:textSec}}>{field.placeholder || field.label}</span>
                </label>
              ) : field.type === 'textarea' ? (
                <textarea value={values[field.name]} onChange={e => set(field.name, e.target.value)}
                  placeholder={field.placeholder || ''} rows={3}
                  style={{width:'100%',background:bg3,border:'1px solid '+borderMed,borderRadius:'8px',padding:'8px 10px',color:text,fontSize:'12px',outline:'none',resize:'none',fontFamily:'inherit',boxSizing:'border-box'}} />
              ) : (
                <input value={values[field.name]} onChange={e => set(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                  style={{width:'100%',background:bg3,border:'1px solid '+borderMed,borderRadius:'8px',padding:'8px 10px',color:text,fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={onDismiss}
            style={{flex:1,background:bg3,border:'1px solid '+border,borderRadius:'8px',padding:'9px',color:textMute,fontSize:'12px',cursor:'pointer'}}>
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
export function MergeConflictPanel({ data, folder, onResolved, onAborted, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const error      = T?.error      || '#f87171';
  const errorBg    = T?.errorBg    || 'rgba(248,113,113,.1)';
  const bg2        = T?.bg2        || '#131108';
  const text       = T?.text       || '#f0f0f0';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
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
        <span style={{fontSize:'14px',fontWeight:'600',color:'#f87171',flex:1}}><AlertTriangle size={14}/> Merge Conflict — {conflictList.length} file</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
      </div>

      <div style={{background:errorBg,border:'1px solid '+error+'22',borderRadius:'8px',padding:'9px 12px',marginBottom:'12px',fontSize:'11px',color:'rgba(255,255,255,.55)',lineHeight:'1.6'}}>
        Branch <span style={{color:accent,fontFamily:'monospace'}}>{data?.branch}</span> konflik dengan main.<br/>
        Task: <em style={{color:textMute}}>{data?.task?.slice(0, 80)}</em>
      </div>

      {/* Conflict files */}
      <div style={{flex:1,overflowY:'auto',marginBottom:'12px'}}>
        {conflictList.map((cf, _i) => {
          const preview = previews[cf] || previewData.find(p => p.file === cf)?.snippet;
          return (
            <div key={cf} style={{padding:'9px 12px',marginBottom:'6px',background:bg3,border:'1px solid rgba(248,113,113,.12)',borderRadius:'8px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:preview?'6px':'0'}}>
                <span style={{fontSize:'10px',color:'#f87171'}}><AlertTriangle size={13}/></span>
                <span style={{fontSize:'12px',color:text,fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cf}</span>
                <button onClick={() => loadPreview(cf)}
                  style={{background:bg3,border:'1px solid '+border,borderRadius:'4px',padding:'2px 7px',color:textMute,fontSize:'9px',cursor:'pointer',flexShrink:0}}>
                  preview
                </button>
              </div>
              {preview && (
                <pre style={{margin:0,padding:'6px 8px',background:bg2,borderRadius:'5px',fontSize:'9px',color:textSec,fontFamily:'monospace',maxHeight:'90px',overflow:'auto',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
                  {preview.slice(0, 400)}
                </pre>
              )}
            </div>
          );
        })}
      </div>

      {/* Status */}
      {status && (
        <div style={{padding:'6px 10px',marginBottom:'8px',borderRadius:'6px',background:bg3,fontSize:'11px',color:status.startsWith('✅')?'#4ade80':status.startsWith('❌')?'#f87171':'rgba(255,255,255,.5)',textAlign:'center'}}>
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
          <X size={12}/> Abort merge
        </button>
      </div>
    </div>
  </BottomSheet>
  );
}

// ── SkillsPanel ───────────────────────────────────────────────────────────────
export function SkillsPanel({ skills, onToggle, onUpload, onRemove, onAdd, onClose, accentColor:_accentColor, T }) {
  const [adding, setAdding]       = useState(false);
  const [newName, setNewName]     = useState('');
  const [newContent, setNewContent] = useState('');
  const [busy, setBusy]           = useState(false);

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const borderMed  = T?.borderMed  || 'rgba(255,255,255,.1)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const text = await file.text();
    await onUpload(file.name, text);
    setBusy(false);
    onClose();
  }

  async function handleAdd() {
    if (!newName.trim() || !newContent.trim()) return;
    setBusy(true);
    await onAdd(newName.trim(), newContent.trim());
    setNewName(''); setNewContent(''); setAdding(false);
    setBusy(false);
  }

  const inputStyle = {
    background:'rgba(255,255,255,.06)', border:'1px solid '+borderMed,
    borderRadius:'7px', padding:'8px 10px', color:text, fontSize:'12px',
    outline:'none', fontFamily:'monospace', width:'100%', boxSizing:'border-box',
  };

  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px', flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>

        {/* Header */}
        <div style={{display:'flex', alignItems:'center', marginBottom:'12px', gap:'6px'}}>
          <span style={{fontSize:'14px', fontWeight:'600', color:'#f0f0f0', flex:1}}><Puzzle size={14}/> Skills</span>
          <label style={{background:accentBg, border:'1px solid '+accentBorder, borderRadius:'7px', padding:'6px 10px', color:'#a78bfa', fontSize:'11px', cursor:'pointer', minHeight:'32px', display:'flex', alignItems:'center'}}>
            ↑ Upload .md
            <input type="file" accept=".md,text/markdown,text/plain" style={{display:'none'}} disabled={busy} onChange={handleUpload}/>
          </label>
          <button onClick={()=>setAdding(a=>!a)}
            style={{background:'rgba(74,222,128,.08)', border:'1px solid rgba(74,222,128,.18)', borderRadius:'7px', padding:'6px 10px', color:'#4ade80', fontSize:'11px', cursor:'pointer', minHeight:'32px'}}>
            {adding ? 'Batal' : '+ Baru'}
          </button>
          <button onClick={onClose} style={{background:'none', border:'none', color:'rgba(255,255,255,.4)', fontSize:'16px', cursor:'pointer', padding:'4px'}}><X size={16}/></button>
        </div>

        {/* Inline add form */}
        {adding && (
          <div style={{marginBottom:'12px', display:'flex', flexDirection:'column', gap:'6px', padding:'10px', background:bg3, borderRadius:'8px', border:'1px solid '+border}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)}
              placeholder="nama-skill  (tanpa .md)" style={inputStyle}/>
            <textarea value={newContent} onChange={e=>setNewContent(e.target.value)}
              placeholder="Isi skill dalam Markdown&#10;&#10;Gunakan frontmatter:&#10;---&#10;name: nama&#10;description: ...&#10;---"
              style={{...inputStyle, resize:'vertical', minHeight:'120px', lineHeight:'1.6'}}/>
            <button onClick={handleAdd} disabled={!newName.trim()||!newContent.trim()||busy}
              style={{background:accentBg, border:'1px solid '+accentBorder, borderRadius:'7px', padding:'9px', color:accent, fontSize:'12px', cursor:'pointer', fontWeight:'500', opacity:(!newName.trim()||!newContent.trim()||busy)?0.45:1}}>
              {busy ? 'Menyimpan...' : 'Simpan ke .claude/skills/'}
            </button>
          </div>
        )}

        {/* Skill list */}
        <div style={{flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'6px'}}>
          {skills.length === 0 && (
            <div style={{color:textMute, fontSize:'12px', padding:'8px 0'}}>
              Belum ada skill.<br/>Upload .md atau ketik <code style={{color:accent}}>/init</code> untuk generate dari project ini.
            </div>
          )}
          {skills.map(s => (
            <div key={s.name} style={{
              padding:'10px 12px', borderRadius:'8px', display:'flex', alignItems:'center', gap:'10px',
              background: s.active ? accentBg : bg3,
              border: '1px solid ' + (s.active ? accentBorder : border),
            }}>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:'13px', fontWeight:'500', color: s.active ? accent : textMute, marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {s.name}
                </div>
                <div style={{fontSize:'10px', color:textMute, fontFamily:'monospace'}}>
                  {Math.round((s.content||'').length/100)/10}KB
                  {s.builtin ? ' · SKILL.md (root)' : ' · .claude/skills/'}
                  {!s.active && <span style={{color:textMute}}> · dimatikan</span>}
                </div>
              </div>

              {/* Delete — hanya non-builtin */}
              {!s.builtin && (
                <button onClick={()=>{ if(window.confirm('Hapus '+s.name+'?')) onRemove(s.name); }}
                  style={{background:'rgba(248,113,113,.07)', border:'1px solid rgba(248,113,113,.14)', borderRadius:'6px', padding:'4px 8px', color:'#f87171', fontSize:'10px', cursor:'pointer', flexShrink:0}}>
                  hapus
                </button>
              )}

              {/* Toggle */}
              <div onClick={()=>onToggle(s.name)}
                style={{width:'42px', height:'24px', borderRadius:'12px', background: s.active ? T.accent : 'rgba(255,255,255,.1)', cursor:'pointer', position:'relative', transition:'all .2s', flexShrink:0}}>
                <div style={{position:'absolute', top:'3px', left: s.active ? '21px' : '3px', width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'all .2s'}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{marginTop:'10px', fontSize:'10px', color:textMute, textAlign:'center'}}>
          Skill aktif otomatis di-inject ke context AI berdasarkan relevansi task
        </div>
      </div>
    </BottomSheet>
  );
}

// ── DeployPanel ───────────────────────────────────────────────────────────────
export function DeployPanel({ deployLog, loading, onDeploy, onClose, T }) {
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
  const bg2        = T?.bg2        || '#131108';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
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
export function McpPanel({ mcpTools, folder: _folder, onResult, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
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
export function GitHubPanel({ githubRepo, githubToken, githubData, onRepoChange, onTokenChange, onFetch, onAskYuyu, onClose, T }) {
  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const borderMed  = T?.borderMed  || 'rgba(255,255,255,.1)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
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
export function SessionsPanel({ sessions, onRestore, onClose, T }) {
  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
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
export function PermissionsPanel({ permissions, accentColor:_accentColor, onToggle, onReset, onClose, T }) {

  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
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
const BUILTIN_PLUGINS = [
  {id:'auto_commit',  name:'Auto Commit',   desc:'Commit otomatis setelah write_file', hookType:'postWrite', cmd:'cd {{context}} && git add -A && git commit -m "auto: yuyu save $(date +%H:%M)"'},
  {id:'lint_on_save', name:'Lint on Save',  desc:'ESLint check sebelum save',          hookType:'preWrite',  cmd:'cd {{context}} && npx eslint src --max-warnings 0 2>&1 | tail -5'},
  {id:'test_runner',  name:'Test Runner',   desc:'Jalankan tests setelah write',       hookType:'postWrite', cmd:'cd {{context}} && npm test -- --watchAll=false --passWithNoTests 2>&1 | tail -10'},
  {id:'auto_push',   name:'Git Auto Push', desc:'Push ke remote setelah commit',       hookType:'postWrite', cmd:'node yugit.cjs "auto push"'},
];
export function PluginsPanel({ activePlugins, folder, onToggle, onClose, T }) {
  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const success    = T?.success    || '#4ade80';
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
export function ConfigPanel({ effort, fontSize, theme, model, thinkingEnabled, models, onEffort, onFontSize, onTheme, onModel, onThinking, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.1)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.22)';
  const accent     = T?.accent     || '#a78bfa';
  const configs = [
    {label:'Effort Level', value:effort,         options:['low','medium','high'],      onChange:onEffort},
    {label:'Font Size',    value:String(fontSize), options:['12','13','14','15','16'], onChange:v=>onFontSize(parseInt(v))},
    {label:'Theme',        value:theme,            options:['obsidian','aurora','ink','neon'], onChange:onTheme},
    {label:'Model',        value:model,            options:models.map(m=>m.id),        onChange:onModel},
  ];
  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'16px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}>Config</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'12px'}}>
          {configs.map(cfg=>(
            <div key={cfg.label} style={{padding:'10px 12px',background:bg3,border:'1px solid '+border,borderRadius:'8px'}}>
              <div style={{fontSize:'11px',color:textMute,marginBottom:'6px'}}>{cfg.label}</div>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                {cfg.options.map(opt=>(
                  <button key={opt} onClick={()=>cfg.onChange(opt)} style={{background:cfg.value===opt?accentBg:bg3,border:'1px solid '+(cfg.value===opt?accentBorder:border),borderRadius:'6px',padding:'4px 10px',color:cfg.value===opt?accent:textMute,fontSize:'11px',cursor:'pointer',fontFamily:'monospace'}}>
                    {opt.length>20?opt.slice(0,20)+'…':opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{padding:'10px 12px',background:bg3,border:'1px solid '+border,borderRadius:'8px'}}>
            <div style={{fontSize:'11px',color:textMute,marginBottom:'6px'}}>Extended Thinking</div>
            <button onClick={onThinking} style={{background:thinkingEnabled?accentBg:bg3,border:'1px solid '+(thinkingEnabled?accentBorder:border),borderRadius:'6px',padding:'4px 10px',color:thinkingEnabled?accent:textMute,fontSize:'11px',cursor:'pointer'}}>
              {thinkingEnabled?'✓ ON':'○ OFF'}
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

// ── BgAgentPanel — live progress tracking ────────────────────────────────────
// ── ElapsedTime — isolated so Date.now() stays out of parent render ──────────
function ElapsedTime({ startedAt }) {
  const [now, setNow] = React.useState(() => Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const elapsed = Math.round((now - startedAt) / 1000);
  return <span>{elapsed > 60 ? Math.floor(elapsed/60) + 'm' : elapsed + 's'}</span>;
}

export function BgAgentPanel({ agents, onMerge, onAbort, onClose, T }) {

  const bg3        = T?.bg3        || 'rgba(255,255,255,.04)';
  const border     = T?.border     || 'rgba(255,255,255,.06)';
  const text       = T?.text       || '#f0f0f0';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const bg2        = T?.bg2        || '#131108';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.55)';
  const statusColor = { preparing:'#fbbf24', running:'#60a5fa', done:'#4ade80', error:'#f87171', aborted:'rgba(255,255,255,.3)', merged:'rgba(255,255,255,.2)', conflict:'#f97316' };
  const statusIcon  = { preparing:'…', running:'↻', done:'✓', error:'✗', aborted:'⏹', merged:'⇄', conflict:'!' };

  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}>Background Agents</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        {agents.length === 0 && (
          <div style={{color:textMute,fontSize:'12px',padding:'8px 0'}}>
            Tidak ada agent aktif. Jalankan dengan <code style={{color:accent}}>/bg &lt;task&gt;</code>
          </div>
        )}
        <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'8px'}}>
          {agents.map(agent => {
            const color = statusColor[agent.status] || '#f0f0f0';
            const icon  = statusIcon[agent.status]  || '?';
            return (
              <div key={agent.id} style={{padding:'12px',background:bg3,border:'1px solid '+border,borderRadius:'10px'}}>
                {/* Header row */}
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                  <span style={{fontSize:'13px'}}>{icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'12px',color:text,fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{agent.task}</div>
                    <div style={{fontSize:'10px',color:textMute,fontFamily:'monospace',marginTop:'1px'}}>
                      {agent.id.slice(-8)} · <ElapsedTime startedAt={agent.startedAt}/> · branch: {agent.branch?.slice(-12)}
                    </div>
                  </div>
                  <span style={{fontSize:'11px',color,fontWeight:'600',textTransform:'uppercase',letterSpacing:'.04em'}}>{agent.status}</span>
                </div>

                {/* Progress bar for running */}
                {agent.status === 'running' && (
                  <div style={{height:'2px',background:bg3,borderRadius:'2px',marginBottom:'8px',overflow:'hidden'}}>
                    <div style={{height:'100%',background:'#60a5fa',borderRadius:'2px',animation:'pulse 1.5s ease-in-out infinite',width:'60%'}}/>
                  </div>
                )}

                {/* Log — last 4 entries */}
                {agent.log?.length > 0 && (
                  <div style={{background:bg2,borderRadius:'6px',padding:'6px 8px',marginBottom:'8px',maxHeight:'80px',overflowY:'auto'}}>
                    {agent.log.slice(-4).map((l,i) => (
                      <div key={i} style={{fontSize:'10px',color:textSec,fontFamily:'monospace',lineHeight:'1.6'}}>{l}</div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{display:'flex',gap:'6px'}}>
                  {agent.status === 'done' && (
                    <button onClick={()=>onMerge(agent.id)} style={{flex:1,background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'7px',padding:'6px',color:'#4ade80',fontSize:'11px',cursor:'pointer',fontWeight:'500'}}>
                      🔀 Merge ({agent.result?.allWrites?.length || 0} file)
                    </button>
                  )}
                  {agent.status === 'conflict' && (
                    <button onClick={()=>onMerge(agent.id)} style={{flex:1,background:'rgba(249,115,22,.1)',border:'1px solid rgba(249,115,22,.2)',borderRadius:'7px',padding:'6px',color:'#f97316',fontSize:'11px',cursor:'pointer',fontWeight:'500'}}>
                      ⚠️ Resolve Conflict
                    </button>
                  )}
                  {['preparing','running'].includes(agent.status) && (
                    <button onClick={()=>onAbort(agent.id)} style={{background:'rgba(248,113,113,.07)',border:'1px solid rgba(248,113,113,.14)',borderRadius:'7px',padding:'6px 10px',color:'#f87171',fontSize:'11px',cursor:'pointer'}}>
                      ⏹ Abort
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
