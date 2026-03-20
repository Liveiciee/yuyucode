import { Save, X } from 'lucide-react';
import React, { useState, useRef } from "react";

export function FileEditor({ path, content, onSave, onClose, T }) {
  const [text, setText] = useState(content || '');
  const [saved, setSaved] = useState(true);
  const [cursor, setCursor] = useState({ line:1, col:1 });
  const [showInlineDiff, setShowInlineDiff] = useState(false);
  const textareaRef = useRef(null);

  function updateCursor(e) {
    const ta = e.target;
    const val = ta.value.slice(0, ta.selectionStart);
    const lines = val.split('\n');
    setCursor({ line: lines.length, col: lines[lines.length-1].length + 1 });
  }

  async function save() { await onSave(text); setSaved(true); }

  function computeInlineDiff() {
    const oldLines = (content||'').split('\n');
    const newLines = text.split('\n');
    const result = [];
    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
      const o = oldLines[i], n = newLines[i];
      if (o === n) result.push({type:'same', text:n||''});
      else if (o === undefined) result.push({type:'add', text:n});
      else if (n === undefined) result.push({type:'del', text:o});
      else { result.push({type:'del',text:o}); result.push({type:'add',text:n}); }
    }
    return result;
  }


  const bg        = T?.bg        || '#0d0d0e';
  const bg3       = T?.bg3       || 'rgba(255,255,255,.04)';
  const border    = T?.border    || 'rgba(255,255,255,.06)';
  const textColor = T?.text      || 'rgba(255,255,255,.85)';
  const textMute  = T?.textMute  || 'rgba(255,255,255,.3)';
  const accent    = T?.accent    || '#a78bfa';
  const accentBg  = T?.accentBg  || 'rgba(124,58,237,.2)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.35)';
  const success   = T?.success   || '#4ade80';
  const successBg = T?.successBg || 'rgba(74,222,128,.12)';
  const successBorder = 'rgba(74,222,128,.25)';
  const warning   = T?.warning   || '#fbbf24';

  // ── Sticky toolbar button style ──
  const tbBtn = (active) => ({
    background: active ? accentBg : bg3,
    border: '1px solid ' + (active ? accentBorder : border),
    borderRadius: '7px', padding: '7px 14px', color: active ? accent : textMute,
    fontSize: '12px', cursor: 'pointer', minHeight: '36px', whiteSpace: 'nowrap',
  });

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>

      {/* ── Sticky toolbar ── */}
      <div style={{padding:'6px 10px',borderBottom:'1px solid '+border,display:'flex',alignItems:'center',gap:'6px',background:bg3,flexShrink:0,overflowX:'auto'}}>
        <span style={{fontSize:'11px',color:textMute,fontFamily:'monospace',flexShrink:0,maxWidth:'140px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{path?.split('/').pop()}</span>
        <div style={{flex:1}}/>
        {!saved && <span style={{fontSize:'10px',color:warning,flexShrink:0}}>●</span>}
        <span style={{fontSize:'10px',color:textMute,fontFamily:'monospace',flexShrink:0}}>{cursor.line}:{cursor.col}</span>
        {!saved && (
          <button onClick={()=>setShowInlineDiff(!showInlineDiff)} style={tbBtn(showInlineDiff)}>◐ diff</button>
        )}
        <button onClick={save} style={{...tbBtn(false),background:successBg,border:'1px solid '+successBorder,color:success,fontWeight:'500'}}>
          <Save size={13}/> Save
        </button>
        <button onClick={onClose} style={{background:'none',border:'none',color:textMute,fontSize:'18px',cursor:'pointer',padding:'4px 6px',flexShrink:0}}>×</button>
      </div>

      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        {showInlineDiff ? (
          <div style={{flex:1,overflow:'auto',fontFamily:'monospace',fontSize:'12px',lineHeight:'1.6',padding:'8px 0'}}>
            {computeInlineDiff().map((line,i)=>(
              <div key={i} style={{display:'flex',background:line.type==='add'?'rgba(74,222,128,.06)':line.type==='del'?'rgba(248,113,113,.06)':'transparent',padding:'0 12px'}}>
                <span style={{color:line.type==='add'?'#4ade80':line.type==='del'?'#f87171':'rgba(255,255,255,.2)',width:'14px',flexShrink:0,userSelect:'none'}}>{line.type==='add'?'+':line.type==='del'?'-':' '}</span>
                <span style={{color:line.type==='add'?'#4ade80':line.type==='del'?'#f87171':'rgba(255,255,255,.7)',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{line.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{padding:'8px 4px',color:textMute,textAlign:'right',userSelect:'none',borderRight:'1px solid '+border,minWidth:'38px',flexShrink:0,fontSize:'12px',lineHeight:'1.6',fontFamily:'monospace',overflowY:'hidden',background:bg3}}>
              {text.split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
            </div>
            <textarea ref={textareaRef} value={text}
              onChange={e=>{setText(e.target.value);setSaved(false);}}
              onKeyUp={updateCursor} onClick={updateCursor}
              onKeyDown={e=>{
                if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();save();return;}
                if(e.key==='Tab'){e.preventDefault();const s=e.target.selectionStart;const val=text.slice(0,s)+'  '+text.slice(e.target.selectionEnd);setText(val);setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+2;},0);}
              }}
              style={{flex:1,background:bg,border:'none',outline:'none',color:textColor,fontSize:'13px',lineHeight:'1.6',fontFamily:'monospace',padding:'8px 12px',resize:'none',whiteSpace:'pre',overflowWrap:'normal',overflowX:'auto'}}
              spellCheck={false} autoCapitalize="none" autoCorrect="off"
            />
          </>
        )}
      </div>
    </div>
  );
}
