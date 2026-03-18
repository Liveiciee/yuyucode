import React, { useState, useEffect } from "react";
import { callServer } from '../api.js';
import { getFileIcon } from '../utils.js';

export function FileTree({ folder, onSelectFile, selectedFile }) {
  const [tree, setTree] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [creating, setCreating] = useState(null);
  const [newName, setNewName] = useState('');

  async function load() {
    if (!folder) return;
    setLoading(true);
    const r = await callServer({ type:'list', path:folder });
    if (r.ok && Array.isArray(r.data)) setTree(r.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [folder]);

  async function toggleDir(fullPath) {
    if (expanded[fullPath]) { setExpanded(e => ({ ...e, [fullPath]:null })); return; }
    const r = await callServer({ type:'list', path:fullPath });
    if (r.ok && Array.isArray(r.data)) setExpanded(e => ({ ...e, [fullPath]:r.data }));
  }

  async function doRename(oldPath) {
    if (!newName.trim()) { setRenaming(null); return; }
    const parentPath = oldPath.split('/').slice(0,-1).join('/');
    const newPath = parentPath + '/' + newName.trim();
    await callServer({type:'exec', path:folder, command:`mv "${oldPath}" "${newPath}"`});
    setRenaming(null); setNewName(''); load();
  }

  async function doCreate(parentPath) {
    if (!newName.trim()) { setCreating(null); return; }
    const newPath = parentPath + '/' + newName.trim();
    if (creating.isDir) {
      await callServer({type:'exec', path:folder, command:`mkdir -p "${newPath}"`});
    } else {
      await callServer({type:'write', path:newPath, content:''});
    }
    setCreating(null); setNewName(''); load();
    if (!creating.isDir) onSelectFile(newPath);
  }

  async function doDelete(path) {
    await callServer({type:'exec', path:folder, command:`rm -rf "${path}"`});
    setCtxMenu(null); load();
  }

  function renderItems(items, basePath, depth) {
    const skip = ['node_modules','.git','dist','.gradle','build'];
    return [...items]
      .sort((a,b) => (a.isDir&&!b.isDir)?-1:(!a.isDir&&b.isDir)?1:a.name.localeCompare(b.name))
      .filter(item => !skip.includes(item.name))
      .map(item => {
        const fullPath = basePath + '/' + item.name;
        const isSelected = selectedFile === fullPath;
        const isExp = expanded[fullPath];
        return (
          <div key={item.name}>
            {renaming === fullPath ? (
              <div style={{padding:'2px 6px 2px '+(8+depth*12)+'px',display:'flex',gap:'4px'}}>
                <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')doRename(fullPath);if(e.key==='Escape'){setRenaming(null);setNewName('');}}}
                  style={{flex:1,background:'rgba(255,255,255,.1)',border:'1px solid rgba(124,58,237,.4)',borderRadius:'3px',padding:'1px 5px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace'}}/>
              </div>
            ) : (
              <div onClick={() => item.isDir ? toggleDir(fullPath) : onSelectFile(fullPath)}
                onContextMenu={e=>{e.preventDefault();setCtxMenu({path:fullPath,isDir:item.isDir,x:e.clientX,y:e.clientY});}}
                style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 6px 3px '+(8+depth*12)+'px', cursor:'pointer', borderRadius:'4px', background:isSelected?'rgba(124,58,237,.2)':'transparent', color:isSelected?'#a78bfa':item.isDir?'rgba(255,255,255,.7)':'rgba(255,255,255,.55)', fontSize:'12px', userSelect:'none' }}
                onMouseEnter={e => !isSelected&&(e.currentTarget.style.background='rgba(255,255,255,.04)')}
                onMouseLeave={e => !isSelected&&(e.currentTarget.style.background=isSelected?'rgba(124,58,237,.2)':'transparent')}>
                <span style={{fontSize:'9px',flexShrink:0,width:'10px'}}>{item.isDir?(isExp?'▾':'▸'):''}</span>
                <span style={{fontSize:'11px',flexShrink:0}}>{item.isDir?'📁':getFileIcon(item.name)}</span>
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</span>
              </div>
            )}
            {item.isDir && isExp && renderItems(isExp, fullPath, depth+1)}
            {creating && creating.parentPath === fullPath && (
              <div style={{padding:'2px 6px 2px '+(8+(depth+1)*12)+'px',display:'flex',gap:'4px'}}>
                <span style={{fontSize:'11px'}}>{creating.isDir?'📁':'📄'}</span>
                <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} placeholder={creating.isDir?'folder name':'file name'}
                  onKeyDown={e=>{if(e.key==='Enter')doCreate(fullPath);if(e.key==='Escape'){setCreating(null);setNewName('');}}}
                  style={{flex:1,background:'rgba(255,255,255,.1)',border:'1px solid rgba(74,222,128,.4)',borderRadius:'3px',padding:'1px 5px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace'}}/>
              </div>
            )}
          </div>
        );
      });
  }

  return (
    <div style={{height:'100%',overflowY:'auto',padding:'4px 0',position:'relative'}} onClick={()=>ctxMenu&&setCtxMenu(null)}>
      <div style={{padding:'3px 8px',display:'flex',gap:'4px',borderBottom:'1px solid rgba(255,255,255,.04)',marginBottom:'2px'}}>
        <button onClick={()=>{setCreating({parentPath:folder,isDir:false});setNewName('');}} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:'11px',cursor:'pointer',padding:'1px 4px'}}>+ file</button>
        <button onClick={()=>{setCreating({parentPath:folder,isDir:true});setNewName('');}} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:'11px',cursor:'pointer',padding:'1px 4px'}}>+ folder</button>
        <button onClick={load} style={{background:'none',border:'none',color:'rgba(255,255,255,.2)',fontSize:'10px',cursor:'pointer',padding:'1px 4px',marginLeft:'auto'}}>↺</button>
      </div>
      {creating && creating.parentPath === folder && (
        <div style={{padding:'2px 8px',display:'flex',gap:'4px',alignItems:'center'}}>
          <span style={{fontSize:'11px'}}>{creating.isDir?'📁':'📄'}</span>
          <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} placeholder={creating.isDir?'folder name':'file name'}
            onKeyDown={e=>{if(e.key==='Enter')doCreate(folder);if(e.key==='Escape'){setCreating(null);setNewName('');}}}
            style={{flex:1,background:'rgba(255,255,255,.1)',border:'1px solid rgba(74,222,128,.4)',borderRadius:'3px',padding:'2px 6px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace'}}/>
        </div>
      )}
      {loading && <div style={{padding:'8px 12px',fontSize:'11px',color:'rgba(255,255,255,.3)'}}>Loading...</div>}
      {tree && renderItems(tree, folder, 0)}
      {ctxMenu && (
        <div style={{position:'fixed',top:ctxMenu.y,left:ctxMenu.x,background:'#1a1a1e',border:'1px solid rgba(255,255,255,.12)',borderRadius:'8px',padding:'4px',zIndex:999,minWidth:'140px',boxShadow:'0 8px 24px rgba(0,0,0,.5)'}}>
          {ctxMenu.isDir&&<div onClick={()=>{setCreating({parentPath:ctxMenu.path,isDir:false});setNewName('');setCtxMenu(null);}} style={{padding:'6px 12px',fontSize:'12px',color:'rgba(255,255,255,.7)',cursor:'pointer',borderRadius:'4px'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>📄 New file</div>}
          {ctxMenu.isDir&&<div onClick={()=>{setCreating({parentPath:ctxMenu.path,isDir:true});setNewName('');setCtxMenu(null);}} style={{padding:'6px 12px',fontSize:'12px',color:'rgba(255,255,255,.7)',cursor:'pointer',borderRadius:'4px'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>📁 New folder</div>}
          <div onClick={()=>{setRenaming(ctxMenu.path);setNewName(ctxMenu.path.split('/').pop());setCtxMenu(null);}} style={{padding:'6px 12px',fontSize:'12px',color:'rgba(255,255,255,.7)',cursor:'pointer',borderRadius:'4px'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>✏️ Rename</div>
          <div onClick={()=>doDelete(ctxMenu.path)} style={{padding:'6px 12px',fontSize:'12px',color:'#f87171',cursor:'pointer',borderRadius:'4px'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(248,113,113,.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>🗑 Delete</div>
        </div>
      )}
    </div>
  );
}
