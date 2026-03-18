import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hl } from '../utils.js';

// ── Design tokens (match THEMES keys) ──────────────────────────────────────────
// All sizing uses 4px base unit. Touch targets min 44px.

export function ThinkingBlock({ text }) {
  const [open, setOpen] = React.useState(false);
  if (!text?.trim()) return null;
  return (
    <div style={{margin:'0 0 8px',borderRadius:'10px',overflow:'hidden',border:'1px solid rgba(167,139,250,.12)',background:'rgba(167,139,250,.04)'}}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 12px',cursor:'pointer',userSelect:'none',minHeight:'44px'}}>
        <span style={{fontSize:'10px',color:'rgba(167,139,250,.6)',fontFamily:'monospace',letterSpacing:'.06em',textTransform:'uppercase'}}>thinking</span>
        <div style={{flex:1,height:'1px',background:'rgba(167,139,250,.08)'}}/>
        <span style={{fontSize:'10px',color:'rgba(167,139,250,.35)',transition:'transform .2s',display:'inline-block',transform:open?'rotate(180deg)':'rotate(0deg)'}}>▾</span>
      </div>
      {open&&<div style={{padding:'2px 12px 12px',fontSize:'12px',lineHeight:'1.7',color:'rgba(255,255,255,.38)',fontFamily:'monospace',whiteSpace:'pre-wrap',wordBreak:'break-word',borderTop:'1px solid rgba(167,139,250,.06)'}}>{text.trim()}</div>}
    </div>
  );
}

