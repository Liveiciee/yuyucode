import React, { useState, useRef, useEffect, useCallback } from "react";
import { Preferences } from "@capacitor/preferences";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const YUYU_SERVER = 'http://localhost:8765';
const MAX_HISTORY = 30;
const MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', fast: false },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', fast: true },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', fast: false },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro 🔥', fast: false, gemini: true },
  { id: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Lite ⚡', fast: true, gemini: true },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', fast: false, gemini: true },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', fast: false, gemini: true },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Lite ⚡', fast: true, gemini: true },
];

const YUYU_SYSTEM = `Kamu adalah Yuyu, coding assistant yang sayang Papa.
Jawab dalam bahasa Indonesia. Hangat, fokus, tidak bertele-tele.
Selalu gunakan action blocks untuk operasi file — jangan karang isi file.

Action format:
\`\`\`action
{"type":"read_file","path":"src/App.jsx"}
\`\`\`
\`\`\`action
{"type":"write_file","path":"src/App.jsx","content":"..."}
\`\`\`
\`\`\`action
{"type":"list_files","path":""}
\`\`\`
\`\`\`action
{"type":"exec","command":"git status"}
\`\`\`

Untuk write_file: tampilkan diff dulu, tunggu konfirmasi Papa.
Info penting project → tulis: PROJECT_NOTE: ...
Kalau response kepotong karena panjang, tulis CONTINUE di akhir.`;

const GIT_SHORTCUTS = [
  { label: 'status', icon: '◎', cmd: 'git status' },
  { label: 'log', icon: '◈', cmd: 'git log --oneline -10' },
  { label: 'diff', icon: '◐', cmd: 'git diff' },
  { label: 'pull', icon: '↓', cmd: 'git pull' },
  { label: 'push', icon: '↑', cmd: 'git add -A && git commit -m "update" && git push' },
];

