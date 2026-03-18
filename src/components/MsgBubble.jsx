import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hl } from '../utils.js';

export const S = {
  msgRow: (isUser) => ({ display:'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', padding:'3px 12px', marginBottom:'2px' }),
  userBubble: { background:'rgba(255,255,255,.08)', borderRadius:'18px 18px 4px 18px', padding:'11px 15px', maxWidth:'82%', minWidth:'60px', fontSize:'14px', lineHeight:'1.6', color:'#f0f0f0', whiteSpace:'pre-wrap', wordBreak:'break-word' },
  aiBubble: { maxWidth:'96%', fontSize:'14px', lineHeight:'1.7', color:'#e0e0e0', wordBreak:'break-word' },
  actionChip: (ok) => ({ display:'inline-flex', alignItems:'center', gap:'5px', background: ok===null?'rgba(255,255,255,.05)':ok?'rgba(74,222,128,.06)':'rgba(248,113,113,.06)', border:'1px solid '+(ok===null?'rgba(255,255,255,.08)':ok?'rgba(74,222,128,.15)':'rgba(248,113,113,.15)'), borderRadius:'6px', padding:'6px 12px', fontSize:'12px', fontFamily:'monospace', color:ok===null?'rgba(255,255,255,.4)':ok?'#4ade80':'#f87171', margin:'4px 0', cursor:'default', minHeight:'36px' }),
  terminalBlock: { background:'#0a0a0b', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', padding:'12px 14px', margin:'8px 0', fontFamily:'monospace', fontSize:'12px', color:'rgba(255,255,255,.65)', whiteSpace:'pre-wrap', wordBreak:'break-word', maxHeight:'300px', overflowY:'auto' },
  codeBlock: { background:'#111114', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', margin:'8px 0', overflow:'hidden' },
  codeLang: { padding:'6px 14px', background:'rgba(255,255,255,.03)', fontSize:'11px', color:'rgba(255,255,255,.3)', borderBottom:'1px solid rgba(255,255,255,.05)', fontFamily:'monospace' },
  codePre: { padding:'12px 14px', margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word', fontSize:'12px', lineHeight:'1.6' },
  diffBlock: { background:'#0d1117', border:'1px solid rgba(255,255,255,.07)', borderRadius:'10px', margin:'8px 0', overflow:'hidden' },
  diffHeader: { padding:'6px 14px', background:'rgba(255,255,255,.03)', fontSize:'11px', color:'rgba(255,255,255,.3)', borderBottom:'1px solid rgba(255,255,255,.05)' },
  msgActions: { display:'flex', gap:'4px', marginTop:'6px', flexWrap:'wrap' },
  msgActBtn: { background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.08)', padding:'6px 12px', color:'rgba(255,255,255,.45)', fontSize:'11px', cursor:'pointer', borderRadius:'8px', minHeight:'32px' },
};

export function ThinkingBlock({ text }) {
  const [open, setOpen] = React.useState(false);
  if (!text || !text.trim()) return null;
  return (
    <div style={{margin:'4px 0 6px',borderRadius:'8px',overflow:'hidden',border:'1px solid rgba(167,139,250,.15)',background:'rgba(167,139,250,.04)'}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 10px',cursor:'pointer',userSelect:'none',minHeight:'36px'}}>
        <span style={{fontSize:'11px',color:'rgba(167,139,250,.7)',fontFamily:'monospace'}}>{'> thinking'}</span>
        <div style={{flex:1,height:'1px',background:'rgba(167,139,250,.1)'}} />
        <span style={{fontSize:'10px',color:'rgba(167,139,250,.4)'}}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{padding:'6px 12px 10px',fontSize:'12px',lineHeight:'1.6',color:'rgba(255,255,255,.45)',fontFamily:'monospace',whiteSpace:'pre-wrap',wordBreak:'break-word',borderTop:'1px solid rgba(167,139,250,.08)'}}>
          {text.trim()}
        </div>
      )}
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
          <div key={i} style={{ lineHeight:'1.7', wordBreak:'break-word' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}
              components={{
                table: ({node: _node,...props}) => <div style={{overflowX:'auto',margin:'8px 0'}}><table style={{width:'100%',borderCollapse:'collapse',background:'rgba(255,255,255,.02)',borderRadius:'8px'}} {...props} /></div>,
                th: ({node: _node,...props}) => <th style={{padding:'8px 12px',fontSize:'11px',color:'rgba(255,255,255,.45)',fontWeight:'600',borderBottom:'1px solid rgba(255,255,255,.12)',textAlign:'left',whiteSpace:'nowrap',minWidth:'100px'}} {...props} />,
                td: ({node: _node,...props}) => <td style={{padding:'8px 12px',fontSize:'12px',borderBottom:'1px solid rgba(255,255,255,.04)',verticalAlign:'top',minWidth:'100px'}} {...props} />,
                h1: ({node: _node,...props}) => <div style={{fontSize:'16px',fontWeight:'700',color:'#f0f0f0',margin:'14px 0 6px'}} {...props} />,
                h2: ({node: _node,...props}) => <div style={{fontSize:'15px',fontWeight:'700',color:'#f0f0f0',margin:'12px 0 5px'}} {...props} />,
                h3: ({node: _node,...props}) => <div style={{fontSize:'14px',fontWeight:'700',color:'#e8e8e8',margin:'10px 0 4px'}} {...props} />,
                code: ({node: _node, inline,...props}) => inline ? <code style={{background:'rgba(255,255,255,.1)',padding:'2px 6px',borderRadius:'4px',fontFamily:'monospace',fontSize:'12px',color:'#e8e8e8'}} {...props} /> : <pre style={{background:'#111114',padding:'10px 12px',borderRadius:'8px',overflow:'auto',fontSize:'12px',margin:'6px 0'}} {...props} />,
                hr: ({node: _node,...props}) => <hr style={{border:'none',borderTop:'1px solid rgba(255,255,255,.08)',margin:'10px 0'}} />,
                strong: ({node: _node,...props}) => <strong style={{color:'#f0f0f0'}} {...props} />,
                li: ({node: _node,...props}) => <li style={{margin:'3px 0',color:'#e0e0e0',lineHeight:'1.6'}} {...props} />,
              }}
            >{p.c}</ReactMarkdown>
          </div>
        );
        if (p.t === 'diff') return (
          <div key={i} style={S.diffBlock}>
            <div style={S.diffHeader}>diff</div>
            <div style={{ padding:'10px 14px' }}>
              {p.c.split('\n').map((line, j) => (
                <div key={j} style={{ color: line.startsWith('+') ? '#4ade80' : line.startsWith('-') ? '#f87171' : 'rgba(255,255,255,.4)', fontFamily:'monospace', fontSize:'12px', lineHeight:'1.6' }}>{line}</div>
              ))}
            </div>
          </div>
        );
        return (
          <div key={i} style={S.codeBlock}>
            {p.lang && <div style={S.codeLang}>{p.lang}</div>}
            <pre style={S.codePre} dangerouslySetInnerHTML={{ __html: hl(p.c, p.lang) }} />
          </div>
        );
      })}
    </div>
  );
}

