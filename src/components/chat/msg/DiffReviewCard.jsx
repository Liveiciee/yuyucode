import React from 'react';
import { FileDiff, ChevronDown, Check, X } from 'lucide-react';

export function DiffReviewCard({ action, onApprove, approveBtn, rejectBtn, border, bg3, textMute, textSec, T }) {
  const [diffOpen, setDiffOpen] = React.useState(true);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState('');
  const accent       = T?.accent      || '#a78bfa';
  const accentBg     = T?.accentBg    || 'rgba(124,58,237,.12)';
  const accentBorder = T?.accentBorder|| 'rgba(124,58,237,.25)';
  const successCol   = T?.success     || '#4ade80';
  const errorCol     = T?.error       || '#f87171';
  const codeBg       = T?.codeBg      || 'rgba(0,0,0,.35)';

  const filename = action.path?.split('/').pop() || action.path || '?';
  const ext      = filename.split('.').pop() || '';
  const lines    = (action.diffPreview || '').split('\n');
  const adds     = lines.filter(l => l.startsWith('+')).length;
  const removes  = lines.filter(l => l.startsWith('-')).length;

  function lineColor(line) {
    if (line.startsWith('+')) return successCol;
    if (line.startsWith('-')) return errorCol;
    return textMute;
  }
  function lineBg(line) {
    if (line.startsWith('+')) return 'rgba(74,222,128,.06)';
    if (line.startsWith('-')) return 'rgba(248,113,113,.06)';
    return 'transparent';
  }

  return (
    <div style={{ border: '1px solid ' + accentBorder, borderRadius: '12px', overflow: 'hidden',
      background: accentBg, margin: '4px 0' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
        borderBottom: diffOpen ? '1px solid ' + accentBorder : 'none', cursor: 'pointer' }}
        onClick={() => setDiffOpen(o => !o)}>
        <FileDiff size={13} style={{ color: accent, flexShrink: 0 }}/>
        <span style={{ fontSize: '12px', color: accent, fontFamily: 'monospace', fontWeight: '600',
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {action.path}
        </span>
        <span style={{ fontSize: '10px', color: successCol, fontFamily: 'monospace' }}>+{adds}</span>
        <span style={{ fontSize: '10px', color: errorCol, fontFamily: 'monospace', marginRight: '4px' }}>-{removes}</span>
        <span style={{ fontSize: '10px', color: textMute, opacity: .6 }}>{ext}</span>
        <ChevronDown size={11} style={{ color: textMute, flexShrink: 0,
          transform: diffOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}/>
      </div>

      {/* Diff body */}
      {diffOpen && (
        <div style={{ maxHeight: '260px', overflowY: 'auto', background: codeBg }}>
          {lines.length > 0 ? (
            lines.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: '0', background: lineBg(line),
                padding: '0 12px', minHeight: '20px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.7',
                  color: lineColor(line), whiteSpace: 'pre-wrap', wordBreak: 'break-all', flex: 1 }}>
                  {line}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '12px', fontSize: '11px', color: textMute, fontFamily: 'monospace' }}>
              {action.type === 'write_file' ? `File baru: ${filename}` : 'Diff tidak tersedia'}
            </div>
          )}
        </div>
      )}

      {/* Feedback input (shown when reject is tapped) */}
      {feedbackOpen && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid ' + border }}>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
            placeholder="Kenapa ditolak? (opsional — dikirim ke AI)"
            autoFocus
            style={{ width: '100%', background: bg3, border: '1px solid ' + border,
              borderRadius: '10px', padding: '8px 12px', color: textSec, fontSize: '12px',
              fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: '1.6',
              boxSizing: 'border-box', minHeight: '56px' }}/>
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <button onClick={() => { onApprove(false, action.path, feedback || null); setFeedbackOpen(false); }}
              style={{ ...rejectBtn, flex: 1, justifyContent: 'center' }}>
              <X size={12}/> Tolak{feedback ? ' + feedback' : ''}
            </button>
            <button onClick={() => setFeedbackOpen(false)}
              style={{ background: bg3, border: '1px solid ' + border, borderRadius: '10px',
                padding: '8px 14px', color: textMute, fontSize: '12px', cursor: 'pointer' }}>
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Approve / Reject buttons */}
      {!feedbackOpen && (
        <div style={{ display: 'flex', gap: '8px', padding: '10px 14px',
          borderTop: '1px solid ' + accentBorder }}>
          <button onClick={() => onApprove(true, action.path)} style={{ ...approveBtn }}>
            <Check size={13}/> Apply {filename}
          </button>
          <button onClick={() => setFeedbackOpen(true)} style={{ ...rejectBtn }}
            title="Tolak dengan feedback ke AI">
            <X size={13}/>
          </button>
        </div>
      )}
    </div>
  );
}
