// ── AppHeader ─────────────────────────────────────────────────────────────────
import React from 'react';
import { Menu, Command, FilePlus2, Check, Radio, AlertTriangle, RotateCcw } from 'lucide-react';
import { countTokens } from '../utils.js';
import { UndoBar } from './SearchBar.jsx';

export function AppHeader({ T, ui, project, file, chat, growth, saveFolder, undoLastEdit, haptic }) {
  return (
    <>
      {/* Session color strip */}
      {project.sessionColor&&<div style={{height:'2px',background:project.sessionColor,flexShrink:0}}/>}

      {/* HEADER — 48px */}
      <div style={{flexShrink:0,background:T.bg,borderBottom:'1px solid '+T.border}}>
        <div style={{height:'48px',padding:'0 10px',display:'flex',alignItems:'center',gap:'6px'}}>
          <button onClick={()=>ui.setShowSidebar(!ui.showSidebar)}
            style={{background:ui.showSidebar?T.accentBg:'none',border:'none',color:ui.showSidebar?T.accent:T.textMute,fontSize:'16px',cursor:'pointer',borderRadius:'10px',minWidth:'40px',minHeight:'40px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Menu size={16}/></button>

          <div style={{flex:1,cursor:'pointer',minWidth:0,overflow:'hidden',padding:'4px 6px',borderRadius:'10px'}}
            onClick={()=>ui.setShowFolder(!ui.showFolder)}>
            <div style={{fontSize:'13px',fontWeight:'700',color:T.text,letterSpacing:'-.3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',lineHeight:'1.2'}}>
              Yuyu<span style={{fontWeight:'400',opacity:.5}}>code</span>
            </div>
            <div style={{fontSize:'10px',color:T.textMute,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',lineHeight:'1.3',marginTop:'1px',display:'flex',alignItems:'center',gap:'5px'}}>
              <span style={{display:'inline-block',width:'5px',height:'5px',borderRadius:'50%',background:project.serverOk?T.success:T.error,flexShrink:0}}/>
              <span style={{fontFamily:'monospace'}}>{project.folder?.split('/').pop()||'no folder'}</span>
              <span style={{opacity:.5}}>⎇ {project.branch}</span>
              {project.skills?.some(s=>s.active)&&<span style={{color:T.success,fontSize:'9px',fontWeight:'700',letterSpacing:'.06em'}}>SKILL</span>}
            </div>
          </div>

          <button onClick={()=>{const lvls=['low','medium','high'];const i=lvls.indexOf(project.effort);project.setEffort(lvls[(i+1)%3]);}}
            style={{background:project.effort==='high'?T.errorBg:project.effort==='low'?T.successBg:T.bg3,border:'1px solid '+(project.effort==='high'?T.error+'33':project.effort==='low'?T.success+'33':T.border),borderRadius:'8px',padding:'4px 9px',color:project.effort==='high'?T.error:project.effort==='low'?T.success:T.textMute,fontSize:'11px',cursor:'pointer',flexShrink:0,fontWeight:'600',fontFamily:'monospace'}}>
            {project.effort==='low'?'low':project.effort==='high'?'high':'med'}
          </button>

          <span style={{fontSize:'10px',color:T.textMute,flexShrink:0,fontFamily:'monospace',opacity:.6}}>~{countTokens(chat.messages)}tk</span>

          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',flexShrink:0,cursor:'pointer'}}
            onClick={()=>chat.setMessages(m=>[...m,{role:'assistant',content:`🎮 **${growth.level}** — ${growth.xp} XP\n🔥 Streak: ${growth.streak} hari\n🏅 Badge: ${growth.badges.length}/${7}\n${growth.nextXp?`Progress: ${growth.progress}%`:'MAX LEVEL 👑'}`,actions:[]}])}>
            <span style={{fontSize:'9px',color:T.accent,fontFamily:'monospace',fontWeight:'700'}}>{growth.level}</span>
            <span style={{fontSize:'9px',color:T.textMute,fontFamily:'monospace'}}>{growth.xp}xp 🔥{growth.streak}</span>
          </div>

          <button onClick={()=>ui.setShowPalette(true)}
            style={{background:T.bg3,border:'1px solid '+T.border,borderRadius:'10px',padding:'0',color:T.textSec,fontSize:'15px',cursor:'pointer',minWidth:'40px',minHeight:'40px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Command size={15}/></button>

          <button onClick={()=>{chat.clearChat();haptic('light');}}
            style={{background:'none',border:'1px solid '+T.border,borderRadius:'10px',padding:'0 12px',color:T.textMute,fontSize:'12px',cursor:'pointer',minHeight:'40px',flexShrink:0}}><FilePlus2 size={14}/></button>
        </div>
      </div>

      {/* Folder input */}
      {ui.showFolder&&(
        <div style={{padding:'8px 12px',borderBottom:'1px solid '+T.border,display:'flex',gap:'6px',background:T.bg2,flexShrink:0}}>
          <input value={project.folderInput} onChange={e=>project.setFolderInput(e.target.value)} placeholder="nama folder" onKeyDown={e=>e.key==='Enter'&&saveFolder(project.folderInput)}
            style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'6px 10px',color:T.text,fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <button onClick={()=>saveFolder(project.folderInput)} style={{background:T.bg3,border:'none',borderRadius:'6px',padding:'6px 12px',color:T.textSec,fontSize:'12px',cursor:'pointer'}}><Check size={14}/></button>
        </div>
      )}

      <UndoBar T={T} history={file.editHistory} onUndo={undoLastEdit}/>

      {/* Status bar — priority-based */}
      {(()=>{
        if (!project.netOnline) return <div style={{padding:'6px 14px',background:T.errorBg,borderBottom:'1px solid '+T.error+'22',fontSize:'12px',color:T.error,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><Radio size={13}/><span>Offline</span></div>;
        if (chat.rateLimitTimer>0) return <div style={{padding:'6px 14px',background:T.warningBg,borderBottom:'1px solid '+T.warning+'22',fontSize:'12px',color:T.warning,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><AlertTriangle size={13}/><span>Rate limit — tunggu {chat.rateLimitTimer}s</span></div>;
        if (project.reconnectTimer>0&&!project.serverOk) return <div style={{padding:'6px 14px',background:T.errorBg,borderBottom:'1px solid '+T.error+'22',fontSize:'12px',color:T.error,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><RotateCcw size={13} className="status-pulse"/><span>Reconnecting···</span></div>;
        if (chat.agentRunning) return <div style={{padding:'6px 14px',background:T.accentBg,borderBottom:'1px solid '+T.accentBorder,fontSize:'12px',color:T.accent,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><span className="status-pulse" style={{width:'6px',height:'6px',borderRadius:'50%',background:'currentColor',display:'inline-block'}}/><span>Yuyu lagi jalan···</span></div>;
        if (countTokens(chat.messages)>15000) return <div style={{padding:'6px 14px',background:T.warningBg,borderBottom:'1px solid '+T.warning+'22',fontSize:'12px',color:T.warning,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><AlertTriangle size={13}/><span>Context besar ~{countTokens(chat.messages)}tk — /compact untuk kompres</span></div>;
        return null;
      })()}
    </>
  );
}
