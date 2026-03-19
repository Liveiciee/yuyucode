import {
  Folder, FolderOpen, File, FilePlus, FolderPlus, RotateCcw, Pencil, Trash2,
  FileCode, FileJson, FileText, Image, Coffee, Braces, Globe, Settings,
  Package, GitBranch, Database, Film, Music, Archive, Shield, Terminal,
  Layers, Cpu, Hash,
} from 'lucide-react';
import React, { useState, useEffect } from "react";
import { callServer } from '../api.js';

function getFileIconData(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  const base = name.toLowerCase();
  const specials = {
    'package.json':      { icon:Package,   color:'#f97316' },
    'package-lock.json': { icon:Package,   color:'rgba(249,115,22,.45)' },
    '.gitignore':        { icon:GitBranch, color:'rgba(255,255,255,.4)' },
    '.gitattributes':    { icon:GitBranch, color:'rgba(255,255,255,.4)' },
    'readme.md':         { icon:FileText,  color:'#60a5fa' },
    'dockerfile':        { icon:Layers,    color:'#38bdf8' },
    '.env':              { icon:Shield,    color:'#fbbf24' },
    '.env.local':        { icon:Shield,    color:'#fbbf24' },
    '.env.example':      { icon:Shield,    color:'rgba(251,191,36,.5)' },
    'vite.config.js':    { icon:Cpu,       color:'#a78bfa' },
    'vite.config.ts':    { icon:Cpu,       color:'#a78bfa' },
    'eslint.config.js':  { icon:Settings,  color:'#818cf8' },
    '.eslintrc':         { icon:Settings,  color:'#818cf8' },
    'tsconfig.json':     { icon:Settings,  color:'#3b82f6' },
    'capacitor.config.json':{ icon:Settings,color:'#22d3ee' },
  };
  if (specials[base]) return specials[base];
  const map = {
    jsx:{icon:Braces,  color:'#61dafb'}, tsx:{icon:Braces, color:'#3178c6'},
    js: {icon:FileCode,color:'#f0db4f'}, mjs:{icon:FileCode,color:'#f0db4f'}, cjs:{icon:FileCode,color:'#f0db4f'},
    ts: {icon:FileCode,color:'#3178c6'},
    json:{icon:FileJson,color:'#4ade80'},
    md: {icon:FileText,color:'#93c5fd'}, mdx:{icon:FileText,color:'#93c5fd'},
    txt:{icon:FileText,color:'rgba(255,255,255,.45)'},
    css:{icon:Hash,  color:'#e879f9'}, scss:{icon:Hash,color:'#cc6699'}, sass:{icon:Hash,color:'#cc6699'}, less:{icon:Hash,color:'#1d365d'},
    html:{icon:Globe,color:'#f97316'}, htm:{icon:Globe,color:'#f97316'},
    svg:{icon:Image, color:'#facc15'},
    png:{icon:Image, color:'#fb923c'}, jpg:{icon:Image,color:'#fb923c'}, jpeg:{icon:Image,color:'#fb923c'},
    gif:{icon:Image, color:'#fb923c'}, webp:{icon:Image,color:'#fb923c'}, ico:{icon:Image,color:'#fb923c'},
    py: {icon:Coffee,color:'#3b82f6'}, rb:{icon:Coffee,color:'#dc2626'}, go:{icon:Coffee,color:'#00add8'},
    rs: {icon:Coffee,color:'#b7410e'}, java:{icon:Coffee,color:'#f89820'}, kt:{icon:Coffee,color:'#7f52ff'},
    swift:{icon:Coffee,color:'#f05138'}, php:{icon:Coffee,color:'#777bb4'},
    sh: {icon:Terminal,color:'#4ade80'}, bash:{icon:Terminal,color:'#4ade80'}, zsh:{icon:Terminal,color:'#4ade80'},
    sql:{icon:Database,color:'#06b6d4'}, db:{icon:Database,color:'#06b6d4'}, sqlite:{icon:Database,color:'#06b6d4'},
    yml:{icon:Settings,color:'#fbbf24'}, yaml:{icon:Settings,color:'#fbbf24'},
    toml:{icon:Settings,color:'#9ca3af'}, ini:{icon:Settings,color:'#9ca3af'},
    mp4:{icon:Film,  color:'#f472b6'}, mov:{icon:Film, color:'#f472b6'},
    mp3:{icon:Music, color:'#34d399'}, wav:{icon:Music,color:'#34d399'},
    zip:{icon:Archive,color:'#a78bfa'}, tar:{icon:Archive,color:'#a78bfa'}, gz:{icon:Archive,color:'#a78bfa'},
  };
  return map[ext] || { icon:File, color:'rgba(255,255,255,.35)' };
}

function FileIcon({ name, size=13 }) {
  const { icon:Icon, color } = getFileIconData(name);
  return <Icon size={size} style={{ color, flexShrink:0 }}/>;
}

