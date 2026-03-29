// ── AppHeader ─────────────────────────────────────────────────────────────────
import React from 'react';
import { Menu, Command, FilePlus2, Radio, AlertTriangle, RotateCcw, FolderOpen, Mic, GitBranch, Layers } from 'lucide-react';
import { countTokens } from '../utils.js';
import { UndoBar } from './SearchBar.jsx';

export function AppHeader({ T, ui, project, file, chat, growth, _saveFolder, undoLastEdit, haptic, setShowApiKeys }) {
  const tokenCount = countTokens(chat.messages);
  const tokenWarning = tokenCount > 15000;

  return (
    <>
      {project.sessionColor&&<div style={{height:'2px',background:project.sessionColor,flexShrink:0}}/>}

      <div style={{flexShrink:0,background:T.bg,borderBottom:'1px solid '+T.border}}>
        <div style={{height:'48px',padding:'0 8px',display:'flex',alignItems:'center',gap:'4px'}}>

          {/* Sidebar toggle */}
          <button onClick={()=>ui.setShowSidebar(!ui.showSidebar)}
            style={{background:ui.showSidebar?T.accentBg:'none',border:'none',color:ui.showSidebar?T.accent:T.textMute,cursor:'pointer',borderRadius:'10px',minWidth:'38px',minHeight:'38px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Menu size={16}/>
          </button>

          {/* Project title + status — tap to open ProjectManager */}
          <div style={{flex:1,cursor:'pointer',minWidth:0,overflow:'hidden',padding:'4px 6px',borderRadius:'10px'}}
            onClick={()=>ui.setShowProjectManager(true)}>
            <div style={{fontSize:'13px',fontWeight:'700',color:T.text,letterSpacing:'-.3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',lineHeight:'1.2'}}>
              Yuyu<span style={{fontWeight:'400',opacity:.5}}>code</span>
              {project.skills?.some(s=>s.active)&&<span style={{color:T.success,fontSize:'8px',fontWeight:'700',letterSpacing:'.06em',marginLeft:'5px',verticalAlign:'middle'}}>SKILL</span>}
            </div>
            <div style={{fontSize:'10px',color:T.textMute,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',lineHeight:'1.3',marginTop:'1px',display:'flex',alignItems:'center',gap:'4px'}}>
              <span style={{display:'inline-block',width:'5px',height:'5px',borderRadius:'50%',background:project.serverOk?T.success:T.error,flexShrink:0,flexShrink:0}}/>
              <span style={{fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{project.folder?.split('/').pop()||'no folder'}</span>
              {project.branch&&<span style={{opacity:.45,flexShrink:0,display:'flex',alignItems:'center',gap:'2px'}}><GitBranch size={8}/>{project.branch}</span>}
            </div>
          </div>

          {/* Effort badge — tap to cycle low/med/high */}
          <button onClick={()=>{const lvls=['low','medium','high'];const i=lvls.indexOf(project.effort);project.setEffort(lvls[(i+1)%3]);haptic('light');}}
            title={`Effort: ${project.effort} — tap untuk ganti`}
            style={{background:project.effort==='high'?T.errorBg:project.effort==='low'?T.successBg:T.bg3,border:'1px solid '+(project.effort==='high'?T.error+'44':project.effort==='low'?T.success+'44':T.border),borderRadius:'8px',padding:'3px 8px',color:project.effort==='high'?T.error:project.effort==='low'?T.success:T.textMute,fontSize:'10px',cursor:'pointer',flexShrink:0,fontWeight:'700',fontFamily:'monospace',letterSpacing:'.03em'}}>
            {project.effort==='low'?'low':project.effort==='high'?'high':'med'}
          </button>

          {/* Token counter — colour-coded */}
          <span title={`~${tokenCount} tokens`}
            style={{fontSize:'10px',color:tokenWarning?T.warning:T.textMute,flexShrink:0,fontFamily:'monospace',opacity:tokenWarning?1:.6,cursor:'default'}}>
            ~{tokenCount > 999 ? (tokenCount/1000).toFixed(1)+'k' : tokenCount}tk
          </span>

          {/* Wake word indicator — shown only when PTT/wake word is on */}
          {project.pushToTalk&&(
            <div title='Wake word aktif — "Hey Yuyu"'
              style={{display:'flex',alignItems:'center',justifyContent:'center',width:'30px',height:'30px',borderRadius:'8px',background:T.accentBg,flexShrink:0}}>
              <Mic size={12} style={{color:T.accent,animation:'pulse 1.8s ease-in-out infinite'}}/>
            </div>
          )}

          {/* XP / growth — tap to see stats */}
          <div title={`Level ${growth.level} · ${growth.xp} XP · 🔥 ${growth.streak} hari`}
            style={{display:'flex',flexDirection:'column',alignItems:'flex-end',flexShrink:0,cursor:'pointer',padding:'2px 4px',borderRadius:'6px'}}
            onClick={()=>chat.setMessages(m=>[...m,{role:'assistant',content:`🎮 **${growth.level}** — ${growth.xp} XP\n🔥 Streak: ${growth.streak} hari\n🏅 Badge: ${growth.badges.length}/7\n${growth.nextXp?`Progress: ${growth.progress}%`:'MAX LEVEL 👑'}`,actions:[]}])}>
            <span style={{fontSize:'9px',color:T.accent,fontFamily:'monospace',fontWeight:'700'}}>{growth.level}</span>
            <span style={{fontSize:'9px',color:T.textMute,fontFamily:'monospace'}}>{growth.xp}xp</span>
          </div>

          {/* Background agents — open BgAgentPanel */}
          <button onClick={()=>ui.setShowBgAgents(true)} title="Background Agents"
            style={{background:T.bg3,border:'1px solid '+T.border,borderRadius:'10px',padding:'0',color:T.textMute,cursor:'pointer',minWidth:'34px',minHeight:'34px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Layers size={13}/>
          </button>

          {/* API Keys — single button, no duplicate */}
          <button onClick={()=>setShowApiKeys?.(true)} title="API Keys"
            style={{background:T.bg3,border:'1px solid '+T.border,borderRadius:'10px',padding:'0',color:T.textMute,cursor:'pointer',minWidth:'34px',minHeight:'34px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'14px'}}>
            🔑
          </button>

          {/* Command palette */}
          <button onClick={()=>ui.setShowPalette(true)} title="Command Palette (⌘K)"
            style={{background:T.bg3,border:'1px solid '+T.border,borderRadius:'10px',padding:'0',color:T.textSec,cursor:'pointer',minWidth:'34px',minHeight:'34px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Command size={14}/>
          </button>

          {/* New chat */}
          <button onClick={()=>{chat.clearChat();haptic('light');}} title="Chat baru"
            style={{background:'none',border:'1px solid '+T.border,borderRadius:'10px',padding:'0',color:T.textMute,cursor:'pointer',minWidth:'34px',minHeight:'34px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <FilePlus2 size={14}/>
          </button>
        </div>
      </div>

      <UndoBar T={T} history={file.editHistory} onUndo={undoLastEdit}/>

      {(()=>{
        if (!project.netOnline) return <div style={{padding:'6px 14px',background:T.errorBg,borderBottom:'1px solid '+T.error+'22',fontSize:'12px',color:T.error,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><Radio size={13}/><span>📡 Offline</span></div>;
        if (chat.rateLimitTimer>0) return <div style={{padding:'6px 14px',background:T.warningBg,borderBottom:'1px solid '+T.warning+'22',fontSize:'12px',color:T.warning,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><AlertTriangle size={13}/><span>Rate limit — tunggu {chat.rateLimitTimer}s · coba /ask kimi</span></div>;
        if (project.reconnectTimer>0&&!project.serverOk) return <div style={{padding:'6px 14px',background:T.errorBg,borderBottom:'1px solid '+T.error+'22',fontSize:'12px',color:T.error,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><RotateCcw size={13} className="status-pulse"/><span>Reconnecting···</span></div>;
        if (!project.serverOk) return <div style={{padding:'8px 14px',background:T.errorBg,borderBottom:'1px solid '+T.error+'22',fontSize:'12px',color:T.error,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px'}}><AlertTriangle size={13}/><span style={{fontWeight:'600'}}>Server tidak aktif</span></div>
          <div style={{fontFamily:'monospace',fontSize:'11px',color:T.error,opacity:.8,background:'rgba(0,0,0,.2)',padding:'4px 8px',borderRadius:'4px'}}>node ~/yuyu-server.cjs &</div>
        </div>;
        if (chat.agentRunning) return <div style={{padding:'6px 14px',background:T.accentBg,borderBottom:'1px solid '+T.accentBorder,fontSize:'12px',color:T.accent,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><span className="status-pulse" style={{width:'6px',height:'6px',borderRadius:'50%',background:'currentColor',display:'inline-block'}}/><span>Yuyu lagi jalan···</span></div>;
        if (tokenWarning) return <div style={{padding:'6px 14px',background:T.warningBg,borderBottom:'1px solid '+T.warning+'22',fontSize:'12px',color:T.warning,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><AlertTriangle size={13}/><span>Context besar ~{tokenCount}tk — /compact untuk kompres</span></div>;
        return null;
      })()}
    </>
  );
}
