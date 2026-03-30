import React from 'react';
import { hl } from '../../../utils.js';

export function MsgContent({ text, T }) {
  if (!text) return null;
  const accent  = T?.accent  || '#a78bfa';
  const textCol = T?.text    || 'rgba(255,255,255,.9)';
  const mutedCol= T?.textMute|| 'rgba(255,255,255,.45)';
  const borderC = T?.border  || 'rgba(255,255,255,.08)';
  const codeBg  = T?.codeBg  || 'rgba(0,0,0,.35)';

  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <span style={{whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
      {parts.map((part, i) => {
        const fence = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
        if (fence) {
          const lang = fence[1] || '';
          const code = fence[2];
          const highlighted = hl(code, lang);
          return (
            <pre key={i} style={{
              background: codeBg,
              border: '1px solid ' + borderC,
              borderRadius: '8px',
              padding: '10px 14px',
              margin: '8px 0',
              overflowX: 'auto',
              fontSize: '12.5px',
              lineHeight: '1.65',
              fontFamily: 'monospace',
              whiteSpace: 'pre',
            }}>
              {lang && (
                <div style={{fontSize:'10px',color:mutedCol,marginBottom:'6px',
                  fontFamily:'monospace',letterSpacing:'.06em'}}>
                  {lang}
                </div>
              )}
              <code dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
          );
        }
        const html = part
          .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
          .replace(/\*(.+?)\*/g,'<em>$1</em>')
          .replace(/`([^`]+)`/g,`<code style="background:${codeBg};border-radius:4px;padding:1px 5px;font-family:monospace;font-size:12px;color:${accent}">$1</code>`)
          .replace(/^#{1,3} (.+)$/gm,`<span style="font-weight:700;color:${textCol};font-size:15px">$1</span>`)
          .replace(/^[-*] (.+)$/gm,'• $1');
        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </span>
  );
}
