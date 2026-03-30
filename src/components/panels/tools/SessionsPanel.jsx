import React from "react";
import { Save, X } from 'lucide-react';
import { BottomSheet } from '../panels.base.jsx';
import { resolveTheme } from '../themeUtils.js';

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
