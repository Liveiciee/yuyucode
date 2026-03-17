// patch_final.cjs
const fs = require('fs');
const filePath = 'src/App.jsx';
let c = fs.readFileSync(filePath, 'utf8');
let changed = 0;

function patch(label, from, to) {
  if (!c.includes(from)) { console.log('skip:', label); return; }
  c = c.replace(from, to);
  changed++;
  console.log('ok:', label);
}

// ── 1. Fix VoiceBtn — Capacitor Speech Recognition ──────────────────────────
patch('fix VoiceBtn',
`function VoiceBtn({ onResult, disabled }) {
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  function toggle() {
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition tidak tersedia di browser ini'); return; }
    const r = new SR();
    r.lang = 'id-ID';
    r.interimResults = false;
    r.onresult = e => { onResult(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }

  return (
    <button onClick={toggle} disabled={disabled}
      style={{background:listening?'rgba(248,113,113,.2)':'rgba(255,255,255,.04)',border:'1px solid '+(listening?'rgba(248,113,113,.4)':'rgba(255,255,255,.08)'),borderRadius:'10px',padding:'8px 10px',color:listening?'#f87171':'rgba(255,255,255,.3)',fontSize:'13px',cursor:'pointer',flexShrink:0,transition:'all .2s'}}>
      {listening ? '⏹' : '🎤'}
    </button>
  );
}`,
`function VoiceBtn({ onResult, disabled }) {
  const [listening, setListening] = useState(false);

  async function toggle() {
    if (listening) {
      try {
        const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
        await SpeechRecognition.stop();
      } catch {}
      setListening(false);
      return;
    }
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      const available = await SpeechRecognition.available();
      if (available.available) {
        await SpeechRecognition.requestPermissions();
        SpeechRecognition.addListener('partialResults', () => {});
        const result = await SpeechRecognition.start({
          language: 'id-ID', maxResults: 1, partialResults: false, popup: false,
        });
        if (result.matches && result.matches.length > 0) {
          onResult(result.matches[0]);
        }
        setListening(false);
        return;
      }
    } catch {}
    // Fallback web API
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition tidak tersedia'); return; }
    const r = new SR();
    r.lang = 'id-ID'; r.interimResults = false;
    r.onresult = e => { onResult(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start(); setListening(true);
  }

  return (
    <button onClick={toggle} disabled={disabled}
      style={{background:listening?'rgba(248,113,113,.2)':'rgba(255,255,255,.04)',border:'1px solid '+(listening?'rgba(248,113,113,.4)':'rgba(255,255,255,.08)'),borderRadius:'10px',padding:'8px 10px',color:listening?'#f87171':'rgba(255,255,255,.3)',fontSize:'13px',cursor:'pointer',flexShrink:0,transition:'all .2s'}}>
      {listening ? '⏹' : '🎤'}
    </button>
  );
}`
);

// ── 2. Add panels before closing </div> ─────────────────────────────────────
patch('add sessions permissions plugins panels',
`      {/* DEPLOY PANEL */}`,
`      {/* SESSIONS PANEL */}
      {showSessions&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.95)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>💾 Saved Sessions</span>
            <button onClick={()=>setShowSessions(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          {sessionList.length===0&&<div style={{color:'rgba(255,255,255,.3)',fontSize:'12px'}}>Belum ada sesi tersimpan. Ketik /save untuk menyimpan.</div>}
          <div style={{flex:1,overflowY:'auto'}}>
            {sessionList.map(s=>(
              <div key={s.id} style={{padding:'10px 12px',marginBottom:'6px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'8px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',color:'#f0f0f0',fontWeight:'500'}}>{s.name}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,.35)',marginTop:'2px'}}>{s.folder} · {s.branch} · {new Date(s.savedAt).toLocaleString('id')}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,.25)'}}>{s.messages?.length||0} pesan</div>
                  </div>
                  <button onClick={()=>{setMessages(s.messages||[]);setFolder(s.folder);setFolderInput(s.folder);setShowSessions(false);setMessages(m=>[...m,{role:'assistant',content:'✅ Sesi **'+s.name+'** dipulihkan.',actions:[]}]);}}
                    style={{background:'rgba(124,58,237,.1)',border:'1px solid rgba(124,58,237,.2)',borderRadius:'6px',padding:'4px 10px',color:'#a78bfa',fontSize:'11px',cursor:'pointer'}}>
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PERMISSIONS PANEL */}
      {showPermissions&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.95)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🔐 Tool Permissions</span>
            <button onClick={()=>setShowPermissions(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,.35)',marginBottom:'12px'}}>Kontrol tool mana yang bisa dijalankan tanpa konfirmasi.</div>
          <div style={{flex:1,overflowY:'auto'}}>
            {Object.entries(permissions).map(([tool,allowed])=>(
              <div key={tool} style={{display:'flex',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',color:'#f0f0f0',fontFamily:'monospace'}}>{tool}</div>
                  <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)'}}>{allowed?'Auto-run':'Butuh konfirmasi'}</div>
                </div>
                <div onClick={()=>{
                  const next={...permissions,[tool]:!allowed};
                  setPermissions(next);
                  Preferences.set({key:'yc_permissions',value:JSON.stringify(next)});
                }} style={{width:'42px',height:'24px',borderRadius:'12px',background:allowed?'#7c3aed':'rgba(255,255,255,.1)',cursor:'pointer',position:'relative',transition:'all .2s',flexShrink:0}}>
                  <div style={{position:'absolute',top:'3px',left:allowed?'21px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'white',transition:'all .2s'}}/>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>{
            const reset={read_file:true,write_file:false,exec:false,list_files:true,search:true,mcp:false,delete_file:false,browse:false};
            setPermissions(reset);
            Preferences.set({key:'yc_permissions',value:JSON.stringify(reset)});
          }} style={{marginTop:'12px',background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'8px',padding:'8px',color:'#f87171',fontSize:'12px',cursor:'pointer'}}>
            Reset ke Default
          </button>
        </div>
      )}

      {/* PLUGINS PANEL */}
      {showPlugins&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.95)',zIndex:99,display:'flex',flexDirection:'column',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'14px',fontWeight:'600',color:'#f0f0f0',flex:1}}>🔌 Plugin Marketplace</span>
            <button onClick={()=>setShowPlugins(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',fontSize:'16px',cursor:'pointer'}}>×</button>
          </div>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,.35)',marginBottom:'16px'}}>Install plugin via SKILL.md di folder project kamu.</div>
          {[
            {name:'Auto Commit', desc:'Commit otomatis setelah write_file berhasil', cmd:'Tambah ke hooks.postWrite'},
            {name:'Lint on Save', desc:'Jalankan eslint setiap file disimpan', cmd:'Tambah ke hooks.preWrite'},
            {name:'Test Runner', desc:'Auto-run tests setelah perubahan kode', cmd:'/test setelah write'},
            {name:'Browser Preview', desc:'Buka preview app di browser setelah build', cmd:'/browse localhost:5173'},
            {name:'Git Auto Push', desc:'Push otomatis setelah commit', cmd:'Tambah ke hooks.postWrite'},
          ].map(p=>(
            <div key={p.name} style={{padding:'10px 12px',marginBottom:'6px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px'}}>
              <div style={{fontSize:'13px',color:'#f0f0f0',fontWeight:'500',marginBottom:'2px'}}>{p.name}</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,.4)',marginBottom:'6px'}}>{p.desc}</div>
              <div style={{fontSize:'10px',color:'#a78bfa',fontFamily:'monospace'}}>{p.cmd}</div>
            </div>
          ))}
          <div style={{marginTop:'8px',fontSize:'11px',color:'rgba(255,255,255,.3)'}}>
            Buat plugin sendiri: tambah instruksi ke <code style={{color:'#4ade80'}}>.claude/skills/plugin-name.md</code>
          </div>
        </div>
      )}

      {/* DEPLOY PANEL */}`
);

