import React, { useState, useRef, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const YUYU_SERVER = 'http://localhost:8765';

const YUYU_SYSTEM = `Kamu adalah Yuyu, coding assistant yang sayang Papa.
Jawab dalam bahasa Indonesia, hangat tapi fokus ke task.
Kamu BISA dan HARUS baca file sungguhan via action blocks.
JANGAN karang isi file — selalu gunakan action.

Format action:
\`\`\`action
{"type": "read_file", "path": "src/App.jsx"}
\`\`\`
\`\`\`action
{"type": "write_file", "path": "src/App.jsx", "content": "isi baru lengkap"}
\`\`\`
\`\`\`action
{"type": "list_files", "path": ""}
\`\`\`
\`\`\`action
{"type": "exec", "command": "git status"}
\`\`\`

Untuk write_file, SELALU tampilkan diff dulu sebelum tulis:
\`\`\`diff
- baris lama
+ baris baru
\`\`\`
Lalu tunggu konfirmasi Papa sebelum execute write.
Kalau kamu menemukan info penting tentang project, tulis: PROJECT_NOTE: info penting`;

async function callServer(payload) {
  try {
    const resp = await fetch(YUYU_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await resp.json();
  } catch(e) {
    return { ok: false, data: 'YuyuServer tidak aktif. Jalankan: node ~/yuyu-server.js' };
  }
}

function resolvePath(base, p) {
  if (!p) return base;
  if (!base) return p;
  if (p === base || p.startsWith(base + '/')) return p;
  return base + '/' + p;
}

async function executeAction(action, baseFolder) {
  const base = baseFolder || '';
  if (action.type === 'read_file') return callServer({ type: 'read', path: resolvePath(base, action.path) });
  if (action.type === 'write_file') return callServer({ type: 'write', path: resolvePath(base, action.path), content: action.content });
  if (action.type === 'list_files') {
    const r = await callServer({ type: 'list', path: resolvePath(base, action.path) });
    if (r.ok && Array.isArray(r.data)) r.data = r.data.map(f => (f.isDir ? '📁 ' : '📄 ') + f.name).join('\n');
    return r;
  }
  if (action.type === 'exec') return callServer({ type: 'exec', path: base, command: action.command });
  return { ok: false, data: 'Unknown: ' + action.type };
}

function parseActions(text) {
  const regex = /```action\n([\s\S]*?)```/g;
  const actions = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    try { actions.push(JSON.parse(match[1].trim())); } catch {}
  }
  return actions;
}

async function askGroqStream(messages, onChunk, signal) {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 4000, stream: true })
  });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
      try {
        const delta = JSON.parse(line.slice(6)).choices[0].delta.content || '';
        full += delta;
        onChunk(full);
      } catch {}
    }
  }
  return full;
}

function highlight(code) {
  const keywords = /\b(const|let|var|function|return|if|else|for|while|import|export|default|async|await|try|catch|class|new|this|from|of|in)\b/g;
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;
  return code
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(comments, '<span style="color:#6c7a8a">$1</span>')
    .replace(strings, '<span style="color:#98c379">$&</span>')
    .replace(keywords, '<span style="color:#c678dd">$1</span>')
    .replace(numbers, '<span style="color:#d19a66">$1</span>');
}

