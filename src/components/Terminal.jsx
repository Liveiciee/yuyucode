import React, { useState, useRef, useEffect } from "react";
import { callServer } from '../api.js';

export function Terminal({ folder, cmdHistory, addHistory, onSendToAI }) {
  const [cmd, setCmd] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selIdx, setSelIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef(null);
  const presets = ['npm run lint', 'npm run build', 'git status', 'git log --oneline -5', 'ls -la', 'git diff'];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [outputs, loading]);

  function detectError(output) {
    const lower = output.toLowerCase();
    const hasErr = lower.includes('error') || lower.includes('failed') || lower.includes('exception') || lower.includes('cannot find') || lower.includes('exit code 1') || lower.includes('no such file') || lower.includes('permission denied') || lower.includes('command not found');
    const isFP = lower.includes('0 errors') || lower.includes('no error') || lower.includes('syntax ok') || lower.includes('0 problem');
    return hasErr && !isFP;
  }

  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') { setSelIdx(s=>(s+1)%suggestions.length); e.preventDefault(); return; }
      if (e.key === 'ArrowUp') { setSelIdx(s=>(s-1+suggestions.length)%suggestions.length); e.preventDefault(); return; }
      if (e.key === 'Tab') { setCmd(suggestions[selIdx]); setSuggestions([]); e.preventDefault(); return; }
    }
    if (e.key === 'ArrowUp' && !cmd && cmdHistory?.length) { const i=Math.min(histIdx+1,cmdHistory.length-1); setHistIdx(i); setCmd(cmdHistory[i]||''); e.preventDefault(); return; }
    if (e.key === 'ArrowDown' && histIdx>-1) { const i=histIdx-1; setHistIdx(i); setCmd(i>=0?cmdHistory[i]:''); e.preventDefault(); return; }
    if (e.key === 'Enter' && cmd.trim()) run();
  };

  const onTextChange = (v) => {
    setCmd(v); setHistIdx(-1);
    const all = [...new Set([...presets,...(cmdHistory||[])])];
    setSuggestions(v ? all.filter(x=>x.startsWith(v)&&x!==v).slice(0,5) : []);
    setSelIdx(0);
  };

  async function run() {
    const c = cmd.trim();
    setLoading(true); setSuggestions([]); setCmd(''); setHistIdx(-1);
    if (addHistory) addHistory(c);
    try {
      const res = await callServer({ type:'exec', path:folder, command:c });
      const output = res.data || res.output || res.error || '(selesai)';
      const hasError = detectError(output);
      setOutputs(prev => [...prev.slice(-50), { cmd:c, output, hasError }]);
    } catch(e) {
      setOutputs(prev => [...prev.slice(-50), { cmd:c, output:e.message, hasError:true }]);
    }
    setLoading(false);
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#0a0a0c',fontSize:'12px',fontFamily:'monospace'}}>
      <div style={{display:'flex',alignItems:'center',padding:'4px 8px',borderBottom:'1px solid rgba(255,255,255,.06)',flexShrink:0}}>
        <span style={{fontSize:'10px',color:'rgba(255,255,255,.3)',flex:1}}>terminal</span>
        {outputs.length>0&&<button onClick={()=>setOutputs([])} style={{background:'none',border:'none',color:'rgba(255,255,255,.2)',fontSize:'10px',cursor:'pointer'}}>clear</button>}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
        {outputs.length===0&&<div style={{color:'rgba(255,255,255,.2)',fontSize:'11px'}}>Ready.</div>}
        {outputs.map((entry,i) => (
          <div key={i} style={{marginBottom:'10px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'3px'}}>
              <span style={{color:'#4ade80'}}>$</span>
              <span style={{color:'rgba(255,255,255,.8)'}}>{entry.cmd}</span>
            </div>
            <div style={{color:entry.hasError?'#fca5a5':'rgba(255,255,255,.6)',whiteSpace:'pre-wrap',wordBreak:'break-word',lineHeight:'1.6',paddingLeft:'14px',borderLeft:entry.hasError?'2px solid rgba(248,113,113,.3)':'2px solid rgba(255,255,255,.06)'}}>
              {entry.output}
            </div>
            {entry.hasError && onSendToAI && (
              <button onClick={()=>onSendToAI('Error di terminal:\n```bash\n$ '+entry.cmd+'\n'+entry.output.slice(0,600)+'\n```\nDiagnosa dan fix.')}
                style={{marginTop:'5px',marginLeft:'14px',background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.2)',borderRadius:'6px',padding:'3px 10px',color:'#f87171',fontSize:'10px',cursor:'pointer'}}>
                🔧 Fix dengan AI
              </button>
            )}
          </div>
        ))}
        {loading&&<div style={{color:'rgba(255,255,255,.3)',paddingLeft:'14px'}}>···</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{position:'relative',padding:'6px 8px',borderTop:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.02)',flexShrink:0}}>
        {suggestions.length>0&&(
          <div style={{position:'absolute',bottom:'100%',left:0,right:0,background:'#1e2028',border:'1px solid rgba(255,255,255,.1)',borderRadius:'8px 8px 0 0',boxShadow:'0 -8px 24px rgba(0,0,0,.5)',overflow:'hidden',marginBottom:'2px'}}>
            {suggestions.map((s,i)=>(
              <div key={i} style={{padding:'7px 12px',fontSize:'11px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.05)',background:i===selIdx?'rgba(49,109,202,.5)':'transparent',color:i===selIdx?'#fff':'rgba(255,255,255,.5)'}} onClick={()=>{setCmd(s);setSuggestions([]);}}>
                <span style={{opacity:.5,marginRight:'8px'}}>❯</span>{s}
              </div>
            ))}
          </div>
        )}
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{color:'#4ade80'}}>➜</span>
          <input style={{background:'transparent',border:'none',outline:'none',flex:1,color:'rgba(255,255,255,.85)',fontSize:'12px',fontFamily:'monospace'}} value={cmd} onChange={e=>onTextChange(e.target.value)} onKeyDown={handleKeyDown} placeholder='Type command...' autoCapitalize='none' autoCorrect='off'/>
        </div>
      </div>
    </div>
  );
}
