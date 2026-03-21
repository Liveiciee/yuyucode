import React, { useRef, useEffect } from "react";
import { Activity } from "react";
import { Preferences } from "@capacitor/preferences";
import { MAX_HISTORY } from './constants.js';
import { callServer } from './api.js';
import { ThemeEffects } from './components/ThemeEffects.jsx';
import { AppHeader }  from './components/AppHeader.jsx';
import { AppSidebar } from './components/AppSidebar.jsx';
import { AppChat }    from './components/AppChat.jsx';
import { AppPanels }  from './components/AppPanels.jsx';
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

  // ── Dynamic brightness filter — gamma-corrected two-layer ──
  // Layer 1: CSS brightness capped at 2.0 (no 8-bit quantization artifacts).
  // Layer 2: mix-blend-mode:screen overlay for extreme low brightness boost.
  //
  // Dead zone: 35%–100% → no compensation (normal colors, save battery).
  // Compensation only kicks in below 35% where screen is genuinely dark.
  const _brightnessCalc = (() => {
    const b = ui.brightnessLevel;
    if (b >= 0.35) return { filter: 'none', overlay: 0 };  // dead zone — no filter
    // Remap 0–0.35 → 0–1 so gamma math works on full range
    const remapped   = b / 0.35;
    const safe       = Math.max(remapped, 0.04);
    const linear     = Math.pow(safe, 2.2);
    const comp       = Math.pow(1 / linear, 1 / 2.2);
    const themeName  = (T?.name || '').toLowerCase();
    const isColorful = themeName.includes('aurora') || themeName.includes('neon');
    const CSS_CAP    = isColorful ? 1.5 : 1.8;
    const bright     = Math.min(comp, CSS_CAP);
    const contrast   = 1 + (bright - 1) * (isColorful ? 0.10 : 0.20);
    const filter     = `brightness(${bright.toFixed(3)}) contrast(${contrast.toFixed(3)})`;
    const overlay    = Math.min(0.35, Math.max(0, comp - CSS_CAP) * 0.08);
    return { filter, overlay };
  })();
  const brightnessFilter  = _brightnessCalc.filter;
  const brightnessOverlay = _brightnessCalc.overlay;
  useBrightness(ui.setBrightnessLevel);

  // ── REFS ──
  const abortRef              = useRef(null);
  const handleSlashCommandRef = useRef(null);
  const wsRef                 = useRef(null);
  const fileSnapshotsRef      = useRef({});

  // ── HOOKS ──
  const { sendNotification, haptic, speakText, stopTts } = useNotifications();
  const { fileInputRef, handleImageAttach, handleDrop, handleCameraCapture } = useMediaHandlers({
    setVisionImage: chat.setVisionImage, setInput: chat.setInput,
    haptic, setDragOver: ui.setDragOver,
  });
  const { sendMsg, callAI, compactContext, cancelMsg, continueMsg, retryLast, abTest } = useAgentLoop({
    project, chat, file, ui, sendNotification, haptic, speakText, abortRef, handleSlashCommandRef, growth,
  });
  const { runAgentSwarm } = useAgentSwarm({
    callAI, folder: project.folder,
    setSwarmRunning: chat.setSwarmRunning, setSwarmLog: chat.setSwarmLog,
    setMessages: chat.setMessages, sendNotification, haptic, abortRef,
  });
  const { handleApprove, handlePlanApprove } = useApprovalFlow({
    messages: chat.messages, setMessages: chat.setMessages, folder: project.folder,
    hooks: project.hooks, permissions: project.permissions,
    editHistory: file.editHistory, setEditHistory: file.setEditHistory,
    sendMsgRef: { current: sendMsg }, callAI, abortRef, setLoading: chat.setLoading,
  });
  const { fetchGitHub, runDeploy, generateCommitMsg, runTests, browseTo, runShortcut } = useDevTools({
    folder: project.folder, githubRepo: project.githubRepo, githubToken: project.githubToken,
    setGithubData: project.setGithubData, setMessages: chat.setMessages,
    setLoading: chat.setLoading, setStreaming: chat.setStreaming, setDeployLog: ui.setDeployLog,
    callAI, sendMsgRef: { current: sendMsg }, sendNotification, haptic, abortRef, addHistory: project.addHistory,
  });
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
    growth, sendNotification, haptic, abortRef,
  });
  useEffect(() => { handleSlashCommandRef.current = handleSlashCommand; });

  // ── EFFECTS ──
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
      Preferences.get({key:'yc_vim'}),
      Preferences.get({key:'yc_minimap'}),
      Preferences.get({key:'yc_ghosttext'}),
      Preferences.get({key:'yc_lint'}),
      Preferences.get({key:'yc_tslsp'}),
      Preferences.get({key:'yc_blame'}),
      Preferences.get({key:'yc_multicursor'}),
      Preferences.get({key:'yc_stickyscroll'}),
      Preferences.get({key:'yc_collab'}),
    ]).then(([f,h,ch,mo,th,pi,re,sw,mem,ckp,hk,fs,ct,ob,ght,ghr,sc,pl,ef,tk,perm,vm,mm,gt,lt,ts,bl,mc,ss,co]) => {
      ui.loadUIPrefs({theme:th.value,fontSize:fs.value,sidebarWidth:sw.value,customTheme:ct.value,onboarded:ob.value,vim:vm.value,minimap:mm.value,ghostText:gt.value,lint:lt.value,tslsp:ts.value,blame:bl.value,multiCursor:mc.value,stickyScroll:ss.value,collab:co.value});
      project.loadProjectPrefs({folder:f.value,cmdHistory:ch.value,model:mo.value,hooks:hk.value,githubToken:ght.value,githubRepo:ghr.value,sessionColor:sc.value,plugins:pl.value,effort:ef.value,thinkingEnabled:tk.value,permissions:perm.value});
      file.loadFilePrefs({pinned:pi.value,recent:re.value});
      chat.loadChatPrefs({history:h.value,memories:mem.value,checkpoints:ckp.value});
    });
    callServer({type:'ping'}).then(r => {
      project.setServerOk(r.ok);
      if (r.ok) callServer({type:'mcp_list'}).then(mr => {
        if (mr.ok && mr.data && typeof mr.data === 'object') project.setMcpTools(mr.data);
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!('getBattery' in navigator)) return;
    navigator.getBattery().then(bat => {
      project.setBatteryLevel(bat.level); project.setBatteryCharging(bat.charging);
      bat.addEventListener('levelchange', () => project.setBatteryLevel(bat.level));
      bat.addEventListener('chargingchange', () => project.setBatteryCharging(bat.charging));
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          if (!r.ok) { chat.setMessages(m=>[...m,{role:'assistant',content:'👁 **File berubah:** `'+filename+'`',actions:[]}]); sendNotification('YuyuCode 👁',filename+' berubah'); return; }
          const curr = r.data || '';
          fileSnapshotsRef.current[absPath] = curr;
          if (!prev) { chat.setMessages(m=>[...m,{role:'assistant',content:'👁 **File berubah:** `'+filename+'` _(snapshot awal disimpan)_',actions:[]}]); return; }
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
        } catch (_e) { }
      };
      ws.onerror = () => {};
      ws.onclose = () => { if (!dead) setTimeout(connect, 3000); };
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

      {ui.dragOver&&<div style={{position:'absolute',inset:0,background:T.accentBg,border:'2px dashed '+T.accentBorder,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}><span style={{fontSize:'18px',color:T.accent}}>Drop file di sini~</span></div>}

      <ThemeEffects T={T}/>

      {/* Brightness screen overlay — mix-blend-mode:screen, no banding */}
      {brightnessOverlay > 0 && (
        <div style={{
          position:'fixed', inset:0, zIndex:2, pointerEvents:'none',
          background: T.accent || '#ffffff',
          opacity: brightnessOverlay,
          mixBlendMode: 'screen',
          backdropFilter: `blur(${(brightnessOverlay * 6).toFixed(1)}px)`,
          WebkitBackdropFilter: `blur(${(brightnessOverlay * 6).toFixed(1)}px)`,
        }}/>
      )}

      {/* Badge toast */}
      {growth.newBadge&&(
        <div style={{position:'fixed',top:'60px',left:'50%',transform:'translateX(-50%)',background:T.bg2,border:'1px solid '+T.accentBorder,borderRadius:'14px',padding:'12px 20px',zIndex:999,display:'flex',alignItems:'center',gap:'10px',boxShadow:'0 8px 32px rgba(0,0,0,.6)',animation:'fadeUp .3s ease'}}>
          <span style={{fontSize:'22px'}}>{growth.newBadge.label.split(' ')[0]}</span>
          <div>
            <div style={{fontSize:'13px',fontWeight:'700',color:T.text}}>{growth.newBadge.label}</div>
            <div style={{fontSize:'11px',color:T.textSec}}>{growth.newBadge.desc}</div>
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

      <AppHeader T={T} ui={ui} project={project} file={file} chat={chat} growth={growth}
        saveFolder={saveFolder} undoLastEdit={undoLastEdit} haptic={haptic}/>

      <div style={{flex:1,display:'flex',overflow:'hidden',position:'relative'}}>
        <AppSidebar T={T} ui={ui} project={project} file={file} onSidebarDragStart={onSidebarDragStart}/>
        <AppChat T={T} ui={ui} project={project} file={file} chat={chat}
          sendMsg={sendMsg} cancelMsg={cancelMsg} retryLast={retryLast} continueMsg={continueMsg}
          handleApprove={handleApprove} handlePlanApprove={handlePlanApprove}
          handleCameraCapture={handleCameraCapture} fileInputRef={fileInputRef}
          runShortcut={runShortcut} stopTts={stopTts}
          visibleMessages={visibleMessages}/>
      </div>

      <AppPanels T={T} ui={ui} project={project} file={file} chat={chat}
        sendMsg={sendMsg} compactContext={compactContext} runShortcut={runShortcut}
        fetchGitHub={fetchGitHub} runDeploy={runDeploy} runTests={runTests}
        generateCommitMsg={generateCommitMsg} haptic={haptic}
        saveCheckpoint={saveCheckpoint} restoreCheckpoint={restoreCheckpoint}
        fileInputRef={fileInputRef} handleImageAttach={handleImageAttach}/>
    </div>
  );
}