export function MsgContent({ text }) {
  const parts = [];
  const regex = /```(\w+)?\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ t:'text', c:text.slice(last, m.index) });
    const lang = m[1] || '';
    if (lang === 'action') { last = m.index + m[0].length; continue; }
    if (lang === 'diff') parts.push({ t:'diff', c:m[2] });
    else parts.push({ t:'code', lang, c:m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ t:'text', c:text.slice(last) });

  return (
    <div>
      {parts.map((p, i) => {
        if (p.t === 'text') return (
          <div key={i} style={{lineHeight:'1.75',wordBreak:'break-word'}}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              table: ({node:_n,...props})=><div style={{overflowX:'auto',margin:'10px 0'}}><table style={{width:'100%',borderCollapse:'collapse',background:'rgba(255,255,255,.02)',borderRadius:'10px',overflow:'hidden'}} {...props}/></div>,
              th: ({node:_n,...props})=><th style={{padding:'8px 14px',fontSize:'11px',color:'rgba(255,255,255,.4)',fontWeight:'600',borderBottom:'1px solid rgba(255,255,255,.08)',textAlign:'left',whiteSpace:'nowrap'}} {...props}/>,
              td: ({node:_n,...props})=><td style={{padding:'8px 14px',fontSize:'13px',borderBottom:'1px solid rgba(255,255,255,.04)',verticalAlign:'top'}} {...props}/>,
              h1: ({node:_n,...props})=><div style={{fontSize:'17px',fontWeight:'700',color:'#f0f0f0',margin:'16px 0 6px',letterSpacing:'-.3px'}} {...props}/>,
              h2: ({node:_n,...props})=><div style={{fontSize:'15px',fontWeight:'700',color:'#f0f0f0',margin:'14px 0 5px'}} {...props}/>,
              h3: ({node:_n,...props})=><div style={{fontSize:'14px',fontWeight:'600',color:'#e8e8e8',margin:'12px 0 4px'}} {...props}/>,
              code: ({node:_n,inline,...props})=>inline
                ? <code style={{background:'rgba(255,255,255,.09)',padding:'2px 7px',borderRadius:'5px',fontFamily:'monospace',fontSize:'12px',color:'#c4b5fd'}} {...props}/>
                : <pre style={{background:'#111114',padding:'12px 14px',borderRadius:'10px',overflow:'auto',fontSize:'12px',margin:'8px 0',lineHeight:'1.6'}} {...props}/>,
              hr: ({node:_n,...props})=><hr style={{border:'none',borderTop:'1px solid rgba(255,255,255,.07)',margin:'12px 0'}} />,
              strong: ({node:_n,...props})=><strong style={{color:'#f0f0f0',fontWeight:'600'}} {...props}/>,
              li: ({node:_n,...props})=><li style={{margin:'4px 0',lineHeight:'1.65'}} {...props}/>,
              a: ({node:_n,...props})=><a style={{color:'#a78bfa',textDecoration:'none',borderBottom:'1px solid rgba(167,139,250,.3)'}} {...props}/>,
            }}>{p.c}</ReactMarkdown>
          </div>
        );
        if (p.t === 'diff') return (
          <div key={i} style={{background:'#0d1117',border:'1px solid rgba(255,255,255,.07)',borderRadius:'10px',margin:'8px 0',overflow:'hidden'}}>
            <div style={{padding:'6px 14px',background:'rgba(255,255,255,.03)',fontSize:'10px',color:'rgba(255,255,255,.28)',borderBottom:'1px solid rgba(255,255,255,.05)',fontFamily:'monospace',letterSpacing:'.06em',textTransform:'uppercase'}}>diff</div>
            <div style={{padding:'10px 14px'}}>
              {p.c.split('\n').map((line,j)=>(
                <div key={j} style={{color:line.startsWith('+')?'#4ade80':line.startsWith('-')?'#f87171':'rgba(255,255,255,.38)',fontFamily:'monospace',fontSize:'12px',lineHeight:'1.6'}}>{line}</div>
              ))}
            </div>
          </div>
        );
        return (
          <div key={i} style={{background:'#111114',border:'1px solid rgba(255,255,255,.07)',borderRadius:'10px',margin:'8px 0',overflow:'hidden'}}>
            {p.lang&&<div style={{padding:'6px 14px',background:'rgba(255,255,255,.03)',fontSize:'10px',color:'rgba(255,255,255,.28)',borderBottom:'1px solid rgba(255,255,255,.05)',fontFamily:'monospace',letterSpacing:'.06em'}}>{p.lang}</div>}
            <pre style={{padding:'12px 14px',margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word',fontSize:'12px',lineHeight:'1.6'}} dangerouslySetInnerHTML={{__html:hl(p.c,p.lang)}}/>
          </div>
        );
      })}
    </div>
  );
}

export function ActionChip({ action }) {
  const [expanded, setExpanded] = useState(false);
  const icons = {
    read_file:'📄', write_file:'✏️', patch_file:'🩹',
    list_files:'📁', exec:'⚡', search:'🔍',
    web_search:'🌐', tree:'🌳', mkdir:'📂',
    move_file:'→', delete_file:'🗑', mcp:'🔌',
  };
  const icon = icons[action.type] || '🔧';
  const label = action.type==='exec' ? (action.command||'').slice(0,44) : (action.path||action.type);
  const ok = action.result ? action.result.ok : null;

  const chipColor = ok===null
    ? { bg:'rgba(255,255,255,.04)', border:'rgba(255,255,255,.07)', text:'rgba(255,255,255,.35)' }
    : ok
    ? { bg:'rgba(74,222,128,.06)', border:'rgba(74,222,128,.14)', text:'#4ade80' }
    : { bg:'rgba(248,113,113,.06)', border:'rgba(248,113,113,.14)', text:'#f87171' };

  return (
    <div style={{margin:'3px 0'}}>
      <div onClick={()=>action.result&&setExpanded(!expanded)}
        style={{display:'inline-flex',alignItems:'center',gap:'6px',background:chipColor.bg,border:'1px solid '+chipColor.border,borderRadius:'8px',padding:'7px 12px',fontSize:'12px',fontFamily:'monospace',color:chipColor.text,cursor:action.result?'pointer':'default',minHeight:'36px',maxWidth:'100%'}}>
        <span style={{flexShrink:0}}>{icon}</span>
        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{label}</span>
        {ok===null&&<span style={{opacity:.4,fontSize:'10px'}}>···</span>}
        {ok===true&&<span style={{fontSize:'10px'}}>✓</span>}
        {ok===false&&<span style={{fontSize:'10px'}}>✗</span>}
        {action.result&&<span style={{opacity:.35,fontSize:'10px',flexShrink:0}}>{expanded?'▲':'▼'}</span>}
      </div>
      {expanded&&action.result&&(
        <div style={{background:'#0a0a0b',border:'1px solid rgba(255,255,255,.06)',borderRadius:'8px',padding:'10px 14px',marginTop:'4px',fontFamily:'monospace',fontSize:'12px',color:'rgba(255,255,255,.6)',whiteSpace:'pre-wrap',wordBreak:'break-word',maxHeight:'280px',overflowY:'auto',lineHeight:'1.6'}}>
          {typeof action.result.data==='string' ? action.result.data : JSON.stringify(action.result.data,null,2)}
        </div>
      )}
    </div>
  );
}

export function MsgBubble({ msg, onApprove, onPlanApprove, onRetry, onContinue, isLast, onAutoFix }) {
  const [actionsVisible, setActionsVisible] = useState(false);
  const isUser = msg.role === 'user';
  const thinkMatch = msg.content.match(/<think>([\s\S]*?)<\/think>/i);
  const thinkText = thinkMatch ? thinkMatch[1] : null;
  const cleanText = msg.content
    .replace(/<think>[\s\S]*?<\/think>/gi,'')
    .replace(/```action[\s\S]*?```/g,'')
    .replace(/PROJECT_NOTE:.*?\n/g,'')
    .trim();
  const actions = msg.actions || [];
  const hasPendingPatch = actions.some(a=>a.type==='patch_file'&&!a.executed);
  const isContinued = msg.content.trim().endsWith('CONTINUE');
  const hasPlan = !msg.planApproved && msg.content.includes('📋 **Plan (');
  const hasError = msg.role==='assistant' && (msg.content.includes('❌')||msg.content.includes('Error:'));

  const approveBtn = {background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.22)',borderRadius:'10px',padding:'10px 18px',color:'#4ade80',fontSize:'13px',cursor:'pointer',minHeight:'44px',fontWeight:'500',flex:1};
  const rejectBtn  = {background:'rgba(248,113,113,.07)',border:'1px solid rgba(248,113,113,.16)',borderRadius:'10px',padding:'10px 16px',color:'#f87171',fontSize:'13px',cursor:'pointer',minHeight:'44px'};

  if (isUser) return (
    <div style={{display:'flex',justifyContent:'flex-end',padding:'3px 14px 3px 48px',marginBottom:'2px'}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px',maxWidth:'84%'}}>
        <div style={{background:'rgba(255,255,255,.08)',borderRadius:'18px 18px 4px 18px',padding:'11px 16px',fontSize:'14px',lineHeight:'1.65',color:'#f0f0f0',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>
          {cleanText}
        </div>
        <div style={{display:'flex',gap:'4px',opacity:actionsVisible?1:0,transition:'opacity .15s'}}
          onMouseEnter={()=>setActionsVisible(true)} onMouseLeave={()=>setActionsVisible(false)}>
          <button style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.07)',padding:'5px 12px',color:'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer',borderRadius:'8px',minHeight:'32px'}}
            onClick={()=>navigator.clipboard?.writeText(cleanText).catch(()=>{})}>copy</button>
          {onRetry&&<button style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.07)',padding:'5px 12px',color:'rgba(255,255,255,.4)',fontSize:'11px',cursor:'pointer',borderRadius:'8px',minHeight:'32px'}} onClick={onRetry}>↺</button>}
        </div>
        {/* make hover zone larger */}
        <div style={{position:'absolute',width:'100%',height:'100%',top:0,left:0,pointerEvents:'none'}}
          onMouseEnter={()=>setActionsVisible(true)} onMouseLeave={()=>setActionsVisible(false)}/>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',padding:'3px 14px',marginBottom:'2px',gap:'0'}}>
      <div style={{display:'flex',flexDirection:'column',gap:'2px',width:'100%',maxWidth:'96%'}}>
        {thinkText&&<ThinkingBlock text={thinkText}/>}

        {/* AI message — subtle left accent */}
        <div style={{fontSize:'14px',lineHeight:'1.75',color:'#ddd',wordBreak:'break-word',paddingLeft:'2px'}}>
          <MsgContent text={cleanText}/>
        </div>

        {/* Action chips */}
        {actions.filter(a=>!['write_file','patch_file'].includes(a.type)||a.executed).map((a,i)=>(
          <ActionChip key={i} action={a}/>
        ))}

        {/* write_file executed — compact status */}
        {actions.filter(a=>a.type==='write_file'&&a.executed).map((a,i)=>(
          <div key={'w'+i} style={{display:'inline-flex',alignItems:'center',gap:'6px',background:a.result?.ok?'rgba(74,222,128,.06)':'rgba(248,113,113,.06)',border:'1px solid '+(a.result?.ok?'rgba(74,222,128,.14)':'rgba(248,113,113,.14)'),borderRadius:'8px',padding:'7px 12px',fontSize:'12px',fontFamily:'monospace',color:a.result?.ok?'#4ade80':'#f87171',margin:'3px 0'}}>
            {a.result?.ok?'✓':'✗'} {a.path?.split('/').pop()}
          </div>
        ))}

        {/* patch_file approval (only when failed/pending) */}
        {hasPendingPatch&&onApprove&&(
          <div style={{margin:'8px 0',display:'flex',flexDirection:'column',gap:'6px'}}>
            {actions.filter(a=>a.type==='patch_file'&&!a.executed).map((a,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'12px',overflow:'hidden'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 14px'}}>
                  <span style={{fontSize:'12px',color:'rgba(255,255,255,.5)',fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>🩹 {a.path}</span>
                </div>
                <div style={{display:'flex',gap:'8px',padding:'8px 14px',borderTop:'1px solid rgba(255,255,255,.04)'}}>
                  <button onClick={()=>onApprove(true,a.path)} style={approveBtn}>✓ Apply</button>
                  <button onClick={()=>onApprove(false,a.path)} style={rejectBtn}>✗</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Plan approval */}
        {hasPlan&&onPlanApprove&&(
          <div style={{display:'flex',gap:'8px',margin:'10px 0 4px'}}>
            <button onClick={()=>onPlanApprove(true)} style={approveBtn}>✓ Jalankan Plan</button>
            <button onClick={()=>onPlanApprove(false)} style={rejectBtn}>✗ Ubah</button>
          </div>
        )}

        {/* Auto-fix */}
        {isLast&&onAutoFix&&hasError&&(
          <button onClick={onAutoFix} style={{...rejectBtn,alignSelf:'flex-start',marginTop:'6px',fontSize:'12px',padding:'8px 14px'}}>🔧 Auto-fix</button>
        )}

        {/* Continue */}
        {isContinued&&onContinue&&(
          <button onClick={onContinue} style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'10px',padding:'10px 18px',color:'#a78bfa',fontSize:'13px',cursor:'pointer',alignSelf:'flex-start',marginTop:'4px',minHeight:'44px'}}>↓ Lanjutkan</button>
        )}

        {/* Message actions */}
        <div style={{display:'flex',gap:'4px',marginTop:'4px'}}>
          <button style={{background:'none',border:'none',padding:'4px 8px',color:'rgba(255,255,255,.2)',fontSize:'11px',cursor:'pointer',borderRadius:'6px',minHeight:'32px'}}
            onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.5)'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.2)'}
            onClick={()=>navigator.clipboard?.writeText(cleanText).catch(()=>{})}>copy</button>
          {isLast&&onRetry&&<button style={{background:'none',border:'none',padding:'4px 8px',color:'rgba(255,255,255,.2)',fontSize:'11px',cursor:'pointer',borderRadius:'6px',minHeight:'32px'}}
            onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.5)'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.2)'}
            onClick={onRetry}>↺ retry</button>}
        </div>
      </div>
    </div>
  );
}
