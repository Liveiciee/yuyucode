import React from 'react';

export function QuickBar({ T, chat, file, ui, runShortcut }) {
  const GIT_SHORTCUTS = [
    { label: 'status', icon: '📊', cmd: 'git status' },
    { label: 'commit', icon: '📝', cmd: 'yugit.cjs' },
    { label: 'pull',   icon: '⬇️', cmd: 'git pull' },
    { label: 'push',   icon: '⬆️', cmd: 'git push' },
    { label: 'diff',   icon: '🔍', cmd: 'git diff' },
  ];

  return (
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
      <button disabled={chat.loading}
        onClick={() => chat.setInput('/swarm ')}
        title="Agent Swarm"
        style={{ background: 'none', border: 'none', padding: '4px 8px', color: T.textMute,
          fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap',
          borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px',
          minHeight: '32px', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.background = T.bg3}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <span style={{opacity:.5,fontSize:'10px'}}>🐝</span><span>swarm</span>
      </button>
      <button disabled={chat.loading}
        onClick={() => ui.setShowBgAgents(true)}
        title="Background Agents"
        style={{ background: 'none', border: 'none', padding: '4px 8px', color: T.textMute,
          fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap',
          borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px',
          minHeight: '32px', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.background = T.bg3}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        <span style={{opacity:.5,fontSize:'10px'}}>🤖</span><span>agents</span>
      </button>
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
  );
}
