import React from "react";
import { X, Check } from 'lucide-react';
import { BottomSheet } from '../../panels.base.jsx';
import { resolveTheme } from '../../themeUtils.js';

export function ThemeBuilder({ onClose, themeKey, themesMap, themeKeys, onTheme, T }) {
  const { bg3, border, borderMed, text, textMute } = resolveTheme(T);
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
