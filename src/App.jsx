import React, { useRef, useEffect } from "react";
import { Activity } from "react";
import { Preferences } from "@capacitor/preferences";
import { Menu, Command, Camera, Paperclip, Trash2, Radio, RotateCcw, AlertTriangle, Pin, Eye, ScrollText, Brain, MapPin, Zap, Plus, Volume2, VolumeX, GitBranch, ChevronRight, FilePlus2, Check, X } from 'lucide-react';
import { MAX_HISTORY, MODELS, GIT_SHORTCUTS, FOLLOW_UPS, SLASH_COMMANDS, THEMES } from './constants.js';
import { callServer } from './api.js';
import { countTokens, hl } from './utils.js';
import { loadSessions, getBgAgents, mergeBackgroundAgent, abortBgAgent } from './features.js';
import { MsgBubble, MsgContent } from './components/MsgBubble.jsx';
import { ThemeEffects } from './components/ThemeEffects.jsx';
import { FileTree } from './components/FileTree.jsx';
import { FileEditor } from './components/FileEditor.jsx';
import { Terminal } from './components/Terminal.jsx';
import { SearchBar, UndoBar } from './components/SearchBar.jsx';
import { VoiceBtn, PushToTalkBtn } from './components/VoiceBtn.jsx';
import { GitComparePanel, FileHistoryPanel, CustomActionsPanel, ShortcutsPanel, GitBlamePanel, SnippetLibrary, ThemeBuilder, CommandPalette, DepGraphPanel, ElicitationPanel, MergeConflictPanel, BottomSheet, SkillsPanel, DeployPanel, McpPanel, GitHubPanel, SessionsPanel, PermissionsPanel, PluginsPanel, ConfigPanel, BgAgentPanel } from './components/panels.jsx';
import { useSlashCommands } from './hooks/useSlashCommands.js';
import { useUIStore }        from './hooks/useUIStore.js';
import { useProjectStore }   from './hooks/useProjectStore.js';
import { useFileStore }      from './hooks/useFileStore.js';
import { useChatStore }      from './hooks/useChatStore.js';
import { useNotifications }  from './hooks/useNotifications.js';
import { useMediaHandlers }  from './hooks/useMediaHandlers.js';
import { useAgentSwarm }     from './hooks/useAgentSwarm.js';
import { useApprovalFlow }   from './hooks/useApprovalFlow.js';
import { useDevTools }       from './hooks/useDevTools.js';
import { useAgentLoop }      from './hooks/useAgentLoop.js';
import { useGrowth }         from './hooks/useGrowth.js';
import { useBrightness }     from './hooks/useBrightness.js';

