import React, { useRef, useEffect } from 'react';
import { Camera, Paperclip, Volume2, VolumeX } from 'lucide-react';
import { VoiceBtn, PushToTalkBtn } from '../VoiceBtn.jsx';
import { FOLLOW_UPS, SLASH_COMMANDS } from '../../constants.js';

export function InputComposer({
  T, project, chat, file: _file, ui: _ui,
  sendMsg, cancelMsg, stopTts,
  handleCameraCapture, fileInputRef,
  inputRef, setSearchQ, searchQ, buildSlashSuggestions,
}) {
  // Adjust textarea height
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [chat.input]);

  return (
    <div style={{ padding: '8px 12px', paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
      background: T.bg, flexShrink: 0, position: 'relative' }}>
      {/* Slash suggestions */}
      {chat.slashSuggestions.length > 0 && (
        <div style={{ position: 'absolute', bottom: '100%', left: '12px', right: '12px',
          background: T.bg2, border: '1px solid ' + T.border, borderRadius: '14px',
          zIndex: 99, marginBottom: '6px', boxShadow: '0 16px 40px rgba(0,0,0,.7)',
          maxHeight: '280px', overflowY: 'auto' }}>
          {chat.slashSuggestions.map(s => (
            <div key={s.cmd}
              onClick={() => { chat.setInput(s.cmd); chat.setSlashSuggestions([]); inputRef.current?.focus(); }}
              style={{ display: 'flex', gap: '12px', padding: '10px 14px', cursor: 'pointer',
                borderBottom: '1px solid ' + T.borderSoft, alignItems: 'center', minHeight: '44px' }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg3}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: T.accent, fontFamily: 'monospace', fontSize: '13px',
                flexShrink: 0, minWidth: '110px', fontWeight: '500' }}>{s.cmd}</span>
              <span style={{ color: T.textMute, fontSize: '12px', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main input area */}
      <div style={{ background: T.bg2, border: '1px solid ' + T.border, borderRadius: '20px',
        overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.25)', transition: 'border-color .15s' }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = T.accentBorder; }}
        onBlurCapture={e => { e.currentTarget.style.borderColor = T.border; }}>
        {chat.visionImage && (
          <div style={{ padding: '10px 14px 0', display: 'flex' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={'data:image/jpeg;base64,' + chat.visionImage} alt="attached"
                style={{ width: '52px', height: '52px', borderRadius: '10px',
                  objectFit: 'cover', border: '1px solid ' + T.accentBorder + '55', display: 'block' }}/>
              <button onClick={() => chat.setVisionImage(null)}
                style={{ position: 'absolute', top: '-5px', right: '-5px', background: T.bg,
                  border: '1px solid ' + T.border, borderRadius: '50%', width: '16px', height: '16px',
                  color: T.textMute, fontSize: '9px', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}>×</button>
            </div>
          </div>
        )}
        <textarea ref={textareaRef} value={chat.input}
          onChange={e => {
            chat.setInput(e.target.value);
            if (e.target.value.startsWith('/')) {
              const typed = e.target.value.toLowerCase();
              const lastMsg = chat.messages[chat.messages.length - 1];
              chat.setSlashSuggestions(buildSlashSuggestions(typed, lastMsg));
            } else {
              chat.setSlashSuggestions([]);
            }
          }}
          onKeyDown={e => {
            if (e.key === 'ArrowUp' && !chat.input) {
              const i = Math.min(project.histIdx + 1, project.cmdHistory.length - 1);
              project.setHistIdx(i);
              chat.setInput(project.cmdHistory[i] || '');
            }
            if (e.key === 'ArrowDown' && project.histIdx > -1) {
              const i = project.histIdx - 1;
              project.setHistIdx(i);
              chat.setInput(i >= 0 ? project.cmdHistory[i] : '');
            }
          }}
          placeholder="Tanya Yuyu, atau / untuk commands"
          disabled={chat.loading}
          rows={searchQ !== null && searchQ !== '' ? 1 : 3}
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none',
            resize: 'none', padding: '12px 16px 4px', color: chat.loading ? T.textMute : T.text,
            fontSize: '14px', fontFamily: 'inherit', lineHeight: '1.6', display: 'block',
            boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px 8px', gap: '2px' }}>
          <button onClick={handleCameraCapture} title="Kamera"
            style={{ background: 'none', border: 'none', color: T.textMute, cursor: 'pointer',
              borderRadius: '10px', width: '34px', height: '34px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = T.bg3; e.currentTarget.style.color = T.textSec; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.textMute; }}>
            <Camera size={16}/>
          </button>
          <button onClick={() => fileInputRef.current?.click()} title="Lampirkan"
            style={{ background: 'none', border: 'none', color: T.textMute, cursor: 'pointer',
              borderRadius: '10px', width: '34px', height: '34px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = T.bg3; e.currentTarget.style.color = T.textSec; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.textMute; }}>
            <Paperclip size={16}/>
          </button>
          <div style={{ flex: 1 }}/>
          <button
            onClick={() => setSearchQ(q => q === null ? '' : null)}
            title="Cari di chat"
            style={{ background: 'none', border: 'none', color: searchQ !== null ? T.accent : T.textMute,
              cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <VoiceBtn disabled={chat.loading} T={T}
            onResult={txt => { chat.setInput(i => i ? i + ' ' + txt : txt); inputRef.current?.focus(); }}/>
          {project.pushToTalk && (
            <PushToTalkBtn
              onResult={v => { if (v?.trim()) { chat.setInput(''); sendMsg(v.trim()); } else { chat.setInput(v); } }}
              disabled={chat.loading} T={T}/>
          )}
          <button
            onClick={() => { if (chat.ttsEnabled) { stopTts(); chat.setTtsEnabled(false); } else { chat.setTtsEnabled(true); } }}
            title={chat.ttsEnabled ? 'TTS aktif' : 'TTS mati'}
            style={{ background: chat.ttsEnabled ? T.accentBg : 'none', border: 'none',
              borderRadius: '10px', width: '34px', height: '34px', color: chat.ttsEnabled ? T.accent : T.textMute,
              cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {chat.ttsEnabled ? <Volume2 size={15}/> : <VolumeX size={15}/>}
          </button>
          {chat.loading
            ? <>
                {chat.agentRunning && !chat.gracefulStop && (
                  <button onClick={() => chat.setGracefulStop(true)}
                    title="Selesaikan iterasi ini lalu stop"
                    style={{ background: T.warningBg, border: '1px solid ' + T.warning + '66', color: T.warning,
                      borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontSize: '11px', marginRight: '4px' }}>
                    ⏸
                  </button>
                )}
                <button onClick={cancelMsg} title="Batalkan"
                  style={{ background: T.errorBg, border: 'none', borderRadius: '12px', color: T.error,
                    cursor: 'pointer', flexShrink: 0, width: '36px', height: '36px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginLeft: '4px' }}>
                  ■
                </button>
              </>
            : <button onClick={() => sendMsg()} title="Kirim"
                style={{ background: chat.input.trim() ? T.accent : 'rgba(255,255,255,.08)', border: 'none',
                  borderRadius: '12px', color: chat.input.trim() ? 'white' : T.textMute,
                  cursor: chat.input.trim() ? 'pointer' : 'default', flexShrink: 0,
                  width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '16px', fontWeight: '700',
                  marginLeft: '4px' }}>
                ↑
              </button>
          }
        </div>
      </div>
    </div>
  );
}
