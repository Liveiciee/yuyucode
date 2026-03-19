import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hl } from '../utils.js';
import {
  FileText, Pencil, FileDiff, Folder, FolderOpen, Search, Globe,
  Network, ArrowRight, Trash2, Plug, Wrench, Check, X, Scissors,
  RotateCcw, ChevronDown, ChevronUp, AlignLeft, Play, Copy,
  Sparkles, Brain, Terminal,
} from 'lucide-react';

export function ThinkingBlock({ text, T }) {
  const [open, setOpen] = React.useState(false);
  if (!text?.trim()) return null;
  const tc = T?.bubble?.thinking || {};
  const c  = tc.color || 'rgba(167,139,250,.5)';
  return (
    <div style={{margin:'0 0 10px',borderRadius:'12px',overflow:'hidden',border:'1px solid '+(c.replace(/[\d.]+\)$/,'.2)')||'rgba(167,139,250,.15)'),background:c.replace(/[\d.]+\)$/,'.04)')||'rgba(167,139,250,.04)'}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 14px',cursor:'pointer',userSelect:'none',minHeight:'40px'}}>
        <Brain size={12} style={{color:c,flexShrink:0}}/>
        <span style={{fontSize:'11px',color:c,fontFamily:'monospace',letterSpacing:'.08em',textTransform:'uppercase',flex:1}}>Berpikir…</span>
        <span style={{fontSize:'10px',color:c,transition:'transform .2s',display:'inline-block',transform:open?'rotate(180deg)':'rotate(0deg)'}}>▾</span>
      </div>
      {open&&<div style={{padding:'2px 14px 12px',fontSize:'12px',lineHeight:'1.75',color:T?.textMute||'rgba(255,255,255,.4)',fontFamily:'monospace',whiteSpace:'pre-wrap',wordBreak:'break-word',borderTop:'1px solid '+(T?.border||'rgba(255,255,255,.06)')}}>{text.trim()}</div>}
    </div>
  );
}

