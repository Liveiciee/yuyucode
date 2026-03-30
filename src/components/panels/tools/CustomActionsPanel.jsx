import React, { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { Zap, X, Save } from 'lucide-react';
import { BottomSheet } from '../panels.base.jsx';
import { resolveTheme } from '../themeUtils.js';

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
