import { Wrench, ChevronRight, Terminal as TerminalIcon, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from "react";
import { callServer, execStream } from '../api.js';

export function Terminal({ folder, cmdHistory, addHistory, onSendToAI, T }) {
  const [cmd, setCmd]             = useState('');
  const [suggestions, setSuggs]   = useState([]);
  const [selIdx, setSelIdx]       = useState(0);
  const [outputs, setOutputs]     = useState([]);
  const [streaming, setStreaming] = useState(null);
  const [histIdx, setHistIdx]     = useState(-1);
  const bottomRef = useRef(null);
  const abortRef  = useRef(null);
  const inputRef  = useRef(null);
  const presets   = ['npm run lint','npm run build','git status','git log --oneline -5','ls -la','git diff'];

  // ── Theme tokens ──
  const bg       = T?.bg    || '#0a0a0d';
  const bg2      = T?.bg2   || '#111116';
  const bg3      = T?.bg3   || 'rgba(255,255,255,.03)';
  const border   = T?.border|| 'rgba(255,255,255,.07)';
  const text     = T?.text  || 'rgba(255,255,255,.85)';
  const textSec  = T?.textSec || 'rgba(255,255,255,.6)';
  const textMute = T?.textMute|| 'rgba(255,255,255,.3)';
  const accent   = T?.accent || '#a78bfa';
  const accentBg = T?.accentBg || 'rgba(124,58,237,.15)';
  const success  = T?.success || '#4ade80';
  const error    = T?.error  || '#f87171';
  const errorBg  = T?.errorBg|| 'rgba(248,113,113,.08)';
  const warning  = T?.warning|| '#fbbf24';
  const pulse    = T?.pulse  || 'rgba(124,58,237,.6)';

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [outputs, streaming]);

  function detectError(text) {
    const t = text.toLowerCase();
    const hasErr = t.includes('error')||t.includes('failed')||t.includes('no such file')||t.includes('cannot find')||t.includes('exception')||t.includes('not found')||t.includes('exit code 1');
    const isFP = t.includes('0 errors')||t.includes('no error')||t.includes('syntax ok');
    return hasErr && !isFP;
  }

  function onTextChange(v) {
    setCmd(v); setHistIdx(-1);
    const all = [...new Set([...presets,...(cmdHistory||[])])];
    setSuggs(v ? all.filter(x=>x.startsWith(v)&&x!==v).slice(0,6) : []);
    setSelIdx(0);
  }

  function handleKeyDown(e) {
    if (suggestions.length > 0) {
      if (e.key==='ArrowDown'){setSelIdx(s=>(s+1)%suggestions.length);e.preventDefault();return;}
      if (e.key==='ArrowUp')  {setSelIdx(s=>(s-1+suggestions.length)%suggestions.length);e.preventDefault();return;}
      if (e.key==='Tab')      {setCmd(suggestions[selIdx]);setSuggs([]);e.preventDefault();return;}
    }
    if (e.key==='ArrowUp'&&!cmd&&cmdHistory?.length){const i=Math.min(histIdx+1,cmdHistory.length-1);setHistIdx(i);setCmd(cmdHistory[i]||'');e.preventDefault();return;}
    if (e.key==='ArrowDown'&&histIdx>-1){const i=histIdx-1;setHistIdx(i);setCmd(i>=0?cmdHistory[i]:'');e.preventDefault();return;}
    if (e.key==='Enter'&&cmd.trim()) run();
    if (e.key==='c'&&(e.ctrlKey||e.metaKey)) cancel();
  }

  function cancel() { abortRef.current?.abort(); setStreaming(null); }

  async function run() {
    const c = cmd.trim();
    if (!c) return;
    setSuggs([]); setCmd(''); setHistIdx(-1);
    if (addHistory) addHistory(c);
    const runId = Date.now();
    setStreaming({ id:runId, text:'', cmd:c });
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      let fullOutput = '';
      await execStream(c, folder, (chunk)=>{ fullOutput+=chunk; setStreaming({id:runId,text:fullOutput,cmd:c}); }, ctrl.signal);
      setOutputs(prev=>[...prev.slice(-80),{id:runId,cmd:c,output:fullOutput,hasError:detectError(fullOutput)}]);
    } catch(e) {
      if (e.name==='AbortError') {
        setOutputs(prev=>[...prev.slice(-80),{id:runId,cmd:c,output:'(dibatalkan)',hasError:false}]);
      } else {
        try {
          const res = await callServer({type:'exec',path:folder,command:c});
          const output = res.data||'(selesai)';
          setOutputs(prev=>[...prev.slice(-80),{id:runId,cmd:c,output,hasError:!res.ok||detectError(output)}]);
        } catch(e2) {
          setOutputs(prev=>[...prev.slice(-80),{id:runId,cmd:c,output:e2.message,hasError:true}]);
        }
      }
    }
    setStreaming(null);
    abortRef.current = null;
  }

  const fxGlow   = T?.fx?.glowBorder?.(accent, .7) || {};
  const fxInput  = T?.fx?.inputFocus?.() || {};
  const isRunning = !!streaming;
  const cwd = folder?.split('/').pop() || '~';

  function colorLine(line) {
    if (!line) return { color: textSec };
    const l = line.toLowerCase();
    if (l.startsWith('error')||l.includes(': error')||l.startsWith('✗')||l.startsWith('fail'))
      return { color: error, bg: errorBg };
    if (l.startsWith('warn')||l.includes('warning'))
      return { color: warning, bg: T?.warningBg||'rgba(251,191,36,.04)' };
    if (l.startsWith('+')&&!l.startsWith('+++'))
      return { color: success, bg: T?.successBg||'rgba(74,222,128,.04)' };
    if (l.startsWith('-')&&!l.startsWith('---'))
      return { color: error, bg: errorBg };
    if (l.startsWith('✓')||l.startsWith('✔')||l.includes('passed')||l.includes('success'))
      return { color: success };
    if (l.startsWith('#')||l.startsWith('//'))
      return { color: textMute };
    return { color: text };
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:bg,fontSize:'13px',fontFamily:'"JetBrains Mono","Fira Code",monospace',position:'relative',overflow:'hidden'}}>

      {/* macOS-style header */}
      <div style={{display:'flex',alignItems:'center',padding:'8px 12px',background:bg2,borderBottom:'1px solid '+border,flexShrink:0,gap:'8px'}}>
        {/* Traffic lights pakai theme colors */}
        <div style={{display:'flex',gap:'6px',flexShrink:0}}>
          <div style={{width:'11px',height:'11px',borderRadius:'50%',background:'#ff5f57',border:'1px solid rgba(0,0,0,.15)'}}/>
          <div style={{width:'11px',height:'11px',borderRadius:'50%',background:'#febc2e',border:'1px solid rgba(0,0,0,.15)'}}/>
          <div style={{width:'11px',height:'11px',borderRadius:'50%',background:'#28c840',border:'1px solid rgba(0,0,0,.15)'}}/>
        </div>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
          <TerminalIcon size={11} style={{color:textMute}}/>
          <span style={{fontSize:'11px',color:textMute,letterSpacing:'.02em'}}>{cwd}</span>
        </div>
        <div style={{display:'flex',gap:'6px',flexShrink:0}}>
          {isRunning&&(
            <button onClick={cancel} style={{background:errorBg,border:'1px solid '+error+'44',borderRadius:'6px',padding:'2px 10px',color:error,fontSize:'11px',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px'}}>
              <X size={10}/> stop
            </button>
          )}
          {outputs.length>0&&!isRunning&&(
            <button onClick={()=>setOutputs([])} style={{background:'none',border:'none',color:textMute,fontSize:'10px',cursor:'pointer',padding:'2px 8px',borderRadius:'5px'}}>
              clear
            </button>
          )}
        </div>
      </div>

      {/* Output */}
      <div style={{flex:1,overflowY:'auto',padding:'12px 0 4px'}}>
        {outputs.length===0&&!streaming&&(
          <div style={{padding:'0 16px',color:textMute,fontSize:'12px',display:'flex',alignItems:'center',gap:'6px'}}>
            <span style={{color:success}}>●</span> Ready.
          </div>
        )}
        {outputs.map(entry=>(
          <div key={entry.id} style={{marginBottom:'16px',padding:'0 16px'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'6px',flexWrap:'wrap'}}>
              <span style={{color:accent,fontSize:'12px',marginRight:'4px',opacity:.7}}>{cwd}</span>
              <span style={{color:entry.hasError?error:success,marginRight:'6px',fontSize:'12px',opacity:.8}}>❯</span>
              <span style={{color:text}}>{entry.cmd}</span>
            </div>
            <div style={{borderLeft:'2px solid '+(entry.hasError?error+'55':border),paddingLeft:'12px',marginLeft:'2px'}}>
              {entry.output?.split('\n').map((line,j)=>{
                const s=colorLine(line);
                return <div key={j} style={{color:s.color,background:s.bg||'transparent',whiteSpace:'pre-wrap',wordBreak:'break-word',lineHeight:'1.65',padding:s.bg?'0 4px':'0',borderRadius:'2px',minHeight:line?'auto':'8px'}}>{line||'\u00A0'}</div>;
              })}
            </div>
            {entry.hasError&&onSendToAI&&(
              <button onClick={()=>onSendToAI('Error di terminal:\n```bash\n$ '+entry.cmd+'\n'+entry.output.slice(0,600)+'\n```\nDiagnosa dan fix.')}
                style={{marginTop:'8px',marginLeft:'14px',background:errorBg,border:'1px solid '+error+'44',borderRadius:'7px',padding:'6px 14px',color:error,fontSize:'11.5px',cursor:'pointer',minHeight:'32px',display:'flex',alignItems:'center',gap:'5px'}}>
                <Wrench size={12}/> Fix dengan AI
              </button>
            )}
          </div>
        ))}
        {streaming&&(
          <div style={{marginBottom:'12px',padding:'0 16px'}}>
            <div style={{display:'flex',alignItems:'center',marginBottom:'6px',flexWrap:'wrap'}}>
              <span style={{color:accent,fontSize:'12px',marginRight:'4px',opacity:.7}}>{cwd}</span>
              <span style={{color:warning,marginRight:'6px',fontSize:'12px',opacity:.8}}>❯</span>
              <span style={{color:text}}>{streaming.cmd}</span>
              <span style={{marginLeft:'8px',display:'flex',gap:'3px',alignItems:'center'}}>
                {[0,1,2].map(j=>(
                  <span key={j} style={{width:'4px',height:'4px',borderRadius:'50%',background:pulse,display:'inline-block',animation:`dotPulse 1.2s ease-in-out ${j*.2}s infinite`}}/>
                ))}
              </span>
            </div>
            <div style={{borderLeft:'2px solid '+accentBg,paddingLeft:'12px',marginLeft:'2px'}}>
              {(streaming.text||' ').split('\n').map((line,j)=>{
                const s=colorLine(line);
                return <div key={j} style={{color:s.color,whiteSpace:'pre-wrap',wordBreak:'break-word',lineHeight:'1.65',minHeight:line?'auto':'8px'}}>{line||'\u00A0'}</div>;
              })}
              <span style={{display:'inline-block',width:'7px',height:'14px',background:pulse,marginLeft:'1px',verticalAlign:'middle',animation:'blink 1s step-start infinite'}}/>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{position:'relative',borderTop:'1px solid '+border,background:bg2,flexShrink:0}}>
        {suggestions.length>0&&(
          <div style={{position:'absolute',bottom:'100%',left:0,right:0,background:bg2,border:'1px solid '+border,borderRadius:'12px 12px 0 0',boxShadow:'0 -10px 30px rgba(0,0,0,.5)',overflow:'hidden'}}>
            {suggestions.map((s,i)=>(
              <div key={i} onClick={()=>{setCmd(s);setSuggs([]);inputRef.current?.focus();}}
                style={{padding:'9px 16px',fontSize:'12.5px',cursor:'pointer',borderBottom:'1px solid '+border,background:i===selIdx?accentBg:'transparent',color:i===selIdx?accent:textSec,display:'flex',alignItems:'center',gap:'8px',transition:'background .1s',...(i===selIdx?fxGlow:{})}}>
                <ChevronRight size={11} style={{opacity:.4,flexShrink:0}}/><span>{s}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 14px'}}>
          <span style={{color:accent,fontSize:'12px',flexShrink:0,opacity:.7}}>{cwd}</span>
          <span style={{color:isRunning?warning:success,fontSize:'13px',flexShrink:0,opacity:.85}}>❯</span>
          <input ref={inputRef}
            style={{background:'transparent',border:'none',outline:'none',flex:1,color:text,fontSize:'13px',fontFamily:'inherit',caretColor:accent}}
            value={cmd}
            onChange={e=>onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRunning?'Ctrl+C untuk stop…':''}
            disabled={isRunning}
            autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}
          />
          {cmd.trim()&&!isRunning&&(
            <button onClick={run} style={{background:T?.successBg||'rgba(74,222,128,.1)',border:'1px solid '+success+'44',borderRadius:'7px',padding:'5px 12px',color:success,fontSize:'12px',cursor:'pointer',minHeight:'32px',flexShrink:0}}>
              ↵
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dotPulse{0%,80%,100%{opacity:.2}40%{opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      `}</style>
    </div>
  );
}
