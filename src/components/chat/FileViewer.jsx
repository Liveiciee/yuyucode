import React from 'react';
import { Pin, Eye, ScrollText } from 'lucide-react';
import { hl } from '../../utils.js';

export function FileViewer({ T, tab, file, ui, chat, sendMsg }) {
  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ height: '44px', padding: '0 12px', borderBottom: '1px solid ' + T.border,
        display: 'flex', alignItems: 'center', gap: '6px', background: T.bg2,
        position: 'sticky', top: 0 }}>
        <span style={{ fontSize: '11px', color: T.textMute, fontFamily: 'monospace',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tab.path}
        </span>
        {[
          { label: <Pin size={12}/>, active: file.pinnedFiles.includes(tab.path), color: T.accent, bg: T.accentBg, border: T.accentBorder, onClick: () => file.togglePin(tab.path) },
          { label: <Eye size={12}/>, active: false, color: T.textSec, bg: T.bg3, border: T.border, onClick: () => ui.setShowBlame(true) },
          { label: <ScrollText size={12}/>, active: false, color: T.textSec, bg: T.bg3, border: T.border, onClick: () => ui.setShowFileHistory(true) },
          { label: '+ctx', active: false, color: T.success, bg: T.successBg, border: T.success + '33', onClick: () => { chat.setMessages(m => [...m, { role: 'user', content: 'Yu, ini konteks file ' + tab.path + ':\n```\n' + (tab.content || '').slice(0, 2000) + '\n```' }]); file.setActiveTab('chat'); } },
          { label: 'Tanya', active: false, color: T.accent, bg: T.accentBg, border: T.accentBorder, onClick: () => sendMsg('Yu, jelaskan file ' + tab.path) },
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
          {(tab.content || '').split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <pre style={{ margin: 0, padding: '8px 12px', whiteSpace: 'pre-wrap',
          wordBreak: 'break-word', color: T.textSec, flex: 1 }}
          dangerouslySetInnerHTML={{ __html: hl(tab.content || '', tab.path?.split('.').pop() || '') }}/>
      </div>
    </div>
  );
}
