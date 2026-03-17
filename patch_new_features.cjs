// patch_new_features.cjs
const fs = require('fs');
const filePath = 'src/App.jsx';
const constPath = 'src/constants.js';
let c = fs.readFileSync(filePath, 'utf8');
let cc = fs.readFileSync(constPath, 'utf8');
let changed = 0;

function patch(label, from, to) {
  if (!c.includes(from)) { console.log('skip:', label); return; }
  c = c.replace(from, to);
  changed++;
  console.log('ok:', label);
}

// ── 1. Add new state variables ───────────────────────────────────────────────
patch('add new state',
  `  const [showPlugins, setShowPlugins] = useState(false);
  const [sessionTokens, setSessionTokens] = useState({input:0,output:0,requests:0});`,
  `  const [showPlugins, setShowPlugins] = useState(false);
  const [sessionTokens, setSessionTokens] = useState({input:0,output:0,requests:0});
  const [loopActive, setLoopActive] = useState(false);
  const [loopInterval, setLoopInterval] = useState(null);
  const [agentMemory, setAgentMemory] = useState({ user: [], project: [], local: [] });
  const [pushToTalk, setPushToTalk] = useState(false);
  const [summarizeAnchor, setSummarizeAnchor] = useState(null);`
);

// ── 2. Load agent memory on startup ─────────────────────────────────────────
patch('load agent memory',
  `      if(oh.value) setOllamaHost(oh.value);
      if(ef.value) setEffort(ef.value);
      if(sn.value) setSessionName(sn.value);
      if(pm.value){try{setPermissions(JSON.parse(pm.value));}catch{}}
      if(tk.value) setThinkingEnabled(tk.value==='1');`,
  `      if(oh.value) setOllamaHost(oh.value);
      if(ef.value) setEffort(ef.value);
      if(sn.value) setSessionName(sn.value);
      if(pm.value){try{setPermissions(JSON.parse(pm.value));}catch{}}
      if(tk.value) setThinkingEnabled(tk.value==='1');
      // Load agent memory
      const amr = await Preferences.get({key:'yc_agent_memory'});
      if(amr.value){try{setAgentMemory(JSON.parse(amr.value));}catch{}}`
);

// ── 3. PostCompact hook ───────────────────────────────────────────────────────
patch('PostCompact hook',
  `      setMessages(m=>[...m,{role:'assistant',content:'✅ Context berhasil dikompres!',actions:[]}]);`,
  `      setMessages(m=>[...m,{role:'assistant',content:'✅ Context berhasil dikompres!',actions:[]}]);
      await runHooksV2(hooks.postCompact||[], 'compact:'+messages.length, folder);`
);

