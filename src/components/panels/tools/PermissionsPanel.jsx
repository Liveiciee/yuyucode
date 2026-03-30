import React from "react";
import { Shield, X } from 'lucide-react';
import { BottomSheet } from '../../panels.base.jsx';
import { resolveTheme } from '../../themeUtils.js';

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
