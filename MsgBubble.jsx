import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';

import {
  FileText, Pencil, FileDiff, Folder, FolderOpen, Search, Globe,
  Network, ArrowRight, Trash2, Plug, Wrench, Check, X, Scissors,
  RotateCcw, ChevronDown, ChevronUp, AlignLeft, Play, Copy,
  Brain, Terminal,
} from 'lucide-react';

// ── ThinkingBlock — collapsible, pakai count kalau ada newlines ──────────────
export function ThinkingBlock({ text, T, live = false }) {
  const [open, setOpen] = React.useState(false);
  if (!text?.trim()) return null;
  const tc   = T?.bubble?.thinking || {};
  const c    = tc.color || 'rgba(167,139,250,.5)';
  const cFaint = c.replace(/[\d.]+\)$/, '.15)') || 'rgba(167,139,250,.15)';
  const cBg    = c.replace(/[\d.]+\)$/, '.04)') || 'rgba(167,139,250,.04)';
  // Count "steps" = non-empty paragraphs separated by blank lines
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

// ── StreamingBubble — live render saat generate, parse think realtime ─────────
export function StreamingBubble({ text, T }) {
  const bubbleAi  = T?.bubble?.ai || {};
  const fxAi      = T?.fx?.aiBubble?.() || {};
  const textColor = T?.text || 'rgba(255,255,255,.9)';

  // Parse <think> dari stream secara realtime
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
          // Nothing yet — show blink cursor only
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

// ── MsgContent — markdown + code blocks ──────────────────────────────────────
// ── MsgBubble ─────────────────────────────────────────────────────────────────
export function MsgBubble({ msg, onApprove, onPlanApprove, onRetry, onContinue, isLast, onAutoFix, onDelete, onEdit, T }) {
  const [actionsVisible,setActionsVisible]=useState(false);
  const [editing,setEditing]=useState(false);
  const [editText,setEditText]=useState('');
  const [surgical,setSurgical]=useState(false);
  const [copied,setCopied]=useState(false);

  const isUser        = msg.role==='user';
  const thinkMatch    = msg.content.match(/<think>([\s\S]*?)<\/think>/i)||msg.content.match(/<think>([\s\S]*?)$/i);
  const thinkText     = thinkMatch?thinkMatch[1]:null;
  const cleanText     = msg.content
    .replace(/<think>[\s\S]*?<\/think>/gi,'').replace(/<think>[\s\S]*$/gi,'')
    .replace(/```action[\s\S]*?```/g,'').replace(/PROJECT_NOTE:.*?\n/g,'').trim();
  const actions       = msg.actions||[];
  const pendingWrites = actions.filter(a=>a.type==='write_file'&&!a.executed);
  const isContinued   = msg.content.trim().endsWith('CONTINUE');
  const hasPlan       = !msg.planApproved&&msg.content.includes('📋 **Plan (');
  const hasError      = msg.role==='assistant'&&(msg.content.includes('❌')||msg.content.includes('Error:'));

  const accent        = T?.accent        || '#a78bfa';
  const accentBg      = T?.accentBg      || 'rgba(124,58,237,.12)';
  const accentBorder  = T?.accentBorder  || 'rgba(124,58,237,.25)';
  const border        = T?.border        || 'rgba(255,255,255,.07)';
  const bg3           = T?.bg3           || 'rgba(255,255,255,.03)';
  const success       = T?.success       || '#4ade80';
  const successBg     = T?.successBg     || 'rgba(74,222,128,.08)';
  const error         = T?.error         || '#f87171';
  const errorBg       = T?.errorBg       || 'rgba(248,113,113,.08)';
  const textMute      = T?.textMute      || 'rgba(255,255,255,.3)';
  const textSec       = T?.textSec       || 'rgba(255,255,255,.6)';
  const text          = T?.text          || 'rgba(255,255,255,.9)';
  const bubbleUser    = T?.bubble?.user  || {};
  const bubbleAi      = T?.bubble?.ai    || {};
  const fxAiBubble    = T?.fx?.aiBubble?.()  || {};
  const fxUserBubble  = T?.fx?.userBubble?.()|| {};

  function doCopy(){navigator.clipboard?.writeText(cleanText).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),1800);}

  const approveBtn={background:successBg,border:'1px solid '+success+'44',borderRadius:'10px',padding:'10px 18px',color:success,fontSize:'13px',cursor:'pointer',minHeight:'44px',fontWeight:'500',flex:1,display:'flex',alignItems:'center',gap:'6px',justifyContent:'center'};
  const rejectBtn ={background:errorBg,border:'1px solid '+error+'44',borderRadius:'10px',padding:'10px 16px',color:error,fontSize:'13px',cursor:'pointer',minHeight:'44px',display:'flex',alignItems:'center',gap:'6px'};

  // ── User bubble ─────────────────────────────────────────────────────────────
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

  // ── AI bubble ───────────────────────────────────────────────────────────────
  return (
    <div style={{display:'flex',padding:'10px 16px',marginBottom:'2px',gap:'12px',alignItems:'flex-start'}}>
      <div style={{display:'flex',flexDirection:'column',gap:'3px',flex:1,minWidth:0}}>
        {thinkText&&<ThinkingBlock text={thinkText} T={T} live={false}/>}
        <div style={{
          fontSize:'14.5px',lineHeight:'1.8',color:bubbleAi.color||text,wordBreak:'break-word',
          ...(bubbleAi.bg&&bubbleAi.bg!=='transparent'?{
            background:bubbleAi.bg,border:'1px solid '+(bubbleAi.border||'transparent'),
            borderRadius:bubbleAi.radius||'4px 16px 16px 16px',padding:'10px 14px',
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
          <div style={{margin:'8px 0',display:'flex',flexDirection:'column',gap:'8px'}}>
            <div style={{fontSize:'11px',color:textMute,fontFamily:'monospace',marginBottom:'2px'}}>
              {pendingWrites.length} file menunggu approval:
            </div>
            {pendingWrites.map((a,i)=>(
              <DiffReviewCard key={i} action={a} onApprove={onApprove} T={T}
                approveBtn={approveBtn} rejectBtn={rejectBtn}
                border={border} bg3={bg3} textMute={textMute} textSec={textSec}/>
            ))}
            {pendingWrites.length>1&&(
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={()=>onApprove(true,'__all__')} style={approveBtn}><Check size={13}/> Apply All ({pendingWrites.length})</button>
                <button onClick={()=>onApprove(false,'__all__')} style={rejectBtn}><X size={13}/></button>
              </div>
            )}
          </div>
        )}

        {actions.filter(a=>a.type==='patch_file'&&!a.executed).length>0&&onApprove&&(
          <div style={{margin:'8px 0',display:'flex',flexDirection:'column',gap:'8px'}}>
            {actions.filter(a=>a.type==='patch_file'&&!a.executed).map((a,i)=>(
              <DiffReviewCard key={i} action={a} onApprove={onApprove} T={T}
                approveBtn={approveBtn} rejectBtn={rejectBtn}
                border={border} bg3={bg3} textMute={textMute} textSec={textSec}/>
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
            <button key={i} onClick={btn.onClick}
              style={{background:'none',border:'none',padding:'4px 8px',color:btn.danger?error+'88':textMute,fontSize:'11px',cursor:'pointer',borderRadius:'6px',minHeight:'30px',display:'flex',alignItems:'center',gap:'4px',transition:'color .12s'}}
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