export function MsgContent({ text, T }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const parts = [];
  const regex  = /```(\w+)?\n?([\s\S]*?)```/g;
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

  function copyCode(code, idx) {
    navigator.clipboard?.writeText(code).catch(()=>{});
    setCopiedIdx(idx); setTimeout(()=>setCopiedIdx(null), 1800);
  }

  const codeBg     = T?.code?.bg      || '#0d0d10';
  const codeBorder = T?.code?.border  || '1px solid rgba(255,255,255,.07)';
  const codeColor  = T?.code?.color   || 'rgba(200,180,255,.65)';
  const text_      = T?.text          || 'rgba(255,255,255,.88)';
  const accent     = T?.accent        || '#a78bfa';
  const accentBorder = T?.accentBorder|| 'rgba(124,58,237,.2)';
  const border     = T?.border        || 'rgba(255,255,255,.07)';
  const bg3        = T?.bg3           || 'rgba(255,255,255,.03)';
  const success    = T?.success       || '#4ade80';
  const error      = T?.error         || '#f87171';
  const textSec    = T?.textSec       || 'rgba(255,255,255,.6)';
  const textMute   = T?.textMute      || 'rgba(255,255,255,.3)';
  const fxCode     = T?.fx?.codeBlock?.() || {};

  return (
    <div>
      {parts.map((p,i)=>{
        if (p.t==='text') return (
          <div key={i} style={{lineHeight:'1.8',wordBreak:'break-word'}}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              table:({node:_,...props})=><div style={{overflowX:'auto',margin:'12px 0'}}><table style={{width:'100%',borderCollapse:'collapse',background:'rgba(255,255,255,.02)',borderRadius:'10px',overflow:'hidden',border:'1px solid '+border}} {...props}/></div>,
              th:({node:_,...props})=><th style={{padding:'9px 16px',fontSize:'11px',color:textSec,fontWeight:'600',borderBottom:'1px solid '+border,textAlign:'left',whiteSpace:'nowrap',background:bg3}} {...props}/>,
              td:({node:_,...props})=><td style={{padding:'9px 16px',fontSize:'13.5px',borderBottom:'1px solid '+border,verticalAlign:'top',color:text_}} {...props}/>,
              h1:({node:_,...props})=><div style={{fontSize:'18px',fontWeight:'700',color:T?.text||'#f2f0ea',margin:'20px 0 8px',letterSpacing:'-.4px',borderBottom:'1px solid '+border,paddingBottom:'8px',...(T?.fx?.glowText?.(accent)||{})}} {...props}/>,
              h2:({node:_,...props})=><div style={{fontSize:'15px',fontWeight:'700',color:T?.text||'#f0ece3',margin:'16px 0 6px'}} {...props}/>,
              h3:({node:_,...props})=><div style={{fontSize:'14px',fontWeight:'600',color:T?.text||'#ece8de',margin:'13px 0 5px'}} {...props}/>,
              p:({node:_,...props})=><p style={{margin:'0 0 10px',color:text_,lineHeight:'1.8'}} {...props}/>,
              code:({node:_,inline,...props})=>inline
                ?<code style={{background:bg3,padding:'2px 7px',borderRadius:'5px',fontFamily:'monospace',fontSize:'12.5px',color:codeColor,...(T?.fx?.glowText?.(codeColor.replace(/[\d.]+\)$/,'.4)'))||{})}} {...props}/>
                :<pre style={{background:codeBg,padding:'14px 16px',borderRadius:'10px',overflow:'auto',fontSize:'12.5px',margin:'10px 0',lineHeight:'1.65',border:codeBorder}} {...props}/>,
              blockquote:({node:_,...props})=><blockquote style={{borderLeft:'3px solid '+accentBorder,margin:'10px 0',padding:'4px 14px',color:textSec,fontStyle:'italic'}} {...props}/>,
              hr:({node:_,...props})=><hr style={{border:'none',borderTop:'1px solid '+border,margin:'14px 0'}}/>,
              strong:({node:_,...props})=><strong style={{color:T?.text||'#f2ede4',fontWeight:'600'}} {...props}/>,
              em:({node:_,...props})=><em style={{color:textSec}} {...props}/>,
              li:({node:_,...props})=><li style={{margin:'5px 0',lineHeight:'1.75',color:text_}} {...props}/>,
              ul:({node:_,...props})=><ul style={{paddingLeft:'20px',margin:'6px 0'}} {...props}/>,
              ol:({node:_,...props})=><ol style={{paddingLeft:'20px',margin:'6px 0'}} {...props}/>,
              a:({node:_,...props})=><a style={{color:accent,textDecoration:'none',borderBottom:'1px solid '+accentBorder,...(T?.fx?.glowText?.(accent.replace(/\)$/,'.5)'))||{})}} {...props}/>,
            }}>{p.c}</ReactMarkdown>
          </div>
        );

        if (p.t==='diff') return (
          <div key={i} style={{background:codeBg,border:codeBorder,borderRadius:'12px',margin:'10px 0',overflow:'hidden',...fxCode}}>
            <div style={{padding:'7px 14px',background:bg3,fontSize:'10px',color:textMute,fontFamily:'monospace',borderBottom:'1px solid '+border,letterSpacing:'.08em',textTransform:'uppercase',display:'flex',alignItems:'center',gap:'6px'}}>
              <FileDiff size={11}/> diff
            </div>
            <div style={{padding:'10px 14px'}}>
              {p.c.split('\n').map((line,j)=>(
                <div key={j} style={{color:line.startsWith('+')?success:line.startsWith('-')?error:textSec,fontFamily:'monospace',fontSize:'12.5px',lineHeight:'1.65',background:line.startsWith('+')?T?.successBg||'rgba(74,222,128,.04)':line.startsWith('-')?T?.errorBg||'rgba(248,113,113,.04)':'transparent',padding:'0 4px',borderRadius:'3px'}}>{line}</div>
              ))}
            </div>
          </div>
        );

        return (
          <div key={i} style={{background:codeBg,border:codeBorder,borderRadius:'12px',margin:'10px 0',overflow:'hidden',...fxCode}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 12px 7px 14px',background:bg3,borderBottom:'1px solid '+border}}>
              <span style={{fontSize:'11px',color:textMute,fontFamily:'monospace',letterSpacing:'.06em',...(T?.fx?.glowText?.(codeColor)||{})}}>{p.lang||'code'}</span>
              <button onClick={()=>copyCode(p.c,i)} style={{background:copiedIdx===i?T?.successBg||'rgba(74,222,128,.1)':bg3,border:'1px solid '+(copiedIdx===i?success+'55':border),borderRadius:'6px',padding:'3px 8px',color:copiedIdx===i?success:textMute,fontSize:'10px',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',transition:'all .15s'}}>
                {copiedIdx===i?<Check size={10}/>:<Copy size={10}/>} {copiedIdx===i?'Copied!':'Copy'}
              </button>
            </div>
            <pre style={{padding:'12px 16px',margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word',fontSize:'12.5px',lineHeight:'1.65',fontFamily:'monospace'}} dangerouslySetInnerHTML={{__html:hl(p.c,p.lang)}}/>
          </div>
        );
      })}
    </div>
  );
}

export function ActionChip({ action, T }) {
  const [expanded, setExpanded] = useState(false);
  const icons = {
    read_file:<FileText size={12}/>, write_file:<Pencil size={12}/>, patch_file:<FileDiff size={12}/>,
    list_files:<Folder size={12}/>, exec:<Terminal size={12}/>, search:<Search size={12}/>,
    web_search:<Globe size={12}/>, tree:<Network size={12}/>, mkdir:<FolderOpen size={12}/>,
    move_file:<ArrowRight size={12}/>, delete_file:<Trash2 size={12}/>, mcp:<Plug size={12}/>,
  };
  const icon   = icons[action.type]||<Wrench size={12}/>;
  const label  = action.type==='exec'?(action.command||'').slice(0,48):(action.path||action.type);
  const ok     = action.result?action.result.ok:null;
  const border = T?.border  || 'rgba(255,255,255,.07)';
  const bg3    = T?.bg3     || 'rgba(255,255,255,.03)';
  const textMute=T?.textMute|| 'rgba(255,255,255,.4)';
  const success= T?.success || '#4ade80';
  const error  = T?.error   || '#f87171';
  const cs = ok===null
    ?{bg:bg3,border:border,text:textMute,fx:{}}
    :ok
    ?{bg:T?.successBg||'rgba(74,222,128,.06)',border:success+'44',text:success,fx:T?.fx?.chipOk?.()||{}}
    :{bg:T?.errorBg||'rgba(248,113,113,.06)',border:error+'44',text:error,fx:{}};
  return (
    <div style={{margin:'3px 0'}}>
      <div onClick={()=>action.result&&setExpanded(!expanded)} style={{display:'inline-flex',alignItems:'center',gap:'7px',background:cs.bg,border:'1px solid '+cs.border,borderRadius:'8px',padding:'6px 12px',fontSize:'12px',fontFamily:'monospace',color:cs.text,cursor:action.result?'pointer':'default',maxWidth:'100%',minHeight:'34px',...cs.fx}}>
        <span style={{flexShrink:0,opacity:.8}}>{icon}</span>
        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{label}</span>
        {ok===null&&<span style={{opacity:.5,fontSize:'10px'}}>···</span>}
        {ok===true&&<Check size={11} style={{flexShrink:0}}/>}
        {ok===false&&<X size={11} style={{flexShrink:0}}/>}
        {action.result&&<span style={{opacity:.3,flexShrink:0}}>{expanded?<ChevronUp size={10}/>:<ChevronDown size={10}/>}</span>}
      </div>
      {expanded&&action.result&&(
        <div style={{background:T?.bg||'#080810',border:'1px solid '+border,borderRadius:'10px',padding:'10px 14px',marginTop:'4px',fontFamily:'monospace',fontSize:'12px',color:T?.textSec||'rgba(255,255,255,.65)',whiteSpace:'pre-wrap',wordBreak:'break-word',maxHeight:'280px',overflowY:'auto',lineHeight:'1.65'}}>
          {typeof action.result.data==='string'?action.result.data:JSON.stringify(action.result.data,null,2)}
        </div>
      )}
    </div>
  );
}

export function MsgBubble({ msg, onApprove, onPlanApprove, onRetry, onContinue, isLast, onAutoFix, onDelete, onEdit, T }) {
  const [actionsVisible,setActionsVisible]=useState(false);
  const [editing,setEditing]=useState(false);
  const [editText,setEditText]=useState('');
  const [surgical,setSurgical]=useState(false);
  const [copied,setCopied]=useState(false);

  const isUser       = msg.role==='user';
  const thinkMatch   = msg.content.match(/<think>([\s\S]*?)<\/think>/i)||msg.content.match(/<think>([\s\S]*?)$/i);
  const thinkText    = thinkMatch?thinkMatch[1]:null;
  const cleanText    = msg.content
    .replace(/<think>[\s\S]*?<\/think>/gi,'').replace(/<think>[\s\S]*$/gi,'')
    .replace(/```action[\s\S]*?```/g,'').replace(/PROJECT_NOTE:.*?\n/g,'').trim();
  const actions      = msg.actions||[];
  const pendingWrites= actions.filter(a=>a.type==='write_file'&&!a.executed);
  const isContinued  = msg.content.trim().endsWith('CONTINUE');
  const hasPlan      = !msg.planApproved&&msg.content.includes('📋 **Plan (');
  const hasError     = msg.role==='assistant'&&(msg.content.includes('❌')||msg.content.includes('Error:'));

  const accent       = T?.accent        || '#a78bfa';
  const accentBg     = T?.accentBg      || 'rgba(124,58,237,.12)';
  const accentBorder = T?.accentBorder  || 'rgba(124,58,237,.25)';
  const border       = T?.border        || 'rgba(255,255,255,.07)';
  const bg3          = T?.bg3           || 'rgba(255,255,255,.03)';
  const success      = T?.success       || '#4ade80';
  const successBg    = T?.successBg     || 'rgba(74,222,128,.08)';
  const error        = T?.error         || '#f87171';
  const errorBg      = T?.errorBg       || 'rgba(248,113,113,.08)';
  const textMute     = T?.textMute      || 'rgba(255,255,255,.3)';
  const textSec      = T?.textSec       || 'rgba(255,255,255,.6)';
  const text         = T?.text          || 'rgba(255,255,255,.9)';
  const bubbleUser   = T?.bubble?.user  || {};
  const bubbleAi     = T?.bubble?.ai    || {};

  // Theme-specific fx
  const fxAiBubble   = T?.fx?.aiBubble?.()  || {};
  const fxUserBubble = T?.fx?.userBubble?.()|| {};
  const fxGlowBorder = T?.fx?.glowBorder?.(accent) || {};

  function doCopy(){navigator.clipboard?.writeText(cleanText).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),1800);}

  const approveBtn={background:successBg,border:'1px solid '+success+'44',borderRadius:'10px',padding:'10px 18px',color:success,fontSize:'13px',cursor:'pointer',minHeight:'44px',fontWeight:'500',flex:1,display:'flex',alignItems:'center',gap:'6px',justifyContent:'center'};
  const rejectBtn ={background:errorBg,border:'1px solid '+error+'44',borderRadius:'10px',padding:'10px 16px',color:error,fontSize:'13px',cursor:'pointer',minHeight:'44px',display:'flex',alignItems:'center',gap:'6px'};

  // ── User bubble ──────────────────────────────────────────────────────────
  if (isUser) return (
    <div style={{display:'flex',justifyContent:'flex-end',padding:'8px 16px 8px 56px',marginBottom:'4px'}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'5px',maxWidth:'82%'}}
        onMouseEnter={()=>setActionsVisible(true)} onMouseLeave={()=>setActionsVisible(false)}>
        {editing?(
          <div style={{display:'flex',flexDirection:'column',gap:'7px',width:'100%'}}>
            <div style={{display:'flex',gap:'5px'}}>
              <button onClick={()=>setSurgical(false)} style={{background:!surgical?accentBg:bg3,border:'1px solid '+(!surgical?accentBorder:border),borderRadius:'7px',padding:'4px 10px',color:!surgical?accent:textMute,fontSize:'11px',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px'}}><AlignLeft size={11}/> Teks penuh</button>
              <button onClick={()=>setSurgical(true)}  style={{background:surgical?accentBg:bg3,border:'1px solid '+(surgical?accentBorder:border),borderRadius:'7px',padding:'4px 10px',color:surgical?accent:textMute,fontSize:'11px',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px'}}><Scissors size={11}/> Surgical</button>
            </div>
            {surgical?(
              <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                <div style={{fontSize:'11px',color:textMute,marginBottom:'2px'}}>Tap bagian yang mau dihapus:</div>
                {editText.split(/\n(?=```|\*\*|##|===|---|\n)/).map((chunk,ci)=>{
                  const isRemoved=editText.split(/\n(?=```|\*\*|##|===|---|\n)/)[ci]?.startsWith('~~REMOVE~~');
                  return(
                    <div key={ci} onClick={()=>{setEditText(prev=>{const ps=prev.split(/\n(?=```|\*\*|##|===|---|\n)/);ps[ci]=ps[ci].startsWith('~~REMOVE~~')?ps[ci].slice(10):'~~REMOVE~~'+ps[ci];return ps.join('\n');});}} style={{padding:'7px 12px',borderRadius:'8px',cursor:'pointer',background:isRemoved?errorBg:bg3,border:'1px solid '+(isRemoved?error+'44':border),opacity:isRemoved?.55:1,transition:'all .15s'}}>
                      <div style={{fontSize:'10px',color:textMute,fontFamily:'monospace',marginBottom:'2px'}}>{chunk.trim().startsWith('```')?'code':'text'}</div>
                      <div style={{fontSize:'11.5px',color:textSec,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{chunk.replace('~~REMOVE~~','').trim().slice(0,80)}</div>
                    </div>
                  );
                })}
              </div>
            ):(
              <textarea value={editText.replace(/~~REMOVE~~/g,'')} onChange={e=>setEditText(e.target.value)} autoFocus
                style={{background:bg3,border:'1px solid '+border,borderRadius:'14px',padding:'12px 16px',fontSize:'14px',lineHeight:'1.7',color:text,resize:'vertical',minHeight:'60px',outline:'none',fontFamily:'inherit',width:'100%',boxSizing:'border-box'}}/>
            )}
            <div style={{display:'flex',gap:'6px',justifyContent:'flex-end'}}>
              <button onClick={()=>{setEditing(false);setSurgical(false);}} style={{background:bg3,border:'1px solid '+border,borderRadius:'8px',padding:'6px 14px',color:textMute,fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}><X size={12}/> Batal</button>
              <button onClick={()=>{const c=surgical?editText.split(/\n(?=```|\*\*|##|===|---|\n)/).filter(s=>!s.startsWith('~~REMOVE~~')).join('\n').trim():editText.trim();onEdit(c);setEditing(false);setSurgical(false);}} style={{background:accentBg,border:'1px solid '+accentBorder,borderRadius:'8px',padding:'6px 16px',color:accent,fontSize:'12px',cursor:'pointer',fontWeight:'500',display:'flex',alignItems:'center',gap:'5px'}}><Check size={12}/> Simpan</button>
            </div>
          </div>
        ):(
          <div style={{background:bubbleUser.bg||accentBg,border:'1px solid '+(bubbleUser.border||accentBorder),borderRadius:bubbleUser.radius||'18px 18px 4px 18px',padding:'11px 16px',fontSize:'14.5px',lineHeight:'1.7',color:bubbleUser.color||text,whiteSpace:'pre-wrap',wordBreak:'break-word',...fxUserBubble}}>
            {cleanText}
          </div>
        )}
        <div style={{display:'flex',gap:'3px',opacity:actionsVisible?1:0,transition:'opacity .15s',pointerEvents:actionsVisible?'auto':'none'}}>
          <button onClick={doCopy} style={{background:copied?successBg:bg3,border:'1px solid '+(copied?success+'55':border),padding:'5px 10px',color:copied?success:textMute,fontSize:'11px',cursor:'pointer',borderRadius:'8px',minHeight:'30px',display:'flex',alignItems:'center'}}>{copied?<Check size={12}/>:<Copy size={12}/>}</button>
          {onEdit&&<button onClick={()=>{setEditText(cleanText);setEditing(true);}} style={{background:bg3,border:'1px solid '+border,padding:'5px 10px',color:textMute,fontSize:'11px',cursor:'pointer',borderRadius:'8px',minHeight:'30px',display:'flex',alignItems:'center'}}><Pencil size={12}/></button>}
          {onRetry&&<button onClick={onRetry} style={{background:bg3,border:'1px solid '+border,padding:'5px 10px',color:textMute,fontSize:'11px',cursor:'pointer',borderRadius:'8px',minHeight:'30px',display:'flex',alignItems:'center'}}><RotateCcw size={12}/></button>}
          {onDelete&&<button onClick={onDelete} style={{background:errorBg,border:'1px solid '+error+'44',padding:'5px 10px',color:error,fontSize:'11px',cursor:'pointer',borderRadius:'8px',minHeight:'30px',display:'flex',alignItems:'center'}}><Trash2 size={12}/></button>}
        </div>
      </div>
    </div>
  );

  // ── AI bubble ───────────────────────────────────────────────────────────
  return (
    <div style={{display:'flex',padding:'10px 16px',marginBottom:'2px',gap:'12px',alignItems:'flex-start'}}>
      {/* AI avatar dengan accent theme */}
      <div style={{width:'28px',height:'28px',borderRadius:'8px',flexShrink:0,background:accentBg,border:'1px solid '+accentBorder,display:'flex',alignItems:'center',justifyContent:'center',marginTop:'2px',...fxGlowBorder}}>
        <Sparkles size={13} style={{color:accent,...(T?.fx?.glowText?.(accent)||{})}}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'3px',flex:1,minWidth:0}}>
        {thinkText&&<ThinkingBlock text={thinkText} T={T}/>}
        {/* AI message wrapper — ink pakai left-rule, lainnya pakai bubble */}
        <div style={{
          fontSize:'14.5px',lineHeight:'1.8',color:bubbleAi.color||text,wordBreak:'break-word',
          ...(bubbleAi.bg&&bubbleAi.bg!=='transparent'?{
            background:bubbleAi.bg,border:'1px solid '+(bubbleAi.border||'transparent'),
            borderRadius:bubbleAi.radius||'4px 16px 16px 16px',
            padding:'10px 14px',
          }:{}),
          ...fxAiBubble,
        }}>
          <MsgContent text={cleanText} T={T}/>
        </div>

        {actions.filter(a=>!['write_file','patch_file'].includes(a.type)||a.executed).map((a,i)=><ActionChip key={i} action={a} T={T}/>)}

        {actions.filter(a=>a.type==='write_file'&&a.executed).map((a,i)=>(
          <div key={'w'+i} style={{display:'inline-flex',alignItems:'center',gap:'7px',background:a.result?.ok?successBg:errorBg,border:'1px solid '+(a.result?.ok?success+'44':error+'44'),borderRadius:'8px',padding:'6px 12px',fontSize:'12px',fontFamily:'monospace',color:a.result?.ok?success:error,margin:'3px 0'}}>
            {a.result?.ok?<Check size={11}/>:<X size={11}/>} {a.path?.split('/').pop()}
          </div>
        ))}

        {pendingWrites.length>0&&onApprove&&(
          <div style={{margin:'8px 0',display:'flex',flexDirection:'column',gap:'6px'}}>
            <div style={{fontSize:'11px',color:textMute,fontFamily:'monospace',marginBottom:'2px'}}>{pendingWrites.length} file menunggu approval:</div>
            {pendingWrites.map((a,i)=>(
              <div key={i} style={{background:bg3,border:'1px solid '+border,borderRadius:'8px',padding:'8px 14px',fontSize:'12px',fontFamily:'monospace',color:textSec,display:'flex',alignItems:'center',gap:'8px'}}>
                <Pencil size={12} style={{opacity:.5,flexShrink:0}}/><span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.path}</span>
              </div>
            ))}
            <div style={{display:'flex',gap:'8px',marginTop:'2px'}}>
              <button onClick={()=>onApprove(true,'__all__')} style={approveBtn}><Check size={13}/> Apply All ({pendingWrites.length})</button>
              <button onClick={()=>onApprove(false,'__all__')} style={rejectBtn}><X size={13}/></button>
            </div>
          </div>
        )}

        {actions.filter(a=>a.type==='patch_file'&&!a.executed).length>0&&onApprove&&(
          <div style={{margin:'8px 0',display:'flex',flexDirection:'column',gap:'6px'}}>
            {actions.filter(a=>a.type==='patch_file'&&!a.executed).map((a,i)=>(
              <div key={i} style={{background:bg3,border:'1px solid '+border,borderRadius:'12px',overflow:'hidden',...(T?.fx?.glowBorder?.(border)||{})}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 14px'}}><FileDiff size={12} style={{color:textMute}}/><span style={{fontSize:'12px',color:textSec,fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.path}</span></div>
                <div style={{display:'flex',gap:'8px',padding:'8px 14px',borderTop:'1px solid '+border}}>
                  <button onClick={()=>onApprove(true,a.path)} style={approveBtn}><Check size={13}/> Apply</button>
                  <button onClick={()=>onApprove(false,a.path)} style={rejectBtn}><X size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasPlan&&onPlanApprove&&(
          <div style={{display:'flex',gap:'8px',margin:'10px 0 4px'}}>
            <button onClick={()=>onPlanApprove(true)} style={approveBtn}><Play size={13}/> Jalankan Plan</button>
            <button onClick={()=>onPlanApprove(false)} style={rejectBtn}><X size={13}/> Ubah</button>
          </div>
        )}

        {isLast&&onAutoFix&&hasError&&(
          <button onClick={onAutoFix} style={{...rejectBtn,alignSelf:'flex-start',marginTop:'6px',fontSize:'12px',padding:'8px 14px'}}>
            <Wrench size={13}/> Auto-fix
          </button>
        )}

        {isContinued&&onContinue&&(
          <button onClick={onContinue} style={{background:accentBg,border:'1px solid '+accentBorder,borderRadius:'10px',padding:'10px 18px',color:accent,fontSize:'13px',cursor:'pointer',alignSelf:'flex-start',marginTop:'4px',minHeight:'44px',display:'flex',alignItems:'center',gap:'6px',...(T?.fx?.glowBorder?.(accentBorder)||{})}}>
            <ChevronDown size={14}/> Lanjutkan
          </button>
        )}

        <div style={{display:'flex',gap:'2px',marginTop:'6px'}}>
          {[
            {icon:copied?<Check size={12}/>:<Copy size={12}/>,onClick:doCopy},
            onEdit&&{icon:<Scissors size={12}/>,onClick:()=>{setEditText(cleanText);setSurgical(true);setEditing(true);}},
            onDelete&&{icon:<Trash2 size={12}/>,onClick:onDelete,danger:true},
            isLast&&onRetry&&{icon:<RotateCcw size={12}/>,onClick:onRetry,label:'retry'},
          ].filter(Boolean).map((btn,i)=>(
            <button key={i} onClick={btn.onClick} style={{background:'none',border:'none',padding:'4px 8px',color:btn.danger?error+'88':textMute,fontSize:'11px',cursor:'pointer',borderRadius:'6px',minHeight:'30px',display:'flex',alignItems:'center',gap:'4px',transition:'color .12s'}}
              onMouseEnter={e=>e.currentTarget.style.color=btn.danger?error:textSec}
              onMouseLeave={e=>e.currentTarget.style.color=btn.danger?error+'88':textMute}>
              {btn.icon}{btn.label&&<span>{btn.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
