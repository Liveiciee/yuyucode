// patch_new_features2.cjs
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
  '  const [showPlugins, setShowPlugins] = useState(false);\n  const [sessionTokens, setSessionTokens] = useState({input:0,output:0,requests:0});',
  '  const [showPlugins, setShowPlugins] = useState(false);\n  const [sessionTokens, setSessionTokens] = useState({input:0,output:0,requests:0});\n  const [loopActive, setLoopActive] = useState(false);\n  const [loopIntervalRef, setLoopIntervalRef] = useState(null);\n  const [agentMemory, setAgentMemory] = useState({ user: [], project: [], local: [] });\n  const [pushToTalk, setPushToTalk] = useState(false);\n  const [summarizeAnchor, setSummarizeAnchor] = useState(null);'
);

// ── 2. Load agent memory on startup ─────────────────────────────────────────
patch('load agent memory',
  '      if(tk.value) setThinkingEnabled(tk.value===\'1\');',
  '      if(tk.value) setThinkingEnabled(tk.value===\'1\');\n      const amr = await Preferences.get({key:\'yc_agent_memory\'});\n      if(amr.value){try{setAgentMemory(JSON.parse(amr.value));}catch{}}'
);

// ── 3. PostCompact hook ───────────────────────────────────────────────────────
patch('PostCompact hook',
  "      setMessages(m=>[...m,{role:'assistant',content:'✅ Context berhasil dikompres!',actions:[]}]);",
  "      setMessages(m=>[...m,{role:'assistant',content:'✅ Context berhasil dikompres!',actions:[]}]);\n      await runHooksV2(hooks.postCompact||[], 'compact', folder);"
);

// ── 4. Inject agent memory into system prompt ────────────────────────────────
patch('inject agent memory',
  "      const thinkingCtx = thinkingEnabled ? '\\n\\nMode: EXTENDED THINKING aktif. Pikirkan mendalam sebelum jawab.' : '';",
  "      const thinkingCtx = thinkingEnabled ? '\\n\\nMode: EXTENDED THINKING aktif. Pikirkan mendalam sebelum jawab.' : '';\n      const agentMemCtx = ['user','project','local'].map(s=>(agentMemory[s]||[]).length ? '\\n\\n['+s+' memory]:\\n'+(agentMemory[s]||[]).map(mx=>'• '+mx.text).join('\\n') : '').join('');"
);

patch('add agentMemCtx to systemPrompt',
  "      const systemPrompt=BASE_SYSTEM+effortCfg.systemSuffix+'\\n\\nFolder aktif: '+folder+'\\nBranch: '+branch+notesCtx+skillsCtx+pinnedCtx+fileCtx+memCtx+visionCtx+thinkingCtx;",
  "      const systemPrompt=BASE_SYSTEM+effortCfg.systemSuffix+'\\n\\nFolder aktif: '+folder+'\\nBranch: '+branch+notesCtx+skillsCtx+pinnedCtx+fileCtx+memCtx+agentMemCtx+visionCtx+thinkingCtx;"
);

// ── 5. Add PushToTalkBtn component ───────────────────────────────────────────
patch('add PTT component',
  "      {listening ? '⏹' : '🎤'}\n    </button>\n  );\n}\n\n// ─── THEME BUILDER",
  "      {listening ? '⏹' : '🎤'}\n    </button>\n  );\n}\n\nfunction PushToTalkBtn({ onResult, disabled }) {\n  const [recording, setRecording] = useState(false);\n  async function onPressIn() {\n    setRecording(true);\n    try {\n      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');\n      await SpeechRecognition.requestPermissions();\n      await SpeechRecognition.start({ language: 'id-ID', maxResults: 1, partialResults: false, popup: false });\n    } catch {}\n  }\n  async function onPressOut() {\n    setRecording(false);\n    try {\n      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');\n      const result = await SpeechRecognition.stop();\n      if (result && result.matches && result.matches.length > 0) onResult(result.matches[0]);\n    } catch {}\n  }\n  return (\n    <button\n      onMouseDown={onPressIn} onMouseUp={onPressOut}\n      onTouchStart={e=>{e.preventDefault();onPressIn();}} onTouchEnd={e=>{e.preventDefault();onPressOut();}}\n      disabled={disabled}\n      style={{background:recording?'rgba(248,113,113,.3)':'rgba(124,58,237,.15)',border:'1px solid '+(recording?'rgba(248,113,113,.5)':'rgba(124,58,237,.3)'),borderRadius:'10px',padding:'8px 10px',color:recording?'#f87171':'#a78bfa',fontSize:'13px',cursor:'pointer',flexShrink:0}}>\n      {recording ? '🔴' : '🎙'}\n    </button>\n  );\n}\n\n// ─── THEME BUILDER"
);

// ── 6. Add PTT button next to VoiceBtn ───────────────────────────────────────
patch('add PTT button to input',
  "<VoiceBtn onResult={v=>{setInput(i=>i+v);}} disabled={loading}/>",
  "<VoiceBtn onResult={v=>{setInput(i=>i+v);}} disabled={loading}/>\n              {pushToTalk&&<PushToTalkBtn onResult={v=>{setInput('');setTimeout(()=>sendMsg(v),100);}} disabled={loading}/>}"
);

