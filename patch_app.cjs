// patch_app.cjs — jalankan: node patch_app.cjs
// Adds all Claude Code parity features to App.jsx

const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src/App.jsx');
let c = fs.readFileSync(filePath, 'utf8');
let changed = 0;

function patch(label, from, to) {
  if (!c.includes(from)) { console.log('⚠ skip (not found):', label); return; }
  c = c.replace(from, to);
  changed++;
  console.log('✅', label);
}

// ── 1. Add features.js import ──────────────────────────────────────────────
patch('import features.js',
  `import { countTokens, getFileIcon, hl, resolvePath, parseActions, executeAction } from './utils.js';`,
  `import { countTokens, getFileIcon, hl, resolvePath, parseActions, executeAction } from './utils.js';
import { generatePlan, parsePlanSteps, runBackgroundAgent, getBgAgents, abortBgAgent, loadSkills, selectSkills, runHooksV2, DEFAULT_HOOKS, tokenTracker, saveSession, loadSessions, rewindMessages, DEFAULT_PERMISSIONS, checkPermission, EFFORT_CONFIG, parseElicitation } from './features.js';`
);

// ── 2. Add new state after existing state ─────────────────────────────────
patch('add new state variables',
  `  const [reconnectTimer, setReconnectTimer] = useState(0);`,
  `  const [reconnectTimer, setReconnectTimer] = useState(0);
  const [effort, setEffort] = useState('medium');
  const [sessionName, setSessionName] = useState('');
  const [sessionTokens, setSessionTokens] = useState({ input:0, output:0, requests:0 });
  const [planSteps, setPlanSteps] = useState([]);
  const [showPlanPanel, setShowPlanPanel] = useState(false);
  const [planTask, setPlanTask] = useState('');
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  const [showPermissions, setShowPermissions] = useState(false);
  const [bgAgentList, setBgAgentList] = useState([]);
  const [showBgAgents, setShowBgAgents] = useState(false);
  const [skills, setSkills] = useState([]);
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [sessionList, setSessionList] = useState([]);
  const [showPlugins, setShowPlugins] = useState(false);`
);

// ── 3. Upgrade hooks state default ────────────────────────────────────────
patch('upgrade hooks default',
  `  const [hooks, setHooks] = useState({ preWrite:[], postWrite:[], postPush:[] });`,
  `  const [hooks, setHooks] = useState({ ...DEFAULT_HOOKS, preWrite:[], postWrite:[], postPush:[] });`
);

// ── 4. Load new prefs on startup ──────────────────────────────────────────
patch('add new prefs load',
  `      Preferences.get({key:'yc_ollama_host'}),
    ]).then(([f,h,ch,mo,th,pi,re,sw,mem,ckp,hk,fs,ct,ob,ght,ghr,oh])=>{`,
  `      Preferences.get({key:'yc_ollama_host'}),
      Preferences.get({key:'yc_effort'}),
      Preferences.get({key:'yc_session_name'}),
      Preferences.get({key:'yc_permissions'}),
      Preferences.get({key:'yc_thinking'}),
    ]).then(([f,h,ch,mo,th,pi,re,sw,mem,ckp,hk,fs,ct,ob,ght,ghr,oh,ef,sn,pm,tk])=>{`
);

patch('apply new prefs',
  `      if(oh.value) setOllamaHost(oh.value);
    });`,
  `      if(oh.value) setOllamaHost(oh.value);
      if(ef.value) setEffort(ef.value);
      if(sn.value) setSessionName(sn.value);
      if(pm.value){try{setPermissions(JSON.parse(pm.value));}catch{}}
      if(tk.value) setThinkingEnabled(tk.value==='1');
    });`
);

// ── 5. Load skills on folder change ───────────────────────────────────────
patch('load skills on folder change',
  `    callServer({type:'exec',path:folder,command:'git branch --show-current'}).then(r=>{if(r.ok)setBranch(r.data.trim());});`,
  `    callServer({type:'exec',path:folder,command:'git branch --show-current'}).then(r=>{if(r.ok)setBranch(r.data.trim());});
    loadSkills(folder).then(s=>setSkills(s));`
);

