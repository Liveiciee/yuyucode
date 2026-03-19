import { Wrench, ChevronRight, ChevronsRight } from 'lucide-react';
import React, { useState, useRef, useEffect } from "react";
import { callServer } from '../api.js';
import { execStream } from '../api.js';
import { WS_SERVER } from '../constants.js';

export function Terminal({ folder, cmdHistory, addHistory, onSendToAI }) {
  const [cmd, setCmd]             = useState('');
  const [suggestions, setSuggs]   = useState([]);
  const [selIdx, setSelIdx]        = useState(0);
  const [outputs, setOutputs]      = useState([]);
  const [streaming, setStreaming]  = useState(null); // { id, text }
  const [histIdx, setHistIdx]      = useState(-1);
  const bottomRef = useRef(null);
  const abortRef  = useRef(null);
  const presets   = ['npm run lint', 'npm run build', 'git status', 'git log --oneline -5', 'ls -la', 'git diff'];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [outputs, streaming]);

  function detectError(text) {
    const t = text.toLowerCase();
    const hasErr = t.includes('error') || t.includes('failed') || t.includes('no such file') ||
      t.includes('cannot find') || t.includes('exception') || t.includes('not found') || t.includes('exit code 1');
    const isFP = t.includes('0 errors') || t.includes('no error') || t.includes('syntax ok');
    return hasErr && !isFP;
  }

  function onTextChange(v) {
    setCmd(v); setHistIdx(-1);
    const all = [...new Set([...presets, ...(cmdHistory || [])])];
    setSuggs(v ? all.filter(x => x.startsWith(v) && x !== v).slice(0, 5) : []);
    setSelIdx(0);
  }

  function handleKeyDown(e) {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') { setSelIdx(s => (s + 1) % suggestions.length); e.preventDefault(); return; }
      if (e.key === 'ArrowUp')   { setSelIdx(s => (s - 1 + suggestions.length) % suggestions.length); e.preventDefault(); return; }
      if (e.key === 'Tab')       { setCmd(suggestions[selIdx]); setSuggs([]); e.preventDefault(); return; }
    }
    if (e.key === 'ArrowUp' && !cmd && cmdHistory?.length) {
      const i = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(i); setCmd(cmdHistory[i] || ''); e.preventDefault(); return;
    }
    if (e.key === 'ArrowDown' && histIdx > -1) {
      const i = histIdx - 1; setHistIdx(i); setCmd(i >= 0 ? cmdHistory[i] : ''); e.preventDefault(); return;
    }
    if (e.key === 'Enter' && cmd.trim()) run();
    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) cancel();
  }

  function cancel() {
    abortRef.current?.abort();
    setStreaming(null);
  }

  async function run() {
    const c = cmd.trim();
    if (!c) return;
    setSuggs([]); setCmd(''); setHistIdx(-1);
    if (addHistory) addHistory(c);

    const runId = Date.now();
    setStreaming({ id: runId, text: '' });

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      let fullOutput = '';
      await execStream(c, folder, (chunk) => {
        fullOutput += chunk;
        setStreaming({ id: runId, text: fullOutput });
      }, ctrl.signal);

      const hasError = detectError(fullOutput);
      setOutputs(prev => [...prev.slice(-80), { id: runId, cmd: c, output: fullOutput, hasError }]);
    } catch (e) {
      if (e.name === 'AbortError') {
        setOutputs(prev => [...prev.slice(-80), { id: runId, cmd: c, output: '(dibatalkan)', hasError: false }]);
      } else {
        // fallback to HTTP exec if WebSocket fails
        try {
          const res = await callServer({ type: 'exec', path: folder, command: c });
          const output = res.data || '(selesai)';
          const hasError = !res.ok || detectError(output);
          setOutputs(prev => [...prev.slice(-80), { id: runId, cmd: c, output, hasError }]);
        } catch (e2) {
          setOutputs(prev => [...prev.slice(-80), { id: runId, cmd: c, output: e2.message, hasError: true }]);
        }
      }
    }
    setStreaming(null);
    abortRef.current = null;
  }

  const isRunning = !!streaming;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0a0a0c', fontSize:'13px', fontFamily:'monospace' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', padding:'6px 10px', borderBottom:'1px solid rgba(255,255,255,.06)', flexShrink:0 }}>
        <span style={{ fontSize:'11px', color:'rgba(255,255,255,.3)', flex:1 }}>
          {folder?.split('/').pop() || 'terminal'}
        </span>
        {isRunning && (
          <button onClick={cancel}
            style={{ background:'rgba(248,113,113,.1)', border:'1px solid rgba(248,113,113,.2)', borderRadius:'6px', padding:'3px 10px', color:'#f87171', fontSize:'11px', cursor:'pointer', marginRight:'6px' }}>
            ■ stop
          </button>
        )}
        {outputs.length > 0 && !isRunning && (
          <button onClick={() => setOutputs([])}
            style={{ background:'none', border:'none', color:'rgba(255,255,255,.2)', fontSize:'11px', cursor:'pointer' }}>
            clear
          </button>
        )}
      </div>

      {/* Output area */}
      <div style={{ flex:1, overflowY:'auto', padding:'10px 12px' }}>
        {outputs.length === 0 && !streaming && (
          <div style={{ color:'rgba(255,255,255,.2)', fontSize:'12px' }}>Ready.</div>
        )}

        {outputs.map((entry) => (
          <div key={entry.id} style={{ marginBottom:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
              <span style={{ color:'#4ade80' }}>$</span>
              <span style={{ color:'rgba(255,255,255,.8)' }}>{entry.cmd}</span>
            </div>
            <div style={{
              color: entry.hasError ? '#fca5a5' : 'rgba(255,255,255,.65)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6',
              paddingLeft: '14px',
              borderLeft: entry.hasError ? '2px solid rgba(248,113,113,.35)' : '2px solid rgba(255,255,255,.07)',
            }}>
              {entry.output || '(selesai)'}
            </div>
            {entry.hasError && onSendToAI && (
              <button onClick={() => onSendToAI('Error di terminal:\n```bash\n$ ' + entry.cmd + '\n' + entry.output.slice(0, 600) + '\n```\nDiagnosa dan fix.')}
                style={{ marginTop:'6px', marginLeft:'14px', background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.2)', borderRadius:'6px', padding:'5px 12px', color:'#f87171', fontSize:'11px', cursor:'pointer', minHeight:'32px' }}>
                <Wrench size={12}/> Fix dengan AI
              </button>
            )}
          </div>
        ))}

        {/* Live streaming output */}
        {streaming && (
          <div style={{ marginBottom:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
              <span style={{ color:'#4ade80', animation:'pulse 1s ease-in-out infinite' }}>$</span>
              <span style={{ color:'rgba(255,255,255,.8)' }}>{cmd || '···'}</span>
              <span style={{ color:'rgba(255,255,255,.25)', fontSize:'10px' }}>running···</span>
            </div>
            <div style={{
              color: 'rgba(255,255,255,.6)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              lineHeight: '1.6', paddingLeft: '14px',
              borderLeft: '2px solid rgba(124,58,237,.4)',
            }}>
              {streaming.text || ' '}
              <span style={{ display:'inline-block', width:'7px', height:'13px', background:'rgba(124,58,237,.7)', marginLeft:'2px', verticalAlign:'middle', animation:'blink 1s infinite' }}/>
            </div>
          </div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Input area */}
      <div style={{ position:'relative', padding:'8px 10px', borderTop:'1px solid rgba(255,255,255,.07)', background:'rgba(255,255,255,.02)', flexShrink:0 }}>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ position:'absolute', bottom:'100%', left:0, right:0, background:'#1a1a1f', border:'1px solid rgba(255,255,255,.1)', borderRadius:'10px 10px 0 0', boxShadow:'0 -8px 24px rgba(0,0,0,.5)', overflow:'hidden', marginBottom:'2px' }}>
            {suggestions.map((s, i) => (
              <div key={i} onClick={() => { setCmd(s); setSuggs([]); }}
                style={{ padding:'10px 14px', fontSize:'12px', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,.05)', background: i === selIdx ? 'rgba(124,58,237,.2)' : 'transparent', color: i === selIdx ? '#c4b5fd' : 'rgba(255,255,255,.5)' }}>
                <span style={{ opacity:.4, marginRight:'8px', display:'flex', alignItems:'center' }}><ChevronRight size={11}/></span>{s}
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ color: isRunning ? '#a78bfa' : '#4ade80', fontSize:'14px', flexShrink:0 }}>
            {isRunning ? '●' : '➜'}
          </span>
          <input
            style={{ background:'transparent', border:'none', outline:'none', flex:1, color:'rgba(255,255,255,.85)', fontSize:'13px', fontFamily:'monospace' }}
            value={cmd}
            onChange={e => onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRunning ? 'Ctrl+C untuk stop···' : 'Ketik command···'}
            disabled={isRunning}
            autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}
          />
          {cmd.trim() && !isRunning && (
            <button onClick={run}
              style={{ background:'rgba(74,222,128,.1)', border:'1px solid rgba(74,222,128,.2)', borderRadius:'8px', padding:'5px 14px', color:'#4ade80', fontSize:'12px', cursor:'pointer', minHeight:'34px', flexShrink:0 }}>
              ▶
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
