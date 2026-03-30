import React from 'react';

export function EmptyState({ T, project, chat }) {
  if (project.folder) {
    return (
      <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ fontSize: '32px', marginBottom: '4px' }}>🌸</div>
        <div style={{ fontSize: '17px', fontWeight: '700', color: T.text, marginBottom: '2px' }}>
          {project.folder.split('/').pop()}
        </div>
        <div style={{ fontSize: '11px', color: T.textMute, marginBottom: '20px', textAlign: 'center', maxWidth: '280px', lineHeight: '1.6' }}>
          <span>Mau ngerjain apa hari ini?<br/><span style={{opacity:.6,fontFamily:'monospace'}}>⎇ {project.branch||'main'} · {project.model?.split('-')[0]||'cerebras'}</span></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', width: '100%', maxWidth: '340px' }}>
          {[
            { icon: '🔍', text: 'Review semua',     msg: '/review --all' },
            { icon: '🧪', text: 'Jalankan test',    msg: 'npx vitest run dan fix yang gagal' },
            { icon: '🐝', text: 'Agent Swarm',      msg: '/swarm ' },
            { icon: '🤖', text: 'Background Agent', msg: '/bg ' },
            { icon: '📋', text: 'Buat plan',        msg: '/plan ' },
            { icon: '🗄️', text: 'Query SQLite',     msg: '/db ' },
            { icon: '⚡', text: 'Status project',   msg: '/status' },
            { icon: '📝', text: 'Lihat rules',      msg: '/rules' },
          ].map(s => (
            <button key={s.msg} onClick={() => chat.setInput(s.msg)}
              style={{ background: T.bg3, border: '1px solid ' + T.border, borderRadius: '10px', padding: '9px 12px', color: T.textSec, fontSize: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '40px' }}
              onMouseEnter={e => { e.currentTarget.style.background = T.accentBg; e.currentTarget.style.borderColor = T.accentBorder; e.currentTarget.style.color = T.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.bg3; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSec; }}>
              <span style={{flexShrink:0}}>{s.icon}</span><span>{s.text}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ fontSize: '32px', marginBottom: '4px' }}>🌸</div>
      <div style={{ fontSize: '11px', color: T.textMute, textAlign: 'center', maxWidth: '280px', lineHeight: '1.6' }}>
        Tap tombol folder di header untuk buka project
      </div>
    </div>
  );
}
