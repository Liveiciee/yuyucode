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
1. write_file -> diff dulu, tunggu konfirmasi
2. Setelah write -> tanya push SEKALI: git add -A && git commit -m "tipe: pesan" && git push
3. Setelah push -> BERHENTI
4. File besar -> baca per chunk (from/to)
5. PROJECT_NOTE: info
6. Kepotong -> CONTINUE
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

async function callServer(payload) {
  try {
    const resp = await fetch(YUYU_SERVER, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    return await resp.json();
  } catch(e) {
    return { ok:false, data:'YuyuServer tidak aktif. Jalankan: node ~/yuyu-server.js' };
  }
}

function resolvePath(base, p) {
  if (!p) return base;
  if (!base) return p;
  if (p === base || p.startsWith(base + '/')) return p;
  const stripped = p.startsWith(base) ? p.slice(base.length).replace(/^\//, '') : p;
  return base + '/' + stripped;
}

async function executeAction(action, baseFolder) {
  const base = baseFolder || '';
  if (action.type === 'read_file') {
    const payload = { type:'read', path:resolvePath(base, action.path) };
    if (action.from) payload.from = action.from;
    if (action.to) payload.to = action.to;
    const r = await callServer(payload);
    if (r.ok && r.meta) r.data = `[Lines ${action.from||1}-${action.to||r.meta.totalLines} of ${r.meta.totalLines} | ${Math.round(r.meta.totalChars/1000)}KB]\n` + r.data;
    return r;
  }
  if (action.type === 'write_file') return callServer({ type:'write', path:resolvePath(base, action.path), content:action.content });
  if (action.type === 'list_files') {
    const r = await callServer({ type:'list', path:resolvePath(base, action.path) });
    if (r.ok && Array.isArray(r.data)) r.data = r.data.map(f => (f.isDir ? '📁 ' : '📄 ') + f.name + (f.size ? ` (${Math.round(f.size/1024)}KB)` : '')).join('\n');
    return r;
  }
  if (action.type === 'exec') return callServer({ type:'exec', path:base, command:action.command });
  if (action.type === 'search') return callServer({ type:'search', path:resolvePath(base, action.path||''), content:action.query });
  if (action.type === 'file_info') return callServer({ type:'info', path:resolvePath(base, action.path) });
  if (action.type === 'delete_file') return callServer({ type:'delete', path:resolvePath(base, action.path) });
  return { ok:false, data:'Unknown: ' + action.type };
}

function parseActions(text) {
  const regex = /```action\n([\s\S]*?)```/g;
  const actions = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    try { actions.push(JSON.parse(m[1].trim())); } catch {}
  }
  return actions;
}

function hl(code) {
  return code
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/(\/{2}.*$|\/\*[\s\S]*?\*\/)/gm,'<span style="color:#6a737d">$1</span>')
    .replace(/(["`'])(?:(?!\1)[^\\]|\\.)*\1/g,'<span style="color:#98c379">$&</span>')
    .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|default|async|await|try|catch|class|new|this|from|of|in|typeof|null|undefined|true|false)\b/g,'<span style="color:#c678dd">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g,'<span style="color:#d19a66">$1</span>');
}

function MsgContent({ text }) {
  const parts = [];
  const regex = /```(\w+)?\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ t:'text', c:text.slice(last, m.index) });
    const lang = m[1] || '';
    if (lang === 'action') { last = m.index + m[0].length; continue; }
    if (lang === 'diff') parts.push({ t:'diff', c:m[2] });
    else parts.push({ t:'code', lang, c:m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ t:'text', c:text.slice(last) });
  return (
    <div>
      {parts.map((p, i) => {
        if (p.t === 'text') return (
          <div key={i} style={{ lineHeight:'1.7', wordBreak:'break-word' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}
              components={{
                table: ({node,...props}) => <div style={{overflowX:'auto',margin:'8px 0'}}><table style={{width:'100%',borderCollapse:'collapse',background:'rgba(255,255,255,.02)',borderRadius:'8px'}} {...props} /></div>,
                th: ({node,...props}) => <th style={{padding:'6px 12px',fontSize:'11px',color:'rgba(255,255,255,.45)',fontWeight:'600',borderBottom:'1px solid rgba(255,255,255,.12)',textAlign:'left',whiteSpace:'nowrap',minWidth:'120px'}} {...props} />,
                td: ({node,...props}) => <td style={{padding:'6px 12px',fontSize:'12px',borderBottom:'1px solid rgba(255,255,255,.04)',verticalAlign:'top',minWidth:'120px'}} {...props} />,
                h1: ({node,...props}) => <div style={{fontSize:'15px',fontWeight:'700',color:'#f0f0f0',margin:'14px 0 6px'}} {...props} />,
                h2: ({node,...props}) => <div style={{fontSize:'14px',fontWeight:'700',color:'#f0f0f0',margin:'12px 0 5px'}} {...props} />,
                h3: ({node,...props}) => <div style={{fontSize:'13px',fontWeight:'700',color:'#e8e8e8',margin:'10px 0 4px'}} {...props} />,
                code: ({node,inline,...props}) => inline ? <code style={{background:'rgba(255,255,255,.1)',padding:'1px 5px',borderRadius:'3px',fontFamily:'monospace',fontSize:'12px',color:'#e8e8e8'}} {...props} /> : <pre style={{background:'#111114',padding:'10px 12px',borderRadius:'8px',overflow:'auto',fontSize:'12px',margin:'6px 0'}} {...props} />,
                hr: ({node,...props}) => <hr style={{border:'none',borderTop:'1px solid rgba(255,255,255,.08)',margin:'10px 0'}} />,
                strong: ({node,...props}) => <strong style={{color:'#f0f0f0'}} {...props} />,
                li: ({node,...props}) => <li style={{margin:'2px 0',color:'#e0e0e0'}} {...props} />,
              }}
            >{p.c}</ReactMarkdown>
          </div>
        );
        if (p.t === 'diff') return (
          <div key={i} style={S.diffBlock}>
            <div style={S.diffHeader}>diff</div>
            <div style={{ padding:'10px 14px' }}>
              {p.c.split('\n').map((line, j) => (
                <div key={j} style={{ color: line.startsWith('+') ? '#4ade80' : line.startsWith('-') ? '#f87171' : 'rgba(255,255,255,.4)', fontFamily:'monospace', fontSize:'12px', lineHeight:'1.6' }}>{line}</div>
              ))}
            </div>
          </div>
        );
        return (
          <div key={i} style={S.codeBlock}>
            {p.lang && <div style={S.codeLang}>{p.lang}</div>}
            <pre style={S.codePre} dangerouslySetInnerHTML={{ __html: hl(p.c) }} />
          </div>
        );
      })}
    </div>
  );
}

function ActionChip({ action }) {
  const [expanded, setExpanded] = useState(false);
  const icon = action.type === 'read_file' ? '📄' : action.type === 'write_file' ? '✏️' : action.type === 'list_files' ? '📁' : action.type === 'exec' ? '⚡' : action.type === 'search' ? '🔍' : '🔧';
  const label = action.type === 'exec' ? (action.command || '').slice(0, 40) : (action.path || action.type);
  const ok = action.result ? action.result.ok : null;
  return (
    <div style={{ margin:'4px 0' }}>
      <div style={S.actionChip(ok)} onClick={() => action.result && setExpanded(!expanded)}>
        <span>{icon}</span><span>{label}</span>
        {ok === null && <span style={{ opacity:.5 }}>···</span>}
        {ok === true && <span>✓</span>}
        {ok === false && <span>✗</span>}
        {action.result && <span style={{ opacity:.4 }}>{expanded ? '▲' : '▼'}</span>}
      </div>
      {expanded && action.result && (
        <div style={S.terminalBlock}>{typeof action.result.data === 'string' ? action.result.data : JSON.stringify(action.result.data, null, 2)}</div>
      )}
    </div>
  );
}

function MsgBubble({ msg, onApprove, onPlanApprove, onRetry, onContinue, isLast }) {
  const [hover, setHover] = useState(false);
  const isUser = msg.role === 'user';
  const cleanText = msg.content.replace(/```action[\s\S]*?```/g, '').replace(/PROJECT_NOTE:.*?\n/g, '').trim();
  const actions = msg.actions || [];
  const hasPendingWrite = actions.some(a => a.type === 'write_file' && !a.executed);
  const isContinued = msg.content.trim().endsWith('CONTINUE');
  const hasPlan = !msg.planApproved && msg.content.includes('📋 PLAN:');

  function copyMsg() { navigator.clipboard?.writeText(cleanText).catch(() => {}); }

  return (
    <div style={S.msgRow(isUser)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {isUser ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
          <div style={S.userBubble}>{cleanText}</div>
          <div style={{ ...S.msgActions, opacity: hover ? 1 : 0 }}>
            <button style={S.msgActBtn} onClick={copyMsg}>copy</button>
            {onRetry && <button style={S.msgActBtn} onClick={onRetry}>retry</button>}
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'2px', width:'100%' }}>
          <div style={S.aiBubble}><MsgContent text={cleanText} /></div>
          {actions.map((a, i) => <ActionChip key={i} action={a} />)}
          {hasPendingWrite && onApprove && (
            <div style={S.approveBar}>
              <button style={S.approveBtn} onClick={() => onApprove(true)}>✓ Tulis file</button>
              <button style={S.rejectBtn} onClick={() => onApprove(false)}>✗ Batal</button>
            </div>
          )}
          {hasPlan && onPlanApprove && (
            <div style={{ display:'flex', gap:'8px', margin:'8px 0' }}>
              <button onClick={() => onPlanApprove(true)} style={{ background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.3)', borderRadius:'8px', padding:'6px 16px', color:'#a78bfa', fontSize:'12px', cursor:'pointer' }}>✓ Approve Plan</button>
              <button onClick={() => onPlanApprove(false)} style={{ background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.15)', borderRadius:'8px', padding:'6px 16px', color:'#f87171', fontSize:'12px', cursor:'pointer' }}>✗ Ubah Plan</button>
            </div>
          )}
          {isContinued && onContinue && (
            <button onClick={onContinue} style={{ background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.2)', borderRadius:'8px', padding:'5px 14px', color:'#a78bfa', fontSize:'12px', cursor:'pointer', alignSelf:'flex-start', marginTop:'4px' }}>↓ Lanjutkan</button>
          )}
          <div style={{ ...S.msgActions, opacity: hover ? 1 : 0 }}>
            <button style={S.msgActBtn} onClick={copyMsg}>copy</button>
            {isLast && onRetry && <button style={S.msgActBtn} onClick={onRetry}>retry</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function countTokens(msgs) { return Math.round(msgs.reduce((a, m) => a + m.content.length, 0) / 4); }

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


function ErrorBoundary({ children }) {
  const [err, setErr] = React.useState(null);
  if (err) return <div style={{color:'red',padding:'20px',whiteSpace:'pre-wrap'}}>{err}</div>;
  return children;
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
    callServer({ type:'ping' }).then(r => setServerOk(r.ok)).catch(()=>setServerOk(false));
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
      const fileCtx = selectedFile && fileContent ? '\n\nFile terbuka: '+selectedFile : '';
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
    setMessages(m=>[...m,{role:'assistant',content:'```bash\n'+(r.data||'selesai')+'\n```',actions:[]}]);
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

      {showFolder&&(
        <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.05)',display:'flex',gap:'6px',background:'rgba(255,255,255,.02)',flexShrink:0}}>
          <input value={folderInput} onChange={e=>setFolderInput(e.target.value)} placeholder="nama folder" onKeyDown={e=>e.key==='Enter'&&saveFolder(folderInput)}
            style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'6px 10px',color:'#e8e8e8',fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <button onClick={()=>saveFolder(folderInput)} style={{background:'rgba(255,255,255,.08)',border:'none',borderRadius:'6px',padding:'6px 12px',color:'rgba(255,255,255,.7)',fontSize:'12px',cursor:'pointer'}}>set</button>
        </div>
      )}

      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
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

        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
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

          {showTerminal&&<div style={{flex:1,overflow:'hidden'}}><Terminal folder={folder}/></div>}

          {showFollowUp&&!loading&&activeTab==='chat'&&!showTerminal&&(
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',padding:'6px 16px',flexShrink:0}}>
              {FOLLOW_UPS.map(p=>(
                <button key={p} onClick={()=>sendMsg(p)} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px',padding:'4px 10px',color:'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer'}}>{p}</button>
              ))}
            </div>
          )}

          {!showTerminal&&(
            <div style={{padding:'6px 12px',borderTop:'1px solid rgba(255,255,255,.05)',display:'flex',gap:'5px',overflowX:'auto',flexShrink:0}}>
              {GIT_SHORTCUTS.map(s=>(
                <button key={s.label} onClick={()=>runShortcut(s.cmd)} disabled={loading} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'5px',padding:'3px 10px',color:'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace',display:'flex',alignItems:'center',gap:'4px'}}>
                  <span>{s.icon}</span><span>{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {!showTerminal&&(
            <div style={{padding:'8px 12px',borderTop:'1px solid rgba(255,255,255,.07)',display:'flex',gap:'6px',alignItems:'flex-end',background:'rgba(255,255,255,.01)',flexShrink:0}}>
              <textarea ref={inputRef} value={input}
                onChange={e=>{setInput(e.target.value);e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';}}
                onKeyDown={e=>{
                  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();return;}
                  if(e.key==='ArrowUp'&&!input){const i=Math.min(histIdx+1,cmdHistory.length-1);setHistIdx(i);setInput(cmdHistory[i]||'');}
                  if(e.key==='ArrowDown'&&histIdx>-1){const i=histIdx-1;setHistIdx(i);setInput(i>=0?cmdHistory[i]:'');}
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