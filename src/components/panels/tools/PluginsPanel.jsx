import React from "react";
import { Plug, X } from 'lucide-react';
import { BottomSheet } from '../../panels.base.jsx';
import { resolveTheme } from '../../themeUtils.js';

const BUILTIN_PLUGINS = [
  {id:'auto_commit',  name:'Auto Commit',   desc:'Commit otomatis setelah write_file', hookType:'postWrite', cmd:'cd {{context}} && git add -A && git commit -m "auto: yuyu save $(date +%H:%M)"'},
  {id:'lint_on_save', name:'Lint on Save',  desc:'ESLint check sebelum save',          hookType:'preWrite',  cmd:'cd {{context}} && npx eslint src --max-warnings 0 2>&1 | tail -5'},
  {id:'test_runner',  name:'Test Runner',   desc:'Jalankan tests setelah write',       hookType:'postWrite', cmd:'cd {{context}} && npm test -- --watchAll=false --passWithNoTests 2>&1 | tail -10'},
  {id:'auto_push',   name:'Git Auto Push', desc:'Push ke remote setelah commit',       hookType:'postWrite', cmd:'node yugit.cjs "auto push"'},
];
export function PluginsPanel({ activePlugins, folder, onToggle, onClose, T }) {
  const { bg3, border, text, textMute, success } = resolveTheme(T);
  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}><Plug size={14}/> Plugin Marketplace</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        {BUILTIN_PLUGINS.map(p=>{
          const isActive=!!activePlugins[p.id];
          return (
            <div key={p.id} style={{padding:'10px 12px',marginBottom:'8px',background:isActive?'rgba(74,222,128,.04)':bg3,border:'1px solid '+(isActive?'rgba(74,222,128,.18)':border),borderRadius:'8px',display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',color:isActive?success:text,fontWeight:'500',marginBottom:'2px'}}>{p.name}</div>
                <div style={{fontSize:'11px',color:textMute,marginBottom:'3px'}}>{p.desc}</div>
                <div style={{fontSize:'9px',color:textMute,fontFamily:'monospace'}}>{p.hookType}</div>
              </div>
              <div onClick={()=>onToggle(p,isActive,folder)} style={{width:'42px',height:'24px',borderRadius:'12px',background:isActive?'#4ade80':'rgba(255,255,255,.1)',cursor:'pointer',position:'relative',transition:'all .2s',flexShrink:0}}>
                <div style={{position:'absolute',top:'3px',left:isActive?'21px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'white',transition:'all .2s'}}/>
              </div>
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}