// ── 4. Add new slash commands before /self-edit ──────────────────────────────
patch('add new slash commands',
  `    } else if (base==='/self-edit') {`,
  `    } else if (base==='/loop') {
      const args = parts.slice(1).join(' ').trim();
      if (!args) {
        if (loopActive) {
          clearInterval(loopInterval);
          setLoopInterval(null);
          setLoopActive(false);
          setMessages(m=>[...m,{role:'assistant',content:'⏹ Loop dihentikan.',actions:[]}]);
        } else {
          setMessages(m=>[...m,{role:'assistant',content:'Usage: /loop <interval> <command>\nContoh: /loop 5m git status\nInterval: 1m, 5m, 10m, 30m, 1h\n/loop tanpa args untuk stop.',actions:[]}]);
        }
        return;
      }
      const intervalMatch = args.match(/^(\d+)(m|h)\s+(.+)/);
      if (!intervalMatch) { setMessages(m=>[...m,{role:'assistant',content:'Format: /loop <interval> <command>. Contoh: /loop 5m git status',actions:[]}]); return; }
      const [, num, unit, loopCmd] = intervalMatch;
      const ms = parseInt(num) * (unit==='h' ? 3600000 : 60000);
      if (loopActive) { clearInterval(loopInterval); }
      setMessages(m=>[...m,{role:'assistant',content:'🔄 Loop aktif: **'+loopCmd+'** setiap '+num+(unit==='h'?' jam':' menit')+'.\n/loop untuk stop.',actions:[]}]);
      setLoopActive(true);
      const iv = setInterval(async () => {
        const r = await callServer({type:'exec', path:folder, command:loopCmd});
        setMessages(m=>[...m,{role:'assistant',content:'🔄 **Loop** ['+new Date().toLocaleTimeString('id')+']:\n```bash\n'+(r.data||'').slice(0,500)+'\n```',actions:[]}]);
      }, ms);
      setLoopInterval(iv);
    } else if (base==='/summarize') {
      const fromIdx = parseInt(parts[1]);
      if (isNaN(fromIdx) || fromIdx < 0) {
        setMessages(m=>[...m,{role:'assistant',content:'Usage: /summarize <dari pesan ke-N>\nContoh: /summarize 5 = kompres dari pesan ke-5 sampai sekarang.',actions:[]}]);
        return;
      }
      if (messages.length <= fromIdx) { setMessages(m=>[...m,{role:'assistant',content:'Index melebihi jumlah pesan ('+messages.length+').',actions:[]}]); return; }
      setLoading(true);
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const toCompact = messages.slice(fromIdx);
        const summary = await askCerebrasStream([
          {role:'system',content:'Buat ringkasan singkat percakapan coding ini. Fokus: keputusan teknis, files yang diubah, status project. Maksimal 200 kata.'},
          {role:'user',content:toCompact.map(m=>m.role+': '+m.content.slice(0,200)).join('\n\n')}
        ], 'llama3.1-8b', ()=>{}, ctrl.signal);
        const compacted = [
          ...messages.slice(0, fromIdx),
          {role:'assistant', content:'📦 **Ringkasan dari pesan '+fromIdx+' ('+toCompact.length+' pesan):**\n\n'+summary},
        ];
        setMessages(compacted);
        setMessages(m=>[...m,{role:'assistant',content:'✅ Diringkas dari pesan ke-'+fromIdx+'.',actions:[]}]);
      } catch(e) {
        if(e.name!=='AbortError') setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message,actions:[]}]);
      }
      setLoading(false);
    } else if (base==='/memory') {
      const sub = parts[1]?.toLowerCase();
      const scope = parts[2]?.toLowerCase() || 'user';
      const content = parts.slice(3).join(' ').trim();
      if (sub==='add' && content) {
        const next = {...agentMemory, [scope]: [...(agentMemory[scope]||[]), {text:content, ts:new Date().toLocaleDateString('id'), id:Date.now()}]};
        setAgentMemory(next);
        Preferences.set({key:'yc_agent_memory', value:JSON.stringify(next)});
        setMessages(m=>[...m,{role:'assistant',content:'🧠 Memory ditambah ['+scope+']: '+content,actions:[]}]);
      } else if (sub==='clear') {
        const next = {...agentMemory, [scope]:[]};
        setAgentMemory(next);
        Preferences.set({key:'yc_agent_memory', value:JSON.stringify(next)});
        setMessages(m=>[...m,{role:'assistant',content:'🧠 Memory ['+scope+'] dihapus.',actions:[]}]);
      } else {
        const all = ['user','project','local'].map(s=>'**'+s+'** ('+( agentMemory[s]||[]).length+'):\n'+(agentMemory[s]||[]).map(m=>'• '+m.text).join('\n')||'kosong').join('\n\n');
        setMessages(m=>[...m,{role:'assistant',content:'🧠 **Agent Memory:**\n\n'+all+'\n\nUsage:\n/memory add user <teks>\n/memory add project <teks>\n/memory clear user',actions:[]}]);
      }
    } else if (base==='/ptt') {
      setPushToTalk(p=>!p);
      setMessages(m=>[...m,{role:'assistant',content:'🎤 Push-to-talk '+(pushToTalk?'dimatikan':'diaktifkan')+'. '+(pushToTalk?'':'Tahan tombol 🎤 untuk rekam, lepas untuk kirim.'),actions:[]}]);
    } else if (base==='/effort' && parts[1]==='auto') {
      setEffort('medium');
      Preferences.set({key:'yc_effort',value:'medium'});
      setMessages(m=>[...m,{role:'assistant',content:'⚡ Effort direset ke Medium (auto).',actions:[]}]);
    } else if (base==='/self-edit') {`
);

