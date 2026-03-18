import React, { useState, useRef } from "react";

export function FileEditor({ path, content, onSave, onClose }) {
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

  async function save() {
    await onSave(text);
    setSaved(true);
  }

  function computeInlineDiff() {
    const oldLines = (content||'').split('\n');
    const newLines = text.split('\n');
    const result = [];
    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
      const o = oldLines[i];
      const n = newLines[i];
      if (o === n) result.push({type:'same', text:n||''});
      else if (o === undefined) result.push({type:'add', text:n});
      else if (n === undefined) result.push({type:'del', text:o});
      else { result.push({type:'del',text:o}); result.push({type:'add',text:n}); }
    }
    return result;
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{padding:'5px 12px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,.02)',flexShrink:0}}>
        <span style={{fontSize:'11px',color:'rgba(255,255,255,.4)',fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{path}</span>
        {!saved&&<span style={{fontSize:'10px',color:'rgba(251,191,36,.6)'}}>● unsaved</span>}
        <span style={{fontSize:'10px',color:'rgba(255,255,255,.25)',fontFamily:'monospace'}}>{cursor.line}:{cursor.col}</span>
        {!saved&&<button onClick={()=>setShowInlineDiff(!showInlineDiff)} style={{background:showInlineDiff?'rgba(96,165,250,.15)':'rgba(255,255,255,.04)',border:'1px solid rgba(96,165,250,.2)',borderRadius:'5px',padding:'2px 6px',color:'rgba(96,165,250,.8)',fontSize:'10px',cursor:'pointer',flexShrink:0}}>◐ diff</button>}
        <button onClick={save} style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'5px',padding:'2px 8px',color:'#4ade80',fontSize:'10px',cursor:'pointer',flexShrink:0}}>💾 Save</button>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(255,255,255,.3)',fontSize:'14px',cursor:'pointer',flexShrink:0}}>×</button>
      </div>
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        {showInlineDiff ? (
          <div style={{flex:1,overflow:'auto',fontFamily:'monospace',fontSize:'11px',lineHeight:'1.6',padding:'8px 0'}}>
            {computeInlineDiff().map((line,i)=>(
              <div key={i} style={{display:'flex',background:line.type==='add'?'rgba(74,222,128,.06)':line.type==='del'?'rgba(248,113,113,.06)':'transparent',padding:'0 12px'}}>
                <span style={{color:line.type==='add'?'#4ade80':line.type==='del'?'#f87171':'rgba(255,255,255,.2)',width:'14px',flexShrink:0,userSelect:'none'}}>{line.type==='add'?'+':line.type==='del'?'-':' '}</span>
                <span style={{color:line.type==='add'?'#4ade80':line.type==='del'?'#f87171':'rgba(255,255,255,.7)',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{line.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{padding:'8px 6px',color:'rgba(255,255,255,.2)',textAlign:'right',userSelect:'none',borderRight:'1px solid rgba(255,255,255,.05)',minWidth:'36px',flexShrink:0,fontSize:'11px',lineHeight:'1.6',fontFamily:'monospace',overflowY:'hidden',background:'rgba(255,255,255,.01)'}}>
              {text.split('\n').map((_,i)=><div key={i}>{i+1}</div>)}
            </div>
            <textarea ref={textareaRef} value={text}
              onChange={e=>{setText(e.target.value);setSaved(false);}}
              onKeyUp={updateCursor} onClick={updateCursor}
              onKeyDown={e=>{
                if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();save();return;}
                if(e.key==='Tab'){e.preventDefault();const s=e.target.selectionStart;const val=text.slice(0,s)+'  '+text.slice(e.target.selectionEnd);setText(val);setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+2;},0);}
              }}
              style={{flex:1,background:'#0d0d0e',border:'none',outline:'none',color:'rgba(255,255,255,.85)',fontSize:'12px',lineHeight:'1.6',fontFamily:'monospace',padding:'8px 12px',resize:'none',whiteSpace:'pre',overflowWrap:'normal',overflowX:'auto'}}
              spellCheck={false}
            />
          </>
        )}
      </div>
    </div>
  );
}
