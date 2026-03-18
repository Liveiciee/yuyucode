import React, { useState } from "react";
import { callServer } from '../api.js';

export function SearchBar({ folder, onSelectFile, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  async function doSearch() {
    if (!query.trim()) return;
    setSearching(true);
    const r = await callServer({ type:'search', path:folder, content:query });
    if (r.ok) setResults((r.data||'').split('\n').filter(Boolean));
    setSearching(false);
  }

  return (
    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.88)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
      <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
        <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()}
          placeholder="Cari di semua file..."
          style={{flex:1,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',borderRadius:'8px',padding:'8px 12px',color:'#f0f0f0',fontSize:'13px',outline:'none'}}/>
        <button onClick={doSearch} disabled={searching} style={{background:'#7c3aed',border:'none',borderRadius:'8px',padding:'8px 14px',color:'white',fontSize:'12px',cursor:'pointer'}}>{searching?'···':'🔍'}</button>
        <button onClick={onClose} style={{background:'rgba(255,255,255,.08)',border:'none',borderRadius:'8px',padding:'8px 12px',color:'rgba(255,255,255,.5)',fontSize:'14px',cursor:'pointer'}}>×</button>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        {results.length===0&&!searching&&query&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Tidak ada hasil</div>}
        {results.map((line,i)=>{
          const m=line.match(/^(.+?):(\d+):\s*(.*)/);
          if(!m) return null;
          const [,file,lineNum,content]=m;
          return (
            <div key={i} onClick={()=>{onSelectFile(folder+'/'+file);onClose();}}
              style={{padding:'8px 10px',borderRadius:'6px',cursor:'pointer',marginBottom:'2px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'}>
              <div style={{fontSize:'11px',color:'#a78bfa',fontFamily:'monospace',marginBottom:'2px'}}>{file}:{lineNum}</div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,.6)',fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{content.trim()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function UndoBar({ history, onUndo }) {
  if (!history||history.length===0) return null;
  return (
    <div style={{padding:'4px 12px',background:'rgba(251,191,36,.05)',borderBottom:'1px solid rgba(251,191,36,.1)',display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
      <span style={{fontSize:'11px',color:'rgba(251,191,36,.6)'}}>✏️ {history[history.length-1]?.path?.split('/').pop()} diubah</span>
      <button onClick={onUndo} style={{background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.2)',borderRadius:'5px',padding:'2px 8px',color:'rgba(251,191,36,.8)',fontSize:'10px',cursor:'pointer',marginLeft:'auto'}}>↩ Undo</button>
    </div>
  );
}