// ── 7. Add new slash commands ─────────────────────────────────────────────────
patch('add new slash commands',
  "    } else if (base==='/self-edit') {",
  [
    "    } else if (base==='/loop') {",
    "      const args = parts.slice(1).join(' ').trim();",
    "      if (!args) {",
    "        if (loopActive) {",
    "          clearInterval(loopIntervalRef);",
    "          setLoopIntervalRef(null);",
    "          setLoopActive(false);",
    "          setMessages(m=>[...m,{role:'assistant',content:'⏹ Loop dihentikan.',actions:[]}]);",
    "        } else {",
    "          setMessages(m=>[...m,{role:'assistant',content:'Usage: /loop <interval> <command>\\nContoh: /loop 5m git status\\nInterval: 1m 5m 10m 30m 1h',actions:[]}]);",
    "        }",
    "        return;",
    "      }",
    "      const lm = args.match(/^(\\d+)(m|h)\\s+(.+)/);",
    "      if (!lm) { setMessages(m=>[...m,{role:'assistant',content:'Format: /loop <interval> <cmd>. Contoh: /loop 5m git status',actions:[]}]); return; }",
    "      const loopMs = parseInt(lm[1]) * (lm[2]==='h' ? 3600000 : 60000);",
    "      const loopCmd = lm[3];",
    "      if (loopActive) clearInterval(loopIntervalRef);",
    "      setLoopActive(true);",
    "      setMessages(m=>[...m,{role:'assistant',content:'🔄 Loop aktif: **'+loopCmd+'** setiap '+lm[1]+(lm[2]==='h'?' jam':' menit')+'. /loop untuk stop.',actions:[]}]);",
    "      const iv = setInterval(async () => {",
    "        const r = await callServer({type:'exec', path:folder, command:loopCmd});",
    "        setMessages(m=>[...m,{role:'assistant',content:'🔄 Loop ['+new Date().toLocaleTimeString('id')+']:\\n```bash\\n'+(r.data||'').slice(0,500)+'\\n```',actions:[]}]);",
    "      }, loopMs);",
    "      setLoopIntervalRef(iv);",
    "    } else if (base==='/summarize') {",
    "      const fromIdx = parseInt(parts[1]);",
    "      if (isNaN(fromIdx)) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /summarize <N> — kompres dari pesan ke-N.',actions:[]}]); return; }",
    "      setLoading(true);",
    "      const ctrl2 = new AbortController();",
    "      try {",
    "        const toCompact = messages.slice(fromIdx);",
    "        const summary = await askCerebrasStream([",
    "          {role:'system',content:'Ringkas percakapan coding ini. Fokus: keputusan teknis, files diubah, status project. Maks 200 kata.'},",
    "          {role:'user',content:toCompact.map(mx=>mx.role+': '+mx.content.slice(0,200)).join('\\n\\n')}",
    "        ], 'llama3.1-8b', ()=>{}, ctrl2.signal);",
    "        setMessages([...messages.slice(0, fromIdx), {role:'assistant',content:'📦 **Ringkasan dari pesan '+fromIdx+':**\\n\\n'+summary}, {role:'assistant',content:'✅ Diringkas.',actions:[]}]);",
    "      } catch(e) { if(e.name!=='AbortError') setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message,actions:[]}]); }",
    "      setLoading(false);",
    "    } else if (base==='/memory') {",
    "      const sub = parts[1]?.toLowerCase();",
    "      const scope = ['user','project','local'].includes(parts[2]) ? parts[2] : 'user';",
    "      const content = parts.slice(3).join(' ').trim();",
    "      if (sub==='add' && content) {",
    "        const next = {...agentMemory, [scope]: [...(agentMemory[scope]||[]), {text:content, ts:new Date().toLocaleDateString('id'), id:Date.now()}]};",
    "        setAgentMemory(next); Preferences.set({key:'yc_agent_memory',value:JSON.stringify(next)});",
    "        setMessages(m=>[...m,{role:'assistant',content:'🧠 Memory ['+scope+']: '+content,actions:[]}]);",
    "      } else if (sub==='clear') {",
    "        const next = {...agentMemory, [scope]:[]};",
    "        setAgentMemory(next); Preferences.set({key:'yc_agent_memory',value:JSON.stringify(next)});",
    "        setMessages(m=>[...m,{role:'assistant',content:'🧠 Memory ['+scope+'] dihapus.',actions:[]}]);",
    "      } else {",
    "        const all = ['user','project','local'].map(s=>'**'+s+'** ('+(agentMemory[s]||[]).length+'):\\n'+((agentMemory[s]||[]).map(mx=>'• '+mx.text).join('\\n')||'kosong')).join('\\n\\n');",
    "        setMessages(m=>[...m,{role:'assistant',content:'🧠 **Agent Memory:**\\n\\n'+all+'\\n\\nUsage: /memory add user|project|local <teks>\\n/memory clear user|project|local',actions:[]}]);",
    "      }",
    "    } else if (base==='/ptt') {",
    "      setPushToTalk(p=>!p);",
    "      setMessages(m=>[...m,{role:'assistant',content:'🎙 Push-to-talk '+(pushToTalk?'dimatikan':'diaktifkan. Tahan 🎙 untuk rekam, lepas untuk kirim.')+'.', actions:[]}]);",
    "    } else if (base==='/self-edit') {",
  ].join('\n')
);

// ── 8. Update constants.js ────────────────────────────────────────────────────
if (!cc.includes("'/loop'")) {
  cc = cc.replace(
    "  { cmd:'/plugin',      desc:'Plugin marketplace' },",
    "  { cmd:'/plugin',      desc:'Plugin marketplace' },\n  { cmd:'/loop',        desc:'Jalankan command berulang (/loop untuk stop)' },\n  { cmd:'/summarize',   desc:'Kompres conversation dari pesan ke-N' },\n  { cmd:'/ptt',         desc:'Toggle push-to-talk mode' },\n  { cmd:'/memory',      desc:'Agent memory: add/clear/view (user/project/local)' },"
  );
  fs.writeFileSync(constPath, cc);
  console.log('ok: constants updated');
}

fs.writeFileSync(filePath, c);
console.log('\ndone. changes:', changed, '| lines:', c.split('\n').length);