// ── 6. Upgrade runAgentSwarm to parallel ──────────────────────────────────
patch('parallel swarm',
  `      log('\u26db Frontend Agent: Mulai coding UI...');
      const feReply = await callAI([
        {role:'system',content:'Kamu adalah Frontend Engineer. Implementasikan bagian UI/React berdasarkan rencana berikut. Gunakan action blocks untuk write_file.'},
        {role:'user',content:'Plan:\\n'+archReply+'\\n\\nTask: '+task+'\\n\\nImplementasikan bagian frontend.'}
      ], ()=>{}, ctrl.signal);
      log('\u2705 Frontend selesai');

      log('\u2699 Backend Agent: Mulai coding server...');
      const beReply = await callAI([
        {role:'system',content:'Kamu adalah Backend Engineer. Implementasikan bagian server/API berdasarkan rencana. Gunakan action blocks untuk write_file.'},
        {role:'user',content:'Plan:\\n'+archReply+'\\n\\nTask: '+task+'\\n\\nImplementasikan bagian backend.'}
      ], ()=>{}, ctrl.signal);
      log('\u2705 Backend selesai');

      log('\ud83e\uddea QA Agent: Review dan cari bugs...');
      const qaReply = await callAI([
        {role:'system',content:'Kamu adalah QA Engineer. Review kode berikut, temukan bugs, dan beri rekomendasi perbaikan.'},
        {role:'user',content:'Frontend:\\n'+feReply.slice(0,1000)+'\\n\\nBackend:\\n'+beReply.slice(0,1000)}
      ], ()=>{}, ctrl.signal);
      log('\u2705 QA selesai');`,
  `      log('\u26a1 Running Frontend + Backend agents parallel...');
      const [feReply, beReply] = await Promise.all([
        callAI([
          {role:'system',content:'Kamu adalah Frontend Engineer. Implementasikan bagian UI/React berdasarkan rencana berikut. Gunakan action blocks untuk write_file.'},
          {role:'user',content:'Plan:\\n'+archReply+'\\n\\nTask: '+task+'\\n\\nImplementasikan bagian frontend.'}
        ], ()=>{}, ctrl.signal),
        callAI([
          {role:'system',content:'Kamu adalah Backend Engineer. Implementasikan bagian server/API berdasarkan rencana. Gunakan action blocks untuk write_file.'},
          {role:'user',content:'Plan:\\n'+archReply+'\\n\\nTask: '+task+'\\n\\nImplementasikan bagian backend.'}
        ], ()=>{}, ctrl.signal),
      ]);
      log('\u2705 Frontend + Backend selesai parallel');

      log('\ud83e\uddea QA Agent: Review dan cari bugs...');
      const qaReply = await callAI([
        {role:'system',content:'Kamu adalah QA Engineer. Review kode berikut, temukan bugs, dan beri rekomendasi perbaikan.'},
        {role:'user',content:'Frontend:\\n'+feReply.slice(0,1000)+'\\n\\nBackend:\\n'+beReply.slice(0,1000)}
      ], ()=>{}, ctrl.signal);
      log('\u2705 QA selesai');`
);

// ── 7. Inject effort + thinking + skills into system prompt ───────────────
patch('inject effort into system prompt',
  `      const systemPrompt=BASE_SYSTEM+'\\n\\nFolder aktif: '+folder+'\\nBranch: '+branch+notesCtx+skillCtx+pinnedCtx+fileCtx+memCtx+visionCtx;`,
  `      const effortCfg = EFFORT_CONFIG[effort] || EFFORT_CONFIG.medium;
      const activeSkills = selectSkills(skills, txt);
      const skillsCtx = activeSkills.map(s=>'\\n\\n=== '+s.name+' ===\\n'+s.content).join('');
      const thinkingCtx = thinkingEnabled ? '\\n\\nMode: EXTENDED THINKING aktif. Pikirkan mendalam sebelum jawab.' : '';
      const systemPrompt=BASE_SYSTEM+effortCfg.systemSuffix+'\\n\\nFolder aktif: '+folder+'\\nBranch: '+branch+notesCtx+skillsCtx+pinnedCtx+fileCtx+memCtx+visionCtx+thinkingCtx;`
);

// ── 8. Inject effort maxIter ──────────────────────────────────────────────
patch('effort maxIter',
  `      const MAX_ITER = 10;`,
  `      const MAX_ITER = (EFFORT_CONFIG[effort]||EFFORT_CONFIG.medium).maxIter;`
);

// ── 9. Track tokens per request ───────────────────────────────────────────
patch('track tokens',
  `        let reply = await callAI(groqMsgs, setStreaming, ctrl.signal, iter===1?visionImage:null);
        setStreaming('');`,
  `        let reply = await callAI(groqMsgs, setStreaming, ctrl.signal, iter===1?visionImage:null);
        setStreaming('');
        // Track tokens (estimate from lengths)
        const inTk = Math.round(groqMsgs.reduce((a,m)=>a+m.content.length,0)/4);
        const outTk = Math.round(reply.length/4);
        tokenTracker.record(inTk, outTk);
        setSessionTokens({ input: tokenTracker.inputTokens, output: tokenTracker.outputTokens, requests: tokenTracker.requests });`
);

