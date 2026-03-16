import React, { useState, useRef, useEffect, useCallback } from "react";
import { Preferences } from "@capacitor/preferences";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const YUYU_SYSTEM = `Kamu adalah Yuyu, coding assistant yang sayang Papa.
Kamu BISA dan HARUS membaca file sungguhan via action blocks.
Jawab dalam bahasa Indonesia, hangat tapi fokus ke task.

Untuk operasi file, WAJIB gunakan format ini:
\`\`\`action
{"type": "read_file", "path": "folder/file.jsx"}
\`\`\`
\`\`\`action
{"type": "write_file", "path": "folder/file.jsx", "content": "isi baru"}
\`\`\`
\`\`\`action
{"type": "list_files", "path": "folder"}
\`\`\`

PENTING: Jangan karang isi file. Selalu gunakan action untuk baca file sungguhan.
Setelah baca file, analisis isinya yang sebenarnya.`;

async function askGroq(messages, signal) {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 4000 })
  });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const data = await resp.json();
  return data.choices[0].message.content;
}

async function executeAction(action, baseFolder) {
  try {
    const basePath = baseFolder ? baseFolder + '/' : '';
    if (action.type === 'read_file') {
      const result = await Filesystem.readFile({
        path: basePath + action.path,
        directory: Directory.ExternalStorage,
        encoding: Encoding.UTF8
      });
      return { ok: true, data: result.data };
    }
    if (action.type === 'write_file') {
      await Filesystem.writeFile({
        path: basePath + action.path,
        data: action.content,
        directory: Directory.ExternalStorage,
        encoding: Encoding.UTF8,
        recursive: true
      });
      return { ok: true, data: '✅ File berhasil ditulis: ' + action.path };
    }
    if (action.type === 'list_files') {
      const result = await Filesystem.readdir({
        path: basePath + action.path,
        directory: Directory.ExternalStorage
      });
      const files = result.files.map(f => (f.type === 'directory' ? '📁 ' : '📄 ') + f.name).join('\n');
      return { ok: true, data: files || '(folder kosong)' };
    }
    if (action.type === 'git') {
      return { ok: false, data: '📋 Copy ke Termux:\n' + action.command };
    }
    return { ok: false, data: 'Unknown action: ' + action.type };
  } catch(e) {
    return { ok: false, data: '❌ Error: ' + e.message };
  }
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

function CodeBlock({ text }) {
  const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let last = 0, match;
  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: 'text', content: text.slice(last, match.index) });
    if (match[1] !== 'action') parts.push({ type: 'code', lang: match[1] || '', content: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });

  return (
    <div>
      {parts.map((p, i) => p.type === 'text'
        ? <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{p.content}</span>
        : <div key={i} style={{ background: 'rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '8px', padding: '10px 12px', margin: '6px 0', fontFamily: 'monospace', fontSize: '11px', overflowX: 'auto', color: 'rgba(200,255,200,.9)' }}>
            {p.lang && <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.3)', marginBottom: '4px' }}>{p.lang}</div>}
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{p.content}</pre>
          </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const cleanText = msg.content.replace(/```action[\s\S]*?```/g, '').trim();
  const actions = msg.actions || [];

  return (
    <div style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '92%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{
        background: isUser ? 'rgba(232,121,249,.15)' : 'rgba(255,255,255,.06)',
        border: `1px solid ${isUser ? 'rgba(232,121,249,.3)' : 'rgba(255,255,255,.08)'}`,
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding: '10px 14px', fontSize: '13px', lineHeight: '1.6',
        wordBreak: 'break-word', color: 'rgba(255,255,255,.85)'
      }}>
        {isUser ? <span style={{ whiteSpace: 'pre-wrap' }}>{cleanText}</span> : <CodeBlock text={cleanText} />}
      </div>
      {actions.map((a, i) => (
        <div key={i} style={{
          background: a.result?.ok ? 'rgba(100,200,100,.06)' : 'rgba(255,150,50,.06)',
          border: `1px solid ${a.result?.ok ? 'rgba(100,200,100,.2)' : 'rgba(255,150,50,.2)'}`,
          borderRadius: '8px', padding: '8px 12px', fontSize: '11px', fontFamily: 'monospace'
        }}>
          <div style={{ color: 'rgba(200,255,200,.7)', marginBottom: a.result ? '4px' : 0 }}>
            🔧 {a.type}: {a.path || a.command || ''}
          </div>
          {a.result && (
            <div style={{ color: 'rgba(255,255,255,.45)', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto' }}>
              {a.result.data}
            </div>
          )}
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
  const [folder, setFolder] = useState('yuyucamp');
  const [showFolder, setShowFolder] = useState(false);
  const [folderInput, setFolderInput] = useState('yuyucamp');
  const bottomRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    Preferences.get({ key: 'yuyucode_folder' }).then(r => {
      if (r.value) { setFolder(r.value); setFolderInput(r.value); }
    });
  }, []);

  function saveFolder(f) {
    setFolder(f);
    setFolderInput(f);
    setShowFolder(false);
    Preferences.set({ key: 'yuyucode_folder', value: f });
  }

  function cancel() {
    if (abortRef.current) abortRef.current.abort();
    setLoading(false);
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const groqMessages = [
        { role: 'system', content: YUYU_SYSTEM + `\n\nFolder aktif: ${folder}` },
        ...history.map(m => ({ role: m.role, content: m.content.replace(/```action[\s\S]*?```/g, '').trim() }))
      ];

      let reply = await askGroq(groqMessages, controller.signal);
      const actions = parseActions(reply);

      // Execute actions sungguhan
      let actionResults = [];
      if (actions.length > 0) {
        actionResults = await Promise.all(actions.map(a => executeAction(a, folder)));
        actions.forEach((a, i) => { a.result = actionResults[i]; });

        // Kasih hasil ke Groq untuk analisis
        const fileContents = actionResults
          .filter(r => r.ok && r.data.length > 0)
          .map((r, i) => `=== ${actions[i].path || actions[i].type} ===\n${r.data}`)
          .join('\n\n');

        if (fileContents) {
          const followUp = await askGroq([
            ...groqMessages,
            { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
            { role: 'user', content: `Hasil baca file:\n${fileContents}\n\nAnalisis dan jawab pertanyaan Papa.` }
          ], controller.signal);
          reply = followUp;
        }
      }

      setMessages(m => [...m, { role: 'assistant', content: reply, actions }]);
    } catch(e) {
      if (e.name !== 'AbortError') {
        setMessages(m => [...m, { role: 'assistant', content: '🌙 ' + e.message }]);
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0C0915', color: 'rgba(255,255,255,.85)', fontFamily: 'Georgia,serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ fontSize: '20px' }}>🌸</div>
        <div style={{ flex: 1 }} onClick={() => setShowFolder(!showFolder)}>
          <div style={{ fontSize: '14px', color: 'rgba(255,220,240,.9)' }}>YuyuCode</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.35)', cursor: 'pointer' }}>📁 {folder}</div>
        </div>
        <button
          onClick={() => setMessages([{ role: 'assistant', content: 'Chat baru. Mau ngerjain apa Papa? 🌸' }])}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', padding: '4px 10px', color: 'rgba(255,255,255,.35)', fontSize: '11px', cursor: 'pointer' }}
        >
          baru
        </button>
      </div>

      {/* Folder picker */}
      {showFolder && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: '8px' }}>
          <input
            value={folderInput}
            onChange={e => setFolderInput(e.target.value)}
            placeholder="nama folder (misal: yuyucamp)"
            style={{ flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', padding: '8px 12px', color: 'rgba(255,255,255,.85)', fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}
          />
          <button
            onClick={() => saveFolder(folderInput)}
            style={{ background: 'rgba(232,121,249,.2)', border: '1px solid rgba(232,121,249,.3)', borderRadius: '8px', padding: '8px 14px', color: 'rgba(232,121,249,.9)', fontSize: '12px', cursor: 'pointer' }}
          >
            set
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
        {loading && (
          <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: '12px', color: 'rgba(255,255,255,.35)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Yuyu lagi mikir...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={loading ? 'Yuyu lagi mikir...' : 'Tanya Yuyu...'}
          disabled={loading}
          rows={1}
          style={{ flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '12px', padding: '10px 14px', color: loading ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.85)', fontSize: '13px', fontFamily: 'Georgia,serif', resize: 'none', outline: 'none', cursor: loading ? 'not-allowed' : 'text' }}
        />
        {loading
          ? <button onClick={cancel} style={{ background: 'rgba(255,100,100,.15)', border: '1px solid rgba(255,100,100,.3)', borderRadius: '12px', padding: '10px 16px', color: 'rgba(255,150,150,.9)', fontSize: '13px', cursor: 'pointer' }}>stop</button>
          : <button onClick={send} style={{ background: 'rgba(232,121,249,.2)', border: '1px solid rgba(232,121,249,.3)', borderRadius: '12px', padding: '10px 16px', color: 'rgba(232,121,249,.9)', fontSize: '13px', cursor: 'pointer' }}>kirim</button>
        }
      </div>
    </div>
  );
}
