import React, { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { Bookmark, X, Save } from 'lucide-react';
import { BottomSheet } from '../../panels.base.jsx';
import { resolveTheme } from '../../themeUtils.js';

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
