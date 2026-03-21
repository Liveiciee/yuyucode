// ── AppChat ───────────────────────────────────────────────────────────────────
// Center area: multi-tab bar, chat, file viewer, file editor, terminal,
// live preview, keyboard row, follow-up chips, quick bar, and composer.
import React, { useState, useRef, useEffect } from 'react';
import { Pin, Eye, ScrollText, Camera, Paperclip, Volume2, VolumeX, Loader, Play } from 'lucide-react';
import { hl } from '../utils.js';
import { MsgBubble, StreamingBubble } from './MsgBubble.jsx';
import { FileEditor } from './FileEditor.jsx';
import { Terminal } from './Terminal.jsx';
import { LivePreview } from './LivePreview.jsx';
import { KeyboardRow } from './KeyboardRow.jsx';
import { GlobalFindReplace } from './GlobalFindReplace.jsx';
import { VoiceBtn, PushToTalkBtn } from './VoiceBtn.jsx';
import { FOLLOW_UPS, SLASH_COMMANDS, GIT_SHORTCUTS } from '../constants.js';

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
  const [searchQ, setSearchQ] = useState(null); // null=hidden, ''=open
  const inputRef      = useRef(null);
  const fileEditorRef = useRef(null);

  // editorConfig derived from ui prefs
  const editorConfig = {
    vimMode:     ui.vimMode,
    emmet:       true,
    ghostText:   ui.ghostTextEnabled,
    minimap:     ui.showMinimap,
    lint:        ui.lintEnabled,
    // Fase 3
    tsLsp:       ui.tsLspEnabled,
    blame:       ui.blameEnabled,
    multiCursor: ui.multiCursor,
    stickyScroll: ui.stickyScroll,
    collab:      ui.collabEnabled,
    collabRoom:  ui.collabRoom,
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat.messages, chat.streaming]);

  // ── Keyboard row insert handler ──────────────────────────────────────────
  function handleKeyboardInsert(text) {
    // If file editor is visible and focused → insert into CM
    if (file.activeTab === 'file' && file.editMode && fileEditorRef.current) {
      fileEditorRef.current.insert(text);
      return;
    }
    // Fallback: insert into textarea
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

  // Active tab object
  const activeTab = file.openTabs[file.activeTabIdx] || null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── MULTI-TAB BAR ── */}
      <div style={{
        display: 'flex', borderBottom: '1px solid ' + T.border,
        flexShrink: 0, background: T.bg, minHeight: '48px',
        alignItems: 'stretch', padding: '0 6px', gap: '2px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {/* Chat tab */}
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

        {/* File tabs */}
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
              {/* Edit mode toggle */}
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
              {/* Close button */}
              <button
                onClick={e => { e.stopPropagation(); file.closeTab(idx); }}
                style={{
                  background: 'none', border: 'none', padding: '0 7px',
                  color: T.textMute, fontSize: '14px', cursor: 'pointer',
                  minHeight: '36px', lineHeight: 1,
                }}
                onMouseEnter={e => e.currentTarget.style.color = T.text}
                onMouseLeave={e => e.currentTarget.style.color = T.textMute}>
                ×
              </button>
            </div>
          );
        })}

        <div style={{ flex: 1 }}/>

        {/* Live Preview button */}
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

        {/* Terminal toggle */}
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

      {/* ── CHAT ── */}
      {file.activeTab === 'chat' && !ui.showTerminal && (
        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 0 8px' }}>
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
            {chat.loading && !chat.streaming && (
              <div style={{ padding: '4px 16px 2px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader size={12} style={{ color: T.accent, animation: 'pulse 1.8s ease-in-out infinite', flexShrink: 0 }}/>
                  <span style={{ color: T.textMute, fontSize: '12px', fontFamily: 'monospace' }}>
                    {chat.agentStatus || 'mikir···'}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
        </div>
      )}

      {/* ── FILE VIEWER (read-only) ── */}
      {file.activeTab === 'file' && activeTab && !file.editMode && !ui.showTerminal && !ui.showLivePreview && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ height: '44px', padding: '0 12px', borderBottom: '1px solid ' + T.border,
            display: 'flex', alignItems: 'center', gap: '6px', background: T.bg2,
            position: 'sticky', top: 0 }}>
            <span style={{ fontSize: '11px', color: T.textMute, fontFamily: 'monospace',
              flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeTab.path}
            </span>
            {[
              { label: <Pin size={12}/>, active: file.pinnedFiles.includes(activeTab.path), color: T.accent, bg: T.accentBg, border: T.accentBorder, onClick: () => file.togglePin(activeTab.path) },
              { label: <Eye size={12}/>, active: false, color: T.textSec, bg: T.bg3, border: T.border, onClick: () => ui.setShowBlame(true) },
              { label: <ScrollText size={12}/>, active: false, color: T.textSec, bg: T.bg3, border: T.border, onClick: () => ui.setShowFileHistory(true) },
              { label: '+ctx', active: false, color: T.success, bg: T.successBg, border: T.success + '33', onClick: () => { chat.setMessages(m => [...m, { role: 'user', content: 'Yu, ini konteks file ' + activeTab.path + ':\n```\n' + (activeTab.content || '').slice(0, 2000) + '\n```' }]); file.setActiveTab('chat'); } },
              { label: 'Tanya', active: false, color: T.accent, bg: T.accentBg, border: T.accentBorder, onClick: () => sendMsg('Yu, jelaskan file ' + activeTab.path) },
            ].map((b, i) => (
              <button key={i} onClick={b.onClick}
                style={{ background: b.active ? b.bg : T.bg3, border: '1px solid ' + (b.active ? b.border : T.border),
                  borderRadius: '8px', padding: '5px 10px', color: b.active ? b.color : T.textSec,
                  fontSize: '11px', cursor: 'pointer', flexShrink: 0, minHeight: '32px' }}
                onMouseEnter={e => { e.currentTarget.style.background = b.bg; e.currentTarget.style.borderColor = b.border; e.currentTarget.style.color = b.color; }}
                onMouseLeave={e => { e.currentTarget.style.background = b.active ? b.bg : T.bg3; e.currentTarget.style.borderColor = b.active ? b.border : T.border; e.currentTarget.style.color = b.active ? b.color : T.textSec; }}>
                {b.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.6' }}>
            <div style={{ padding: '8px 6px', color: T.textMute, textAlign: 'right',
              userSelect: 'none', borderRight: '1px solid ' + T.border, minWidth: '36px',
              flexShrink: 0, background: T.bg3 }}>
              {(activeTab.content || '').split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <pre style={{ margin: 0, padding: '8px 12px', whiteSpace: 'pre-wrap',
              wordBreak: 'break-word', color: T.textSec, flex: 1 }}
              // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml
              // safe: hl() escapes &, <, > before any processing
              dangerouslySetInnerHTML={{ __html: hl(activeTab.content || '', activeTab.path?.split('.').pop() || '') }}/* hl() sanitizes input: escapes &<> before adding only <span> tags *//>
          </div>
        </div>
      )}

      {/* ── FILE EDITOR (CodeMirror) ── */}
      {file.activeTab === 'file' && activeTab && file.editMode && !ui.showTerminal && !ui.showLivePreview && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {file.splitView ? (
            <>
              <div style={{ flex: 1, overflow: 'hidden', borderRight: '1px solid ' + T.border }}>
                <FileEditor
                  ref={fileEditorRef}
                  T={T}
                  tab={activeTab}
                  editorConfig={editorConfig}
                  folder={project.folder}
                  onSave={c => file.saveFile(c, msg => chat.setMessages(m => [...m, { role: 'assistant', content: msg, actions: [] }]))}
                  onClose={() => file.setEditMode(false)}
                />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
                {chat.messages.slice(-10).map((m, i) => (
                  <div key={i} style={{ padding: '4px 12px' }}>
                    <div style={{ fontSize: '10px', color: T.textMute, marginBottom: '2px' }}>{m.role === 'user' ? 'Papa' : 'Yuyu'}</div>
                    <div style={{ fontSize: '12px', color: T.textSec, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {m.content.replace(/```action[\s\S]*?```/g, '').slice(0, 300)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <FileEditor
              ref={fileEditorRef}
              T={T}
              tab={activeTab}
              editorConfig={editorConfig}
              folder={project.folder}
              onSave={c => file.saveFile(c, msg => chat.setMessages(m => [...m, { role: 'assistant', content: msg, actions: [] }]))}
              onClose={() => file.setEditMode(false)}
            />
          )}
        </div>
      )}

      {/* ── LIVE PREVIEW ── */}
      {file.activeTab === 'file' && ui.showLivePreview && !ui.showTerminal && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <LivePreview
            tabs={file.openTabs}
            T={T}
            onClose={() => ui.setShowLivePreview(false)}
          />
        </div>
      )}

      {/* ── GLOBAL FIND & REPLACE ── */}
      {ui.showGlobalFind && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
          <GlobalFindReplace
            folder={project.folder}
            onOpenFile={p => { file.openFile(p); ui.setShowGlobalFind(false); }}
            onClose={() => ui.setShowGlobalFind(false)}
            T={T}
          />
        </div>
      )}

      {/* ── TERMINAL ── */}
      {ui.showTerminal && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Terminal folder={project.folder} cmdHistory={project.cmdHistory}
            addHistory={project.addHistory} T={T}
            onSendToAI={txt => { ui.setShowTerminal(false); file.setActiveTab('chat'); sendMsg(txt); }}/>
        </div>
      )}

      {/* ── KEYBOARD ROW (file edit mode only) ── */}
      {file.activeTab === 'file' && !ui.showTerminal && (
        <KeyboardRow onInsert={handleKeyboardInsert} T={T}/>
      )}

      {/* ── FOLLOW UPS ── */}
      {chat.showFollowUp && !chat.loading && file.activeTab === 'chat' && !ui.showTerminal && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '6px 14px 8px', flexShrink: 0 }}>
          {FOLLOW_UPS.map(p => (
            <button key={p} onClick={() => sendMsg(p)}
              style={{ background: T.bg3, border: '1px solid ' + T.border, borderRadius: '20px',
                padding: '6px 14px', color: T.textMute, fontSize: '12px', cursor: 'pointer', minHeight: '34px' }}
              onMouseEnter={e => { e.currentTarget.style.background = T.accentBg; e.currentTarget.style.borderColor = T.accentBorder; e.currentTarget.style.color = T.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.bg3; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMute; }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ── QUICK BAR ── */}
      {!ui.showTerminal && (
        <div style={{ height: '40px', padding: '0 10px', borderTop: '1px solid ' + T.borderSoft,
          display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0, overflowX: 'auto', background: T.bg }}>
          {GIT_SHORTCUTS.map(s => (
            <button key={s.label} disabled={chat.loading}
              onClick={() => { if (s.cmd.includes('yugit.cjs')) { ui.setCommitMsg(''); ui.setCommitModal(true); } else { runShortcut(s.cmd); } }}
              style={{ background: 'none', border: 'none', padding: '4px 10px', color: T.textMute,
                fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'monospace',
                borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px',
                minHeight: '32px', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg3}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ opacity: .5, fontSize: '10px' }}>{s.icon}</span><span>{s.label}</span>
            </button>
          ))}
          <div style={{ flex: 1 }}/>
          {file.pinnedFiles.map(f => (
            <button key={f} onClick={() => file.openFile(f)}
              style={{ background: T.accentBg, border: 'none', borderRadius: '6px', padding: '3px 8px',
                color: T.accent, fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'monospace', minHeight: '28px', opacity: .7 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '.7'}>
              {f.split('/').pop()}
            </button>
          ))}
        </div>
      )}

      {/* ── INPUT COMPOSER ── */}
      {!ui.showTerminal && (
        <div style={{ padding: '8px 12px', paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
          background: T.bg, flexShrink: 0, position: 'relative' }}>
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
            <textarea ref={inputRef} value={chat.input}
              onChange={e => {
                chat.setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                if (e.target.value.startsWith('/')) {
                  const typed = e.target.value.toLowerCase();
                  // Fuzzy prefix + substring match
                  const matched = SLASH_COMMANDS.filter(s =>
                    s.cmd.startsWith(typed) || s.cmd.includes(typed.slice(1))
                  );
                  // Context boost: periksa pesan terakhir untuk saran relevan
                  const lastMsg = chat.messages[chat.messages.length - 1];
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
                  // Sort: context boost dulu, lalu alphabetical
                  const sorted = [...matched].sort((a, b) => {
                    const aBoost = contextBoost.includes(a.cmd) ? -1 : 0;
                    const bBoost = contextBoost.includes(b.cmd) ? -1 : 0;
                    return aBoost - bBoost;
                  });
                  chat.setSlashSuggestions(sorted.slice(0, 8));
                } else chat.setSlashSuggestions([]);
              }}
              onKeyDown={e => {
                if (e.key === 'ArrowUp' && !chat.input) { const i = Math.min(project.histIdx + 1, project.cmdHistory.length - 1); project.setHistIdx(i); chat.setInput(project.cmdHistory[i] || ''); }
                if (e.key === 'ArrowDown' && project.histIdx > -1) { const i = project.histIdx - 1; project.setHistIdx(i); chat.setInput(i >= 0 ? project.cmdHistory[i] : ''); }
              }}
              placeholder="Tanya Yuyu, atau / untuk commands"
              disabled={chat.loading} rows={searchQ !== null && searchQ !== '' ? 1 : 1}
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
              <button onClick={() => setSearchQ(q => q === null ? '' : null)}
                title="Cari di chat" style={{background:'none',border:'none',color:searchQ!==null?T.accent:T.textMute,cursor:'pointer',padding:'6px',borderRadius:'8px',display:'flex',alignItems:'center'}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <VoiceBtn disabled={chat.loading} T={T} onResult={txt => { chat.setInput(i => i ? i + ' ' + txt : txt); inputRef.current?.focus(); }}/>
              {project.pushToTalk && <PushToTalkBtn onResult={v => { if (v?.trim()) { chat.setInput(''); sendMsg(v.trim()); } else { chat.setInput(v); } }} disabled={chat.loading} T={T}/>}
              <button
                onClick={() => { if (chat.ttsEnabled) { stopTts(); chat.setTtsEnabled(false); } else chat.setTtsEnabled(true); }}
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
                        style={{background:T.warningBg,border:'1px solid '+T.warning+'66',color:T.warning,borderRadius:'8px',padding:'8px 10px',cursor:'pointer',fontSize:'11px',marginRight:'4px'}}>
                        ⏸
                      </button>
                    )}
                    <button onClick={cancelMsg} title="Batalkan"
                    style={{ background: T.errorBg, border: 'none', borderRadius: '12px', color: T.error,
                      cursor: 'pointer', flexShrink: 0, width: '36px', height: '36px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '14px', marginLeft: '4px' }}>■</button>
                  </>
                : <button onClick={() => sendMsg()} title="Kirim"
                    style={{ background: chat.input.trim() ? T.accent : 'rgba(255,255,255,.08)', border: 'none',
                      borderRadius: '12px', color: chat.input.trim() ? 'white' : T.textMute,
                      cursor: chat.input.trim() ? 'pointer' : 'default', flexShrink: 0,
                      width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '16px', fontWeight: '700',
                      marginLeft: '4px' }}>↑</button>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
