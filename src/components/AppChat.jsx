import { FileEditor } from "./FileEditor.jsx";
import React, { useState, useRef, useEffect } from 'react';
import { Pin, Eye, ScrollText, Camera, Paperclip, Volume2, VolumeX, Loader, Play } from 'lucide-react';
import { hl } from '../utils.js';
import { MsgBubble, StreamingBubble } from './chat/msg/index.js';
import { TabBar } from './chat/TabBar.jsx';
import { EmptyState } from './chat/EmptyState.jsx';
import { FileViewer } from './chat/FileViewer.jsx';
import { InputComposer } from './chat/InputComposer.jsx';
import { QuickBar } from './chat/QuickBar.jsx';
import { Terminal } from './Terminal.jsx';
import { LivePreview } from './LivePreview.jsx';
import { KeyboardRow } from './KeyboardRow.jsx';
import { GlobalFindReplace } from './GlobalFindReplace.jsx';
import { VoiceBtn, PushToTalkBtn } from './VoiceBtn.jsx';
import { useWakeWord } from '../hooks/useWakeWord.js';
import { FOLLOW_UPS, SLASH_COMMANDS, GIT_SHORTCUTS } from '../constants.js';

export function AppChat({
  T, ui, project, file, chat,
  sendMsg, cancelMsg, retryLast, continueMsg,
  handleApprove, handlePlanApprove,
  handleCameraCapture, fileInputRef,
  runShortcut, stopTts,
  visibleMessages,
}) {
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const [searchQ, setSearchQ] = useState(null);

  useWakeWord({
    enabled: project.pushToTalk,
    onActivated: () => {
      if (!chat.loading) inputRef.current?.focus();
    },
  });

  const fileEditorRef = useRef(null);

  const editorConfig = {
    vimMode: ui.vimMode,
    emmet: true,
    ghostText: ui.ghostTextEnabled,
    minimap: ui.showMinimap,
    lint: ui.lintEnabled,
    tsLsp: ui.tsLspEnabled,
    blame: ui.blameEnabled,
    multiCursor: ui.multiCursor,
    stickyScroll: ui.stickyScroll,
    collab: ui.collabEnabled,
    collabRoom: ui.collabRoom,
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, chat.streaming]);

  function handleKeyboardInsert(text) {
    if (file.activeTab === 'file' && file.editMode && fileEditorRef.current) {
      fileEditorRef.current.insert(text);
      return;
    }
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const val = chat.input;
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
      <TabBar
        file={file}
        ui={ui}
        T={T}
        onPreviewToggle={() => ui.setShowLivePreview(!ui.showLivePreview)}
        onTerminalToggle={() => ui.setShowTerminal(!ui.showTerminal)}
      />

      {file.activeTab === 'chat' && !ui.showTerminal && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0 8px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 4px' }}>
            <EmptyState
              visibleMessages={visibleMessages}
              chat={chat}
              project={project}
              onInputSet={chat.setInput}
            />
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

      {file.activeTab === 'file' && activeTab && !file.editMode && !ui.showTerminal && !ui.showLivePreview && (
        <FileViewer
          activeTab={activeTab}
          file={file}
          ui={ui}
          T={T}
          onTogglePin={file.togglePin}
          onSetBlame={ui.setShowBlame}
          onSetFileHistory={ui.setShowFileHistory}
          onAddContext={() => {
            chat.setMessages(m => [...m, { role: 'user', content: 'Yu, ini konteks file ' + activeTab.path + ':\n```\n' + (activeTab.content || '').slice(0, 2000) + '\n```' }]);
            file.setActiveTab('chat');
          }}
          onAsk={() => sendMsg('Yu, jelaskan file ' + activeTab.path)}
        />
      )}

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

      {file.activeTab === 'file' && ui.showLivePreview && !ui.showTerminal && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <LivePreview
            tabs={file.openTabs}
            T={T}
            onClose={() => ui.setShowLivePreview(false)}
          />
        </div>
      )}

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

      {ui.showTerminal && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Terminal folder={project.folder} cmdHistory={project.cmdHistory}
            addHistory={project.addHistory} T={T}
            onSendToAI={txt => { ui.setShowTerminal(false); file.setActiveTab('chat'); sendMsg(txt); }}/>
        </div>
      )}

      {file.activeTab === 'file' && !ui.showTerminal && (
        <KeyboardRow onInsert={handleKeyboardInsert} T={T}/>
      )}

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

      <QuickBar
        chat={chat}
        file={file}
        ui={ui}
        T={T}
        onRunShortcut={runShortcut}
        onSendMsg={sendMsg}
        onOpenFile={file.openFile}
        onSetBgAgents={() => ui.setShowBgAgents(true)}
        onSetCommitModal={() => { ui.setCommitMsg(''); ui.setCommitModal(true); }}
      />

      <InputComposer
        chat={chat}
        project={project}
        file={file}
        T={T}
        inputRef={inputRef}
        searchQ={searchQ}
        setSearchQ={setSearchQ}
        onSend={sendMsg}
        onCancel={cancelMsg}
        onCameraCapture={handleCameraCapture}
        onFileAttach={() => fileInputRef.current?.click()}
        onTtsToggle={() => { if (chat.ttsEnabled) { stopTts(); chat.setTtsEnabled(false); } else { chat.setTtsEnabled(true); } }}
        onSlashSuggest={buildSlashSuggestions}
        onKeyboardInsert={handleKeyboardInsert}
      />
    </div>
  );
}