// ── 10. Upgrade runHooks to runHooksV2 ────────────────────────────────────
patch('upgrade runHooks preWrite',
  `        await runHooks('preWrite', writes.map(a=>a.path).join(','));`,
  `        await runHooksV2(hooks.preToolCall, 'write:'+writes.map(a=>a.path).join(','), folder);
        await runHooksV2(hooks.preWrite, writes.map(a=>a.path).join(','), folder);`
);

patch('upgrade runHooks postWrite',
  `    await runHooks('postWrite', targets.map(a=>a.path).join(','));`,
  `    await runHooksV2(hooks.postWrite, targets.map(a=>a.path).join(','), folder);
    await runHooksV2(hooks.postToolCall, 'write:'+targets.map(a=>a.path).join(','), folder);`
);

// ── 11. Add new slash commands ────────────────────────────────────────────
patch('add new slash commands',
  `    } else if (base==='/self-edit') {`,
  `    } else if (base==='/plan') {
      const task = parts.slice(1).join(' ').trim();
      if (!task) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /plan <deskripsi task>',actions:[]}]); return; }
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'📋 Generating plan untuk: _'+task+'_...',actions:[]}]);
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const { reply, steps } = await generatePlan(task, folder, callAI, ctrl.signal);
        setPlanSteps(steps.map(s=>({...s,done:false})));
        setPlanTask(task);
        setShowPlanPanel(true);
        setMessages(m=>[...m,{role:'assistant',content:'📋 **Plan siap — '+steps.length+' langkah:**\n\n'+steps.map(s=>s.num+'. '+s.text).join('\n')+'\n\n*Approve di panel Plan untuk mulai eksekusi.*',actions:[]}]);
      } catch(e) {
        if(e.name!=='AbortError') setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message,actions:[]}]);
      }
      setLoading(false);
    } else if (base==='/rewind') {
      const turns = parseInt(parts[1])||1;
      const rewound = rewindMessages(messages, turns);
      setMessages(rewound);
      setMessages(m=>[...m,{role:'assistant',content:'⏪ Rewind '+turns+' turn'+(turns>1?'s':'')+'. Context dikembalikan ke '+rewound.length+' pesan.',actions:[]}]);
    } else if (base==='/effort') {
      const lvl = parts[1]?.toLowerCase();
      if (!['low','medium','high'].includes(lvl)) {
        const cur = EFFORT_CONFIG[effort];
        setMessages(m=>[...m,{role:'assistant',content:'⚡ Effort sekarang: **'+cur.label+'**\n\nUsage: /effort low|medium|high\n• low — cepat, skip read loop\n• medium — default\n• high — mendalam, max iterations',actions:[]}]);
        return;
      }
      setEffort(lvl);
      Preferences.set({key:'yc_effort',value:lvl});
      setMessages(m=>[...m,{role:'assistant',content:'⚡ Effort diubah ke: **'+EFFORT_CONFIG[lvl].label+'**',actions:[]}]);
    } else if (base==='/rename') {
      const name = parts.slice(1).join(' ').trim();
      if (!name) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /rename <nama sesi>',actions:[]}]); return; }
      setSessionName(name);
      Preferences.set({key:'yc_session_name',value:name});
      setMessages(m=>[...m,{role:'assistant',content:'✏️ Sesi diberi nama: **'+name+'**',actions:[]}]);
    } else if (base==='/usage') {
      setMessages(m=>[...m,{role:'assistant',content:tokenTracker.summary(),actions:[]}]);
    } else if (base==='/bg') {
      const task = parts.slice(1).join(' ').trim();
      if (!task) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /bg <deskripsi task>',actions:[]}]); return; }
      const id = await runBackgroundAgent(task, folder, callAI);
      setMessages(m=>[...m,{role:'assistant',content:'🤖 Background agent dimulai: _'+task+'_\nID: '+id+'\nLihat progress: /bgstatus',actions:[]}]);
    } else if (base==='/bgstatus') {
      const agents = getBgAgents();
      if (!agents.length) { setMessages(m=>[...m,{role:'assistant',content:'Tidak ada background agent aktif.',actions:[]}]); return; }
      const status = agents.map(a=>'**'+a.id+'** ['+a.status+']\n'+a.task+'\n'+a.log.slice(-2).join('\n')).join('\n\n');
      setMessages(m=>[...m,{role:'assistant',content:'🤖 **Background Agents:**\n\n'+status,actions:[]}]);
      setShowBgAgents(true);
    } else if (base==='/skills') {
      const loaded = await loadSkills(folder);
      setSkills(loaded);
      const list = loaded.map(s=>'• '+s.name+' ('+Math.round(s.content.length/100)/10+'KB)').join('\n');
      setMessages(m=>[...m,{role:'assistant',content:'🧩 **Skills loaded ('+loaded.length+'):**\n\n'+(list||'Tidak ada skill files.')+'\n\nTambah skill: buat `.claude/skills/nama.md`',actions:[]}]);
    } else if (base==='/thinking') {
      const next = !thinkingEnabled;
      setThinkingEnabled(next);
      Preferences.set({key:'yc_thinking',value:next?'1':'0'});
      setMessages(m=>[...m,{role:'assistant',content:'🧠 Extended thinking '+(next?'aktif ✅':'nonaktif')+'.',actions:[]}]);
    } else if (base==='/permissions') {
      setShowPermissions(true);
    } else if (base==='/sessions') {
      const sessions = await loadSessions();
      setSessionList(sessions);
      setShowSessions(true);
    } else if (base==='/save') {
      const name = parts.slice(1).join(' ').trim() || sessionName || 'Session '+new Date().toLocaleString('id');
      const s = await saveSession(name, messages, folder, branch);
      setSessionName(name);
      setMessages(m=>[...m,{role:'assistant',content:'💾 Sesi disimpan: **'+s.name+'**',actions:[]}]);
    } else if (base==='/debug') {
      const info = [
        '**Debug Info**',
        'Model: '+model,
        'Effort: '+effort,
        'Thinking: '+(thinkingEnabled?'on':'off'),
        'Messages: '+messages.length,
        'Tokens (est): ~'+countTokens(messages)+'tk',
        'Skills: '+skills.length,
        'Folder: '+folder,
        'Branch: '+branch,
        'Server: '+(serverOk?'✅':'❌'),
        'Hooks: preWrite('+hooks.preWrite.length+') postWrite('+hooks.postWrite.length+')',
      ].join('\n');
      setMessages(m=>[...m,{role:'assistant',content:info,actions:[]}]);
    } else if (base==='/plugin') {
      setShowPlugins(true);
    } else if (base==='/self-edit') {`
);

