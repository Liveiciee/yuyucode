// ── Terminal — xterm.js dengan layout yang benar ─────────────────────────────
import { Wrench, ChevronRight, Terminal as TerminalIcon, X } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { callServer, execStream } from '../api.js';

// xterm CSS diinject manual supaya tidak corrupt global styles
const XTERM_CSS = `
.xterm { height: 100%; }
.xterm-viewport { overflow-y: auto !important; }
.xterm-screen canvas { display: block; }
.xterm .xterm-accessibility, .xterm .xterm-message { position: absolute; left: 0; top: 0; bottom: 0; right: 0; z-index: 10; color: transparent; }
.xterm-char-measure-element { position: absolute; visibility: hidden; }
`;

// ── TrafficDot — isolated component so onClick never accesses ref during render
function TrafficDot({ color, hint, active, cmd, onClick }) {
  return (
    <div onClick={onClick}
      style={{position:'relative',display:'flex',alignItems:'center',
        cursor:'pointer',gap:'3px'}}>
      <div style={{width:'11px',height:'11px',borderRadius:'50%',
        background:color,border:'1px solid rgba(0,0,0,.15)',
        opacity:active?1:.35,flexShrink:0,transition:'opacity .2s'}}/>
      <span style={{fontSize:'9px',color:color,fontFamily:'monospace',
        opacity:cmd?0:active?0.55:0.2,
        transition:'opacity .3s ease',userSelect:'none',letterSpacing:'.02em'}}>
        {hint}
      </span>
    </div>
  );
}

