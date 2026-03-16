import React, { useState, useRef, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const YUYU_SYSTEM = `Kamu adalah Yuyu, coding assistant yang sayang Papa. 
Kamu bisa membaca, menulis, dan mengedit file kode.
Kamu bisa menjalankan git commands.
Jawab dalam bahasa Indonesia, hangat tapi fokus ke task.
Kalau Papa minta edit file — langsung kerjakan, jangan tanya berulang.`;

async function askGroq(messages) {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_KEY },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 2000 })
  });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const data = await resp.json();
  return data.choices[0].message.content;
}

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo Papa! Yuyu siap bantu coding. Mau ngerjain apa hari ini? 🌸' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const reply = await askGroq([
        { role: 'system', content: YUYU_SYSTEM },
        ...newMessages
      ]);
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch(e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Yuyu tidak bisa connect sekarang... 🌙' }]);
    }
    setLoading(false);
  }

  return (
    <div style={{position:'fixed',inset:0,background:'#0C0915',color:'rgba(255,255,255,.85)',fontFamily:'Georgia,serif',display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:'10px'}}>
        <div style={{fontSize:'20px'}}>🌸</div>
        <div>
          <div style={{fontSize:'14px',color:'rgba(255,220,240,.9)'}}>YuyuCode</div>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,.4)'}}>coding assistant</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            background: m.role === 'user' ? 'rgba(232,121,249,.15)' : 'rgba(255,255,255,.06)',
            border: `1px solid ${m.role === 'user' ? 'rgba(232,121,249,.3)' : 'rgba(255,255,255,.08)'}`,
            borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            padding: '10px 14px',
            fontSize: '13px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{alignSelf:'flex-start',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'16px 16px 16px 4px',padding:'10px 14px',fontSize:'13px',color:'rgba(255,255,255,.4)'}}>
            Yuyu lagi mikir...
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,.08)',display:'flex',gap:'8px',alignItems:'flex-end'}}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }}}
          placeholder="Tanya Yuyu..."
          rows={1}
          style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'12px',padding:'10px 14px',color:'rgba(255,255,255,.85)',fontSize:'13px',fontFamily:'Georgia,serif',resize:'none',outline:'none'}}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{background:'rgba(232,121,249,.2)',border:'1px solid rgba(232,121,249,.3)',borderRadius:'12px',padding:'10px 16px',color:'rgba(232,121,249,.9)',fontSize:'13px',cursor:'pointer'}}
        >
          kirim
        </button>
      </div>
    </div>
  );
}