// ── 12. Add new slash commands to SLASH_COMMANDS in constants.js hint ────
// (constants.js update done separately)

// ── 13. Update /cost to use tokenTracker ─────────────────────────────────
patch('upgrade /cost',
  `    } else if (base==='/cost') {
      const total = messages.reduce((a,m)=>a+m.content.length,0);
      const tokens = Math.round(total/4);
      setMessages(m=>[...m,{role:'assistant',content:\`💰 Estimasi token: ~\${tokens}tk | ~\${messages.length} pesan | Cerebras gratis jadi $0 😄\`,actions:[]}]);`,
  `    } else if (base==='/cost') {
      setMessages(m=>[...m,{role:'assistant',content:tokenTracker.summary(),actions:[]}]);`
);

// ── 14. Add /status setMessages that was missing ──────────────────────────
patch('fix /status missing setMessages',
  `      const m = MODELS.find(x=>x.id===model);
      setLoading(false);
    } else if (base==='/tokens') {`,
  `      const mx = MODELS.find(x=>x.id===model);
      setMessages(prev=>[...prev,{role:'assistant',content:'📊 **Status YuyuCode**\\n\\n**Server:** '+(ping.ok?'✅ Online':'❌ Offline')+'\\n**Model:** '+(mx?.label||model)+' ('+(mx?.provider)+')\\n**Ollama:** '+ollamaHost+'\\n**Git:** '+(git.data||'').trim().slice(0,80)+'\\n**Node:** '+(nodeV.data||'').trim()+'\\n**Disk:** '+(disk.data||'').trim()+'\\n**Effort:** '+(EFFORT_CONFIG[effort]?.label||effort)+'\\n**Thinking:** '+(thinkingEnabled?'on':'off'),actions:[]}]);
      setLoading(false);
    } else if (base==='/tokens') {`
);

// Write back
fs.writeFileSync(filePath, c);
console.log('\n✨ Patch selesai. ' + changed + ' perubahan diterapkan.');
console.log('Lines:', c.split('\n').length);