export function Terminal({ folder, cmdHistory, addHistory, onSendToAI, T }) {
  const [cmd,         setCmd]       = useState('');
  const [suggestions, setSuggs]     = useState([]);
  const [selIdx,      setSelIdx]    = useState(0);
  const [lastEntry,   setLastEntry] = useState(null);
  const [isRunning,   setIsRunning] = useState(false);
  const [histIdx,     setHistIdx]   = useState(-1);

  const wrapRef   = useRef(null);  // outer wrapper div (flex:1)
  const xtermRef  = useRef(null);  // xterm mount target
  const termRef   = useRef(null);
  const fitRef    = useRef(null);
  const abortRef  = useRef(null);
  const inputRef  = useRef(null);

  const presets = ['npm run lint','npm run build','git status','git log --oneline -5','ls -la','git diff'];

  // ── Theme ─────────────────────────────────────────────────────────────────
  const bg       = T?.bg      || '#0a0a0d';
  const bg2      = T?.bg2     || '#111116';
  const border   = T?.border  || 'rgba(255,255,255,.07)';
  const textSec  = T?.textSec || 'rgba(255,255,255,.6)';
  const textMute = T?.textMute|| 'rgba(255,255,255,.3)';
  const accent   = T?.accent  || '#a78bfa';
  const accentBg = T?.accentBg|| 'rgba(124,58,237,.15)';
  const success  = T?.success || '#4ade80';
  const error    = T?.error   || '#f87171';
  const errorBg  = T?.errorBg || 'rgba(248,113,113,.08)';
  const warning  = T?.warning || '#fbbf24';
  const pulse    = T?.pulse   || 'rgba(124,58,237,.6)';
  const cwd      = folder?.split('/').pop() || '~';
  const fxGlow   = T?.fx?.glowBorder?.(accent, .7) || {};

  // ── Mount xterm ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!xtermRef.current) return;

    const term = new XTerm({
      theme: {
        background:     bg,
        foreground:     'rgba(255,255,255,.85)',
        cursor:         accent,
        cursorAccent:   bg,
        selectionBackground: accentBg,
        black:'#0d0d0e', red:'#f87171',  green:'#4ade80', yellow:'#fbbf24',
        blue:'#60a5fa',  magenta:'#a78bfa', cyan:'#22d3ee', white:'#f0f0f0',
        brightBlack:'rgba(255,255,255,.3)', brightRed:'#fca5a5',
        brightGreen:'#86efac',  brightYellow:'#fde68a',
        brightBlue:'#93c5fd',   brightMagenta:'#c4b5fd',
        brightCyan:'#67e8f9',   brightWhite:'#ffffff',
      },
      fontFamily: '"JetBrains Mono","Fira Code","Cascadia Code",monospace',
      fontSize:   12.5,
      lineHeight: 1.55,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback:  2000,
      convertEol:  true,
      allowTransparency: false,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(xtermRef.current);

    // Fit after paint
    requestAnimationFrame(() => {
      try { fit.fit(); } catch(_e) {}
    });

    termRef.current = term;
    fitRef.current  = fit;

    term.writeln('\x1b[38;5;141m● YuyuCode Terminal\x1b[0m');
    term.writeln('\x1b[38;5;240m' + folder + '\x1b[0m');
    term.writeln('');

    // ResizeObserver untuk fit otomatis
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        try { fit.fit(); } catch(_e) {}
      });
    });
    if (wrapRef.current) ro.observe(wrapRef.current);

    return () => {
      ro.disconnect();
      term.dispose();
      termRef.current = null;
      fitRef.current  = null;
    };
  });

  // ── Update theme realtime ──────────────────────────────────────────────────
  useEffect(() => {
    if (!termRef.current) return;
    termRef.current.options.theme = {
      background: bg, foreground: 'rgba(255,255,255,.85)', cursor: accent,
      selectionBackground: accentBg,
    };
  }, [bg, accent, accentBg]);

  function detectError(text) {
    const t = text.toLowerCase();
    return (t.includes('error')||t.includes('failed')||t.includes('no such file')||
            t.includes('exception')||t.includes('not found')||t.includes('exit code 1'))
           && !(t.includes('0 errors')||t.includes('no error')||t.includes('syntax ok'));
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
    if (e.key==='ArrowUp'&&!cmd&&cmdHistory?.length){
      const i=Math.min(histIdx+1,cmdHistory.length-1);setHistIdx(i);setCmd(cmdHistory[i]||'');e.preventDefault();return;
    }
    if (e.key==='ArrowDown'&&histIdx>-1){
      const i=histIdx-1;setHistIdx(i);setCmd(i>=0?cmdHistory[i]:'');e.preventDefault();return;
    }
    if (e.key==='Enter'&&cmd.trim()) run();
    if (e.key==='c'&&(e.ctrlKey||e.metaKey)) cancel();
  }

  function cancel() { abortRef.current?.abort(); setIsRunning(false); }

  const writeln = useCallback((t='') => termRef.current?.writeln(t), []);
  const write   = useCallback((t='') => termRef.current?.write(t.replace(/\n/g,'\r\n')), []);

  async function run() {
    const c = cmd.trim();
    if (!c) return;
    setSuggs([]); setCmd(''); setHistIdx(-1); setIsRunning(true);
    if (addHistory) addHistory(c);
    const runId = Date.now();

    writeln('');
    termRef.current?.write('\x1b[38;5;141m'+cwd+'\x1b[0m \x1b[38;5;82m❯\x1b[0m \x1b[1m'+c+'\x1b[0m\r\n');

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let fullOutput = '';

    try {
      await execStream(c, folder, (chunk) => {
        fullOutput += chunk;
        write(chunk);
      }, ctrl.signal);
      const hasError = detectError(fullOutput);
      if (hasError) writeln('\x1b[38;5;203m[exit 1]\x1b[0m');
      setLastEntry({ id:runId, cmd:c, output:fullOutput, hasError });
    } catch(e) {
      if (e.name==='AbortError') {
        writeln('\x1b[38;5;240m(dibatalkan)\x1b[0m');
        setLastEntry({ id:runId, cmd:c, output:'(dibatalkan)', hasError:false });
      } else {
        try {
          const res = await callServer({ type:'exec', path:folder, command:c });
          const out = res.data || '(selesai)';
          write(out);
          const hasError = !res.ok || detectError(out);
          if (hasError) writeln('\x1b[38;5;203m[exit 1]\x1b[0m');
          setLastEntry({ id:runId, cmd:c, output:out, hasError });
        } catch(e2) {
          writeln('\x1b[38;5;203m'+e2.message+'\x1b[0m');
          setLastEntry({ id:runId, cmd:c, output:e2.message, hasError:true });
        }
      }
    }
    setIsRunning(false);
    abortRef.current = null;
    inputRef.current?.focus();
  }

  const doSendToAI = useCallback(() => {
    if (!lastEntry?.output || !onSendToAI) return;
    onSendToAI('Output terminal:\n```\n' + lastEntry.output.slice(0, 600) + '\n```');
  }, [lastEntry, onSendToAI]);


  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:bg,overflow:'hidden'}}>

      {/* Inject xterm CSS tanpa pollute global */}
      <style>{XTERM_CSS}</style>

      {/* macOS header */}
      <div style={{display:'flex',alignItems:'center',padding:'8px 12px',background:bg2,
        borderBottom:'1px solid '+border,flexShrink:0,gap:'8px'}}>
        {/* Traffic lights — fungsional: merah=stop, kuning=clear, hijau=send to AI */}
        <div style={{display:'flex',gap:'6px',flexShrink:0,alignItems:'center'}}>
          <TrafficDot color="#ff5f57" hint="stop"
            active={isRunning} cmd={cmd}
            onClick={cancel}/>
          <TrafficDot color="#febc2e" hint="clear"
            active={!!lastEntry&&!isRunning} cmd={cmd}
            onClick={()=>{termRef.current?.clear();setLastEntry(null);}}/>
          <TrafficDot color="#28c840" hint="→ AI"
            active={!!lastEntry?.output&&!isRunning} cmd={cmd}
            onClick={doSendToAI}/>
        </div>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
          <TerminalIcon size={11} style={{color:textMute}}/>
          <span style={{fontSize:'11px',color:textMute,letterSpacing:'.02em'}}>{cwd}</span>
          {isRunning&&(
            <span style={{display:'flex',gap:'3px',alignItems:'center',marginLeft:'4px'}}>
              {[0,1,2].map(j=>(
                <span key={j} style={{width:'4px',height:'4px',borderRadius:'50%',background:pulse,
                  display:'inline-block',animation:`dotPulse 1.2s ease-in-out ${j*.2}s infinite`}}/>
              ))}
            </span>
          )}
        </div>
        <div style={{display:'flex',gap:'6px',flexShrink:0}}>
          {isRunning&&(
            <button onClick={cancel}
              style={{background:errorBg,border:'1px solid '+error+'44',borderRadius:'6px',
                padding:'2px 10px',color:error,fontSize:'11px',cursor:'pointer',
                display:'flex',alignItems:'center',gap:'4px'}}>
              <X size={10}/> stop
            </button>
          )}
          {lastEntry&&!isRunning&&(
            <button onClick={()=>{termRef.current?.clear();setLastEntry(null);}}
              style={{background:'none',border:'none',color:textMute,fontSize:'10px',
                cursor:'pointer',padding:'2px 8px',borderRadius:'5px'}}>
              clear
            </button>
          )}
        </div>
      </div>

      {/* xterm container — flex:1 dengan overflow hidden */}
      <div ref={wrapRef} style={{flex:1,overflow:'hidden',position:'relative',minHeight:0}}>
        <div ref={xtermRef} style={{width:'100%',height:'100%'}}/>
      </div>

      {/* AI fix button */}
      {lastEntry?.hasError&&!isRunning&&onSendToAI&&(
        <div style={{padding:'6px 14px',borderTop:'1px solid '+border,background:bg2,flexShrink:0}}>
          <button
            onClick={()=>onSendToAI('Error di terminal:\n```bash\n$ '+lastEntry.cmd+'\n'+lastEntry.output.slice(0,600)+'\n```\nDiagnosa dan fix.')}
            style={{background:errorBg,border:'1px solid '+error+'44',borderRadius:'7px',
              padding:'6px 14px',color:error,fontSize:'11.5px',cursor:'pointer',
              minHeight:'32px',display:'flex',alignItems:'center',gap:'5px'}}>
            <Wrench size={12}/> Fix dengan AI
          </button>
        </div>
      )}

      {/* Input bar */}
      <div style={{position:'relative',borderTop:'1px solid '+border,background:bg2,flexShrink:0}}>
        {suggestions.length>0&&(
          <div style={{position:'absolute',bottom:'100%',left:0,right:0,background:bg2,
            border:'1px solid '+border,borderRadius:'12px 12px 0 0',
            boxShadow:'0 -10px 30px rgba(0,0,0,.5)',overflow:'hidden'}}>
            {suggestions.map((s,i)=>(
              <div key={i} onClick={()=>{setCmd(s);setSuggs([]);inputRef.current?.focus();}}
                style={{padding:'9px 16px',fontSize:'12.5px',cursor:'pointer',
                  borderBottom:'1px solid '+border,
                  background:i===selIdx?accentBg:'transparent',
                  color:i===selIdx?accent:textSec,
                  display:'flex',alignItems:'center',gap:'8px',
                  transition:'background .1s',...(i===selIdx?fxGlow:{})}}>
                <ChevronRight size={11} style={{opacity:.4,flexShrink:0}}/><span>{s}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 14px'}}>
          <span style={{color:accent,fontSize:'12px',flexShrink:0,opacity:.7}}>{cwd}</span>
          <span style={{color:isRunning?warning:success,fontSize:'13px',flexShrink:0,opacity:.85}}>❯</span>
          <input ref={inputRef}
            style={{background:'transparent',border:'none',outline:'none',flex:1,
              color:'rgba(255,255,255,.85)',fontSize:'13px',
              fontFamily:'"JetBrains Mono","Fira Code",monospace',caretColor:accent}}
            value={cmd}
            onChange={e=>onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRunning?'Ctrl+C untuk stop…':''}
            disabled={isRunning}
            autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}
          />
          {cmd.trim()&&!isRunning&&(
            <button onClick={run}
              style={{background:T?.successBg||'rgba(74,222,128,.1)',
                border:'1px solid '+success+'44',borderRadius:'7px',
                padding:'5px 12px',color:success,fontSize:'12px',
                cursor:'pointer',minHeight:'32px',flexShrink:0}}>
              ↵
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes dotPulse{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
    </div>
  );
}