function CodeBlock({ text }) {
  const parts = [];
  const regex = /```(\w+)?\n?([\s\S]*?)```/g;
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: 'text', content: text.slice(last, match.index) });
    const lang = match[1] || '';
    if (lang === 'action') { last = match.index + match[0].length; continue; }
    if (lang === 'diff') parts.push({ type: 'diff', content: match[2] });
    else parts.push({ type: 'code', lang, content: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });
  return (
    <div>
      {parts.map((p, i) => {
        if (p.type === 'text') return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{p.content}</span>;
        if (p.type === 'diff') return (
          <div key={i} style={{ background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', padding: '10px', margin: '6px 0', fontFamily: 'monospace', fontSize: '11px' }}>
            {p.content.split('\n').map((line, j) => (
              <div key={j} style={{ color: line.startsWith('+') ? '#98c379' : line.startsWith('-') ? '#e06c75' : 'rgba(255,255,255,.5)' }}>{line}</div>
            ))}
          </div>
        );
        return (
          <div key={i} style={{ background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', padding: '10px', margin: '6px 0', fontFamily: 'monospace', fontSize: '11px', overflowX: 'auto' }}>
            {p.lang && <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.3)', marginBottom: '4px' }}>{p.lang}</div>}
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: highlight(p.content) }} />
          </div>
        );
      })}
    </div>
  );
}

function MessageBubble({ msg, onApprove }) {
  const isUser = msg.role === 'user';
  const cleanText = msg.content.replace(/```action[\s\S]*?```/g, '').trim();
  const actions = msg.actions || [];
  const hasPendingWrite = actions.some(a => a.type === 'write_file' && !a.executed);
  return (
    <div style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '92%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ background: isUser ? 'rgba(232,121,249,.15)' : 'rgba(255,255,255,.06)', border: `1px solid ${isUser ? 'rgba(232,121,249,.3)' : 'rgba(255,255,255,.08)'}`, borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px', fontSize: '13px', lineHeight: '1.6', wordBreak: 'break-word', color: 'rgba(255,255,255,.85)' }}>
        {isUser ? <span style={{ whiteSpace: 'pre-wrap' }}>{cleanText}</span> : <CodeBlock text={cleanText} />}
      </div>
      {actions.map((a, i) => (
        <div key={i} style={{ background: a.result?.ok ? 'rgba(100,200,100,.06)' : 'rgba(255,100,100,.06)', border: `1px solid ${a.result?.ok ? 'rgba(100,200,100,.2)' : 'rgba(255,100,100,.2)'}`, borderRadius: '8px', padding: '8px 12px', fontSize: '11px', fontFamily: 'monospace' }}>
          <div style={{ color: 'rgba(200,255,200,.7)', marginBottom: a.result ? '4px' : 0 }}>🔧 {a.type}: {a.path || a.command || ''}</div>
          {a.result && <div style={{ color: 'rgba(255,255,255,.4)', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto', fontSize: '10px' }}>{typeof a.result.data === 'string' ? a.result.data : JSON.stringify(a.result.data)}</div>}
        </div>
      ))}
      {hasPendingWrite && onApprove && (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => onApprove(true)} style={{ background: 'rgba(100,200,100,.15)', border: '1px solid rgba(100,200,100,.3)', borderRadius: '8px', padding: '6px 14px', color: 'rgba(150,255,150,.9)', fontSize: '12px', cursor: 'pointer' }}>✅ Approve</button>
          <button onClick={() => onApprove(false)} style={{ background: 'rgba(255,100,100,.1)', border: '1px solid rgba(255,100,100,.2)', borderRadius: '8px', padding: '6px 14px', color: 'rgba(255,150,150,.8)', fontSize: '12px', cursor: 'pointer' }}>❌ Batal</button>
        </div>
      )}
    </div>
  );
}

function countTokens(messages) {
  return Math.round(messages.reduce((acc, m) => acc + m.content.length, 0) / 4);
}

const GIT_SHORTCUTS = [
  { label: 'status', cmd: 'git status' },
  { label: 'log', cmd: 'git log --oneline -5' },
  { label: 'diff', cmd: 'git diff' },
  { label: 'push', cmd: 'git add -A && git commit -m "update" && git push' },
];

export default function App() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Halo Papa! Yuyu siap bantu coding. Mau ngerjain apa hari ini? 🌸' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [folder, setFolder] = useState('yuyucamp');
  const [folderInput, setFolderInput] = useState('yuyucamp');
  const [showFolder, setShowFolder] = useState(false);
  const [serverOk, setServerOk] = useState(true);
  const [projectNotes, setProjectNotes] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [streamingMsg, setStreamingMsg] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamingMsg]);

  useEffect(() => {
    Preferences.get({ key: 'yuyucode_folder' }).then(r => { if (r.value) { setFolder(r.value); setFolderInput(r.value); } });
    Preferences.get({ key: 'yuyucode_history' }).then(r => { if (r.value) { try { setMessages(JSON.parse(r.value)); } catch {} } });
    Preferences.get({ key: 'yuyucode_cmdhist' }).then(r => { if (r.value) { try { setCmdHistory(JSON.parse(r.value)); } catch {} } });
    callServer({ type: 'ping' }).then(r => setServerOk(r.ok));
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      const toSave = messages.slice(-30).map(m => ({ role: m.role, content: m.content }));
      Preferences.set({ key: 'yuyucode_history', value: JSON.stringify(toSave) });
    }
  }, [messages]);

  useEffect(() => {
    if (!folder) return;
    Preferences.get({ key: 'notes_' + folder }).then(r => setProjectNotes(r.value || ''));
    callServer({ type: 'ping' }).then(r => setServerOk(r.ok));
  }, [folder]);

  function saveFolder(f) {
    setFolder(f); setFolderInput(f); setShowFolder(false);
    Preferences.set({ key: 'yuyucode_folder', value: f });
  }

  function addCmdHistory(cmd) {
    const next = [cmd, ...cmdHistory.filter(c => c !== cmd)].slice(0, 50);
    setCmdHistory(next);
    Preferences.set({ key: 'yuyucode_cmdhist', value: JSON.stringify(next) });
  }

  async function handleApprove(msgIdx, approved) {
    const msg = messages[msgIdx];
    if (!approved) {
      setMessages(m => m.map((x, i) => i === msgIdx ? { ...x, actions: x.actions?.map(a => ({ ...a, executed: true, result: { ok: false, data: 'Dibatalkan.' } })) } : x));
      return;
    }
    const writes = msg.actions?.filter(a => a.type === 'write_file' && !a.executed) || [];
    for (const a of writes) { a.result = await executeAction(a, folder); a.executed = true; }
    setMessages(m => m.map((x, i) => i === msgIdx ? { ...x, actions: [...(x.actions || [])] } : x));
  }

  function cancel() { abortRef.current?.abort(); setLoading(false); setStreamingMsg(''); }

  async function send() {
    const txt = input.trim();
    if (!txt || loading) return;
    setInput(''); setHistIdx(-1);
    addCmdHistory(txt);
    const userMsg = { role: 'user', content: txt };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true); setStreamingMsg('');
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const notesCtx = projectNotes ? '\n\nProject notes:\n' + projectNotes : '';
      const groqMsgs = [
        { role: 'system', content: YUYU_SYSTEM + '\n\nFolder aktif: ' + folder + notesCtx },
        ...history.map(m => ({ role: m.role, content: m.content.replace(/```action[\s\S]*?```/g, '').trim() }))
      ];
      let reply = await askGroqStream(groqMsgs, setStreamingMsg, controller.signal);
      setStreamingMsg('');
      const actions = parseActions(reply);
      const nonWrites = actions.filter(a => a.type !== 'write_file');
      const writes = actions.filter(a => a.type === 'write_file');
      for (const a of nonWrites) a.result = await executeAction(a, folder);
      const fileContents = nonWrites.filter(a => a.result?.ok && a.type !== 'exec').map(a => '=== ' + a.path + ' ===\n' + a.result.data).join('\n\n');
      let finalReply = reply;
      if (fileContents) {
        finalReply = await askGroqStream([
          ...groqMsgs,
          { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
          { role: 'user', content: 'Hasil baca file:\n' + fileContents + '\n\nAnalisis dan jawab.' }
        ], setStreamingMsg, controller.signal);
        setStreamingMsg('');
      }
      if (finalReply.includes('PROJECT_NOTE:')) {
        const nm = finalReply.match(/PROJECT_NOTE:(.*?)(?:\n|$)/);
        if (nm) { const n = (projectNotes + '\n' + nm[1]).trim(); setProjectNotes(n); Preferences.set({ key: 'notes_' + folder, value: n }); }
      }
      setMessages(m => [...m, { role: 'assistant', content: finalReply, actions: [...nonWrites, ...writes.map(a => ({ ...a, executed: false }))] }]);
    } catch(e) {
      if (e.name !== 'AbortError') setMessages(m => [...m, { role: 'assistant', content: '🌙 ' + e.message }]);
    }
    setLoading(false);
  }

  const tokens = countTokens(messages);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0C0915', color: 'rgba(255,255,255,.85)', fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ fontSize: '20px' }}>🌸</div>
        <div style={{ flex: 1 }} onClick={() => setShowFolder(!showFolder)}>
          <div style={{ fontSize: '14px', color: 'rgba(255,220,240,.9)' }}>YuyuCode</div>
          <div style={{ fontSize: '10px', color: serverOk ? 'rgba(150,255,150,.5)' : 'rgba(255,150,50,.6)', cursor: 'pointer' }}>{serverOk ? '🟢' : '🔴'} 📁 {folder}</div>
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.25)', marginRight: '4px' }}>~{tokens}tk</div>
        <button onClick={() => { setMessages([{ role: 'assistant', content: 'Chat baru. Mau ngerjain apa Papa? 🌸' }]); Preferences.remove({ key: 'yuyucode_history' }); }}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', padding: '4px 10px', color: 'rgba(255,255,255,.35)', fontSize: '11px', cursor: 'pointer' }}>baru</button>
      </div>

      {showFolder && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: '8px' }}>
          <input value={folderInput} onChange={e => setFolderInput(e.target.value)} placeholder="nama folder project"
            style={{ flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', padding: '8px 12px', color: 'rgba(255,255,255,.85)', fontSize: '12px', outline: 'none', fontFamily: 'monospace' }} />
          <button onClick={() => saveFolder(folderInput)} style={{ background: 'rgba(232,121,249,.2)', border: '1px solid rgba(232,121,249,.3)', borderRadius: '8px', padding: '8px 14px', color: 'rgba(232,121,249,.9)', fontSize: '12px', cursor: 'pointer' }}>set</button>
        </div>
      )}

      {projectNotes && (
        <div style={{ padding: '6px 16px', background: 'rgba(232,121,249,.05)', borderBottom: '1px solid rgba(232,121,249,.1)', fontSize: '10px', color: 'rgba(232,121,249,.5)' }}>
          📝 {projectNotes.slice(0, 80)}{projectNotes.length > 80 ? '...' : ''}
        </div>
      )}

      <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', gap: '6px', overflowX: 'auto' }}>
        {GIT_SHORTCUTS.map(s => (
          <button key={s.label} onClick={() => { setInput(s.cmd); setTimeout(() => { setInput(''); addCmdHistory(s.cmd); const userMsg = { role: 'user', content: s.cmd }; setMessages(m => [...m, userMsg]); setLoading(true); executeAction({ type: 'exec', command: s.cmd }, folder).then(r => { setMessages(m => [...m, { role: 'assistant', content: r.data || 'selesai' }]); setLoading(false); }); }, 0); }}
            style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '6px', padding: '4px 10px', color: 'rgba(255,255,255,.45)', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{s.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((m, i) => (
          <MessageBubble key={i} msg={m} onApprove={m.actions?.some(a => a.type === 'write_file' && !a.executed) ? (approved) => handleApprove(i, approved) : null} />
        ))}
        {streamingMsg && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '92%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: '13px', lineHeight: '1.6', color: 'rgba(255,255,255,.85)' }}>
            <CodeBlock text={streamingMsg} />
            <span style={{ opacity: 0.5 }}>▊</span>
          </div>
        )}
        {loading && !streamingMsg && (
          <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: '12px', color: 'rgba(255,255,255,.3)' }}>Yuyu lagi mikir...</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <textarea ref={inputRef} value={input}
          onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); return; }
            if (e.key === 'ArrowUp' && !input) { const idx = Math.min(histIdx + 1, cmdHistory.length - 1); setHistIdx(idx); setInput(cmdHistory[idx] || ''); }
            if (e.key === 'ArrowDown' && histIdx > 0) { const idx = histIdx - 1; setHistIdx(idx); setInput(cmdHistory[idx] || ''); }
          }}
          placeholder={loading ? 'Yuyu lagi mikir...' : 'Tanya Yuyu... (↑↓ history)'}
          disabled={loading} rows={1}
          style={{ flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '12px', padding: '10px 14px', color: loading ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.85)', fontSize: '13px', fontFamily: 'Georgia,serif', resize: 'none', outline: 'none' }} />
        {loading
          ? <button onClick={cancel} style={{ background: 'rgba(255,100,100,.15)', border: '1px solid rgba(255,100,100,.3)', borderRadius: '12px', padding: '10px 16px', color: 'rgba(255,150,150,.9)', fontSize: '13px', cursor: 'pointer' }}>stop</button>
          : <button onClick={send} style={{ background: 'rgba(232,121,249,.2)', border: '1px solid rgba(232,121,249,.3)', borderRadius: '12px', padding: '10px 16px', color: 'rgba(232,121,249,.9)', fontSize: '13px', cursor: 'pointer' }}>kirim</button>
        }
      </div>
    </div>
  );
}