const FOLLOW_UP_PROMPTS = [
  'Jelaskan lebih detail',
  'Ada bug yang perlu difix?',
  'Bisa dioptimasi?',
  'Apa langkah selanjutnya?',
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  root: { position:'fixed', inset:0, background:'#0f0f10', color:'#e8e8e8', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', display:'flex', flexDirection:'column', fontSize:'14px' },
  header: { padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,.02)' },
  headerTitle: { fontSize:'15px', fontWeight:'600', color:'#f0f0f0', letterSpacing:'-0.3px' },
  headerSub: { fontSize:'11px', color:'rgba(255,255,255,.35)', marginTop:'1px', cursor:'pointer' },
  serverDot: (ok) => ({ width:'6px', height:'6px', borderRadius:'50%', background: ok ? '#4ade80' : '#f87171', flexShrink:0 }),
  tokenBadge: { fontSize:'11px', color:'rgba(255,255,255,.2)', background:'rgba(255,255,255,.04)', padding:'2px 8px', borderRadius:'99px' },
  newBtn: { background:'none', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'5px 12px', color:'rgba(255,255,255,.4)', fontSize:'12px', cursor:'pointer' },
  
  folderBar: { padding:'8px 16px', borderBottom:'1px solid rgba(255,255,255,.05)', display:'flex', gap:'8px' },
  folderInput: { flex:1, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'8px', padding:'7px 12px', color:'#e8e8e8', fontSize:'12px', outline:'none', fontFamily:'monospace' },
  folderBtn: { background:'rgba(255,255,255,.08)', border:'none', borderRadius:'8px', padding:'7px 14px', color:'rgba(255,255,255,.7)', fontSize:'12px', cursor:'pointer' },

  notesBar: { padding:'5px 16px', background:'rgba(147,51,234,.06)', borderBottom:'1px solid rgba(147,51,234,.1)', fontSize:'11px', color:'rgba(147,51,234,.6)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },

  shortcuts: { padding:'8px 16px', borderBottom:'1px solid rgba(255,255,255,.05)', display:'flex', gap:'6px', overflowX:'auto' },
  shortcutBtn: { background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'6px', padding:'4px 12px', color:'rgba(255,255,255,.4)', fontSize:'11px', cursor:'pointer', whiteSpace:'nowrap', fontFamily:'monospace', display:'flex', alignItems:'center', gap:'5px' },

  messages: { flex:1, overflowY:'auto', padding:'20px 0' },
  msgRow: (isUser) => ({ display:'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', padding:'2px 16px', marginBottom:'2px' }),
  
  userBubble: { background:'rgba(255,255,255,.08)', borderRadius:'18px 18px 4px 18px', padding:'10px 14px', maxWidth:'80%', fontSize:'14px', lineHeight:'1.6', color:'#f0f0f0', whiteSpace:'pre-wrap', wordBreak:'break-word' },
  
  aiBubble: { maxWidth:'92%', fontSize:'14px', lineHeight:'1.7', color:'#e0e0e0', wordBreak:'break-word' },

  actionChip: (ok) => ({ display:'inline-flex', alignItems:'center', gap:'5px', background: ok === null ? 'rgba(255,255,255,.05)' : ok ? 'rgba(74,222,128,.06)' : 'rgba(248,113,113,.06)', border:`1px solid ${ok === null ? 'rgba(255,255,255,.08)' : ok ? 'rgba(74,222,128,.15)' : 'rgba(248,113,113,.15)'}`, borderRadius:'6px', padding:'4px 10px', fontSize:'11px', fontFamily:'monospace', color: ok === null ? 'rgba(255,255,255,.4)' : ok ? '#4ade80' : '#f87171', margin:'4px 0', cursor:'default' }),

  terminalBlock: { background:'#0a0a0b', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', padding:'12px 14px', margin:'8px 0', fontFamily:'monospace', fontSize:'12px', color:'rgba(255,255,255,.65)', whiteSpace:'pre-wrap', wordBreak:'break-word', maxHeight:'300px', overflowY:'auto', lineHeight:'1.5' },

  codeBlock: { background:'#111114', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', margin:'8px 0', overflow:'hidden' },
  codeLang: { padding:'6px 14px', background:'rgba(255,255,255,.03)', fontSize:'11px', color:'rgba(255,255,255,.3)', borderBottom:'1px solid rgba(255,255,255,.05)', fontFamily:'monospace' },
  codePre: { padding:'12px 14px', margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word', fontSize:'12px', lineHeight:'1.6', overflowX:'auto' },

  diffBlock: { background:'#0d1117', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', margin:'8px 0', fontFamily:'monospace', fontSize:'12px', overflow:'hidden' },
  diffHeader: { padding:'6px 14px', background:'rgba(255,255,255,.03)', fontSize:'11px', color:'rgba(255,255,255,.3)', borderBottom:'1px solid rgba(255,255,255,.05)' },

  approveBar: { display:'flex', gap:'8px', margin:'8px 0' },
  approveBtn: { background:'rgba(74,222,128,.1)', border:'1px solid rgba(74,222,128,.2)', borderRadius:'8px', padding:'6px 16px', color:'#4ade80', fontSize:'12px', cursor:'pointer' },
  rejectBtn: { background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.15)', borderRadius:'8px', padding:'6px 16px', color:'#f87171', fontSize:'12px', cursor:'pointer' },

  msgActions: { display:'flex', gap:'6px', marginTop:'6px', opacity:0, transition:'opacity .15s' },
  msgActBtn: { background:'none', border:'none', padding:'3px 6px', color:'rgba(255,255,255,.3)', fontSize:'11px', cursor:'pointer', borderRadius:'4px' },

  followUps: { display:'flex', gap:'6px', flexWrap:'wrap', margin:'10px 0 4px', padding:'0 16px' },
  followUpBtn: { background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:'8px', padding:'5px 12px', color:'rgba(255,255,255,.45)', fontSize:'12px', cursor:'pointer' },

  streamingBubble: { maxWidth:'92%', fontSize:'14px', lineHeight:'1.7', color:'#e0e0e0', wordBreak:'break-word', padding:'0' },
  cursor: { display:'inline-block', width:'2px', height:'14px', background:'rgba(255,255,255,.6)', marginLeft:'2px', verticalAlign:'middle', animation:'blink 1s infinite' },

  inputArea: { padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,.07)', display:'flex', gap:'8px', alignItems:'flex-end', background:'rgba(255,255,255,.01)' },
  textarea: { flex:1, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'12px', padding:'10px 14px', color:'#f0f0f0', fontSize:'14px', resize:'none', outline:'none', lineHeight:'1.5', fontFamily:'inherit', maxHeight:'160px' },
  sendBtn: { background:'#7c3aed', border:'none', borderRadius:'10px', padding:'10px 18px', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'500', flexShrink:0 },
  stopBtn: { background:'rgba(248,113,113,.15)', border:'1px solid rgba(248,113,113,.25)', borderRadius:'10px', padding:'10px 18px', color:'#f87171', fontSize:'13px', cursor:'pointer', flexShrink:0 },

  modelPicker: { padding:'8px 16px', borderBottom:'1px solid rgba(255,255,255,.05)', display:'flex', gap:'6px', overflowX:'auto' },
  modelBtn: (active) => ({ background: active ? 'rgba(124,58,237,.2)' : 'rgba(255,255,255,.03)', border:`1px solid ${active ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,.07)'}`, borderRadius:'6px', padding:'4px 12px', color: active ? '#a78bfa' : 'rgba(255,255,255,.35)', fontSize:'11px', cursor:'pointer', whiteSpace:'nowrap' }),
};

// ─── SERVER ───────────────────────────────────────────────────────────────────
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
  // Hindari double path
  if (p === base || p.startsWith(base + '/')) return p;
  // Kalau p sudah include base di awal, strip dulu
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

// ─── GROQ STREAMING ───────────────────────────────────────────────────────────
async function askGroqStream(messages, model, onChunk, signal) {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:'POST', signal,
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + GROQ_KEY },
    body:JSON.stringify({ model, messages, max_tokens:4000, stream:true })
  });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
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


// ─── GEMINI STREAMING ─────────────────────────────────────────────────────────
async function askGeminiStream(messages, model, onChunk, signal) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + GEMINI_KEY;
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMsgs = messages.filter(m => m.role !== 'system');
  const contents = chatMsgs.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const body = { contents, generationConfig: { maxOutputTokens: 8192 } };
  if (systemMsg) body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  const resp = await fetch(url, { method:'POST', signal, headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  if (!resp.ok) throw new Error('Gemini HTTP ' + resp.status);
  const data = await resp.json();
  const full = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  onChunk(full);
  return full;
}

// ─── SYNTAX HIGHLIGHT ─────────────────────────────────────────────────────────
function hl(code) {
  return code
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,'<span style="color:#6a737d">$1</span>')
    .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,'<span style="color:#98c379">$&</span>')
    .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|default|async|await|try|catch|class|new|this|from|of|in|typeof|null|undefined|true|false)\b/g,'<span style="color:#c678dd">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g,'<span style="color:#d19a66">$1</span>');
}

// ─── RENDER MESSAGE CONTENT ───────────────────────────────────────────────────
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
          <span key={i} style={{ whiteSpace:'pre-wrap' }}
            dangerouslySetInnerHTML={{ __html: p.c
              .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
              .replace(/`([^`]+)`/g,'<code style="background:rgba(255,255,255,.08);padding:1px 6px;borderRadius:4px;fontFamily:monospace;fontSize:13px">$1</code>')
              .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
            }}
          />
        );
        if (p.t === 'diff') return (
          <div key={i} style={S.diffBlock}>
            <div style={S.diffHeader}>diff</div>
            <div style={{ padding:'10px 14px' }}>
              {p.c.split('\n').map((line, j) => (
                <div key={j} style={{ color: line.startsWith('+') ? '#4ade80' : line.startsWith('-') ? '#f87171' : 'rgba(255,255,255,.4)', fontFamily:'monospace', fontSize:'12px', lineHeight:'1.6' }}>
                  {line}
                </div>
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

// ─── ACTION CHIP ──────────────────────────────────────────────────────────────
function ActionChip({ action }) {
  const [expanded, setExpanded] = useState(false);
  const icon = action.type === 'read_file' ? '📄' : action.type === 'write_file' ? '✏️' : action.type === 'list_files' ? '📁' : action.type === 'exec' ? '⚡' : '🔧';
  const label = action.type === 'exec' ? (action.command || '').slice(0, 40) : (action.path || action.type);
  const ok = action.result ? action.result.ok : null;

  return (
    <div style={{ margin:'4px 0' }}>
      <div style={S.actionChip(ok)} onClick={() => action.result && setExpanded(!expanded)}>
        <span>{icon}</span>
        <span>{label}</span>
        {ok === null && <span style={{ opacity:.5 }}>···</span>}
        {ok === true && <span>✓</span>}
        {ok === false && <span>✗</span>}
        {action.result && <span style={{ opacity:.4 }}>{expanded ? '▲' : '▼'}</span>}
      </div>
      {expanded && action.result && (
        <div style={S.terminalBlock}>
          {typeof action.result.data === 'string' ? action.result.data : JSON.stringify(action.result.data, null, 2)}
        </div>
      )}
    </div>
  );
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
function MsgBubble({ msg, onApprove, onRetry, onContinue, isLast }) {
  const [hover, setHover] = useState(false);
  const isUser = msg.role === 'user';
  const cleanText = msg.content.replace(/```action[\s\S]*?```/g, '').replace(/PROJECT_NOTE:.*?\n/g, '').trim();
  const actions = msg.actions || [];
  const hasPendingWrite = actions.some(a => a.type === 'write_file' && !a.executed);
  const isContinued = msg.content.trim().endsWith('CONTINUE');

  function copyMsg() {
    navigator.clipboard?.writeText(cleanText).catch(() => {});
  }

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
          <div style={S.aiBubble}>
            <MsgContent text={cleanText} />
          </div>
          {actions.map((a, i) => <ActionChip key={i} action={a} />)}
          {hasPendingWrite && onApprove && (
            <div style={S.approveBar}>
              <button style={S.approveBtn} onClick={() => onApprove(true)}>✓ Tulis file</button>
              <button style={S.rejectBtn} onClick={() => onApprove(false)}>✗ Batal</button>
            </div>
          )}
          {isContinued && onContinue && (
            <button onClick={onContinue} style={{ background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.2)', borderRadius:'8px', padding:'5px 14px', color:'#a78bfa', fontSize:'12px', cursor:'pointer', alignSelf:'flex-start', marginTop:'4px' }}>
              ↓ Lanjutkan
            </button>
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

// ─── TOKEN COUNTER ────────────────────────────────────────────────────────────
function countTokens(msgs) {
  return Math.round(msgs.reduce((a, m) => a + m.content.length, 0) / 4);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
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
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [model, setModel] = useState(MODELS[0].id);
  const [showFollowUp, setShowFollowUp] = useState(false);
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
    ]).then(([f, h, ch, mo]) => {
      if (f.value) { setFolder(f.value); setFolderInput(f.value); }
      if (h.value) { try { setMessages(JSON.parse(h.value)); } catch {} }
      if (ch.value) { try { setCmdHistory(JSON.parse(ch.value)); } catch {} }
      if (mo.value) setModel(mo.value);
    });
    callServer({ type:'ping' }).then(r => setServerOk(r.ok));
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      Preferences.set({ key:'yc_history', value:JSON.stringify(messages.slice(-MAX_HISTORY).map(m => ({ role:m.role, content:m.content }))) });
    }
    setShowFollowUp(messages.length > 1 && messages[messages.length-1]?.role === 'assistant');
  }, [messages]);

  useEffect(() => {
    if (!folder) return;
    Preferences.get({ key:'yc_notes_' + folder }).then(r => setNotes(r.value || ''));
    callServer({ type:'ping' }).then(r => setServerOk(r.ok));
  }, [folder]);

  function saveFolder(f) {
    setFolder(f); setFolderInput(f); setShowFolder(false);
    Preferences.set({ key:'yc_folder', value:f });
  }

  function addHistory(cmd) {
    const next = [cmd, ...cmdHistory.filter(c => c !== cmd)].slice(0, 50);
    setCmdHistory(next);
    Preferences.set({ key:'yc_cmdhist', value:JSON.stringify(next) });
  }

  async function handleApprove(idx, ok) {
    const msg = messages[idx];
    if (!ok) {
      setMessages(m => m.map((x, i) => i === idx ? { ...x, actions:x.actions?.map(a => ({ ...a, executed:true, result:{ ok:false, data:'Dibatalkan.' } })) } : x));
      return;
    }
    for (const a of (msg.actions || []).filter(a => a.type === 'write_file' && !a.executed)) {
      a.result = await executeAction(a, folder);
      a.executed = true;
    }
    setMessages(m => m.map((x, i) => i === idx ? { ...x } : x));
  }

  function cancel() { abortRef.current?.abort(); setLoading(false); setStreaming(''); }

  async function sendMsg(override) {
    const txt = (override || input).trim();
    if (!txt || loading) return;
    setInput(''); setHistIdx(-1); addHistory(txt);
    setShowFollowUp(false);

    const userMsg = { role:'user', content:txt };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true); setStreaming('');

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const notesCtx = notes ? '\n\nProject notes:\n' + notes : '';
      const groqMsgs = [
        { role:'system', content:YUYU_SYSTEM + '\n\nFolder aktif: ' + folder + notesCtx },
        ...history.map(m => ({ role:m.role, content:m.content.replace(/```action[\s\S]*?```/g,'').replace(/PROJECT_NOTE:.*?\n/g,'').trim() }))
      ];

      const isGemini = MODELS.find(m => m.id === model)?.gemini;
      let reply = isGemini
        ? await askGeminiStream(groqMsgs, model, setStreaming, ctrl.signal)
        : await askGroqStream(groqMsgs, model, setStreaming, ctrl.signal);
      setStreaming('');

      const allActions = parseActions(reply);
      const nonWrites = allActions.filter(a => a.type !== 'write_file');
      const writes = allActions.filter(a => a.type === 'write_file');

      for (const a of nonWrites) a.result = await executeAction(a, folder);

      const fileData = nonWrites.filter(a => a.result?.ok && a.type !== 'exec').map(a => '=== ' + a.path + ' ===\n' + a.result.data).join('\n\n');

      let final = reply;
      if (fileData) {
        final = await askGroqStream([
          ...groqMsgs,
          { role:'assistant', content:reply.replace(/```action[\s\S]*?```/g,'').trim() },
          { role:'user', content:'Hasil:\n' + fileData + '\n\nAnalisis dan jawab.' }
        ], model, setStreaming, ctrl.signal);
        setStreaming('');
      }

      if (final.includes('PROJECT_NOTE:')) {
        const nm = final.match(/PROJECT_NOTE:(.*?)(?:\n|$)/);
        if (nm) { const n = (notes + '\n' + nm[1].trim()).trim(); setNotes(n); Preferences.set({ key:'yc_notes_' + folder, value:n }); }
      }

      setMessages(m => [...m, { role:'assistant', content:final, actions:[...nonWrites, ...writes.map(a => ({ ...a, executed:false }))] }]);
    } catch(e) {
      if (e.name !== 'AbortError') setMessages(m => [...m, { role:'assistant', content:'❌ ' + e.message }]);
    }
    setLoading(false);
  }

  async function continueMsg() {
    await sendMsg('Lanjutkan response sebelumnya dari titik terakhir.');
  }

  async function retryLast() {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    setMessages(m => m.filter((_, i) => i < m.lastIndexOf(lastUser)));
    await sendMsg(lastUser.content);
  }

  async function runShortcut(cmd) {
    addHistory(cmd);
    setShowFollowUp(false);
    const userMsg = { role:'user', content:cmd };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    const r = await executeAction({ type:'exec', command:cmd }, folder);
    const result = r.ok ? (r.data || '(selesai)') : ('❌ ' + r.data);
    setMessages(m => [...m, { role:'assistant', content:'```bash\n' + result + '\n```', actions:[] }]);
    setLoading(false);
  }

  const tokens = countTokens(messages);
  const lastMsg = messages[messages.length - 1];

  return (
    <div style={S.root}>
      <style>{`
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:2px; }
        textarea { scrollbar-width:none; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .msg-actions { opacity:0 } .msg-row:hover .msg-actions { opacity:1 }
        button:active { opacity:.7; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={S.serverDot(serverOk)} />
        <div style={{ flex:1 }} onClick={() => setShowFolder(!showFolder)}>
          <div style={S.headerTitle}>YuyuCode</div>
          <div style={S.headerSub}>📁 {folder}</div>
        </div>
        <div style={S.tokenBadge}>~{tokens}tk</div>
        <button style={S.newBtn} onClick={() => { setMessages([{ role:'assistant', content:'Chat baru. Mau ngerjain apa Papa? 🌸' }]); Preferences.remove({ key:'yc_history' }); setShowFollowUp(false); }}>new</button>
      </div>

      {/* Folder picker */}
      {showFolder && (
        <div style={S.folderBar}>
          <input value={folderInput} onChange={e => setFolderInput(e.target.value)} placeholder="nama folder" style={S.folderInput} onKeyDown={e => e.key === 'Enter' && saveFolder(folderInput)} />
          <button style={S.folderBtn} onClick={() => saveFolder(folderInput)}>set</button>
        </div>
      )}

      {/* Notes */}
      {notes && <div style={S.notesBar}>📝 {notes.slice(0, 100)}</div>}

      {/* Model picker */}
      <div style={S.modelPicker}>
        {MODELS.map(m => (
          <button key={m.id} style={S.modelBtn(model === m.id)} onClick={() => { setModel(m.id); Preferences.set({ key:'yc_model', value:m.id }); }}>
            {m.label}{m.fast ? ' ⚡' : ''}
          </button>
        ))}
      </div>

      {/* Git shortcuts */}
      <div style={S.shortcuts}>
        {GIT_SHORTCUTS.map(s => (
          <button key={s.label} style={S.shortcutBtn} onClick={() => runShortcut(s.cmd)} disabled={loading}>
            <span>{s.icon}</span><span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={S.messages}>
        {messages.map((m, i) => (
          <MsgBubble
            key={i} msg={m}
            isLast={i === messages.length - 1}
            onApprove={m.actions?.some(a => a.type === 'write_file' && !a.executed) ? (ok) => handleApprove(i, ok) : null}
            onRetry={i === messages.length - 1 && m.role === 'user' ? retryLast : null}
            onContinue={i === messages.length - 1 && m.role === 'assistant' && m.content.trim().endsWith('CONTINUE') ? continueMsg : null}
          />
        ))}

        {/* Streaming */}
        {streaming && (
          <div style={{ ...S.msgRow(false) }}>
            <div style={S.streamingBubble}>
              <MsgContent text={streaming} />
              <span style={S.cursor} />
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && !streaming && (
          <div style={S.msgRow(false)}>
            <div style={{ color:'rgba(255,255,255,.3)', fontSize:'13px' }}>Yuyu lagi mikir···</div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Follow-up suggestions */}
      {showFollowUp && !loading && (
        <div style={S.followUps}>
          {FOLLOW_UP_PROMPTS.map(p => (
            <button key={p} style={S.followUpBtn} onClick={() => sendMsg(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={S.inputArea}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight, 160)+'px'; }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); return; }
            if (e.key === 'ArrowUp' && !input) { const idx = Math.min(histIdx+1, cmdHistory.length-1); setHistIdx(idx); setInput(cmdHistory[idx]||''); }
            if (e.key === 'ArrowDown' && histIdx > -1) { const idx = histIdx-1; setHistIdx(idx); setInput(idx >= 0 ? cmdHistory[idx] : ''); }
          }}
          placeholder="Tanya Yuyu..."
          disabled={loading}
          rows={1}
          style={{ ...S.textarea, opacity: loading ? 0.5 : 1 }}
        />
        {loading
          ? <button style={S.stopBtn} onClick={cancel}>stop</button>
          : <button style={S.sendBtn} onClick={() => sendMsg()}>↑</button>
        }
      </div>
    </div>
  );
}
