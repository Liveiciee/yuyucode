import React, { useState } from "react";

export function VoiceBtn({ onResult, disabled, T }) {
  const [listening, setListening]   = useState(false);
  const [partial,   setPartial]     = useState('');

  const accent  = T?.accent  || '#7c3aed';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.3)';
  const error   = T?.error   || '#f87171';
  const errorBg  = T?.errorBg  || 'rgba(248,113,113,.2)';
  const textMute = T?.textMute || 'rgba(255,255,255,.3)';
  const border   = T?.border   || 'rgba(255,255,255,.08)';
  const bg3      = T?.bg3      || 'rgba(255,255,255,.04)';

  async function toggle() {
    if (listening) {
      try {
        const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
        await SpeechRecognition.stop();
      } catch (_e) { }
      setListening(false);
      setPartial('');
      return;
    }
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      const available = await SpeechRecognition.available();
      if (available.available) {
        await SpeechRecognition.requestPermissions();
        // Show partial results
        SpeechRecognition.addListener('partialResults', (data) => {
          if (data.matches && data.matches.length > 0) setPartial(data.matches[0]);
        });
        const result = await SpeechRecognition.start({
          language: 'id-ID', maxResults: 1, partialResults: true, popup: false,
        });
        if (result.matches && result.matches.length > 0) onResult(result.matches[0]);
        setListening(false);
        setPartial('');
        return;
      }
    } catch (_e) { }
    // Web fallback
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition tidak tersedia'); return; }
    const r = new SR();
    r.lang = 'id-ID'; r.interimResults = true;
    r.onresult = e => {
      const transcript = e.results[0][0].transcript;
      if (e.results[0].isFinal) { onResult(transcript); setListening(false); setPartial(''); }
      else setPartial(transcript);
    };
    r.onerror = () => { setListening(false); setPartial(''); };
    r.onend   = () => { setListening(false); setPartial(''); };
    r.start(); setListening(true);
  }

  return (
    <div style={{ position:'relative', flexShrink:0 }}>
      <button onClick={toggle} disabled={disabled}
        style={{
          background: listening ? errorBg : bg3,
          border: '1px solid ' + (listening ? error + '55' : border),
          borderRadius:'12px', color: listening ? error : textMute,
          fontSize:'15px', cursor:'pointer',
          minWidth:'44px', minHeight:'44px',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all .2s',
        }}>
        {listening ? '⏹' : '🎤'}
      </button>
      {partial && (
        <div style={{
          position:'absolute', bottom:'calc(100% + 8px)', right:0,
          background:'#1a1a1f', border:'1px solid ' + accentBorder,
          borderRadius:'10px', padding:'8px 12px',
          fontSize:'12px', color: accent, whiteSpace:'nowrap',
          maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis',
          boxShadow:'0 8px 24px rgba(0,0,0,.5)',
        }}>
          {partial}
        </div>
      )}
    </div>
  );
}

export function PushToTalkBtn({ onResult, disabled, T }) {
  const [recording, setRecording] = useState(false);

  const accent  = T?.accent  || '#7c3aed';
  const accentBg = T?.accentBg || 'rgba(124,58,237,.15)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.3)';
  const error   = T?.error   || '#f87171';
  const errorBg  = T?.errorBg  || 'rgba(248,113,113,.3)';

  async function onPressIn() {
    setRecording(true);
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      await SpeechRecognition.requestPermissions();
      await SpeechRecognition.start({ language: 'id-ID', maxResults: 1, partialResults: false, popup: false });
    } catch (_e) { }
  }

  async function onPressOut() {
    setRecording(false);
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      const result = await SpeechRecognition.stop();
      if (result?.matches?.length > 0) onResult(result.matches[0]);
    } catch (_e) { }
  }

  return (
    <button
      onMouseDown={onPressIn} onMouseUp={onPressOut}
      onTouchStart={e=>{e.preventDefault();onPressIn();}}
      onTouchEnd={e=>{e.preventDefault();onPressOut();}}
      disabled={disabled}
      style={{
        background: recording ? errorBg : accentBg,
        border: '1px solid ' + (recording ? error + '55' : accentBorder),
        borderRadius:'12px', color: recording ? error : accent,
        fontSize:'15px', cursor:'pointer',
        minWidth:'44px', minHeight:'44px',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all .2s',
      }}>
      {recording ? '🔴' : '🎙'}
    </button>
  );
}
