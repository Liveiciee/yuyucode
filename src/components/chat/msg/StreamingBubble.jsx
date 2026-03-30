import React from 'react';
import { ThinkingBlock } from './ThinkingBlock.jsx';
import { MsgContent } from './MsgContent.jsx';

export function StreamingBubble({ text, T }) {
  const bubbleAi  = T?.bubble?.ai || {};
  const fxAi      = T?.fx?.aiBubble?.() || {};
  const textColor = T?.text || 'rgba(255,255,255,.9)';

  const thinkMatch  = text.match(/<think>([\s\S]*?)(?:<\/think>|$)/i);
  const thinkText   = thinkMatch ? thinkMatch[1] : null;
  const thinkClosed = text.includes('</think>');
  const cleanText   = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*$/gi, '')
    .replace(/```action[\s\S]*?```/g, '')
    .trim();

  return (
    <div style={{padding:'10px 16px 2px',display:'flex',flexDirection:'column',gap:'6px'}}>
      {thinkText && (
        <ThinkingBlock text={thinkText} T={T} live={!thinkClosed}/>
      )}
      <div style={{
        fontSize:'14.5px', lineHeight:'1.8', color:bubbleAi.color||textColor,
        wordBreak:'break-word',
        ...(bubbleAi.bg && bubbleAi.bg!=='transparent' ? {
          background:bubbleAi.bg,
          border:'1px solid '+(bubbleAi.border||'transparent'),
          borderRadius:bubbleAi.radius||'4px 16px 16px 16px',
          padding:'10px 14px',
        } : {}),
        ...fxAi,
      }}>
        {cleanText ? (
          <MsgContent text={cleanText} T={T}/>
        ) : !thinkText ? (
          <span style={{display:'inline-block',width:'2px',height:'14px',
            background:T?.accent||'#a78bfa',verticalAlign:'middle',
            animation:'blink 1s infinite'}}/>
        ) : null}
        {cleanText && (
          <span style={{display:'inline-block',width:'2px',height:'14px',
            background:'rgba(255,255,255,.5)',marginLeft:'2px',verticalAlign:'middle',
            animation:'blink 1s infinite'}}/>
        )}
      </div>
    </div>
  );
}