// ── 3. Fix tokenTracker — reset per session, track properly ─────────────────
patch('track tokens in sendMsg',
`        let reply = await callAI(groqMsgs, setStreaming, ctrl.signal, iter===1?visionImage:null);
        setStreaming('');
        // Track tokens (estimate from lengths)
        const inTk = Math.round(groqMsgs.reduce((a,m)=>a+m.content.length,0)/4);
        const outTk = Math.round(reply.length/4);
        tokenTracker.record(inTk, outTk);
        setSessionTokens({ input: tokenTracker.inputTokens, output: tokenTracker.outputTokens, requests: tokenTracker.requests });`,
`        let reply = await callAI(groqMsgs, setStreaming, ctrl.signal, iter===1?visionImage:null);
        setStreaming('');
        const inTk = Math.round(groqMsgs.reduce((a,m)=>a+m.content.length,0)/4);
        const outTk = Math.round(reply.length/4);
        tokenTracker.record(inTk, outTk);`
);

// ── 4. Add /sessions and /permissions to command palette ────────────────────
patch('add sessions permissions to palette tools',
`      { icon:'🚀', label:'Deploy', sub:'Vercel / Netlify / Railway', action:()=>{ onShowDeploy(); onClose(); } },`,
`      { icon:'🚀', label:'Deploy', sub:'Vercel / Netlify / Railway', action:()=>{ onShowDeploy(); onClose(); } },
      { icon:'💾', label:'Sessions', sub:'Sesi tersimpan', action:()=>{ onShowSessions&&onShowSessions(); onClose(); } },
      { icon:'🔐', label:'Permissions', sub:'Kelola tool permissions', action:()=>{ onShowPermissions&&onShowPermissions(); onClose(); } },
      { icon:'🔌', label:'Plugins', sub:'Plugin marketplace', action:()=>{ onShowPlugins&&onShowPlugins(); onClose(); } },`
);

// ── 5. Pass new handlers to CommandPalette ───────────────────────────────────
patch('pass new handlers to CommandPalette',
`onShowDiff, onShowSearch, onShowSnippets, onShowCustomActions,
  runTests, generateCommitMsg, exportChat, compactContext }) {`,
`onShowDiff, onShowSearch, onShowSnippets, onShowCustomActions,
  onShowSessions, onShowPermissions, onShowPlugins,
  runTests, generateCommitMsg, exportChat, compactContext }) {`
);

patch('pass new props to CommandPalette call',
`onShowDeploy={()=>setShowDeploy(true)}`,
`onShowDeploy={()=>setShowDeploy(true)}
              onShowSessions={()=>{loadSessions().then(s=>{setSessionList(s);setShowSessions(true);});}}
              onShowPermissions={()=>setShowPermissions(true)}
              onShowPlugins={()=>setShowPlugins(true)}`
);

// Write
fs.writeFileSync(filePath, c);
console.log('\ndone. changes:', changed, '| lines:', c.split('\n').length);
