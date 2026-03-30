import React from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { actionMeta } from './actionMeta.jsx';

export function ActionChip({ action, T }) {
  const [open, setOpen] = React.useState(false);
  const { icon, label, color } = actionMeta(action.type);
  const border    = T?.border     || 'rgba(255,255,255,.07)';
  const bg3       = T?.bg3        || 'rgba(255,255,255,.03)';
  const textMute  = T?.textMute   || 'rgba(255,255,255,.3)';
  const textSec   = T?.textSec    || 'rgba(255,255,255,.6)';
  const success   = T?.success    || '#4ade80';
  const errorCol  = T?.error      || '#f87171';
  const errorBg   = T?.errorBg    || 'rgba(248,113,113,.08)';
  const codeBg    = T?.codeBg     || 'rgba(0,0,0,.35)';

  const ok      = action.result?.ok !== false;
  const chipCol = color || (ok ? textMute : errorCol);
  const name    = action.path?.split('/').pop() || action.command?.slice(0, 28) || action.query?.slice(0, 28) || '';
  const hasResult = action.result?.data || action.result?.error;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', margin: '2px 0' }}>
      <div onClick={() => hasResult && setOpen(o => !o)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px',
          borderRadius: '20px', border: '1px solid ' + (ok ? border : errorCol + '44'),
          background: ok ? bg3 : errorBg,
          cursor: hasResult ? 'pointer' : 'default', userSelect: 'none' }}>
        <span style={{ color: chipCol, display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{ fontSize: '10px', color: chipCol, fontFamily: 'monospace' }}>{label}</span>
        {name && <span style={{ fontSize: '10px', color: textMute, maxWidth: '140px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>}
        {ok ? <Check size={9} style={{ color: success, flexShrink: 0 }}/> : <X size={9} style={{ color: errorCol, flexShrink: 0 }}/>}
        {hasResult && <ChevronDown size={9} style={{ color: textMute, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}/>}
      </div>
      {open && hasResult && (
        <pre style={{ margin: '4px 0 2px', padding: '8px 12px', background: codeBg,
          border: '1px solid ' + border, borderRadius: '8px', fontSize: '11px',
          fontFamily: 'monospace', lineHeight: '1.6', color: textSec,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          maxHeight: '200px', overflowY: 'auto' }}>
          {(action.result?.data || action.result?.error || '').slice(0, 1500)}
          {(action.result?.data || action.result?.error || '').length > 1500 ? '\n…(truncated)' : ''}
        </pre>
      )}
    </div>
  );
}
