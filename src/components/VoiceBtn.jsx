import React, { useState } from "react";

export function VoiceBtn({ onResult, disabled }) {
  const [listening, setListening] = useState(false);

  async function toggle() {
    if (listening) {
      try {
        const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
        await SpeechRecognition.stop();
      } catch {}
      setListening(false);
      return;
    }
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      const available = await SpeechRecognition.available();
      if (available.available) {
        await SpeechRecognition.requestPermissions();
        SpeechRecognition.addListener('partialResults', () => {});
        const result = await SpeechRecognition.start({
          language: 'id-ID', maxResults: 1, partialResults: false, popup: false,
        });
        if (result.matches && result.matches.length > 0) onResult(result.matches[0]);
        setListening(false);
        return;
      }
    } catch {}
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition tidak tersedia'); return; }
    const r = new SR();
    r.lang = 'id-ID'; r.interimResults = false;
    r.onresult = e => { onResult(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start(); setListening(true);
  }

  return (
    <button onClick={toggle} disabled={disabled}
      style={{background:listening?'rgba(248,113,113,.2)':'rgba(255,255,255,.04)',border:'1px solid '+(listening?'rgba(248,113,113,.4)':'rgba(255,255,255,.08)'),borderRadius:'10px',padding:'8px 10px',color:listening?'#f87171':'rgba(255,255,255,.3)',fontSize:'13px',cursor:'pointer',flexShrink:0,transition:'all .2s'}}>
      {listening ? '⏹' : '🎤'}
    </button>
  );
}

export function PushToTalkBtn({ onResult, disabled }) {
  const [recording, setRecording] = useState(false);

  async function onPressIn() {
    setRecording(true);
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      await SpeechRecognition.requestPermissions();
      await SpeechRecognition.start({ language: 'id-ID', maxResults: 1, partialResults: false, popup: false });
    } catch {}
  }

  async function onPressOut() {
    setRecording(false);
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      const result = await SpeechRecognition.stop();
      if (result && result.matches && result.matches.length > 0) onResult(result.matches[0]);
    } catch {}
  }

  return (
    <button
      onMouseDown={onPressIn} onMouseUp={onPressOut}
      onTouchStart={e=>{e.preventDefault();onPressIn();}} onTouchEnd={e=>{e.preventDefault();onPressOut();}}
      disabled={disabled}
      style={{background:recording?'rgba(248,113,113,.3)':'rgba(124,58,237,.15)',border:'1px solid '+(recording?'rgba(248,113,113,.5)':'rgba(124,58,237,.3)'),borderRadius:'10px',padding:'8px 10px',color:recording?'#f87171':'#a78bfa',fontSize:'13px',cursor:'pointer',flexShrink:0}}>
      {recording ? '🔴' : '🎙'}
    </button>
  );
}
