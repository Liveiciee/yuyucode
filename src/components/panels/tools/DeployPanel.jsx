import React from "react";
import { X } from 'lucide-react';
import { BottomSheet } from '../../panels.base.jsx';
import { resolveTheme } from '../../themeUtils.js';

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
