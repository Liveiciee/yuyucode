import React, { useRef, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { MAX_HISTORY, MODELS, THEMES, BASE_SYSTEM, GIT_SHORTCUTS, FOLLOW_UPS, SLASH_COMMANDS } from './constants.js';
import { askCerebrasStream, callServer } from './api.js';
import { countTokens, hl, resolvePath, parseActions, executeAction } from './utils.js';
import { generatePlan, parsePlanSteps, executePlanStep, runBackgroundAgent, getBgAgents, mergeBackgroundAgent, loadSkills, tokenTracker, saveSession, loadSessions, rewindMessages, EFFORT_CONFIG, checkPermission, runHooksV2, tfidfRank } from './features.js';
import { MsgBubble, MsgContent } from './components/MsgBubble.jsx';
import { FileTree } from './components/FileTree.jsx';
import { FileEditor } from './components/FileEditor.jsx';
import { Terminal } from './components/Terminal.jsx';
import { SearchBar, UndoBar } from './components/SearchBar.jsx';
import { VoiceBtn, PushToTalkBtn } from './components/VoiceBtn.jsx';
import { GitDiffPanel, FileHistoryPanel, CustomActionsPanel, ShortcutsPanel, GitBlamePanel, SnippetLibrary, ThemeBuilder, CommandPalette, DepGraphPanel, ElicitationPanel, MergeConflictPanel, BottomSheet } from './components/panels.jsx';
import { parseElicitation } from './features.js';
import { useSlashCommands } from './hooks/useSlashCommands.js';
import { useUIStore }      from './hooks/useUIStore.js';
import { useProjectStore } from './hooks/useProjectStore.js';
import { useFileStore }    from './hooks/useFileStore.js';
import { useChatStore }    from './hooks/useChatStore.js';

export default function App() {
  // ── STORES (Fase 3 refactor) ──
  const ui      = useUIStore();
  const project = useProjectStore();
  const file    = useFileStore();
  const chat    = useChatStore();

  // ── REFS ──
  const ttsRef       = useRef(null);
  const fileInputRef = useRef(null);
  const chatRef      = useRef(null);
  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);
  const abortRef     = useRef(null);
  const autoContextRef = useRef({});
  const wsRef        = useRef(null); // WebSocket file watcher
  const fileSnapshotsRef = useRef({}); // For file watcher diff preview
  const T = ui.T;

  // ── EFFECTS ──
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[chat.messages,chat.streaming]);

  useEffect(()=>{
    const on=()=>project.setNetOnline(true), off=()=>project.setNetOnline(false);
    window.addEventListener('online',on); window.addEventListener('offline',off);
    return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};
  },[]);

  useEffect(()=>{
    Promise.all([
      Preferences.get({key:'yc_folder'}),      Preferences.get({key:'yc_history'}),
      Preferences.get({key:'yc_cmdhist'}),     Preferences.get({key:'yc_model'}),
      Preferences.get({key:'yc_theme'}),        Preferences.get({key:'yc_pinned'}),
      Preferences.get({key:'yc_recent'}),       Preferences.get({key:'yc_sidebar_w'}),
      Preferences.get({key:'yc_memories'}),     Preferences.get({key:'yc_checkpoints'}),
      Preferences.get({key:'yc_hooks'}),        Preferences.get({key:'yc_fontsize'}),
      Preferences.get({key:'yc_custom_theme'}), Preferences.get({key:'yc_onboarded'}),
      Preferences.get({key:'yc_gh_token'}),     Preferences.get({key:'yc_gh_repo'}),
      Preferences.get({key:'yc_session_color'}),Preferences.get({key:'yc_plugins'}),
      Preferences.get({key:'yc_effort'}),       Preferences.get({key:'yc_thinking'}),
      Preferences.get({key:'yc_permissions'}),
    ]).then(([f,h,ch,mo,th,pi,re,sw,mem,ckp,hk,fs,ct,ob,ght,ghr,sc,pl,ef,tk,perm])=>{
      ui.loadUIPrefs({theme:th.value,fontSize:fs.value,sidebarWidth:sw.value,customTheme:ct.value,onboarded:ob.value});
      project.loadProjectPrefs({folder:f.value,cmdHistory:ch.value,model:mo.value,hooks:hk.value,githubToken:ght.value,githubRepo:ghr.value,sessionColor:sc.value,plugins:pl.value,effort:ef.value,thinkingEnabled:tk.value,permissions:perm.value});
      file.loadFilePrefs({pinned:pi.value,recent:re.value});
      chat.loadChatPrefs({history:h.value,memories:mem.value,checkpoints:ckp.value});
    });
    callServer({type:'ping'}).then(r=>{project.setServerOk(r.ok);if(r.mcp)project.setMcpTools(r.mcp);});
  },[]);

  useEffect(()=>{
    const iv=setInterval(async()=>{
      const r=await callServer({type:'ping'});
      project.setServerOk(r.ok);
      project.setReconnectTimer(t=>r.ok?0:t+5);
    },5000);
    return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{ chat.persistMessages(chat.messages); },[chat.messages]);

  useEffect(()=>{ if(project.folder) project.loadFolderPrefs(project.folder); },[project.folder]);

  useEffect(()=>{
    if(!project.fileWatcherActive||!project.folder) return;
    // ── Real-time WebSocket watcher (yuyu-server port 8766) ──
    let dead=false;
    function connect(){
      if(dead) return;
      const ws=new WebSocket('ws://127.0.0.1:8766');
      wsRef.current=ws;
      ws.onopen=()=>ws.send(JSON.stringify({type:'watch',path:project.folder}));
      ws.onmessage=async(e)=>{
        try{
          const {event,filename}=JSON.parse(e.data);
          if(event==='watching'||!filename) return;
          const absPath=project.folder+(filename.startsWith('/')?filename:'/'+filename);
          const prev=fileSnapshotsRef.current[absPath];
          const r=await callServer({type:'read',path:absPath});
          if(!r.ok){
            chat.setMessages(m=>[...m,{role:'assistant',content:'👁 **File berubah:** `'+filename+'`',actions:[]}]);
            sendNotification('YuyuCode 👁',filename+' berubah');
            return;
          }
          const curr=r.data||'';
          fileSnapshotsRef.current[absPath]=curr;
          if(!prev){
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
          const diffLines=[
            ...removed.slice(0,8).map(l=>`- L${l.n}: ${l.text}`),
            ...added.slice(0,8).map(l=>`+ L${l.n}: ${l.text}`),
          ];
          const diffText=diffLines.length?'\n```diff\n'+diffLines.join('\n')+'\n```':'';
          const summary=`${added.length} baris berubah/ditambah, ${removed.length} dihapus`;
          chat.setMessages(m=>[...m,{role:'assistant',content:`👁 **File berubah:** \`${filename}\` — ${summary}${diffText}`,actions:[]}]);
          sendNotification('YuyuCode 👁',filename+' berubah: '+summary);
        }catch{}
      };
      ws.onerror=()=>{};
      ws.onclose=()=>{ if(!dead) setTimeout(connect,3000); };
    }
    connect();
    return()=>{
      dead=true;
      if(wsRef.current){wsRef.current.onclose=null;wsRef.current.close();wsRef.current=null;}
    };
  },[project.fileWatcherActive,project.folder]);

  // ── FILE OPS ──
  function openFile(path){ file.openFile(path); }

  function saveFile(content){ file.saveFile(content, msg=>chat.setMessages(m=>[...m,{role:'assistant',content:msg,actions:[]}])); }

  function saveFolder(f){ project.saveFolder(f); ui.setShowFolder(false); }
  function addHistory(cmd){ project.addHistory(cmd); }
  function togglePin(path){ file.togglePin(path); }

  async function handlePlanApprove(idx,approved){
    if(!approved){chat.setMessages(m=>m.map((x,i)=>i===idx?{...x,planApproved:false}:x));await sendMsg('Ubah plan.');return;}
    chat.setMessages(m=>m.map((x,i)=>i===idx?{...x,planApproved:true}:x));
    const msg=chat.messages[idx];
    const steps=parsePlanSteps(msg.content||'');
    if(steps.length===0){await sendMsg('Plan diapprove. Mulai eksekusi step by step.');return;}
    chat.setLoading(true);
    const ctrl=new AbortController();abortRef.current=ctrl;
    chat.setMessages(m=>[...m,{role:'assistant',content:`🚀 Eksekusi plan — ${steps.length} step...`,actions:[]}]);
    for(let i=0;i<steps.length;i++){
      if(ctrl.signal.aborted) break;
      const step=steps[i];
      chat.setMessages(m=>[...m,{role:'assistant',content:`⚙️ **Step ${step.num}/${steps.length}:** ${step.text}`,actions:[]}]);
      try{
        const {reply,actions}=await executePlanStep(step,project.folder,callAI,ctrl.signal,chat.setStreaming);
        chat.setStreaming('');
        const writes=actions.filter(a=>a.type==='write_file');
        const cleaned=reply.replace(/```action[\s\S]*?```/g,'').trim();
        if(writes.length>0){
          chat.setMessages(m=>[...m,{role:'assistant',content:cleaned,actions:writes.map(a=>({...a,executed:false}))}]);
        } else if(cleaned){
          chat.setMessages(m=>[...m,{role:'assistant',content:cleaned,actions:[]}]);
        }
      }catch(e){
        if(e.name==='AbortError') break;
        chat.setMessages(m=>[...m,{role:'assistant',content:'❌ Step '+step.num+' error: '+e.message,actions:[]}]);
      }
    }
    chat.setLoading(false);
    chat.setMessages(m=>[...m,{role:'assistant',content:'✅ Plan selesai! ('+steps.length+' steps)',actions:[]}]);
    sendNotification('YuyuCode ✅','Plan selesai!');haptic('heavy');
  }

  async function handleApprove(idx,ok,targetPath){
    const msg=chat.messages[idx];
    const targets=targetPath==='__all__'
      ?(msg.actions||[]).filter(a=>a.type==='write_file'&&!a.executed)
      :(msg.actions||[]).filter(a=>a.type==='write_file'&&!a.executed&&(targetPath?a.path===targetPath:true));
    if(!ok){
      chat.setMessages(m=>m.map((x,i)=>i===idx?{...x,actions:x.actions?.map(a=>targets.includes(a)?{...a,executed:true,result:{ok:false,data:'Dibatalkan.'}}:a)}:x));
      return;
    }
    const backups=[];
    for(const a of targets){const backup=await callServer({type:'read',path:resolvePath(project.folder,a.path)});if(backup.ok){backups.push({path:resolvePath(project.folder,a.path),content:backup.data});a.original=backup.data;}}
    if(backups.length) file.setEditHistory(h=>[...h.slice(-(10-backups.length)),...backups]);
    const results=await Promise.all(targets.map(a=>executeAction(a,project.folder)));
    const failed=results.filter(r=>!r.ok);
    if(failed.length>0&&targets.length>1){
      await Promise.all(backups.map(b=>callServer({type:'write',path:b.path,content:b.content})));
      chat.setMessages(m=>[...m,{role:'assistant',content:'❌ Atomic write gagal ('+failed.length+' file). Rollback.'}]);
      return;
    }
    results.forEach((r,i)=>{targets[i].result=r;targets[i].executed=true;});
    chat.setMessages(m=>m.map((x,i)=>i===idx?{...x}:x));
    if(targets.length>1) chat.setMessages(m=>[...m,{role:'assistant',content:'✅ '+targets.length+' file berhasil ditulis~',actions:[]}]);
    await runHooksV2(project.hooks.postWrite, targets.map(a=>a.path).join(','), project.folder);
    if(project.permissions.exec){
      for(const wr of targets){
        const ext=(wr.path||'').split('.').pop().toLowerCase();
        let verifyCmd=null;
        const absPath=resolvePath(project.folder,wr.path);
        if(ext==='js'||ext==='cjs'||ext==='mjs') verifyCmd='node --check "'+absPath+'" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"';
        else if(ext==='json') verifyCmd='python3 -m json.tool "'+absPath+'" > /dev/null 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"';
        else if(ext==='sh') verifyCmd='bash -n "'+absPath+'" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"';
        if(!verifyCmd) continue;
        const vr=await callServer({type:'exec',path:project.folder,command:verifyCmd});
        const vOut=(vr.data||'').trim();
        if(!vOut) continue;
        if(vOut.includes('SYNTAX_ERR')||(vOut.toLowerCase().includes('error')&&!vOut.includes('SYNTAX_OK'))){
          const fname=(wr.path||'').split('/').pop();
          chat.setMessages(m=>[...m,{role:'assistant',content:'Syntax error di '+fname+':\n```\n'+vOut.slice(0,300)+'\n```',actions:[]}]);
          setTimeout(()=>sendMsg('Fix syntax error di '+wr.path+':\n```\n'+vOut.slice(0,300)+'\n```'),700);
        }
      }
    }
  }

  function undoLastEdit(){ file.undoLastEdit(msg=>chat.setMessages(m=>[...m,{role:'assistant',content:msg,actions:[]}])); }

  function cancel(){abortRef.current?.abort();chat.setLoading(false);chat.setStreaming('');}

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
      const newMems=reply.split('\n').filter(l=>l.startsWith('•')).map(l=>({id:Date.now()+Math.random(),text:l.slice(1).trim(),folder:project.folder,ts:new Date().toLocaleDateString('id')}));
      if(!newMems.length) return;
      chat.setMemories(prev=>{const merged=[...newMems,...prev].slice(0,50);Preferences.set({key:'yc_memories',value:JSON.stringify(merged)});return merged;});
    }catch{}
  }

  // ── CHECKPOINTS ──
  function saveCheckpoint(){ chat.saveCheckpoint(project.folder, project.branch, project.notes); }

  function restoreCheckpoint(cp){ chat.restoreCheckpoint(cp, project.setFolder, project.setFolderInput, n=>project.setNotes(n)); ui.setShowCheckpoints(false); }

  // ── COMPACT CONTEXT ──
  async function compactContext(){
    if(chat.messages.length<10){chat.setMessages(m=>[...m,{role:'assistant',content:'Context masih kecil~',actions:[]}]);return;}
    chat.setLoading(true);
    const ctrl=new AbortController();abortRef.current=ctrl;
    try{
      const toCompact=chat.messages.slice(1,-6);
      const summary=await askCerebrasStream([
        {role:'system',content:'Buat ringkasan singkat dari percakapan coding ini. Fokus: keputusan teknis, files diubah, bug fix, status project. Maks 300 kata.'},
        {role:'user',content:toCompact.map(m=>m.role+': '+m.content.slice(0,300)).join('\n\n')}
      ],'llama3.1-8b',()=>{},ctrl.signal);
      chat.setMessages([chat.messages[0],{role:'assistant',content:'📦 **Context dicompact** ('+toCompact.length+' pesan):\n\n'+summary},...chat.messages.slice(-6)]);
      chat.setMessages(m=>[...m,{role:'assistant',content:'✅ Context berhasil dikompres!',actions:[]}]);
    }catch(e){if(e.name!=='AbortError') chat.setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message}]);}
    chat.setLoading(false);
  }

  // ── HOOKS RUNNER ──
  async function runHooks(type, context=''){
    await runHooksV2(project.hooks[type] || [], context, project.folder);
  }

  // readFilesParallel — delegated to file store

  // trimHistory — delegated to chat store

  // ── EXPORT CHAT ──
  function exportChat(){ chat.exportChat(); }

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
  async function callAI(msgs, onChunk, signal, imageBase64) {
    const cfg = project.effortCfg;
    return askCerebrasStream(msgs, project.model, onChunk, signal, { maxTokens: cfg.maxTokens, imageBase64 });
  }

  // ── BROWSE ──
  async function browseTo(url){
    chat.setLoading(true);chat.setMessages(m=>[...m,{role:'user',content:'Browse: '+url}]);
    const r=await callServer({type:'browse',url});
    if(!r.ok) chat.setMessages(m=>[...m,{role:'assistant',content:'❌ Browse gagal: '+r.data,actions:[]}]);
    else{chat.setMessages(m=>[...m,{role:'assistant',content:'🌐 **'+url+'**\n\n```\n'+(r.data||'').slice(0,3000)+'\n```',actions:[]}]);setTimeout(()=>sendMsg('Analisis konten halaman ini.'),300);}
    chat.setLoading(false);
  }

  // ── AGENT SWARM ──
  async function runAgentSwarm(task){
    chat.setSwarmRunning(true);chat.setSwarmLog([]);
    const log=msg=>chat.setSwarmLog(prev=>[...prev,msg]);
    const ctrl=new AbortController();abortRef.current=ctrl;
    try{
      log('🏗 Architect planning...');
      const archReply=await callAI([
        {role:'system',content:'Software Architect. Buat rencana implementasi singkat dan konkret. Max 5 poin.'},
        {role:'user',content:'Task: '+task+'\nFolder: '+project.folder}
      ],()=>{},ctrl.signal);
      log('⚛ Frontend Agent...');
      const feReply=await callAI([
        {role:'system',content:'Frontend Engineer. Implementasikan UI/React. Gunakan write_file action dengan path lengkap dimulai dari '+project.folder+'.'},
        {role:'user',content:'Plan:\n'+archReply+'\n\nTask: '+task}
      ],()=>{},ctrl.signal);
      log('⚙ Backend Agent...');
      const beReply=await callAI([
        {role:'system',content:'Backend Engineer. Implementasikan server/API/logic. Gunakan write_file action dengan path lengkap dimulai dari '+project.folder+'.'},
        {role:'user',content:'Plan:\n'+archReply+'\n\nTask: '+task}
      ],()=>{},ctrl.signal);
      log('🧪 QA Review...');
      const qaReply=await callAI([
        {role:'system',content:'QA Engineer. Review kode dari FE dan BE. List bug kritis dengan format "BUG: [FE|BE] <deskripsi>" satu per baris. Kalau tidak ada bug, tulis "NO_BUGS".'},
        {role:'user',content:'FE:\n'+feReply+'\n\nBE:\n'+beReply}
      ],()=>{},ctrl.signal);

      // QA fix pass jika ada bug
      let fixedFeReply=feReply, fixedBeReply=beReply;
      const qaBugs=qaReply.split('\n').filter(l=>l.startsWith('BUG:'));
      if(qaBugs.length>0&&!ctrl.signal.aborted){
        log('🔧 QA found '+qaBugs.length+' bug(s), running fix pass...');
        const feBugs=qaBugs.filter(l=>l.includes('[FE]')).join('\n');
        const beBugs=qaBugs.filter(l=>l.includes('[BE]')).join('\n');
        if(feBugs){
          fixedFeReply=await callAI([
            {role:'system',content:'Frontend Engineer. Fix bugs berikut di kode yang sudah ada. Gunakan write_file untuk output. Path dimulai dari '+project.folder+'.'},
            {role:'user',content:'Kode FE:\n'+feReply.slice(0,2000)+'\n\nBug yang harus difix:\n'+feBugs}
          ],()=>{},ctrl.signal);
        }
        if(beBugs){
          fixedBeReply=await callAI([
            {role:'system',content:'Backend Engineer. Fix bugs berikut. Gunakan write_file untuk output. Path dimulai dari '+project.folder+'.'},
            {role:'user',content:'Kode BE:\n'+beReply.slice(0,2000)+'\n\nBug yang harus difix:\n'+beBugs}
          ],()=>{},ctrl.signal);
        }
      }

      // Deduplikasi: BE menang jika ada path yang sama
      const feWrites=parseActions(fixedFeReply).filter(a=>a.type==='write_file');
      const beWrites=parseActions(fixedBeReply).filter(a=>a.type==='write_file');
      const bePaths=new Set(beWrites.map(a=>a.path));
      const dedupedWrites=[...feWrites.filter(a=>!bePaths.has(a.path)),...beWrites];

      log('👀 '+dedupedWrites.length+' file siap — menunggu approval...');
      // Kirim ke approval flow, bukan langsung tulis
      chat.setMessages(m=>[...m,{role:'assistant',content:
        `🐝 **Swarm selesai!** (${dedupedWrites.length} file)${qaBugs.length>0?' — QA fixed '+qaBugs.length+' bug(s)':' — QA clean ✅'}\n\n**Plan:**\n${archReply.slice(0,400)}\n\n**QA Notes:**\n${qaReply.slice(0,300)}\n\nTinjau dan approve file di bawah~`,
        actions:dedupedWrites.map(a=>({...a,executed:false}))}]);
      sendNotification('YuyuCode 🐝','Swarm siap! '+dedupedWrites.length+' file menunggu approval.');haptic('heavy');
    }catch(e){if(e.name!=='AbortError') log('❌ '+e.message);}
    chat.setSwarmRunning(false);
  }

  // ── VISION / DROP ──
  function handleImageAttach(e){
    const file=e.target.files?.[0];if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{chat.setVisionImage(ev.target.result.split(',')[1]);haptic('light');};
    reader.readAsDataURL(file);
  }

  function handleDrop(e){
    e.preventDefault();ui.setDragOver(false);
    const file=e.dataTransfer.files?.[0];if(!file) return;
    if(file.type.startsWith('image/')){const reader=new FileReader();reader.onload=ev=>{chat.setVisionImage(ev.target.result.split(',')[1]);haptic('light');};reader.readAsDataURL(file);}
    else{const reader=new FileReader();reader.onload=ev=>{chat.setInput(i=>i+'\n```\n'+ev.target.result.slice(0,3000)+'\n```');};reader.readAsText(file);}
  }

  // ── GITHUB ──
  async function fetchGitHub(action){
    if(!project.githubRepo) return;
    const[owner,repo]=project.githubRepo.split('/');
    chat.setLoading(true);
    const r=await callServer({type:'mcp',tool:'github',action,params:{owner,repo,token:project.githubToken}});
    try{project.setGithubData({action,data:JSON.parse(r.data)});}catch{project.setGithubData({action,data:r.data});}
    chat.setLoading(false);
  }

  // ── DEPLOY ──
  async function runDeploy(platform){
    ui.setDeployLog('🚀 Deploying to '+platform+'...\n');chat.setLoading(true);
    const cmds={vercel:'vercel --prod --yes 2>&1',netlify:'netlify deploy --prod 2>&1',github:'git add -A && git commit -m "deploy: '+new Date().toLocaleDateString('id')+'" && git push',railway:'railway up 2>&1'};
    const r=await callServer({type:'exec',path:project.folder,command:cmds[platform]||'echo "Platform tidak dikenal"'});
    ui.setDeployLog(r.data||'selesai');chat.setLoading(false);
    sendNotification('YuyuCode 🚀','Deploy '+platform+' selesai!');haptic('heavy');
  }

  // ── COMMIT MSG ──
  async function generateCommitMsg(){
    chat.setLoading(true);
    const diff=await callServer({type:'exec',path:project.folder,command:'git diff HEAD'});
    if(!diff.ok||!diff.data.trim()){chat.setMessages(m=>[...m,{role:'assistant',content:'Tidak ada perubahan~',actions:[]}]);chat.setLoading(false);return;}
    const ctrl=new AbortController();abortRef.current=ctrl;
    try{
      const reply=await callAI([{role:'system',content:'Generate satu baris commit message format "tipe: deskripsi". Hanya commit message, tanpa penjelasan.'},{role:'user',content:diff.data.slice(0,3000)}],chat.setStreaming,ctrl.signal);
      chat.setStreaming('');
      const msg=reply.trim().replace(/^[\"'`]|[\"'`]$/g,'');
      chat.setMessages(m=>[...m,{role:'assistant',content:'💬 Commit message:\n```\n'+msg+'\n```\n```action\n{"type":"exec","command":"git add -A && git commit -m \\"'+msg.replace(/"/g,'\\"')+'\\" && git push"}\n```',actions:[]}]);
    }catch(e){if(e.name!=='AbortError') chat.setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message}]);}
    chat.setLoading(false);
  }

  // ── TEST RUNNER ──
  async function runTests(){
    chat.setLoading(true);chat.setMessages(m=>[...m,{role:'user',content:'Jalankan test & lint'}]);
    const lint=await callServer({type:'exec',path:project.folder,command:'npm run lint 2>&1 || echo "no lint script"'});
    const test=await callServer({type:'exec',path:project.folder,command:'npm test -- --watchAll=false 2>&1 || echo "no test script"'});
    const combined='=== LINT ===\n'+(lint.data||'ok')+'\n\n=== TEST ===\n'+(test.data||'ok');
    chat.setMessages(m=>[...m,{role:'assistant',content:'```bash\n'+combined+'\n```',actions:[]}]);
    if(combined.toLowerCase().includes('error')||combined.includes('FAIL')) setTimeout(()=>sendMsg('Ada error di test/lint:\n'+combined.slice(0,600)+'\nDiagnosa dan fix.'),300);
    chat.setLoading(false);
  }

  // ── SLASH COMMANDS ──
  const {handleSlashCommand}=useSlashCommands({
    model:project.model, folder:project.folder, branch:project.branch,
    messages:chat.messages, selectedFile:file.selectedFile, fileContent:file.fileContent,
    notes:project.notes, memories:chat.memories, checkpoints:chat.checkpoints,
    skills:project.skills, thinkingEnabled:project.thinkingEnabled, effort:project.effort,
    loopActive:project.loopActive, loopIntervalRef:project.loopIntervalRef,
    agentMemory:project.agentMemory, splitView:file.splitView,
    pushToTalk:project.pushToTalk, sessionName:project.sessionName,
    sessionColor:project.sessionColor, fileWatcherActive:project.fileWatcherActive,
    fileWatcherInterval:project.fileWatcherInterval,
    setModel:project.setModel, setMessages:chat.setMessages, setFolder:project.setFolder,
    setFolderInput:project.setFolderInput, setLoading:chat.setLoading, setStreaming:chat.setStreaming,
    setThinkingEnabled:project.setThinkingEnabled, setEffort:project.setEffort,
    setLoopActive:project.setLoopActive, setLoopIntervalRef:project.setLoopIntervalRef,
    setSplitView:file.setSplitView, setPushToTalk:project.setPushToTalk,
    setSessionName:project.setSessionName, setSessionColor:project.setSessionColor,
    setSkills:project.setSkills, setFileWatcherActive:project.setFileWatcherActive,
    setFileWatcherInterval:project.setFileWatcherInterval, setFileSnapshots:project.setFileSnapshots,
    setPlanSteps:chat.setPlanSteps, setPlanTask:chat.setPlanTask,
    setAgentMemory:project.setAgentMemory, setSessionList:ui.setSessionList,
    setShowCheckpoints:ui.setShowCheckpoints, setShowMemory:ui.setShowMemory,
    setShowMCP:ui.setShowMCP, setShowGitHub:ui.setShowGitHub, setShowDeploy:ui.setShowDeploy,
    setShowSessions:ui.setShowSessions, setShowPermissions:ui.setShowPermissions,
    setShowPlugins:ui.setShowPlugins, setShowConfig:ui.setShowConfig,
    setShowCustomActions:ui.setShowCustomActions, setShowFileHistory:ui.setShowFileHistory,
    setShowThemeBuilder:ui.setShowThemeBuilder, setShowDiff:ui.setShowDiff,
    setShowSearch:ui.setShowSearch, setShowSnippets:ui.setShowSnippets,
    setShowDepGraph:ui.setShowDepGraph, setDepGraph:ui.setDepGraph, setFontSize:ui.setFontSize,
    setShowMergeConflict:ui.setShowMergeConflict, setMergeConflictData:ui.setMergeConflictData,
    sendMsg, compactContext, saveCheckpoint, exportChat, generateCommitMsg,
    runTests, browseTo, runAgentSwarm, callAI, addHistory, runHooks:project.runHooks,
    sendNotification, haptic, abortRef,
  });

  // ── SEND MESSAGE ──
  async function sendMsg(override){
    const txt=(override||chat.input).trim();
    if(!txt||chat.loading) return;
    if(txt.startsWith('/')){chat.setInput('');chat.setSlashSuggestions([]);await handleSlashCommand(txt);return;}
    chat.setInput('');project.setHistIdx(-1);addHistory(txt);
    chat.setShowFollowUp(false);file.setActiveTab('chat');chat.setSlashSuggestions([]);
    chat.setVisionImage(null);haptic('light');
    const userMsg={role:'user',content:txt};
    const history=[...chat.messages,{role:'user',content:txt}];
    chat.setMessages(history);chat.setLoading(true);chat.setStreaming('');
    const ctrl=new AbortController();abortRef.current=ctrl;

    // ── AUTO-COMPACT: trigger at 80k chars to prevent context overflow ──
    const AUTO_COMPACT_THRESHOLD = 80000;
    const totalChars = history.reduce((a,m)=>a+(m.content?.length||0),0);
    if (totalChars > AUTO_COMPACT_THRESHOLD && history.length > 12) {
      chat.setMessages(m=>[...m,{role:'assistant',content:'📦 Auto-compact — context terlalu besar (~'+Math.round(totalChars/1000)+'K chars). Mengkompress...',actions:[]}]);
      await compactContext();
    }

    try{
      const cfg = project.effortCfg;
      const notesCtx=project.notes?'\n\nProject notes:\n'+project.notes:'';
      const skillCtx=project.skill?'\n\nSKILL.md:\n'+project.skill:'';
      const pinnedCtx=file.pinnedFiles.length?'\n\nPinned files: '+file.pinnedFiles.join(', '):'';
      const fileCtx=file.selectedFile&&file.fileContent?'\n\nFile terbuka: '+file.selectedFile+'\n```\n'+file.fileContent.slice(0,1500)+'\n```':'';
      // Memory retrieval: TF-IDF ranking by relevance to current message
      const memPool = tfidfRank(chat.memories, txt, 5);
      const memCtx=memPool.length?'\n\nMemories:\n'+memPool.map(m=>'• '+m.text).join('\n'):'';
      const visionCtx=chat.visionImage?'\n\n[Gambar dilampirkan]':'';
      const agentMemCtx=['user','project','local'].map(s=>(project.agentMemory[s]||[]).length?'\n\n['+s+' memory]:\n'+(project.agentMemory[s]||[]).map(mx=>'• '+mx.text).join('\n'):'').join('');
      const thinkInstruction=project.thinkingEnabled?'\n\nSebelum respons, tulis reasoning singkat dalam <think>...</think>. Singkat, max 2 kalimat.':'';
      const systemPrompt=BASE_SYSTEM+cfg.systemSuffix+thinkInstruction+'\n\nFolder aktif: '+project.folder+'\nBranch: '+project.branch+notesCtx+skillCtx+pinnedCtx+fileCtx+memCtx+agentMemCtx+visionCtx;

      // Reset autoContext setiap pesan baru — cegah context stale dari percakapan lama
      autoContextRef.current = {};
      if(file.pinnedFiles.length){
        const loaded=await file.readFilesParallel(file.pinnedFiles.slice(0,3), project.folder);
        Object.entries(loaded).forEach(([p,r])=>{if(r.ok) autoContextRef.current[p]=r.data;});
      }

      const MAX_ITER = project.effortCfg.maxIter || 10;
      let iter=0,allMessages=[...history],finalContent='',finalActions=[];
      let autoContext={...(autoContextRef.current||{})};

      while(iter<MAX_ITER){
        iter++;
        if(iter>1) chat.setAgentRunning(true);
        const DECISION_HINT=iter===1?'\n[ATURAN: Jawab langsung jika bisa dari context. DILARANG tanya balik. Kalau butuh file, baca sendiri pakai read_file.]':'';
        const groqMsgs=[
          {role:'system',content:systemPrompt+DECISION_HINT+(Object.keys(autoContext).length?'\n\nAuto-loaded context:\n'+Object.entries(autoContext).map(([p,c])=>'=== '+p+' ===\n'+c.slice(0,800)).join('\n\n'):'')},
          ...chat.trimHistory(allMessages).map(m=>({role:m.role,content:m.content.replace(/```action[\s\S]*?```/g,'').replace(/PROJECT_NOTE:.*?\n/g,'').trim()}))
        ];
        let reply=await callAI(groqMsgs,chat.setStreaming,ctrl.signal,iter===1?chat.visionImage:null);
        chat.setStreaming('');
        // track tokens per request
        const inTk = Math.round(groqMsgs.reduce((a,m)=>a+(m.content?.length||0),0)/4);
        const outTk = Math.round(reply.length/4);
        tokenTracker.record(inTk, outTk, project.model);

        const allActs=parseActions(reply);
        const writes=allActs.filter(a=>a.type==='write_file');
        const nonWrites=allActs.filter(a=>a.type!=='write_file');
        const readActions=nonWrites.filter(a=>a.type==='read_file');
        const webSearchActions=nonWrites.filter(a=>a.type==='web_search');
        const otherActions=nonWrites.filter(a=>a.type!=='read_file'&&a.type!=='web_search');

        if(readActions.length>1){
          await runHooksV2(project.hooks.preToolCall, 'read_file:batch', project.folder);
          const res=await Promise.all(readActions.map(a=>executeAction(a,project.folder)));readActions.forEach((a,i)=>{a.result=res[i];});
          await runHooksV2(project.hooks.postToolCall, 'read_file:batch', project.folder);
        }
        else{
          for(const a of readActions){
            await runHooksV2(project.hooks.preToolCall, 'read_file:'+a.path, project.folder);
            a.result=await executeAction(a,project.folder);
            await runHooksV2(project.hooks.postToolCall, 'read_file:'+a.path, project.folder);
          }
        }
        // web_search runs in parallel
        if(webSearchActions.length>0){
          await runHooksV2(project.hooks.preToolCall, 'web_search:batch', project.folder);
          const res=await Promise.all(webSearchActions.map(a=>executeAction(a,project.folder)));webSearchActions.forEach((a,i)=>{a.result=res[i];});
          await runHooksV2(project.hooks.postToolCall, 'web_search:batch', project.folder);
        }
        // permission check sebelum exec/mcp/browse
        for(const a of otherActions){
          if(!checkPermission(project.permissions, a.type)){
            a.result={ok:false,data:'⛔ Permission ditolak untuk action: '+a.type+'. Aktifkan di /permissions.'};
          } else {
            await runHooksV2(project.hooks.preToolCall, a.type+':'+(a.path||a.command||''), project.folder);
            a.result=await executeAction(a,project.folder);
            await runHooksV2(project.hooks.postToolCall, a.type+':'+(a.path||a.command||''), project.folder);
          }
        }

        // auto-load imports
        for(const a of readActions){
          if(a.result?.ok&&a.path){
            const content=a.result.data||'';
            const importRegex=/(?:import|require)\s+.*?['"](.+?)['"]/g;let im;
            while((im=importRegex.exec(content))!==null){
              const imp=im[1];if(!imp.startsWith('.')) continue;
              const base=a.path.split('/').slice(0,-1).join('/');
              const candidates=[imp,imp+'.jsx',imp+'.js',imp+'.ts',imp+'.tsx'].map(s=>base+'/'+s.replace('./','/').replace('//','/'));
              for(const cand of candidates){if(autoContext[cand]) continue;const r=await callServer({type:'read',path:resolvePath(project.folder,cand)});if(r.ok){autoContext[cand]=r.data;break;}}
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
        if(writes.length>0){await runHooksV2(project.hooks.preWrite, writes.map(a=>a.path).join(','), project.folder);finalContent=reply;finalActions=[...allNonWrites,...writes.map(a=>({...a,executed:false}))];break;}
        const agentNote=iter<MAX_ITER?'':'\n\n(Iterasi terakhir, berikan jawaban final.)';
        allMessages=[...allMessages,{role:'assistant',content:reply.replace(/```action[\s\S]*?```/g,'').trim()},{role:'user',content:'Hasil aksi:\n'+combinedData+'\n\nLanjutkan.'+agentNote}];
      }

      chat.setAgentRunning(false);
      if(iter>1) sendNotification('YuyuCode ✅','Agent selesai! '+txt.slice(0,40));
      if(finalContent.trim().endsWith('CONTINUE')){setTimeout(()=>sendMsg('Lanjutkan dari titik terakhir.'),300);return;}
      if(finalContent.includes('PROJECT_NOTE:')){const nm=finalContent.match(/PROJECT_NOTE:(.*?)(?:\n|$)/);if(nm){const n=(project.notes+'\n'+nm[1].trim()).trim();project.setNotes(n, project.folder);}}
      chat.setMessages(m=>[...m,{role:'assistant',content:finalContent,actions:finalActions}]);
      // ── Elicitation: AI requested structured input ──
      const elicit=parseElicitation(finalContent);
      if(elicit) ui.setElicitationData(elicit);
      chat.extractMemories(txt,finalContent,project.folder);
      if(chat.ttsEnabled&&finalContent) speakText(finalContent);
    }catch(e){
      chat.setAgentRunning(false);
      if(e.name!=='AbortError'){
        await runHooksV2(project.hooks.onError, e.message, project.folder).catch(()=>{});
        if(e.message.startsWith('RATE_LIMIT:')){ 
          const secs=parseInt(e.message.split(':')[1]);
          chat.startRateLimitTimer(secs);
          chat.setMessages(m=>[...m,{role:'assistant',content:'⏳ Rate limit — tunggu '+secs+' detik ya Papa~'}]);
        }else if(!navigator.onLine){
          chat.setMessages(m=>[...m,{role:'assistant',content:'📡 Internet terputus~'}]);
        }else{
          chat.setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message}]);
        }
      }
    }
    chat.setLoading(false);
  }

  async function continueMsg(){await sendMsg('Lanjutkan response sebelumnya dari titik terakhir.');}
  async function retryLast(){
    const lastUser=[...chat.messages].reverse().find(m=>m.role==='user');
    if(!lastUser) return;
    chat.setMessages(m=>{const idx=m.indexOf(lastUser);return m.slice(0,idx);});
    await sendMsg(lastUser.content);
  }

  async function runShortcut(cmd){
    addHistory(cmd);chat.setShowFollowUp(false);file.setActiveTab('chat');
    chat.setMessages(m=>[...m,{role:'user',content:cmd}]);chat.setLoading(true);
    const r=await executeAction({type:'exec',command:cmd},project.folder);
    const output=r.data||'selesai';
    chat.setMessages(m=>[...m,{role:'assistant',content:'```bash\n'+output+'\n```',actions:[]}]);
    chat.setLoading(false);
    if((output.toLowerCase().includes('error')||output.includes('❌'))&&!cmd.includes('git')) setTimeout(()=>sendMsg('Ada error di terminal:\n'+output.slice(0,300)+'\nDiagnosa dan fix.'),500);
  }

  function onSidebarDragStart(e){
    ui.setDragging(true);
    const startX=e.touches?e.touches[0].clientX:e.clientX,startW=ui.sidebarWidth;
    function onMove(ev){const x=ev.touches?ev.touches[0].clientX:ev.clientX;ui.setSidebarWidth(Math.max(120,Math.min(300,startW+(x-startX))));}
    function onEnd(){ui.setDragging(false);Preferences.set({key:'yc_sidebar_w',value:String(ui.sidebarWidth)});window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onEnd);window.removeEventListener('touchmove',onMove);window.removeEventListener('touchend',onEnd);}
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onEnd);window.addEventListener('touchmove',onMove,{passive:true});window.addEventListener('touchend',onEnd);
  }

  const tokens=countTokens(chat.messages);
  const VIRTUAL_LIMIT=60;
  const visibleMessages=chat.messages.length>VIRTUAL_LIMIT?[{role:'assistant',content:`[... ${chat.messages.length-VIRTUAL_LIMIT} pesan tersembunyi. /clear untuk bersihkan]`},...chat.messages.slice(-VIRTUAL_LIMIT)]:chat.messages;

  // ── RENDER ──
  return (
    <div style={{position:'fixed',inset:0,background:T.bg,color:T.text,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',display:'flex',flexDirection:'column',fontSize:ui.fontSize+'px'}}
      onDragOver={e=>{e.preventDefault();ui.setDragOver(true);}} onDragLeave={()=>ui.setDragOver(false)} onDrop={handleDrop}>
      {ui.dragOver&&<div style={{position:'absolute',inset:0,background:'rgba(124,58,237,.15)',border:'2px dashed rgba(124,58,237,.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}><span style={{fontSize:'18px',color:'#a78bfa'}}>Drop file di sini~</span></div>}
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}textarea,input{scrollbar-width:none;}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}button{transition:color .15s,background .15s,opacity .15s;}button:active{opacity:.6!important;}.msg-appear{animation:fadeIn .18s ease forwards;}`}</style>

      {project.sessionColor&&<div style={{height:'2px',background:project.sessionColor,flexShrink:0}}/>}

      {/* HEADER */}
      {/* ── HEADER ── */}
      <div style={{flexShrink:0,background:T.bg,borderBottom:'1px solid '+T.border}}>
        {/* Main row */}
        <div style={{height:'50px',padding:'0 10px',display:'flex',alignItems:'center',gap:'8px'}}>
          <button onClick={()=>ui.setShowSidebar(!ui.showSidebar)} style={{background:'none',border:'none',color:ui.showSidebar?T.accent:'rgba(255,255,255,.3)',fontSize:'18px',cursor:'pointer',padding:'6px',borderRadius:'8px',lineHeight:1,minWidth:'36px',minHeight:'36px',display:'flex',alignItems:'center',justifyContent:'center'}}>☰</button>
          <div style={{flex:1,cursor:'pointer',minWidth:0,overflow:'hidden'}} onClick={()=>ui.setShowFolder(!ui.showFolder)}>
            <div style={{fontSize:'14px',fontWeight:'700',color:T.text,letterSpacing:'-0.3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              YuyuCode
              <span style={{fontSize:'11px',fontWeight:'400',color:'rgba(255,255,255,.3)',marginLeft:'8px'}}>{project.folder?.split('/').pop()}</span>
            </div>
          </div>
          <button onClick={()=>ui.setShowPalette(true)} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',borderRadius:'10px',padding:'7px 12px',color:'rgba(255,255,255,.5)',fontSize:'13px',cursor:'pointer',minWidth:'40px',minHeight:'38px',display:'flex',alignItems:'center',justifyContent:'center'}}>⌘</button>
          <button onClick={()=>{chat.setMessages([{role:'assistant',content:'Chat baru. Mau ngerjain apa Papa? 🌸'}]);Preferences.remove({key:'yc_history'});chat.setShowFollowUp(false);haptic('light');}}
            style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'10px',padding:'7px 12px',color:'rgba(255,255,255,.35)',fontSize:'12px',cursor:'pointer',minHeight:'38px'}}>new</button>
        </div>
        {/* Status subrow */}
        <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'0 12px 6px',overflowX:'auto'}}>
          <div style={{width:'6px',height:'6px',borderRadius:'50%',background:project.serverOk?'#4ade80':'#f87171',flexShrink:0}}/>
          <button onClick={()=>{const i=MODELS.findIndex(m=>m.id===project.model);const next=MODELS[(i+1)%MODELS.length];project.setModel(next.id);Preferences.set({key:'yc_model',value:next.id});}}
            style={{background:'none',border:'none',padding:0,color:'rgba(255,255,255,.35)',fontSize:'10px',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,fontFamily:'monospace'}}>
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
  </BottomSheet>
      )}

      <UndoBar history={file.editHistory} onUndo={undoLastEdit}/>

      {/* STATUS BANNERS */}
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
                  <div key={f} onClick={()=>openFile(f)} style={{fontSize:'11px',color:'rgba(255,255,255,.4)',padding:'2px 4px',cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',borderRadius:'3px'}}
                    onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.4)'}>
                    {f.split('/').pop()}
                  </div>
                ))}
              </div>
            )}
            <div style={{flex:1,overflow:'hidden'}}>
              <FileTree folder={project.folder} onSelectFile={openFile} selectedFile={file.selectedFile}/>
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
                  onApprove={m.actions?.some(a=>a.type==='write_file'&&!a.executed)?(ok,path)=>handleApprove(i,ok,path):null}
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
                <button onClick={()=>togglePin(file.selectedFile)} style={{background:file.pinnedFiles.includes(file.selectedFile)?'rgba(99,102,241,.15)':'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'5px',padding:'2px 6px',color:file.pinnedFiles.includes(file.selectedFile)?'#818cf8':'rgba(255,255,255,.3)',fontSize:'10px',cursor:'pointer',flexShrink:0}}>📌</button>
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
                    <FileEditor path={file.selectedFile} content={file.fileContent||''} onSave={saveFile} onClose={()=>file.setEditMode(false)}/>
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
                <FileEditor path={file.selectedFile} content={file.fileContent||''} onSave={saveFile} onClose={()=>file.setEditMode(false)}/>
              )}
            </div>
          )}

          {/* TERMINAL */}
          {ui.showTerminal&&<div style={{flex:1,overflow:'hidden'}}><Terminal folder={project.folder} cmdHistory={project.cmdHistory} addHistory={addHistory} onSendToAI={txt=>{ui.setShowTerminal(false);file.setActiveTab('chat');sendMsg(txt);}}/></div>}

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
                  onClick={()=>{
                    // Push shortcut: tampilkan modal input commit message
                    if(s.cmd.includes('yugit.cjs')){
                      ui.setCommitMsg('');
                      ui.setCommitModal(true);
                    } else {
                      runShortcut(s.cmd);
                    }
                  }}
                  style={{background:'none',border:'none',padding:'4px 8px',color:'rgba(255,255,255,.3)',fontSize:'10px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace',borderRadius:'5px',display:'flex',alignItems:'center',gap:'3px'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                  <span style={{opacity:.6}}>{s.icon}</span><span>{s.label}</span>
                </button>
              ))}
              <div style={{flex:1}}/>
              {file.pinnedFiles.map(f=>(
                <button key={f} onClick={()=>openFile(f)} style={{background:'rgba(99,102,241,.08)',border:'none',borderRadius:'4px',padding:'2px 7px',color:'rgba(99,102,241,.6)',fontSize:'9px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace'}}>{f.split('/').pop()}</button>
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
                  ?<button onClick={cancel} style={{background:'rgba(248,113,113,.1)',border:'none',borderRadius:'10px',padding:'9px 14px',color:'#f87171',fontSize:'14px',cursor:'pointer',flexShrink:0}}>■</button>
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
      {ui.showSearch&&<SearchBar folder={project.folder} onSelectFile={openFile} onClose={()=>ui.setShowSearch(false)}/>}
      {ui.showShortcuts&&<ShortcutsPanel onClose={()=>ui.setShowShortcuts(false)}/>}
      {ui.showDiff&&<GitDiffPanel folder={project.folder} onClose={()=>ui.setShowDiff(false)}/>}
      {ui.showBlame&&file.selectedFile&&<GitBlamePanel folder={project.folder} filePath={file.selectedFile} onClose={()=>ui.setShowBlame(false)}/>}
      {ui.showSnippets&&<SnippetLibrary onInsert={code=>{chat.setInput(i=>i?i+'\n'+code:code);ui.setShowSnippets(false);inputRef.current?.focus();}} onClose={()=>ui.setShowSnippets(false)}/>}
      {ui.showFileHistory&&file.selectedFile&&<FileHistoryPanel folder={project.folder} filePath={file.selectedFile} onClose={()=>ui.setShowFileHistory(false)}/>}
      {ui.showCustomActions&&<CustomActionsPanel folder={project.folder} onRun={cmd=>runShortcut(cmd)} onClose={()=>ui.setShowCustomActions(false)}/>}

      {ui.showPalette&&(
        <CommandPalette onClose={()=>ui.setShowPalette(false)}
          folder={project.folder} memories={chat.memories} checkpoints={chat.checkpoints} model={project.model} models={MODELS}
          onModelChange={id=>{project.setModel(id);Preferences.set({key:'yc_model',value:id});}}
          onNewChat={()=>{chat.setMessages([{role:'assistant',content:'Chat baru. Mau ngerjain apa Papa? 🌸'}]);Preferences.remove({key:'yc_history'});chat.setShowFollowUp(false);}}
          theme={ui.theme} onThemeChange={t=>ui.setTheme(t)}
          showSidebar={ui.showSidebar} onToggleSidebar={()=>ui.setShowSidebar(s=>!s)}
          onShowMemory={()=>ui.setShowMemory(true)} onShowCheckpoints={()=>ui.setShowCheckpoints(true)}
          onShowMCP={()=>ui.setShowMCP(true)} onShowGitHub={()=>ui.setShowGitHub(true)} onShowDeploy={()=>ui.setShowDeploy(true)}
          onShowSessions={()=>{loadSessions().then(s=>{ui.setSessionList(s);ui.setShowSessions(true);});}}
          onShowPermissions={()=>ui.setShowPermissions(true)} onShowPlugins={()=>ui.setShowPlugins(true)} onShowConfig={()=>ui.setShowConfig(true)}
          onShowDiff={()=>ui.setShowDiff(true)} onShowSearch={()=>ui.setShowSearch(true)}
          onShowSnippets={()=>ui.setShowSnippets(true)} onShowCustomActions={()=>ui.setShowCustomActions(true)}
          runTests={runTests} generateCommitMsg={generateCommitMsg} exportChat={exportChat} compactContext={compactContext}
        />
      )}

      {/* MEMORY */}
      {ui.showMemory&&(
        <BottomSheet onClose={()=>ui.setShowMemory(false)}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🧠 Auto Memories ({chat.memories.length})</span>
            <button onClick={()=>{chat.setMemories([]);Preferences.remove({key:'yc_memories'});}} style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'5px',padding:'2px 8px',color:'#f87171',fontSize:'10px',cursor:'pointer',marginRight:'8px'}}>clear all</button>
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
                <button onClick={()=>{const next=chat.memories.filter(x=>x.id!==m.id);chat.setMemories(next);Preferences.set({key:'yc_memories',value:JSON.stringify(next)});}} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer',flexShrink:0}}>×</button>
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
                <button onClick={()=>{const next=chat.checkpoints.filter(x=>x.id!==cp.id);chat.setCheckpoints(next);Preferences.set({key:'yc_checkpoints',value:JSON.stringify(next)});}} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer'}}>×</button>
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
  </BottomSheet>
      )}

      {/* DEP GRAPH — d3 force layout */}
      {ui.showDepGraph&&ui.depGraph&&(
        <DepGraphPanel depGraph={ui.depGraph} onClose={()=>ui.setShowDepGraph(false)}/>
      )}

      {/* ELICITATION — AI-requested dynamic form */}
      {ui.elicitationData&&(
        <ElicitationPanel
          data={ui.elicitationData}
          onSubmit={(result)=>{
            ui.setElicitationData(null);
            sendMsg(result);
          }}
          onDismiss={()=>ui.setElicitationData(null)}
        />
      )}

      {/* MERGE CONFLICT */}
      {ui.showMergeConflict&&ui.mergeConflictData&&(
        <MergeConflictPanel
          data={ui.mergeConflictData}
          folder={project.folder}
          onResolved={(strategy)=>{
            ui.setShowMergeConflict(false);
            ui.setMergeConflictData(null);
            chat.setMessages(m=>[...m,{role:'assistant',content:'✅ Konflik resolved via **'+strategy+'**. Branch berhasil di-merge.',actions:[]}]);
          }}
          onAborted={()=>{
            ui.setShowMergeConflict(false);
            ui.setMergeConflictData(null);
            chat.setMessages(m=>[...m,{role:'assistant',content:'↩ Merge dibatalkan. Branch agent tetap tersedia.',actions:[]}]);
          }}
          onClose={()=>ui.setShowMergeConflict(false)}
        />
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
  </BottomSheet>
      )}

      {/* MCP */}
      {ui.showMCP&&(
        <BottomSheet onClose={()=>ui.setShowMCP(false)}>
          <div style={{padding:'0 16px 8px',flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🔌 MCP Tools</span>
            <button onClick={()=>ui.setShowMCP(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          {['git','fetch','sqlite','github','system','filesystem'].map(tool=>(
            <div key={tool} style={{padding:'10px 12px',marginBottom:'6px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(74,222,128,.1)',borderRadius:'8px'}}>
              <span style={{fontSize:'13px',color:'#4ade80',fontFamily:'monospace',fontWeight:'600'}}>{tool}</span>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'6px'}}>
                {(tool==='git'?['status','log','diff']:tool==='fetch'?['browse']:tool==='sqlite'?['tables']:tool==='github'?['issues','pulls']:tool==='system'?['disk','memory']:['list']).map(act=>(
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
            <input value={project.githubToken} onChange={e=>{project.setGithubToken(e.target.value);Preferences.set({key:'yc_gh_token',value:e.target.value});}} placeholder="GitHub token" type="password" style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'7px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
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
                <div onClick={()=>{const next={...project.permissions,[tool]:!allowed};project.setPermissions(next);Preferences.set({key:'yc_permissions',value:JSON.stringify(next)});}} style={{width:'42px',height:'24px',borderRadius:'12px',background:allowed?'#7c3aed':'rgba(255,255,255,.1)',cursor:'pointer',position:'relative',transition:'all .2s',flexShrink:0}}>
                  <div style={{position:'absolute',top:'3px',left:allowed?'21px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'white',transition:'all .2s'}}/>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>{const reset={read_file:true,write_file:false,exec:false,list_files:true,search:true,mcp:false,delete_file:false,browse:false};project.setPermissions(reset);Preferences.set({key:'yc_permissions',value:JSON.stringify(reset)});}} style={{marginTop:'12px',background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'8px',padding:'8px',color:'#f87171',fontSize:'12px',cursor:'pointer'}}>Reset ke Default</button>
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
            {id:'auto_commit',   name:'Auto Commit',    desc:'Commit otomatis setelah write_file', hookType:'postWrite', cmd:'cd {{context}} && git add -A && git commit -m "auto: yuyu save $(date +%H:%M)"'},
            {id:'lint_on_save',  name:'Lint on Save',   desc:'ESLint check setiap sebelum save',   hookType:'preWrite',  cmd:'cd {{context}} && npx eslint src --max-warnings 0 2>&1 | tail -5'},
            {id:'test_runner',   name:'Test Runner',    desc:'Jalankan tests setelah write',        hookType:'postWrite', cmd:'cd {{context}} && npm test -- --watchAll=false --passWithNoTests 2>&1 | tail -10'},
            {id:'auto_push',    name:'Git Auto Push',  desc:'Push ke remote setelah commit',       hookType:'postWrite', cmd:'node ~/yugit.cjs "auto push"'},
          ].map(p=>{
            const isActive=!!project.activePlugins[p.id];
            function togglePlugin(){
              const newActive={...project.activePlugins,[p.id]:!isActive};
              project.setActivePlugins(newActive);
              Preferences.set({key:'yc_plugins',value:JSON.stringify(newActive)});
              // Wire/unwire ke hooks system
              project.setHooks(prev=>{
                const hooksForType=[...(prev[p.hookType]||[])];
                const idx=hooksForType.findIndex(h=>typeof h==='object'&&h._pluginId===p.id);
                if(!isActive){
                  // Aktifkan: tambah hook jika belum ada
                  if(idx===-1) hooksForType.push({type:'shell',command:p.cmd.replace('{{context}}',project.folder)+'',_pluginId:p.id});
                } else {
                  // Nonaktifkan: hapus hook
                  if(idx!==-1) hooksForType.splice(idx,1);
                }
                const next={...prev,[p.hookType]:hooksForType};
                Preferences.set({key:'yc_hooks',value:JSON.stringify(next)});
                return next;
              });
              chat.setMessages(m=>[...m,{role:'assistant',content:(isActive?'🔌 Plugin **'+p.name+'** dinonaktifkan.':'✅ Plugin **'+p.name+'** aktif! Hook terpasang di '+p.hookType+'.'),actions:[]}]);
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
          <div style={{marginTop:'8px',fontSize:'10px',color:'rgba(255,255,255,.2)',textAlign:'center'}}>Plugin aktif terpasang otomatis ke hooks system</div>
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
              {label:'Effort Level',value:project.effort,options:['low','medium','high'],onChange:v=>{project.setEffort(v);Preferences.set({key:'yc_effort',value:v});}},
              {label:'Font Size',value:String(ui.fontSize),options:['12','13','14','15','16'],onChange:v=>{ui.setFontSize(parseInt(v));Preferences.set({key:'yc_fontsize',value:v});}},
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
              <button onClick={()=>{const n=!project.thinkingEnabled;project.setThinkingEnabled(n);Preferences.set({key:'yc_thinking',value:n?'1':'0'});}} style={{background:project.thinkingEnabled?'rgba(124,58,237,.3)':'rgba(255,255,255,.05)',border:'1px solid '+(project.thinkingEnabled?'rgba(124,58,237,.5)':'rgba(255,255,255,.08)'),borderRadius:'6px',padding:'4px 10px',color:project.thinkingEnabled?'#a78bfa':'rgba(255,255,255,.5)',fontSize:'11px',cursor:'pointer'}}>
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
            <div style={{fontSize:'11px',color:'rgba(255,255,255,.3)',marginBottom:'14px'}}>node ~/yugit.cjs "..."</div>
            <input
              autoFocus
              value={ui.commitMsg}
              onChange={e=>ui.setCommitMsg(e.target.value)}
              onKeyDown={e=>{
                if(e.key==='Enter'&&ui.commitMsg.trim()){
                  ui.setCommitModal(false);
                  runShortcut('node ~/yugit.cjs "'+ui.commitMsg.trim().replace(/"/g,'\\"')+'"');
                }
                if(e.key==='Escape') ui.setCommitModal(false);
              }}
              placeholder="commit message..."
              style={{width:'100%',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'8px',padding:'10px 12px',color:'#f0f0f0',fontSize:'13px',outline:'none',fontFamily:'monospace',marginBottom:'12px',boxSizing:'border-box'}}
            />
            <div style={{display:'flex',gap:'8px'}}>
              <button
                onClick={()=>ui.setCommitModal(false)}
                style={{flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'8px',padding:'9px',color:'rgba(255,255,255,.4)',fontSize:'12px',cursor:'pointer'}}>
                Batal
              </button>
              <button
                disabled={!ui.commitMsg.trim()}
                onClick={()=>{
                  ui.setCommitModal(false);
                  runShortcut('node ~/yugit.cjs "'+ui.commitMsg.trim().replace(/"/g,'\\"')+'"');
                }}
                style={{flex:2,background:ui.commitMsg.trim()?T.accent:'rgba(255,255,255,.05)',border:'none',borderRadius:'8px',padding:'9px',color:'white',fontSize:'12px',cursor:ui.commitMsg.trim()?'pointer':'default',fontWeight:'600',opacity:ui.commitMsg.trim()?1:.4}}>
                ↑ Push
              </button>
            </div>
          </div>
              </div>
  </BottomSheet>
      )}
    </div>
  );
}
