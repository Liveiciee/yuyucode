import React, { useState, useRef, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CEREBRAS_KEY = import.meta.env.VITE_CEREBRAS_API_KEY || '';
const YUYU_SERVER = 'http://localhost:8765';
const MAX_HISTORY = 40;

const MODELS = [
  { id: 'qwen-3-235b-a22b-instruct-2507', label: 'Qwen 3 235B 🔥' },
  { id: 'llama3.1-8b', label: 'Llama 3.1 8B ⚡' },
];

const BASE_SYSTEM = `Kamu adalah Yuyu, coding assistant yang sayang Papa.
Jawab dalam bahasa Indonesia. Hangat, fokus, tidak bertele-tele.
Selalu gunakan action blocks untuk operasi file.

Action format:
\`\`\`action
{"type":"read_file","path":"src/App.jsx"}
\`\`\`
\`\`\`action
{"type":"write_file","path":"src/App.jsx","content":"..."}
\`\`\`
\`\`\`action
{"type":"list_files","path":"src"}
\`\`\`
\`\`\`action
{"type":"exec","command":"git status"}
\`\`\`
\`\`\`action
{"type":"search","query":"useState","path":"src"}
\`\`\`

PLAN MODE:
📋 PLAN:
- Step 1: ...
Tunggu Papa approve baru eksekusi.

ATURAN:
1. write_file → diff dulu, tunggu konfirmasi
2. Setelah write → tanya push SEKALI
3. Setelah push → BERHENTI
4. File besar → baca per chunk
5. PROJECT_NOTE: info
6. Kepotong → CONTINUE
7. Ikuti SKILL.md`;

const GIT_SHORTCUTS = [
  { label: 'status', icon: '◎', cmd: 'git status' },
  { label: 'log', icon: '◈', cmd: 'git log --oneline -10' },
  { label: 'diff', icon: '◐', cmd: 'git diff' },
  { label: 'pull', icon: '↓', cmd: 'git pull' },
  { label: 'push', icon: '↑', cmd: 'git add -A && git commit -m "update" && git push' },
];

const FOLLOW_UPS = ['Jelaskan lebih detail', 'Ada bug?', 'Bisa dioptimasi?', 'Langkah selanjutnya?'];

async function askCerebrasStream(messages, model, onChunk, signal) {
  const resp = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST', signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CEREBRAS_KEY,
    },
    body: JSON.stringify({ model, messages, max_tokens: 4000, stream: true })
  });
  if (!resp.ok) throw new Error('Cerebras HTTP ' + resp.status);
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split('\n')) {
      if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
      try { const d = JSON.parse(line.slice(6)).choices[0].delta.content || ''; full += d; onChunk(full); } catch {}
    }
  }
  return full;
}


// ─── CONSTANTS ────────────────────────────────────────────────────────────────
function getFileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  const icons = { jsx:'⚛', tsx:'⚛', js:'📜', ts:'📘', json:'📋', md:'📝', yml:'⚙️', css:'🎨', html:'🌐', sh:'💻', txt:'📄', png:'🖼', jpg:'🖼', svg:'🎭' };
  return icons[ext] || '📄';
}