export default function App() {
  // ── STORES ──
  const ui      = useUIStore();
  const project = useProjectStore();
  const file    = useFileStore();
  const chat    = useChatStore();
  const T       = ui.T;
  const growth  = useGrowth();

  // ── Dynamic brightness filter — gamma-corrected (sRGB γ=2.2) ──
  // CSS brightness() adalah linear multiplier, bukan perceptual.
  // Formula: decode γ → kompensasi di linear space → encode balik ke sRGB.
  // Aurora/Neon pakai cap lebih rendah — colored background over-saturate kalau boost penuh.
  const brightnessFilter = (() => {
    const b = ui.brightnessLevel;
    if (b >= 0.95) return 'none';
    const safe = Math.max(b, 0.04);
    const linear = Math.pow(safe, 2.2);
    const comp   = Math.pow(1 / linear, 1 / 2.2);
    const themeName = (T?.name || '').toLowerCase();
    const isColorful = themeName.includes('aurora') || themeName.includes('neon');
    const bright   = Math.min(comp, isColorful ? 1.6 : 6.0);
    const contrast = 1 + (bright - 1) * (isColorful ? 0.12 : 0.35);
    return `brightness(${bright.toFixed(3)}) contrast(${contrast.toFixed(3)})`;
  })();
  useBrightness(ui.setBrightnessLevel);

  // ── REFS ──
  const abortRef             = useRef(null);
  const handleSlashCommandRef = useRef(null);
  const wsRef                = useRef(null);
  const fileSnapshotsRef     = useRef({});
  const chatRef              = useRef(null);
  const bottomRef            = useRef(null);
  const inputRef             = useRef(null);

  // ── NOTIFICATIONS & MEDIA ──
  const { sendNotification, haptic, speakText, stopTts } = useNotifications();
  const { fileInputRef, handleImageAttach, handleDrop, handleCameraCapture, handleGalleryPick: _handleGalleryPick }  = useMediaHandlers({
    setVisionImage: chat.setVisionImage,
    setInput:       chat.setInput,
    haptic,
    setDragOver:    ui.setDragOver,
  });

  // ── AGENT LOOP (sendMsg, callAI, compactContext) ──
  const { sendMsg, callAI, compactContext, cancelMsg, continueMsg, retryLast, abTest } = useAgentLoop({
    project, chat, file, ui,
    sendNotification, haptic, speakText,
    abortRef, handleSlashCommandRef,
    growth,
  });

  // ── AGENT SWARM ──
  const { runAgentSwarm } = useAgentSwarm({
    callAI,
    folder:          project.folder,
    setSwarmRunning: chat.setSwarmRunning,
    setSwarmLog:     chat.setSwarmLog,
    setMessages:     chat.setMessages,
    sendNotification, haptic, abortRef,
  });

  // ── APPROVAL FLOW ──
  const { handleApprove, handlePlanApprove } = useApprovalFlow({
    messages:     chat.messages,
    setMessages:  chat.setMessages,
    folder:       project.folder,
    hooks:        project.hooks,
    permissions:  project.permissions,
    editHistory:  file.editHistory,
    setEditHistory: file.setEditHistory,
    sendMsgRef:   { current: sendMsg },
    callAI,
    abortRef,
    setLoading:   chat.setLoading,
  });

  // ── DEV TOOLS ──
  const { fetchGitHub, runDeploy, generateCommitMsg, runTests, browseTo, runShortcut } = useDevTools({
    folder:        project.folder,
    githubRepo:    project.githubRepo,
    githubToken:   project.githubToken,
    setGithubData: project.setGithubData,
    setMessages:   chat.setMessages,
    setLoading:    chat.setLoading,
    setStreaming:  chat.setStreaming,
    setDeployLog:  ui.setDeployLog,
    callAI,
    sendMsgRef:    { current: sendMsg },
    sendNotification, haptic, abortRef,
    addHistory:    project.addHistory,
  });

  // ── SLASH COMMANDS ──
  const { handleSlashCommand } = useSlashCommands({
    model: project.model, folder: project.folder, branch: project.branch,
    messages: chat.messages, selectedFile: file.selectedFile, fileContent: file.fileContent,
    notes: project.notes, memories: chat.memories, checkpoints: chat.checkpoints,
    skills: project.skills, thinkingEnabled: project.thinkingEnabled, effort: project.effort,
    loopActive: project.loopActive, loopIntervalRef: project.loopIntervalRef,
    agentMemory: project.agentMemory, splitView: file.splitView,
    pushToTalk: project.pushToTalk, sessionName: project.sessionName,
    sessionColor: project.sessionColor, fileWatcherActive: project.fileWatcherActive,
    fileWatcherInterval: project.fileWatcherInterval,
    setModel: project.setModel, setMessages: chat.setMessages, setFolder: project.setFolder,
    setFolderInput: project.setFolderInput, setLoading: chat.setLoading, setStreaming: chat.setStreaming,
    setThinkingEnabled: project.setThinkingEnabled, setEffort: project.setEffort,
    setLoopActive: project.setLoopActive, setLoopIntervalRef: project.setLoopIntervalRef,
    setSplitView: file.setSplitView, setPushToTalk: project.setPushToTalk,
    setSessionName: project.setSessionName, setSessionColor: project.setSessionColor,
    setSkills: project.setSkills, setFileWatcherActive: project.setFileWatcherActive,
    setFileWatcherInterval: project.setFileWatcherInterval, setFileSnapshots: project.setFileSnapshots,
    setPlanSteps: chat.setPlanSteps, setPlanTask: chat.setPlanTask,
    setAgentMemory: project.setAgentMemory, setSessionList: ui.setSessionList,
    setShowCheckpoints: ui.setShowCheckpoints, setShowMemory: ui.setShowMemory,
    setShowMCP: ui.setShowMCP, setShowGitHub: ui.setShowGitHub, setShowDeploy: ui.setShowDeploy,
    setShowSessions: ui.setShowSessions, setShowPermissions: ui.setShowPermissions,
    setShowPlugins: ui.setShowPlugins, setShowConfig: ui.setShowConfig,
    setShowCustomActions: ui.setShowCustomActions, setShowFileHistory: ui.setShowFileHistory,
    setShowThemeBuilder: ui.setShowThemeBuilder, setShowDiff: ui.setShowDiff,
    setShowSearch: ui.setShowSearch, setShowSnippets: ui.setShowSnippets,
    setShowDepGraph: ui.setShowDepGraph, setDepGraph: ui.setDepGraph, setFontSize: ui.setFontSize,
    setShowMergeConflict: ui.setShowMergeConflict, setMergeConflictData: ui.setMergeConflictData,
    setShowSkills: ui.setShowSkills, setShowBgAgents: ui.setShowBgAgents,
    sendMsg, compactContext,
    saveCheckpoint: () => chat.saveCheckpoint(project.folder, project.branch, project.notes),
    exportChat: chat.exportChat, generateCommitMsg, runTests, browseTo, runAgentSwarm,
    callAI, abTest, addHistory: project.addHistory, runHooks: project.runHooks,
    growth,
    sendNotification, haptic, abortRef,
  });
  // Update ref setiap render — cegah stale closure di sendMsg
  useEffect(() => { handleSlashCommandRef.current = handleSlashCommand; });

  // ── INIT EFFECT ──
  useEffect(() => {
    Promise.all([
      Preferences.get({key:'yc_folder'}),    Preferences.get({key:'yc_history'}),
      Preferences.get({key:'yc_cmdhist'}),   Preferences.get({key:'yc_model'}),
      Preferences.get({key:'yc_theme'}),     Preferences.get({key:'yc_pinned'}),
      Preferences.get({key:'yc_recent'}),    Preferences.get({key:'yc_sidebar_w'}),
      Preferences.get({key:'yc_memories'}),  Preferences.get({key:'yc_checkpoints'}),
      Preferences.get({key:'yc_hooks'}),     Preferences.get({key:'yc_fontsize'}),
      Preferences.get({key:'yc_custom_theme'}), Preferences.get({key:'yc_onboarded'}),
      Preferences.get({key:'yc_gh_token'}),  Preferences.get({key:'yc_gh_repo'}),
      Preferences.get({key:'yc_session_color'}), Preferences.get({key:'yc_plugins'}),
      Preferences.get({key:'yc_effort'}),    Preferences.get({key:'yc_thinking'}),
      Preferences.get({key:'yc_permissions'}),
    ]).then(([f,h,ch,mo,th,pi,re,sw,mem,ckp,hk,fs,ct,ob,ght,ghr,sc,pl,ef,tk,perm]) => {
      ui.loadUIPrefs({theme:th.value,fontSize:fs.value,sidebarWidth:sw.value,customTheme:ct.value,onboarded:ob.value});
      project.loadProjectPrefs({folder:f.value,cmdHistory:ch.value,model:mo.value,hooks:hk.value,githubToken:ght.value,githubRepo:ghr.value,sessionColor:sc.value,plugins:pl.value,effort:ef.value,thinkingEnabled:tk.value,permissions:perm.value});
      file.loadFilePrefs({pinned:pi.value,recent:re.value});
      chat.loadChatPrefs({history:h.value,memories:mem.value,checkpoints:ckp.value});
    });
    callServer({type:'ping'}).then(r => {
      project.setServerOk(r.ok);
      if (r.ok) {
        callServer({type:'mcp_list'}).then(mr => {
          if (mr.ok && mr.data && typeof mr.data === 'object') project.setMcpTools(mr.data);
        });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [chat.messages, chat.streaming]);

  // ── Battery API ──
  useEffect(() => {
    if (!('getBattery' in navigator)) return;
    navigator.getBattery().then(bat => {
      project.setBatteryLevel(bat.level);
      project.setBatteryCharging(bat.charging);
      bat.addEventListener('levelchange', () => project.setBatteryLevel(bat.level));
      bat.addEventListener('chargingchange', () => project.setBatteryCharging(bat.charging));
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Battery-aware effort — auto turun ke low kalau < 20% dan tidak charging ──
  useEffect(() => {
    if (!project.batteryCharging && project.batteryLevel < 0.20 && project.effort !== 'low') {
      project.setEffort('low');
      chat.setMessages(m => [...m, { role: 'assistant', content: '🔋 Baterai < 20% — effort otomatis turun ke **low** untuk hemat daya.', actions: [] }]);
    }
  }, [project.batteryLevel, project.batteryCharging]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const on=()=>project.setNetOnline(true), off=()=>project.setNetOnline(false);
    window.addEventListener('online',on); window.addEventListener('offline',off);
    return () => { window.removeEventListener('online',on); window.removeEventListener('offline',off); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const iv = setInterval(async () => {
      const r = await callServer({type:'ping'});
      project.setServerOk(r.ok);
      project.setReconnectTimer(t => r.ok ? 0 : t + 5);
    }, 5000);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { chat.persistMessages(chat.messages); }, [chat.messages]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if(project.folder) project.loadFolderPrefs(project.folder); }, [project.folder]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── WebSocket file watcher ──
  useEffect(() => {
    if (!project.fileWatcherActive || !project.folder) return;
    let dead = false;
    function connect() {
      if (dead) return;
      const ws = new WebSocket('ws://127.0.0.1:8766');
      wsRef.current = ws;
      ws.onopen = () => ws.send(JSON.stringify({type:'watch',path:project.folder}));
      ws.onmessage = async (e) => {
        try {
          const {event,filename} = JSON.parse(e.data);
          if (event==='watching'||!filename) return;
          const absPath = project.folder+(filename.startsWith('/')?filename:'/'+filename);
          const prev    = fileSnapshotsRef.current[absPath];
          const r       = await callServer({type:'read',path:absPath});
          if (!r.ok) {
            chat.setMessages(m=>[...m,{role:'assistant',content:'👁 **File berubah:** `'+filename+'`',actions:[]}]);
            sendNotification('YuyuCode 👁',filename+' berubah');
            return;
          }
          const curr = r.data || '';
          fileSnapshotsRef.current[absPath] = curr;
          if (!prev) {
            chat.setMessages(m=>[...m,{role:'assistant',content:'👁 **File berubah:** `'+filename+'` _(snapshot awal disimpan)_',actions:[]}]);
            return;
          }
          const prevLines=prev.split('\n'), currLines=curr.split('\n');
          const added=[], removed=[];
          const maxL=Math.max(prevLines.length,currLines.length);
          for(let i=0;i<maxL;i++){
            if(prevLines[i]!==undefined&&currLines[i]===undefined) removed.push({n:i+1,text:prevLines[i]});
            else if(prevLines[i]===undefined&&currLines[i]!==undefined) added.push({n:i+1,text:currLines[i]});
            else if(prevLines[i]!==currLines[i]){removed.push({n:i+1,text:prevLines[i]});added.push({n:i+1,text:currLines[i]});}
          }
          const diffLines=[...removed.slice(0,8).map(l=>`- L${l.n}: ${l.text}`),...added.slice(0,8).map(l=>`+ L${l.n}: ${l.text}`)];
          const diffText=diffLines.length?'\n```diff\n'+diffLines.join('\n')+'\n```':'';
          const summary=`${added.length} baris berubah/ditambah, ${removed.length} dihapus`;
          chat.setMessages(m=>[...m,{role:'assistant',content:`👁 **File berubah:** \`${filename}\` — ${summary}${diffText}`,actions:[]}]);
          sendNotification('YuyuCode 👁',filename+' berubah: '+summary);
        } catch (_e) { /* file watcher parse error */ }
      };
      ws.onerror  = () => { /* reconnect via onclose */ };
      ws.onclose  = () => { if (!dead) setTimeout(connect, 3000); };
    }
    connect();
    return () => { dead=true; if(wsRef.current){wsRef.current.onclose=null;wsRef.current.close();wsRef.current=null;} };
  }, [project.fileWatcherActive, project.folder]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── HELPERS ──
  function saveFolder(f) { project.saveFolder(f); ui.setShowFolder(false); }
  function undoLastEdit() { file.undoLastEdit(msg => chat.setMessages(m=>[...m,{role:'assistant',content:msg,actions:[]}])); }
  function saveCheckpoint() { chat.saveCheckpoint(project.folder, project.branch, project.notes); }
  function restoreCheckpoint(cp) {
    chat.restoreCheckpoint(cp, project.setFolder, project.setFolderInput, n=>project.setNotes(n));
    ui.setShowCheckpoints(false);
  }
  function onSidebarDragStart(e) {
    ui.setDragging(true);
    const startX=e.touches?e.touches[0].clientX:e.clientX, startW=ui.sidebarWidth;
    function onMove(ev){const x=ev.touches?ev.touches[0].clientX:ev.clientX;ui.setSidebarWidth(Math.max(120,Math.min(300,startW+(x-startX))));}
    function onEnd(){ui.setDragging(false);Preferences.set({key:'yc_sidebar_w',value:String(ui.sidebarWidth)});window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onEnd);window.removeEventListener('touchmove',onMove);window.removeEventListener('touchend',onEnd);}
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onEnd);window.addEventListener('touchmove',onMove,{passive:true});window.addEventListener('touchend',onEnd);
  }

  const VIRTUAL_LIMIT = 60;
  const visibleMessages = chat.messages.length > VIRTUAL_LIMIT
    ? [{role:'assistant',content:`[... ${chat.messages.length-VIRTUAL_LIMIT} pesan tersembunyi. /clear untuk bersihkan]`},...chat.messages.slice(-VIRTUAL_LIMIT)]
    : chat.messages;

  // ── RENDER ──
  return (
    <div style={{position:'fixed',inset:0,background:T.bg,color:T.text,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',display:'flex',flexDirection:'column',fontSize:ui.fontSize+'px',filter:brightnessFilter,transition:'filter .35s ease'}}
      onDragOver={e=>{e.preventDefault();ui.setDragOver(true);}} onDragLeave={()=>ui.setDragOver(false)} onDrop={handleDrop}>
      {ui.dragOver&&<div style={{position:'absolute',inset:0,background:'rgba(124,58,237,.15)',border:'2px dashed rgba(124,58,237,.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}><span style={{fontSize:'18px',color:'#a78bfa'}}>Drop file di sini~</span></div>}
      <ThemeEffects T={T}/>
      {/* Badge toast */}
      {growth.newBadge&&(
        <div style={{position:'fixed',top:'60px',left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,.92)',border:'1px solid rgba(124,58,237,.4)',borderRadius:'14px',padding:'12px 20px',zIndex:999,display:'flex',alignItems:'center',gap:'10px',boxShadow:'0 8px 32px rgba(0,0,0,.6)',animation:'fadeUp .3s ease'}}>
          <span style={{fontSize:'22px'}}>{growth.newBadge.label.split(' ')[0]}</span>
          <div>
            <div style={{fontSize:'13px',fontWeight:'700',color:'#f0f0f0'}}>{growth.newBadge.label}</div>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,.5)'}}>{growth.newBadge.desc}</div>
          </div>
        </div>
      )}
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}

        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:99px;}
        textarea,input{scrollbar-width:none;}
        button{transition:color .15s,background .15s,border-color .15s,opacity .15s;-webkit-tap-highlight-color:transparent;}
        button:active{opacity:.55!important;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        .msg-appear{animation:fadeUp .2s cubic-bezier(.16,1,.3,1) forwards;}
        .status-pulse{animation:pulse 1.8s ease-in-out infinite;}
      `}</style>

      {project.sessionColor&&<div style={{height:'2px',background:project.sessionColor,flexShrink:0}}/>}

      {/* HEADER — compact 48px, no sakura icon */}
      <div style={{flexShrink:0,background:T.bg,borderBottom:'1px solid '+T.border}}>
        <div style={{height:'48px',padding:'0 10px',display:'flex',alignItems:'center',gap:'6px'}}>
          {/* sidebar toggle */}
          <button onClick={()=>ui.setShowSidebar(!ui.showSidebar)}
            style={{background:ui.showSidebar?T.accentBg:'none',border:'none',color:ui.showSidebar?T.accent:T.textMute,fontSize:'16px',cursor:'pointer',borderRadius:'10px',minWidth:'40px',minHeight:'40px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Menu size={16}/></button>

          {/* title + folder — tap to change */}
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

          {/* effort pill */}
          <button onClick={()=>{const lvls=['low','medium','high'];const i=lvls.indexOf(project.effort);project.setEffort(lvls[(i+1)%3]);}}
            style={{background:project.effort==='high'?T.errorBg:project.effort==='low'?T.successBg:T.bg3,border:'1px solid '+(project.effort==='high'?T.error+'33':project.effort==='low'?T.success+'33':T.border),borderRadius:'8px',padding:'4px 9px',color:project.effort==='high'?T.error:project.effort==='low'?T.success:T.textMute,fontSize:'11px',cursor:'pointer',flexShrink:0,fontWeight:'600',fontFamily:'monospace'}}>
            {project.effort==='low'?'low':project.effort==='high'?'high':'med'}
          </button>

          {/* tokens */}
          <span style={{fontSize:'10px',color:T.textMute,flexShrink:0,fontFamily:'monospace',opacity:.6}}>~{countTokens(chat.messages)}tk</span>

          {/* XP + streak */}
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',flexShrink:0,cursor:'pointer'}}
            onClick={()=>chat.setMessages(m=>[...m,{role:'assistant',content:`🎮 **${growth.level}** — ${growth.xp} XP\n🔥 Streak: ${growth.streak} hari\n🏅 Badge: ${growth.badges.length}/${7}\n${growth.nextXp?`Progress: ${growth.progress}%`:'MAX LEVEL 👑'}`,actions:[]}])}>
            <span style={{fontSize:'9px',color:T.accent,fontFamily:'monospace',fontWeight:'700'}}>{growth.level}</span>
            <span style={{fontSize:'9px',color:T.textMute,fontFamily:'monospace'}}>{growth.xp}xp 🔥{growth.streak}</span>
          </div>

          {/* command palette */}
          <button onClick={()=>ui.setShowPalette(true)}
            style={{background:T.bg3,border:'1px solid '+T.border,borderRadius:'10px',padding:'0',color:T.textSec,fontSize:'15px',cursor:'pointer',minWidth:'40px',minHeight:'40px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Command size={15}/></button>

          {/* new chat */}
          <button onClick={()=>{chat.clearChat();haptic('light');}}
            style={{background:'none',border:'1px solid '+T.border,borderRadius:'10px',padding:'0 12px',color:T.textMute,fontSize:'12px',cursor:'pointer',minHeight:'40px',flexShrink:0}}><FilePlus2 size={14}/></button>
        </div>
      </div>

      {ui.showFolder&&(
        <div style={{padding:'8px 12px',borderBottom:'1px solid '+T.border,display:'flex',gap:'6px',background:T.bg2,flexShrink:0}}>
          <input value={project.folderInput} onChange={e=>project.setFolderInput(e.target.value)} placeholder="nama folder" onKeyDown={e=>e.key==='Enter'&&saveFolder(project.folderInput)}
            style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'6px 10px',color:T.text,fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <button onClick={()=>saveFolder(project.folderInput)} style={{background:'rgba(255,255,255,.08)',border:'none',borderRadius:'6px',padding:'6px 12px',color:'rgba(255,255,255,.7)',fontSize:'12px',cursor:'pointer'}}><Check size={14}/></button>
        </div>
      )}

      <UndoBar history={file.editHistory} onUndo={undoLastEdit}/>

      {/* UNIFIED STATUS BAR — single strip, priority-based */}
      {(()=>{
        if (!project.netOnline) return <div style={{padding:'6px 14px',background:T.errorBg,borderBottom:'1px solid '+T.error+'22',fontSize:'12px',color:T.error,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><Radio size={13}/><span>Offline</span></div>;
        if (chat.rateLimitTimer>0) return <div style={{padding:'6px 14px',background:T.warningBg,borderBottom:'1px solid '+T.warning+'22',fontSize:'12px',color:T.warning,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><AlertTriangle size={13}/><span>Rate limit — tunggu {chat.rateLimitTimer}s</span></div>;
        if (project.reconnectTimer>0&&!project.serverOk) return <div style={{padding:'6px 14px',background:T.errorBg,borderBottom:'1px solid '+T.error+'22',fontSize:'12px',color:T.error,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><RotateCcw size={13} className="status-pulse"/><span>Reconnecting···</span></div>;
        if (chat.agentRunning) return <div style={{padding:'6px 14px',background:T.accentBg,borderBottom:'1px solid '+T.accentBorder,fontSize:'12px',color:T.accent,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><span className="status-pulse" style={{width:'6px',height:'6px',borderRadius:'50%',background:'currentColor',display:'inline-block'}}/><span>Yuyu lagi jalan···</span></div>;
        if (countTokens(chat.messages)>15000) return <div style={{padding:'6px 14px',background:T.warningBg,borderBottom:'1px solid '+T.warning+'22',fontSize:'12px',color:T.warning,flexShrink:0,display:'flex',alignItems:'center',gap:'6px'}}><AlertTriangle size={13}/><span>Context besar ~{countTokens(chat.messages)}tk — /compact untuk kompres</span></div>;
        return null;
      })()}

      <div style={{flex:1,display:'flex',overflow:'hidden',position:'relative'}}>

        {/* SIDEBAR — overlay, tap backdrop to close */}
        {ui.showSidebar&&(
          <>
            <div onClick={()=>ui.setShowSidebar(false)}
              style={{position:'absolute',inset:0,zIndex:19,background:'rgba(0,0,0,.4)',backdropFilter:'blur(2px)'}}/>
            <div style={{position:'absolute',top:0,left:0,bottom:0,width:ui.sidebarWidth+'px',borderRight:'1px solid '+T.border,display:'flex',flexDirection:'column',background:T.bg2,zIndex:20}}>
              <div style={{padding:'5px 8px',borderBottom:'1px solid rgba(255,255,255,.05)',display:'flex',gap:'4px',alignItems:'center'}}>
                <span style={{fontSize:'10px',color:'rgba(255,255,255,.25)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{project.folder}</span>
              </div>
              {file.recentFiles.length>0&&(
                <div style={{padding:'4px 8px',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                  <div style={{fontSize:'9px',color:'rgba(255,255,255,.2)',marginBottom:'3px',letterSpacing:'.05em'}}>RECENT</div>
                  {file.recentFiles.slice(0,4).map(f=>(
                    <div key={f} onClick={()=>{file.openFile(f);ui.setShowSidebar(false);}} style={{fontSize:'11px',color:'rgba(255,255,255,.4)',padding:'2px 4px',cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',borderRadius:'3px'}}
                      onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.4)'}>
                      {f.split('/').pop()}
                    </div>
                  ))}
                </div>
              )}
              <div style={{flex:1,overflow:'hidden'}}>
                <FileTree folder={project.folder} onSelectFile={p=>{file.openFile(p);ui.setShowSidebar(false);}} selectedFile={file.selectedFile} T={T}/>
              </div>
              <div onMouseDown={onSidebarDragStart} onTouchStart={onSidebarDragStart}
                style={{position:'absolute',top:0,right:-3,bottom:0,width:'6px',cursor:'col-resize',background:ui.dragging?T.accentBg:'transparent'}}/>
            </div>
          </>
        )}

        {/* CENTER */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* TABS */}
          <div style={{display:'flex',borderBottom:'1px solid '+T.border,flexShrink:0,background:T.bg,height:'48px',alignItems:'center',padding:'0 8px',gap:'4px'}}>
            <button onClick={()=>file.setActiveTab('chat')}
              style={{padding:'0 14px',background:file.activeTab==='chat'?T.accentBg:'none',border:file.activeTab==='chat'?'1px solid '+T.accentBorder:'1px solid transparent',borderRadius:'8px',color:file.activeTab==='chat'?T.accent:T.textMute,fontSize:'13px',cursor:'pointer',fontWeight:file.activeTab==='chat'?'600':'400',minHeight:'36px',transition:'all .15s'}}>
              Chat
            </button>
            {file.selectedFile&&(
              <>
                <button onClick={()=>{file.setActiveTab('file');file.setEditMode(false);}}
                  style={{padding:'0 12px',background:file.activeTab==='file'&&!file.editMode?T.bg3:'none',border:file.activeTab==='file'&&!file.editMode?'1px solid '+T.border:'1px solid transparent',borderRadius:'8px',color:file.activeTab==='file'&&!file.editMode?T.text:T.textMute,fontSize:'12px',cursor:'pointer',maxWidth:'150px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',minHeight:'36px',transition:'all .15s'}}>
                  {file.selectedFile.split('/').pop()}
                </button>
                <button onClick={()=>{file.setActiveTab('file');file.setEditMode(true);}}
                  style={{padding:'0 10px',background:file.editMode?'rgba(245,158,11,.1)':'none',border:file.editMode?'1px solid rgba(245,158,11,.25)':'1px solid transparent',borderRadius:'8px',color:file.editMode?'#f59e0b':T.textMute,fontSize:'11px',cursor:'pointer',minHeight:'36px',transition:'all .15s'}}>
                  edit
                </button>
              </>
            )}
            <div style={{flex:1}}/>
            <button onClick={()=>ui.setShowTerminal(!ui.showTerminal)}
              style={{padding:'0 12px',background:ui.showTerminal?T.bg3:'none',border:ui.showTerminal?'1px solid '+T.border:'1px solid transparent',borderRadius:'8px',color:ui.showTerminal?T.textSec:T.textMute,fontSize:'13px',cursor:'pointer',fontFamily:'monospace',minHeight:'36px',transition:'all .15s'}}>
              $
            </button>
          </div>

          {/* CHAT */}
          {file.activeTab==='chat'&&!ui.showTerminal&&(
            <div ref={chatRef} style={{flex:1,overflowY:'auto',padding:'20px 0 8px'}}>
              <div style={{maxWidth:'720px',margin:'0 auto',padding:'0 4px'}}>
              {visibleMessages.map((m,i)=>(
                <MsgBubble key={i} msg={m} isLast={i===chat.messages.length-1} T={T}
                  onApprove={m.actions?.some(a=>(a.type==='write_file'||a.type==='patch_file')&&!a.executed)?(ok,path)=>handleApprove(i,ok,path):null}
                  onPlanApprove={m.content?.includes('📋 **Plan (')&&!m.planApproved?(ok)=>handlePlanApprove(i,ok):null}
                  onRetry={i===chat.messages.length-1&&m.role==='user'?retryLast:null}
                  onContinue={i===chat.messages.length-1&&m.role==='assistant'&&m.content.trim().endsWith('CONTINUE')?continueMsg:null}
                  onAutoFix={i===chat.messages.length-1?()=>sendMsg('Ada error di output. Analisis dan fix otomatis.'):null}
                  onDelete={()=>chat.deleteMessage(i)}
                  onEdit={(newContent)=>chat.editMessage(i,newContent)}
                />
              ))}
              {chat.streaming&&(
                <div style={{padding:'2px 16px'}}>
                  <div style={{maxWidth:'92%',fontSize:'14px',lineHeight:'1.7',color:'#e0e0e0'}}>
                    <MsgContent text={chat.streaming}/>
                    <span style={{display:'inline-block',width:'2px',height:'14px',background:'rgba(255,255,255,.6)',marginLeft:'2px',verticalAlign:'middle',animation:'blink 1s infinite'}}/>
                  </div>
                </div>
              )}
              {chat.loading&&!chat.streaming&&<div style={{padding:'2px 16px'}}><div style={{color:'rgba(255,255,255,.3)',fontSize:'13px'}}>Yuyu lagi mikir···</div></div>}
              <div ref={bottomRef}/>
              </div>
            </div>
          )}

          {/* FILE VIEWER */}
          {file.activeTab==='file'&&file.selectedFile&&!file.editMode&&!ui.showTerminal&&(
            <div style={{flex:1,overflow:'auto'}}>
              <div style={{height:'44px',padding:'0 12px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:'6px',background:T.bg2,position:'sticky',top:0}}>
                <span style={{fontSize:'11px',color:T.textMute,fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.selectedFile}</span>
                {[
                  {label:<Pin size={12}/>,active:file.pinnedFiles.includes(file.selectedFile),color:T.accent,bg:T.accentBg,border:T.accentBorder,onClick:()=>file.togglePin(file.selectedFile)},
                  {label:<Eye size={12}/>,active:false,color:T.textSec,bg:T.bg3,border:T.border,onClick:()=>ui.setShowBlame(true)},
                  {label:<ScrollText size={12}/>,active:false,color:T.textSec,bg:T.bg3,border:T.border,onClick:()=>ui.setShowFileHistory(true)},
                  {label:'+ctx',active:false,color:T.success,bg:T.successBg,border:T.success+'33',onClick:()=>{chat.setMessages(m=>[...m,{role:'user',content:'Yu, ini konteks file '+file.selectedFile+':\n```\n'+(file.fileContent||'').slice(0,2000)+'\n```'}]);file.setActiveTab('chat');}},
                  {label:'Tanya',active:false,color:T.accent,bg:T.accentBg,border:T.accentBorder,onClick:()=>sendMsg('Yu, jelaskan file '+file.selectedFile)},
                ].map((b,i)=>(
                  <button key={i} onClick={b.onClick}
                    style={{background:b.active?b.bg:T.bg3,border:'1px solid '+(b.active?b.border:T.border),borderRadius:'8px',padding:'5px 10px',color:b.active?b.color:T.textSec,fontSize:'11px',cursor:'pointer',flexShrink:0,minHeight:'32px',transition:'all .15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=b.bg;e.currentTarget.style.borderColor=b.border;e.currentTarget.style.color=b.color;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=b.active?b.bg:T.bg3;e.currentTarget.style.borderColor=b.active?b.border:T.border;e.currentTarget.style.color=b.active?b.color:T.textSec;}}>
                    {b.label}
                  </button>
                ))}
                <button onClick={()=>{file.setSelectedFile(null);file.setFileContent(null);file.setActiveTab('chat');}}
                  style={{background:'none',border:'none',color:T.textMute,fontSize:'16px',cursor:'pointer',flexShrink:0,minWidth:'32px',minHeight:'32px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'8px'}}
                  onMouseEnter={e=>e.currentTarget.style.color=T.text}
                  onMouseLeave={e=>e.currentTarget.style.color=T.textMute}>×</button>
              </div>
              <div style={{display:'flex',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.6'}}>
                <div style={{padding:'8px 6px',color:'rgba(255,255,255,.2)',textAlign:'right',userSelect:'none',borderRight:'1px solid rgba(255,255,255,.05)',minWidth:'36px',flexShrink:0,background:'rgba(255,255,255,.01)'}}>
                  {(file.fileContent||'').split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
                </div>
                <pre style={{margin:0,padding:'8px 12px',whiteSpace:'pre-wrap',wordBreak:'break-word',color:'rgba(255,255,255,.7)',flex:1}} dangerouslySetInnerHTML={{__html:hl(file.fileContent||'',file.selectedFile?.split('.').pop()||'')}}/>
              </div>
            </div>
          )}

          {/* FILE EDITOR */}
          {file.activeTab==='file'&&file.selectedFile&&file.editMode&&!ui.showTerminal&&(
            <div style={{flex:1,overflow:'hidden',display:'flex'}}>
              {file.splitView?(
                <>
                  <div style={{flex:1,overflow:'hidden',borderRight:'1px solid rgba(255,255,255,.07)'}}>
                    <FileEditor path={file.selectedFile} content={file.fileContent||''} onSave={c=>file.saveFile(c,msg=>chat.setMessages(m=>[...m,{role:'assistant',content:msg,actions:[]}]))} onClose={()=>file.setEditMode(false)}/>
                  </div>
                  <div style={{flex:1,overflowY:'auto',padding:'12px 0'}}>
                    {chat.messages.slice(-10).map((m,i)=>(
                      <div key={i} style={{padding:'4px 12px'}}>
                        <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)',marginBottom:'2px'}}>{m.role==='user'?'Papa':'Yuyu'}</div>
                        <div style={{fontSize:'12px',color:'rgba(255,255,255,.7)',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{m.content.replace(/```action[\s\S]*?```/g,'').slice(0,300)}</div>
                      </div>
                    ))}
                  </div>
                </>
              ):(
                <FileEditor path={file.selectedFile} content={file.fileContent||''} onSave={c=>file.saveFile(c,msg=>chat.setMessages(m=>[...m,{role:'assistant',content:msg,actions:[]}]))} onClose={()=>file.setEditMode(false)}/>
              )}
            </div>
          )}

          {/* TERMINAL */}
          {ui.showTerminal&&<div style={{flex:1,overflow:'hidden'}}><Terminal folder={project.folder} cmdHistory={project.cmdHistory} addHistory={project.addHistory} T={T} onSendToAI={txt=>{ui.setShowTerminal(false);file.setActiveTab('chat');sendMsg(txt);}}/></div>}

          {/* FOLLOW UPS */}
          {chat.showFollowUp&&!chat.loading&&file.activeTab==='chat'&&!ui.showTerminal&&(
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',padding:'6px 14px 8px',flexShrink:0}}>
              {FOLLOW_UPS.map(p=>(
                <button key={p} onClick={()=>sendMsg(p)}
                  style={{background:T.bg3,border:'1px solid '+T.border,borderRadius:'20px',padding:'6px 14px',color:T.textMute,fontSize:'12px',cursor:'pointer',minHeight:'34px',transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background=T.accentBg;e.currentTarget.style.borderColor=T.accentBorder;e.currentTarget.style.color=T.accent;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=T.bg3;e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMute;}}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* QUICK BAR — compact 40px */}
          {!ui.showTerminal&&(
            <div style={{height:'40px',padding:'0 10px',borderTop:'1px solid '+T.borderSoft,display:'flex',alignItems:'center',gap:'2px',flexShrink:0,overflowX:'auto',background:T.bg}}>
              {GIT_SHORTCUTS.map(s=>(
                <button key={s.label} disabled={chat.loading}
                  onClick={()=>{ if(s.cmd.includes('yugit.cjs')){ui.setCommitMsg('');ui.setCommitModal(true);}else{runShortcut(s.cmd);} }}
                  style={{background:'none',border:'none',padding:'4px 10px',color:T.textMute,fontSize:'11px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace',borderRadius:'6px',display:'flex',alignItems:'center',gap:'4px',minHeight:'32px',flexShrink:0}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.bg3}
                  onMouseLeave={e=>e.currentTarget.style.background='none'}>
                  <span style={{opacity:.5,fontSize:'10px'}}>{s.icon}</span><span>{s.label}</span>
                </button>
              ))}
              <div style={{flex:1}}/>
              {file.pinnedFiles.map(f=>(
                <button key={f} onClick={()=>file.openFile(f)}
                  style={{background:T.accentBg,border:'none',borderRadius:'6px',padding:'3px 8px',color:T.accent,fontSize:'10px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace',minHeight:'28px',opacity:.7}}
                  onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='.7'}>
                  {f.split('/').pop()}
                </button>
              ))}
            </div>
          )}

                    {/* INPUT */}
          {!ui.showTerminal&&(
            <div style={{padding:'8px 12px',paddingBottom:'calc(8px + env(safe-area-inset-bottom, 0px))',background:T.bg,flexShrink:0,position:'relative'}}>
              {/* slash suggestions */}
              {chat.slashSuggestions.length>0&&(
                <div style={{position:'absolute',bottom:'100%',left:'12px',right:'12px',background:T.bg2,border:'1px solid '+T.border,borderRadius:'14px',zIndex:99,marginBottom:'6px',boxShadow:'0 16px 40px rgba(0,0,0,.7)',maxHeight:'280px',overflowY:'auto'}}>
                  {chat.slashSuggestions.map(s=>(
                    <div key={s.cmd} onClick={()=>{chat.setInput(s.cmd);chat.setSlashSuggestions([]);inputRef.current?.focus();}}
                      style={{display:'flex',gap:'12px',padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid '+T.borderSoft,alignItems:'center',minHeight:'44px'}}
                      onMouseEnter={e=>e.currentTarget.style.background=T.bg3}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <span style={{color:T.accent,fontFamily:'monospace',fontSize:'13px',flexShrink:0,minWidth:'110px',fontWeight:'500'}}>{s.cmd}</span>
                      <span style={{color:T.textMute,fontSize:'12px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Unified composer — frontier AI style */}
              <div style={{background:T.bg2,border:'1px solid '+T.border,borderRadius:'20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,.25)',transition:'border-color .15s'}}
                onFocusCapture={e=>{e.currentTarget.style.borderColor=T.accentBorder;}}
                onBlurCapture={e=>{e.currentTarget.style.borderColor=T.border;}}>

                {/* Vision preview */}
                {chat.visionImage&&(
                  <div style={{padding:'10px 14px 0',display:'flex'}}>
                    <div style={{position:'relative',display:'inline-block'}}>
                      <img src={'data:image/jpeg;base64,'+chat.visionImage} alt="attached"
                        style={{width:'52px',height:'52px',borderRadius:'10px',objectFit:'cover',border:'1px solid '+T.accentBorder+'55',display:'block'}}/>
                      <button onClick={()=>chat.setVisionImage(null)}
                        style={{position:'absolute',top:'-5px',right:'-5px',background:T.bg,border:'1px solid '+T.border,borderRadius:'50%',width:'16px',height:'16px',color:T.textMute,fontSize:'9px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,lineHeight:1}}>×</button>
                    </div>
                  </div>
                )}

                {/* Textarea — borderless, transparent */}
                <textarea ref={inputRef} value={chat.input}
                  onChange={e=>{
                    chat.setInput(e.target.value);
                    e.target.style.height='auto';
                    e.target.style.height=Math.min(e.target.scrollHeight,160)+'px';
                    if(e.target.value.startsWith('/')) chat.setSlashSuggestions(SLASH_COMMANDS.filter(s=>s.cmd.startsWith(e.target.value)));
                    else chat.setSlashSuggestions([]);
                  }}
                  onKeyDown={e=>{
                    if(e.key==='ArrowUp'&&!chat.input){const i=Math.min(project.histIdx+1,project.cmdHistory.length-1);project.setHistIdx(i);chat.setInput(project.cmdHistory[i]||'');}
                    if(e.key==='ArrowDown'&&project.histIdx>-1){const i=project.histIdx-1;project.setHistIdx(i);chat.setInput(i>=0?project.cmdHistory[i]:'');}
                  }}
                  placeholder="Tanya Yuyu, atau / untuk commands"
                  disabled={chat.loading} rows={1}
                  style={{width:'100%',background:'transparent',border:'none',outline:'none',resize:'none',padding:'12px 16px 4px',color:chat.loading?T.textMute:T.text,fontSize:'14px',fontFamily:'inherit',lineHeight:'1.6',display:'block',boxSizing:'border-box'}}
                />

                {/* Actions row */}
                <div style={{display:'flex',alignItems:'center',padding:'4px 8px 8px',gap:'2px'}}>
                  <button onClick={handleCameraCapture} title="Kamera"
                    style={{background:'none',border:'none',color:T.textMute,cursor:'pointer',borderRadius:'10px',width:'34px',height:'34px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'color .15s,background .15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=T.bg3;e.currentTarget.style.color=T.textSec;}}
                    onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color=T.textMute;}}
                  ><Camera size={16}/></button>
                  <button onClick={()=>fileInputRef.current?.click()} title="Lampirkan"
                    style={{background:'none',border:'none',color:T.textMute,cursor:'pointer',borderRadius:'10px',width:'34px',height:'34px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'color .15s,background .15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=T.bg3;e.currentTarget.style.color=T.textSec;}}
                    onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color=T.textMute;}}
                  ><Paperclip size={16}/></button>
                  <div style={{flex:1}}/>
                  <VoiceBtn disabled={chat.loading} T={T} onResult={txt=>{chat.setInput(i=>i?i+' '+txt:txt);inputRef.current?.focus();}}/>
                  {project.pushToTalk&&<PushToTalkBtn onResult={v=>{ if(v?.trim()) { chat.setInput(''); sendMsg(v.trim()); } else { chat.setInput(v); } }} disabled={chat.loading} T={T}/>}
                  <button onClick={()=>{if(chat.ttsEnabled){stopTts();chat.setTtsEnabled(false);}else chat.setTtsEnabled(true);}} title={chat.ttsEnabled?'TTS aktif':'TTS mati'}
                    style={{background:chat.ttsEnabled?T.accentBg:'none',border:'none',borderRadius:'10px',width:'34px',height:'34px',color:chat.ttsEnabled?T.accent:T.textMute,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}>
                    {chat.ttsEnabled?<Volume2 size={15}/>:<VolumeX size={15}/>}
                  </button>
                  {chat.loading
                    ?<button onClick={cancelMsg} title="Batalkan"
                        style={{background:T.errorBg,border:'none',borderRadius:'12px',color:T.error,cursor:'pointer',flexShrink:0,width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',marginLeft:'4px'}}>■</button>
                    :<button onClick={()=>sendMsg()} title="Kirim"
                        style={{background:chat.input.trim()?T.accent:'rgba(255,255,255,.08)',border:'none',borderRadius:'12px',color:chat.input.trim()?'white':T.textMute,cursor:chat.input.trim()?'pointer':'default',flexShrink:0,width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'700',marginLeft:'4px',transition:'background .15s,color .15s'}}>↑</button>
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAYS */}
      {ui.showSearch&&<SearchBar folder={project.folder} onSelectFile={p=>file.openFile(p)} onClose={()=>ui.setShowSearch(false)}/>}
      {ui.showShortcuts&&<ShortcutsPanel onClose={()=>ui.setShowShortcuts(false)}/>}
      {ui.showDiff&&<GitComparePanel folder={project.folder} T={T} onClose={()=>ui.setShowDiff(false)}/>}
      {ui.showBlame&&file.selectedFile&&<GitBlamePanel T={T} folder={project.folder} filePath={file.selectedFile} onClose={()=>ui.setShowBlame(false)}/>}
      {ui.showSnippets&&<SnippetLibrary T={T} onInsert={code=>{chat.setInput(i=>i?i+'\n'+code:code);ui.setShowSnippets(false);inputRef.current?.focus();}} onClose={()=>ui.setShowSnippets(false)}/>}
      {ui.showFileHistory&&file.selectedFile&&<FileHistoryPanel T={T} folder={project.folder} filePath={file.selectedFile} onClose={()=>ui.setShowFileHistory(false)}/>}
      {ui.showCustomActions&&<CustomActionsPanel T={T} folder={project.folder} onRun={cmd=>runShortcut(cmd)} onClose={()=>ui.setShowCustomActions(false)}/>}

      {ui.showPalette&&(
        <CommandPalette T={T} onClose={()=>ui.setShowPalette(false)}
          folder={project.folder} memories={chat.memories} checkpoints={chat.checkpoints} model={project.model} models={MODELS}
          onModelChange={id=>project.setModel(id)}
          onNewChat={()=>chat.clearChat()}
          theme={ui.theme} onThemeChange={t=>ui.setTheme(t)}
          showSidebar={ui.showSidebar} onToggleSidebar={()=>ui.setShowSidebar(s=>!s)}
          onShowMemory={()=>ui.setShowMemory(true)} onShowCheckpoints={()=>ui.setShowCheckpoints(true)}
          onShowMCP={()=>ui.setShowMCP(true)} onShowGitHub={()=>ui.setShowGitHub(true)} onShowDeploy={()=>ui.setShowDeploy(true)}
          onShowSessions={()=>{loadSessions().then(s=>{ui.setSessionList(s);ui.setShowSessions(true);});}}
          onShowPermissions={()=>ui.setShowPermissions(true)} onShowPlugins={()=>ui.setShowPlugins(true)} onShowConfig={()=>ui.setShowConfig(true)}
          onShowSkills={()=>ui.setShowSkills(true)}
          onShowDiff={()=>ui.setShowDiff(true)} onShowSearch={()=>ui.setShowSearch(true)}
          onShowSnippets={()=>ui.setShowSnippets(true)} onShowCustomActions={()=>ui.setShowCustomActions(true)}
          runTests={runTests} generateCommitMsg={generateCommitMsg} exportChat={chat.exportChat} compactContext={compactContext}
        />
      )}

      {/* MEMORY */}
      {ui.showMemory&&(
        <BottomSheet onClose={()=>ui.setShowMemory(false)} T={T}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'14px'}}>
              <span style={{fontSize:'13px',fontWeight:'600',color:T.text,flex:1,display:'flex',alignItems:'center',gap:'6px'}}><Brain size={13} style={{color:T.accent}}/> Auto Memories <span style={{color:T.textMute,fontWeight:'400'}}>({chat.memories.length})</span></span>
              <button onClick={()=>{chat.setMemories([]);}} style={{background:T.errorBg,border:'1px solid '+T.error+'33',borderRadius:'8px',padding:'4px 10px',color:T.error,fontSize:'11px',cursor:'pointer',marginRight:'8px',display:'flex',alignItems:'center',gap:'4px'}}><Trash2 size={10}/> Clear</button>
              <button onClick={()=>ui.setShowMemory(false)} style={{background:'none',border:'none',color:T.textMute,fontSize:'18px',cursor:'pointer',lineHeight:1}}>×</button>
            </div>
            <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'6px'}}>
              {chat.memories.length===0&&<div style={{color:T.textMute,fontSize:'12px',textAlign:'center',padding:'24px 0'}}>Belum ada memories~</div>}
              {chat.memories.map(m=>(
                <div key={m.id} style={{display:'flex',gap:'8px',padding:'10px 12px',background:T.bg3,border:'1px solid '+T.border,borderRadius:'10px',alignItems:'flex-start'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'12.5px',color:T.text,lineHeight:'1.5'}}>{m.text}</div>
                    <div style={{fontSize:'10px',color:T.textMute,marginTop:'4px'}}>{m.folder} · {m.ts}</div>
                  </div>
                  <button onClick={()=>{const next=chat.memories.filter(x=>x.id!==m.id);chat.setMemories(next);}} style={{background:'none',border:'none',color:T.error,opacity:.5,fontSize:'14px',cursor:'pointer',flexShrink:0,padding:'0 2px',lineHeight:1}} onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='.5'}>×</button>
                </div>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}

      {/* CHECKPOINTS */}
      {ui.showCheckpoints&&(
        <BottomSheet onClose={()=>ui.setShowCheckpoints(false)} T={T}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'14px'}}>
              <span style={{fontSize:'13px',fontWeight:'600',color:T.text,flex:1,display:'flex',alignItems:'center',gap:'6px'}}><MapPin size={13} style={{color:T.accent}}/> Checkpoints <span style={{color:T.textMute,fontWeight:'400'}}>({chat.checkpoints.length})</span></span>
              <button onClick={saveCheckpoint} style={{background:T.accentBg,border:'1px solid '+T.accentBorder,borderRadius:'8px',padding:'4px 10px',color:T.accent,fontSize:'11px',cursor:'pointer',marginRight:'8px',display:'flex',alignItems:'center',gap:'4px'}}><Plus size={10}/> Save</button>
              <button onClick={()=>ui.setShowCheckpoints(false)} style={{background:'none',border:'none',color:T.textMute,fontSize:'18px',cursor:'pointer',lineHeight:1}}>×</button>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              {chat.checkpoints.length===0&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Belum ada checkpoint~</div>}
              {chat.checkpoints.map(cp=>(
                <div key={cp.id} style={{display:'flex',gap:'8px',alignItems:'center',padding:'10px 12px',marginBottom:'6px',background:T.bg3,border:'1px solid '+T.border,borderRadius:'10px'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,.75)'}}>{cp.label}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)'}}>{cp.folder} · {cp.messages.length} pesan</div>
                  </div>
                  <button onClick={()=>restoreCheckpoint(cp)} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'5px',padding:'2px 8px',color:'#a78bfa',fontSize:'10px',cursor:'pointer'}}>restore</button>
                  <button onClick={()=>{const next=chat.checkpoints.filter(x=>x.id!==cp.id);chat.setCheckpoints(next);}} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer'}}>×</button>
                </div>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}

      {/* SWARM LOG */}
      {chat.swarmRunning&&(
        <div style={{position:'fixed',bottom:'80px',right:'12px',background:'rgba(0,0,0,.92)',border:'1px solid rgba(124,58,237,.3)',borderRadius:'10px',padding:'12px',zIndex:98,maxWidth:'280px',maxHeight:'200px',overflowY:'auto'}}>
          <div style={{fontSize:'11px',fontWeight:'600',color:'#a78bfa',marginBottom:'6px'}}><Zap size={13}/> Agent Swarm Running···</div>
          {chat.swarmLog.map((l,i)=><div key={i} style={{fontSize:'10px',color:'rgba(255,255,255,.6)',marginBottom:'2px'}}>{l}</div>)}
        </div>
      )}

      {ui.showDepGraph&&ui.depGraph&&<DepGraphPanel depGraph={ui.depGraph} onClose={()=>ui.setShowDepGraph(false)}/>}

      {ui.elicitationData&&(
        <ElicitationPanel data={ui.elicitationData}
          onSubmit={result=>{ui.setElicitationData(null);sendMsg(result);}}
          onDismiss={()=>ui.setElicitationData(null)}/>
      )}

      {ui.showMergeConflict&&ui.mergeConflictData&&(
        <MergeConflictPanel data={ui.mergeConflictData} folder={project.folder}
          onResolved={strategy=>{ui.setShowMergeConflict(false);ui.setMergeConflictData(null);chat.setMessages(m=>[...m,{role:'assistant',content:'✅ Konflik resolved via **'+strategy+'**.',actions:[]}]);}}
          onAborted={()=>{ui.setShowMergeConflict(false);ui.setMergeConflictData(null);chat.setMessages(m=>[...m,{role:'assistant',content:'↩ Merge dibatalkan.',actions:[]}]);}}
          onClose={()=>ui.setShowMergeConflict(false)}/>
      )}

      {ui.showThemeBuilder&&<ThemeBuilder current={ui.customTheme||THEMES[ui.theme]} onSave={t=>{ui.setCustomTheme(t);Preferences.set({key:'yc_custom_theme',value:JSON.stringify(t)});ui.setShowThemeBuilder(false);}} onClose={()=>ui.setShowThemeBuilder(false)}/>}

      {/* ONBOARDING */}
      {ui.showOnboarding&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.95)',zIndex:100,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{fontSize:'32px',marginBottom:'12px'}}>🌸</div>
          <div style={{fontSize:'20px',fontWeight:'700',color:'#f0f0f0',marginBottom:'6px'}}>Halo Papa! Yuyu siap~</div>
          <div style={{fontSize:'13px',color:'rgba(255,255,255,.5)',marginBottom:'24px',textAlign:'center'}}>Setup cepat sebelum mulai</div>
          <div style={{width:'100%',maxWidth:'320px',display:'flex',flexDirection:'column',gap:'10px'}}>
            <input value={project.folderInput} onChange={e=>project.setFolderInput(e.target.value)} placeholder="contoh: yuyucode"
              style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.15)',borderRadius:'8px',padding:'10px 14px',color:'#f0f0f0',fontSize:'14px',outline:'none',fontFamily:'monospace'}}/>
            <div style={{background:'rgba(0,0,0,.5)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'8px 12px',fontFamily:'monospace',fontSize:'11px',color:'rgba(74,222,128,.8)'}}>node ~/yuyu-server.js &</div>
            <button onClick={()=>{saveFolder(project.folderInput);Preferences.set({key:'yc_onboarded',value:'1'});ui.setShowOnboarding(false);haptic('medium');}}
              style={{background:'#7c3aed',border:'none',borderRadius:'10px',padding:'12px',color:'white',fontSize:'14px',cursor:'pointer',fontWeight:'600',marginTop:'8px'}}>
              Mulai Coding!
            </button>
          </div>
        </div>
      )}

      <Activity mode={ui.showMCP?'visible':'hidden'}>
      {/* MCP */}
      {ui.showMCP&&(
        <McpPanel T={T}
          mcpTools={project.mcpTools}
          folder={project.folder}
          onResult={async(tool,act)=>{const r=await callServer({type:'mcp',tool,action:act,params:{path:project.folder}});chat.setMessages(m=>[...m,{role:'assistant',content:`🔌 ${tool}/${act}:\n\`\`\`\n${(r.data||'').slice(0,1000)}\n\`\`\``,actions:[]}]);ui.setShowMCP(false);}}
          onClose={()=>ui.setShowMCP(false)}
        />
      )}

      </Activity>

      <Activity mode={ui.showGitHub?'visible':'hidden'}>
      {/* GITHUB */}
      {ui.showGitHub&&(
        <GitHubPanel
          githubRepo={project.githubRepo}
          githubToken={project.githubToken}
          githubData={project.githubData}
          onRepoChange={v=>project.setGithubRepo(v)}
          onTokenChange={v=>project.setGithubToken(v)}
          onFetch={fetchGitHub}
          onAskYuyu={item=>{chat.setMessages(m=>[...m,{role:'user',content:'Bantu fix issue: #'+item.number+' '+item.title+'\n\n'+item.body?.slice(0,300)}]);ui.setShowGitHub(false);}}
          onClose={()=>ui.setShowGitHub(false)}
        />
      )}

      </Activity>

      <Activity mode={ui.showSessions?'visible':'hidden'}>
      {/* SESSIONS */}
      {ui.showSessions&&(
        <SessionsPanel T={T}
          sessions={ui.sessionList}
          onRestore={s=>{chat.setMessages(s.messages||[]);project.setFolder(s.folder||'');project.setFolderInput(s.folder||'');ui.setShowSessions(false);chat.setMessages(m=>[...m,{role:'assistant',content:'✅ Sesi **'+s.name+'** dipulihkan.',actions:[]}]);}}
          onClose={()=>ui.setShowSessions(false)}
        />
      )}

      </Activity>

      <Activity mode={ui.showPermissions?'visible':'hidden'}>
      {/* PERMISSIONS */}
      {ui.showPermissions&&(
        <PermissionsPanel T={T}
          permissions={project.permissions}
          accentColor={T.accent}
          onToggle={tool=>project.setPermissions({...project.permissions,[tool]:!project.permissions[tool]})}
          onReset={()=>project.setPermissions({read_file:true,write_file:true,exec:true,list_files:true,search:true,mcp:false,delete_file:false,browse:false})}
          onClose={()=>ui.setShowPermissions(false)}
        />
      )}

      </Activity>

      <Activity mode={ui.showPlugins?'visible':'hidden'}>
      {/* PLUGINS */}
      {ui.showPlugins&&(
        <PluginsPanel T={T}
          activePlugins={project.activePlugins}
          folder={project.folder}
          onToggle={(p,isActive,folder)=>{
            const newActive={...project.activePlugins,[p.id]:!isActive};
            project.setActivePlugins(newActive);
            project.setHooks(prev=>{
              const hooksForType=[...(prev[p.hookType]||[])];
              const idx=hooksForType.findIndex(h=>typeof h==='object'&&h._pluginId===p.id);
              if(!isActive){if(idx===-1) hooksForType.push({type:'shell',command:p.cmd.replace('{{context}}',folder),_pluginId:p.id});}
              else{if(idx!==-1) hooksForType.splice(idx,1);}
              return {...prev,[p.hookType]:hooksForType};
            });
            chat.setMessages(m=>[...m,{role:'assistant',content:(isActive?'🔌 Plugin **'+p.name+'** dinonaktifkan.':'✅ Plugin **'+p.name+'** aktif!'),actions:[]}]);
          }}
          onClose={()=>ui.setShowPlugins(false)}
        />
      )}

      </Activity>

      {/* BG AGENTS */}
      <Activity mode={ui.showBgAgents?'visible':'hidden'}>
      {ui.showBgAgents&&(
        <BgAgentPanel
          agents={getBgAgents()}
          onMerge={async id=>{
            chat.setLoading(true);
            const result = await mergeBackgroundAgent(id, project.folder);
            if (result.hasConflicts) {
              ui.setMergeConflictData(result); ui.setShowMergeConflict(true);
            } else {
              chat.setMessages(m=>[...m,{role:'assistant',content:result.ok?'✅ '+result.msg:'❌ '+result.msg,actions:[]}]);
            }
            ui.setShowBgAgents(false);
            chat.setLoading(false);
          }}
          onAbort={id=>abortBgAgent(id)}
          onClose={()=>ui.setShowBgAgents(false)}
        />
      )}
      </Activity>

      <Activity mode={ui.showSkills?'visible':'hidden'}>
      {/* SKILLS */}
      {ui.showSkills&&(
        <SkillsPanel T={T}
          skills={project.skills}
          onToggle={name=>project.toggleSkill(name)}
          onUpload={async (name, text)=>{
            const r=await project.uploadSkill(name,text);
            chat.setMessages(m=>[...m,{role:'assistant',content:r.ok?'🧩 Skill **'+name+'** di-upload!':'❌ Upload gagal: '+r.data,actions:[]}]);
          }}
          onAdd={async (name, text)=>{
            const r=await project.uploadSkill(name,text);
            chat.setMessages(m=>[...m,{role:'assistant',content:r.ok?'🧩 Skill **'+name+'.md** disimpan!':'❌ Gagal: '+r.data,actions:[]}]);
          }}
          onRemove={async name=>{
            const r=await project.removeSkill(name);
            if(r.ok) chat.setMessages(m=>[...m,{role:'assistant',content:'🗑 Skill **'+name+'** dihapus.',actions:[]}]);
          }}
          onClose={()=>ui.setShowSkills(false)}
          accentColor={T.accent}
        />
      )}

      </Activity>

      <Activity mode={ui.showConfig?'visible':'hidden'}>
      {/* CONFIG */}
      {ui.showConfig&&(
        <ConfigPanel T={T}
          effort={project.effort}
          fontSize={ui.fontSize}
          theme={ui.theme}
          model={project.model}
          thinkingEnabled={project.thinkingEnabled}
          models={MODELS}
          onEffort={v=>project.setEffort(v)}
          onFontSize={v=>ui.setFontSize(v)}
          onTheme={v=>ui.setTheme(v)}
          onModel={v=>project.setModel(v)}
          onThinking={()=>project.setThinkingEnabled(!project.thinkingEnabled)}
          onClose={()=>ui.setShowConfig(false)}
        />
      )}

      </Activity>

      <Activity mode={ui.showDeploy?'visible':'hidden'}>
      {/* DEPLOY */}
      {ui.showDeploy&&(
        <DeployPanel T={T}
          deployLog={ui.deployLog}
          loading={chat.loading}
          onDeploy={runDeploy}
          onClose={()=>ui.setShowDeploy(false)}
        />
      )}

      </Activity>

      <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageAttach}/>

      {/* COMMIT MESSAGE MODAL */}
      {ui.commitModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:'#111113',border:'1px solid rgba(255,255,255,.1)',borderRadius:'14px',padding:'20px',width:'100%',maxWidth:'380px',boxShadow:'0 20px 60px rgba(0,0,0,.7)'}}>
            <div style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',marginBottom:'4px'}}>↑ Push ke Remote</div>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,.3)',marginBottom:'14px'}}>node yugit.cjs "..."</div>
            <input autoFocus value={ui.commitMsg} onChange={e=>ui.setCommitMsg(e.target.value)}
              onKeyDown={e=>{
                if(e.key==='Enter'&&ui.commitMsg.trim()){ui.setCommitModal(false);runShortcut('node yugit.cjs "'+ui.commitMsg.trim().replace(/"/g,'\\"')+'"');}
                if(e.key==='Escape') ui.setCommitModal(false);
              }}
              placeholder="commit message..."
              style={{width:'100%',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'8px',padding:'10px 12px',color:'#f0f0f0',fontSize:'13px',outline:'none',fontFamily:'monospace',marginBottom:'12px',boxSizing:'border-box'}}/>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>ui.setCommitModal(false)} style={{flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'8px',padding:'9px',color:'rgba(255,255,255,.4)',fontSize:'12px',cursor:'pointer'}}><X size={13}/> Batal</button>
              <button disabled={!ui.commitMsg.trim()} onClick={()=>{ui.setCommitModal(false);runShortcut('node yugit.cjs "'+ui.commitMsg.trim().replace(/"/g,'\\"')+'"');}}
                style={{flex:2,background:ui.commitMsg.trim()?T.accent:'rgba(255,255,255,.05)',border:'none',borderRadius:'8px',padding:'9px',color:'white',fontSize:'12px',cursor:ui.commitMsg.trim()?'pointer':'default',fontWeight:'600',opacity:ui.commitMsg.trim()?1:.4}}>
                ↑ Push
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
