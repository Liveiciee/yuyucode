import React from "react";
import { X, List, GitMerge } from 'lucide-react';
import { BottomSheet } from '../../panels.base.jsx';
import { resolveTheme } from '../../themeUtils.js';

export function GitHubPanel({ githubRepo, githubToken, githubData, onRepoChange, onTokenChange, onFetch, onAskYuyu, onClose, T }) {
  const { bg3, border, borderMed, text, textMute, accent, accentBg, accentBorder } = resolveTheme(T);
  return (
    <BottomSheet onClose={onClose}>
      <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'600',color:text,flex:1}}>⑂ GitHub</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'16px',cursor:'pointer'}}><X size={16}/></button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'12px'}}>
          <input value={githubRepo} onChange={e=>onRepoChange(e.target.value)} placeholder="owner/repo" style={{background:bg3,border:'1px solid '+borderMed,borderRadius:'6px',padding:'7px 10px',color:text,fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <input value={githubToken} onChange={e=>onTokenChange(e.target.value)} placeholder="GitHub token" type="password" style={{background:bg3,border:'1px solid '+borderMed,borderRadius:'6px',padding:'7px 10px',color:text,fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <div style={{display:'flex',gap:'6px'}}>
            <button onClick={()=>onFetch('issues')} style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:'6px',padding:'5px 12px',color:'#818cf8',fontSize:'11px',cursor:'pointer',flex:1}}><List size={13}/> Issues</button>
            <button onClick={()=>onFetch('pulls')} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'6px',padding:'5px 12px',color:'#4ade80',fontSize:'11px',cursor:'pointer',flex:1}}><GitMerge size={13}/> PRs</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {githubData&&Array.isArray(githubData.data)&&githubData.data.map((item,i)=>(
            <div key={i} style={{padding:'8px 10px',marginBottom:'4px',background:bg3,border:'1px solid '+border,borderRadius:'7px'}}>
              <div style={{fontSize:'12px',color:text,marginBottom:'2px'}}>#{item.number} {item.title}</div>
              <div style={{fontSize:'10px',color:textMute}}>{item.state} · {item.user?.login}</div>
              <button onClick={()=>onAskYuyu(item)} style={{background:accentBg,border:'1px solid '+accentBorder,borderRadius:'4px',padding:'2px 7px',color:accent,fontSize:'10px',cursor:'pointer',marginTop:'4px'}}>Ask Yuyu</button>
            </div>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
