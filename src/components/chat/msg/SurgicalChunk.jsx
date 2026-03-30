import React from 'react';

export function SurgicalChunk({ chunk, index, setEditText }) {
  const isRemoved = chunk.startsWith('~~REMOVE~~');
  const bg3 = 'rgba(255,255,255,.03)';
  const border = 'rgba(255,255,255,.07)';
  const error = '#f87171';
  const errorBg = 'rgba(248,113,113,.08)';
  const textMute = 'rgba(255,255,255,.3)';
  const textSec = 'rgba(255,255,255,.6)';
  function toggle() {
    setEditText(prev => {
      const parts = prev.split(/\n(?=```|\*\*|##|===|---|\n)/);
      parts[index] = parts[index].startsWith('~~REMOVE~~') ? parts[index].slice(10) : '~~REMOVE~~' + parts[index];
      return parts.join('\n');
    });
  }
  return (
    <div onClick={toggle} style={{ padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', background: isRemoved ? errorBg : bg3, border: '1px solid ' + (isRemoved ? error + '44' : border), opacity: isRemoved ? .55 : 1, transition: 'all .15s' }}>
      <div style={{ fontSize: '10px', color: textMute, fontFamily: 'monospace', marginBottom: '2px' }}>{chunk.trim().startsWith('```') ? 'code' : 'text'}</div>
      <div style={{ fontSize: '11.5px', color: textSec, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chunk.replace('~~REMOVE~~', '').trim().slice(0, 80)}</div>
    </div>
  );
}
