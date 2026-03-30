import React from "react";
import { X } from 'lucide-react';
import { BottomSheet } from '../panels.base.jsx';
import { resolveTheme } from '../themeUtils.js';

export function McpPanel({ mcpTools, folder: _folder, onResult, onClose, T }) {
  const { bg3, text, textMute } = resolveTheme(T);
  const defaultTools = [['git',['status','log','diff']],['fetch',['browse']],['sqlite',['tables']],['github',['issues','pulls']],['system',['disk','memory']],['filesystem',['list']]];
  const entries = Object.keys(mcpTools).length > 0 ? Object.entries(mcpTools) : defaultTools;
  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}>MCP Tools</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        {Object.keys(mcpTools).length === 0 && (
          <div style={{color:textMute,fontSize:'12px',padding:'8px 0'}}>Tidak ada MCP tools terdeteksi dari server.<br/>Pastikan yuyu-server.cjs sudah jalan.</div>
        )}
        {entries.map(([tool, actions])=>(
          <div key={tool} style={{padding:'10px 12px',marginBottom:'6px',background:bg3,border:'1px solid rgba(74,222,128,.1)',borderRadius:'8px'}}>
            <span style={{fontSize:'13px',color:'#4ade80',fontFamily:'monospace',fontWeight:'600'}}>{tool}</span>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'6px'}}>
              {(Array.isArray(actions)?actions:Object.keys(actions)).map(act=>(
                <button key={act} onClick={()=>onResult(tool,act)}
                  style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'4px',padding:'2px 8px',color:'rgba(74,222,128,.8)',fontSize:'10px',cursor:'pointer',fontFamily:'monospace'}}>{act}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