function FileTree({ folder, onSelectFile, selectedFile }) {
  const [tree, setTree] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!folder) return;
    setLoading(true);
    callServer({ type:'list', path:folder }).then(r => {
      if (r.ok && Array.isArray(r.data)) setTree(r.data);
      setLoading(false);
    });
  }, [folder]);

  async function toggleDir(fullPath) {
    if (expanded[fullPath]) { setExpanded(e => ({ ...e, [fullPath]:null })); return; }
    const r = await callServer({ type:'list', path:fullPath });
    if (r.ok && Array.isArray(r.data)) setExpanded(e => ({ ...e, [fullPath]:r.data }));
  }

  function renderItems(items, basePath, depth) {
    const skip = ['node_modules','.git','dist','.gradle','build'];
    return [...items]
      .sort((a,b) => (a.isDir&&!b.isDir)?-1:(!a.isDir&&b.isDir)?1:a.name.localeCompare(b.name))
      .filter(item => !skip.includes(item.name))
      .map(item => {
        const fullPath = basePath + '/' + item.name;
        const isSelected = selectedFile === fullPath;
        const isExp = expanded[fullPath];
        return (
          <div key={item.name}>
            <div onClick={() => item.isDir ? toggleDir(fullPath) : onSelectFile(fullPath)}
              style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 6px 3px '+(8+depth*12)+'px', cursor:'pointer', borderRadius:'4px', background:isSelected?'rgba(124,58,237,.2)':'transparent', color:isSelected?'#a78bfa':item.isDir?'rgba(255,255,255,.7)':'rgba(255,255,255,.55)', fontSize:'12px', userSelect:'none' }}
              onMouseEnter={e => !isSelected&&(e.currentTarget.style.background='rgba(255,255,255,.04)')}
              onMouseLeave={e => !isSelected&&(e.currentTarget.style.background='transparent')}>
              <span style={{fontSize:'9px',flexShrink:0,width:'10px'}}>{item.isDir?(isExp?'▾':'▸'):''}</span>
              <span style={{fontSize:'11px',flexShrink:0}}>{item.isDir?'📁':getFileIcon(item.name)}</span>
              <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</span>
            </div>
            {item.isDir && isExp && renderItems(isExp, fullPath, depth+1)}
          </div>
        );
      });
  }

  return (
    <div style={{height:'100%',overflowY:'auto',padding:'4px 0'}}>
      {loading && <div style={{padding:'8px 12px',fontSize:'11px',color:'rgba(255,255,255,.3)'}}>Loading...</div>}
      {tree && renderItems(tree, folder, 0)}
    </div>
  );
}


function Terminal({ folder }) {
  const [history, setHistory] = useState([{type:'info',text:'$ YuyuTerminal'}]);
  const [input, setInput] = useState('');
  const [cmdHist, setCmdHist] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [history]);

  async function run() {
    const cmd = input.trim();
    if (!cmd) return;
    setInput(''); setHistIdx(-1);
    setCmdHist(h => [cmd,...h.filter(c=>c!==cmd)].slice(0,50));
    setHistory(h => [...h, {type:'cmd',text:'$ '+cmd}]);
    setRunning(true);
    const r = await callServer({ type:'exec', path:folder||'', command:cmd });
    setHistory(h => [...h, {type:r.ok?'out':'err', text:r.data||'(selesai)'}]);
    setRunning(false);
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#0a0a0b',fontFamily:'monospace'}}>
      <div style={{flex:1,overflowY:'auto',padding:'8px 12px'}}>
        {history.map((h,i) => (
          <div key={i} style={{fontSize:'12px',lineHeight:'1.5',whiteSpace:'pre-wrap',wordBreak:'break-word',color:h.type==='cmd'?'#a78bfa':h.type==='err'?'#f87171':h.type==='info'?'rgba(255,255,255,.3)':'rgba(255,255,255,.7)'}}>
            {h.text}
          </div>
        ))}
        {running && <div style={{fontSize:'12px',color:'rgba(255,255,255,.3)'}}>running...</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{display:'flex',alignItems:'center',padding:'6px 12px',borderTop:'1px solid rgba(255,255,255,.06)',gap:'6px'}}>
        <span style={{fontSize:'12px',color:'#4ade80',flexShrink:0}}>$</span>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{
            if(e.key==='Enter'){run();return;}
            if(e.key==='ArrowUp'){const idx=Math.min(histIdx+1,cmdHist.length-1);setHistIdx(idx);setInput(cmdHist[idx]||'');}
            if(e.key==='ArrowDown'){const idx=histIdx-1;setHistIdx(idx);setInput(idx>=0?cmdHist[idx]:'');}
          }}
          placeholder="command..." disabled={running}
          style={{flex:1,background:'none',border:'none',outline:'none',color:'rgba(255,255,255,.85)',fontSize:'12px',fontFamily:'monospace'}}/>
      </div>
    </div>
  );
}