export function FileTree({ folder, onSelectFile, selectedFile, T }) {
  const [tree, setTree]         = useState(null);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading]   = useState(false);
  const [ctxMenu, setCtxMenu]   = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [creating, setCreating] = useState(null);
  const [newName, setNewName]   = useState('');

  // ── Theme tokens ──
  const bg2        = T?.bg2        || '#111116';
  const bg3        = T?.bg3        || 'rgba(255,255,255,.03)';
  const border     = T?.border     || 'rgba(255,255,255,.07)';
  const text       = T?.text       || 'rgba(255,255,255,.82)';
  const textSec    = T?.textSec    || 'rgba(255,255,255,.6)';
  const textMute   = T?.textMute   || 'rgba(255,255,255,.3)';
  const accent     = T?.accent     || '#a78bfa';
  const accentBg   = T?.accentBg   || 'rgba(124,58,237,.18)';
  const success    = T?.success    || '#4ade80';
  const error      = T?.error      || '#f87171';
  const errorBg    = T?.errorBg    || 'rgba(248,113,113,.06)';

  const fxSelected  = T?.fx?.glowBorder?.(accent, .8) || {};
  const fxUserBubble= T?.fx?.userBubble?.() || {};

  async function load() {
    if (!folder) return;
    setLoading(true);
    const r = await callServer({type:'list',path:folder});
    if (r.ok && Array.isArray(r.data)) setTree(r.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [folder]);

  async function toggleDir(fullPath) {
    if (expanded[fullPath]) { setExpanded(e=>({...e,[fullPath]:null})); return; }
    const r = await callServer({type:'list',path:fullPath});
    if (r.ok && Array.isArray(r.data)) setExpanded(e=>({...e,[fullPath]:r.data}));
  }

  async function doRename(oldPath) {
    if (!newName.trim()) { setRenaming(null); return; }
    const parentPath = oldPath.split('/').slice(0,-1).join('/');
    await callServer({type:'exec',path:folder,command:`mv "${oldPath}" "${parentPath}/${newName.trim()}"`});
    setRenaming(null); setNewName(''); load();
  }

  async function doCreate(parentPath) {
    if (!newName.trim()) { setCreating(null); return; }
    const newPath = parentPath+'/'+newName.trim();
    if (creating.isDir) await callServer({type:'exec',path:folder,command:`mkdir -p "${newPath}"`});
    else { await callServer({type:'write',path:newPath,content:''}); }
    setCreating(null); setNewName(''); load();
    if (!creating.isDir) onSelectFile(newPath);
  }

  async function doDelete(path) {
    await callServer({type:'exec',path:folder,command:`rm -rf "${path}"`});
    setCtxMenu(null); load();
  }

  const inputStyle = (borderColor) => ({
    flex:1, background:bg3, border:'1px solid '+borderColor, borderRadius:'4px',
    padding:'2px 6px', color:text, fontSize:'12px', outline:'none', fontFamily:'monospace',
  });

  function renderItems(items, basePath, depth) {
    const skip = ['node_modules','.git','dist','.gradle','build'];
    return [...items]
      .sort((a,b)=>(a.isDir&&!b.isDir)?-1:(!a.isDir&&b.isDir)?1:a.name.localeCompare(b.name))
      .filter(item=>!skip.includes(item.name))
      .map(item=>{
        const fullPath = basePath+'/'+item.name;
        const isSelected = selectedFile===fullPath;
        const isExp = expanded[fullPath];
        const indent = 8+depth*14;
        return (
          <div key={item.name}>
            {renaming===fullPath?(
              <div style={{padding:`2px 6px 2px ${indent}px`,display:'flex',gap:'4px',alignItems:'center'}}>
                <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')doRename(fullPath);if(e.key==='Escape'){setRenaming(null);setNewName('');}}}
                  style={inputStyle(accent+'66')}/>
              </div>
            ):(
              <div
                onClick={()=>item.isDir?toggleDir(fullPath):onSelectFile(fullPath)}
                onContextMenu={e=>{e.preventDefault();setCtxMenu({path:fullPath,isDir:item.isDir,x:e.clientX,y:e.clientY});}}
                style={{display:'flex',alignItems:'center',gap:'6px',padding:`3px 8px 3px ${indent}px`,cursor:'pointer',borderRadius:'4px',background:isSelected?accentBg:'transparent',userSelect:'none',transition:'background .1s',...(isSelected?fxSelected:{})}}
                onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background=bg3;}}
                onMouseLeave={e=>{e.currentTarget.style.background=isSelected?accentBg:'transparent';}}
              >
                <span style={{width:'10px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',color:textMute,fontSize:'9px',transition:'transform .15s',transform:item.isDir&&isExp?'rotate(90deg)':'rotate(0deg)'}}>
                  {item.isDir?'▶':''}
                </span>
                {item.isDir
                  ?<span style={{display:'flex',flexShrink:0}}>{isExp?<FolderOpen size={13} style={{color:'#fbbf24'}}/>:<Folder size={13} style={{color:'#fbbf24'}}/>}</span>
                  :<FileIcon name={item.name} size={13}/>
                }
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:'12.5px',color:isSelected?accent:item.isDir?text:textSec,fontWeight:item.isDir?'500':'400'}}>
                  {item.name}
                </span>
              </div>
            )}
            {item.isDir&&isExp&&renderItems(isExp,fullPath,depth+1)}
            {creating&&creating.parentPath===fullPath&&(
              <div style={{padding:`2px 6px 2px ${8+(depth+1)*14}px`,display:'flex',gap:'6px',alignItems:'center'}}>
                {creating.isDir?<Folder size={12} style={{color:'#fbbf24',flexShrink:0}}/>:<File size={12} style={{color:textMute,flexShrink:0}}/>}
                <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)}
                  placeholder={creating.isDir?'folder name':'file name'}
                  onKeyDown={e=>{if(e.key==='Enter')doCreate(fullPath);if(e.key==='Escape'){setCreating(null);setNewName('');}}}
                  style={inputStyle(success+'66')}/>
              </div>
            )}
          </div>
        );
      });
  }

  const iconBtn = (onClick, title, children) => (
    <button onClick={onClick} title={title}
      style={{background:'none',border:'none',color:textMute,cursor:'pointer',padding:'4px 6px',borderRadius:'5px',display:'flex',alignItems:'center'}}
      onMouseEnter={e=>e.currentTarget.style.background=bg3}
      onMouseLeave={e=>e.currentTarget.style.background='none'}>
      {children}
    </button>
  );

  const ctxItem = (onClick, color, children) => (
    <div onClick={onClick}
      style={{padding:'7px 12px',fontSize:'12.5px',color:color||textSec,cursor:'pointer',borderRadius:'6px',display:'flex',alignItems:'center',gap:'8px'}}
      onMouseEnter={e=>e.currentTarget.style.background=color===error?errorBg:bg3}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      {children}
    </div>
  );

  return (
    <div style={{height:'100%',overflowY:'auto',padding:'4px 0',position:'relative'}} onClick={()=>ctxMenu&&setCtxMenu(null)}>
      <div style={{padding:'4px 10px',display:'flex',gap:'2px',borderBottom:'1px solid '+border,marginBottom:'4px',alignItems:'center'}}>
        {iconBtn(()=>{setCreating({parentPath:folder,isDir:false});setNewName('');},'New file',<FilePlus size={13}/>)}
        {iconBtn(()=>{setCreating({parentPath:folder,isDir:true});setNewName('');},'New folder',<FolderPlus size={13}/>)}
        <div style={{marginLeft:'auto'}}>
          {iconBtn(load,'Refresh',<RotateCcw size={11}/>)}
        </div>
      </div>

      {creating&&creating.parentPath===folder&&(
        <div style={{padding:'3px 10px',display:'flex',gap:'6px',alignItems:'center',marginBottom:'2px'}}>
          {creating.isDir?<Folder size={12} style={{color:'#fbbf24',flexShrink:0}}/>:<File size={12} style={{color:textMute,flexShrink:0}}/>}
          <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)}
            placeholder={creating.isDir?'folder name':'file name'}
            onKeyDown={e=>{if(e.key==='Enter')doCreate(folder);if(e.key==='Escape'){setCreating(null);setNewName('');}}}
            style={inputStyle(success+'66')}/>
        </div>
      )}

      {loading&&<div style={{padding:'10px 14px',fontSize:'11.5px',color:textMute}}>Loading…</div>}
      {tree&&renderItems(tree,folder,0)}

      {ctxMenu&&(
        <div style={{position:'fixed',top:ctxMenu.y,left:ctxMenu.x,background:bg2,border:'1px solid '+border,borderRadius:'10px',padding:'4px',zIndex:999,minWidth:'150px',boxShadow:'0 10px 30px rgba(0,0,0,.6)',overflow:'hidden'}}>
          {ctxMenu.isDir&&(
            <>
              {ctxItem(()=>{setCreating({parentPath:ctxMenu.path,isDir:false});setNewName('');setCtxMenu(null);},'',<><File size={12}/> New file</>)}
              {ctxItem(()=>{setCreating({parentPath:ctxMenu.path,isDir:true});setNewName('');setCtxMenu(null);},'',<><Folder size={12}/> New folder</>)}
            </>
          )}
          {ctxItem(()=>{setRenaming(ctxMenu.path);setNewName(ctxMenu.path.split('/').pop());setCtxMenu(null);},'',<><Pencil size={12}/> Rename</>)}
          <div style={{height:'1px',background:border,margin:'3px 8px'}}/>
          {ctxItem(()=>doDelete(ctxMenu.path),error,<><Trash2 size={12}/> Delete</>)}
        </div>
      )}
    </div>
  );
}
