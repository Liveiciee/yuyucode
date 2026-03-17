import React, { useState, useRef, useEffect, useCallback } from "react";
import { Preferences } from "@capacitor/preferences";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CEREBRAS_KEY = import.meta.env.VITE_CEREBRAS_API_KEY || '';
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const YUYU_SERVER = 'http://localhost:8765';
const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';
const MAX_HISTORY = 50;

const MODELS = [
  { id: 'qwen-3-235b-a22b-instruct-2507', label: 'Qwen 3 235B 🔥', provider:'cerebras' },
  { id: 'llama3.1-8b', label: 'Llama 3.1 8B ⚡', provider:'cerebras' },
  { id: 'gemini-2.0-flash', label: 'Gemini Flash 👁', provider:'gemini', vision:true },
  { id: 'ollama:llama3', label: 'Ollama Local 🏠', provider:'ollama' },
];

const THEMES = {
  dark:   { bg:'#0d0d0e', bg2:'rgba(255,255,255,.02)', border:'rgba(255,255,255,.07)', text:'#e8e8e8', accent:'#7c3aed' },
  darker: { bg:'#080809', bg2:'rgba(255,255,255,.015)', border:'rgba(255,255,255,.05)', text:'#d0d0d0', accent:'#6d28d9' },
  midnight: { bg:'#0a0f1e', bg2:'rgba(99,102,241,.04)', border:'rgba(99,102,241,.15)', text:'#e0e8ff', accent:'#6366f1' },
};

const BASE_SYSTEM = `Kamu adalah Yuyu — agentic coding assistant.
Bahasa Indonesia. Padat. Langsung ke poin.

## CARA KERJA
Kamu adalah agent yang BERTINDAK, bukan hanya menjelaskan.
Untuk setiap task yang butuh operasi file/sistem: LANGSUNG gunakan action block, jangan tanya dulu.
Kalau perlu info sebelum bertindak: baca dulu, lalu lanjut tanpa nunggu konfirmasi (kecuali write_file).

## ACTION FORMAT (WAJIB untuk semua operasi)
\`\`\`action
{"type":"read_file","path":"src/App.jsx"}
\`\`\`
\`\`\`action
{"type":"read_file","path":"src/App.jsx","from":1,"to":80}
\`\`\`
\`\`\`action
{"type":"write_file","path":"src/App.jsx","content":"FULL_CONTENT_HERE"}
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
\`\`\`action
{"type":"mcp","tool":"github","action":"issues","params":{"owner":"user","repo":"repo","token":"ghp_..."}}
\`\`\`

## ATURAN KRITIS
1. Diminta fix/edit/buat/cek file → LANGSUNG action, bukan "saya akan..."
2. File tidak diketahui → baca dulu dengan read_file, baru edit
3. write_file → tampilkan diff singkat, tunggu konfirmasi
4. File > 200 baris → baca per chunk (from/to 80 baris)
5. Setelah write berhasil → tawarkan git push SEKALI
6. Error di output → analisis langsung, jangan minta screenshot
7. Kepotong → tulis CONTINUE di akhir
8. PROJECT_NOTE: untuk simpan info penting project
9. Jangan jelaskan yang sudah jelas dari kode
10. Jangan tulis ulang file besar — gunakan string replace minimal

## POLA AGENTIC YANG BENAR
Task: "fix bug di useEffect"
❌ SALAH: "Saya perlu melihat kode dulu, bisa share file-nya?"
✅ BENAR: langsung \u0060\u0060\u0060action {"type":"read_file","path":"src/App.jsx","from":1,"to":80}\u0060\u0060\u0060

Task: "ada error di baris 234"
❌ SALAH: menjelaskan kemungkinan error
✅ BENAR: \u0060\u0060\u0060action {"type":"read_file","path":"src/App.jsx","from":220,"to":250}\u0060\u0060\u0060`;

const GIT_SHORTCUTS = [
  { label: 'status', icon: '◎', cmd: 'git status' },
  { label: 'log', icon: '◈', cmd: 'git log --oneline -10' },

  { label: 'pull', icon: '↓', cmd: 'git pull' },
  { label: 'push', icon: '↑', cmd: 'git add -A && git commit -m "update" && git push' },
];

const FOLLOW_UPS = ['Jelaskan lebih detail', 'Ada bug?', 'Bisa dioptimasi?', 'Langkah selanjutnya?'];

// ── SLASH COMMANDS ──
const SLASH_COMMANDS = [
  { cmd:'/model',      desc:'Ganti model AI' },
  { cmd:'/compact',    desc:'Kompres context sekarang' },
  { cmd:'/checkpoint', desc:'Simpan checkpoint sesi ini' },
  { cmd:'/restore',    desc:'Restore checkpoint terakhir' },
  { cmd:'/memory',     desc:'Lihat/edit auto memories' },
  { cmd:'/cost',       desc:'Estimasi token terpakai' },
  { cmd:'/review',     desc:'Code review file aktif' },
  { cmd:'/clear',      desc:'Clear chat history' },
  { cmd:'/export',     desc:'Export chat ke .md' },
  { cmd:'/history',    desc:'Lihat file history (git log)' },
  { cmd:'/actions',    desc:'Custom actions panel' },
  { cmd:'/split',      desc:'Toggle split view' },
  { cmd:'/scaffold',   desc:'Project template scaffold' },
  { cmd:'/deps',       desc:'Lihat dependency graph file' },
  { cmd:'/browse',     desc:'Browse URL via server' },
  { cmd:'/swarm',      desc:'Jalankan agent swarm' },
  { cmd:'/font',       desc:'Atur ukuran font' },
  { cmd:'/theme',      desc:'Buka theme builder' },
  { cmd:'/mcp',        desc:'MCP tools panel' },
  { cmd:'/github',     desc:'GitHub issues & PRs' },
  { cmd:'/deploy',     desc:'Deploy project' },
  { cmd:'/db',         desc:'Query SQLite database' },
  { cmd:'/ollama',     desc:'Set Ollama host URL' },
  { cmd:'/self-edit',  desc:'AI edit App.jsx sendiri' },
  { cmd:'/index',      desc:'Re-index codebase sekarang' },
  { cmd:'/status',     desc:'Health check semua sistem' },
  { cmd:'/tokens',     desc:'Breakdown token usage' },
];

const S = {
  msgRow: (isUser) => ({ display:'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', padding:'2px 16px', marginBottom:'2px' }),
  userBubble: { background:'rgba(255,255,255,.08)', borderRadius:'18px 18px 4px 18px', padding:'10px 14px', maxWidth:'80%', minWidth:'60px', fontSize:'14px', lineHeight:'1.6', color:'#f0f0f0', whiteSpace:'pre-wrap', wordBreak:'break-word' },
  aiBubble: { maxWidth:'92%', fontSize:'14px', lineHeight:'1.7', color:'#e0e0e0', wordBreak:'break-word' },
  actionChip: (ok) => ({ display:'inline-flex', alignItems:'center', gap:'5px', background: ok===null?'rgba(255,255,255,.05)':ok?'rgba(74,222,128,.06)':'rgba(248,113,113,.06)', border:'1px solid '+(ok===null?'rgba(255,255,255,.08)':ok?'rgba(74,222,128,.15)':'rgba(248,113,113,.15)'), borderRadius:'6px', padding:'4px 10px', fontSize:'11px', fontFamily:'monospace', color:ok===null?'rgba(255,255,255,.4)':ok?'#4ade80':'#f87171', margin:'4px 0', cursor:'default' }),
  terminalBlock: { background:'#0a0a0b', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', padding:'12px 14px', margin:'8px 0', fontFamily:'monospace', fontSize:'12px', color:'rgba(255,255,255,.65)', whiteSpace:'pre-wrap', wordBreak:'break-word', maxHeight:'300px', overflowY:'auto' },
  codeBlock: { background:'#111114', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', margin:'8px 0', overflow:'hidden' },
  codeLang: { padding:'6px 14px', background:'rgba(255,255,255,.03)', fontSize:'11px', color:'rgba(255,255,255,.3)', borderBottom:'1px solid rgba(255,255,255,.05)', fontFamily:'monospace' },
  codePre: { padding:'12px 14px', margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word', fontSize:'12px', lineHeight:'1.6' },
  diffBlock: { background:'#0d1117', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', margin:'8px 0', overflow:'hidden' },
  diffHeader: { padding:'6px 14px', background:'rgba(255,255,255,.03)', fontSize:'11px', color:'rgba(255,255,255,.3)', borderBottom:'1px solid rgba(255,255,255,.05)' },
  msgActions: { display:'flex', gap:'6px', marginTop:'6px' },
  msgActBtn: { background:'none', border:'none', padding:'3px 6px', color:'rgba(255,255,255,.3)', fontSize:'11px', cursor:'pointer', borderRadius:'4px' },
};


async function askCerebrasStream(messages, model, onChunk, signal) {
  const resp = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST', signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CEREBRAS_KEY,
    },
    body: JSON.stringify({ model, messages, max_tokens: 4000, stream: true })
  });
  if (resp.status === 429) {
    const retry = parseInt(resp.headers.get('retry-after') || '60');
    throw new Error('RATE_LIMIT:' + retry);
  }
  if (!resp.ok) throw new Error('Cerebras error: HTTP ' + resp.status);
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

async function askGeminiStream(messages, model, onChunk, signal, imageBase64=null) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
  const sys = messages.find(m=>m.role==='system');
  const chat = messages.filter(m=>m.role!=='system');
  const contents = chat.map((m,i) => {
    const parts = [];
    if (imageBase64 && i===chat.length-1) parts.push({inlineData:{mimeType:'image/jpeg',data:imageBase64}});
    parts.push({text: m.content});
    return {role: m.role==='assistant'?'model':'user', parts};
  });
  const body = {contents, generationConfig:{maxOutputTokens:4000}};
  if (sys) body.systemInstruction = {parts:[{text:sys.content}]};
  const resp = await fetch(url, {method:'POST', signal, headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
  if (resp.status===429) throw new Error('RATE_LIMIT:60');
  if (!resp.ok) throw new Error('Gemini error: HTTP '+resp.status);
  const data = await resp.json();
  const full = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  onChunk(full);
  return full;
}

async function askOllamaStream(messages, model, onChunk, signal, host=DEFAULT_OLLAMA_HOST) {
  const ollamaModel = model.replace('ollama:','');
  const resp = await fetch((host||DEFAULT_OLLAMA_HOST)+'/api/chat', {
    method:'POST', signal,
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:ollamaModel, messages, stream:true})
  });
  if (!resp.ok) throw new Error('Ollama error: HTTP '+resp.status+' — pastikan Ollama jalan di Termux');
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const {done,value} = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split('\n').filter(Boolean)) {
      try { const d = JSON.parse(line); if(d.message?.content){full+=d.message.content;onChunk(full);} } catch {}
    }
  }
  return full;
}

