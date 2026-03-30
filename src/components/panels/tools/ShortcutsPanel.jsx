import React from "react";
import { X } from 'lucide-react';
import { BottomSheet } from '../panels.base.jsx';
import { resolveTheme } from '../themeUtils.js';

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
