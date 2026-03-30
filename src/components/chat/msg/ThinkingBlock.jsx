import React from 'react';
import { Brain } from 'lucide-react';

export function ThinkingBlock({ text, T, live = false }) {
  const [open, setOpen] = React.useState(false);
  if (!text?.trim()) return null;
  const tc   = T?.bubble?.thinking || {};
  const c    = tc.color || 'rgba(167,139,250,.5)';
  const cFaint = c.replace(/[\d.]+\)$/, '.15)') || 'rgba(167,139,250,.15)';
  const cBg    = c.replace(/[\d.]+\)$/, '.04)') || 'rgba(167,139,250,.04)';
  const steps = text.trim().split(/\n\n+/).filter(s => s.trim()).length;
  const label = live
    ? 'Sedang berpikir…'
    : steps > 1 ? `${steps} langkah berpikir` : 'Chain of thought';

  return (
    <div style={{margin:'0 0 10px',borderRadius:'12px',overflow:'hidden',
      border:'1px solid '+cFaint, background:cBg}}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 14px',
          cursor:'pointer',userSelect:'none',minHeight:'40px'}}>
        <Brain size={12} style={{color:c,flexShrink:0,
          animation: live ? 'pulse 1.8s ease-in-out infinite' : 'none'}}/>
        <span style={{fontSize:'11px',color:c,fontFamily:'monospace',
          letterSpacing:'.08em',flex:1}}>
          {label}
        </span>
        {!live && (
          <span style={{fontSize:'10px',color:c,transition:'transform .2s',
            display:'inline-block',transform:open?'rotate(180deg)':'rotate(0deg)'}}>▾</span>
        )}
      </div>
      {(open || live) && (
        <div style={{padding:'2px 14px 12px',fontSize:'12px',lineHeight:'1.75',
          color:T?.textMute||'rgba(255,255,255,.4)',fontFamily:'monospace',
          whiteSpace:'pre-wrap',wordBreak:'break-word',
          borderTop:'1px solid '+(T?.border||'rgba(255,255,255,.06)')}}>
          {text.trim()}
          {live && <span style={{display:'inline-block',width:'2px',height:'12px',
            background:'currentColor',marginLeft:'3px',verticalAlign:'middle',
            animation:'blink 1s infinite'}}/>}
        </div>
      )}
    </div>
  );
}
