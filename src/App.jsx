import React, { useRef, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { MAX_HISTORY, MODELS, THEMES, GIT_SHORTCUTS, FOLLOW_UPS, SLASH_COMMANDS } from './constants.js';
import { callServer } from './api.js';
import { countTokens, hl } from './utils.js';
import { loadSessions, tokenTracker } from './features.js';
import { MsgBubble, MsgContent } from './components/MsgBubble.jsx';
import { FileTree } from './components/FileTree.jsx';
import { FileEditor } from './components/FileEditor.jsx';
import { Terminal } from './components/Terminal.jsx';
import { SearchBar, UndoBar } from './components/SearchBar.jsx';
import { VoiceBtn, PushToTalkBtn } from './components/VoiceBtn.jsx';
import { GitDiffPanel, FileHistoryPanel, CustomActionsPanel, ShortcutsPanel, GitBlamePanel, SnippetLibrary, ThemeBuilder, CommandPalette, DepGraphPanel, ElicitationPanel, MergeConflictPanel, BottomSheet } from './components/panels.jsx';
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

export default function App() {
  // ── STORES ──
  const ui      = useUIStore();
  const project = useProjectStore();
  const file    = useFileStore();
  const chat    = useChatStore();
  const T       = ui.T;

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
  const { fileInputRef, handleImageAttach, handleDrop }  = useMediaHandlers({
    setVisionImage: chat.setVisionImage,
    setInput:       chat.setInput,
    haptic,
    setDragOver:    ui.setDragOver,
  });

  // ── AGENT LOOP (sendMsg, callAI, compactContext) ──
  const { sendMsg, callAI, compactContext, cancelMsg, continueMsg, retryLast } = useAgentLoop({
    project, chat, file, ui,
    sendNotification, haptic, speakText,
    abortRef, handleSlashCommandRef,
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
    sendMsg, compactContext,
    saveCheckpoint: () => chat.saveCheckpoint(project.folder, project.branch, project.notes),
    exportChat: chat.exportChat, generateCommitMsg, runTests, browseTo, runAgentSwarm,
    callAI, addHistory: project.addHistory, runHooks: project.runHooks,
    sendNotification, haptic, abortRef,
  });
  // Update ref setiap render — cegah stale closure di sendMsg
  handleSlashCommandRef.current = handleSlashCommand;

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
    callServer({type:'ping'}).then(r => { project.setServerOk(r.ok); if(r.mcp) project.setMcpTools(r.mcp); });
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [chat.messages, chat.streaming]);

  useEffect(() => {
    const on=()=>project.setNetOnline(true), off=()=>project.setNetOnline(false);
    window.addEventListener('online',on); window.addEventListener('offline',off);
    return () => { window.removeEventListener('online',on); window.removeEventListener('offline',off); };
  }, []);

  useEffect(() => {
    const iv = setInterval(async () => {
      const r = await callServer({type:'ping'});
      project.setServerOk(r.ok);
      project.setReconnectTimer(t => r.ok ? 0 : t + 5);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { chat.persistMessages(chat.messages); }, [chat.messages]);
  useEffect(() => { if(project.folder) project.loadFolderPrefs(project.folder); }, [project.folder]);

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
        } catch {}
      };
      ws.onerror  = () => {};
      ws.onclose  = () => { if (!dead) setTimeout(connect, 3000); };
    }
    connect();
    return () => { dead=true; if(wsRef.current){wsRef.current.onclose=null;wsRef.current.close();wsRef.current=null;} };
  }, [project.fileWatcherActive, project.folder]);

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

  const tokens = countTokens(chat.messages);
  const VIRTUAL_LIMIT = 60;
  const visibleMessages = chat.messages.length > VIRTUAL_LIMIT
    ? [{role:'assistant',content:`[... ${chat.messages.length-VIRTUAL_LIMIT} pesan tersembunyi. /clear untuk bersihkan]`},...chat.messages.slice(-VIRTUAL_LIMIT)]
    : chat.messages;

  // ── RENDER ──
  return (
    <div style={{position:'fixed',inset:0,background:T.bg,color:T.text,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',display:'flex',flexDirection:'column',fontSize:ui.fontSize+'px'}}
      onDragOver={e=>{e.preventDefault();ui.setDragOver(true);}} onDragLeave={()=>ui.setDragOver(false)} onDrop={handleDrop}>
      {ui.dragOver&&<div style={{position:'absolute',inset:0,background:'rgba(124,58,237,.15)',border:'2px dashed rgba(124,58,237,.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}><span style={{fontSize:'18px',color:'#a78bfa'}}>Drop file di sini~</span></div>}
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}textarea,input{scrollbar-width:none;}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}button{transition:color .15s,background .15s,opacity .15s;}button:active{opacity:.6!important;}.msg-appear{animation:fadeIn .18s ease forwards;}`}</style>

      {project.sessionColor&&<div style={{height:'2px',background:project.sessionColor,flexShrink:0}}/>}

      {/* HEADER */}
      <div style={{flexShrink:0,background:T.bg,borderBottom:'1px solid '+T.border}}>
        <div style={{height:'50px',padding:'0 10px',display:'flex',alignItems:'center',gap:'8px'}}>
          <button onClick={()=>ui.setShowSidebar(!ui.showSidebar)} style={{background:'none',border:'none',color:ui.showSidebar?T.accent:'rgba(255,255,255,.3)',fontSize:'18px',cursor:'pointer',padding:'6px',borderRadius:'8px',lineHeight:1,minWidth:'36px',minHeight:'36px',display:'flex',alignItems:'center',justifyContent:'center'}}>☰</button>
          <div style={{flex:1,cursor:'pointer',minWidth:0,overflow:'hidden'}} onClick={()=>ui.setShowFolder(!ui.showFolder)}>
            <div style={{fontSize:'14px',fontWeight:'700',color:T.text,letterSpacing:'-0.3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              YuyuCode
              <span style={{fontSize:'11px',fontWeight:'400',color:'rgba(255,255,255,.3)',marginLeft:'8px'}}>{project.folder?.split('/').pop()}</span>
            </div>
          </div>
          <button onClick={()=>ui.setShowPalette(true)} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',borderRadius:'10px',padding:'7px 12px',color:'rgba(255,255,255,.5)',fontSize:'13px',cursor:'pointer',minWidth:'40px',minHeight:'38px',display:'flex',alignItems:'center',justifyContent:'center'}}>⌘</button>
          <button onClick={()=>{chat.clearChat();haptic('light');}} style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'10px',padding:'7px 12px',color:'rgba(255,255,255,.35)',fontSize:'12px',cursor:'pointer',minHeight:'38px'}}>new</button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'0 12px 6px',overflowX:'auto'}}>
          <div style={{width:'6px',height:'6px',borderRadius:'50%',background:project.serverOk?'#4ade80':'#f87171',flexShrink:0}}/>
          <button onClick={()=>{const i=MODELS.findIndex(m=>m.id===project.model);const next=MODELS[(i+1)%MODELS.length];project.setModel(next.id);}} style={{background:'none',border:'none',padding:0,color:'rgba(255,255,255,.35)',fontSize:'10px',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,fontFamily:'monospace'}}>
            {MODELS.find(m=>m.id===project.model)?.label||'AI'}
          </button>
          <span style={{fontSize:'10px',color:'rgba(255,255,255,.18)',flexShrink:0,fontFamily:'monospace'}}>⎇ {project.branch}</span>
          <span style={{fontSize:'10px',color:'rgba(255,255,255,.18)',flexShrink:0,fontFamily:'monospace'}}>~{tokens}tk</span>
          {project.skill&&<span style={{fontSize:'9px',color:'rgba(74,222,128,.5)',flexShrink:0,fontWeight:'600',fontFamily:'monospace'}}>SKILL</span>}
          <span style={{fontSize:'10px',color:project.effort==='low'?'rgba(74,222,128,.5)':project.effort==='high'?'rgba(248,113,113,.5)':'rgba(255,255,255,.18)',flexShrink:0}}>{project.effort==='low'?'low':project.effort==='high'?'high':'med'}</span>
        </div>
      </div>

      {ui.showFolder&&(
        <div style={{padding:'8px 12px',borderBottom:'1px solid '+T.border,display:'flex',gap:'6px',background:T.bg2,flexShrink:0}}>
          <input value={project.folderInput} onChange={e=>project.setFolderInput(e.target.value)} placeholder="nama folder" onKeyDown={e=>e.key==='Enter'&&saveFolder(project.folderInput)}
            style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'6px 10px',color:T.text,fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <button onClick={()=>saveFolder(project.folderInput)} style={{background:'rgba(255,255,255,.08)',border:'none',borderRadius:'6px',padding:'6px 12px',color:'rgba(255,255,255,.7)',fontSize:'12px',cursor:'pointer'}}>set</button>
        </div>
      )}

      <UndoBar history={file.editHistory} onUndo={undoLastEdit}/>

      {!project.netOnline&&<div style={{padding:'3px 12px',background:'rgba(248,113,113,.08)',borderBottom:'1px solid rgba(248,113,113,.12)',fontSize:'10px',color:'#f87171',flexShrink:0}}>📡 Offline</div>}
      {chat.rateLimitTimer>0&&<div style={{padding:'3px 12px',background:'rgba(251,191,36,.05)',borderBottom:'1px solid rgba(251,191,36,.08)',fontSize:'10px',color:'rgba(251,191,36,.7)',flexShrink:0}}>⏳ Rate limit {chat.rateLimitTimer}s</div>}
      {chat.agentRunning&&<div style={{padding:'3px 12px',background:'rgba(124,58,237,.05)',borderBottom:'1px solid rgba(124,58,237,.1)',fontSize:'10px',color:'#a78bfa',flexShrink:0}}>● Yuyu lagi jalan···</div>}
      {project.reconnectTimer>0&&!project.serverOk&&<div style={{padding:'3px 12px',background:'rgba(248,113,113,.05)',borderBottom:'1px solid rgba(248,113,113,.1)',fontSize:'10px',color:'#f87171',flexShrink:0}}>↺ Reconnecting···</div>}
      {countTokens(chat.messages)>15000&&<div style={{padding:'3px 12px',background:'rgba(251,191,36,.04)',borderBottom:'1px solid rgba(251,191,36,.07)',fontSize:'10px',color:'rgba(251,191,36,.6)',flexShrink:0}}>⚠ Context besar ~{countTokens(chat.messages)}tk</div>}

      <div style={{flex:1,display:'flex',overflow:'hidden',position:'relative'}}>

        {/* SIDEBAR */}
        {ui.showSidebar&&(
          <div style={{width:ui.sidebarWidth+'px',borderRight:'1px solid '+T.border,display:'flex',flexDirection:'column',flexShrink:0,background:T.bg2,position:'relative'}}>
            <div style={{padding:'5px 8px',borderBottom:'1px solid rgba(255,255,255,.05)',display:'flex',gap:'4px',alignItems:'center'}}>
              <span style={{fontSize:'10px',color:'rgba(255,255,255,.25)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{project.folder}</span>
            </div>
            {file.recentFiles.length>0&&(
              <div style={{padding:'4px 8px',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                <div style={{fontSize:'9px',color:'rgba(255,255,255,.2)',marginBottom:'3px',letterSpacing:'.05em'}}>RECENT</div>
                {file.recentFiles.slice(0,4).map(f=>(
                  <div key={f} onClick={()=>file.openFile(f)} style={{fontSize:'11px',color:'rgba(255,255,255,.4)',padding:'2px 4px',cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',borderRadius:'3px'}}
                    onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.4)'}>
                    {f.split('/').pop()}
                  </div>
                ))}
              </div>
            )}
            <div style={{flex:1,overflow:'hidden'}}>
              <FileTree folder={project.folder} onSelectFile={p=>file.openFile(p)} selectedFile={file.selectedFile}/>
            </div>
            <div onMouseDown={onSidebarDragStart} onTouchStart={onSidebarDragStart}
              style={{position:'absolute',top:0,right:-3,bottom:0,width:'6px',cursor:'col-resize',background:ui.dragging?'rgba(124,58,237,.3)':'transparent'}}/>
          </div>
        )}

        {/* CENTER */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* TABS */}
          <div style={{display:'flex',borderBottom:'1px solid '+T.border,flexShrink:0,background:T.bg,height:'48px',alignItems:'stretch'}}>
            <button onClick={()=>file.setActiveTab('chat')} style={{padding:'0 14px',background:'none',border:'none',borderBottom:file.activeTab==='chat'?'2px solid '+T.accent:'2px solid transparent',color:file.activeTab==='chat'?T.accent:'rgba(255,255,255,.3)',fontSize:'13px',cursor:'pointer',fontWeight:file.activeTab==='chat'?'600':'400'}}>Chat</button>
            {file.selectedFile&&(
              <>
                <button onClick={()=>{file.setActiveTab('file');file.setEditMode(false);}} style={{padding:'0 12px',background:'none',border:'none',borderBottom:file.activeTab==='file'&&!file.editMode?'2px solid '+T.accent:'2px solid transparent',color:file.activeTab==='file'&&!file.editMode?T.accent:'rgba(255,255,255,.3)',fontSize:'12px',cursor:'pointer',maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis'}}>{file.selectedFile.split('/').pop()}</button>
                <button onClick={()=>{file.setActiveTab('file');file.setEditMode(true);}} style={{padding:'0 10px',background:'none',border:'none',borderBottom:file.editMode?'2px solid #f59e0b':'2px solid transparent',color:file.editMode?'#f59e0b':'rgba(255,255,255,.25)',fontSize:'11px',cursor:'pointer'}}>edit</button>
              </>
            )}
            <div style={{flex:1}}/>
            <button onClick={()=>ui.setShowTerminal(!ui.showTerminal)} style={{padding:'0 12px',background:'none',border:'none',borderBottom:ui.showTerminal?'2px solid rgba(255,255,255,.3)':'2px solid transparent',color:ui.showTerminal?'rgba(255,255,255,.6)':'rgba(255,255,255,.2)',fontSize:'11px',cursor:'pointer',fontFamily:'monospace'}}>$</button>
          </div>

          {/* CHAT */}
          {file.activeTab==='chat'&&!ui.showTerminal&&(
            <div ref={chatRef} style={{flex:1,overflowY:'auto',padding:'12px 0'}}>
              {visibleMessages.map((m,i)=>(
                <MsgBubble key={i} msg={m} isLast={i===chat.messages.length-1}
                  onApprove={m.actions?.some(a=>(a.type==='write_file'||a.type==='patch_file')&&!a.executed)?(ok,path)=>handleApprove(i,ok,path):null}
                  onPlanApprove={m.content?.includes('📋 **Plan (')&&!m.planApproved?(ok)=>handlePlanApprove(i,ok):null}
                  onRetry={i===chat.messages.length-1&&m.role==='user'?retryLast:null}
                  onContinue={i===chat.messages.length-1&&m.role==='assistant'&&m.content.trim().endsWith('CONTINUE')?continueMsg:null}
                  onAutoFix={i===chat.messages.length-1?()=>sendMsg('Ada error di output. Analisis dan fix otomatis.'):null}
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
          )}

          {/* FILE VIEWER */}
          {file.activeTab==='file'&&file.selectedFile&&!file.editMode&&!ui.showTerminal&&(
            <div style={{flex:1,overflow:'auto'}}>
              <div style={{padding:'5px 12px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:'6px',background:T.bg2,position:'sticky',top:0,flexWrap:'wrap'}}>
                <span style={{fontSize:'11px',color:'rgba(255,255,255,.4)',fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.selectedFile}</span>
                <button onClick={()=>file.togglePin(file.selectedFile)} style={{background:file.pinnedFiles.includes(file.selectedFile)?'rgba(99,102,241,.15)':'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'5px',padding:'2px 6px',color:file.pinnedFiles.includes(file.selectedFile)?'#818cf8':'rgba(255,255,255,.3)',fontSize:'10px',cursor:'pointer',flexShrink:0}}>📌</button>
                <button onClick={()=>sendMsg('Yu, jalankan git log --oneline -10 -- '+file.selectedFile.replace(project.folder+'/',''))} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'5px',padding:'2px 6px',color:'rgba(255,255,255,.35)',fontSize:'10px',cursor:'pointer',flexShrink:0}}>📜</button>
                <button onClick={()=>ui.setShowBlame(true)} style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.15)',borderRadius:'5px',padding:'2px 6px',color:'rgba(99,102,241,.7)',fontSize:'10px',cursor:'pointer',flexShrink:0}}>👁 blame</button>
                <button onClick={()=>ui.setShowFileHistory(true)} style={{background:'rgba(251,191,36,.06)',border:'1px solid rgba(251,191,36,.12)',borderRadius:'5px',padding:'2px 6px',color:'rgba(251,191,36,.6)',fontSize:'10px',cursor:'pointer',flexShrink:0}}>📜 history</button>
                <button onClick={()=>{chat.setMessages(m=>[...m,{role:'user',content:'Yu, ini konteks file '+file.selectedFile+':\n```\n'+(file.fileContent||'').slice(0,2000)+'\n```'}]);file.setActiveTab('chat');}} style={{background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'5px',padding:'2px 6px',color:'#4ade80',fontSize:'10px',cursor:'pointer',flexShrink:0}}>+ctx</button>
                <button onClick={()=>sendMsg('Yu, jelaskan file '+file.selectedFile)} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'5px',padding:'2px 8px',color:'#a78bfa',fontSize:'10px',cursor:'pointer',flexShrink:0}}>Tanya</button>
                <button onClick={()=>{file.setSelectedFile(null);file.setFileContent(null);file.setActiveTab('chat');}} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:'14px',cursor:'pointer',flexShrink:0}}>×</button>
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
          {ui.showTerminal&&<div style={{flex:1,overflow:'hidden'}}><Terminal folder={project.folder} cmdHistory={project.cmdHistory} addHistory={project.addHistory} onSendToAI={txt=>{ui.setShowTerminal(false);file.setActiveTab('chat');sendMsg(txt);}}/></div>}

          {/* FOLLOW UPS */}
          {chat.showFollowUp&&!chat.loading&&file.activeTab==='chat'&&!ui.showTerminal&&(
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',padding:'6px 16px',flexShrink:0}}>
              {FOLLOW_UPS.map(p=>(
                <button key={p} onClick={()=>sendMsg(p)} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px',padding:'4px 10px',color:'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer'}}>{p}</button>
              ))}
            </div>
          )}

          {/* QUICK BAR */}
          {!ui.showTerminal&&(
            <div style={{height:'44px',padding:'0 10px',borderTop:'1px solid '+T.border,display:'flex',alignItems:'center',gap:'2px',flexShrink:0,overflowX:'auto'}}>
              {GIT_SHORTCUTS.map(s=>(
                <button key={s.label} disabled={chat.loading}
                  onClick={()=>{ if(s.cmd.includes('yugit.cjs')){ui.setCommitMsg('');ui.setCommitModal(true);}else{runShortcut(s.cmd);} }}
                  style={{background:'none',border:'none',padding:'4px 8px',color:'rgba(255,255,255,.3)',fontSize:'10px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace',borderRadius:'5px',display:'flex',alignItems:'center',gap:'3px'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                  <span style={{opacity:.6}}>{s.icon}</span><span>{s.label}</span>
                </button>
              ))}
              <div style={{flex:1}}/>
              {file.pinnedFiles.map(f=>(
                <button key={f} onClick={()=>file.openFile(f)} style={{background:'rgba(99,102,241,.08)',border:'none',borderRadius:'4px',padding:'2px 7px',color:'rgba(99,102,241,.6)',fontSize:'9px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace'}}>{f.split('/').pop()}</button>
              ))}
            </div>
          )}

          {/* INPUT */}
          {!ui.showTerminal&&(
            <div style={{padding:'8px 10px',paddingBottom:'calc(8px + env(safe-area-inset-bottom, 0px))',borderTop:'1px solid '+T.border,background:T.bg,flexShrink:0,position:'relative'}}>
              {chat.slashSuggestions.length>0&&(
                <div style={{position:'absolute',bottom:'100%',left:'10px',right:'10px',background:'#111113',border:'1px solid rgba(255,255,255,.1)',borderRadius:'10px',zIndex:99,marginBottom:'6px',boxShadow:'0 12px 32px rgba(0,0,0,.6)',maxHeight:'260px',overflowY:'auto'}}>
                  {chat.slashSuggestions.map(s=>(
                    <div key={s.cmd} onClick={()=>{chat.setInput(s.cmd);chat.setSlashSuggestions([]);inputRef.current?.focus();}}
                      style={{display:'flex',gap:'10px',padding:'8px 12px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.04)'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span style={{color:T.accent,fontFamily:'monospace',fontSize:'12px',flexShrink:0,minWidth:'100px'}}>{s.cmd}</span>
                      <span style={{color:'rgba(255,255,255,.35)',fontSize:'12px'}}>{s.desc}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:'flex',gap:'6px',alignItems:'flex-end'}}>
                {chat.visionImage&&(
                  <div style={{position:'relative',flexShrink:0}}>
                    <img src={'data:image/jpeg;base64,'+chat.visionImage} alt="attached" style={{width:'36px',height:'36px',borderRadius:'7px',objectFit:'cover',border:'1px solid rgba(124,58,237,.3)'}}/>
                    <button onClick={()=>chat.setVisionImage(null)} style={{position:'absolute',top:'-4px',right:'-4px',background:'#f87171',border:'none',borderRadius:'50%',width:'13px',height:'13px',color:'white',fontSize:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>×</button>
                  </div>
                )}
                <button onClick={()=>fileInputRef.current?.click()} style={{background:'none',border:'none',padding:'8px 4px',color:'rgba(255,255,255,.2)',fontSize:'15px',cursor:'pointer',flexShrink:0,borderRadius:'8px'}}>📎</button>
                <textarea ref={inputRef} value={chat.input}
                  onChange={e=>{
                    chat.setInput(e.target.value);
                    e.target.style.height='auto';
                    e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';
                    if(e.target.value.startsWith('/')) chat.setSlashSuggestions(SLASH_COMMANDS.filter(s=>s.cmd.startsWith(e.target.value)));
                    else chat.setSlashSuggestions([]);
                  }}
                  onKeyDown={e=>{
                    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();return;}
                    if(e.key==='ArrowUp'&&!chat.input){const i=Math.min(project.histIdx+1,project.cmdHistory.length-1);project.setHistIdx(i);chat.setInput(project.cmdHistory[i]||'');}
                    if(e.key==='ArrowDown'&&project.histIdx>-1){const i=project.histIdx-1;project.setHistIdx(i);chat.setInput(i>=0?project.cmdHistory[i]:'');}
                  }}
                  placeholder="Tanya Yuyu, atau / untuk commands"
                  disabled={chat.loading} rows={1}
                  style={{flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'10px',padding:'9px 12px',color:chat.loading?'rgba(255,255,255,.25)':T.text,fontSize:'13px',resize:'none',outline:'none',fontFamily:'inherit',lineHeight:'1.5'}}/>
                {chat.loading
                  ?<button onClick={cancelMsg} style={{background:'rgba(248,113,113,.1)',border:'none',borderRadius:'10px',padding:'9px 14px',color:'#f87171',fontSize:'14px',cursor:'pointer',flexShrink:0}}>■</button>
                  :<button onClick={()=>sendMsg()} style={{background:T.accent,border:'none',borderRadius:'10px',padding:'9px 16px',color:'white',fontSize:'14px',cursor:'pointer',fontWeight:'600',flexShrink:0}}>↑</button>
                }
                <VoiceBtn disabled={chat.loading} onResult={txt=>{chat.setInput(i=>i?i+' '+txt:txt);inputRef.current?.focus();}}/>
                {project.pushToTalk&&<PushToTalkBtn onResult={v=>{chat.setInput('');setTimeout(()=>sendMsg(v),100);}} disabled={chat.loading}/>}
                <button onClick={()=>{if(chat.ttsEnabled){stopTts();chat.setTtsEnabled(false);}else chat.setTtsEnabled(true);}}
                  style={{background:chat.ttsEnabled?'rgba(124,58,237,.2)':'rgba(255,255,255,.04)',border:'1px solid '+(chat.ttsEnabled?'rgba(124,58,237,.4)':'rgba(255,255,255,.08)'),borderRadius:'10px',padding:'8px 10px',color:chat.ttsEnabled?'#a78bfa':'rgba(255,255,255,.3)',fontSize:'13px',cursor:'pointer',flexShrink:0}}>
                  {chat.ttsEnabled?'🔊':'🔇'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAYS */}
      {ui.showSearch&&<SearchBar folder={project.folder} onSelectFile={p=>file.openFile(p)} onClose={()=>ui.setShowSearch(false)}/>}
      {ui.showShortcuts&&<ShortcutsPanel onClose={()=>ui.setShowShortcuts(false)}/>}
      {ui.showDiff&&<GitDiffPanel folder={project.folder} onClose={()=>ui.setShowDiff(false)}/>}
      {ui.showBlame&&file.selectedFile&&<GitBlamePanel folder={project.folder} filePath={file.selectedFile} onClose={()=>ui.setShowBlame(false)}/>}
      {ui.showSnippets&&<SnippetLibrary onInsert={code=>{chat.setInput(i=>i?i+'\n'+code:code);ui.setShowSnippets(false);inputRef.current?.focus();}} onClose={()=>ui.setShowSnippets(false)}/>}
      {ui.showFileHistory&&file.selectedFile&&<FileHistoryPanel folder={project.folder} filePath={file.selectedFile} onClose={()=>ui.setShowFileHistory(false)}/>}
      {ui.showCustomActions&&<CustomActionsPanel folder={project.folder} onRun={cmd=>runShortcut(cmd)} onClose={()=>ui.setShowCustomActions(false)}/>}

      {ui.showPalette&&(
        <CommandPalette onClose={()=>ui.setShowPalette(false)}
          folder={project.folder} memories={chat.memories} checkpoints={chat.checkpoints} model={project.model} models={MODELS}
          onModelChange={id=>project.setModel(id)}
          onNewChat={()=>chat.clearChat()}
          theme={ui.theme} onThemeChange={t=>ui.setTheme(t)}
          showSidebar={ui.showSidebar} onToggleSidebar={()=>ui.setShowSidebar(s=>!s)}
          onShowMemory={()=>ui.setShowMemory(true)} onShowCheckpoints={()=>ui.setShowCheckpoints(true)}
          onShowMCP={()=>ui.setShowMCP(true)} onShowGitHub={()=>ui.setShowGitHub(true)} onShowDeploy={()=>ui.setShowDeploy(true)}
          onShowSessions={()=>{loadSessions().then(s=>{ui.setSessionList(s);ui.setShowSessions(true);});}}
          onShowPermissions={()=>ui.setShowPermissions(true)} onShowPlugins={()=>ui.setShowPlugins(true)} onShowConfig={()=>ui.setShowConfig(true)}
          onShowDiff={()=>ui.setShowDiff(true)} onShowSearch={()=>ui.setShowSearch(true)}
          onShowSnippets={()=>ui.setShowSnippets(true)} onShowCustomActions={()=>ui.setShowCustomActions(true)}
          runTests={runTests} generateCommitMsg={generateCommitMsg} exportChat={chat.exportChat} compactContext={compactContext}
        />
      )}

      {/* MEMORY */}
      {ui.showMemory&&(
        <BottomSheet onClose={()=>ui.setShowMemory(false)}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🧠 Auto Memories ({chat.memories.length})</span>
              <button onClick={()=>{chat.setMemories([]);}} style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'5px',padding:'2px 8px',color:'#f87171',fontSize:'10px',cursor:'pointer',marginRight:'8px'}}>clear all</button>
              <button onClick={()=>ui.setShowMemory(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              {chat.memories.length===0&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Belum ada memories~</div>}
              {chat.memories.map(m=>(
                <div key={m.id} style={{display:'flex',gap:'8px',padding:'7px 10px',marginBottom:'4px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'7px'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,.75)'}}>{m.text}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,.25)',marginTop:'2px'}}>{m.folder} · {m.ts}</div>
                  </div>
                  <button onClick={()=>{const next=chat.memories.filter(x=>x.id!==m.id);chat.setMemories(next);}} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer',flexShrink:0}}>×</button>
                </div>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}

      {/* CHECKPOINTS */}
      {ui.showCheckpoints&&(
        <BottomSheet onClose={()=>ui.setShowCheckpoints(false)}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>📍 Checkpoints</span>
              <button onClick={saveCheckpoint} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'10px',cursor:'pointer',marginRight:'8px'}}>+ Save now</button>
              <button onClick={()=>ui.setShowCheckpoints(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              {chat.checkpoints.length===0&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Belum ada checkpoint~</div>}
              {chat.checkpoints.map(cp=>(
                <div key={cp.id} style={{display:'flex',gap:'8px',alignItems:'center',padding:'8px 10px',marginBottom:'4px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'7px'}}>
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
          <div style={{fontSize:'11px',fontWeight:'600',color:'#a78bfa',marginBottom:'6px'}}>🐝 Agent Swarm Running···</div>
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
              Mulai Coding! 🚀
            </button>
          </div>
        </div>
      )}

      {/* MCP */}
      {ui.showMCP&&(
        <BottomSheet onClose={()=>ui.setShowMCP(false)}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🔌 MCP Tools</span>
              <button onClick={()=>ui.setShowMCP(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
            </div>
            {Object.keys(project.mcpTools).length === 0 && (
              <div style={{color:'rgba(255,255,255,.3)',fontSize:'12px',padding:'8px 0'}}>Tidak ada MCP tools terdeteksi dari server.<br/>Pastikan yuyu-server.js sudah jalan.</div>
            )}
            {(Object.keys(project.mcpTools).length > 0
              ? Object.entries(project.mcpTools)
              : [['git',['status','log','diff']],['fetch',['browse']],['sqlite',['tables']],['github',['issues','pulls']],['system',['disk','memory']],['filesystem',['list']]]
            ).map(([tool, actions])=>(
              <div key={tool} style={{padding:'10px 12px',marginBottom:'6px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(74,222,128,.1)',borderRadius:'8px'}}>
                <span style={{fontSize:'13px',color:'#4ade80',fontFamily:'monospace',fontWeight:'600'}}>{tool}</span>
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'6px'}}>
                  {(Array.isArray(actions) ? actions : Object.keys(actions)).map(act=>(
                    <button key={act} onClick={async()=>{const r=await callServer({type:'mcp',tool,action:act,params:{path:project.folder}});chat.setMessages(m=>[...m,{role:'assistant',content:`🔌 ${tool}/${act}:\n\`\`\`\n${(r.data||'').slice(0,1000)}\n\`\`\``,actions:[]}]);ui.setShowMCP(false);}}
                      style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'4px',padding:'2px 8px',color:'rgba(74,222,128,.8)',fontSize:'10px',cursor:'pointer',fontFamily:'monospace'}}>{act}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* GITHUB */}
      {ui.showGitHub&&(
        <BottomSheet onClose={()=>ui.setShowGitHub(false)}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>⑂ GitHub</span>
              <button onClick={()=>ui.setShowGitHub(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'12px'}}>
              <input value={project.githubRepo} onChange={e=>project.setGithubRepo(e.target.value)} placeholder="owner/repo" style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'7px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
              <input value={project.githubToken} onChange={e=>project.setGithubToken(e.target.value)} placeholder="GitHub token" type="password" style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'7px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
              <div style={{display:'flex',gap:'6px'}}>
                <button onClick={()=>fetchGitHub('issues')} style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:'6px',padding:'5px 12px',color:'#818cf8',fontSize:'11px',cursor:'pointer',flex:1}}>📋 Issues</button>
                <button onClick={()=>fetchGitHub('pulls')} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'6px',padding:'5px 12px',color:'#4ade80',fontSize:'11px',cursor:'pointer',flex:1}}>🔀 PRs</button>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              {project.githubData&&Array.isArray(project.githubData.data)&&project.githubData.data.map((item,i)=>(
                <div key={i} style={{padding:'8px 10px',marginBottom:'4px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'7px'}}>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,.8)',marginBottom:'2px'}}>#{item.number} {item.title}</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,.35)'}}>{item.state} · {item.user?.login}</div>
                  <button onClick={()=>{chat.setMessages(m=>[...m,{role:'user',content:'Bantu fix issue: #'+item.number+' '+item.title+'\n\n'+item.body?.slice(0,300)}]);ui.setShowGitHub(false);}} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'4px',padding:'2px 7px',color:'#a78bfa',fontSize:'10px',cursor:'pointer',marginTop:'4px'}}>Ask Yuyu</button>
                </div>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}

      {/* SESSIONS */}
      {ui.showSessions&&(
        <BottomSheet onClose={()=>ui.setShowSessions(false)}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>💾 Saved Sessions</span>
              <button onClick={()=>ui.setShowSessions(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
            </div>
            {ui.sessionList.length===0&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Belum ada sesi tersimpan. Ketik /save~</div>}
            <div style={{flex:1,overflowY:'auto'}}>
              {ui.sessionList.map(s=>(
                <div key={s.id} style={{padding:'10px 12px',marginBottom:'6px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'8px',display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',color:'#f0f0f0',fontWeight:'500'}}>{s.name}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,.35)'}}>{s.folder} · {new Date(s.savedAt).toLocaleString('id')} · {s.messages?.length||0} pesan</div>
                  </div>
                  <button onClick={()=>{chat.setMessages(s.messages||[]);project.setFolder(s.folder||'');project.setFolderInput(s.folder||'');ui.setShowSessions(false);chat.setMessages(m=>[...m,{role:'assistant',content:'✅ Sesi **'+s.name+'** dipulihkan.',actions:[]}]);}} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'6px',padding:'4px 10px',color:'#a78bfa',fontSize:'11px',cursor:'pointer'}}>Restore</button>
                </div>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}

      {/* PERMISSIONS */}
      {ui.showPermissions&&(
        <BottomSheet onClose={()=>ui.setShowPermissions(false)}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🔐 Tool Permissions</span>
              <button onClick={()=>ui.setShowPermissions(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              {Object.entries(project.permissions).map(([tool,allowed])=>(
                <div key={tool} style={{display:'flex',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',color:'#f0f0f0',fontFamily:'monospace'}}>{tool}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)'}}>{allowed?'Auto-run':'Butuh konfirmasi'}</div>
                  </div>
                  <div onClick={()=>{const next={...project.permissions,[tool]:!allowed};project.setPermissions(next);}} style={{width:'42px',height:'24px',borderRadius:'12px',background:allowed?'#7c3aed':'rgba(255,255,255,.1)',cursor:'pointer',position:'relative',transition:'all .2s',flexShrink:0}}>
                    <div style={{position:'absolute',top:'3px',left:allowed?'21px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'white',transition:'all .2s'}}/>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={()=>project.setPermissions({read_file:true,write_file:false,exec:false,list_files:true,search:true,mcp:false,delete_file:false,browse:false})} style={{marginTop:'12px',background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'8px',padding:'8px',color:'#f87171',fontSize:'12px',cursor:'pointer'}}>Reset ke Default</button>
          </div>
        </BottomSheet>
      )}

      {/* PLUGINS */}
      {ui.showPlugins&&(
        <BottomSheet onClose={()=>ui.setShowPlugins(false)}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🔌 Plugin Marketplace</span>
              <button onClick={()=>ui.setShowPlugins(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
            </div>
            {[
              {id:'auto_commit',  name:'Auto Commit',   desc:'Commit otomatis setelah write_file', hookType:'postWrite', cmd:'cd {{context}} && git add -A && git commit -m "auto: yuyu save $(date +%H:%M)"'},
              {id:'lint_on_save', name:'Lint on Save',  desc:'ESLint check sebelum save',          hookType:'preWrite',  cmd:'cd {{context}} && npx eslint src --max-warnings 0 2>&1 | tail -5'},
              {id:'test_runner',  name:'Test Runner',   desc:'Jalankan tests setelah write',       hookType:'postWrite', cmd:'cd {{context}} && npm test -- --watchAll=false --passWithNoTests 2>&1 | tail -10'},
              {id:'auto_push',   name:'Git Auto Push', desc:'Push ke remote setelah commit',       hookType:'postWrite', cmd:'node yugit.cjs "auto push"'},
            ].map(p=>{
              const isActive=!!project.activePlugins[p.id];
              function togglePlugin(){
                const newActive={...project.activePlugins,[p.id]:!isActive};
                project.setActivePlugins(newActive);
                project.setHooks(prev=>{
                  const hooksForType=[...(prev[p.hookType]||[])];
                  const idx=hooksForType.findIndex(h=>typeof h==='object'&&h._pluginId===p.id);
                  if(!isActive){if(idx===-1) hooksForType.push({type:'shell',command:p.cmd.replace('{{context}}',project.folder)+'',_pluginId:p.id});}
                  else{if(idx!==-1) hooksForType.splice(idx,1);}
                  return {...prev,[p.hookType]:hooksForType};
                });
                chat.setMessages(m=>[...m,{role:'assistant',content:(isActive?'🔌 Plugin **'+p.name+'** dinonaktifkan.':'✅ Plugin **'+p.name+'** aktif!'),actions:[]}]);
              }
              return(
                <div key={p.id} style={{padding:'10px 12px',marginBottom:'8px',background:isActive?'rgba(74,222,128,.04)':'rgba(255,255,255,.03)',border:'1px solid '+(isActive?'rgba(74,222,128,.18)':'rgba(255,255,255,.07)'),borderRadius:'8px',display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',color:isActive?'#4ade80':'#f0f0f0',fontWeight:'500',marginBottom:'2px'}}>{p.name}</div>
                    <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)',marginBottom:'3px'}}>{p.desc}</div>
                    <div style={{fontSize:'9px',color:'rgba(255,255,255,.2)',fontFamily:'monospace'}}>{p.hookType}</div>
                  </div>
                  <div onClick={togglePlugin} style={{width:'42px',height:'24px',borderRadius:'12px',background:isActive?'#4ade80':'rgba(255,255,255,.1)',cursor:'pointer',position:'relative',transition:'all .2s',flexShrink:0}}>
                    <div style={{position:'absolute',top:'3px',left:isActive?'21px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'white',transition:'all .2s'}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </BottomSheet>
      )}

      {/* CONFIG */}
      {ui.showConfig&&(
        <BottomSheet onClose={()=>ui.setShowConfig(false)}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'16px'}}>
              <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>⚙️ Config</span>
              <button onClick={()=>ui.setShowConfig(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
            </div>
            <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'12px'}}>
              {[
                {label:'Effort Level',value:project.effort,options:['low','medium','high'],onChange:v=>project.setEffort(v)},
                {label:'Font Size',value:String(ui.fontSize),options:['12','13','14','15','16'],onChange:v=>ui.setFontSize(parseInt(v))},
                {label:'Theme',value:ui.theme,options:['dark','darker','midnight'],onChange:v=>ui.setTheme(v)},
                {label:'Model',value:project.model,options:MODELS.map(m=>m.id),onChange:v=>project.setModel(v)},
              ].map(cfg=>(
                <div key={cfg.label} style={{padding:'10px 12px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'8px'}}>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)',marginBottom:'6px'}}>{cfg.label}</div>
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                    {cfg.options.map(opt=>(
                      <button key={opt} onClick={()=>cfg.onChange(opt)} style={{background:cfg.value===opt?'rgba(124,58,237,.3)':'rgba(255,255,255,.05)',border:'1px solid '+(cfg.value===opt?'rgba(124,58,237,.5)':'rgba(255,255,255,.08)'),borderRadius:'6px',padding:'4px 10px',color:cfg.value===opt?'#a78bfa':'rgba(255,255,255,.5)',fontSize:'11px',cursor:'pointer',fontFamily:'monospace'}}>
                        {opt.length>20?opt.slice(0,20)+'…':opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{padding:'10px 12px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'8px'}}>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)',marginBottom:'6px'}}>Extended Thinking</div>
                <button onClick={()=>project.setThinkingEnabled(!project.thinkingEnabled)} style={{background:project.thinkingEnabled?'rgba(124,58,237,.3)':'rgba(255,255,255,.05)',border:'1px solid '+(project.thinkingEnabled?'rgba(124,58,237,.5)':'rgba(255,255,255,.08)'),borderRadius:'6px',padding:'4px 10px',color:project.thinkingEnabled?'#a78bfa':'rgba(255,255,255,.5)',fontSize:'11px',cursor:'pointer'}}>
                  {project.thinkingEnabled?'✅ ON':'○ OFF'}
                </button>
              </div>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* DEPLOY */}
      {ui.showDeploy&&(
        <BottomSheet onClose={()=>ui.setShowDeploy(false)}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
              <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🚀 Deploy</span>
              <button onClick={()=>ui.setShowDeploy(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
            </div>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'12px'}}>
              {['github','vercel','netlify','railway'].map(p=>(
                <button key={p} onClick={()=>runDeploy(p)} disabled={chat.loading} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'8px',padding:'8px 16px',color:'#a78bfa',fontSize:'12px',cursor:'pointer',fontWeight:'500'}}>
                  {p==='github'?'📤 Git Push':p==='vercel'?'▲ Vercel':p==='netlify'?'◈ Netlify':'🚂 Railway'}
                </button>
              ))}
            </div>
            {ui.deployLog?<div style={{flex:1,background:'#0a0a0b',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px',padding:'12px',fontFamily:'monospace',fontSize:'11px',color:'rgba(255,255,255,.7)',overflowY:'auto',whiteSpace:'pre-wrap'}}>{ui.deployLog}</div>:<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Pilih platform untuk deploy~</div>}
          </div>
        </BottomSheet>
      )}

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
              <button onClick={()=>ui.setCommitModal(false)} style={{flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'8px',padding:'9px',color:'rgba(255,255,255,.4)',fontSize:'12px',cursor:'pointer'}}>Batal</button>
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
