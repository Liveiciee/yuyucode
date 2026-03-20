// ── KeyboardRow — extra symbol row above Android soft keyboard ─────────────────
// Inserts symbols at cursor: either into a textarea or a CodeMirror view.
// Shows whenever a file is in edit mode on mobile.
import React from 'react';

const SYMBOLS = [
  { label: '{',  text: '{' },
  { label: '}',  text: '}' },
  { label: '[',  text: '[' },
  { label: ']',  text: ']' },
  { label: '(',  text: '(' },
  { label: ')',  text: ')' },
  { label: ';',  text: ';' },
  { label: '=>', text: '=>' },
  { label: '//', text: '//' },
  { label: ':',  text: ':' },
  { label: '`',  text: '`' },
  { label: '.',  text: '.' },
  { label: '!',  text: '!' },
  { label: '?',  text: '?' },
  { label: '→',  text: '  ' },  // indent (2 spaces)
];

export function KeyboardRow({ onInsert, T }) {
  const bg      = T?.bg2       || '#111116';
  const bg3     = T?.bg3       || 'rgba(255,255,255,.05)';
  const border  = T?.border    || 'rgba(255,255,255,.06)';
  const text    = T?.textSec   || 'rgba(255,255,255,.6)';
  const accent  = T?.accent    || '#a78bfa';
  const accentBg = T?.accentBg || 'rgba(124,58,237,.15)';

  return (
    <div style={{
      display: 'flex',
      overflowX: 'auto',
      flexShrink: 0,
      background: bg,
      borderTop: '1px solid ' + border,
      padding: '3px 4px',
      gap: '3px',
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch',
    }}>
      {SYMBOLS.map(s => (
        <button
          key={s.label}
          onPointerDown={e => { e.preventDefault(); onInsert(s.text); }}
          style={{
            background: s.label === '→' ? accentBg : bg3,
            border: '1px solid ' + border,
            borderRadius: '6px',
            color: s.label === '→' ? accent : text,
            fontSize: '13px',
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            padding: '5px 10px',
            cursor: 'pointer',
            flexShrink: 0,
            minHeight: '32px',
            minWidth: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