export default function App() {
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
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, streaming]);

  useEffect(() => {
    Promise.all([
      Preferences.get({ key:'yc_folder' }),
      Preferences.get({ key:'yc_history' }),
      Preferences.get({ key:'yc_cmdhist' }),
      Preferences.get({ key:'yc_model' }),
    ]).then(([f,h,ch,mo]) => {
      if (f.value) { setFolder(f.value); setFolderInput(f.value); }
      if (h.value) { try { setMessages(JSON.parse(h.value)); } catch {} }
      if (ch.value) { try { setCmdHistory(JSON.parse(ch.value)); } catch {} }
      if (mo.value) setModel(mo.value);
    });
    callServer({ type:'ping' }).then(r => setServerOk(r.ok));
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      Preferences.set({ key:'yc_history', value:JSON.stringify(messages.slice(-MAX_HISTORY).map(m=>({role:m.role,content:m.content}))) });
    }
    setShowFollowUp(messages.length > 1 && messages[messages.length-1]?.role === 'assistant');
  }, [messages]);

  useEffect(() => {
    if (!folder) return;
    Preferences.get({ key:'yc_notes_'+folder }).then(r => setNotes(r.value||''));
    callServer({ type:'ping' }).then(r => setServerOk(r.ok));
    callServer({ type:'read', path:folder+'/SKILL.md' }).then(r => { if(r.ok) setSkill(r.data); else setSkill(''); });
  }, [folder]);

  async function openFile(path) {
    setSelectedFile(path);
    setActiveTab('file');
    const r = await callServer({ type:'read', path });
    if (r.ok) setFileContent(r.data);
    else setFileContent('Error: '+r.data);
  }

  function saveFolder(f) { setFolder(f); setFolderInput(f); setShowFolder(false); Preferences.set({ key:'yc_folder', value:f }); }
  function addHistory(cmd) { const next=[cmd,...cmdHistory.filter(c=>c!==cmd)].slice(0,50); setCmdHistory(next); Preferences.set({ key:'yc_cmdhist', value:JSON.stringify(next) }); }

  async function handlePlanApprove(idx, approved) {
    if (!approved) { setMessages(m=>m.map((x,i)=>i===idx?{...x,planApproved:false}:x)); await sendMsg('Ubah plan.'); return; }
    setMessages(m=>m.map((x,i)=>i===idx?{...x,planApproved:true}:x));
    await sendMsg('Plan diapprove. Mulai eksekusi step by step.');
  }

  async function handleApprove(idx, ok) {
    const msg = messages[idx];
    if (!ok) { setMessages(m=>m.map((x,i)=>i===idx?{...x,actions:x.actions?.map(a=>({...a,executed:true,result:{ok:false,data:'Dibatalkan.'}}))}:x)); return; }
    for (const a of (msg.actions||[]).filter(a=>a.type==='write_file'&&!a.executed)) { a.result=await executeAction(a,folder); a.executed=true; }
    setMessages(m=>m.map((x,i)=>i===idx?{...x}:x));
  }

  function cancel() { abortRef.current?.abort(); setLoading(false); setStreaming(''); }

  async function sendMsg(override) {
    const txt = (override||input).trim();
    if (!txt||loading) return;
    setInput(''); setHistIdx(-1); addHistory(txt);
    setShowFollowUp(false); setActiveTab('chat');
    const userMsg = { role:'user', content:txt };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true); setStreaming('');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const notesCtx = notes ? '\n\nProject notes:\n'+notes : '';
      const skillCtx = skill ? '\n\nSKILL.md:\n'+skill : '';
      const fileCtx = selectedFile && fileContent ? '\n\nFile terbuka: '+selectedFile+'\n('+fileContent.length+' chars)' : '';
      const systemPrompt = BASE_SYSTEM+'\n\nFolder aktif: '+folder+notesCtx+skillCtx+fileCtx;
      const groqMsgs = [
        { role:'system', content:systemPrompt },
        ...history.map(m=>({role:m.role,content:m.content.replace(/```action[\s\S]*?```/g,'').replace(/PROJECT_NOTE:.*?\n/g,'').trim()}))
      ];
      let reply = await askCerebrasStream(groqMsgs, model, setStreaming, ctrl.signal);
      setStreaming('');
      const allActions = parseActions(reply);
      const nonWrites = allActions.filter(a=>a.type!=='write_file');
      const writes = allActions.filter(a=>a.type==='write_file');
      for (const a of nonWrites) a.result = await executeAction(a, folder);
      const fileData = nonWrites.filter(a=>a.result?.ok&&a.type!=='exec').map(a=>'=== '+a.path+' ===\n'+a.result.data).join('\n\n');
      let final = reply;
      if (fileData) {
        final = await askCerebrasStream([
          ...groqMsgs,
          { role:'assistant', content:reply.replace(/```action[\s\S]*?```/g,'').trim() },
          { role:'user', content:'Hasil:\n'+fileData+'\n\nAnalisis dan jawab.' }
        ], model, setStreaming, ctrl.signal);
        setStreaming('');
      }
      if (final.includes('PROJECT_NOTE:')) {
        const nm = final.match(/PROJECT_NOTE:(.*?)(?:\n|$)/);
        if (nm) { const n=(notes+'\n'+nm[1].trim()).trim(); setNotes(n); Preferences.set({key:'yc_notes_'+folder,value:n}); }
      }
      setMessages(m=>[...m,{role:'assistant',content:final,actions:[...nonWrites,...writes.map(a=>({...a,executed:false}))]}]);
    } catch(e) {
      if (e.name!=='AbortError') setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message}]);
    }
    setLoading(false);
  }

  async function continueMsg() { await sendMsg('Lanjutkan response sebelumnya dari titik terakhir.'); }
  async function retryLast() {
    const lastUser = [...messages].reverse().find(m=>m.role==='user');
    if (!lastUser) return;
    setMessages(m=>{ const idx=m.indexOf(lastUser); return m.slice(0,idx); });
    await sendMsg(lastUser.content);
  }
  async function runShortcut(cmd) {
    addHistory(cmd); setShowFollowUp(false); setActiveTab('chat');
    setMessages(m=>[...m,{role:'user',content:cmd}]);
    setLoading(true);
    const r = await executeAction({ type:'exec', command:cmd }, folder);
    setMessages(m=>[...m,{role:'assistant',content:'\`\`\`bash\n'+(r.data||'selesai')+'\n\`\`\`',actions:[]}]);
    setLoading(false);
  }

  const tokens = countTokens(messages);

  return (
    <div style={{position:'fixed',inset:0,background:'#0d0d0e',color:'#e8e8e8',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',display:'flex',flexDirection:'column',fontSize:'14px'}}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px;}
        textarea,input{scrollbar-width:none;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        button:active{opacity:.7;}
      `}</style>

      {/* HEADER */}
      <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,.02)',flexShrink:0}}>
        <button onClick={()=>setShowSidebar(!showSidebar)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer',padding:'2px 4px',borderRadius:'4px'}}>☰</button>
        <div style={{width:'6px',height:'6px',borderRadius:'50%',background:serverOk?'#4ade80':'#f87171',flexShrink:0}}/>
        <div style={{flex:1,cursor:'pointer'}} onClick={()=>setShowFolder(!showFolder)}>
          <span style={{fontSize:'13px',fontWeight:'600',color:'#f0f0f0'}}>YuyuCode</span>
          <span style={{fontSize:'11px',color:'rgba(255,255,255,.3)',marginLeft:'6px'}}>📁 {folder}</span>
          {skill&&<span style={{fontSize:'10px',color:'rgba(74,222,128,.5)',marginLeft:'4px'}}>· SKILL</span>}
        </div>
        <span style={{fontSize:'11px',color:'rgba(255,255,255,.2)',background:'rgba(255,255,255,.04)',padding:'2px 7px',borderRadius:'99px'}}>~{tokens}tk</span>
        <button onClick={()=>setShowTerminal(!showTerminal)} style={{background:showTerminal?'rgba(124,58,237,.2)':'none',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'3px 8px',color:showTerminal?'#a78bfa':'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer'}}>⌨</button>
        <button onClick={()=>{setMessages([{role:'assistant',content:'Chat baru. Mau ngerjain apa Papa? 🌸'}]);Preferences.remove({key:'yc_history'});setShowFollowUp(false);}} style={{background:'none',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'3px 8px',color:'rgba(255,255,255,.35)',fontSize:'11px',cursor:'pointer'}}>new</button>
      </div>

      {/* FOLDER PICKER */}
      {showFolder&&(
        <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.05)',display:'flex',gap:'6px',background:'rgba(255,255,255,.02)',flexShrink:0}}>
          <input value={folderInput} onChange={e=>setFolderInput(e.target.value)} placeholder="nama folder" onKeyDown={e=>e.key==='Enter'&&saveFolder(folderInput)}
            style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'6px 10px',color:'#e8e8e8',fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <button onClick={()=>saveFolder(folderInput)} style={{background:'rgba(255,255,255,.08)',border:'none',borderRadius:'6px',padding:'6px 12px',color:'rgba(255,255,255,.7)',fontSize:'12px',cursor:'pointer'}}>set</button>
        </div>
      )}

      {/* MAIN */}
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        
        {/* SIDEBAR */}
        {showSidebar&&(
          <div style={{width:'180px',borderRight:'1px solid rgba(255,255,255,.06)',display:'flex',flexDirection:'column',flexShrink:0,background:'rgba(255,255,255,.01)'}}>
            <div style={{padding:'5px 8px',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
              <span style={{fontSize:'10px',color:'rgba(255,255,255,.25)',letterSpacing:'.05em',textTransform:'uppercase'}}>{folder}</span>
            </div>
            <div style={{flex:1,overflow:'hidden'}}>
              <FileTree folder={folder} onSelectFile={openFile} selectedFile={selectedFile}/>
            </div>
          </div>
        )}

        {/* CENTER */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          
          {/* TABS */}
          <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,.06)',flexShrink:0,overflowX:'auto'}}>
            <button onClick={()=>setActiveTab('chat')} style={{padding:'6px 14px',background:'none',border:'none',borderBottom:activeTab==='chat'?'2px solid #7c3aed':'2px solid transparent',color:activeTab==='chat'?'#a78bfa':'rgba(255,255,255,.35)',fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap'}}>💬 Chat</button>
            {selectedFile&&<button onClick={()=>setActiveTab('file')} style={{padding:'6px 14px',background:'none',border:'none',borderBottom:activeTab==='file'?'2px solid #7c3aed':'2px solid transparent',color:activeTab==='file'?'#a78bfa':'rgba(255,255,255,.35)',fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap',maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis'}}>
              📄 {selectedFile.split('/').pop()}
            </button>}
            <div style={{marginLeft:'auto',display:'flex',gap:'4px',padding:'4px 8px',alignItems:'center'}}>
              {MODELS.map(m=>(
                <button key={m.id} onClick={()=>{setModel(m.id);Preferences.set({key:'yc_model',value:m.id});}} style={{background:model===m.id?'rgba(124,58,237,.2)':'rgba(255,255,255,.03)',border:'1px solid '+(model===m.id?'rgba(124,58,237,.4)':'rgba(255,255,255,.07)'),borderRadius:'5px',padding:'2px 8px',color:model===m.id?'#a78bfa':'rgba(255,255,255,.3)',fontSize:'10px',cursor:'pointer',whiteSpace:'nowrap'}}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* CHAT */}
          {activeTab==='chat'&&!showTerminal&&(
            <div style={{flex:1,overflowY:'auto',padding:'12px 0'}}>
              {messages.map((m,i)=>(
                <MsgBubble key={i} msg={m} isLast={i===messages.length-1}
                  onApprove={m.actions?.some(a=>a.type==='write_file'&&!a.executed)?(ok)=>handleApprove(i,ok):null}
                  onPlanApprove={m.content?.includes('📋 PLAN:')&&!m.planApproved?(ok)=>handlePlanApprove(i,ok):null}
                  onRetry={i===messages.length-1&&m.role==='user'?retryLast:null}
                  onContinue={i===messages.length-1&&m.role==='assistant'&&m.content.trim().endsWith('CONTINUE')?continueMsg:null}
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

          {/* FILE VIEW */}
          {activeTab==='file'&&selectedFile&&!showTerminal&&(
            <div style={{flex:1,overflow:'auto'}}>
              <div style={{padding:'5px 12px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,.02)',position:'sticky',top:0}}>
                <span style={{fontSize:'11px',color:'rgba(255,255,255,.4)',fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{selectedFile}</span>
                <button onClick={()=>sendMsg('Yu, jelaskan file '+selectedFile)} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'5px',padding:'2px 8px',color:'#a78bfa',fontSize:'10px',cursor:'pointer',flexShrink:0}}>Tanya Yuyu</button>
                <button onClick={()=>{setSelectedFile(null);setFileContent(null);setActiveTab('chat');}} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:'14px',cursor:'pointer',flexShrink:0}}>×</button>
              </div>
              <pre style={{margin:0,padding:'12px',fontSize:'11px',lineHeight:'1.6',fontFamily:'monospace',color:'rgba(255,255,255,.7)',whiteSpace:'pre-wrap',wordBreak:'break-word'}} dangerouslySetInnerHTML={{__html:hl(fileContent||'')}}/>
            </div>
          )}

          {/* TERMINAL */}
          {showTerminal&&<div style={{flex:1,overflow:'hidden'}}><Terminal folder={folder}/></div>}

          {/* FOLLOW UPS */}
          {showFollowUp&&!loading&&activeTab==='chat'&&!showTerminal&&(
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',padding:'6px 16px',flexShrink:0}}>
              {FOLLOW_UPS.map(p=>(
                <button key={p} onClick={()=>sendMsg(p)} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px',padding:'4px 10px',color:'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer'}}>{p}</button>
              ))}
            </div>
          )}

          {/* GIT SHORTCUTS */}
          {!showTerminal&&(
            <div style={{padding:'6px 12px',borderTop:'1px solid rgba(255,255,255,.05)',display:'flex',gap:'5px',overflowX:'auto',flexShrink:0}}>
              {GIT_SHORTCUTS.map(s=>(
                <button key={s.label} onClick={()=>runShortcut(s.cmd)} disabled={loading} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'5px',padding:'3px 10px',color:'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace',display:'flex',alignItems:'center',gap:'4px'}}>
                  <span>{s.icon}</span><span>{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          {!showTerminal&&(
            <div style={{padding:'8px 12px',borderTop:'1px solid rgba(255,255,255,.07)',display:'flex',gap:'6px',alignItems:'flex-end',background:'rgba(255,255,255,.01)',flexShrink:0}}>
              <textarea ref={inputRef} value={input}
                onChange={e=>{setInput(e.target.value);e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';}}
                onKeyDown={e=>{
                  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();return;}
                  if(e.key==='ArrowUp'&&!input){const idx=Math.min(histIdx+1,cmdHistory.length-1);setHistIdx(idx);setInput(cmdHistory[idx]||'');}
                  if(e.key==='ArrowDown'&&histIdx>-1){const idx=histIdx-1;setHistIdx(idx);setInput(idx>=0?cmdHistory[idx]:'');}
                }}
                placeholder="Tanya Yuyu..." disabled={loading} rows={1}
                style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'10px',padding:'8px 12px',color:loading?'rgba(255,255,255,.3)':'#f0f0f0',fontSize:'13px',resize:'none',outline:'none',fontFamily:'inherit',lineHeight:'1.5'}}/>
              {loading
                ?<button onClick={cancel} style={{background:'rgba(248,113,113,.15)',border:'1px solid rgba(248,113,113,.25)',borderRadius:'10px',padding:'8px 14px',color:'#f87171',fontSize:'13px',cursor:'pointer',flexShrink:0}}>stop</button>
                :<button onClick={()=>sendMsg()} style={{background:'#7c3aed',border:'none',borderRadius:'10px',padding:'8px 14px',color:'white',fontSize:'13px',cursor:'pointer',fontWeight:'500',flexShrink:0}}>↑</button>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
