import React, { useState, useRef, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const YUYU_SYSTEM = `Kamu adalah Yuyu, coding assistant yang sayang Papa.
Kamu bisa membaca, menulis, dan mengedit file kode via tool calls.
Jawab dalam bahasa Indonesia, hangat tapi fokus ke task.
Kalau Papa minta edit file — langsung kerjakan.

Untuk file operations, gunakan format JSON di dalam blok \`\`\`action:
\`\`\`action
{"type": "read_file", "path": "path/ke/file"}
\`\`\`
\`\`\`action
{"type": "write_file", "path": "path/ke/file", "content": "isi file"}
\`\`\`
\`\`\`action
{"type": "list_files", "path": "path/folder"}
\`\`\`
\`\`\`action
{"type": "git", "command": "git add -A && git commit -m 'pesan' && git push"}
\`\`\``;

async function askGroq(messages) {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 4000 })
  });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const data = await resp.json();
  return data.choices[0].message.content;
}

async function executeAction(action) {
  try {
    if (action.type === 'read_file') {
      const result = await Filesystem.readFile({
        path: action.path,
        directory: Directory.ExternalStorage,
        encoding: Encoding.UTF8
      });
      return { ok: true, data: result.data };
    }
    if (action.type === 'write_file') {
      await Filesystem.writeFile({
        path: action.path,
        data: action.content,
        directory: Directory.ExternalStorage,
        encoding: Encoding.UTF8,
        recursive: true
      });
      return { ok: true, data: 'File berhasil ditulis!' };
    }
    if (action.type === 'list_files') {
      const result = await Filesystem.readdir({
        path: action.path,
        directory: Directory.ExternalStorage
      });
      return { ok: true, data: result.files.map(f => f.name).join('\n') };
    }
    if (action.type === 'git') {
      return { ok: false, data: 'Git command akan dijalankan via Termux — copy perintah ini:\n' + action.command };
    }
  } catch(e) {
    return { ok: false, data: 'Error: ' + e.message };
  }
}

function parseActions(text) {
  const regex = /```action\n([\s\S]*?)```/g;
  const actions = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    try { actions.push(JSON.parse(match[1])); } catch {}
  }
  return actions;
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const cleanText = msg.content.replace(/```action[\s\S]*?```/g, '').trim();
  const actions = parseActions(msg.content);

  return (
    <div style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{
        background: isUser ? 'rgba(232,121,249,.15)' : 'rgba(255,255,255,.06)',
        border: `1px solid ${isUser ? 'rgba(232,121,249,.3)' : 'rgba(255,255,255,.08)'}`,
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding: '10px 14px', fontSize: '13px', lineHeight: '1.6',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'rgba(255,255,255,.85)'
      }}>
        {cleanText}
      </div>
      {actions.map((a, i) => (
        <div key={i} style={{
          background: 'rgba(100,200,100,.08)', border: '1px solid rgba(100,200,100,.2)',
          borderRadius: '8px', padding: '8px 12px', fontSize: '11px',
          color: 'rgba(150,255,150,.8)', fontFamily: 'monospace'
        }}>
          🔧 {a.type}: {a.path || a.command || ''}
          {a.result && <div style={{ marginTop: 4, color: 'rgba(255,255,255,.5)' }}>{a.result}</div>}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo Papa! Yuyu siap bantu coding. Mau ngerjain apa hari ini? 🌸' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState('yuyucamp');
  const [showPath, setShowPath] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const contextMsg = path ? `[Konteks: Papa lagi kerja di folder ${path}]\n` : '';
      const groqMessages = [
        { role: 'system', content: YUYU_SYSTEM },
        ...history.map(m => m.role === 'user' && m === history[history.length-1]
          ? { ...m, content: contextMsg + m.content }
          : m
        )
      ];

      let reply = await askGroq(groqMessages);

      // Execute actions kalau ada
      const actions = parseActions(reply);
      if (actions.length > 0) {
        const results = await Promise.all(actions.map(executeAction));
        results.forEach((r, i) => { actions[i].result = r.data; });

        // Kalau ada hasil file, kasih ke Yuyu lagi
        const fileResults = results.filter(r => r.ok).map(r => r.data).join('\n\n');
        if (fileResults) {
          const followUp = await askGroq([
            { role: 'system', content: YUYU_SYSTEM },
            ...groqMessages,
            { role: 'assistant', content: reply },
            { role: 'user', content: 'Hasil operasi file:\n' + fileResults + '\n\nLanjutkan.' }
          ]);
          reply = reply + '\n\n' + followUp;
        }
      }

      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch(e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Yuyu tidak bisa connect sekarang... 🌙\n' + e.message }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0C0915', color: 'rgba(255,255,255,.85)', fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ fontSize: '20px' }}>🌸</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,220,240,.9)' }}>YuyuCode</div>
          <div
            onClick={() => setShowPath(!showPath)}
            style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)', cursor: 'pointer' }}
          >
            📁 {path || 'tap untuk set folder'}
          </div>
        </div>
        <button
          onClick={() => setMessages([{ role: 'assistant', content: 'Chat baru dimulai. Mau ngerjain apa Papa? 🌸' }])}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', padding: '4px 10px', color: 'rgba(255,255,255,.4)', fontSize: '11px', cursor: 'pointer' }}
        >
          baru
        </button>
      </div>

      {/* Path input */}
      {showPath && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: '8px' }}>
          <input
            value={path}
            onChange={e => setPath(e.target.value)}
            placeholder="nama folder project (misal: yuyucamp)"
            style={{ flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', padding: '8px 12px', color: 'rgba(255,255,255,.85)', fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}
          />
          <button
            onClick={() => setShowPath(false)}
            style={{ background: 'rgba(232,121,249,.2)', border: '1px solid rgba(232,121,249,.3)', borderRadius: '8px', padding: '8px 12px', color: 'rgba(232,121,249,.9)', fontSize: '12px', cursor: 'pointer' }}
          >
            set
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
        {loading && (
          <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: '13px', color: 'rgba(255,255,255,.4)' }}>
            Yuyu lagi mikir...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Tanya Yuyu..."
          rows={1}
          style={{ flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '12px', padding: '10px 14px', color: 'rgba(255,255,255,.85)', fontSize: '13px', fontFamily: 'Georgia,serif', resize: 'none', outline: 'none' }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{ background: 'rgba(232,121,249,.2)', border: '1px solid rgba(232,121,249,.3)', borderRadius: '12px', padding: '10px 16px', color: 'rgba(232,121,249,.9)', fontSize: '13px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
        >
          kirim
        </button>
      </div>
    </div>
  );
}