export function ActionChip({ action }) {
  const [expanded, setExpanded] = useState(false);
  const icon = action.type === 'read_file' ? '📄' : action.type === 'write_file' ? '✏️' : action.type === 'list_files' ? '📁' : action.type === 'exec' ? '⚡' : action.type === 'search' ? '🔍' : action.type === 'web_search' ? '🌐' : '🔧';
  const label = action.type === 'exec' ? (action.command || '').slice(0, 40) : (action.path || action.type);
  const ok = action.result ? action.result.ok : null;
  return (
    <div style={{ margin:'4px 0' }}>
      <div style={S.actionChip(ok)} onClick={() => action.result && setExpanded(!expanded)}>
        <span>{icon}</span><span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</span>
        {ok === null && <span style={{ opacity:.5 }}>···</span>}
        {ok === true && <span>✓</span>}
        {ok === false && <span>✗</span>}
        {action.result && <span style={{ opacity:.4 }}>{expanded ? '▲' : '▼'}</span>}
      </div>
      {expanded && action.result && (
        <div style={S.terminalBlock}>{typeof action.result.data === 'string' ? action.result.data : JSON.stringify(action.result.data, null, 2)}</div>
      )}
    </div>
  );
}

export function MsgBubble({ msg, onApprove, onPlanApprove, onRetry, onContinue, isLast, onAutoFix }) {
  const isUser = msg.role === 'user';
  const thinkMatch = msg.content.match(/<think>([\s\S]*?)<\/think>/i);
  const thinkText = thinkMatch ? thinkMatch[1] : null;
  const cleanText = msg.content.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```action[\s\S]*?```/g, '').replace(/PROJECT_NOTE:.*?\n/g, '').trim();
  const actions = msg.actions || [];
  const hasPendingWrite = actions.some(a => a.type === 'patch_file' && !a.executed);
  // write_file sudah auto-execute — hanya show approved/failed status
  const isContinued = msg.content.trim().endsWith('CONTINUE');
  const hasPlan = !msg.planApproved && msg.content.includes('📋 **Plan (');

  function copyMsg() { navigator.clipboard?.writeText(cleanText).catch(() => {}); }

  // ── approve button style (big touch target) ──
  const approveBtn = { background:'rgba(74,222,128,.12)', border:'1px solid rgba(74,222,128,.25)', borderRadius:'8px', padding:'8px 16px', color:'#4ade80', fontSize:'13px', cursor:'pointer', minHeight:'40px', fontWeight:'500' };
  const rejectBtn  = { background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.18)', borderRadius:'8px', padding:'8px 14px', color:'#f87171', fontSize:'13px', cursor:'pointer', minHeight:'40px' };

  return (
    <div style={S.msgRow(isUser)}>
      {isUser ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
          <div style={S.userBubble}>{cleanText}</div>
          <div style={S.msgActions}>
            <button style={S.msgActBtn} onClick={copyMsg}>copy</button>
            {onRetry && <button style={S.msgActBtn} onClick={onRetry}>↺ retry</button>}
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'2px', width:'100%' }}>
          {thinkText && <ThinkingBlock text={thinkText} />}
          <div style={S.aiBubble}><MsgContent text={cleanText} /></div>
          {actions.map((a, i) => <ActionChip key={i} action={a} />)}

          {/* ── Write approvals (patch_file yang gagal saja) ── */}
          {hasPendingWrite && onApprove && (
            <div style={{margin:'8px 0',display:'flex',flexDirection:'column',gap:'6px'}}>
              {actions.filter(a=>a.type==='patch_file'&&!a.executed).map((a,i)=>(
                <div key={i} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'10px',overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px'}}>\
                    <span style={{fontSize:'12px',color:'rgba(255,255,255,.55)',fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>🩹 {a.path}</span>
                  </div>
                  <div style={{display:'flex',gap:'8px',padding:'8px 12px',borderTop:'1px solid rgba(255,255,255,.04)'}}>
                    <button onClick={()=>onApprove(true,a.path)} style={{...approveBtn,flex:1}}>✓ Apply</button>
                    <button onClick={()=>onApprove(false,a.path)} style={rejectBtn}>✗</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── write_file: tampilkan status auto-execute ── */}
          {actions.filter(a=>a.type==='write_file'&&a.executed).map((a,i)=>(
            <div key={'w'+i} style={{display:'inline-flex',alignItems:'center',gap:'5px',background:a.result?.ok?'rgba(74,222,128,.06)':'rgba(248,113,113,.06)',border:'1px solid '+(a.result?.ok?'rgba(74,222,128,.15)':'rgba(248,113,113,.15)'),borderRadius:'6px',padding:'6px 12px',fontSize:'12px',fontFamily:'monospace',color:a.result?.ok?'#4ade80':'#f87171',margin:'4px 0'}}>
              {a.result?.ok?'✓':'✗'} {a.path?.split('/').pop()}
            </div>
          ))}

          {/* ── Plan approval ── */}
          {hasPlan && onPlanApprove && (
            <div style={{ display:'flex', gap:'8px', margin:'8px 0' }}>
              <button onClick={() => onPlanApprove(true)} style={{...approveBtn,flex:1}}>✓ Approve Plan</button>
              <button onClick={() => onPlanApprove(false)} style={rejectBtn}>✗ Ubah</button>
            </div>
          )}

          {/* ── Auto-fix ── */}
          {isLast && onAutoFix && msg.role==='assistant' && (msg.content.includes('❌')||msg.content.includes('Error:')) && (
            <button onClick={onAutoFix} style={{...rejectBtn,alignSelf:'flex-start',marginTop:'4px'}}>🔧 Auto-fix</button>
          )}

          {/* ── Continue ── */}
          {isContinued && onContinue && (
            <button onClick={onContinue} style={{ background:'rgba(124,58,237,.1)', border:'1px solid rgba(124,58,237,.2)', borderRadius:'8px', padding:'8px 16px', color:'#a78bfa', fontSize:'13px', cursor:'pointer', alignSelf:'flex-start', marginTop:'4px', minHeight:'40px' }}>↓ Lanjutkan</button>
          )}

          {/* ── Message actions — always visible on mobile ── */}
          <div style={S.msgActions}>
            <button style={S.msgActBtn} onClick={copyMsg}>copy</button>
            {isLast && onRetry && <button style={S.msgActBtn} onClick={onRetry}>↺ retry</button>}
          </div>
        </div>
      )}
    </div>
  );
}
