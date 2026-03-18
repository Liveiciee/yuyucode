import React, { useState, useRef, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { DEFAULT_OLLAMA_HOST, MAX_HISTORY, MODELS, THEMES, BASE_SYSTEM, GIT_SHORTCUTS, FOLLOW_UPS, SLASH_COMMANDS } from './constants.js';
import { askCerebrasStream, callServer } from './api.js';
import { countTokens, hl, resolvePath, parseActions, executeAction } from './utils.js';
import { generatePlan, runBackgroundAgent, getBgAgents, mergeBackgroundAgent, loadSkills, tokenTracker, saveSession, loadSessions, rewindMessages } from './features.js';
import { MsgBubble, MsgContent } from './components/MsgBubble.jsx';
import { FileTree } from './components/FileTree.jsx';
import { FileEditor } from './components/FileEditor.jsx';
import { Terminal } from './components/Terminal.jsx';
import { SearchBar, UndoBar } from './components/SearchBar.jsx';
import { VoiceBtn, PushToTalkBtn } from './components/VoiceBtn.jsx';
import { GitDiffPanel, FileHistoryPanel, CustomActionsPanel, ShortcutsPanel, GitBlamePanel, SnippetLibrary, ThemeBuilder, CommandPalette } from './components/panels.jsx';
import { useSlashCommands } from './hooks/useSlashCommands.js';

export default function App() {
  // ── STATE ──
  const [messages, setMessages] = useState([{ role:'assistant', content:'Halo Papa! Yuyu siap bantu coding. Mau ngerjain apa? 🌸' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [folder, setFolder] = useState('yuyucode');
  const [folderInput, setFolderInput] = useState('yuyucode');
  const [showFolder, setShowFolder] = useState(false);
  const [serverOk, setServerOk] = useState(true);
  const [notes, setNotes] = useState('');
  const [skill, setSkill] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [model, setModel] = useState(MODELS[0].id);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showSearch, setShowSearch] = useState(false);
  const [editHistory, setEditHistory] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const [pinnedFiles, setPinnedFiles] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [branch, setBranch] = useState('main');
  const [sidebarWidth, setSidebarWidth] = useState(180);
  const [dragging, setDragging] = useState(false);
  const [netOnline, setNetOnline] = useState(navigator.onLine);
  const [rateLimitTimer, setRateLimitTimer] = useState(0);
  const [showDiff, setShowDiff] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [showBlame, setShowBlame] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [memories, setMemories] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [showMemory, setShowMemory] = useState(false);
  const [showCheckpoints, setShowCheckpoints] = useState(false);
  const [hooks, setHooks] = useState({ preWrite:[], postWrite:[], postPush:[] });
  const [slashSuggestions, setSlashSuggestions] = useState([]);
  const [showFileHistory, setShowFileHistory] = useState(false);
  const [showCustomActions, setShowCustomActions] = useState(false);
  const [visionImage, setVisionImage] = useState(null);
  const [fontSize, setFontSize] = useState(14);
  const [showThemeBuilder, setShowThemeBuilder] = useState(false);
  const [customTheme, setCustomTheme] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [swarmRunning, setSwarmRunning] = useState(false);
  const [swarmLog, setSwarmLog] = useState([]);
  const [showDepGraph, setShowDepGraph] = useState(false);
  const [depGraph, setDepGraph] = useState(null);
  const [showMCP, setShowMCP] = useState(false);
  const [mcpTools, setMcpTools] = useState({});
  const [showGitHub, setShowGitHub] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubData, setGithubData] = useState(null);
  const [showDeploy, setShowDeploy] = useState(false);
  const [deployLog, setDeployLog] = useState('');
  const [ollamaHost, setOllamaHost] = useState(DEFAULT_OLLAMA_HOST);
  const [showOllamaConfig, setShowOllamaConfig] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const ttsRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [reconnectTimer, setReconnectTimer] = useState(0);
  const [effort, setEffort] = useState('medium');
  const [sessionName, setSessionName] = useState('');
  const [planSteps, setPlanSteps] = useState([]);
  const [planTask, setPlanTask] = useState('');
  const [permissions, setPermissions] = useState({read_file:true,write_file:false,exec:false,list_files:true,search:true,mcp:false,delete_file:false,browse:false});
  const [showPermissions, setShowPermissions] = useState(false);
  const [skills, setSkills] = useState([]);
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [sessionList, setSessionList] = useState([]);
  const [showPlugins, setShowPlugins] = useState(false);
  const [loopActive, setLoopActive] = useState(false);
  const [loopIntervalRef, setLoopIntervalRef] = useState(null);
  const [agentMemory, setAgentMemory] = useState({ user:[], project:[], local:[] });
  const [pushToTalk, setPushToTalk] = useState(false);
  const [sessionColor, setSessionColor] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [fileWatcherActive, setFileWatcherActive] = useState(false);
  const [fileWatcherInterval, setFileWatcherInterval] = useState(null);
  const [fileSnapshots, setFileSnapshots] = useState({});
  const [showPalette, setShowPalette] = useState(false);
  const fileInputRef = useRef(null);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const autoContextRef = useRef({});
  const T = customTheme || THEMES[theme] || THEMES.dark;

  // ── EFFECTS ──
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages,streaming]);

  useEffect(()=>{
    const on=()=>setNetOnline(true), off=()=>setNetOnline(false);
    window.addEventListener('online',on); window.addEventListener('offline',off);
    return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};
  },[]);

  useEffect(()=>{
    Promise.all([
      Preferences.get({key:'yc_folder'}),Preferences.get({key:'yc_history'}),Preferences.get({key:'yc_cmdhist'}),
      Preferences.get({key:'yc_model'}),Preferences.get({key:'yc_theme'}),Preferences.get({key:'yc_pinned'}),
      Preferences.get({key:'yc_recent'}),Preferences.get({key:'yc_sidebar_w'}),Preferences.get({key:'yc_memories'}),
      Preferences.get({key:'yc_checkpoints'}),Preferences.get({key:'yc_hooks'}),Preferences.get({key:'yc_fontsize'}),
      Preferences.get({key:'yc_custom_theme'}),Preferences.get({key:'yc_onboarded'}),Preferences.get({key:'yc_gh_token'}),
      Preferences.get({key:'yc_gh_repo'}),Preferences.get({key:'yc_ollama_host'}),
    ]).then(([f,h,ch,mo,th,pi,re,sw,mem,ckp,hk,fs,ct,ob,ght,ghr,oh])=>{
      if(f.value){setFolder(f.value);setFolderInput(f.value);}
      if(h.value){try{setMessages(JSON.parse(h.value));}catch{}}
      if(ch.value){try{setCmdHistory(JSON.parse(ch.value));}catch{}}
      if(mo.value) setModel(mo.value);
      if(th.value) setTheme(th.value);
      if(pi.value){try{setPinnedFiles(JSON.parse(pi.value));}catch{}}
      if(re.value){try{setRecentFiles(JSON.parse(re.value));}catch{}}
      if(sw.value) setSidebarWidth(parseInt(sw.value)||180);
      if(mem.value){try{setMemories(JSON.parse(mem.value));}catch{}}
      if(ckp.value){try{setCheckpoints(JSON.parse(ckp.value));}catch{}}
      if(hk.value){try{setHooks(JSON.parse(hk.value));}catch{}}
      if(fs.value) setFontSize(parseInt(fs.value)||14);
      if(ct.value){try{setCustomTheme(JSON.parse(ct.value));}catch{}}
      if(!ob.value) setShowOnboarding(true);
      if(ght.value) setGithubToken(ght.value);
      if(ghr.value) setGithubRepo(ghr.value);
      if(oh.value) setOllamaHost(oh.value);
      Preferences.get({key:'yc_session_color'}).then(scr=>{if(scr.value)setSessionColor(scr.value||null);});
    });
    callServer({type:'ping'}).then(r=>{setServerOk(r.ok);if(r.mcp)setMcpTools(r.mcp);});
  },[]);

  useEffect(()=>{
    const iv=setInterval(async()=>{
      const r=await callServer({type:'ping'});
      setServerOk(r.ok);
      setReconnectTimer(t=>r.ok?0:t+5);
    },5000);
    return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    if(messages.length>1) Preferences.set({key:'yc_history',value:JSON.stringify(messages.slice(-MAX_HISTORY).map(m=>({role:m.role,content:m.content})))});
    setShowFollowUp(messages.length>1&&messages[messages.length-1]?.role==='assistant');
  },[messages]);

  useEffect(()=>{
    if(!folder) return;
    Preferences.get({key:'yc_notes_'+folder}).then(r=>setNotes(r.value||''));
    callServer({type:'ping'}).then(r=>setServerOk(r.ok));
    callServer({type:'read',path:folder+'/SKILL.md'}).then(r=>{if(r.ok)setSkill(r.data);else setSkill('');});
    callServer({type:'exec',path:folder,command:'git branch --show-current'}).then(r=>{if(r.ok)setBranch(r.data.trim());});
  },[folder]);

  useEffect(()=>{
    if(!fileWatcherActive||!folder) return;
    const iv=setInterval(async()=>{
      const r=await callServer({type:'list',path:folder+'/src'});
      if(!r.ok||!Array.isArray(r.data)) return;
      const changed=[];
      for(const f of r.data.filter(x=>!x.isDir)){
        const key=f.name, mtime=f.mtime||f.size;
        if(fileSnapshots[key]!==undefined&&fileSnapshots[key]!==mtime) changed.push(f.name);
      }
      const snap={};
      r.data.forEach(f=>{snap[f.name]=f.mtime||f.size;});
      setFileSnapshots(snap);
      if(changed.length>0){
        setMessages(m=>[...m,{role:'assistant',content:'👁 **File berubah**:\n'+changed.map(f=>'• '+f).join('\n'),actions:[]}]);
        sendNotification('YuyuCode 👁',changed.join(', ')+' berubah');
      }
    },30000);
    setFileWatcherInterval(iv);
    return()=>clearInterval(iv);
  },[fileWatcherActive,folder]);

  // ── FILE OPS ──
  async function openFile(path){
    setSelectedFile(path);setActiveTab('file');setEditMode(false);
    const r=await callServer({type:'read',path});
    if(r.ok) setFileContent(r.data); else setFileContent('Error: '+r.data);
    const next=[path,...recentFiles.filter(f=>f!==path)].slice(0,8);
    setRecentFiles(next);
    Preferences.set({key:'yc_recent',value:JSON.stringify(next)});
  }

  async function saveFile(content){
    if(!selectedFile) return;
    setEditHistory(h=>[...h.slice(-9),{path:selectedFile,content:fileContent||''}]);
    const r=await callServer({type:'write',path:selectedFile,content});
    if(r.ok){setFileContent(content);setMessages(m=>[...m,{role:'assistant',content:'💾 Saved: '+selectedFile.split('/').pop(),actions:[]}]);}
  }

  function saveFolder(f){setFolder(f);setFolderInput(f);setShowFolder(false);Preferences.set({key:'yc_folder',value:f});}
  function addHistory(cmd){const next=[cmd,...cmdHistory.filter(c=>c!==cmd)].slice(0,50);setCmdHistory(next);Preferences.set({key:'yc_cmdhist',value:JSON.stringify(next)});}
  function togglePin(path){const next=pinnedFiles.includes(path)?pinnedFiles.filter(f=>f!==path):[...pinnedFiles,path];setPinnedFiles(next);Preferences.set({key:'yc_pinned',value:JSON.stringify(next)});}

  async function handlePlanApprove(idx,approved){
    if(!approved){setMessages(m=>m.map((x,i)=>i===idx?{...x,planApproved:false}:x));await sendMsg('Ubah plan.');return;}
    setMessages(m=>m.map((x,i)=>i===idx?{...x,planApproved:true}:x));
    await sendMsg('Plan diapprove. Mulai eksekusi step by step.');
  }

  async function handleApprove(idx,ok,targetPath){
    const msg=messages[idx];
    const targets=targetPath==='__all__'
      ?(msg.actions||[]).filter(a=>a.type==='write_file'&&!a.executed)
      :(msg.actions||[]).filter(a=>a.type==='write_file'&&!a.executed&&(targetPath?a.path===targetPath:true));
    if(!ok){
      setMessages(m=>m.map((x,i)=>i===idx?{...x,actions:x.actions?.map(a=>targets.includes(a)?{...a,executed:true,result:{ok:false,data:'Dibatalkan.'}}:a)}:x));
      return;
    }
    const backups=[];
    for(const a of targets){const backup=await callServer({type:'read',path:resolvePath(folder,a.path)});if(backup.ok) backups.push({path:resolvePath(folder,a.path),content:backup.data});}
    if(backups.length) setEditHistory(h=>[...h.slice(-(10-backups.length)),...backups]);
    const results=await Promise.all(targets.map(a=>executeAction(a,folder)));
    const failed=results.filter(r=>!r.ok);
    if(failed.length>0&&targets.length>1){
      await Promise.all(backups.map(b=>callServer({type:'write',path:b.path,content:b.content})));
      setMessages(m=>[...m,{role:'assistant',content:'❌ Atomic write gagal ('+failed.length+' file). Rollback.'}]);
      return;
    }
    results.forEach((r,i)=>{targets[i].result=r;targets[i].executed=true;});
    setMessages(m=>m.map((x,i)=>i===idx?{...x}:x));
    if(targets.length>1) setMessages(m=>[...m,{role:'assistant',content:'✅ '+targets.length+' file berhasil ditulis~',actions:[]}]);
    await runHooks('postWrite',targets.map(a=>a.path).join(','));
    if(permissions.exec){
      for(const wr of targets){
        const ext=(wr.path||'').split('.').pop().toLowerCase();
        let verifyCmd=null;
        const absPath=resolvePath(folder,wr.path);
        if(ext==='js'||ext==='cjs'||ext==='mjs') verifyCmd='node --check "'+absPath+'" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"';
        else if(ext==='json') verifyCmd='python3 -m json.tool "'+absPath+'" > /dev/null 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"';
        else if(ext==='sh') verifyCmd='bash -n "'+absPath+'" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"';
        if(!verifyCmd) continue;
        const vr=await callServer({type:'exec',path:folder,command:verifyCmd});
        const vOut=(vr.data||'').trim();
        if(!vOut) continue;
        if(vOut.includes('SYNTAX_ERR')||(vOut.toLowerCase().includes('error')&&!vOut.includes('SYNTAX_OK'))){
          const fname=(wr.path||'').split('/').pop();
          setMessages(m=>[...m,{role:'assistant',content:'Syntax error di '+fname+':\n```\n'+vOut.slice(0,300)+'\n```',actions:[]}]);
          setTimeout(()=>sendMsg('Fix syntax error di '+wr.path+':\n```\n'+vOut.slice(0,300)+'\n```'),700);
        }
      }
    }
  }

  async function undoLastEdit(){
    const last=editHistory[editHistory.length-1];
    if(!last) return;
    await callServer({type:'write',path:last.path,content:last.content});
    setEditHistory(h=>h.slice(0,-1));
    setMessages(m=>[...m,{role:'assistant',content:'↩ Undo: '+last.path.split('/').pop(),actions:[]}]);
  }

  function cancel(){abortRef.current?.abort();setLoading(false);setStreaming('');}

  // ── AUTO MEMORY ──
  async function extractMemories(userMsg,aiReply){
    if(aiReply.length<100) return;
    try{
      const ctrl=new AbortController();
      const reply=await askCerebrasStream([
        {role:'system',content:'Extract 0-3 hal penting yang perlu diingat dari percakapan ini sebagai coding memories. Format: satu per baris, dimulai "• ". Hanya extract kalau benar-benar penting. Kalau tidak ada, tulis "none".'},
        {role:'user',content:'User: '+userMsg.slice(0,500)+'\n\nAI: '+aiReply.slice(0,800)}
      ],'llama3.1-8b',()=>{},ctrl.signal);
      if(reply.trim()==='none'||!reply.includes('•')) return;
      const newMems=reply.split('\n').filter(l=>l.startsWith('•')).map(l=>({id:Date.now()+Math.random(),text:l.slice(1).trim(),folder,ts:new Date().toLocaleDateString('id')}));
      if(!newMems.length) return;
      setMemories(prev=>{const merged=[...newMems,...prev].slice(0,50);Preferences.set({key:'yc_memories',value:JSON.stringify(merged)});return merged;});
    }catch{}
  }

  // ── CHECKPOINTS ──
  function saveCheckpoint(){
    const cp={id:Date.now(),label:new Date().toLocaleString('id'),messages:messages.slice(-20),folder,branch,notes};
    setCheckpoints(prev=>{const next=[cp,...prev].slice(0,10);Preferences.set({key:'yc_checkpoints',value:JSON.stringify(next)});return next;});
    setMessages(m=>[...m,{role:'assistant',content:'📍 Checkpoint disimpan: '+cp.label,actions:[]}]);
  }

  function restoreCheckpoint(cp){
    setMessages(cp.messages);setFolder(cp.folder);setFolderInput(cp.folder);setNotes(cp.notes||'');
    setShowCheckpoints(false);
    setMessages(m=>[...m,{role:'assistant',content:'✅ Restored checkpoint: '+cp.label,actions:[]}]);
  }

  // ── COMPACT CONTEXT ──
  async function compactContext(){
    if(messages.length<10){setMessages(m=>[...m,{role:'assistant',content:'Context masih kecil~',actions:[]}]);return;}
    setLoading(true);
    const ctrl=new AbortController();abortRef.current=ctrl;
    try{
      const toCompact=messages.slice(1,-6);
      const summary=await askCerebrasStream([
        {role:'system',content:'Buat ringkasan singkat dari percakapan coding ini. Fokus: keputusan teknis, files diubah, bug fix, status project. Maks 300 kata.'},
        {role:'user',content:toCompact.map(m=>m.role+': '+m.content.slice(0,300)).join('\n\n')}
      ],'llama3.1-8b',()=>{},ctrl.signal);
      setMessages([messages[0],{role:'assistant',content:'📦 **Context dicompact** ('+toCompact.length+' pesan):\n\n'+summary},...messages.slice(-6)]);
      setMessages(m=>[...m,{role:'assistant',content:'✅ Context berhasil dikompres!',actions:[]}]);
    }catch(e){if(e.name!=='AbortError') setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message}]);}
    setLoading(false);
  }

  // ── HOOKS RUNNER ──
  async function runHooks(type,context=''){
    for(const hook of(hooks[type]||[])){try{await callServer({type:'exec',path:folder,command:hook.replace('{{context}}',context)});}catch{}}
  }

  // ── PARALLEL READ ──
  async function readFilesParallel(paths){
    const results=await Promise.all(paths.map(p=>callServer({type:'read',path:resolvePath(folder,p)})));
    return paths.reduce((acc,p,i)=>({...acc,[p]:results[i]}),{});
  }

  // ── TRIM HISTORY ──
  function trimHistory(msgs){
    const MAX_CHARS=100000;
    if(msgs.reduce((a,m)=>a+m.content.length,0)<=MAX_CHARS) return msgs;
    const HEAD=4,TAIL=12;
    if(msgs.length<=HEAD+TAIL+1) return msgs;
    const middle=msgs.slice(HEAD+1,-TAIL);
    const summary=middle.map(m=>(m.role==='user'?'Papa':'Yuyu')+': '+m.content.replace(/```action[\s\S]*?```/g,'[action]').slice(0,120)).join(' | ');
    return [...msgs.slice(0,HEAD+1),{role:'assistant',content:'[Ringkasan '+middle.length+' pesan: '+summary.slice(0,800)+']'},...msgs.slice(-TAIL)];
  }

  // ── EXPORT CHAT ──
  function exportChat(){
    const md=messages.map(m=>`**${m.role==='user'?'Papa':'Yuyu'}:** ${m.content.replace(/```action[\s\S]*?```/g,'').trim()}`).join('\n\n---\n\n');
    const blob=new Blob([md],{type:'text/markdown'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`yuyucode-chat-${Date.now()}.md`;a.click();
    URL.revokeObjectURL(url);
    setMessages(m=>[...m,{role:'assistant',content:'📤 Chat diekspor~',actions:[]}]);
  }

  // ── NOTIFICATION & HAPTIC ──
  function sendNotification(title,body){
    if('Notification' in window&&Notification.permission==='granted') new Notification(title,{body,icon:'/favicon.ico'});
    else if('Notification' in window&&Notification.permission!=='denied') Notification.requestPermission().then(p=>{if(p==='granted') new Notification(title,{body});});
  }
  function haptic(type='light'){if(navigator.vibrate) navigator.vibrate(type==='heavy'?[50,30,50]:type==='medium'?30:10);}

  // ── TTS ──
  function speakText(text){
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean=text.replace(/```[\s\S]*?```/g,'').replace(/[#*_~>]/g,'').replace(/`/g,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/\s+/g,' ').trim().slice(0,500);
    const utt=new SpeechSynthesisUtterance(clean);
    utt.lang='id-ID';utt.rate=1.05;utt.pitch=1.1;
    const voices=window.speechSynthesis.getVoices();
    const preferred=voices.find(v=>v.lang.startsWith('id')&&v.name.toLowerCase().includes('female'))||voices.find(v=>v.lang.startsWith('id'))||voices.find(v=>v.lang.startsWith('en')&&v.name.toLowerCase().includes('female'));
    if(preferred) utt.voice=preferred;
    ttsRef.current=utt;window.speechSynthesis.speak(utt);
  }
  function stopTts(){window.speechSynthesis?.cancel();}

  // ── AI ROUTER ──
  async function callAI(msgs,onChunk,signal){
    const effortTokens={low:1024,medium:2048,high:4000};
    return askCerebrasStream(msgs,model,onChunk,signal,{maxTokens:effortTokens[effort]||1500});
  }

  // ── BROWSE ──
  async function browseTo(url){
    setLoading(true);setMessages(m=>[...m,{role:'user',content:'Browse: '+url}]);
    const r=await callServer({type:'browse',url});
    if(!r.ok) setMessages(m=>[...m,{role:'assistant',content:'❌ Browse gagal: '+r.data,actions:[]}]);
    else{setMessages(m=>[...m,{role:'assistant',content:'🌐 **'+url+'**\n\n```\n'+(r.data||'').slice(0,3000)+'\n```',actions:[]}]);setTimeout(()=>sendMsg('Analisis konten halaman ini.'),300);}
    setLoading(false);
  }

  // ── AGENT SWARM ──
  async function runAgentSwarm(task){
    setSwarmRunning(true);setSwarmLog([]);
    const log=msg=>setSwarmLog(prev=>[...prev,msg]);
    const ctrl=new AbortController();abortRef.current=ctrl;
    try{
      log('🏗 Architect...');
      const archReply=await callAI([{role:'system',content:'Software Architect. Buat rencana implementasi.'},{role:'user',content:task}],()=>{},ctrl.signal);
      log('⚛ Frontend Agent...');
      const feReply=await callAI([{role:'system',content:'Frontend Engineer. Implementasikan UI/React. Gunakan action blocks.'},{role:'user',content:'Plan:\n'+archReply+'\n\nTask: '+task}],()=>{},ctrl.signal);
      log('⚙ Backend Agent...');
      const beReply=await callAI([{role:'system',content:'Backend Engineer. Implementasikan server/API. Gunakan action blocks.'},{role:'user',content:'Plan:\n'+archReply+'\n\nTask: '+task}],()=>{},ctrl.signal);
      log('🧪 QA Agent...');
      const qaReply=await callAI([{role:'system',content:'QA Engineer. Review kode, temukan bugs.'},{role:'user',content:'FE:\n'+feReply.slice(0,1000)+'\n\nBE:\n'+beReply.slice(0,1000)}],()=>{},ctrl.signal);
      const writes=[...parseActions(feReply),...parseActions(beReply)].filter(a=>a.type==='write_file');
      setMessages(m=>[...m,{role:'assistant',content:`🐝 **Swarm Selesai!**\n\n**Plan:**\n${archReply.slice(0,400)}\n\n**QA:**\n${qaReply.slice(0,300)}`,actions:writes.map(a=>({...a,executed:false}))}]);
      sendNotification('YuyuCode 🐝','Swarm selesai!');haptic('heavy');
    }catch(e){if(e.name!=='AbortError') log('❌ '+e.message);}
    setSwarmRunning(false);
  }

  // ── VISION / DROP ──
  function handleImageAttach(e){
    const file=e.target.files?.[0];if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{setVisionImage(ev.target.result.split(',')[1]);haptic('light');};
    reader.readAsDataURL(file);
  }

  function handleDrop(e){
    e.preventDefault();setDragOver(false);
    const file=e.dataTransfer.files?.[0];if(!file) return;
    if(file.type.startsWith('image/')){const reader=new FileReader();reader.onload=ev=>{setVisionImage(ev.target.result.split(',')[1]);haptic('light');};reader.readAsDataURL(file);}
    else{const reader=new FileReader();reader.onload=ev=>{setInput(i=>i+'\n```\n'+ev.target.result.slice(0,3000)+'\n```');};reader.readAsText(file);}
  }

  // ── GITHUB ──
  async function fetchGitHub(action){
    if(!githubRepo) return;
    const[owner,repo]=githubRepo.split('/');
    setLoading(true);
    const r=await callServer({type:'mcp',tool:'github',action,params:{owner,repo,token:githubToken}});
    try{setGithubData({action,data:JSON.parse(r.data)});}catch{setGithubData({action,data:r.data});}
    setLoading(false);
  }

  // ── DEPLOY ──
  async function runDeploy(platform){
    setDeployLog('🚀 Deploying to '+platform+'...\n');setLoading(true);
    const cmds={vercel:'vercel --prod --yes 2>&1',netlify:'netlify deploy --prod 2>&1',github:'git add -A && git commit -m "deploy: '+new Date().toLocaleDateString('id')+'" && git push',railway:'railway up 2>&1'};
    const r=await callServer({type:'exec',path:folder,command:cmds[platform]||'echo "Platform tidak dikenal"'});
    setDeployLog(r.data||'selesai');setLoading(false);
    sendNotification('YuyuCode 🚀','Deploy '+platform+' selesai!');haptic('heavy');
  }

  // ── COMMIT MSG ──
  async function generateCommitMsg(){
    setLoading(true);
    const diff=await callServer({type:'exec',path:folder,command:'git diff HEAD'});
    if(!diff.ok||!diff.data.trim()){setMessages(m=>[...m,{role:'assistant',content:'Tidak ada perubahan~',actions:[]}]);setLoading(false);return;}
    const ctrl=new AbortController();abortRef.current=ctrl;
    try{
      const reply=await callAI([{role:'system',content:'Generate satu baris commit message format "tipe: deskripsi". Hanya commit message, tanpa penjelasan.'},{role:'user',content:diff.data.slice(0,3000)}],setStreaming,ctrl.signal);
      setStreaming('');
      const msg=reply.trim().replace(/^[\"'`]|[\"'`]$/g,'');
      setMessages(m=>[...m,{role:'assistant',content:'💬 Commit message:\n```\n'+msg+'\n```\n```action\n{"type":"exec","command":"git add -A && git commit -m \\"'+msg.replace(/"/g,'\\"')+'\\" && git push"}\n```',actions:[]}]);
    }catch(e){if(e.name!=='AbortError') setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message}]);}
    setLoading(false);
  }

  // ── TEST RUNNER ──
  async function runTests(){
    setLoading(true);setMessages(m=>[...m,{role:'user',content:'Jalankan test & lint'}]);
    const lint=await callServer({type:'exec',path:folder,command:'npm run lint 2>&1 || echo "no lint script"'});
    const test=await callServer({type:'exec',path:folder,command:'npm test -- --watchAll=false 2>&1 || echo "no test script"'});
    const combined='=== LINT ===\n'+(lint.data||'ok')+'\n\n=== TEST ===\n'+(test.data||'ok');
    setMessages(m=>[...m,{role:'assistant',content:'```bash\n'+combined+'\n```',actions:[]}]);
    if(combined.toLowerCase().includes('error')||combined.includes('FAIL')) setTimeout(()=>sendMsg('Ada error di test/lint:\n'+combined.slice(0,600)+'\nDiagnosa dan fix.'),300);
    setLoading(false);
  }

  // ── SLASH COMMANDS ──
  const {handleSlashCommand}=useSlashCommands({
    model,folder,branch,messages,selectedFile,fileContent,notes,
    memories,checkpoints,skills,thinkingEnabled,effort,loopActive,
    loopIntervalRef,agentMemory,splitView,pushToTalk,sessionName,
    sessionColor,fileWatcherActive,fileWatcherInterval,ollamaHost,
    setModel,setMessages,setFolder,setFolderInput,setLoading,setStreaming,
    setThinkingEnabled,setEffort,setLoopActive,setLoopIntervalRef,
    setSplitView,setPushToTalk,setSessionName,setSessionColor,
    setSkills,setFileWatcherActive,setFileWatcherInterval,setFileSnapshots,
    setOllamaHost,setPlanSteps,setPlanTask,setAgentMemory,setSessionList,
    setShowCheckpoints,setShowMemory,setShowMCP,setShowGitHub,setShowDeploy,
    setShowSessions,setShowPermissions,setShowPlugins,setShowConfig,
    setShowCustomActions,setShowFileHistory,setShowThemeBuilder,
    setShowDiff,setShowSearch,setShowSnippets,setShowDepGraph,setDepGraph,setFontSize,
    sendMsg,compactContext,saveCheckpoint,exportChat,generateCommitMsg,
    runTests,browseTo,runAgentSwarm,callAI,addHistory,runHooks,abortRef,
  });

  // ── SEND MESSAGE ──
  async function sendMsg(override){
    const txt=(override||input).trim();
    if(!txt||loading) return;
    if(txt.startsWith('/')){setInput('');setSlashSuggestions([]);await handleSlashCommand(txt);return;}
    setInput('');setHistIdx(-1);addHistory(txt);
    setShowFollowUp(false);setActiveTab('chat');setSlashSuggestions([]);
    setVisionImage(null);haptic('light');
    const userMsg={role:'user',content:txt};
    const history=[...messages,userMsg];
    setMessages(history);setLoading(true);setStreaming('');
    const ctrl=new AbortController();abortRef.current=ctrl;

    // ── AUTO-COMPACT: trigger at 80k chars to prevent context overflow ──
    const AUTO_COMPACT_THRESHOLD = 80000;
    const totalChars = history.reduce((a,m)=>a+(m.content?.length||0),0);
    if (totalChars > AUTO_COMPACT_THRESHOLD && history.length > 12) {
      setMessages(m=>[...m,{role:'assistant',content:'📦 Auto-compact — context terlalu besar (~'+Math.round(totalChars/1000)+'K chars). Mengkompress...',actions:[]}]);
      await compactContext();
    }

    try{
      const notesCtx=notes?'\n\nProject notes:\n'+notes:'';
      const skillCtx=skill?'\n\nSKILL.md:\n'+skill:'';
      const pinnedCtx=pinnedFiles.length?'\n\nPinned files: '+pinnedFiles.join(', '):'';
      const fileCtx=selectedFile&&fileContent?'\n\nFile terbuka: '+selectedFile+'\n```\n'+fileContent.slice(0,1500)+'\n```':'';
      const memCtx=memories.length?'\n\nMemories:\n'+memories.slice(0,10).map(m=>'• '+m.text).join('\n'):'';
      const visionCtx=visionImage?'\n\n[Gambar dilampirkan]':'';
      const agentMemCtx=['user','project','local'].map(s=>(agentMemory[s]||[]).length?'\n\n['+s+' memory]:\n'+(agentMemory[s]||[]).map(mx=>'• '+mx.text).join('\n'):'').join('');
      const thinkInstruction=thinkingEnabled?'\n\nSebelum respons, tulis reasoning singkat dalam <think>...</think>. Singkat, max 2 kalimat.':'';
      const systemPrompt=BASE_SYSTEM+thinkInstruction+'\n\nFolder aktif: '+folder+'\nBranch: '+branch+notesCtx+skillCtx+pinnedCtx+fileCtx+memCtx+agentMemCtx+visionCtx;

      if(pinnedFiles.length){
        const loaded=await readFilesParallel(pinnedFiles.slice(0,3));
        Object.entries(loaded).forEach(([p,r])=>{if(r.ok) autoContextRef.current[p]=r.data;});
      }

      const MAX_ITER=10;
      let iter=0,allMessages=[...history],finalContent='',finalActions=[];
      let autoContext={...(autoContextRef.current||{})},selfOptRetry=0;

      while(iter<MAX_ITER){
        iter++;
        if(iter>1) setAgentRunning(true);
        const DECISION_HINT=iter===1?'\n[ATURAN: Jawab langsung jika bisa dari context. DILARANG tanya balik. Kalau butuh file, baca sendiri pakai read_file.]':'';
        const groqMsgs=[
          {role:'system',content:systemPrompt+DECISION_HINT+(Object.keys(autoContext).length?'\n\nAuto-loaded context:\n'+Object.entries(autoContext).map(([p,c])=>'=== '+p+' ===\n'+c.slice(0,800)).join('\n\n'):'')},
          ...trimHistory(allMessages).map(m=>({role:m.role,content:m.content.replace(/```action[\s\S]*?```/g,'').replace(/PROJECT_NOTE:.*?\n/g,'').trim()}))
        ];
        let reply=await callAI(groqMsgs,setStreaming,ctrl.signal,iter===1?visionImage:null);
        setStreaming('');
        // track tokens per request
        const inTk = Math.round(groqMsgs.reduce((a,m)=>a+(m.content?.length||0),0)/4);
        const outTk = Math.round(reply.length/4);
        tokenTracker.record(inTk, outTk, model);

        if(reply.includes('❌')&&selfOptRetry<2){
          selfOptRetry++;
          allMessages=[...allMessages,{role:'assistant',content:reply.replace(/```action[\s\S]*?```/g,'').trim()},{role:'user',content:'Ada error. Coba pendekatan berbeda. Retry ke-'+selfOptRetry+'.'}];
          continue;
        }

        const allActs=parseActions(reply);
        const writes=allActs.filter(a=>a.type==='write_file');
        const nonWrites=allActs.filter(a=>a.type!=='write_file');
        const readActions=nonWrites.filter(a=>a.type==='read_file');
        const webSearchActions=nonWrites.filter(a=>a.type==='web_search');
        const otherActions=nonWrites.filter(a=>a.type!=='read_file'&&a.type!=='web_search');

        if(readActions.length>1){const res=await Promise.all(readActions.map(a=>executeAction(a,folder)));readActions.forEach((a,i)=>{a.result=res[i];});}
        else{for(const a of readActions) a.result=await executeAction(a,folder);}
        // web_search runs in parallel
        if(webSearchActions.length>0){const res=await Promise.all(webSearchActions.map(a=>executeAction(a,folder)));webSearchActions.forEach((a,i)=>{a.result=res[i];});}
        for(const a of otherActions) a.result=await executeAction(a,folder);

        // auto-load imports
        for(const a of readActions){
          if(a.result?.ok&&a.path){
            const content=a.result.data||'';
            const importRegex=/(?:import|require)\s+.*?['"](.+?)['"]/g;let im;
            while((im=importRegex.exec(content))!==null){
              const imp=im[1];if(!imp.startsWith('.')) continue;
              const base=a.path.split('/').slice(0,-1).join('/');
              const candidates=[imp,imp+'.jsx',imp+'.js',imp+'.ts',imp+'.tsx'].map(s=>base+'/'+s.replace('./','/').replace('//','/'));
              for(const cand of candidates){if(autoContext[cand]) continue;const r=await callServer({type:'read',path:resolvePath(folder,cand)});if(r.ok){autoContext[cand]=r.data;break;}}
            }
          }
        }

        const execErrors=otherActions.filter(a=>{
          if(a.type!=='exec') return false;
          const out=(a.result?.data||'').toLowerCase();
          if(!out.trim()) return false;
          const hasErr=out.includes('error')||out.includes('exception')||out.includes('traceback')||out.includes('cannot find module')||out.includes('command not found')||out.includes('exit code 1')||out.includes('failed to compile');
          const isFP=out.includes('no error')||out.includes('0 errors')||out.includes('syntax ok')||out.includes('passed');
          return hasErr&&!isFP;
        });

        if(execErrors.length>0&&iter<MAX_ITER){
          const errSummary=execErrors.map(a=>'[ERROR] '+(a.command||a.path||'?')+'\n'+(a.result?.data||'').slice(0,400)).join('\n\n');
          allMessages=[...allMessages,{role:'assistant',content:reply.replace(/```action[\s\S]*?```/g,'').trim()},{role:'user',content:'Error saat eksekusi:\n\n'+errSummary+'\n\nAnalisis dan fix.'}];
          continue;
        }

        // combine all non-write results for context feeding
        const allNonWrites=[...readActions,...webSearchActions,...otherActions];
        const webData=webSearchActions.filter(a=>a.result?.ok).map(a=>'🌐 Web Search: '+a.query+'\n'+a.result.data).join('\n\n');
        const fileData=allNonWrites.filter(a=>a.result?.ok&&a.type!=='exec'&&a.type!=='web_search').map(a=>'=== '+a.path+' ===\n'+a.result.data).join('\n\n');
        const combinedData=[fileData,webData].filter(Boolean).join('\n\n');
        if(!combinedData&&writes.length===0){finalContent=reply;finalActions=allNonWrites;break;}
        if(writes.length>0){await runHooks('preWrite',writes.map(a=>a.path).join(','));finalContent=reply;finalActions=[...allNonWrites,...writes.map(a=>({...a,executed:false}))];break;}
        const agentNote=iter<MAX_ITER?'':'\n\n(Iterasi terakhir, berikan jawaban final.)';
        allMessages=[...allMessages,{role:'assistant',content:reply.replace(/```action[\s\S]*?```/g,'').trim()},{role:'user',content:'Hasil aksi:\n'+combinedData+'\n\nLanjutkan.'+agentNote}];
      }

      setAgentRunning(false);
      if(iter>1) sendNotification('YuyuCode ✅','Agent selesai! '+txt.slice(0,40));
      if(finalContent.trim().endsWith('CONTINUE')){setTimeout(()=>sendMsg('Lanjutkan dari titik terakhir.'),300);return;}
      if(finalContent.includes('PROJECT_NOTE:')){const nm=finalContent.match(/PROJECT_NOTE:(.*?)(?:\n|$)/);if(nm){const n=(notes+'\n'+nm[1].trim()).trim();setNotes(n);Preferences.set({key:'yc_notes_'+folder,value:n});}}
      setMessages(m=>[...m,{role:'assistant',content:finalContent,actions:finalActions}]);
      extractMemories(txt,finalContent);
      if(ttsEnabled&&finalContent) speakText(finalContent);
    }catch(e){
      setAgentRunning(false);
      if(e.name!=='AbortError'){
        if(e.message.startsWith('RATE_LIMIT:')){
          const secs=parseInt(e.message.split(':')[1]);
          setRateLimitTimer(secs);
          const iv=setInterval(()=>setRateLimitTimer(t=>{if(t<=1){clearInterval(iv);return 0;}return t-1;}),1000);
          setMessages(m=>[...m,{role:'assistant',content:'⏳ Rate limit — tunggu '+secs+' detik ya Papa~'}]);
        }else if(!navigator.onLine){
          setMessages(m=>[...m,{role:'assistant',content:'📡 Internet terputus~'}]);
        }else{
          setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message}]);
        }
      }
    }
    setLoading(false);
  }

  async function continueMsg(){await sendMsg('Lanjutkan response sebelumnya dari titik terakhir.');}
  async function retryLast(){
    const lastUser=[...messages].reverse().find(m=>m.role==='user');
    if(!lastUser) return;
    setMessages(m=>{const idx=m.indexOf(lastUser);return m.slice(0,idx);});
    await sendMsg(lastUser.content);
  }

  async function runShortcut(cmd){
    addHistory(cmd);setShowFollowUp(false);setActiveTab('chat');
    setMessages(m=>[...m,{role:'user',content:cmd}]);setLoading(true);
    const r=await executeAction({type:'exec',command:cmd},folder);
    const output=r.data||'selesai';
    setMessages(m=>[...m,{role:'assistant',content:'```bash\n'+output+'\n```',actions:[]}]);
    setLoading(false);
    if((output.toLowerCase().includes('error')||output.includes('❌'))&&!cmd.includes('git')) setTimeout(()=>sendMsg('Ada error di terminal:\n'+output.slice(0,300)+'\nDiagnosa dan fix.'),500);
  }

  function onSidebarDragStart(e){
    setDragging(true);
    const startX=e.touches?e.touches[0].clientX:e.clientX,startW=sidebarWidth;
    function onMove(ev){const x=ev.touches?ev.touches[0].clientX:ev.clientX;setSidebarWidth(Math.max(120,Math.min(300,startW+(x-startX))));}
    function onEnd(){setDragging(false);Preferences.set({key:'yc_sidebar_w',value:String(sidebarWidth)});window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onEnd);window.removeEventListener('touchmove',onMove);window.removeEventListener('touchend',onEnd);}
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onEnd);window.addEventListener('touchmove',onMove,{passive:true});window.addEventListener('touchend',onEnd);
  }

  const tokens=countTokens(messages);
  const VIRTUAL_LIMIT=60;
  const visibleMessages=messages.length>VIRTUAL_LIMIT?[{role:'assistant',content:`[... ${messages.length-VIRTUAL_LIMIT} pesan tersembunyi. /clear untuk bersihkan]`},...messages.slice(-VIRTUAL_LIMIT)]:messages;

  // ── RENDER ──
  return (
    <div style={{position:'fixed',inset:0,background:T.bg,color:T.text,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',display:'flex',flexDirection:'column',fontSize:fontSize+'px'}}
      onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop}>
      {dragOver&&<div style={{position:'absolute',inset:0,background:'rgba(124,58,237,.15)',border:'2px dashed rgba(124,58,237,.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}><span style={{fontSize:'18px',color:'#a78bfa'}}>Drop file di sini~</span></div>}
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}textarea,input{scrollbar-width:none;}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}button{transition:color .15s,background .15s,opacity .15s;}button:active{opacity:.6!important;}.msg-appear{animation:fadeIn .18s ease forwards;}`}</style>

      {sessionColor&&<div style={{height:'2px',background:sessionColor,flexShrink:0}}/>}

      {/* HEADER */}
      <div style={{height:'44px',padding:'0 10px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:'8px',background:T.bg,flexShrink:0}}>
        <button onClick={()=>setShowSidebar(!showSidebar)} style={{background:'none',border:'none',color:showSidebar?T.accent:'rgba(255,255,255,.3)',fontSize:'15px',cursor:'pointer',padding:'4px',borderRadius:'5px',lineHeight:1}}>☰</button>
        <div style={{width:'6px',height:'6px',borderRadius:'50%',background:serverOk?'#4ade80':'#f87171',flexShrink:0}}/>
        <div style={{flex:1,cursor:'pointer',minWidth:0,overflow:'hidden'}} onClick={()=>setShowFolder(!showFolder)}>
          <span style={{fontSize:'13px',fontWeight:'600',color:T.text,letterSpacing:'-0.2px'}}>YuyuCode</span>
          <span style={{fontSize:'11px',color:'rgba(255,255,255,.25)',marginLeft:'8px'}}>{folder}</span>
          <span style={{fontSize:'10px',color:'rgba(255,255,255,.18)',marginLeft:'4px'}}>⎇ {branch}</span>
          {skill&&<span style={{fontSize:'9px',color:'rgba(74,222,128,.5)',marginLeft:'6px',fontWeight:'600'}}>SKILL</span>}
          <span style={{fontSize:'10px',color:effort==='low'?'rgba(74,222,128,.6)':effort==='high'?'rgba(248,113,113,.6)':'rgba(255,255,255,.2)',marginLeft:'4px'}}>{effort==='low'?'○':effort==='high'?'●':'◐'}</span>
        </div>
        <button onClick={()=>{const i=MODELS.findIndex(m=>m.id===model);const next=MODELS[(i+1)%MODELS.length];setModel(next.id);Preferences.set({key:'yc_model',value:next.id});}}
          style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'99px',padding:'3px 9px',color:'rgba(255,255,255,.45)',fontSize:'10px',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
          {MODELS.find(m=>m.id===model)?.label||'AI'}
        </button>
        {MODELS.find(m=>m.id===model)?.provider==='ollama'&&(
          <button onClick={()=>setShowOllamaConfig(v=>!v)} title={ollamaHost}
            style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'99px',padding:'2px 7px',color:'rgba(74,222,128,.7)',fontSize:'9px',cursor:'pointer',flexShrink:0,fontFamily:'monospace',maxWidth:'90px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            🏠 {ollamaHost.replace('http://','').replace('https://','')}
          </button>
        )}
        <span style={{fontSize:'10px',color:'rgba(255,255,255,.2)',flexShrink:0}}>~{tokens}tk</span>
        <button onClick={()=>setShowPalette(true)} style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'7px',padding:'4px 8px',color:'rgba(255,255,255,.4)',fontSize:'12px',cursor:'pointer',flexShrink:0}}>⌘</button>
        <button onClick={()=>{setMessages([{role:'assistant',content:'Chat baru. Mau ngerjain apa Papa? 🌸'}]);Preferences.remove({key:'yc_history'});setShowFollowUp(false);haptic('light');}}
          style={{background:'none',border:'1px solid rgba(255,255,255,.07)',borderRadius:'7px',padding:'4px 8px',color:'rgba(255,255,255,.3)',fontSize:'11px',cursor:'pointer',flexShrink:0}}>new</button>
      </div>

      {showFolder&&(
        <div style={{padding:'8px 12px',borderBottom:'1px solid '+T.border,display:'flex',gap:'6px',background:T.bg2,flexShrink:0}}>
          <input value={folderInput} onChange={e=>setFolderInput(e.target.value)} placeholder="nama folder" onKeyDown={e=>e.key==='Enter'&&saveFolder(folderInput)}
            style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'6px 10px',color:T.text,fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <button onClick={()=>saveFolder(folderInput)} style={{background:'rgba(255,255,255,.08)',border:'none',borderRadius:'6px',padding:'6px 12px',color:'rgba(255,255,255,.7)',fontSize:'12px',cursor:'pointer'}}>set</button>
        </div>
      )}

      {showOllamaConfig&&(
        <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(74,222,128,.15)',display:'flex',gap:'6px',alignItems:'center',background:'rgba(74,222,128,.03)',flexShrink:0}}>
          <span style={{fontSize:'11px',color:'rgba(74,222,128,.7)',flexShrink:0}}>🏠</span>
          <input value={ollamaHost} onChange={e=>setOllamaHost(e.target.value)} onBlur={()=>Preferences.set({key:'yc_ollama_host',value:ollamaHost})} onKeyDown={e=>{if(e.key==='Enter'){Preferences.set({key:'yc_ollama_host',value:ollamaHost});setShowOllamaConfig(false);}}} placeholder="http://192.168.1.x:11434"
            style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'6px',padding:'4px 8px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace'}}/>
          <button onClick={()=>{Preferences.set({key:'yc_ollama_host',value:ollamaHost});setShowOllamaConfig(false);}} style={{background:'rgba(74,222,128,.12)',border:'none',borderRadius:'5px',padding:'4px 10px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}>set</button>
        </div>
      )}

      <UndoBar history={editHistory} onUndo={undoLastEdit}/>

      {/* STATUS BANNERS */}
      {!netOnline&&<div style={{padding:'3px 12px',background:'rgba(248,113,113,.08)',borderBottom:'1px solid rgba(248,113,113,.12)',fontSize:'10px',color:'#f87171',flexShrink:0}}>📡 Offline</div>}
      {rateLimitTimer>0&&<div style={{padding:'3px 12px',background:'rgba(251,191,36,.05)',borderBottom:'1px solid rgba(251,191,36,.08)',fontSize:'10px',color:'rgba(251,191,36,.7)',flexShrink:0}}>⏳ Rate limit {rateLimitTimer}s</div>}
      {agentRunning&&<div style={{padding:'3px 12px',background:'rgba(124,58,237,.05)',borderBottom:'1px solid rgba(124,58,237,.1)',fontSize:'10px',color:'#a78bfa',flexShrink:0}}>● Yuyu lagi jalan···</div>}
      {reconnectTimer>0&&!serverOk&&<div style={{padding:'3px 12px',background:'rgba(248,113,113,.05)',borderBottom:'1px solid rgba(248,113,113,.1)',fontSize:'10px',color:'#f87171',flexShrink:0}}>↺ Reconnecting···</div>}
      {countTokens(messages)>15000&&<div style={{padding:'3px 12px',background:'rgba(251,191,36,.04)',borderBottom:'1px solid rgba(251,191,36,.07)',fontSize:'10px',color:'rgba(251,191,36,.6)',flexShrink:0}}>⚠ Context besar ~{countTokens(messages)}tk</div>}

      <div style={{flex:1,display:'flex',overflow:'hidden',position:'relative'}}>

        {/* SIDEBAR */}
        {showSidebar&&(
          <div style={{width:sidebarWidth+'px',borderRight:'1px solid '+T.border,display:'flex',flexDirection:'column',flexShrink:0,background:T.bg2,position:'relative'}}>
            <div style={{padding:'5px 8px',borderBottom:'1px solid rgba(255,255,255,.05)',display:'flex',gap:'4px',alignItems:'center'}}>
              <span style={{fontSize:'10px',color:'rgba(255,255,255,.25)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{folder}</span>
            </div>
            {recentFiles.length>0&&(
              <div style={{padding:'4px 8px',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                <div style={{fontSize:'9px',color:'rgba(255,255,255,.2)',marginBottom:'3px',letterSpacing:'.05em'}}>RECENT</div>
                {recentFiles.slice(0,4).map(f=>(
                  <div key={f} onClick={()=>openFile(f)} style={{fontSize:'11px',color:'rgba(255,255,255,.4)',padding:'2px 4px',cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',borderRadius:'3px'}}
                    onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.4)'}>
                    {f.split('/').pop()}
                  </div>
                ))}
              </div>
            )}
            <div style={{flex:1,overflow:'hidden'}}>
              <FileTree folder={folder} onSelectFile={openFile} selectedFile={selectedFile}/>
            </div>
            <div onMouseDown={onSidebarDragStart} onTouchStart={onSidebarDragStart}
              style={{position:'absolute',top:0,right:-3,bottom:0,width:'6px',cursor:'col-resize',background:dragging?'rgba(124,58,237,.3)':'transparent'}}/>
          </div>
        )}

        {/* CENTER */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

          {/* TABS */}
          <div style={{display:'flex',borderBottom:'1px solid '+T.border,flexShrink:0,background:T.bg,height:'34px',alignItems:'stretch'}}>
            <button onClick={()=>setActiveTab('chat')} style={{padding:'0 14px',background:'none',border:'none',borderBottom:activeTab==='chat'?'2px solid '+T.accent:'2px solid transparent',color:activeTab==='chat'?T.accent:'rgba(255,255,255,.3)',fontSize:'12px',cursor:'pointer',fontWeight:activeTab==='chat'?'500':'400'}}>Chat</button>
            {selectedFile&&(
              <>
                <button onClick={()=>{setActiveTab('file');setEditMode(false);}} style={{padding:'0 12px',background:'none',border:'none',borderBottom:activeTab==='file'&&!editMode?'2px solid '+T.accent:'2px solid transparent',color:activeTab==='file'&&!editMode?T.accent:'rgba(255,255,255,.3)',fontSize:'12px',cursor:'pointer',maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis'}}>{selectedFile.split('/').pop()}</button>
                <button onClick={()=>{setActiveTab('file');setEditMode(true);}} style={{padding:'0 10px',background:'none',border:'none',borderBottom:editMode?'2px solid #f59e0b':'2px solid transparent',color:editMode?'#f59e0b':'rgba(255,255,255,.25)',fontSize:'11px',cursor:'pointer'}}>edit</button>
              </>
            )}
            <div style={{flex:1}}/>
            <button onClick={()=>setShowTerminal(!showTerminal)} style={{padding:'0 12px',background:'none',border:'none',borderBottom:showTerminal?'2px solid rgba(255,255,255,.3)':'2px solid transparent',color:showTerminal?'rgba(255,255,255,.6)':'rgba(255,255,255,.2)',fontSize:'11px',cursor:'pointer',fontFamily:'monospace'}}>$</button>
          </div>

          {/* CHAT */}
          {activeTab==='chat'&&!showTerminal&&(
            <div ref={chatRef} style={{flex:1,overflowY:'auto',padding:'12px 0'}}>
              {visibleMessages.map((m,i)=>(
                <MsgBubble key={i} msg={m} isLast={i===messages.length-1}
                  onApprove={m.actions?.some(a=>a.type==='write_file'&&!a.executed)?(ok,path)=>handleApprove(i,ok,path):null}
                  onPlanApprove={m.content?.includes('📋 PLAN:')&&!m.planApproved?(ok)=>handlePlanApprove(i,ok):null}
                  onRetry={i===messages.length-1&&m.role==='user'?retryLast:null}
                  onContinue={i===messages.length-1&&m.role==='assistant'&&m.content.trim().endsWith('CONTINUE')?continueMsg:null}
                  onAutoFix={i===messages.length-1?()=>sendMsg('Ada error di output. Analisis dan fix otomatis.'):null}
                />
              ))}
              {streaming&&(
                <div style={{padding:'2px 16px'}}>
                  <div style={{maxWidth:'92%',fontSize:'14px',lineHeight:'1.7',color:'#e0e0e0'}}>
                    <MsgContent text={streaming}/>
                    <span style={{display:'inline-block',width:'2px',height:'14px',background:'rgba(255,255,255,.6)',marginLeft:'2px',verticalAlign:'middle',animation:'blink 1s infinite'}}/>
                  </div>
                </div>
              )}
              {loading&&!streaming&&<div style={{padding:'2px 16px'}}><div style={{color:'rgba(255,255,255,.3)',fontSize:'13px'}}>Yuyu lagi mikir···</div></div>}
              <div ref={bottomRef}/>
            </div>
          )}

          {/* FILE VIEWER */}
          {activeTab==='file'&&selectedFile&&!editMode&&!showTerminal&&(
            <div style={{flex:1,overflow:'auto'}}>
              <div style={{padding:'5px 12px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:'6px',background:T.bg2,position:'sticky',top:0,flexWrap:'wrap'}}>
                <span style={{fontSize:'11px',color:'rgba(255,255,255,.4)',fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{selectedFile}</span>
                <button onClick={()=>togglePin(selectedFile)} style={{background:pinnedFiles.includes(selectedFile)?'rgba(99,102,241,.15)':'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'5px',padding:'2px 6px',color:pinnedFiles.includes(selectedFile)?'#818cf8':'rgba(255,255,255,.3)',fontSize:'10px',cursor:'pointer',flexShrink:0}}>📌</button>
                <button onClick={()=>sendMsg('Yu, jalankan git log --oneline -10 -- '+selectedFile.replace(folder+'/',''))} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'5px',padding:'2px 6px',color:'rgba(255,255,255,.35)',fontSize:'10px',cursor:'pointer',flexShrink:0}}>📜</button>
                <button onClick={()=>setShowBlame(true)} style={{background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.15)',borderRadius:'5px',padding:'2px 6px',color:'rgba(99,102,241,.7)',fontSize:'10px',cursor:'pointer',flexShrink:0}}>👁 blame</button>
                <button onClick={()=>setShowFileHistory(true)} style={{background:'rgba(251,191,36,.06)',border:'1px solid rgba(251,191,36,.12)',borderRadius:'5px',padding:'2px 6px',color:'rgba(251,191,36,.6)',fontSize:'10px',cursor:'pointer',flexShrink:0}}>📜 history</button>
                <button onClick={()=>{setMessages(m=>[...m,{role:'user',content:'Yu, ini konteks file '+selectedFile+':\n```\n'+(fileContent||'').slice(0,2000)+'\n```'}]);setActiveTab('chat');}} style={{background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'5px',padding:'2px 6px',color:'#4ade80',fontSize:'10px',cursor:'pointer',flexShrink:0}}>+ctx</button>
                <button onClick={()=>sendMsg('Yu, jelaskan file '+selectedFile)} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'5px',padding:'2px 8px',color:'#a78bfa',fontSize:'10px',cursor:'pointer',flexShrink:0}}>Tanya</button>
                <button onClick={()=>{setSelectedFile(null);setFileContent(null);setActiveTab('chat');}} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:'14px',cursor:'pointer',flexShrink:0}}>×</button>
              </div>
              <div style={{display:'flex',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.6'}}>
                <div style={{padding:'8px 6px',color:'rgba(255,255,255,.2)',textAlign:'right',userSelect:'none',borderRight:'1px solid rgba(255,255,255,.05)',minWidth:'36px',flexShrink:0,background:'rgba(255,255,255,.01)'}}>
                  {(fileContent||'').split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
                </div>
                <pre style={{margin:0,padding:'8px 12px',whiteSpace:'pre-wrap',wordBreak:'break-word',color:'rgba(255,255,255,.7)',flex:1}} dangerouslySetInnerHTML={{__html:hl(fileContent||'',selectedFile?.split('.').pop()||'')}}/>
              </div>
            </div>
          )}

          {/* FILE EDITOR */}
          {activeTab==='file'&&selectedFile&&editMode&&!showTerminal&&(
            <div style={{flex:1,overflow:'hidden',display:'flex'}}>
              {splitView?(
                <>
                  <div style={{flex:1,overflow:'hidden',borderRight:'1px solid rgba(255,255,255,.07)'}}>
                    <FileEditor path={selectedFile} content={fileContent||''} onSave={saveFile} onClose={()=>setEditMode(false)}/>
                  </div>
                  <div style={{flex:1,overflowY:'auto',padding:'12px 0'}}>
                    {messages.slice(-10).map((m,i)=>(
                      <div key={i} style={{padding:'4px 12px'}}>
                        <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)',marginBottom:'2px'}}>{m.role==='user'?'Papa':'Yuyu'}</div>
                        <div style={{fontSize:'12px',color:'rgba(255,255,255,.7)',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{m.content.replace(/```action[\s\S]*?```/g,'').slice(0,300)}</div>
                      </div>
                    ))}
                  </div>
                </>
              ):(
                <FileEditor path={selectedFile} content={fileContent||''} onSave={saveFile} onClose={()=>setEditMode(false)}/>
              )}
            </div>
          )}

          {/* TERMINAL */}
          {showTerminal&&<div style={{flex:1,overflow:'hidden'}}><Terminal folder={folder} cmdHistory={cmdHistory} addHistory={addHistory}/></div>}

          {/* FOLLOW UPS */}
          {showFollowUp&&!loading&&activeTab==='chat'&&!showTerminal&&(
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',padding:'6px 16px',flexShrink:0}}>
              {FOLLOW_UPS.map(p=>(
                <button key={p} onClick={()=>sendMsg(p)} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px',padding:'4px 10px',color:'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer'}}>{p}</button>
              ))}
            </div>
          )}

          {/* QUICK BAR */}
          {!showTerminal&&(
            <div style={{height:'32px',padding:'0 10px',borderTop:'1px solid '+T.border,display:'flex',alignItems:'center',gap:'2px',flexShrink:0,overflowX:'auto'}}>
              {GIT_SHORTCUTS.map(s=>(
                <button key={s.label} onClick={()=>runShortcut(s.cmd)} disabled={loading}
                  style={{background:'none',border:'none',padding:'4px 8px',color:'rgba(255,255,255,.3)',fontSize:'10px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace',borderRadius:'5px',display:'flex',alignItems:'center',gap:'3px'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                  <span style={{opacity:.6}}>{s.icon}</span><span>{s.label}</span>
                </button>
              ))}
              <div style={{flex:1}}/>
              {pinnedFiles.map(f=>(
                <button key={f} onClick={()=>openFile(f)} style={{background:'rgba(99,102,241,.08)',border:'none',borderRadius:'4px',padding:'2px 7px',color:'rgba(99,102,241,.6)',fontSize:'9px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace'}}>{f.split('/').pop()}</button>
              ))}
            </div>
          )}

          {/* INPUT */}
          {!showTerminal&&(
            <div style={{padding:'8px 10px',borderTop:'1px solid '+T.border,background:T.bg,flexShrink:0,position:'relative'}}>
              {slashSuggestions.length>0&&(
                <div style={{position:'absolute',bottom:'100%',left:'10px',right:'10px',background:'#111113',border:'1px solid rgba(255,255,255,.1)',borderRadius:'10px',zIndex:99,marginBottom:'6px',boxShadow:'0 12px 32px rgba(0,0,0,.6)',maxHeight:'260px',overflowY:'auto'}}>
                  {slashSuggestions.map(s=>(
                    <div key={s.cmd} onClick={()=>{setInput(s.cmd);setSlashSuggestions([]);inputRef.current?.focus();}}
                      style={{display:'flex',gap:'10px',padding:'8px 12px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.04)'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span style={{color:T.accent,fontFamily:'monospace',fontSize:'12px',flexShrink:0,minWidth:'100px'}}>{s.cmd}</span>
                      <span style={{color:'rgba(255,255,255,.35)',fontSize:'12px'}}>{s.desc}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:'flex',gap:'6px',alignItems:'flex-end'}}>
                {visionImage&&(
                  <div style={{position:'relative',flexShrink:0}}>
                    <img src={'data:image/jpeg;base64,'+visionImage} alt="attached" style={{width:'36px',height:'36px',borderRadius:'7px',objectFit:'cover',border:'1px solid rgba(124,58,237,.3)'}}/>
                    <button onClick={()=>setVisionImage(null)} style={{position:'absolute',top:'-4px',right:'-4px',background:'#f87171',border:'none',borderRadius:'50%',width:'13px',height:'13px',color:'white',fontSize:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>×</button>
                  </div>
                )}
                <button onClick={()=>fileInputRef.current?.click()} style={{background:'none',border:'none',padding:'8px 4px',color:'rgba(255,255,255,.2)',fontSize:'15px',cursor:'pointer',flexShrink:0,borderRadius:'8px'}}>📎</button>
                <textarea ref={inputRef} value={input}
                  onChange={e=>{
                    setInput(e.target.value);
                    e.target.style.height='auto';
                    e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';
                    if(e.target.value.startsWith('/')) setSlashSuggestions(SLASH_COMMANDS.filter(s=>s.cmd.startsWith(e.target.value)));
                    else setSlashSuggestions([]);
                  }}
                  onKeyDown={e=>{
                    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();return;}
                    if(e.key==='ArrowUp'&&!input){const i=Math.min(histIdx+1,cmdHistory.length-1);setHistIdx(i);setInput(cmdHistory[i]||'');}
                    if(e.key==='ArrowDown'&&histIdx>-1){const i=histIdx-1;setHistIdx(i);setInput(i>=0?cmdHistory[i]:'');}
                  }}
                  placeholder="Tanya Yuyu, atau / untuk commands"
                  disabled={loading} rows={1}
                  style={{flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'10px',padding:'9px 12px',color:loading?'rgba(255,255,255,.25)':T.text,fontSize:'13px',resize:'none',outline:'none',fontFamily:'inherit',lineHeight:'1.5'}}/>
                {loading
                  ?<button onClick={cancel} style={{background:'rgba(248,113,113,.1)',border:'none',borderRadius:'10px',padding:'9px 14px',color:'#f87171',fontSize:'14px',cursor:'pointer',flexShrink:0}}>■</button>
                  :<button onClick={()=>sendMsg()} style={{background:T.accent,border:'none',borderRadius:'10px',padding:'9px 16px',color:'white',fontSize:'14px',cursor:'pointer',fontWeight:'600',flexShrink:0}}>↑</button>
                }
                <VoiceBtn disabled={loading} onResult={txt=>{setInput(i=>i?i+' '+txt:txt);inputRef.current?.focus();}}/>
                {pushToTalk&&<PushToTalkBtn onResult={v=>{setInput('');setTimeout(()=>sendMsg(v),100);}} disabled={loading}/>}
                <button onClick={()=>{if(ttsEnabled){stopTts();setTtsEnabled(false);}else setTtsEnabled(true);}}
                  style={{background:ttsEnabled?'rgba(124,58,237,.2)':'rgba(255,255,255,.04)',border:'1px solid '+(ttsEnabled?'rgba(124,58,237,.4)':'rgba(255,255,255,.08)'),borderRadius:'10px',padding:'8px 10px',color:ttsEnabled?'#a78bfa':'rgba(255,255,255,.3)',fontSize:'13px',cursor:'pointer',flexShrink:0}}>
                  {ttsEnabled?'🔊':'🔇'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAYS */}
      {showSearch&&<SearchBar folder={folder} onSelectFile={openFile} onClose={()=>setShowSearch(false)}/>}
      {showShortcuts&&<ShortcutsPanel onClose={()=>setShowShortcuts(false)}/>}
      {showDiff&&<GitDiffPanel folder={folder} onClose={()=>setShowDiff(false)}/>}
      {showBlame&&selectedFile&&<GitBlamePanel folder={folder} filePath={selectedFile} onClose={()=>setShowBlame(false)}/>}
      {showSnippets&&<SnippetLibrary onInsert={code=>{setInput(i=>i?i+'\n'+code:code);setShowSnippets(false);inputRef.current?.focus();}} onClose={()=>setShowSnippets(false)}/>}
      {showFileHistory&&selectedFile&&<FileHistoryPanel folder={folder} filePath={selectedFile} onClose={()=>setShowFileHistory(false)}/>}
      {showCustomActions&&<CustomActionsPanel folder={folder} onRun={cmd=>runShortcut(cmd)} onClose={()=>setShowCustomActions(false)}/>}

      {showPalette&&(
        <CommandPalette onClose={()=>setShowPalette(false)}
          folder={folder} memories={memories} checkpoints={checkpoints} model={model} models={MODELS}
          onModelChange={id=>{setModel(id);Preferences.set({key:'yc_model',value:id});}}
          onNewChat={()=>{setMessages([{role:'assistant',content:'Chat baru. Mau ngerjain apa Papa? 🌸'}]);Preferences.remove({key:'yc_history'});setShowFollowUp(false);}}
          theme={theme} onThemeChange={t=>{setTheme(t);Preferences.set({key:'yc_theme',value:t});}}
          showSidebar={showSidebar} onToggleSidebar={()=>setShowSidebar(s=>!s)}
          onShowMemory={()=>setShowMemory(true)} onShowCheckpoints={()=>setShowCheckpoints(true)}
          onShowMCP={()=>setShowMCP(true)} onShowGitHub={()=>setShowGitHub(true)} onShowDeploy={()=>setShowDeploy(true)}
          onShowSessions={()=>{loadSessions().then(s=>{setSessionList(s);setShowSessions(true);});}}
          onShowPermissions={()=>setShowPermissions(true)} onShowPlugins={()=>setShowPlugins(true)} onShowConfig={()=>setShowConfig(true)}
          onShowDiff={()=>setShowDiff(true)} onShowSearch={()=>setShowSearch(true)}
          onShowSnippets={()=>setShowSnippets(true)} onShowCustomActions={()=>setShowCustomActions(true)}
          runTests={runTests} generateCommitMsg={generateCommitMsg} exportChat={exportChat} compactContext={compactContext}
        />
      )}

      {/* MEMORY */}
      {showMemory&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🧠 Auto Memories ({memories.length})</span>
            <button onClick={()=>{setMemories([]);Preferences.remove({key:'yc_memories'});}} style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'5px',padding:'2px 8px',color:'#f87171',fontSize:'10px',cursor:'pointer',marginRight:'8px'}}>clear all</button>
            <button onClick={()=>setShowMemory(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {memories.length===0&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Belum ada memories~</div>}
            {memories.map(m=>(
              <div key={m.id} style={{display:'flex',gap:'8px',padding:'7px 10px',marginBottom:'4px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'7px'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,.75)'}}>{m.text}</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,.25)',marginTop:'2px'}}>{m.folder} · {m.ts}</div>
                </div>
                <button onClick={()=>{const next=memories.filter(x=>x.id!==m.id);setMemories(next);Preferences.set({key:'yc_memories',value:JSON.stringify(next)});}} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer',flexShrink:0}}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHECKPOINTS */}
      {showCheckpoints&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>📍 Checkpoints</span>
            <button onClick={saveCheckpoint} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'10px',cursor:'pointer',marginRight:'8px'}}>+ Save now</button>
            <button onClick={()=>setShowCheckpoints(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {checkpoints.length===0&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Belum ada checkpoint~</div>}
            {checkpoints.map(cp=>(
              <div key={cp.id} style={{display:'flex',gap:'8px',alignItems:'center',padding:'8px 10px',marginBottom:'4px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'7px'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,.75)'}}>{cp.label}</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)'}}>{cp.folder} · {cp.messages.length} pesan</div>
                </div>
                <button onClick={()=>restoreCheckpoint(cp)} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'5px',padding:'2px 8px',color:'#a78bfa',fontSize:'10px',cursor:'pointer'}}>restore</button>
                <button onClick={()=>{const next=checkpoints.filter(x=>x.id!==cp.id);setCheckpoints(next);Preferences.set({key:'yc_checkpoints',value:JSON.stringify(next)});}} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer'}}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SWARM LOG */}
      {swarmRunning&&(
        <div style={{position:'fixed',bottom:'80px',right:'12px',background:'rgba(0,0,0,.92)',border:'1px solid rgba(124,58,237,.3)',borderRadius:'10px',padding:'12px',zIndex:98,maxWidth:'280px',maxHeight:'200px',overflowY:'auto'}}>
          <div style={{fontSize:'11px',fontWeight:'600',color:'#a78bfa',marginBottom:'6px'}}>🐝 Agent Swarm Running···</div>
          {swarmLog.map((l,i)=><div key={i} style={{fontSize:'10px',color:'rgba(255,255,255,.6)',marginBottom:'2px'}}>{l}</div>)}
        </div>
      )}

      {/* DEP GRAPH */}
      {showDepGraph&&depGraph&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🕸 Dep Graph — {depGraph.file}</span>
            <button onClick={()=>setShowDepGraph(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {depGraph.imports.map((imp,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',marginBottom:'3px',background:imp.startsWith('.')?'rgba(74,222,128,.04)':'rgba(255,255,255,.02)',border:'1px solid '+(imp.startsWith('.')?'rgba(74,222,128,.1)':'rgba(255,255,255,.05)'),borderRadius:'6px'}}>
                <span style={{fontSize:'10px'}}>{imp.startsWith('.')?'📄':'📦'}</span>
                <span style={{fontSize:'11px',color:imp.startsWith('.')?'#4ade80':'rgba(255,255,255,.5)',fontFamily:'monospace'}}>{imp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showThemeBuilder&&<ThemeBuilder current={customTheme||THEMES[theme]} onSave={t=>{setCustomTheme(t);Preferences.set({key:'yc_custom_theme',value:JSON.stringify(t)});setShowThemeBuilder(false);}} onClose={()=>setShowThemeBuilder(false)}/>}

      {/* ONBOARDING */}
      {showOnboarding&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.95)',zIndex:100,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{fontSize:'32px',marginBottom:'12px'}}>🌸</div>
          <div style={{fontSize:'20px',fontWeight:'700',color:'#f0f0f0',marginBottom:'6px'}}>Halo Papa! Yuyu siap~</div>
          <div style={{fontSize:'13px',color:'rgba(255,255,255,.5)',marginBottom:'24px',textAlign:'center'}}>Setup cepat sebelum mulai</div>
          <div style={{width:'100%',maxWidth:'320px',display:'flex',flexDirection:'column',gap:'10px'}}>
            <input value={folderInput} onChange={e=>setFolderInput(e.target.value)} placeholder="contoh: yuyucode"
              style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.15)',borderRadius:'8px',padding:'10px 14px',color:'#f0f0f0',fontSize:'14px',outline:'none',fontFamily:'monospace'}}/>
            <div style={{background:'rgba(0,0,0,.5)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'8px 12px',fontFamily:'monospace',fontSize:'11px',color:'rgba(74,222,128,.8)'}}>node ~/yuyu-server.js &</div>
            <button onClick={()=>{saveFolder(folderInput);Preferences.set({key:'yc_onboarded',value:'1'});setShowOnboarding(false);haptic('medium');}}
              style={{background:'#7c3aed',border:'none',borderRadius:'10px',padding:'12px',color:'white',fontSize:'14px',cursor:'pointer',fontWeight:'600',marginTop:'8px'}}>
              Mulai Coding! 🚀
            </button>
          </div>
        </div>
      )}

      {/* MCP */}
      {showMCP&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🔌 MCP Tools</span>
            <button onClick={()=>setShowMCP(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          {['git','fetch','sqlite','github','system','filesystem'].map(tool=>(
            <div key={tool} style={{padding:'10px 12px',marginBottom:'6px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(74,222,128,.1)',borderRadius:'8px'}}>
              <span style={{fontSize:'13px',color:'#4ade80',fontFamily:'monospace',fontWeight:'600'}}>{tool}</span>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'6px'}}>
                {(tool==='git'?['status','log','diff']:tool==='fetch'?['browse']:tool==='sqlite'?['tables']:tool==='github'?['issues','pulls']:tool==='system'?['disk','memory']:['list']).map(act=>(
                  <button key={act} onClick={async()=>{const r=await callServer({type:'mcp',tool,action:act,params:{path:folder}});setMessages(m=>[...m,{role:'assistant',content:`🔌 ${tool}/${act}:\n\`\`\`\n${(r.data||'').slice(0,1000)}\n\`\`\``,actions:[]}]);setShowMCP(false);}}
                    style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'4px',padding:'2px 8px',color:'rgba(74,222,128,.8)',fontSize:'10px',cursor:'pointer',fontFamily:'monospace'}}>{act}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GITHUB */}
      {showGitHub&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>⑂ GitHub</span>
            <button onClick={()=>setShowGitHub(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'12px'}}>
            <input value={githubRepo} onChange={e=>setGithubRepo(e.target.value)} placeholder="owner/repo" style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'7px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
            <input value={githubToken} onChange={e=>{setGithubToken(e.target.value);Preferences.set({key:'yc_gh_token',value:e.target.value});}} placeholder="GitHub token" type="password" style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'7px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
            <div style={{display:'flex',gap:'6px'}}>
              <button onClick={()=>fetchGitHub('issues')} style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:'6px',padding:'5px 12px',color:'#818cf8',fontSize:'11px',cursor:'pointer',flex:1}}>📋 Issues</button>
              <button onClick={()=>fetchGitHub('pulls')} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'6px',padding:'5px 12px',color:'#4ade80',fontSize:'11px',cursor:'pointer',flex:1}}>🔀 PRs</button>
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {githubData&&Array.isArray(githubData.data)&&githubData.data.map((item,i)=>(
              <div key={i} style={{padding:'8px 10px',marginBottom:'4px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'7px'}}>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,.8)',marginBottom:'2px'}}>#{item.number} {item.title}</div>
                <div style={{fontSize:'10px',color:'rgba(255,255,255,.35)'}}>{item.state} · {item.user?.login}</div>
                <button onClick={()=>{setMessages(m=>[...m,{role:'user',content:'Bantu fix issue: #'+item.number+' '+item.title+'\n\n'+item.body?.slice(0,300)}]);setShowGitHub(false);}} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'4px',padding:'2px 7px',color:'#a78bfa',fontSize:'10px',cursor:'pointer',marginTop:'4px'}}>Ask Yuyu</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SESSIONS */}
      {showSessions&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.95)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>💾 Saved Sessions</span>
            <button onClick={()=>setShowSessions(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          {sessionList.length===0&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Belum ada sesi tersimpan. Ketik /save~</div>}
          <div style={{flex:1,overflowY:'auto'}}>
            {sessionList.map(s=>(
              <div key={s.id} style={{padding:'10px 12px',marginBottom:'6px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'8px',display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',color:'#f0f0f0',fontWeight:'500'}}>{s.name}</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,.35)'}}>{s.folder} · {new Date(s.savedAt).toLocaleString('id')} · {s.messages?.length||0} pesan</div>
                </div>
                <button onClick={()=>{setMessages(s.messages||[]);setFolder(s.folder);setFolderInput(s.folder);setShowSessions(false);setMessages(m=>[...m,{role:'assistant',content:'✅ Sesi **'+s.name+'** dipulihkan.',actions:[]}]);}} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'6px',padding:'4px 10px',color:'#a78bfa',fontSize:'11px',cursor:'pointer'}}>Restore</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PERMISSIONS */}
      {showPermissions&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.95)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🔐 Tool Permissions</span>
            <button onClick={()=>setShowPermissions(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {Object.entries(permissions).map(([tool,allowed])=>(
              <div key={tool} style={{display:'flex',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',color:'#f0f0f0',fontFamily:'monospace'}}>{tool}</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)'}}>{allowed?'Auto-run':'Butuh konfirmasi'}</div>
                </div>
                <div onClick={()=>{const next={...permissions,[tool]:!allowed};setPermissions(next);Preferences.set({key:'yc_permissions',value:JSON.stringify(next)});}} style={{width:'42px',height:'24px',borderRadius:'12px',background:allowed?'#7c3aed':'rgba(255,255,255,.1)',cursor:'pointer',position:'relative',transition:'all .2s',flexShrink:0}}>
                  <div style={{position:'absolute',top:'3px',left:allowed?'21px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'white',transition:'all .2s'}}/>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>{const reset={read_file:true,write_file:false,exec:false,list_files:true,search:true,mcp:false,delete_file:false,browse:false};setPermissions(reset);Preferences.set({key:'yc_permissions',value:JSON.stringify(reset)});}} style={{marginTop:'12px',background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'8px',padding:'8px',color:'#f87171',fontSize:'12px',cursor:'pointer'}}>Reset ke Default</button>
        </div>
      )}

      {/* PLUGINS */}
      {showPlugins&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.95)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🔌 Plugin Marketplace</span>
            <button onClick={()=>setShowPlugins(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          {[{name:'Auto Commit',desc:'Commit otomatis setelah write_file',cmd:'hooks.postWrite'},{name:'Lint on Save',desc:'ESLint setiap save',cmd:'hooks.preWrite'},{name:'Test Runner',desc:'Auto-run tests setelah perubahan',cmd:'/test setelah write'},{name:'Browser Preview',desc:'Buka preview setelah build',cmd:'/browse localhost:5173'},{name:'Git Auto Push',desc:'Push otomatis setelah commit',cmd:'hooks.postWrite'}].map(p=>(
            <div key={p.name} style={{padding:'10px 12px',marginBottom:'6px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px'}}>
              <div style={{fontSize:'13px',color:'#f0f0f0',fontWeight:'500',marginBottom:'2px'}}>{p.name}</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)',marginBottom:'4px'}}>{p.desc}</div>
              <div style={{fontSize:'10px',color:'#a78bfa',fontFamily:'monospace'}}>{p.cmd}</div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIG */}
      {showConfig&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.95)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'16px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>⚙️ Config</span>
            <button onClick={()=>setShowConfig(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'12px'}}>
            {[
              {label:'Effort Level',value:effort,options:['low','medium','high'],onChange:v=>{setEffort(v);Preferences.set({key:'yc_effort',value:v});}},
              {label:'Font Size',value:String(fontSize),options:['12','13','14','15','16'],onChange:v=>{setFontSize(parseInt(v));Preferences.set({key:'yc_fontsize',value:v});}},
              {label:'Theme',value:theme,options:['dark','darker','midnight'],onChange:v=>{setTheme(v);Preferences.set({key:'yc_theme',value:v});}},
              {label:'Model',value:model,options:MODELS.map(m=>m.id),onChange:v=>{setModel(v);Preferences.set({key:'yc_model',value:v});}},
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
              <button onClick={()=>{const n=!thinkingEnabled;setThinkingEnabled(n);Preferences.set({key:'yc_thinking',value:n?'1':'0'});}} style={{background:thinkingEnabled?'rgba(124,58,237,.3)':'rgba(255,255,255,.05)',border:'1px solid '+(thinkingEnabled?'rgba(124,58,237,.5)':'rgba(255,255,255,.08)'),borderRadius:'6px',padding:'4px 10px',color:thinkingEnabled?'#a78bfa':'rgba(255,255,255,.5)',fontSize:'11px',cursor:'pointer'}}>
                {thinkingEnabled?'✅ ON':'○ OFF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPLOY */}
      {showDeploy&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🚀 Deploy</span>
            <button onClick={()=>setShowDeploy(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'12px'}}>
            {['github','vercel','netlify','railway'].map(p=>(
              <button key={p} onClick={()=>runDeploy(p)} disabled={loading} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'8px',padding:'8px 16px',color:'#a78bfa',fontSize:'12px',cursor:'pointer',fontWeight:'500'}}>
                {p==='github'?'📤 Git Push':p==='vercel'?'▲ Vercel':p==='netlify'?'◈ Netlify':'🚂 Railway'}
              </button>
            ))}
          </div>
          {deployLog?<div style={{flex:1,background:'#0a0a0b',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px',padding:'12px',fontFamily:'monospace',fontSize:'11px',color:'rgba(255,255,255,.7)',overflowY:'auto',whiteSpace:'pre-wrap'}}>{deployLog}</div>:<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Pilih platform untuk deploy~</div>}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageAttach}/>
    </div>
  );
}
