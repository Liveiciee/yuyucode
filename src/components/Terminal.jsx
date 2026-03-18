import React, { useState } from "react";
import { callServer } from '../api.js';

export function Terminal({ folder, cmdHistory, addHistory }) {
  const [cmd, setCmd] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selIdx, setSelIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const presets = ['npm run lint', 'git status', 'git push', 'ls -la'];

  const handleKeyDown = (e) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') { setSelIdx(s => (s + 1) % suggestions.length); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { setSelIdx(s => (s - 1 + suggestions.length) % suggestions.length); e.preventDefault(); }
      else if (e.key === 'Tab') { setCmd(suggestions[selIdx]); setSuggestions([]); e.preventDefault(); }
    }
    if (e.key === 'Enter' && cmd.trim()) run();
  };

  const onTextChange = (v) => {
    setCmd(v);
    const matches = [...new Set([...presets, ...(cmdHistory||[])])].filter(x => x.startsWith(v) && x !== v).slice(0, 5);
    setSuggestions(v ? matches : []);
    setSelIdx(0);
  };

  async function run() {
    setLoading(true); setSuggestions([]);
    try {
      if (addHistory) addHistory(cmd);
      const res = await callServer({ type:'exec', path:folder, command:cmd });
      setOutput(res.output || res.error || 'Done.');
      setCmd('');
    } catch (e) { setOutput(e.message); } finally { setLoading(false); }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#0a0a0c',fontSize:'12px',fontFamily:'monospace',padding:'8px',borderTop:'1px solid rgba(255,255,255,.08)'}}>
      <div style={{flex:1,overflowY:'auto',marginBottom:'8px',color:'rgba(255,255,255,.65)',whiteSpace:'pre-wrap',wordBreak:'break-word',lineHeight:'1.6'}}>
        {output}{loading&&<span style={{opacity:.5}}>···</span>}
      </div>
      <div style={{position:'relative',display:'flex',alignItems:'center',gap:'8px',borderTop:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.03)',padding:'6px 8px',borderRadius:'6px'}}>
        {suggestions.length>0&&(
          <div style={{position:'absolute',bottom:'100%',left:0,right:0,background:'#1e2028',border:'1px solid rgba(255,255,255,.1)',borderRadius:'8px 8px 0 0',boxShadow:'0 -8px 24px rgba(0,0,0,.5)',overflow:'hidden',marginBottom:'2px'}}>
            {suggestions.map((s,i)=>(
              <div key={i}
                style={{padding:'7px 12px',fontSize:'11px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.05)',background:i===selIdx?'rgba(49,109,202,.5)':'transparent',color:i===selIdx?'#fff':'rgba(255,255,255,.5)'}}
                onClick={()=>{setCmd(s);setSuggestions([]);}}>
                <span style={{opacity:.5,marginRight:'8px'}}>❯</span>{s}
              </div>
            ))}
          </div>
        )}
        <span style={{color:'#4ade80'}}>➜</span>
        <input
          style={{background:'transparent',border:'none',outline:'none',flex:1,color:'rgba(255,255,255,.85)',fontSize:'12px',fontFamily:'monospace'}}
          value={cmd}
          onChange={e=>onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type command...'
        />
      </div>
    </div>
  );
}