async function callServer(payload) {
  try {
    const resp = await fetch(YUYU_SERVER, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    return await resp.json();
  } catch(_e) {
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
  if (action.type === 'find_symbol') {
    return await callServer({ type:'search', path:resolvePath(base, action.path||''), content:action.symbol });
  }
  if (action.type === 'mcp') {
    return callServer({ type:'mcp', tool:action.tool, action:action.action, params:action.params||{} });
  }
  if (action.type === 'create_structure') {
    const results = [];
    for (const item of (action.files||[])) {
      const r = await callServer({ type:'write', path:resolvePath(base, item.path), content:item.content||'' });
      results.push((r.ok?'✅':'❌') + ' ' + item.path);
    }
    return { ok:true, data:results.join('\n') };
  }
  if (action.type === 'lint') {
    const r = await callServer({ type:'read', path:resolvePath(base, action.path) });
    if (!r.ok) return r;
    const issues = [];
    const lines = r.data.split('\n');
    let opens=0, closes=0;
    lines.forEach((line,i) => {
      opens += (line.match(/[{[(]/g)||[]).length;
      closes += (line.match(/[}\])]/g)||[]).length;
      if (line.includes('console.log') && !action.allowLogs) issues.push('Line '+(i+1)+': console.log ditemukan');
      if (line.length > 200) issues.push('Line '+(i+1)+': baris terlalu panjang');
    });
    if (opens !== closes) issues.push('Bracket tidak balance');
    return { ok:true, data: issues.length ? issues.join('\n') : '✅ Clean' };
  }
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


function hl(code, lang='') {
  let s = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const L = lang.toLowerCase();
  if (L==='json') {
    return s
      .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g,'<span style="color:#79b8ff">$1</span>$2')
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g,': <span style="color:#98c379">$1</span>')
      .replace(/\b(true|false|null)\b/g,'<span style="color:#f97583">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g,'<span style="color:#d19a66">$1</span>');
  }
  if (L==='bash'||L==='sh') {
    return s
      .replace(/(#.*$)/gm,'<span style="color:#6a737d">$1</span>')
      .replace(/\b(echo|cd|ls|git|npm|node|export|source|if|then|fi|for|do|done|while|function|return)\b/g,'<span style="color:#c678dd">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,'<span style="color:#98c379">$1</span>')
      .replace(/(\$\w+|\$\{[^}]+\})/g,'<span style="color:#79b8ff">$1</span>');
  }
  if (L==='python'||L==='py') {
    return s
      .replace(/(#.*$)/gm,'<span style="color:#6a737d">$1</span>')
      .replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g,'<span style="color:#98c379">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,'<span style="color:#98c379">$1</span>')
      .replace(/\b(def|class|import|from|return|if|elif|else|for|while|try|except|with|as|in|not|and|or|True|False|None|lambda|yield|async|await)\b/g,'<span style="color:#c678dd">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g,'<span style="color:#d19a66">$1</span>');
  }
  if (L==='css') {
    return s
      .replace(/(\/\*[\s\S]*?\*\/)/g,'<span style="color:#6a737d">$1</span>')
      .replace(/([.#]?[\w-]+)\s*\{/g,'<span style="color:#79b8ff">$1</span>{')
      .replace(/([\w-]+)\s*:/g,'<span style="color:#b392f0">$1</span>:')
      .replace(/:\s*([^;{]+)/g,': <span style="color:#98c379">$1</span>');
  }
  // default JS/JSX/TS
  return s
    .replace(/(\/{2}.*$|\/\*[\s\S]*?\*\/)/gm,'<span style="color:#6a737d">$1</span>')
    .replace(/(`(?:[^`\\]|\\.)*`)/g,'<span style="color:#98c379">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,'<span style="color:#98c379">$1</span>')
    .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|default|async|await|try|catch|finally|class|new|this|from|of|in|typeof|instanceof|null|undefined|true|false|throw|switch|case|break|continue|extends|super|static|get|set)\b/g,'<span style="color:#c678dd">$1</span>')
    .replace(/\b([A-Z][a-zA-Z0-9]*)\b/g,'<span style="color:#79b8ff">$1</span>')
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
                table: ({node: _node,...props}) => <div style={{overflowX:'auto',margin:'8px 0'}}><table style={{width:'100%',borderCollapse:'collapse',background:'rgba(255,255,255,.02)',borderRadius:'8px'}} {...props} /></div>,
                th: ({node: _node,...props}) => <th style={{padding:'6px 12px',fontSize:'11px',color:'rgba(255,255,255,.45)',fontWeight:'600',borderBottom:'1px solid rgba(255,255,255,.12)',textAlign:'left',whiteSpace:'nowrap',minWidth:'120px'}} {...props} />,
                td: ({node: _node,...props}) => <td style={{padding:'6px 12px',fontSize:'12px',borderBottom:'1px solid rgba(255,255,255,.04)',verticalAlign:'top',minWidth:'120px'}} {...props} />,
                h1: ({node: _node,...props}) => <div style={{fontSize:'15px',fontWeight:'700',color:'#f0f0f0',margin:'14px 0 6px'}} {...props} />,
                h2: ({node: _node,...props}) => <div style={{fontSize:'14px',fontWeight:'700',color:'#f0f0f0',margin:'12px 0 5px'}} {...props} />,
                h3: ({node: _node,...props}) => <div style={{fontSize:'13px',fontWeight:'700',color:'#e8e8e8',margin:'10px 0 4px'}} {...props} />,
                code: ({node: _node, inline,...props}) => inline ? <code style={{background:'rgba(255,255,255,.1)',padding:'1px 5px',borderRadius:'3px',fontFamily:'monospace',fontSize:'12px',color:'#e8e8e8'}} {...props} /> : <pre style={{background:'#111114',padding:'10px 12px',borderRadius:'8px',overflow:'auto',fontSize:'12px',margin:'6px 0'}} {...props} />,
                hr: ({node: _node,...props}) => <hr style={{border:'none',borderTop:'1px solid rgba(255,255,255,.08)',margin:'10px 0'}} />,
                strong: ({node: _node,...props}) => <strong style={{color:'#f0f0f0'}} {...props} />,
                li: ({node: _node,...props}) => <li style={{margin:'2px 0',color:'#e0e0e0'}} {...props} />,
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
            <pre style={S.codePre} dangerouslySetInnerHTML={{ __html: hl(p.c, p.lang) }} />
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


function MsgBubble({ msg, onApprove, onPlanApprove, onRetry, onContinue, isLast, onAutoFix }) {
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
            <div style={{margin:'8px 0'}}>
              {actions.filter(a=>a.type==='write_file'&&!a.executed).map((a,i)=>(
                <div key={i} style={{marginBottom:'6px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'7px',overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 10px'}}>
                    <span style={{fontSize:'11px',color:'rgba(255,255,255,.5)',fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>✏️ {a.path}</span>
                    <span style={{fontSize:'9px',color:'rgba(255,255,255,.2)'}}>{a.content?(Math.round(a.content.length/1024*10)/10)+'KB':''}</span>
                    <button onClick={()=>onApprove(true,a.path)} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'10px',cursor:'pointer'}}>✓ apply</button>
                    <button onClick={()=>onApprove(false,a.path)} style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'5px',padding:'2px 8px',color:'#f87171',fontSize:'10px',cursor:'pointer'}}>✗</button>
                  </div>
                  {a.content&&(
                    <div style={{padding:'4px 10px 6px',borderTop:'1px solid rgba(255,255,255,.04)',fontSize:'10px',fontFamily:'monospace',color:'rgba(255,255,255,.3)',maxHeight:'60px',overflow:'hidden'}}>
                      {a.content.split('\n').slice(0,4).map((l,j)=><div key={j} style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l||' '}</div>)}
                      {a.content.split('\n').length>4&&<div style={{color:'rgba(255,255,255,.15)'}}>... {a.content.split('\n').length} baris total</div>}
                    </div>
                  )}
                </div>
              ))}
              {actions.filter(a=>a.type==='write_file'&&!a.executed).length>1&&(
                <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
                  <button onClick={()=>onApprove(true,'__all__')} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'7px',padding:'5px 14px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}>✓ Tulis semua</button>
                  <button onClick={()=>onApprove(false,'__all__')} style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'7px',padding:'5px 14px',color:'#f87171',fontSize:'11px',cursor:'pointer'}}>✗ Batal semua</button>
                </div>
              )}
            </div>
          )}
          {hasPlan && onPlanApprove && (
            <div style={{ display:'flex', gap:'8px', margin:'8px 0' }}>
              <button onClick={() => onPlanApprove(true)} style={{ background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.3)', borderRadius:'8px', padding:'6px 16px', color:'#a78bfa', fontSize:'12px', cursor:'pointer' }}>✓ Approve Plan</button>
              <button onClick={() => onPlanApprove(false)} style={{ background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.15)', borderRadius:'8px', padding:'6px 16px', color:'#f87171', fontSize:'12px', cursor:'pointer' }}>✗ Ubah Plan</button>
            </div>
          )}
          {isLast && onAutoFix && msg.role==='assistant' && (msg.content.includes('❌')||msg.content.includes('Error:')) && (
            <button onClick={onAutoFix} style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'8px',padding:'5px 14px',color:'#f87171',fontSize:'12px',cursor:'pointer',alignSelf:'flex-start',marginTop:'4px'}}>🔧 Auto-fix</button>
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

function FileTree({ folder, onSelectFile, selectedFile, onRefresh }) {
  const [tree, setTree] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null); // {path, isDir, x, y}
  const [renaming, setRenaming] = useState(null);
  const [creating, setCreating] = useState(null); // {parentPath, isDir}
  const [newName, setNewName] = useState('');

  async function load() {
    if (!folder) return;
    setLoading(true);
    const r = await callServer({ type:'list', path:folder });
    if (r.ok && Array.isArray(r.data)) setTree(r.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [folder]);

  async function toggleDir(fullPath) {
    if (expanded[fullPath]) { setExpanded(e => ({ ...e, [fullPath]:null })); return; }
    const r = await callServer({ type:'list', path:fullPath });
    if (r.ok && Array.isArray(r.data)) setExpanded(e => ({ ...e, [fullPath]:r.data }));
  }

  async function doRename(oldPath) {
    if (!newName.trim()) { setRenaming(null); return; }
    const parentPath = oldPath.split('/').slice(0,-1).join('/');
    const newPath = parentPath + '/' + newName.trim();
    await callServer({type:'exec', path:folder, command:`mv "${oldPath}" "${newPath}"`});
    setRenaming(null); setNewName(''); load();
  }

  async function doCreate(parentPath) {
    if (!newName.trim()) { setCreating(null); return; }
    const newPath = parentPath + '/' + newName.trim();
    if (creating.isDir) {
      await callServer({type:'exec', path:folder, command:`mkdir -p "${newPath}"`});
    } else {
      await callServer({type:'write', path:newPath, content:''});
    }
    setCreating(null); setNewName(''); load();
    if (!creating.isDir) onSelectFile(newPath);
  }

  async function doDelete(path) {
    await callServer({type:'exec', path:folder, command:`rm -rf "${path}"`});
    setCtxMenu(null); load();
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
            {renaming === fullPath ? (
              <div style={{padding:'2px 6px 2px '+(8+depth*12)+'px',display:'flex',gap:'4px'}}>
                <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')doRename(fullPath);if(e.key==='Escape'){setRenaming(null);setNewName('');}}}
                  style={{flex:1,background:'rgba(255,255,255,.1)',border:'1px solid rgba(124,58,237,.4)',borderRadius:'3px',padding:'1px 5px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace'}}/>
              </div>
            ) : (
              <div onClick={() => item.isDir ? toggleDir(fullPath) : onSelectFile(fullPath)}
                onContextMenu={e=>{e.preventDefault();setCtxMenu({path:fullPath,isDir:item.isDir,x:e.clientX,y:e.clientY});}}
                style={{ display:'flex', alignItems:'center', gap:'4px', padding:'3px 6px 3px '+(8+depth*12)+'px', cursor:'pointer', borderRadius:'4px', background:isSelected?'rgba(124,58,237,.2)':'transparent', color:isSelected?'#a78bfa':item.isDir?'rgba(255,255,255,.7)':'rgba(255,255,255,.55)', fontSize:'12px', userSelect:'none' }}
                onMouseEnter={e => !isSelected&&(e.currentTarget.style.background='rgba(255,255,255,.04)')}
                onMouseLeave={e => !isSelected&&(e.currentTarget.style.background=isSelected?'rgba(124,58,237,.2)':'transparent')}>
                <span style={{fontSize:'9px',flexShrink:0,width:'10px'}}>{item.isDir?(isExp?'▾':'▸'):''}</span>
                <span style={{fontSize:'11px',flexShrink:0}}>{item.isDir?'📁':getFileIcon(item.name)}</span>
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</span>
              </div>
            )}
            {item.isDir && isExp && renderItems(isExp, fullPath, depth+1)}
            {creating && creating.parentPath === fullPath && (
              <div style={{padding:'2px 6px 2px '+(8+(depth+1)*12)+'px',display:'flex',gap:'4px'}}>
                <span style={{fontSize:'11px'}}>{creating.isDir?'📁':'📄'}</span>
                <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} placeholder={creating.isDir?'folder name':'file name'}
                  onKeyDown={e=>{if(e.key==='Enter')doCreate(fullPath);if(e.key==='Escape'){setCreating(null);setNewName('');}}}
                  style={{flex:1,background:'rgba(255,255,255,.1)',border:'1px solid rgba(74,222,128,.4)',borderRadius:'3px',padding:'1px 5px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace'}}/>
              </div>
            )}
          </div>
        );
      });
  }

  return (
    <div style={{height:'100%',overflowY:'auto',padding:'4px 0',position:'relative'}} onClick={()=>ctxMenu&&setCtxMenu(null)}>
      {/* New file/folder buttons */}
      <div style={{padding:'3px 8px',display:'flex',gap:'4px',borderBottom:'1px solid rgba(255,255,255,.04)',marginBottom:'2px'}}>
        <button onClick={()=>{setCreating({parentPath:folder,isDir:false});setNewName('');}} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:'11px',cursor:'pointer',padding:'1px 4px'}}>+ file</button>
        <button onClick={()=>{setCreating({parentPath:folder,isDir:true});setNewName('');}} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:'11px',cursor:'pointer',padding:'1px 4px'}}>+ folder</button>
        <button onClick={load} style={{background:'none',border:'none',color:'rgba(255,255,255,.2)',fontSize:'10px',cursor:'pointer',padding:'1px 4px',marginLeft:'auto'}}>↺</button>
      </div>
      {creating && creating.parentPath === folder && (
        <div style={{padding:'2px 8px',display:'flex',gap:'4px',alignItems:'center'}}>
          <span style={{fontSize:'11px'}}>{creating.isDir?'📁':'📄'}</span>
          <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} placeholder={creating.isDir?'folder name':'file name'}
            onKeyDown={e=>{if(e.key==='Enter')doCreate(folder);if(e.key==='Escape'){setCreating(null);setNewName('');}}}
            style={{flex:1,background:'rgba(255,255,255,.1)',border:'1px solid rgba(74,222,128,.4)',borderRadius:'3px',padding:'2px 6px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace'}}/>
        </div>
      )}
      {loading && <div style={{padding:'8px 12px',fontSize:'11px',color:'rgba(255,255,255,.3)'}}>Loading...</div>}
      {tree && renderItems(tree, folder, 0)}
      {/* Context Menu */}
      {ctxMenu && (
        <div style={{position:'fixed',top:ctxMenu.y,left:ctxMenu.x,background:'#1a1a1e',border:'1px solid rgba(255,255,255,.12)',borderRadius:'8px',padding:'4px',zIndex:999,minWidth:'140px',boxShadow:'0 8px 24px rgba(0,0,0,.5)'}}>
          {ctxMenu.isDir&&<div onClick={()=>{setCreating({parentPath:ctxMenu.path,isDir:false});setNewName('');setCtxMenu(null);}} style={{padding:'6px 12px',fontSize:'12px',color:'rgba(255,255,255,.7)',cursor:'pointer',borderRadius:'4px'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>📄 New file</div>}
          {ctxMenu.isDir&&<div onClick={()=>{setCreating({parentPath:ctxMenu.path,isDir:true});setNewName('');setCtxMenu(null);}} style={{padding:'6px 12px',fontSize:'12px',color:'rgba(255,255,255,.7)',cursor:'pointer',borderRadius:'4px'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>📁 New folder</div>}
          <div onClick={()=>{setRenaming(ctxMenu.path);setNewName(ctxMenu.path.split('/').pop());setCtxMenu(null);}} style={{padding:'6px 12px',fontSize:'12px',color:'rgba(255,255,255,.7)',cursor:'pointer',borderRadius:'4px'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>✏️ Rename</div>
          <div onClick={()=>doDelete(ctxMenu.path)} style={{padding:'6px 12px',fontSize:'12px',color:'#f87171',cursor:'pointer',borderRadius:'4px'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(248,113,113,.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>🗑 Delete</div>
        </div>
      )}
    </div>
  );
}


function Terminal({ folder, cmdHistory, addHistory }) {
  const [cmd, setCmd] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selIdx, setSelIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const presets = ['npm run lint', 'git status', 'git push', 'ls -la'];
  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') { setSelIdx(s => (s + 1) % suggestions.length); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { setSelIdx(s => (s - 1 + suggestions.length) % suggestions.length); e.preventDefault(); }
      else if (e.key === 'Tab') { setCmd(suggestions[selIdx]); setSuggestions([]); e.preventDefault(); }
    }
    if (e.key === 'Enter' && cmd.trim()) run();
  };
  const onTextChange = (v) => {
    setCmd(v);
    const matches = [...new Set([...presets, ...(cmdHistory||[])])].filter(x => x.startsWith(v) && x !== v).slice(0, 5);
    setSuggestions(v ? matches : []);
    setSelIdx(0);
  };
  async function run() {
    setLoading(true); setSuggestions([]);
    try {
      if (addHistory) addHistory(cmd);
      const res = await callServer({ type:'exec', path:folder, command:cmd });
      setOutput(res.output || res.error || 'Done.');
      setCmd('');
    } catch (e) { setOutput(e.message); } finally { setLoading(false); }
  }
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#0a0a0c',fontSize:'12px',fontFamily:'monospace',padding:'8px',borderTop:'1px solid rgba(255,255,255,.08)'}}>
      <div style={{flex:1,overflowY:'auto',marginBottom:'8px',color:'rgba(255,255,255,.65)',whiteSpace:'pre-wrap',wordBreak:'break-word',lineHeight:'1.6'}}>
        {output}{loading&&<span style={{opacity:.5}}>···</span>}
      </div>
      <div style={{position:'relative',display:'flex',alignItems:'center',gap:'8px',borderTop:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.03)',padding:'6px 8px',borderRadius:'6px'}}>
        {suggestions.length>0&&(
          <div style={{position:'absolute',bottom:'100%',left:0,right:0,background:'#1e2028',border:'1px solid rgba(255,255,255,.1)',borderRadius:'8px 8px 0 0',boxShadow:'0 -8px 24px rgba(0,0,0,.5)',overflow:'hidden',marginBottom:'2px'}}>
            {suggestions.map((s,i)=>(
              <div key={i}
                style={{padding:'7px 12px',fontSize:'11px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.05)',background:i===selIdx?'rgba(49,109,202,.5)':'transparent',color:i===selIdx?'#fff':'rgba(255,255,255,.5)'}}
                onClick={()=>{setCmd(s);setSuggestions([]);}}>
                <span style={{opacity:.5,marginRight:'8px'}}>❯</span>{s}
              </div>
            ))}
          </div>
        )}
        <span style={{color:'#4ade80'}}>➜</span>
        <input
          style={{background:'transparent',border:'none',outline:'none',flex:1,color:'rgba(255,255,255,.85)',fontSize:'12px',fontFamily:'monospace'}}
          value={cmd}
          onChange={e=>onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type command...'
        />
      </div>
    </div>
  );
}


function SearchBar({ folder, onSelectFile, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  async function doSearch() {
    if (!query.trim()) return;
    setSearching(true);
    const r = await callServer({ type:'search', path:folder, content:query });
    if (r.ok) setResults((r.data||'').split('\n').filter(Boolean));
    setSearching(false);
  }
  return (<div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.88)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
    <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
      <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()}
        placeholder="Cari di semua file..."
        style={{flex:1,background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',borderRadius:'8px',padding:'8px 12px',color:'#f0f0f0',fontSize:'13px',outline:'none'}}/>
      <button onClick={doSearch} disabled={searching} style={{background:'#7c3aed',border:'none',borderRadius:'8px',padding:'8px 14px',color:'white',fontSize:'12px',cursor:'pointer'}}>{searching?'···':'🔍'}</button>
      <button onClick={onClose} style={{background:'rgba(255,255,255,.08)',border:'none',borderRadius:'8px',padding:'8px 12px',color:'rgba(255,255,255,.5)',fontSize:'14px',cursor:'pointer'}}>×</button>
    </div>
    <div style={{flex:1,overflowY:'auto'}}>
      {results.length===0&&!searching&&query&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Tidak ada hasil</div>}
      {results.map((line,i)=>{
        const m=line.match(/^(.+?):(d+):s*(.*)/);
        if(!m) return null;
        const [,file,lineNum,content]=m;
        return (<div key={i} onClick={()=>{onSelectFile(folder+'/'+file);onClose();}}
          style={{padding:'8px 10px',borderRadius:'6px',cursor:'pointer',marginBottom:'2px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)'}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'}
          onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'}>
          <div style={{fontSize:'11px',color:'#a78bfa',fontFamily:'monospace',marginBottom:'2px'}}>{file}:{lineNum}</div>
          <div style={{fontSize:'12px',color:'rgba(255,255,255,.6)',fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{content.trim()}</div>
        </div>);
      })}
    </div>
  </div>);
}

function UndoBar({ history, onUndo }) {
  if (!history||history.length===0) return null;
  return (<div style={{padding:'4px 12px',background:'rgba(251,191,36,.05)',borderBottom:'1px solid rgba(251,191,36,.1)',display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
    <span style={{fontSize:'11px',color:'rgba(251,191,36,.6)'}}>✏️ {history[history.length-1]?.path?.split('/').pop()} diubah</span>
    <button onClick={onUndo} style={{background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.2)',borderRadius:'5px',padding:'2px 8px',color:'rgba(251,191,36,.8)',fontSize:'10px',cursor:'pointer',marginLeft:'auto'}}>↩ Undo</button>
  </div>);
}

// ─── GIT DIFF VIEWER ──────────────────────────────────────────────────────────
function GitDiffPanel({ folder, onClose }) {
  const [diff, setDiff] = useState('');
  const [loading, setLoading] = useState(true);
  const [staged, setStaged] = useState(false);

  async function load(s) {
    setLoading(true);
    const cmd = s ? 'git diff --cached' : 'git diff';
    const r = await callServer({ type:'exec', path:folder, command:cmd });
    setDiff(r.data || '(tidak ada perubahan)');
    setLoading(false);
  }

  useEffect(() => { load(false); }, []);

  function renderDiff(text) {
    return text.split('\n').map((line, i) => {
      let color = 'rgba(255,255,255,.5)';
      let bg = 'transparent';
      if (line.startsWith('+++') || line.startsWith('---')) color = 'rgba(255,255,255,.3)';
      else if (line.startsWith('+')) { color = '#4ade80'; bg = 'rgba(74,222,128,.04)'; }
      else if (line.startsWith('-')) { color = '#f87171'; bg = 'rgba(248,113,113,.04)'; }
      else if (line.startsWith('@@')) { color = '#a78bfa'; bg = 'rgba(124,58,237,.06)'; }
      else if (line.startsWith('diff ')) { color = '#60a5fa'; bg = 'rgba(96,165,250,.04)'; }
      return <div key={i} style={{ color, background:bg, fontFamily:'monospace', fontSize:'11px', lineHeight:'1.6', padding:'0 12px', whiteSpace:'pre-wrap', wordBreak:'break-all' }}>{line||' '}</div>;
    });
  }

  return (
    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,.02)',flexShrink:0}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:'#f0f0f0',flex:1}}>◐ Git Diff</span>
        <button onClick={()=>{setStaged(false);load(false);}} style={{background:!staged?'rgba(255,255,255,.1)':'none',border:'1px solid rgba(255,255,255,.1)',borderRadius:'5px',padding:'2px 8px',color:!staged?'#f0f0f0':'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer'}}>unstaged</button>
        <button onClick={()=>{setStaged(true);load(true);}} style={{background:staged?'rgba(255,255,255,.1)':'none',border:'1px solid rgba(255,255,255,.1)',borderRadius:'5px',padding:'2px 8px',color:staged?'#f0f0f0':'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer'}}>staged</button>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'8px 0'}}>
        {loading ? <div style={{padding:'16px',color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Loading···</div> : renderDiff(diff)}
      </div>
    </div>
  );
}


function FileEditor({ path, content, onSave, onClose }) {
  const [text, setText] = useState(content || '');
  const [saved, setSaved] = useState(true);
  const [cursor, setCursor] = useState({ line:1, col:1 });
  const [showInlineDiff, setShowInlineDiff] = useState(false);
  const textareaRef = useRef(null);

  function updateCursor(e) {
    const ta = e.target;
    const val = ta.value.slice(0, ta.selectionStart);
    const lines = val.split('\n');
    setCursor({ line: lines.length, col: lines[lines.length-1].length + 1 });
  }

  async function save() {
    await onSave(text);
    setSaved(true);
  }

  function computeInlineDiff() {
    const oldLines = (content||'').split('\n');
    const newLines = text.split('\n');
    const result = [];
    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
      const o = oldLines[i];
      const n = newLines[i];
      if (o === n) result.push({type:'same', text:n||''});
      else if (o === undefined) result.push({type:'add', text:n});
      else if (n === undefined) result.push({type:'del', text:o});
      else { result.push({type:'del',text:o}); result.push({type:'add',text:n}); }
    }
    return result;
  }

  return (<div style={{display:'flex',flexDirection:'column',height:'100%'}}>
    <div style={{padding:'5px 12px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,.02)',flexShrink:0}}>
      <span style={{fontSize:'11px',color:'rgba(255,255,255,.4)',fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{path}</span>
      {!saved&&<span style={{fontSize:'10px',color:'rgba(251,191,36,.6)'}}>● unsaved</span>}
      <span style={{fontSize:'10px',color:'rgba(255,255,255,.25)',fontFamily:'monospace'}}>{cursor.line}:{cursor.col}</span>
      {!saved&&<button onClick={()=>setShowInlineDiff(!showInlineDiff)} style={{background:showInlineDiff?'rgba(96,165,250,.15)':'rgba(255,255,255,.04)',border:'1px solid rgba(96,165,250,.2)',borderRadius:'5px',padding:'2px 6px',color:'rgba(96,165,250,.8)',fontSize:'10px',cursor:'pointer',flexShrink:0}}>◐ diff</button>}
      <button onClick={save} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'10px',cursor:'pointer',flexShrink:0}}>💾 Save</button>
      <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:'14px',cursor:'pointer',flexShrink:0}}>×</button>
    </div>
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>
      {showInlineDiff ? (
        <div style={{flex:1,overflow:'auto',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.6',padding:'8px 0'}}>
          {computeInlineDiff().map((line,i)=>(
            <div key={i} style={{display:'flex',background:line.type==='add'?'rgba(74,222,128,.06)':line.type==='del'?'rgba(248,113,113,.06)':'transparent',padding:'0 12px'}}>
              <span style={{color:line.type==='add'?'#4ade80':line.type==='del'?'#f87171':'rgba(255,255,255,.2)',width:'14px',flexShrink:0,userSelect:'none'}}>{line.type==='add'?'+':line.type==='del'?'-':' '}</span>
              <span style={{color:line.type==='add'?'#4ade80':line.type==='del'?'#f87171':'rgba(255,255,255,.7)',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{line.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{padding:'8px 6px',color:'rgba(255,255,255,.2)',textAlign:'right',userSelect:'none',borderRight:'1px solid rgba(255,255,255,.05)',minWidth:'36px',flexShrink:0,fontSize:'11px',lineHeight:'1.6',fontFamily:'monospace',overflowY:'hidden',background:'rgba(255,255,255,.01)'}}>
            {text.split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
          </div>
          <textarea ref={textareaRef} value={text}
            onChange={e=>{setText(e.target.value);setSaved(false);}}
            onKeyUp={updateCursor} onClick={updateCursor}
            onKeyDown={e=>{
              if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();save();return;}
              if(e.key==='Tab'){e.preventDefault();const s=e.target.selectionStart;const val=text.slice(0,s)+'  '+text.slice(e.target.selectionEnd);setText(val);setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+2;},0);}
            }}
            style={{flex:1,background:'#0d0d0e',border:'none',outline:'none',color:'rgba(255,255,255,.85)',fontSize:'12px',lineHeight:'1.6',fontFamily:'monospace',padding:'8px 12px',resize:'none',whiteSpace:'pre',overflowWrap:'normal',overflowX:'auto'}}
            spellCheck={false}
          />
        </>
      )}
    </div>
  </div>);
}

// ─── FILE HISTORY ─────────────────────────────────────────────────────────────
function FileHistoryPanel({ folder, filePath, onClose }) {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(null);

  useEffect(() => {
    const rel = filePath.replace(folder+'/', '');
    callServer({type:'exec', path:folder, command:`git log --oneline -20 -- "${rel}"`}).then(r => {
      if (r.ok && r.data) {
        const lines = r.data.trim().split('\n').filter(Boolean).map(l => {
          const [hash, ...rest] = l.split(' ');
          return { hash, msg: rest.join(' ') };
        });
        setCommits(lines);
      }
      setLoading(false);
    });
  }, [filePath]);

  async function preview(hash) {
    const rel = filePath.replace(folder+'/', '');
    const r = await callServer({type:'exec', path:folder, command:`git show ${hash}:"${rel}" 2>/dev/null`});
    if (r.ok) setPreviewing({ hash, content: r.data });
  }

  async function restore(hash) {
    const rel = filePath.replace(folder+'/', '');
    await callServer({type:'exec', path:folder, command:`git checkout ${hash} -- "${rel}"`});
    onClose();
  }

  return (
    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex'}}>
      <div style={{width:'200px',borderRight:'1px solid rgba(255,255,255,.08)',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center'}}>
          <span style={{fontSize:'12px',fontWeight:'600',color:'#f0f0f0',flex:1}}>📜 File History</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'14px',cursor:'pointer'}}>×</button>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {loading&&<div style={{padding:'8px',color:'rgba(255,255,255,.3)',fontSize:'11px'}}>Loading···</div>}
          {commits.map(c=>(
            <div key={c.hash} onClick={()=>preview(c.hash)}
              style={{padding:'7px 10px',borderBottom:'1px solid rgba(255,255,255,.04)',cursor:'pointer',background:previewing?.hash===c.hash?'rgba(124,58,237,.15)':'transparent'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
              onMouseLeave={e=>e.currentTarget.style.background=previewing?.hash===c.hash?'rgba(124,58,237,.15)':'transparent'}>
              <div style={{fontSize:'10px',color:'#a78bfa',fontFamily:'monospace'}}>{c.hash}</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.6)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.msg}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {previewing ? (
          <>
            <div style={{padding:'6px 12px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',gap:'8px',alignItems:'center',flexShrink:0}}>
              <span style={{fontSize:'11px',color:'rgba(255,255,255,.4)',fontFamily:'monospace',flex:1}}>{previewing.hash}</span>
              <button onClick={()=>restore(previewing.hash)} style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.2)',borderRadius:'5px',padding:'2px 8px',color:'#f87171',fontSize:'10px',cursor:'pointer'}}>⏪ Restore</button>
            </div>
            <div style={{flex:1,overflow:'auto',display:'flex',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.6'}}>
              <div style={{padding:'8px 6px',color:'rgba(255,255,255,.2)',textAlign:'right',userSelect:'none',borderRight:'1px solid rgba(255,255,255,.05)',minWidth:'32px',flexShrink:0}}>
                {(previewing.content||'').split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
              </div>
              <pre style={{margin:0,padding:'8px 12px',whiteSpace:'pre-wrap',wordBreak:'break-word',color:'rgba(255,255,255,.7)',flex:1}}>{previewing.content}</pre>
            </div>
          </>
        ) : (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,.2)',fontSize:'12px'}}>Pilih commit untuk preview</div>
        )}
      </div>
    </div>
  );
}

// ─── CUSTOM ACTIONS ───────────────────────────────────────────────────────────
function CustomActionsPanel({ folder, onRun, onClose }) {
  const [actions, setActions] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newCmd, setNewCmd] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Preferences.get({key:'yc_custom_actions'}).then(r => {
      if (r.value) try { setActions(JSON.parse(r.value)); } catch {}
    });
  }, []);

  function save(list) {
    setActions(list);
    Preferences.set({key:'yc_custom_actions', value:JSON.stringify(list)});
  }

  function add() {
    if (!newLabel.trim() || !newCmd.trim()) return;
    save([...actions, {id:Date.now(), label:newLabel.trim(), cmd:newCmd.trim()}]);
    setNewLabel(''); setNewCmd(''); setAdding(false);
  }

  return (
    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
        <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>⚡ Custom Actions</span>
        <button onClick={()=>setAdding(!adding)} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'10px',cursor:'pointer',marginRight:'8px'}}>+ New</button>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      {adding&&(
        <div style={{display:'flex',flexDirection:'column',gap:'6px',marginBottom:'10px',padding:'10px',background:'rgba(255,255,255,.03)',borderRadius:'8px'}}>
          <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Label (e.g. Deploy)"
            style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'5px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none'}}/>
          <input value={newCmd} onChange={e=>setNewCmd(e.target.value)} placeholder="Command (e.g. npm run deploy)"
            style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'5px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
          <button onClick={add} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'6px',padding:'5px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}>Simpan</button>
        </div>
      )}
      <div style={{flex:1,overflowY:'auto'}}>
        {actions.length===0&&<div style={{color:'rgba(255,255,255,.2)',fontSize:'12px'}}>Belum ada custom action. Tambah shortcut command favoritmu~</div>}
        {actions.map(a=>(
          <div key={a.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',marginBottom:'4px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'7px'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,.8)',fontWeight:'500'}}>{a.label}</div>
              <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)',fontFamily:'monospace'}}>{a.cmd}</div>
            </div>
            <button onClick={()=>{onRun(a.cmd);onClose();}} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'5px',padding:'2px 8px',color:'#a78bfa',fontSize:'10px',cursor:'pointer'}}>▶ Run</button>
            <button onClick={()=>save(actions.filter(x=>x.id!==a.id))} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer'}}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── KEYBOARD SHORTCUTS PANEL (upgraded) ─────────────────────────────────────
function ShortcutsPanel({ onClose }) {
  const shortcuts = [
    ['Ctrl+S', 'Save file (di editor)'],
    ['Tab', 'Indent 2 spasi (di editor)'],
    ['↑↓ (input kosong)', 'History command'],
    ['Enter', 'Kirim pesan'],
    ['Shift+Enter', 'Newline di input'],
    ['☰', 'Toggle sidebar'],
    ['⌨', 'Toggle terminal'],
    ['🔍', 'Search across files'],
    ['+ Context', 'Tambah file ke context'],
    ['📜 log', 'Git log file ini'],
    ['Tanya Yuyu', 'Tanya tentang file ini'],
  ];
  return (<div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.88)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
    <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
      <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>⌨ Keyboard Shortcuts</span>
      <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
    </div>
    {shortcuts.map(([key,desc],i)=>(
      <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
        <code style={{background:'rgba(255,255,255,.08)',padding:'2px 8px',borderRadius:'4px',fontSize:'12px',color:'#a78bfa',fontFamily:'monospace',flexShrink:0,minWidth:'120px'}}>{key}</code>
        <span style={{fontSize:'12px',color:'rgba(255,255,255,.55)'}}>{desc}</span>
      </div>
    ))}
  </div>);
}

// ─── GIT BLAME ────────────────────────────────────────────────────────────────
function GitBlamePanel({ folder, filePath, onClose }) {
  const [blame, setBlame] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const rel = filePath.replace(folder+'/', '');
    callServer({type:'exec', path:folder, command:`git blame --line-porcelain "${rel}" 2>/dev/null | grep -E "^(author |author-time |summary )" | paste - - - | head -200`}).then(r => {
      if (!r.ok || !r.data) { setLoading(false); return; }
      const lines = r.data.trim().split('\n').map(line => {
        const parts = line.split('\t');
        const author = (parts[0]||'').replace('author ','');
        const time = new Date(parseInt((parts[1]||'').replace('author-time ',''))*1000).toLocaleDateString('id');
        const summary = (parts[2]||'').replace('summary ','').slice(0,30);
        return { author, time, summary };
      });
      setBlame(lines);
      setLoading(false);
    });
  }, [filePath]);
  return (
    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',background:'rgba(255,255,255,.02)',flexShrink:0}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:'#f0f0f0',flex:1}}>👁 Git Blame — {filePath.split('/').pop()}</span>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      <div style={{flex:1,overflowY:'auto',fontFamily:'monospace',fontSize:'11px'}}>
        {loading && <div style={{padding:'16px',color:'rgba(255,255,255,.3)'}}>Loading···</div>}
        {blame.map((b,i) => (
          <div key={i} style={{display:'flex',gap:'8px',padding:'2px 12px',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <span style={{color:'rgba(99,102,241,.7)',minWidth:'70px',flexShrink:0}}>{b.time}</span>
            <span style={{color:'rgba(74,222,128,.6)',minWidth:'80px',flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.author}</span>
            <span style={{color:'rgba(255,255,255,.35)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.summary}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SNIPPET LIBRARY ──────────────────────────────────────────────────────────
function SnippetLibrary({ onInsert, onClose }) {
  const [snippets, setSnippets] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Preferences.get({key:'yc_snippets'}).then(r => {
      if (r.value) try { setSnippets(JSON.parse(r.value)); } catch {}
    });
  }, []);

  function save(list) {
    setSnippets(list);
    Preferences.set({key:'yc_snippets', value:JSON.stringify(list)});
  }

  function addSnippet() {
    if (!newTitle.trim() || !newCode.trim()) return;
    save([...snippets, {id:Date.now(), title:newTitle.trim(), code:newCode.trim()}]);
    setNewTitle(''); setNewCode(''); setAdding(false);
  }

  return (
    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,.02)',flexShrink:0}}>
        <span style={{fontSize:'13px',fontWeight:'600',color:'#f0f0f0',flex:1}}>✦ Snippet Library</span>
        <button onClick={()=>setAdding(!adding)} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}>+ New</button>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      {adding && (
        <div style={{padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',flexDirection:'column',gap:'6px',flexShrink:0}}>
          <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Snippet title..."
            style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'5px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none'}}/>
          <textarea value={newCode} onChange={e=>setNewCode(e.target.value)} placeholder="Code..." rows={4}
            style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'5px 10px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace',resize:'none'}}/>
          <button onClick={addSnippet} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'6px',padding:'5px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}>Simpan</button>
        </div>
      )}
      <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
        {snippets.length===0 && <div style={{color:'rgba(255,255,255,.2)',fontSize:'12px',padding:'8px'}}>Belum ada snippet~</div>}
        {snippets.map(s => (
          <div key={s.id} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px',padding:'8px 10px',marginBottom:'6px'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'4px'}}>
              <span style={{fontSize:'12px',color:'rgba(255,255,255,.7)',fontWeight:'500',flex:1}}>{s.title}</span>
              <button onClick={()=>onInsert(s.code)} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'4px',padding:'1px 7px',color:'#a78bfa',fontSize:'10px',cursor:'pointer',marginRight:'4px'}}>insert</button>
              <button onClick={()=>save(snippets.filter(x=>x.id!==s.id))} style={{background:'none',border:'none',color:'rgba(248,113,113,.5)',fontSize:'12px',cursor:'pointer'}}>×</button>
            </div>
            <pre style={{margin:0,fontSize:'10px',color:'rgba(255,255,255,.4)',fontFamily:'monospace',whiteSpace:'pre-wrap',wordBreak:'break-all',maxHeight:'60px',overflow:'hidden'}}>{s.code}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── VOICE INPUT ──────────────────────────────────────────────────────────────
function VoiceBtn({ onResult, disabled }) {
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  function toggle() {
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition tidak tersedia di browser ini'); return; }
    const r = new SR();
    r.lang = 'id-ID';
    r.interimResults = false;
    r.onresult = e => { onResult(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }

  return (
    <button onClick={toggle} disabled={disabled}
      style={{background:listening?'rgba(248,113,113,.2)':'rgba(255,255,255,.04)',border:'1px solid '+(listening?'rgba(248,113,113,.4)':'rgba(255,255,255,.08)'),borderRadius:'10px',padding:'8px 10px',color:listening?'#f87171':'rgba(255,255,255,.3)',fontSize:'13px',cursor:'pointer',flexShrink:0,transition:'all .2s'}}>
      {listening ? '⏹' : '🎤'}
    </button>
  );
}

// ─── THEME BUILDER ────────────────────────────────────────────────────────────
function ThemeBuilder({ current, onSave, onClose }) {
  const [t, setT] = useState({...current});
  const fields = [
    {key:'bg', label:'Background'},
    {key:'bg2', label:'Surface'},
    {key:'text', label:'Text'},
    {key:'accent', label:'Accent'},
    {key:'border', label:'Border'},
  ];
  return (
    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
        <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🎨 Theme Builder</span>
        <button onClick={()=>onSave(t)} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 10px',color:'#4ade80',fontSize:'11px',cursor:'pointer',marginRight:'8px'}}>Simpan</button>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        {fields.map(f=>(
          <div key={f.key} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
            <span style={{fontSize:'12px',color:'rgba(255,255,255,.6)',width:'70px',flexShrink:0}}>{f.label}</span>
            <input type="color" value={t[f.key]?.startsWith('#')?t[f.key]:'#1a1a2e'}
              onChange={e=>setT(prev=>({...prev,[f.key]:e.target.value}))}
              style={{width:'36px',height:'28px',border:'none',borderRadius:'4px',cursor:'pointer',padding:0,background:'none'}}/>
            <input value={t[f.key]||''} onChange={e=>setT(prev=>({...prev,[f.key]:e.target.value}))}
              style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'4px 8px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace'}}/>
          </div>
        ))}
        <div style={{marginTop:'16px',padding:'12px',borderRadius:'8px',background:t.bg,border:'1px solid '+(t.border||'rgba(255,255,255,.1)')}}>
          <div style={{fontSize:'12px',color:t.text,marginBottom:'4px',fontWeight:'600'}}>Preview</div>
          <div style={{fontSize:'11px',color:t.text,opacity:.6}}>Ini tampilan dengan theme-mu~</div>
          <div style={{display:'inline-block',background:t.accent,borderRadius:'4px',padding:'2px 8px',fontSize:'10px',color:'white',marginTop:'6px'}}>Button</div>
        </div>
      </div>
    </div>
  );
}

// ─── COMMAND PALETTE ──────────────────────────────────────────────────────────
function CommandPalette({ onClose, onRun, folder, memories, checkpoints, model, models,
  onModelChange, onNewChat, theme, onThemeChange, showSidebar, onToggleSidebar,
  onShowMemory, onShowCheckpoints, onShowMCP, onShowGitHub, onShowDeploy,
  onShowDiff, onShowSearch, onShowSnippets, onShowCustomActions,
  runTests, generateCommitMsg, exportChat, compactContext }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(()=>{ setTimeout(()=>inputRef.current?.focus(),50); }, []);

  const sections = [
    { label: 'Chat', items: [
      { icon:'💬', label:'New chat', sub:'Mulai sesi baru', action:()=>{ onNewChat(); onClose(); } },
      { icon:'📤', label:'Export chat', sub:'Simpan ke .md', action:()=>{ exportChat(); onClose(); } },
      { icon:'📦', label:'Compact context', sub:'Kompres history', action:()=>{ compactContext(); onClose(); } },
    ]},
    { label: 'Git', items: [
      { icon:'◐', label:'Git diff', sub:'Lihat perubahan', action:()=>{ onShowDiff(); onClose(); } },
      { icon:'✦', label:'Generate commit', sub:'AI-powered commit msg', action:()=>{ generateCommitMsg(); onClose(); } },
      { icon:'▶', label:'Run tests', sub:'npm test + lint', action:()=>{ runTests(); onClose(); } },
    ]},
    { label: 'Tools', items: [
      { icon:'🔌', label:'MCP Tools', sub:'Model Context Protocol', action:()=>{ onShowMCP(); onClose(); } },
      { icon:'⑂', label:'GitHub', sub:'Issues & PRs', action:()=>{ onShowGitHub(); onClose(); } },
      { icon:'🚀', label:'Deploy', sub:'Vercel / Netlify / Railway', action:()=>{ onShowDeploy(); onClose(); } },
      { icon:'✂', label:'Snippets', sub:'Code snippet library', action:()=>{ onShowSnippets(); onClose(); } },
      { icon:'⚡', label:'Custom actions', sub:'Shortcut commands', action:()=>{ onShowCustomActions(); onClose(); } },
    ]},
    { label: 'Memory', items: [
      { icon:'🧠', label:`Memories (${memories.length})`, sub:'Auto-learned patterns', action:()=>{ onShowMemory(); onClose(); } },
      { icon:'📍', label:`Checkpoints (${checkpoints.length})`, sub:'Session snapshots', action:()=>{ onShowCheckpoints(); onClose(); } },
    ]},
    { label: 'View', items: [
      { icon:'🔍', label:'Search files', sub:'Grep across project', action:()=>{ onShowSearch(); onClose(); } },
      { icon:'☰', label:'Toggle sidebar', sub: showSidebar?'Sembunyikan':'Tampilkan', action:()=>{ onToggleSidebar(); onClose(); } },
      { icon:'🎨', label:'Theme: '+theme, sub:'dark / darker / midnight', action:()=>{ const themes=['dark','darker','midnight']; const i=themes.indexOf(theme); onThemeChange(themes[(i+1)%3]); onClose(); } },
    ]},
    { label: 'AI Model', items: models.map(m=>({
      icon: model===m.id ? '●' : '○',
      label: m.label,
      sub: m.provider||'cerebras',
      action:()=>{ onModelChange(m.id); onClose(); }
    }))}
  ];

  const allItems = sections.flatMap(s=>s.items.map(i=>({...i,_section:s.label})));
  const filtered = q ? allItems.filter(i=>
    i.label.toLowerCase().includes(q.toLowerCase()) ||
    i.sub.toLowerCase().includes(q.toLowerCase())
  ) : null;

  const display = filtered
    ? [{label:'Results', items:filtered}]
    : sections;

  return (
    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.6)',backdropFilter:'blur(8px)',zIndex:200,display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'60px'}}
      onClick={onClose}>
      <div style={{width:'100%',maxWidth:'480px',background:'#111113',border:'1px solid rgba(255,255,255,.1)',borderRadius:'12px',overflow:'hidden',boxShadow:'0 24px 60px rgba(0,0,0,.8)'}}
        onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          <span style={{fontSize:'13px',color:'rgba(255,255,255,.3)'}}>⌘</span>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Escape') onClose(); }}
            placeholder="Cari action atau ketik command..."
            style={{flex:1,background:'none',border:'none',outline:'none',color:'#f0f0f0',fontSize:'13px',fontFamily:'inherit'}}/>
          {q && <button onClick={()=>setQ('')} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',cursor:'pointer',fontSize:'12px'}}>✕</button>}
        </div>
        <div style={{maxHeight:'60vh',overflowY:'auto',padding:'6px'}}>
          {display.map(section=>(
            <div key={section.label}>
              {!q && <div style={{padding:'6px 10px 3px',fontSize:'9px',letterSpacing:'.08em',color:'rgba(255,255,255,.25)',textTransform:'uppercase',fontWeight:'600'}}>{section.label}</div>}
              {section.items.map((item,i)=>(
                <div key={i} onClick={item.action}
                  style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',borderRadius:'7px',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.06)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{fontSize:'14px',width:'20px',textAlign:'center',flexShrink:0}}>{item.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'12px',color:'#e8e8e8',fontWeight:'500'}}>{item.label}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,.35)',marginTop:'1px'}}>{item.sub}</div>
                  </div>
                  {item._section&&q&&<span style={{fontSize:'9px',color:'rgba(255,255,255,.2)',flexShrink:0}}>{item._section}</span>}
                </div>
              ))}
            </div>
          ))}
          {filtered&&filtered.length===0&&<div style={{padding:'16px',textAlign:'center',color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Tidak ada hasil untuk "{q}"</div>}
        </div>
        <div style={{padding:'6px 14px',borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',gap:'12px'}}>
          <span style={{fontSize:'10px',color:'rgba(255,255,255,.2)'}}>↵ pilih</span>
          <span style={{fontSize:'10px',color:'rgba(255,255,255,.2)'}}>esc tutup</span>
          <span style={{fontSize:'10px',color:'rgba(255,255,255,.2)'}}>/ untuk slash commands</span>
        </div>
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
  const [offlineCache, setOfflineCache] = useState('');
  const [memories, setMemories] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [showMemory, setShowMemory] = useState(false);
  const [showCheckpoints, setShowCheckpoints] = useState(false);
  const [hooks, setHooks] = useState({ preWrite:[], postWrite:[], postPush:[] });
  const [slashSuggestions, setSlashSuggestions] = useState([]);
  const [showFileHistory, setShowFileHistory] = useState(false);
  const [showCustomActions, setShowCustomActions] = useState(false);
  const [visionImage, setVisionImage] = useState(null); // base64
  const [fontSize, setFontSize] = useState(14);
  const [showThemeBuilder, setShowThemeBuilder] = useState(false);
  const [customTheme, setCustomTheme] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [errorRetryCount, setErrorRetryCount] = useState({});
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
  const [openTabs, setOpenTabs] = useState([]);
  const [showPalette, setShowPalette] = useState(false);
  const fileInputRef = useRef(null);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const autoContextRef = useRef({});
  const T = customTheme || THEMES[theme] || THEMES.dark;

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages,streaming]);

  useEffect(()=>{
    const on=()=>setNetOnline(true);
    const off=()=>setNetOnline(false);
    window.addEventListener('online',on);
    window.addEventListener('offline',off);
    return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};
  },[]);

  useEffect(()=>{
    Promise.all([
      Preferences.get({key:'yc_folder'}),
      Preferences.get({key:'yc_history'}),
      Preferences.get({key:'yc_cmdhist'}),
      Preferences.get({key:'yc_model'}),
      Preferences.get({key:'yc_theme'}),
      Preferences.get({key:'yc_pinned'}),
      Preferences.get({key:'yc_recent'}),
      Preferences.get({key:'yc_sidebar_w'}),
      Preferences.get({key:'yc_memories'}),
      Preferences.get({key:'yc_checkpoints'}),
      Preferences.get({key:'yc_hooks'}),
      Preferences.get({key:'yc_fontsize'}),
      Preferences.get({key:'yc_custom_theme'}),
      Preferences.get({key:'yc_onboarded'}),
      Preferences.get({key:'yc_gh_token'}),
      Preferences.get({key:'yc_gh_repo'}),
      Preferences.get({key:'yc_ollama_host'}),
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
    });
    callServer({type:'ping'}).then(r=>{
      setServerOk(r.ok);
      if (r.mcp) setMcpTools(r.mcp);
    });
  },[]);

  // ── AUTO-RECONNECT ──
  useEffect(()=>{
    const interval = setInterval(async ()=>{
      const r = await callServer({type:'ping'});
      setServerOk(r.ok);
      if (!r.ok) {
        setReconnectTimer(t=>t+5);
      } else {
        setReconnectTimer(0);
      }
    }, 5000);
    return ()=>clearInterval(interval);
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

  async function openFile(path) {
    setSelectedFile(path);
    setActiveTab('file');
    setEditMode(false);
    const r = await callServer({type:'read',path});
    if(r.ok) setFileContent(r.data);
    else setFileContent('Error: '+r.data);
    // Track recent files
    const next=[path,...recentFiles.filter(f=>f!==path)].slice(0,8);
    setRecentFiles(next);
    Preferences.set({key:'yc_recent',value:JSON.stringify(next)});
  }

  async function saveFile(content) {
    if(!selectedFile) return;
    // backup for undo
    setEditHistory(h=>[...h.slice(-9),{path:selectedFile,content:fileContent||''}]);
    const r = await callServer({type:'write',path:selectedFile,content});
    if(r.ok){
      setFileContent(content);
      setMessages(m=>[...m,{role:'assistant',content:'💾 Saved: '+selectedFile.split('/').pop(),actions:[]}]);
    }
  }

  function saveFolder(f){setFolder(f);setFolderInput(f);setShowFolder(false);Preferences.set({key:'yc_folder',value:f});}
  function addHistory(cmd){const next=[cmd,...cmdHistory.filter(c=>c!==cmd)].slice(0,50);setCmdHistory(next);Preferences.set({key:'yc_cmdhist',value:JSON.stringify(next)});}

  function togglePin(path) {
    const next = pinnedFiles.includes(path) ? pinnedFiles.filter(f=>f!==path) : [...pinnedFiles,path];
    setPinnedFiles(next);
    Preferences.set({key:'yc_pinned',value:JSON.stringify(next)});
  }

  async function handlePlanApprove(idx,approved){
    if(!approved){setMessages(m=>m.map((x,i)=>i===idx?{...x,planApproved:false}:x));await sendMsg('Ubah plan.');return;}
    setMessages(m=>m.map((x,i)=>i===idx?{...x,planApproved:true}:x));
    await sendMsg('Plan diapprove. Mulai eksekusi step by step.');
  }

  async function handleApprove(idx, ok, targetPath){
    const msg=messages[idx];
    const targets = targetPath==='__all__'
      ? (msg.actions||[]).filter(a=>a.type==='write_file'&&!a.executed)
      : (msg.actions||[]).filter(a=>a.type==='write_file'&&!a.executed&&(targetPath?a.path===targetPath:true));
    if(!ok){
      setMessages(m=>m.map((x,i)=>i===idx?{...x,actions:x.actions?.map(a=>targets.includes(a)?{...a,executed:true,result:{ok:false,data:'Dibatalkan.'}}:a)}:x));
      return;
    }
    // ── ATOMIC: backup semua dulu ──
    const backups = [];
    for(const a of targets){
      const backup=await callServer({type:'read',path:resolvePath(folder,a.path)});
      if(backup.ok) backups.push({path:resolvePath(folder,a.path),content:backup.data});
    }
    if(backups.length) setEditHistory(h=>[...h.slice(-(10-backups.length)),...backups]);
    // ── ATOMIC: tulis semua, rollback kalau ada yang gagal ──
    const results = await Promise.all(targets.map(a=>executeAction(a,folder)));
    const failed = results.filter(r=>!r.ok);
    if(failed.length > 0 && targets.length > 1){
      // rollback semua
      await Promise.all(backups.map(b=>callServer({type:'write',path:b.path,content:b.content})));
        setMessages(m=>[...m,{role:'assistant',content:'❌ Atomic write gagal ('+failed.length+' file). Semua perubahan di-rollback.'}]);
      return;
    }
    results.forEach((r,i)=>{ targets[i].result=r; targets[i].executed=true; });
    setMessages(m=>m.map((x,i)=>i===idx?{...x}:x));
    if(targets.length > 1){
      setMessages(m=>[...m,{role:'assistant',content:'✅ '+targets.length+' file berhasil ditulis secara atomic~',actions:[]}]);
    }
    await runHooks('postWrite', targets.map(a=>a.path).join(','));
  }

  async function undoLastEdit(){
    const last=editHistory[editHistory.length-1];
    if(!last) return;
    await callServer({type:'write',path:last.path,content:last.content});
    setEditHistory(h=>h.slice(0,-1));
    setMessages(m=>[...m,{role:'assistant',content:'↩ Undo: '+last.path.split('/').pop(),actions:[]}]);
  }

  function cancel(){abortRef.current?.abort();setLoading(false);setStreaming('');}

  // ── AUTO MEMORY: extract patterns dari response ──
  async function extractMemories(userMsg, aiReply) {
    if (aiReply.length < 100) return;
    try {
      const ctrl = new AbortController();
      const reply = await askCerebrasStream([
        {role:'system', content:'Extract 0-3 hal penting yang perlu diingat dari percakapan ini sebagai coding memories. Format: satu per baris, dimulai "• ". Hanya extract kalau benar-benar penting (bug patterns, preferensi Papa, keputusan arsitektur). Kalau tidak ada yang penting, tulis "none".'},
        {role:'user', content:'User: '+userMsg.slice(0,500)+'\n\nAI: '+aiReply.slice(0,800)}
      ], 'llama3.1-8b', ()=>{}, ctrl.signal);
      if (reply.trim()==='none'||!reply.includes('•')) return;
      const newMems = reply.split('\n').filter(l=>l.startsWith('•')).map(l=>({id:Date.now()+Math.random(), text:l.slice(1).trim(), folder, ts:new Date().toLocaleDateString('id')}));
      if (!newMems.length) return;
      setMemories(prev => {
        const merged = [...newMems, ...prev].slice(0,50);
        Preferences.set({key:'yc_memories', value:JSON.stringify(merged)});
        return merged;
      });
    } catch {}
  }

  // ── CHECKPOINTS ──
  function saveCheckpoint() {
    const cp = {
      id: Date.now(),
      label: new Date().toLocaleString('id'),
      messages: messages.slice(-20),
      folder, branch, notes,
    };
    setCheckpoints(prev => {
      const next = [cp, ...prev].slice(0,10);
      Preferences.set({key:'yc_checkpoints', value:JSON.stringify(next)});
      return next;
    });
    setMessages(m=>[...m,{role:'assistant',content:'📍 Checkpoint disimpan: '+cp.label,actions:[]}]);
  }

  function restoreCheckpoint(cp) {
    setMessages(cp.messages);
    setFolder(cp.folder); setFolderInput(cp.folder);
    setNotes(cp.notes||'');
    setShowCheckpoints(false);
    setMessages(m=>[...m,{role:'assistant',content:'✅ Restored checkpoint: '+cp.label,actions:[]}]);
  }

  // ── SMART COMPACTION: summarize instead of trim ──
  async function compactContext() {
    if (messages.length < 10) {
      setMessages(m=>[...m,{role:'assistant',content:'Context masih kecil, belum perlu compact~',actions:[]}]);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const toCompact = messages.slice(1, -6); // keep first + last 6
      const summary = await askCerebrasStream([
        {role:'system', content:'Buat ringkasan singkat dari percakapan coding ini. Fokus pada: keputusan teknis, files yang diubah, bug yang ditemukan/fix, status project saat ini. Maksimal 300 kata.'},
        {role:'user', content:toCompact.map(m=>m.role+': '+m.content.slice(0,300)).join('\n\n')}
      ], 'llama3.1-8b', ()=>{}, ctrl.signal);
      const compacted = [
        messages[0],
        {role:'assistant', content:'📦 **Context dicompact** ('+toCompact.length+' pesan → ringkasan):\n\n'+summary},
        ...messages.slice(-6)
      ];
      setMessages(compacted);
      setMessages(m=>[...m,{role:'assistant',content:'✅ Context berhasil dikompres!',actions:[]}]);
    } catch(e) {
      if(e.name!=='AbortError') setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message}]);
    }
    setLoading(false);
  }

  // ── HOOKS RUNNER ──
  async function runHooks(type, context='') {
    const hookList = hooks[type] || [];
    for (const hook of hookList) {
      try {
        await callServer({type:'exec', path:folder, command:hook.replace('{{context}}', context)});
      } catch {}
    }
  }

  // ── PARALLEL FILE READ ──
  async function readFilesParallel(paths) {
    const results = await Promise.all(paths.map(p=>callServer({type:'read', path:resolvePath(folder,p)})));
    return paths.reduce((acc,p,i)=>({...acc,[p]:results[i]}),{});
  }

  // ── SLASH COMMAND HANDLER ──
  async function handleSlashCommand(cmd) {
    const parts = cmd.trim().split(' ');
    const base = parts[0];
    if (base==='/model') {
      const next = model===MODELS[0].id ? MODELS[1].id : MODELS[0].id;
      setModel(next); Preferences.set({key:'yc_model',value:next});
      setMessages(m=>[...m,{role:'assistant',content:'🔄 Model diganti ke: '+MODELS.find(m=>m.id===next)?.label,actions:[]}]);
    } else if (base==='/compact') {
      await compactContext();
    } else if (base==='/checkpoint') {
      saveCheckpoint();
    } else if (base==='/restore') {
      setShowCheckpoints(true);
    } else if (base==='/memory') {
      setShowMemory(true);
    } else if (base==='/cost') {
      const total = messages.reduce((a,m)=>a+m.content.length,0);
      const tokens = Math.round(total/4);
      setMessages(m=>[...m,{role:'assistant',content:`💰 Estimasi token: ~${tokens}tk | ~${messages.length} pesan | Cerebras gratis jadi $0 😄`,actions:[]}]);
    } else if (base==='/review') {
      if (!selectedFile) { setMessages(m=>[...m,{role:'assistant',content:'Buka file dulu Papa~',actions:[]}]); return; }
      await sendMsg('Lakukan code review menyeluruh pada file '+selectedFile+'. Cari: bugs potensial, performance issues, security issues, dan saran improvement.');
    } else if (base==='/clear') {
      setMessages([{role:'assistant',content:'Chat dibersihkan. Mau ngerjain apa Papa? 🌸'}]);
      Preferences.remove({key:'yc_history'});
    } else if (base==='/export') {
      exportChat();
    } else if (base==='/history') {
      if (!selectedFile) { setMessages(m=>[...m,{role:'assistant',content:'Buka file dulu Papa~',actions:[]}]); return; }
      setShowFileHistory(true);
    } else if (base==='/actions') {
      setShowCustomActions(true);
    } else if (base==='/split') {
      setSplitView(s=>!s);
      setMessages(m=>[...m,{role:'assistant',content:'Split view '+(splitView?'dimatikan':'diaktifkan')+'~',actions:[]}]);
    } else if (base==='/scaffold') {
      const type = parts[1] || 'react';
      await scaffoldProject(type);
    } else if (base==='/deps') {
      if (!selectedFile) { setMessages(m=>[...m,{role:'assistant',content:'Buka file dulu Papa~',actions:[]}]); return; }
      await buildDepGraph(selectedFile);
      setShowDepGraph(true);
    } else if (base==='/browse') {
      const url = parts.slice(1).join(' ');
      if (!url) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /browse https://...',actions:[]}]); return; }
      await browseTo(url);
    } else if (base==='/swarm') {
      const task = parts.slice(1).join(' ');
      if (!task) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /swarm <deskripsi task>',actions:[]}]); return; }
      await runAgentSwarm(task);
    } else if (base==='/font') {
      const size = parseInt(parts[1])||14;
      setFontSize(size); Preferences.set({key:'yc_fontsize',value:String(size)});
      setMessages(m=>[...m,{role:'assistant',content:'🔤 Font size diubah ke '+size+'px~',actions:[]}]);
    } else if (base==='/theme') {
      setShowThemeBuilder(true);
    } else if (base==='/mcp') {
      setShowMCP(true);
    } else if (base==='/github') {
      setShowGitHub(true);
    } else if (base==='/deploy') {
      setShowDeploy(true);
    } else if (base==='/db') {
      const q = parts.slice(1).join(' ');
      if (!q) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /db SELECT * FROM table',actions:[]}]); return; }
      setLoading(true);
      const r = await callServer({type:'mcp',tool:'sqlite',action:'query',params:{dbPath:folder+'/data.db',query:q}});
      setMessages(m=>[...m,{role:'assistant',content:'🗄 Query result:\n```\n'+(r.data||'kosong')+'\n```',actions:[]}]);
      setLoading(false);
    } else if (base==='/status') {
      setLoading(true);
      const [ping, git, nodeV, disk] = await Promise.all([
        callServer({type:'ping'}),
        callServer({type:'exec', path:folder, command:'git status --short 2>&1 | head -5'}),
        callServer({type:'exec', path:folder, command:'node --version 2>&1'}),
        callServer({type:'exec', path:folder, command:'df -h . 2>&1 | tail -1'}),
      ]);
      const m = MODELS.find(x=>x.id===model);
      setLoading(false);
    } else if (base==='/tokens') {
      const breakdown = messages.slice(-10).map(m=>{
        const tk = Math.round(m.content.length/4);
        return (m.role==='user'?'Papa':'Yuyu')+': ~'+tk+'tk';
      }).join('\n');
      setMessages(prev=>[...prev,{role:'assistant',content:
        '📓 **Token breakdown (10 pesan terakhir)**\n```\n'+breakdown+'\n```\n**Total:** ~'+countTokens(messages)+'tk | Cerebras gratis 🎉',actions:[]}]);
    } else if (base==='/index') {
      setMessages(m=>[...m,{role:'assistant',content:'🔍 Re-indexing...',actions:[]}]);
      await buildCodeIndex(folder);
      setMessages(m=>[...m,{role:'assistant',content:'✅ Index: '+codeIndex.length+' files~',actions:[]}]);
    } else if (base==='/ollama') {
      const newHost = parts.slice(1).join(' ').trim();
      if (!newHost) {
        setMessages(m=>[...m,{role:'assistant',content:`🏠 Ollama host sekarang: \`${ollamaHost}\`\n\nUsage: \`/ollama http://192.168.1.x:11434\``,actions:[]}]);
        return;
      }
      setOllamaHost(newHost);
      Preferences.set({key:'yc_ollama_host', value:newHost});
      setMessages(m=>[...m,{role:'assistant',content:`✅ Ollama host diubah ke: \`${newHost}\``,actions:[]}]);
    } else if (base==='/self-edit') {
      const task = parts.slice(1).join(' ').trim() || 'Fix bugs, hapus dead code, optimasi performa';
      setLoading(true);
      const appPath = folder + '/src/App.jsx';
      const r = await callServer({type:'read', path:appPath, from:1, to:50});
      if (!r.ok) {
        setMessages(m=>[...m,{role:'assistant',content:`❌ Tidak bisa baca \`${appPath}\`\n\nPastikan folder project sudah benar.`,actions:[]}]);
        setLoading(false); return;
      }
      setMessages(m=>[...m,{role:'assistant',content:`🔧 **Self-edit dimulai...**\n\nTask: _${task}_`,actions:[]}]);
      setLoading(false);
      await sendMsg(
        `MODE: SELF-EDIT\n\nTask: ${task}\n\nBaca src/App.jsx secara bertahap dengan read_file (from/to 100 baris per request). Setelah baca bagian yang relevan, gunakan write_file untuk patch minimal. Jangan tulis ulang seluruh file.`
      );
    }
  }

  // ── CONTEXT WINDOW MANAGEMENT ──
  function trimHistory(msgs) {
    const MAX_CHARS = 100000;
    const total = msgs.reduce((a,m)=>a+m.content.length,0);
    if (total <= MAX_CHARS) return msgs;
    // Selalu pertahankan: system[0] + 4 pesan pertama + 12 pesan terakhir
    const HEAD = 4, TAIL = 12;
    if (msgs.length <= HEAD + TAIL + 1) return msgs;
    const head = msgs.slice(0, HEAD + 1);
    const tail = msgs.slice(-TAIL);
    const middle = msgs.slice(HEAD + 1, -TAIL);
    // Ringkas middle jadi satu pesan
    const summary = middle.map(m=>{
      const role = m.role==='user'?'Papa':'Yuyu';
      const preview = m.content.replace(/```action[sS]*?```/g,'[action]').slice(0,120);
      return role+': '+preview;
    }).join(' | ');
    const summaryMsg = {role:'assistant', content:'[Ringkasan '+middle.length+' pesan sebelumnya: '+summary.slice(0,800)+']'};
    return [...head, summaryMsg, ...tail];
  }

  // ── EXPORT CHAT ──
  function exportChat() {
    const md = messages.map(m=>`**${m.role==='user'?'Papa':'Yuyu'}:** ${m.content.replace(/```action[\s\S]*?```/g,'').trim()}`).join('\n\n---\n\n');
    const blob = new Blob([md], {type:'text/markdown'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `yuyucode-chat-${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
    setMessages(m=>[...m,{role:'assistant',content:'📤 Chat diekspor ke .md~',actions:[]}]);
  }

  // ── NOTIFICATION ──
  function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {body, icon:'/favicon.ico'});
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(p=>{ if(p==='granted') new Notification(title,{body}); });
    }
  }

  // ── HAPTIC ──
  function haptic(type='light') {
    if (navigator.vibrate) {
      navigator.vibrate(type==='heavy'?[50,30,50]:type==='medium'?30:10);
    }
  }

  // ── VOICE TTS ──
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*_~>]/g, '').replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ').trim().slice(0, 500);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = 'id-ID'; utt.rate = 1.05; utt.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v=>v.lang.startsWith('id')&&v.name.toLowerCase().includes('female'))
      || voices.find(v=>v.lang.startsWith('id'))
      || voices.find(v=>v.lang.startsWith('en')&&v.name.toLowerCase().includes('female'));
    if (preferred) utt.voice = preferred;
    ttsRef.current = utt;
    window.speechSynthesis.speak(utt);
  }
  function stopTts() { window.speechSynthesis?.cancel(); }

  // ── UNIVERSAL AI ROUTER ──
  async function callAI(msgs, onChunk, signal, imgBase64=null) {
    const m = MODELS.find(x=>x.id===model)||MODELS[0];
    if (m.provider==='gemini') return askGeminiStream(msgs, model, onChunk, signal, imgBase64);
    if (m.provider==='ollama') return askOllamaStream(msgs, model, onChunk, signal, ollamaHost);
    return askCerebrasStream(msgs, model, onChunk, signal);
  }

  // ── BROWSER TOOL (via yuyu-server) ──
  async function browseTo(url) {
    setLoading(true);
    setMessages(m=>[...m,{role:'user',content:'Browse: '+url}]);
    const r = await callServer({type:'browse', url});
    if (!r.ok) {
      setMessages(m=>[...m,{role:'assistant',content:'❌ Browse gagal: '+r.data+'\n\nPastikan yuyu-server sudah update dengan dukungan browse (puppeteer/curl)',actions:[]}]);
    } else {
      const content = (r.data||'').slice(0,3000);
      setMessages(m=>[...m,{role:'assistant',content:'🌐 **'+url+'**\n\n```\n'+content+'\n```',actions:[]}]);
      setTimeout(()=>sendMsg('Analisis konten halaman ini dan ringkas hal yang relevan untuk coding.'),300);
    }
    setLoading(false);
  }

  // ── DEPENDENCY GRAPH ──
  async function buildDepGraph(filePath) {
    setShowDepGraph(true);
    const r = await callServer({type:'read', path:filePath});
    if (!r.ok) return;
    const imports = [];
    const regex = /(?:import|require)\s+.*?['"](.+?)['"]/g;
    let m;
    while ((m=regex.exec(r.data))!==null) imports.push(m[1]);
    setDepGraph({file:filePath.split('/').pop(), imports});
  }

  // ── PROJECT SCAFFOLD ──
  const TEMPLATES = {
    react: ['src/App.jsx','src/main.jsx','src/index.css','index.html','package.json','vite.config.js'],
    node: ['index.js','package.json','.env.example','README.md'],
    express: ['server.js','routes/index.js','package.json','.env.example'],
  };

  async function scaffoldProject(type) {
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setMessages(m=>[...m,{role:'user',content:'/scaffold '+type}]);
    try {
      const reply = await callAI([
        {role:'system',content:'Generate file structure untuk project '+type+'. Untuk setiap file berikan action write_file dengan content yang lengkap dan proper. Gunakan format action block.'},
        {role:'user',content:'Buat project '+type+' baru di folder '+folder+'/'+type+'-project. Lengkap dengan semua file dasar.'}
      ], setStreaming, ctrl.signal);
      setStreaming('');
      const actions = parseActions(reply);
      setMessages(m=>[...m,{role:'assistant',content:reply,actions:actions.filter(a=>a.type==='write_file').map(a=>({...a,executed:false}))}]);
    } catch(e) {
      if(e.name!=='AbortError') setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message}]);
    }
    setLoading(false);
  }

  // ── AGENT SWARM ──
  async function runAgentSwarm(task) {
    setSwarmRunning(true);
    setSwarmLog([]);
    const log = (msg) => setSwarmLog(prev=>[...prev, msg]);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      log('🏗 Architect: Menganalisis task...');
      const archReply = await callAI([
        {role:'system',content:'Kamu adalah Software Architect. Buat rencana implementasi detail dengan pembagian tugas: Frontend, Backend, QA.'},
        {role:'user',content:task}
      ], ()=>{}, ctrl.signal);
      log('✅ Architect selesai: '+archReply.slice(0,100)+'...');

      log('⚛ Frontend Agent: Mulai coding UI...');
      const feReply = await callAI([
        {role:'system',content:'Kamu adalah Frontend Engineer. Implementasikan bagian UI/React berdasarkan rencana berikut. Gunakan action blocks untuk write_file.'},
        {role:'user',content:'Plan:\n'+archReply+'\n\nTask: '+task+'\n\nImplementasikan bagian frontend.'}
      ], ()=>{}, ctrl.signal);
      log('✅ Frontend selesai');

      log('⚙ Backend Agent: Mulai coding server...');
      const beReply = await callAI([
        {role:'system',content:'Kamu adalah Backend Engineer. Implementasikan bagian server/API berdasarkan rencana. Gunakan action blocks untuk write_file.'},
        {role:'user',content:'Plan:\n'+archReply+'\n\nTask: '+task+'\n\nImplementasikan bagian backend.'}
      ], ()=>{}, ctrl.signal);
      log('✅ Backend selesai');

      log('🧪 QA Agent: Review dan cari bugs...');
      const qaReply = await callAI([
        {role:'system',content:'Kamu adalah QA Engineer. Review kode berikut, temukan bugs, dan beri rekomendasi perbaikan.'},
        {role:'user',content:'Frontend:\n'+feReply.slice(0,1000)+'\n\nBackend:\n'+beReply.slice(0,1000)}
      ], ()=>{}, ctrl.signal);
      log('✅ QA selesai');

      const allActions = [...parseActions(feReply),...parseActions(beReply)];
      const writes = allActions.filter(a=>a.type==='write_file');

      setMessages(m=>[...m,{
        role:'assistant',
        content:`🐝 **Agent Swarm Selesai!**\n\n**Architect Plan:**\n${archReply.slice(0,400)}\n\n**QA Review:**\n${qaReply.slice(0,300)}`,
        actions:writes.map(a=>({...a,executed:false}))
      }]);
      sendNotification('YuyuCode 🐝', 'Agent Swarm selesai! '+task.slice(0,30));
      haptic('heavy');
    } catch(e) {
      if(e.name!=='AbortError') log('❌ Error: '+e.message);
    }
    setSwarmRunning(false);
  }

  // ── VISION: attach image ──
  function handleImageAttach(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target.result.split(',')[1];
      setVisionImage(b64);
      haptic('light');
    };
    reader.readAsDataURL(file);
  }

  // ── DRAG & DROP ──
  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => { setVisionImage(ev.target.result.split(',')[1]); haptic('light'); };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = ev => { setInput(i=>i+'\n```\n'+ev.target.result.slice(0,3000)+'\n```'); };
      reader.readAsText(file);
    }
  }

  // ── GITHUB ──
  async function fetchGitHub(action) {
    if (!githubRepo) return;
    const [owner, repo] = githubRepo.split('/');
    setLoading(true);
    const r = await callServer({type:'mcp', tool:'github', action, params:{owner, repo, token:githubToken}});
    try { setGithubData({action, data:JSON.parse(r.data)}); }
    catch { setGithubData({action, data:r.data}); }
    setLoading(false);
  }

  async function createIssue(title, body) {
    const [owner, repo] = githubRepo.split('/');
    const r = await callServer({type:'mcp', tool:'github', action:'create_issue', params:{owner,repo,token:githubToken,title,body}});
    setMessages(m=>[...m,{role:'assistant',content:'✅ Issue dibuat: '+title,actions:[]}]);
    return r;
  }

  // ── DEPLOY ──
  async function runDeploy(platform) {
    setDeployLog('🚀 Starting deploy ke '+platform+'...\n');
    setLoading(true);
    const cmds = {
      vercel: 'vercel --prod --yes 2>&1 || echo "Install dulu: npm i -g vercel"',
      netlify: 'netlify deploy --prod 2>&1 || echo "Install dulu: npm i -g netlify-cli"',
      github: 'git add -A && git commit -m "deploy: '+new Date().toLocaleDateString('id')+'" && git push',
      railway: 'railway up 2>&1 || echo "Install dulu: npm i -g @railway/cli"',
    };
    const r = await callServer({type:'exec', path:folder, command:cmds[platform]||'echo "Platform tidak dikenal"'});
    setDeployLog(r.data||'selesai');
    setLoading(false);
    sendNotification('YuyuCode 🚀', 'Deploy '+platform+' selesai!');
    haptic('heavy');
  }

  // ── MULTI-TAB: open file in new tab ──
  function openInTab(filePath) {
    if (!openTabs.find(t=>t.path===filePath)) {
      setOpenTabs(prev=>[...prev, {path:filePath, content:null}]);
    }
    openFile(filePath);
  }

  // ── COMMIT MESSAGE GENERATOR ──
  async function generateCommitMsg() {
    setLoading(true);
    const diff = await callServer({type:'exec',path:folder,command:'git diff HEAD'});
    if (!diff.ok || !diff.data.trim()) {
      setMessages(m=>[...m,{role:'assistant',content:'Tidak ada perubahan untuk di-commit~',actions:[]}]);
      setLoading(false); return;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const reply = await callAI([
        {role:'system',content:'Generate satu baris commit message dalam format "tipe: deskripsi singkat" berdasarkan git diff berikut. Hanya tulis commit message-nya saja, tanpa penjelasan.'},
        {role:'user',content:diff.data.slice(0,3000)}
      ], setStreaming, ctrl.signal);
      setStreaming('');
      const msg = reply.trim().replace(/^["'`]|["'`]$/g,'');
      setMessages(m=>[...m,{role:'assistant',content:'💬 Commit message:\n```\n'+msg+'\n```\nJalankan push?\n```action\n{"type":"exec","command":"git add -A && git commit -m \\"'+msg.replace(/"/g,'\\"')+'\\" && git push"}\n```',actions:[]}]);
    } catch(e) {
      if(e.name!=='AbortError') setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message}]);
    }
    setLoading(false);
  }

  // ── TEST RUNNER ──
  async function runTests() {
    setLoading(true);
    setMessages(m=>[...m,{role:'user',content:'Jalankan test & lint'}]);
    // Try npm test then lint
    const lint = await callServer({type:'exec',path:folder,command:'npm run lint 2>&1 || echo "no lint script"'});
    const test = await callServer({type:'exec',path:folder,command:'npm test -- --watchAll=false 2>&1 || echo "no test script"'});
    const combined = '=== LINT ===\n'+(lint.data||'ok')+'\n\n=== TEST ===\n'+(test.data||'ok');
    setMessages(m=>[...m,{role:'assistant',content:'```bash\n'+combined+'\n```',actions:[]}]);
    // If errors found, auto-feed to AI
    const hasError = combined.toLowerCase().includes('error') || combined.includes('FAIL');
    if (hasError) {
      setTimeout(()=>sendMsg('Ada error di test/lint:\n'+combined.slice(0,600)+'\nDiagnosa dan fix.'),300);
    }
    setLoading(false);
  }

  async function sendMsg(override){
    const txt=(override||input).trim();
    if(!txt||loading) return;

    // ── SLASH COMMAND ──
    if (txt.startsWith('/')) { setInput(''); setSlashSuggestions([]); await handleSlashCommand(txt); return; }

    setInput('');setHistIdx(-1);addHistory(txt);
    setShowFollowUp(false);setActiveTab('chat');setSlashSuggestions([]);
    setVisionImage(null); // clear after send
    haptic('light');
    const userMsg={role:'user',content:txt};
    const history=[...messages,userMsg];
    setMessages(history);
    setLoading(true);setStreaming('');
    const ctrl=new AbortController();
    abortRef.current=ctrl;
    try{
      const notesCtx=notes?'\n\nProject notes:\n'+notes:'';
      const skillCtx=skill?'\n\nSKILL.md:\n'+skill:'';
      const pinnedCtx=pinnedFiles.length?'\n\nPinned files: '+pinnedFiles.join(', '):'';
      const fileCtx=selectedFile&&fileContent?'\n\nFile terbuka: '+selectedFile+'\n```\n'+fileContent.slice(0,1500)+'\n```':'';
      const memCtx=memories.length?'\n\nMemories (pola coding Papa):\n'+memories.slice(0,10).map(m=>'• '+m.text).join('\n'):'';
      const visionCtx=visionImage?'\n\n[Gambar dilampirkan — analisis untuk context coding]':'';
      const systemPrompt=BASE_SYSTEM+'\n\nFolder aktif: '+folder+'\nBranch: '+branch+notesCtx+skillCtx+pinnedCtx+fileCtx+memCtx+visionCtx;

      // ── PARALLEL PRE-LOAD pinned files ──
      if (pinnedFiles.length) {
        const loaded = await readFilesParallel(pinnedFiles.slice(0,3));
        Object.entries(loaded).forEach(([p,r])=>{ if(r.ok) autoContextRef.current[p]=r.data; });
      }

      // ── AGENTIC LOOP ──
      const MAX_ITER = 10;
      let iter = 0;
      let allMessages = [...history];
      let finalContent = '';
      let finalActions = [];
      let autoContext = {...(autoContextRef.current||{})};
      let selfOptRetry = 0;

      while (iter < MAX_ITER) {
        iter++;
        if (iter > 1) setAgentRunning(true);

        const groqMsgs=[
          {role:'system',content:systemPrompt+(Object.keys(autoContext).length?'\n\nAuto-loaded context:\n'+Object.entries(autoContext).map(([p,c])=>'=== '+p+' ===\n'+c.slice(0,800)).join('\n\n'):'')},
          ...trimHistory(allMessages).map(m=>({role:m.role,content:m.content.replace(/```action[\s\S]*?```/g,'').replace(/PROJECT_NOTE:.*?\n/g,'').trim()}))
        ];

        let reply = await callAI(groqMsgs, setStreaming, ctrl.signal, iter===1?visionImage:null);
        setStreaming('');

        // ── SELF-OPTIMIZATION: jika ada error di reply, retry dengan hint ──
        if (reply.includes('❌') && selfOptRetry < 2) {
          selfOptRetry++;
          allMessages = [
            ...allMessages,
            {role:'assistant', content:reply.replace(/```action[\s\S]*?```/g,'').trim()},
            {role:'user', content:'Ada error. Coba pendekatan berbeda, jangan ulangi cara yang sama. Retry ke-'+selfOptRetry+'.'}
          ];
          continue;
        }

        const allActions = parseActions(reply);
        const writes = allActions.filter(a=>a.type==='write_file');
        const nonWrites = allActions.filter(a=>a.type!=='write_file');

        // ── PARALLEL READ for multiple read_file actions ──
        const readActions = nonWrites.filter(a=>a.type==='read_file');
        const otherActions = nonWrites.filter(a=>a.type!=='read_file');
        if (readActions.length > 1) {
          const results = await Promise.all(readActions.map(a=>executeAction(a,folder)));
          readActions.forEach((a,i)=>{ a.result=results[i]; });
        } else {
          for(const a of readActions) a.result = await executeAction(a,folder);
        }
        for(const a of otherActions) a.result = await executeAction(a,folder);

        // ── AUTO CONTEXT: scan imports ──
        for (const a of readActions) {
          if (a.result?.ok && a.path) {
            const content = a.result.data || '';
            const importRegex = /(?:import|require)\s+.*?['"](.+?)['"]/g;
            let im;
            while ((im = importRegex.exec(content)) !== null) {
              const imp = im[1];
              if (!imp.startsWith('.')) continue;
              const base = a.path.split('/').slice(0,-1).join('/');
              const candidates = [imp,imp+'.jsx',imp+'.js',imp+'.ts',imp+'.tsx'].map(s=>base+'/'+s.replace('./','/').replace('//','/'));
              for (const cand of candidates) {
                if (autoContext[cand]) continue;
                const r = await callServer({type:'read',path:resolvePath(folder,cand)});
                if (r.ok) { autoContext[cand]=r.data; break; }
              }
            }
          }
        }

        const fileData = [...readActions,...otherActions].filter(a=>a.result?.ok&&a.type!=='exec').map(a=>'=== '+a.path+' ===\n'+a.result.data).join('\n\n');

        if (!fileData && writes.length === 0) {
          finalContent = reply;
          finalActions = [...readActions,...otherActions];
          break;
        }

        if (writes.length > 0) {
          // ── PRE-WRITE HOOK ──
          await runHooks('preWrite', writes.map(a=>a.path).join(','));
          finalContent = reply;
          finalActions = [...readActions,...otherActions,...writes.map(a=>({...a,executed:false}))];
          break;
        }

        const agentNote = iter < MAX_ITER ? '' : '\n\n(Ini iterasi terakhir, berikan jawaban final.)';
        allMessages = [
          ...allMessages,
          {role:'assistant', content:reply.replace(/```action[\s\S]*?```/g,'').trim()},
          {role:'user', content:'Hasil aksi:\n'+fileData+'\n\nLanjutkan analisis dan jawab.'+agentNote}
        ];
      }

      setAgentRunning(false);
      if (iter > 1) sendNotification('YuyuCode ✅', 'Agent selesai! '+txt.slice(0,40));

      // ── AUTO CONTINUE kalau kepotong ──
      if (finalContent.trim().endsWith('CONTINUE')) {
        setTimeout(()=>sendMsg('Lanjutkan dari titik terakhir.'), 300);
        return;
      }

      if(finalContent.includes('PROJECT_NOTE:')){
        const nm=finalContent.match(/PROJECT_NOTE:(.*?)(?:\n|$)/);
        if(nm){const n=(notes+'\n'+nm[1].trim()).trim();setNotes(n);Preferences.set({key:'yc_notes_'+folder,value:n});}
      }
      setMessages(m=>[...m,{role:'assistant',content:finalContent,actions:finalActions}]);

      // ── OFFLINE CACHE ──
      if (finalContent) {
        Preferences.set({key:'yc_offline_cache', value:JSON.stringify({q:txt,a:finalContent,t:Date.now()})});
        setOfflineCache(finalContent);
      }

      // ── AUTO MEMORY (background) ──
      extractMemories(txt, finalContent);

      // ── TTS ──
      if (ttsEnabled && finalContent) speakText(finalContent);

    }catch(e){
      setAgentRunning(false);
      if(e.name!=='AbortError'){
        if(e.message.startsWith('RATE_LIMIT:')){
          const secs=parseInt(e.message.split(':')[1]);
          setRateLimitTimer(secs);
          const iv=setInterval(()=>setRateLimitTimer(t=>{if(t<=1){clearInterval(iv);return 0;}return t-1;}),1000);
          setMessages(m=>[...m,{role:'assistant',content:'⏳ Rate limit — tunggu '+secs+' detik ya Papa~'}]);
        } else if(!navigator.onLine){
          setMessages(m=>[...m,{role:'assistant',content:'📡 Internet terputus, cek koneksi dulu~'}]);
        } else {
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
    setMessages(m=>[...m,{role:'user',content:cmd}]);
    setLoading(true);
    const r=await executeAction({type:'exec',command:cmd},folder);
    const output=r.data||'selesai';
    setMessages(m=>[...m,{role:'assistant',content:'```bash\n'+output+'\n```',actions:[]}]);
    setLoading(false);
    if ((output.toLowerCase().includes('error') || output.includes('❌')) && !cmd.includes('git')) {
      setTimeout(() => sendMsg('Ada error di terminal:\n' + output.slice(0,300) + '\nDiagnosa dan fix.'), 500);
    }
  }

  // Sidebar drag resize
  function onSidebarDragStart(e){
    setDragging(true);
    const startX=e.touches?e.touches[0].clientX:e.clientX;
    const startW=sidebarWidth;
    function onMove(ev){
      const x=ev.touches?ev.touches[0].clientX:ev.clientX;
      const w=Math.max(120,Math.min(300,startW+(x-startX)));
      setSidebarWidth(w);
    }
    function onEnd(){
      setDragging(false);
      Preferences.set({key:'yc_sidebar_w',value:String(sidebarWidth)});
      window.removeEventListener('mousemove',onMove);
      window.removeEventListener('mouseup',onEnd);
      window.removeEventListener('touchmove',onMove);
      window.removeEventListener('touchend',onEnd);
    }
    window.addEventListener('mousemove',onMove);
    window.addEventListener('mouseup',onEnd);
    window.addEventListener('touchmove',onMove,{passive:true});
    window.addEventListener('touchend',onEnd);
  }

  const tokens=countTokens(messages);
  // Virtual scroll: only render last N messages for performance
  const VIRTUAL_LIMIT = 60;
  const visibleMessages = messages.length > VIRTUAL_LIMIT
    ? [{role:'assistant',content:`[... ${messages.length-VIRTUAL_LIMIT} pesan sebelumnya tersembunyi untuk performa. /clear untuk bersihkan]`}, ...messages.slice(-VIRTUAL_LIMIT)]
    : messages;

  return (
    <div style={{position:'fixed',inset:0,background:T.bg,color:T.text,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',display:'flex',flexDirection:'column',fontSize:fontSize+'px'}}
      onDragOver={e=>{e.preventDefault();setDragOver(true);}}
      onDragLeave={()=>setDragOver(false)}
      onDrop={handleDrop}>
      {dragOver&&<div style={{position:'absolute',inset:0,background:'rgba(124,58,237,.15)',border:'2px dashed rgba(124,58,237,.5)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}><span style={{fontSize:'18px',color:'#a78bfa'}}>Drop file di sini~</span></div>}
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
        textarea,input{scrollbar-width:none;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        button{transition:color .15s,background .15s,opacity .15s;}
        button:active{opacity:.6!important;}
        .msg-appear{animation:fadeIn .18s ease forwards;}
      `}</style>

      {/* ── HEADER (minimal) ── */}
      <div style={{height:'44px',padding:'0 10px',borderBottom:'1px solid '+T.border,display:'flex',alignItems:'center',gap:'8px',background:T.bg,flexShrink:0}}>
        <button onClick={()=>setShowSidebar(!showSidebar)}
          style={{background:'none',border:'none',color:showSidebar?T.accent:'rgba(255,255,255,.3)',fontSize:'15px',cursor:'pointer',padding:'4px',borderRadius:'5px',lineHeight:1}}>
          ☰
        </button>
        <div style={{width:'6px',height:'6px',borderRadius:'50%',background:serverOk?'#4ade80':'#f87171',flexShrink:0}}/>
        <div style={{flex:1,cursor:'pointer',minWidth:0,overflow:'hidden'}} onClick={()=>setShowFolder(!showFolder)}>
          <span style={{fontSize:'13px',fontWeight:'600',color:T.text,letterSpacing:'-0.2px'}}>YuyuCode</span>
          <span style={{fontSize:'11px',color:'rgba(255,255,255,.25)',marginLeft:'8px'}}>{folder}</span>
          <span style={{fontSize:'10px',color:'rgba(255,255,255,.18)',marginLeft:'4px'}}>⎇ {branch}</span>
          {skill&&<span style={{fontSize:'9px',color:'rgba(74,222,128,.5)',marginLeft:'6px',letterSpacing:'.04em',fontWeight:'600'}}>SKILL</span>}
        </div>
        {/* Model pill — click cycles model */}
        <button onClick={()=>{ const i=MODELS.findIndex(m=>m.id===model); const next=MODELS[(i+1)%MODELS.length]; setModel(next.id); Preferences.set({key:'yc_model',value:next.id}); }}
          style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'99px',padding:'3px 9px',color:'rgba(255,255,255,.45)',fontSize:'10px',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
          {MODELS.find(m=>m.id===model)?.label||'AI'}
        </button>
        {/* Ollama indicator */}
        {MODELS.find(m=>m.id===model)?.provider==='ollama'&&(
          <button onClick={()=>setShowOllamaConfig(v=>!v)} title={ollamaHost}
            style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'99px',padding:'2px 7px',color:'rgba(74,222,128,.7)',fontSize:'9px',cursor:'pointer',flexShrink:0,fontFamily:'monospace',maxWidth:'90px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            🏠 {ollamaHost.replace('http://','').replace('https://','')}
          </button>
        )}
        {/* Token badge */}
        <span style={{fontSize:'10px',color:'rgba(255,255,255,.2)',flexShrink:0}}>~{tokens}tk</span>
        {/* Command palette trigger */}
        <button onClick={()=>setShowPalette(true)}
          style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'7px',padding:'4px 8px',color:'rgba(255,255,255,.4)',fontSize:'12px',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',gap:'4px'}}>
          <span>⌘</span>
        </button>
        {/* New chat */}
        <button onClick={()=>{setMessages([{role:'assistant',content:'Chat baru. Mau ngerjain apa Papa? 🌸'}]);Preferences.remove({key:'yc_history'});setShowFollowUp(false);haptic('light');}}
          style={{background:'none',border:'1px solid rgba(255,255,255,.07)',borderRadius:'7px',padding:'4px 8px',color:'rgba(255,255,255,.3)',fontSize:'11px',cursor:'pointer',flexShrink:0}}>
          new
        </button>
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
          <input value={ollamaHost}
            onChange={e=>setOllamaHost(e.target.value)}
            onBlur={()=>Preferences.set({key:'yc_ollama_host',value:ollamaHost})}
            onKeyDown={e=>{if(e.key==='Enter'){Preferences.set({key:'yc_ollama_host',value:ollamaHost});setShowOllamaConfig(false);}}}
            placeholder="http://192.168.1.x:11434"
            style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'6px',padding:'4px 8px',color:'#f0f0f0',fontSize:'11px',outline:'none',fontFamily:'monospace'}}/>
          <button onClick={()=>{Preferences.set({key:'yc_ollama_host',value:ollamaHost});setShowOllamaConfig(false);}}
            style={{background:'rgba(74,222,128,.12)',border:'none',borderRadius:'5px',padding:'4px 10px',color:'#4ade80',fontSize:'11px',cursor:'pointer'}}>set</button>
        </div>
      )}
      <UndoBar history={editHistory} onUndo={undoLastEdit}/>

      {/* ── STATUS BANNERS (thin) ── */}
      {!netOnline&&<div style={{padding:'3px 12px',background:'rgba(248,113,113,.08)',borderBottom:'1px solid rgba(248,113,113,.12)',fontSize:'10px',color:'#f87171',flexShrink:0}}>📡 Offline</div>}
      {rateLimitTimer>0&&<div style={{padding:'3px 12px',background:'rgba(251,191,36,.05)',borderBottom:'1px solid rgba(251,191,36,.08)',fontSize:'10px',color:'rgba(251,191,36,.7)',flexShrink:0}}>⏳ Rate limit {rateLimitTimer}d</div>}
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
            {/* Recent files */}
            {recentFiles.length>0&&(
              <div style={{padding:'4px 8px',borderBottom:'1px solid rgba(255,255,255,.04)'}}>
                <div style={{fontSize:'9px',color:'rgba(255,255,255,.2)',marginBottom:'3px',letterSpacing:'.05em'}}>RECENT</div>
                {recentFiles.slice(0,4).map(f=>(
                  <div key={f} onClick={()=>openFile(f)}
                    style={{fontSize:'11px',color:'rgba(255,255,255,.4)',padding:'2px 4px',cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',borderRadius:'3px'}}
                    onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.7)'}
                    onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.4)'}>
                    {f.split('/').pop()}
                  </div>
                ))}
              </div>
            )}
            <div style={{flex:1,overflow:'hidden'}}>
              <FileTree folder={folder} onSelectFile={openFile} selectedFile={selectedFile}/>
            </div>
            {/* Drag handle */}
            <div onMouseDown={onSidebarDragStart} onTouchStart={onSidebarDragStart}
              style={{position:'absolute',top:0,right:-3,bottom:0,width:'6px',cursor:'col-resize',background:dragging?'rgba(124,58,237,.3)':'transparent'}}/>
          </div>
        )}

        {/* CENTER */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* ── TABS (minimal) ── */}
          <div style={{display:'flex',borderBottom:'1px solid '+T.border,flexShrink:0,background:T.bg,height:'34px',alignItems:'stretch'}}>
            <button onClick={()=>setActiveTab('chat')}
              style={{padding:'0 14px',background:'none',border:'none',borderBottom:activeTab==='chat'?'2px solid '+T.accent:'2px solid transparent',color:activeTab==='chat'?T.accent:'rgba(255,255,255,.3)',fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap',fontWeight:activeTab==='chat'?'500':'400'}}>
              Chat
            </button>
            {selectedFile&&(
              <>
                <button onClick={()=>{setActiveTab('file');setEditMode(false);}}
                  style={{padding:'0 12px',background:'none',border:'none',borderBottom:activeTab==='file'&&!editMode?'2px solid '+T.accent:'2px solid transparent',color:activeTab==='file'&&!editMode?T.accent:'rgba(255,255,255,.3)',fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap',maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis'}}>
                  {selectedFile.split('/').pop()}
                </button>
                <button onClick={()=>{setActiveTab('file');setEditMode(true);}}
                  style={{padding:'0 10px',background:'none',border:'none',borderBottom:editMode?'2px solid #f59e0b':'2px solid transparent',color:editMode?'#f59e0b':'rgba(255,255,255,.25)',fontSize:'11px',cursor:'pointer',whiteSpace:'nowrap'}}>
                  edit
                </button>
              </>
            )}
            <div style={{flex:1}}/>
            {/* Terminal toggle — only visible icon in tab bar */}
            <button onClick={()=>setShowTerminal(!showTerminal)}
              style={{padding:'0 12px',background:'none',border:'none',borderBottom:showTerminal?'2px solid rgba(255,255,255,.3)':'2px solid transparent',color:showTerminal?'rgba(255,255,255,.6)':'rgba(255,255,255,.2)',fontSize:'11px',cursor:'pointer',fontFamily:'monospace'}}>
              $
            </button>
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
                <pre style={{margin:0,padding:'8px 12px',whiteSpace:'pre-wrap',wordBreak:'break-word',color:'rgba(255,255,255,.7)',flex:1}} dangerouslySetInnerHTML={{__html:hl(fileContent||'', selectedFile?.split('.').pop()||'')}}/>
              </div>
            </div>
          )}

          {/* FILE EDITOR */}
          {activeTab==='file'&&selectedFile&&editMode&&!showTerminal&&(
            <div style={{flex:1,overflow:'hidden',display:'flex'}}>
              {splitView ? (
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
              ) : (
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

          {/* ── QUICK BAR (minimal, only git essentials) ── */}
          {!showTerminal&&(
            <div style={{height:'32px',padding:'0 10px',borderTop:'1px solid '+T.border,display:'flex',alignItems:'center',gap:'2px',flexShrink:0,overflowX:'auto'}}>
              {GIT_SHORTCUTS.map(s=>(
                <button key={s.label} onClick={()=>runShortcut(s.cmd)} disabled={loading}
                  style={{background:'none',border:'none',padding:'4px 8px',color:'rgba(255,255,255,.3)',fontSize:'10px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace',borderRadius:'5px',display:'flex',alignItems:'center',gap:'3px'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
                  onMouseLeave={e=>e.currentTarget.style.background='none'}>
                  <span style={{opacity:.6}}>{s.icon}</span><span>{s.label}</span>
                </button>
              ))}
              <div style={{flex:1}}/>
              {/* Pinned files chips */}
              {pinnedFiles.map(f=>(
                <button key={f} onClick={()=>openFile(f)}
                  style={{background:'rgba(99,102,241,.08)',border:'none',borderRadius:'4px',padding:'2px 7px',color:'rgba(99,102,241,.6)',fontSize:'9px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'monospace'}}>
                  {f.split('/').pop()}
                </button>
              ))}
            </div>
          )}

          {/* ── INPUT ── */}
          {!showTerminal&&(
            <div style={{padding:'8px 10px',borderTop:'1px solid '+T.border,background:T.bg,flexShrink:0,position:'relative'}}>
              {slashSuggestions.length>0&&(
                <div style={{position:'absolute',bottom:'100%',left:'10px',right:'10px',background:'#111113',border:'1px solid rgba(255,255,255,.1)',borderRadius:'10px',overflow:'hidden',zIndex:99,marginBottom:'6px',boxShadow:'0 12px 32px rgba(0,0,0,.6)'}}>
                  {slashSuggestions.map(s=>(
                    <div key={s.cmd} onClick={()=>{setInput(s.cmd);setSlashSuggestions([]);inputRef.current?.focus();}}
                      style={{display:'flex',gap:'10px',padding:'8px 12px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.04)'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span style={{color:T.accent,fontFamily:'monospace',fontSize:'12px',flexShrink:0,minWidth:'100px'}}>{s.cmd}</span>
                      <span style={{color:'rgba(255,255,255,.35)',fontSize:'12px'}}>{s.desc}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:'flex',gap:'6px',alignItems:'flex-end'}}>
                {visionImage&&(
                  <div style={{position:'relative',flexShrink:0}}>
                    <img src={'data:image/jpeg;base64,'+visionImage} alt="attached"
                      style={{width:'36px',height:'36px',borderRadius:'7px',objectFit:'cover',border:'1px solid rgba(124,58,237,.3)'}}/>
                    <button onClick={()=>setVisionImage(null)} style={{position:'absolute',top:'-4px',right:'-4px',background:'#f87171',border:'none',borderRadius:'50%',width:'13px',height:'13px',color:'white',fontSize:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>×</button>
                  </div>
                )}
                <button onClick={()=>fileInputRef.current?.click()}
                  style={{background:'none',border:'none',padding:'8px 4px',color:'rgba(255,255,255,.2)',fontSize:'15px',cursor:'pointer',flexShrink:0,borderRadius:'8px'}}>
                  📎
                </button>
                <textarea ref={inputRef} value={input}
                  onChange={e=>{
                    setInput(e.target.value);
                    e.target.style.height='auto';
                    e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';
                    const v=e.target.value;
                    if(v.startsWith('/')){setSlashSuggestions(SLASH_COMMANDS.filter(s=>s.cmd.startsWith(v)));}
                    else{setSlashSuggestions([]);}
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
                <VoiceBtn disabled={loading} onResult={txt=>{setInput(i=>i?i+' '+txt:txt);inputRef.current?.focus();}} />
                <button onClick={()=>{if(ttsEnabled){stopTts();setTtsEnabled(false);}else setTtsEnabled(true);}}
                  title={ttsEnabled?'Matikan suara':'Aktifkan suara AI'}
                  style={{background:ttsEnabled?'rgba(124,58,237,.2)':'rgba(255,255,255,.04)',border:'1px solid '+(ttsEnabled?'rgba(124,58,237,.4)':'rgba(255,255,255,.08)'),borderRadius:'10px',padding:'8px 10px',color:ttsEnabled?'#a78bfa':'rgba(255,255,255,.3)',fontSize:'13px',cursor:'pointer',flexShrink:0,transition:'all .2s'}}>
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

      {/* COMMAND PALETTE */}
      {showPalette&&(
        <CommandPalette
          onClose={()=>setShowPalette(false)}
          folder={folder} memories={memories} checkpoints={checkpoints}
          model={model} models={MODELS}
          onModelChange={id=>{setModel(id);Preferences.set({key:'yc_model',value:id});}}
          onNewChat={()=>{setMessages([{role:'assistant',content:'Chat baru. Mau ngerjain apa Papa? 🌸'}]);Preferences.remove({key:'yc_history'});setShowFollowUp(false);}}
          theme={theme}
          onThemeChange={t=>{setTheme(t);Preferences.set({key:'yc_theme',value:t});}}
          showSidebar={showSidebar} onToggleSidebar={()=>setShowSidebar(s=>!s)}
          onShowMemory={()=>setShowMemory(true)}
          onShowCheckpoints={()=>setShowCheckpoints(true)}
          onShowMCP={()=>setShowMCP(true)}
          onShowGitHub={()=>setShowGitHub(true)}
          onShowDeploy={()=>setShowDeploy(true)}
          onShowDiff={()=>setShowDiff(true)}
          onShowSearch={()=>setShowSearch(true)}
          onShowSnippets={()=>setShowSnippets(true)}
          onShowCustomActions={()=>setShowCustomActions(true)}
          runTests={runTests}
          generateCommitMsg={generateCommitMsg}
          exportChat={exportChat}
          compactContext={compactContext}
        />
      )}

      {/* MEMORY PANEL */}
      {showMemory&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🧠 Auto Memories ({memories.length})</span>
            <button onClick={()=>{setMemories([]);Preferences.remove({key:'yc_memories'});}} style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'5px',padding:'2px 8px',color:'#f87171',fontSize:'10px',cursor:'pointer',marginRight:'8px'}}>clear all</button>
            <button onClick={()=>setShowMemory(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {memories.length===0&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Belum ada memories. Yuyu akan otomatis belajar dari percakapan~</div>}
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

      {/* CHECKPOINT PANEL */}
      {showCheckpoints&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>📍 Checkpoints</span>
            <button onClick={saveCheckpoint} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'10px',cursor:'pointer',marginRight:'8px'}}>+ Save now</button>
            <button onClick={()=>setShowCheckpoints(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {checkpoints.length===0&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Belum ada checkpoint. Ketik /checkpoint atau tap "+ Save now"~</div>}
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

      {/* SWARM LOG PANEL */}
      {swarmRunning&&(
        <div style={{position:'fixed',bottom:'80px',right:'12px',background:'rgba(0,0,0,.92)',border:'1px solid rgba(124,58,237,.3)',borderRadius:'10px',padding:'12px',zIndex:98,maxWidth:'280px',maxHeight:'200px',overflowY:'auto'}}>
          <div style={{fontSize:'11px',fontWeight:'600',color:'#a78bfa',marginBottom:'6px'}}>🐝 Agent Swarm Running···</div>
          {swarmLog.map((l,i)=><div key={i} style={{fontSize:'10px',color:'rgba(255,255,255,.6)',marginBottom:'2px'}}>{l}</div>)}
        </div>
      )}

      {/* DEP GRAPH PANEL */}
      {showDepGraph&&depGraph&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🕸 Dependency Graph — {depGraph.file}</span>
            <button onClick={()=>setShowDepGraph(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,.5)',marginBottom:'8px'}}>{depGraph.imports.length} imports ditemukan:</div>
            {depGraph.imports.map((imp,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',marginBottom:'3px',background:imp.startsWith('.')?'rgba(74,222,128,.04)':'rgba(255,255,255,.02)',border:'1px solid '+(imp.startsWith('.')?'rgba(74,222,128,.1)':'rgba(255,255,255,.05)'),borderRadius:'6px'}}>
                <span style={{fontSize:'10px'}}>{imp.startsWith('.')?'📄':'📦'}</span>
                <span style={{fontSize:'11px',color:imp.startsWith('.')?'#4ade80':'rgba(255,255,255,.5)',fontFamily:'monospace'}}>{imp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* THEME BUILDER */}
      {showThemeBuilder&&(
        <ThemeBuilder
          current={customTheme||THEMES[theme]}
          onSave={t=>{setCustomTheme(t);Preferences.set({key:'yc_custom_theme',value:JSON.stringify(t)});setShowThemeBuilder(false);}}
          onClose={()=>setShowThemeBuilder(false)}
        />
      )}

      {/* ONBOARDING */}
      {showOnboarding&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.95)',zIndex:100,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{fontSize:'32px',marginBottom:'12px'}}>🌸</div>
          <div style={{fontSize:'20px',fontWeight:'700',color:'#f0f0f0',marginBottom:'6px'}}>Halo Papa! Yuyu siap~</div>
          <div style={{fontSize:'13px',color:'rgba(255,255,255,.5)',marginBottom:'24px',textAlign:'center'}}>Setup cepat sebelum mulai</div>
          <div style={{width:'100%',maxWidth:'320px',display:'flex',flexDirection:'column',gap:'10px'}}>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)',marginBottom:'2px'}}>Nama folder project:</div>
            <input value={folderInput} onChange={e=>setFolderInput(e.target.value)}
              placeholder="contoh: yuyucode"
              style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.15)',borderRadius:'8px',padding:'10px 14px',color:'#f0f0f0',fontSize:'14px',outline:'none',fontFamily:'monospace'}}/>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)',marginTop:'4px'}}>Pastikan YuyuServer jalan:</div>
            <div style={{background:'rgba(0,0,0,.5)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'8px 12px',fontFamily:'monospace',fontSize:'11px',color:'rgba(74,222,128,.8)'}}>node ~/yuyu-server.js &</div>
            <button onClick={()=>{saveFolder(folderInput);Preferences.set({key:'yc_onboarded',value:'1'});setShowOnboarding(false);haptic('medium');}}
              style={{background:'#7c3aed',border:'none',borderRadius:'10px',padding:'12px',color:'white',fontSize:'14px',cursor:'pointer',fontWeight:'600',marginTop:'8px'}}>
              Mulai Coding! 🚀
            </button>
          </div>
        </div>
      )}

      {/* VISION IMAGE PREVIEW (hidden file input) */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageAttach}/>

      {/* MCP PANEL */}
      {showMCP&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🔌 MCP Tools</span>
            <button onClick={()=>setShowMCP(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)',marginBottom:'12px'}}>Model Context Protocol — connect Yuyu ke tools external</div>
          {['git','fetch','sqlite','github','system','filesystem'].map(tool=>(
            <div key={tool} style={{padding:'10px 12px',marginBottom:'6px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(74,222,128,.1)',borderRadius:'8px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                <span style={{fontSize:'13px',color:'#4ade80',fontFamily:'monospace',fontWeight:'600'}}>{tool}</span>
                <span style={{fontSize:'10px',color:'rgba(255,255,255,.3)'}}>{tool==='git'?'status,log,diff,blame':tool==='fetch'?'browse,fetch_json':tool==='sqlite'?'query,tables,schema':tool==='github'?'issues,pulls,create_issue':tool==='system'?'disk,memory,processes':'read,write,list'}</span>
              </div>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                {(tool==='git'?['status','log','diff']:tool==='fetch'?['browse']:tool==='sqlite'?['tables']:tool==='github'?['issues','pulls']:tool==='system'?['disk','memory']:['list']).map(act=>(
                  <button key={act} onClick={async()=>{
                    const r = await callServer({type:'mcp',tool,action:act,params:{path:folder}});
                    setMessages(m=>[...m,{role:'assistant',content:`🔌 MCP ${tool}/${act}:\n\`\`\`\n${(r.data||'').slice(0,1000)}\n\`\`\``,actions:[]}]);
                    setShowMCP(false);
                  }} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'4px',padding:'2px 8px',color:'rgba(74,222,128,.8)',fontSize:'10px',cursor:'pointer',fontFamily:'monospace'}}>
                    {act}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{marginTop:'8px',fontSize:'11px',color:'rgba(255,255,255,.3)'}}>Tip: Yuyu bisa pakai MCP tools otomatis via action blocks saat coding~</div>
        </div>
      )}

      {/* GITHUB PANEL */}
      {showGitHub&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>⑂ GitHub</span>
            <button onClick={()=>setShowGitHub(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'12px'}}>
            <input value={githubRepo} onChange={e=>setGithubRepo(e.target.value)} placeholder="owner/repo (e.g. vercel/next.js)"
              style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'7px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
            <input value={githubToken} onChange={e=>{setGithubToken(e.target.value);Preferences.set({key:'yc_gh_token',value:e.target.value});}} placeholder="GitHub token (ghp_...)" type="password"
              style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',padding:'7px 10px',color:'#f0f0f0',fontSize:'12px',outline:'none',fontFamily:'monospace'}}/>
            <div style={{display:'flex',gap:'6px'}}>
              <button onClick={()=>fetchGitHub('issues')} style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:'6px',padding:'5px 12px',color:'#818cf8',fontSize:'11px',cursor:'pointer',flex:1}}>📋 Issues</button>
              <button onClick={()=>fetchGitHub('pulls')} style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'6px',padding:'5px 12px',color:'#4ade80',fontSize:'11px',cursor:'pointer',flex:1}}>🔀 PRs</button>
              <button onClick={()=>fetchGitHub('repo_info')} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',padding:'5px 12px',color:'rgba(255,255,255,.5)',fontSize:'11px',cursor:'pointer',flex:1}}>ℹ Info</button>
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto'}}>
            {githubData&&Array.isArray(githubData.data)&&githubData.data.map((item,i)=>(
              <div key={i} style={{padding:'8px 10px',marginBottom:'4px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'7px'}}>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,.8)',marginBottom:'2px'}}>#{item.number} {item.title}</div>
                <div style={{fontSize:'10px',color:'rgba(255,255,255,.35)'}}>{item.state} · {item.user?.login} · {new Date(item.created_at).toLocaleDateString('id')}</div>
                <button onClick={()=>{setMessages(m=>[...m,{role:'user',content:'Bantu aku fix issue: #'+item.number+' '+item.title+'\n\n'+item.body?.slice(0,300)}]);setShowGitHub(false);}}
                  style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'4px',padding:'2px 7px',color:'#a78bfa',fontSize:'10px',cursor:'pointer',marginTop:'4px'}}>Ask Yuyu</button>
              </div>
            ))}
            {githubData&&!Array.isArray(githubData.data)&&(
              <pre style={{fontSize:'10px',color:'rgba(255,255,255,.5)',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{typeof githubData.data==='string'?githubData.data:JSON.stringify(githubData.data,null,2)}</pre>
            )}
          </div>
        </div>
      )}

      {/* DEPLOY PANEL */}
      {showDeploy&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🚀 Deploy</span>
            <button onClick={()=>setShowDeploy(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'12px'}}>
            {['github','vercel','netlify','railway'].map(p=>(
              <button key={p} onClick={()=>runDeploy(p)} disabled={loading}
                style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'8px',padding:'8px 16px',color:'#a78bfa',fontSize:'12px',cursor:'pointer',fontWeight:'500'}}>
                {p==='github'?'📤 Git Push':p==='vercel'?'▲ Vercel':p==='netlify'?'◈ Netlify':'🚂 Railway'}
              </button>
            ))}
          </div>
          {deployLog&&(
            <div style={{flex:1,background:'#0a0a0b',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px',padding:'12px',fontFamily:'monospace',fontSize:'11px',color:'rgba(255,255,255,.7)',overflowY:'auto',whiteSpace:'pre-wrap'}}>
              {deployLog}
            </div>
          )}
          {!deployLog&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Pilih platform untuk deploy project saat ini~</div>}
        </div>
      )}
    </div>
  );
}