// ── 5. Inject agent memory into system prompt ────────────────────────────────
patch('inject agent memory into system prompt',
  `      const thinkingCtx = thinkingEnabled ? '\\n\\nMode: EXTENDED THINKING aktif. Pikirkan mendalam sebelum jawab.' : '';
      const systemPrompt=BASE_SYSTEM+effortCfg.systemSuffix+'\\n\\nFolder aktif: '+folder+'\\nBranch: '+branch+notesCtx+skillsCtx+pinnedCtx+fileCtx+memCtx+visionCtx+thinkingCtx;`,
  `      const thinkingCtx = thinkingEnabled ? '\\n\\nMode: EXTENDED THINKING aktif. Pikirkan mendalam sebelum jawab.' : '';
      const agentMemCtx = ['user','project','local'].map(s=>(agentMemory[s]||[]).length ? '\\n\\n['+s+' memory]:\\n'+(agentMemory[s]||[]).map(m=>'• '+m.text).join('\\n') : '').join('');
      const systemPrompt=BASE_SYSTEM+effortCfg.systemSuffix+'\\n\\nFolder aktif: '+folder+'\\nBranch: '+branch+notesCtx+skillsCtx+pinnedCtx+fileCtx+memCtx+agentMemCtx+visionCtx+thinkingCtx;`
);

// ── 6. Push-to-talk: hold button behavior ────────────────────────────────────
patch('push to talk button',
  `      {listening ? '⏹' : '🎤'}
    </button>
  );
}`,
  `      {listening ? '⏹' : '🎤'}
    </button>
  );
}

function PushToTalkBtn({ onResult, disabled }) {
  const [recording, setRecording] = useState(false);
  async function onPressIn() {
    setRecording(true);
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      await SpeechRecognition.requestPermissions();
      await SpeechRecognition.start({ language: 'id-ID', maxResults: 1, partialResults: false, popup: false });
    } catch {}
  }
  async function onPressOut() {
    setRecording(false);
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      const result = await SpeechRecognition.stop();
      if (result?.matches?.length > 0) onResult(result.matches[0]);
    } catch {}
  }
  return (
    <button
      onMouseDown={onPressIn} onMouseUp={onPressOut}
      onTouchStart={onPressIn} onTouchEnd={onPressOut}
      disabled={disabled}
      style={{background:recording?'rgba(248,113,113,.3)':'rgba(124,58,237,.15)',border:'1px solid '+(recording?'rgba(248,113,113,.5)':'rgba(124,58,237,.3)'),borderRadius:'10px',padding:'8px 10px',color:recording?'#f87171':'#a78bfa',fontSize:'13px',cursor:'pointer',flexShrink:0,transition:'all .1s'}}>
      {recording ? '🔴' : '🎙'}
    </button>
  );
}`
);

// ── 7. Add PushToTalkBtn next to VoiceBtn in input area ─────────────────────
patch('add PTT button to input',
  `<VoiceBtn onResult={v=>{setInput(i=>i+v);}} disabled={loading}/>`,
  `<VoiceBtn onResult={v=>{setInput(i=>i+v);}} disabled={loading}/>
              {pushToTalk&&<PushToTalkBtn onResult={v=>{setInput('');setTimeout(()=>sendMsg(v),100);}} disabled={loading}/>}`
);

// ── 8. Update constants.js with new commands ─────────────────────────────────
if (!cc.includes("'/loop'")) {
  cc = cc.replace(
    `  { cmd:'/plugin',      desc:'Plugin marketplace' },`,
    `  { cmd:'/plugin',      desc:'Plugin marketplace' },
  { cmd:'/loop',        desc:'Jalankan command berulang di interval (stop: /loop)' },
  { cmd:'/summarize',   desc:'Kompres conversation dari pesan ke-N' },
  { cmd:'/ptt',         desc:'Toggle push-to-talk mode' },
  { cmd:'/memory',      desc:'Agent memory: add/clear/view per scope' },`
  );
  fs.writeFileSync(constPath, cc);
  console.log('ok: constants.js updated');
}

fs.writeFileSync(filePath, c);
console.log('\ndone. changes:', changed, '| lines:', c.split('\n').length);
