// ── AppChat ───────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Pin, Eye, ScrollText, Camera, Paperclip, Volume2, VolumeX, Loader, Play } from 'lucide-react';
import { hl } from '../utils.js';
import { MsgBubble, StreamingBubble } from './MsgBubble.jsx';
import { KeyboardRow } from './KeyboardRow.jsx';
import { GlobalFindReplace } from './GlobalFindReplace.jsx';
import { VoiceBtn, PushToTalkBtn } from './VoiceBtn.jsx';
import { useWakeWord } from '../hooks/useWakeWord.js';
import { FOLLOW_UPS, SLASH_COMMANDS, GIT_SHORTCUTS } from '../constants.js';

const FileEditor = lazy(() => import("./FileEditor.jsx"));
const Terminal = lazy(() => import("./Terminal.jsx"));
const LivePreview = lazy(() => import("./LivePreview.jsx"));

export function AppChat({
  T, ui, project, file, chat,
  sendMsg, cancelMsg, retryLast, continueMsg,
  handleApprove, handlePlanApprove,
  handleCameraCapture, fileInputRef,
  runShortcut, stopTts,
  visibleMessages,
}) {
  const chatRef       = useRef(null);
  const bottomRef     = useRef(null);
  const [searchQ, setSearchQ] = useState(null);
  const inputRef      = useRef(null);

  useWakeWord({
    enabled: project.pushToTalk,
    onActivated: () => {
      if (!chat.loading) {
        inputRef.current?.focus();
      }
    },
  });
  const fileEditorRef = useRef(null);

  const editorConfig = {
    vimMode:     ui.vimMode,
    emmet:       true,
    ghostText:   ui.ghostTextEnabled,
    minimap:     ui.showMinimap,
    lint:        ui.lintEnabled,
    tsLsp:       ui.tsLspEnabled,
    blame:       ui.blameEnabled,
    multiCursor: ui.multiCursor,
    stickyScroll: ui.stickyScroll,
    collab:      ui.collabEnabled,
    collabRoom:  ui.collabRoom,
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat.messages, chat.streaming]);

  function handleKeyboardInsert(text) {
    if (file.activeTab === 'file' && file.editMode && fileEditorRef.current) {
      fileEditorRef.current.insert(text);
      return;
    }
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end   = el.selectionEnd   ?? el.value.length;
    const val   = chat.input;
    chat.setInput(val.slice(0, start) + text + val.slice(end));
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + text.length;
      el.focus();
    });
  }

  function buildSlashSuggestions(typed, lastMsg) {
    const matched = SLASH_COMMANDS.filter(s =>
      s.cmd.startsWith(typed) || s.cmd.includes(typed.slice(1))
    );
    const lastContent = (lastMsg?.content || '').toLowerCase();
    const contextBoost = [];
    if (typed === '/') {
      if (lastContent.includes('error') || lastContent.includes('❌') || lastContent.includes('failed'))
        contextBoost.push('/fix', '/review', '/lint');
      if (lastContent.includes('function') || lastContent.includes('const') || lastContent.includes('def'))
        contextBoost.push('/test', '/review');
      if (lastContent.includes('file terbuka') || lastContent.includes('opened'))
        contextBoost.push('/test', '/review', '/simplify');
      if (lastContent.includes('selesai') || lastContent.includes('done') || lastContent.includes('✅'))
        contextBoost.push('/review --all', '/lint', '/test');
    }
    return [...matched].sort((a, b) => {
      const aBoost = contextBoost.includes(a.cmd) ? -1 : 0;
      const bBoost = contextBoost.includes(b.cmd) ? -1 : 0;
      return aBoost - bBoost;
    }).slice(0, 8);
  }

  const activeTab = file.openTabs[file.activeTabIdx] || null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Multi-tab bar */}
      <div style={{
        display: 'flex', borderBottom: '1px solid ' + T.border,
        flexShrink: 0, background: T.bg, minHeight: '48px',
        alignItems: 'stretch', padding: '0 6px', gap: '2px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        <button onClick={() => file.setActiveTab('chat')}
          style={{
            padding: '0 14px', flexShrink: 0,
            background: file.activeTab === 'chat' ? T.accentBg : 'none',
            border: file.activeTab === 'chat' ? '1px solid ' + T.accentBorder : '1px solid transparent',
            borderRadius: '8px', margin: '6px 2px',
            color: file.activeTab === 'chat' ? T.accent : T.textMute,
            fontSize: '13px', cursor: 'pointer',
            fontWeight: file.activeTab === 'chat' ? '600' : '400',
          }}>
          Chat
        </button>

        {file.openTabs.map((tab, idx) => {
          const isActive = file.activeTab === 'file' && file.activeTabIdx === idx;
          const name = tab.path.split('/').pop();
          return (
            <div key={tab.path} style={{
              display: 'flex', alignItems: 'center', gap: '0', flexShrink: 0,
              background: isActive ? T.bg3 : 'none',
              border: isActive ? '1px solid ' + T.border : '1px solid transparent',
              borderRadius: '8px', margin: '6px 2px',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => { file.setActiveTabIdx(idx); file.setActiveTab('file'); file.setEditMode(false); }}
                style={{
                  background: 'none', border: 'none', padding: '0 4px 0 10px',
                  color: isActive ? T.text : T.textMute,
                  fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  maxWidth: '130px', minHeight: '36px',
                }}>
                {tab.dirty && <span style={{ color: T.warning, fontSize: '9px', flexShrink: 0 }}>●</span>}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </span>
              </button>
              {isActive && (
                <button
                  onClick={() => file.setEditMode(!file.editMode)}
                  style={{
                    background: file.editMode ? 'rgba(245,158,11,.15)' : 'none',
                    border: 'none', padding: '0 6px',
                    color: file.editMode ? '#f59e0b' : T.textMute,
                    fontSize: '10px', cursor: 'pointer', minHeight: '36px',
                  }}>
                  {file.editMode ? 'edit' : 'view'}
                </button>
              )}
              <button
                onClick={e => { e.stopPropagation(); file.closeTab(idx); }}
                style={{
                  background: 'none', border: 'none', padding: '0 7px',
                  color: T.textMute, fontSize: '14px', cursor: 'pointer',
                  minHeight: '36px', lineHeight: 1,
                }}>
                ×
              </button>
            </div>
          );
        })}

        <div style={{ flex: 1 }}/>

        {file.activeTab === 'file' && (
          <button
            onClick={() => ui.setShowLivePreview(!ui.showLivePreview)}
            title="Live Preview"
            style={{
              padding: '0 10px', flexShrink: 0,
              background: ui.showLivePreview ? T.accentBg : 'none',
              border: ui.showLivePreview ? '1px solid ' + T.accentBorder : '1px solid transparent',
              borderRadius: '8px', margin: '6px 2px',
              color: ui.showLivePreview ? T.accent : T.textMute,
              fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
            <Play size={10}/> Preview
          </button>
        )}

        <button onClick={() => ui.setShowTerminal(!ui.showTerminal)}
          style={{
            padding: '0 12px', flexShrink: 0,
            background: ui.showTerminal ? T.bg3 : 'none',
            border: ui.showTerminal ? '1px solid ' + T.border : '1px solid transparent',
            borderRadius: '8px', margin: '6px 2px',
            color: ui.showTerminal ? T.textSec : T.textMute,
            fontSize: '13px', cursor: 'pointer', fontFamily: 'monospace',
          }}>
          $
        </button>
      </div>

      {/* Chat area - simplified for brevity */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 0 8px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 4px' }}>
          {visibleMessages.map((m, i) => (
            <MsgBubble key={i} msg={m} isLast={i === chat.messages.length - 1} T={T}
              onApprove={m.actions?.some(a => (a.type === 'write_file' || a.type === 'patch_file') && !a.executed) ? (ok, path) => handleApprove(i, ok, path) : null}
              onPlanApprove={m.content?.includes('📋 **Plan (') && !m.planApproved ? (ok) => handlePlanApprove(i, ok) : null}
              onRetry={i === chat.messages.length - 1 && m.role === 'user' ? retryLast : null}
              onContinue={i === chat.messages.length - 1 && m.role === 'assistant' && m.content.trim().endsWith('CONTINUE') ? continueMsg : null}
              onAutoFix={i === chat.messages.length - 1 ? () => sendMsg('Ada error di output. Analisis dan fix otomatis.') : null}
              onDelete={() => chat.deleteMessage(i)}
              onEdit={(newContent) => chat.editMessage(i, newContent)}
            />
          ))}
          {chat.streaming && <StreamingBubble text={chat.streaming} T={T}/>}
          <div ref={bottomRef}/>
        </div>
      </div>

      {/* File Editor, Terminal, LivePreview sections with Suspense - simplified */}
      {file.activeTab === 'file' && activeTab && file.editMode && !ui.showTerminal && !ui.showLivePreview && (
        <Suspense fallback={<div style={{ padding: 20 }}>Loading editor...</div>}>
          <FileEditor
            ref={fileEditorRef}
            T={T}
            tab={activeTab}
            editorConfig={editorConfig}
            folder={project.folder}
            onSave={c => file.saveFile(c, msg => chat.setMessages(m => [...m, { role: 'assistant', content: msg, actions: [] }]))}
            onClose={() => file.setEditMode(false)}
          />
        </Suspense>
      )}

      {ui.showTerminal && (
        <Suspense fallback={<div style={{ padding: 20 }}>Loading terminal...</div>}>
          <Terminal folder={project.folder} cmdHistory={project.cmdHistory}
            addHistory={project.addHistory} T={T}
            onSendToAI={txt => { ui.setShowTerminal(false); file.setActiveTab('chat'); sendMsg(txt); }}/>
        </Suspense>
      )}

      {file.activeTab === 'file' && ui.showLivePreview && !ui.showTerminal && (
        <Suspense fallback={<div style={{ padding: 20 }}>Loading preview...</div>}>
          <LivePreview tabs={file.openTabs} T={T} onClose={() => ui.setShowLivePreview(false)} />
        </Suspense>
      )}

      {/* Input area simplified */}
      <div style={{ padding: '8px 12px', background: T.bg, flexShrink: 0 }}>
        <div style={{ background: T.bg2, border: '1px solid ' + T.border, borderRadius: '20px', overflow: 'hidden' }}>
          <textarea ref={inputRef} value={chat.input}
            onChange={e => chat.setInput(e.target.value)}
            placeholder="Tanya Yuyu, atau / untuk commands"
            disabled={chat.loading}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', padding: '12px 16px', color: chat.loading ? T.textMute : T.text,
              fontSize: '14px', fontFamily: 'inherit', lineHeight: '1.6' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 8px 8px' }}>
            <button onClick={() => sendMsg()} disabled={!chat.input.trim() || chat.loading}
              style={{ background: chat.input.trim() ? T.accent : 'rgba(255,255,255,.08)', border: 'none',
                borderRadius: '12px', color: chat.input.trim() ? 'white' : T.textMute,
                cursor: chat.input.trim() ? 'pointer' : 'default', width: '36px', height: '36px' }}>
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
