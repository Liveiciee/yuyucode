import { useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { callServer, askCerebrasStream } from '../api.js';
import { MODELS } from '../constants.js';
import { countTokens, parseActions } from '../utils.js';
import { generatePlan, runBackgroundAgent, getBgAgents, mergeBackgroundAgent, loadSkills, tokenTracker, saveSession, loadSessions, rewindMessages } from '../features.js';

export function useSlashCommands({
  // state
  model, folder, branch, messages, selectedFile, fileContent, notes,
  memories, checkpoints, skills, thinkingEnabled, effort, loopActive,
  loopIntervalRef, agentMemory, splitView, pushToTalk, sessionName,
  sessionColor, fileWatcherActive, fileWatcherInterval,
  // setters
  setModel, setMessages, setFolder, setFolderInput, setLoading, setStreaming,
  setThinkingEnabled, setEffort, setLoopActive, setLoopIntervalRef,
  setSplitView, setPushToTalk, setSessionName, setSessionColor,
  setSkills, setFileWatcherActive, setFileWatcherInterval, setFileSnapshots,
  setPlanSteps, setPlanTask, setAgentMemory, setSessionList,
  setShowCheckpoints, setShowMemory, setShowMCP, setShowGitHub, setShowDeploy,
  setShowSessions, setShowPermissions, setShowPlugins, setShowConfig,
  setShowCustomActions, setShowFileHistory, setShowThemeBuilder,
  setShowDiff, setShowSearch, setShowSnippets, setShowDepGraph,
  setDepGraph, setFontSize,
  setShowMergeConflict, setMergeConflictData,
  // functions
  sendMsg, compactContext, saveCheckpoint, exportChat, generateCommitMsg,
  runTests, browseTo, runAgentSwarm, callAI, addHistory, runHooks,
  sendNotification, haptic,
  // refs
  abortRef,
}) {
  const handleSlashCommand = useCallback(async (cmd) => {
    const parts = cmd.trim().split(' ');
    const base = parts[0];

    if (base==='/model') {
      const idx = MODELS.findIndex(m => m.id === model);
      const next = MODELS[(idx + 1) % MODELS.length];
      setModel(next.id); Preferences.set({key:'yc_model',value:next.id});
      setMessages(m=>[...m,{role:'assistant',content:'🔄 Model: **'+next.label+'** ('+((idx+1)%MODELS.length+1)+'/'+MODELS.length+')',actions:[]}]);

    } else if (base==='/compact') {
      await compactContext();

    } else if (base==='/checkpoint') {
      saveCheckpoint();

    } else if (base==='/restore') {
      setShowCheckpoints(true);

    } else if (base==='/cost') {
      setMessages(m=>[...m,{role:'assistant',content:tokenTracker.summary(),actions:[]}]);

    } else if (base==='/review') {
      const targetPath = parts.slice(1).join(' ').trim();
      if (targetPath) {
        // /review src/api.js — load file directly
        setLoading(true);
        const r = await callServer({type:'read', path: folder+'/'+targetPath.replace(/^\//,'')});
        setLoading(false);
        if (!r.ok) { setMessages(m=>[...m,{role:'assistant',content:'❌ File tidak ditemukan: '+targetPath,actions:[]}]); return; }
        await sendMsg('Lakukan code review menyeluruh pada file '+targetPath+'. Cari: bugs potensial, performance issues, security issues, dan saran improvement.\n\n```\n'+r.data.slice(0,5000)+'\n```');
      } else if (selectedFile) {
        const reviewContent = fileContent ? '\n\n```\n'+fileContent.slice(0,5000)+'\n```' : '';
        await sendMsg('Lakukan code review menyeluruh pada file '+selectedFile+'. Cari: bugs potensial, performance issues, security issues, dan saran improvement.'+reviewContent);
      } else {
        setMessages(m=>[...m,{role:'assistant',content:'Usage: /review atau /review src/file.js',actions:[]}]);
      }

    } else if (base==='/clear') {
      setMessages([{role:'assistant',content:'Chat dibersihkan. Mau ngerjain apa Papa? 🌸'}]);
      Preferences.remove({key:'yc_history'});

    } else if (base==='/export') {
      exportChat();

    } else if (base==='/history') {
      if (!selectedFile) { setMessages(m=>[...m,{role:'assistant',content:'Buka file dulu Papa~',actions:[]}]); return; }
      setShowFileHistory(true);

    } else if (base==='/actions') {
      setShowCustomActions(true);

    } else if (base==='/split') {
      setSplitView(s=>!s);
      setMessages(m=>[...m,{role:'assistant',content:'Split view '+(splitView?'dimatikan':'diaktifkan')+'~',actions:[]}]);

    } else if (base==='/deps') {
      if (!selectedFile) { setMessages(m=>[...m,{role:'assistant',content:'Buka file dulu Papa~',actions:[]}]); return; }
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'🕸 Building dep graph (2 levels)...',actions:[]}]);
      const importRegex = /(?:import|require)\s+.*?['"](.+?)['"]/g;
      const nodesMap = {};
      const edges = [];
      async function parseFile(path, depth) {
        if (depth > 2 || nodesMap[path]) return;
        const r = await callServer({type:'read', path});
        if (!r.ok) return;
        const isRoot = depth===0;
        const label = path.split('/').pop().replace(/\.(jsx?|tsx?)$/,'');
        nodesMap[path] = { id: path, label, type: isRoot ? 'root' : 'local' };
        const src = r.data || '';
        let m2;
        const re = new RegExp(importRegex.source, 'g');
        while ((m2=re.exec(src))!==null) {
          const imp = m2[1];
          if (!imp.startsWith('.')) {
            const extId = imp;
            if (!nodesMap[extId]) nodesMap[extId] = { id: extId, label: extId.split('/').pop(), type: 'external' };
            edges.push({ source: path, target: extId });
          } else {
            const base2 = path.split('/').slice(0,-1).join('/');
            const candidates = [imp, imp+'.jsx', imp+'.js', imp+'.ts', imp+'.tsx'].map(s=>base2+'/'+s.replace('./','/').replace('//','/')).concat([base2+'/'+imp.replace('./','').replace('//','/')]);
            for (const cand of candidates) {
              const cr = await callServer({type:'read', path:cand});
              if (cr.ok) {
                if (!nodesMap[cand]) await parseFile(cand, depth+1);
                edges.push({ source: path, target: cand });
                break;
              }
            }
          }
        }
      }
      await parseFile(selectedFile, 0);
      const nodes = Object.values(nodesMap);
      setDepGraph({ file: selectedFile.split('/').pop(), nodes, edges });
      setShowDepGraph(true);
      setMessages(m=>[...m,{role:'assistant',content:`🕸 Dep graph: **${nodes.length}** nodes, **${edges.length}** edges`,actions:[]}]);
      setLoading(false);

    } else if (base==='/browse') {
      const url = parts.slice(1).join(' ');
      if (!url) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /browse https://...',actions:[]}]); return; }
      await browseTo(url);

    } else if (base==='/swarm') {
      const task = parts.slice(1).join(' ');
      if (!task) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /swarm <deskripsi task>',actions:[]}]); return; }
      await runAgentSwarm(task);

    } else if (base==='/font') {
      const size = parseInt(parts[1])||14;
      setFontSize(size); Preferences.set({key:'yc_fontsize',value:String(size)});
      setMessages(m=>[...m,{role:'assistant',content:'🔤 Font size diubah ke '+size+'px~',actions:[]}]);

    } else if (base==='/theme') {
      setShowThemeBuilder(true);

    } else if (base==='/mcp') {
      setShowMCP(true);

    } else if (base==='/github') {
      setShowGitHub(true);

    } else if (base==='/deploy') {
      setShowDeploy(true);

    } else if (base==='/db') {
      const q = parts.slice(1).join(' ');
      if (!q) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /db SELECT * FROM table',actions:[]}]); return; }
      setLoading(true);
      // Auto-discover .db files
      const listR = await callServer({type:'list', path:folder});
      const dbFiles = listR.ok && Array.isArray(listR.data) ? listR.data.filter(f=>!f.isDir&&f.name.endsWith('.db')).map(f=>folder+'/'+f.name) : [];
      let dbPath = folder+'/data.db';
      if (dbFiles.length===1) {
        dbPath = dbFiles[0];
      } else if (dbFiles.length>1) {
        setMessages(m=>[...m,{role:'assistant',content:'🗄 Ditemukan '+dbFiles.length+' DB: '+dbFiles.map(f=>f.split('/').pop()).join(', ')+'\nUsage: /db <query> — pakai `/db use <nama.db>` untuk pilih.\nDefault: '+dbPath.split('/').pop(),actions:[]}]);
      }
      // /db use <file.db> — just switch default
      if (parts[1]==='use' && parts[2]) {
        setMessages(m=>[...m,{role:'assistant',content:'🗄 DB aktif: **'+parts[2]+'**. Query berikutnya akan pakai file ini.',actions:[]}]);
        setLoading(false); return;
      }
      const r = await callServer({type:'mcp',tool:'sqlite',action:'query',params:{dbPath,query:q}});
      setMessages(m=>[...m,{role:'assistant',content:'🗄 **'+dbPath.split('/').pop()+'** → `'+q+'`\n```\n'+(r.data||'kosong')+'\n```',actions:[]}]);
      setLoading(false);

    } else if (base==='/status') {
      setLoading(true);
      const [ping, git, nodeV, disk] = await Promise.all([
        callServer({type:'ping'}),
        callServer({type:'exec', path:folder, command:'git status --short 2>&1 | head -5'}),
        callServer({type:'exec', path:folder, command:'node --version 2>&1'}),
        callServer({type:'exec', path:folder, command:'df -h . 2>&1 | tail -1'}),
      ]);
      const mx = MODELS.find(x=>x.id===model);
      setMessages(prev=>[...prev,{role:'assistant',content:'📊 **Status**\n**Server:** '+(ping.ok?'✅ Online':'❌ Offline')+'\n**Model:** '+(mx?.label||model)+'\n**Git:** '+(git.data||'').trim().slice(0,60)+'\n**Node:** '+(nodeV.data||'').trim()+'\n**Disk:** '+(disk.data||'').trim(),actions:[]}]);
      setLoading(false);

    } else if (base==='/tokens') {
      const breakdown = messages.slice(-10).map(m=>{
        const tk = Math.round(m.content.length/4);
        return (m.role==='user'?'Papa':'Yuyu')+': ~'+tk+'tk';
      }).join('\n');
      setMessages(prev=>[...prev,{role:'assistant',content:
        '📓 **Token breakdown (10 pesan terakhir)**\n```\n'+breakdown+'\n```\n**Total:** ~'+countTokens(messages)+'tk | Cerebras gratis 🎉',actions:[]}]);

    } else if (base==='/index') {
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'🔍 Indexing src/...',actions:[]}]);
      const idxR = await callServer({type:'list', path:folder+'/src'});
      if (idxR.ok && Array.isArray(idxR.data)) {
        const files = idxR.data.filter(f=>!f.isDir);
        const list = files.map(f=>f.name+(f.size?` (${Math.round(f.size/1024)}KB)`:'')).join('\n');
        setMessages(m=>[...m,{role:'assistant',content:`✅ **Index: ${files.length} file di src/**\n\`\`\`\n${list}\n\`\`\``,actions:[]}]);
      } else {
        setMessages(m=>[...m,{role:'assistant',content:'❌ Tidak bisa index src/',actions:[]}]);
      }
      setLoading(false);

    } else if (base==='/skills') {
      const loaded = await loadSkills(folder);
      setSkills(loaded);
      const list = loaded.map(s=>'• '+s.name+' ('+Math.round(s.content.length/100)/10+'KB)').join('\n');
      setMessages(m=>[...m,{role:'assistant',content:'🧩 **Skills loaded ('+loaded.length+'):**\n\n'+(list||'Tidak ada skill files.'),actions:[]}]);

    } else if (base==='/thinking') {
      const next = !thinkingEnabled;
      setThinkingEnabled(next);
      Preferences.set({key:'yc_thinking',value:next?'1':'0'});
      setMessages(m=>[...m,{role:'assistant',content:'🧠 Think-aloud mode '+(next?'aktif — Yuyu akan tulis reasoning singkat dalam <think> sebelum jawab.':'nonaktif.'),actions:[]}]);

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
      ].join('\n');
      setMessages(m=>[...m,{role:'assistant',content:info,actions:[]}]);

    } else if (base==='/plugin') {
      setShowPlugins(true);

    } else if (base==='/plan') {
      const task = parts.slice(1).join(' ').trim();
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'📋 Generating plan...',actions:[]}]);
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const { reply, steps } = await generatePlan(task, folder, callAI, ctrl.signal);
        setPlanSteps(steps.map(s=>({...s,done:false})));
        setPlanTask(task);
        setMessages(m=>[...m,{role:'assistant',content:'📋 **Plan ('+steps.length+' langkah):**\n\n'+steps.map(s=>s.num+'. '+s.text).join('\n'),actions:[]}]);
      } catch(e) {
        if(e.name!=='AbortError') setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message,actions:[]}]);
      }
      setLoading(false);

    } else if (base==='/effort') {
      const lvl = parts[1]?.toLowerCase();
      if (!['low','medium','high'].includes(lvl)) {
        setMessages(m=>[...m,{role:'assistant',content:'⚡ Effort sekarang: **'+effort+'**\nUsage: /effort low|medium|high',actions:[]}]);
        return;
      }
      setEffort(lvl);
      Preferences.set({key:'yc_effort',value:lvl});
      setMessages(m=>[...m,{role:'assistant',content:'⚡ Effort: **'+lvl+'**',actions:[]}]);

    } else if (base==='/rewind') {
      const turns = parseInt(parts[1])||1;
      const rewound = rewindMessages(messages, turns);
      setMessages(rewound);
      setMessages(m=>[...m,{role:'assistant',content:'⏪ Rewind '+turns+' turn. '+rewound.length+' pesan tersisa.',actions:[]}]);

    } else if (base==='/rename') {
      const name = parts.slice(1).join(' ').trim();
      setSessionName(name);
      Preferences.set({key:'yc_session_name',value:name});
      setMessages(m=>[...m,{role:'assistant',content:'✏️ Sesi: **'+name+'**',actions:[]}]);

    } else if (base==='/usage') {
      setMessages(m=>[...m,{role:'assistant',content:tokenTracker.summary(),actions:[]}]);

    } else if (base==='/bg') {
      const task = parts.slice(1).join(' ').trim();
      const id = await runBackgroundAgent(task, folder, callAI, (id, agent) => {
        sendNotification('YuyuCode 🤖', 'Background agent selesai! '+(agent.result?.allWrites?.length||0)+' file. /bgmerge '+id);
        haptic('heavy');
      });
      setMessages(m=>[...m,{role:'assistant',content:'🤖 Background agent: '+task+'\nID: '+id,actions:[]}]);

    } else if (base==='/bgstatus') {
      const agents = getBgAgents();
      const statusLines = agents.map(a=>'['+a.status+'] '+a.id+'\n'+a.task+(a.log?'\n'+a.log.slice(-1).join(''):'')).join('\n\n');
      setMessages(m=>[...m,{role:'assistant',content:'🤖 **Background Agents:**\n\n'+statusLines,actions:[]}]);

    } else if (base==='/bgmerge') {
      const id = parts[1]?.trim();
      if (!id) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /bgmerge <agent-id>',actions:[]}]); return; }
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'🔀 Merging agent '+id+'...',actions:[]}]);
      const result = await mergeBackgroundAgent(id, folder);
      if (result.hasConflicts) {
        setMergeConflictData(result);
        setShowMergeConflict(true);
        setMessages(m=>[...m,{role:'assistant',content:'⚠ **Konflik di '+result.conflicts.length+' file:**\n'+result.conflicts.map(c=>'• '+c).join('\n')+'\n\nBuka panel konflik untuk pilih strategi resolusi.',actions:[]}]);
      } else {
        setMessages(m=>[...m,{role:'assistant',content:result.ok?'✅ '+result.msg:'❌ '+result.msg,actions:[]}]);
      }
      setLoading(false);

    } else if (base==='/loop') {
      const args = parts.slice(1).join(' ').trim();
      if (!args) {
        if (loopActive) {
          clearInterval(loopIntervalRef);
          setLoopIntervalRef(null);
          setLoopActive(false);
          setMessages(m=>[...m,{role:'assistant',content:'⏹ Loop dihentikan.',actions:[]}]);
        } else {
          setMessages(m=>[...m,{role:'assistant',content:'Usage: /loop <interval> <command>\nContoh: /loop 5m git status\nInterval: 1m 5m 10m 30m 1h',actions:[]}]);
        }
        return;
      }
      const lm = args.match(/^(\d+)(m|h)\s+(.+)/);
      if (!lm) { setMessages(m=>[...m,{role:'assistant',content:'Format: /loop <interval> <cmd>. Contoh: /loop 5m git status',actions:[]}]); return; }
      const loopMs = parseInt(lm[1]) * (lm[2]==='h' ? 3600000 : 60000);
      const loopCmd = lm[3];
      if (loopActive) clearInterval(loopIntervalRef);
      setLoopActive(true);
      setMessages(m=>[...m,{role:'assistant',content:'🔄 Loop aktif: **'+loopCmd+'** setiap '+lm[1]+(lm[2]==='h'?' jam':' menit')+'. /loop untuk stop.',actions:[]}]);
      const iv = setInterval(async () => {
        const r = await callServer({type:'exec', path:folder, command:loopCmd});
        setMessages(m=>[...m,{role:'assistant',content:'🔄 Loop ['+new Date().toLocaleTimeString('id')+']:\n```bash\n'+(r.data||'').slice(0,500)+'\n```',actions:[]}]);
      }, loopMs);
      setLoopIntervalRef(iv);

    } else if (base==='/amemory') {
      const sub = parts[1]?.toLowerCase();
      const scope = ['user','project','local'].includes(parts[2]) ? parts[2] : 'user';
      const content = parts.slice(3).join(' ').trim();
      if (sub==='add' && content) {
        const next = {...agentMemory, [scope]: [...(agentMemory[scope]||[]), {text:content, ts:new Date().toLocaleDateString('id'), id:Date.now()}]};
        setAgentMemory(next); Preferences.set({key:'yc_agent_memory',value:JSON.stringify(next)});
        setMessages(m=>[...m,{role:'assistant',content:'🧠 Memory ['+scope+']: '+content,actions:[]}]);
      } else if (sub==='clear') {
        const next = {...agentMemory, [scope]:[]};
        setAgentMemory(next); Preferences.set({key:'yc_agent_memory',value:JSON.stringify(next)});
        setMessages(m=>[...m,{role:'assistant',content:'🧠 Memory ['+scope+'] dihapus.',actions:[]}]);
      } else {
        const all = ['user','project','local'].map(s=>'**'+s+'** ('+(agentMemory[s]||[]).length+'):\n'+((agentMemory[s]||[]).map(mx=>'• '+mx.text+(mx.ts?' ('+mx.ts+')':'')).join('\n')||'kosong')).join('\n\n');
        setMessages(m=>[...m,{role:'assistant',content:'🧠 **Agent Memory:**\n\n'+all+'\n\nUsage: /amemory add user|project|local <teks>\n/amemory clear user|project|local',actions:[]}]);
      }

    } else if (base==='/ptt') {
      setPushToTalk(p=>!p);
      setMessages(m=>[...m,{role:'assistant',content:'🎙 Push-to-talk '+(pushToTalk?'dimatikan':'diaktifkan. Tahan 🎙 untuk rekam, lepas untuk kirim.')+'.', actions:[]}]);

    } else if (base==='/batch') {
      const batchCmd = parts.slice(1).join(' ').trim();
      if (!batchCmd) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /batch <command>\nContoh: /batch tambah JSDoc ke setiap fungsi\nAkan dijalankan ke semua file di src/',actions:[]}]); return; }
      setLoading(true);
      const listR = await callServer({type:'list', path:folder+'/src'});
      if (!listR.ok) { setMessages(m=>[...m,{role:'assistant',content:'❌ Tidak bisa list src/',actions:[]}]); setLoading(false); return; }
      const files = (listR.data||[]).filter(f=>!f.isDir && (f.name.endsWith('.jsx')||f.name.endsWith('.js')||f.name.endsWith('.ts')||f.name.endsWith('.tsx')));
      setMessages(m=>[...m,{role:'assistant',content:'📦 **Batch: '+batchCmd+'**\n'+files.length+' file akan dianalisis (baca penuh)...',actions:[]}]);
      const ctrl = new AbortController(); abortRef.current = ctrl;
      const allWrites = []; let skipped = 0, failed = 0;
      for (const f of files) {
        if (ctrl.signal.aborted) break;
        const filePath = folder+'/src/'+f.name;
        const r = await callServer({type:'read', path:filePath});
        if (!r.ok) { failed++; continue; }
        try {
          const reply = await callAI([
            {role:'system', content:'Kamu adalah code editor. Task: '+batchCmd+'\nFile: '+filePath+'\nGunakan write_file action untuk apply perubahan. Kalau tidak ada yang perlu diubah, balas hanya kata SKIP.'},
            {role:'user', content:'```\n'+r.data.slice(0,6000)+'\n```'},
          ], ()=>{}, ctrl.signal);
          if (reply.trim().toUpperCase().startsWith('SKIP')) { skipped++; continue; }
          const writes = parseActions(reply).filter(a=>a.type==='write_file');
          writes.forEach(w=>{ if(!w.path.startsWith('/')) w.path=folder+'/src/'+w.path.replace(/^\.?\//,''); });
          allWrites.push(...writes);
          setMessages(m=>[...m,{role:'assistant',content:'  '+(writes.length>0?'✅':'⏭')+' '+f.name+(writes.length>0?' — '+writes.length+' perubahan':''),actions:[]}]);
        } catch(e) {
          if (e.name==='AbortError') break;
          failed++;
          setMessages(m=>[...m,{role:'assistant',content:'  ❌ '+f.name+': '+e.message.slice(0,60),actions:[]}]);
        }
      }
      if (allWrites.length > 0) {
        setMessages(m=>[...m,{role:'assistant',content:'📦 **Batch siap — menunggu approval!**\n'+allWrites.length+' perubahan di '+new Set(allWrites.map(w=>w.path.split('/').pop())).size+' file ('+skipped+' di-skip, '+failed+' gagal).\nReview dan approve di bawah~',actions:allWrites.map(a=>({...a,executed:false}))}]);
      } else {
        setMessages(m=>[...m,{role:'assistant',content:'📦 Batch selesai — tidak ada perubahan diperlukan ('+skipped+' di-skip, '+failed+' gagal).',actions:[]}]);
      }
      setLoading(false);

    } else if (base==='/simplify') {
      if (!selectedFile) { setMessages(m=>[...m,{role:'assistant',content:'Buka file dulu Papa~',actions:[]}]); return; }
      await sendMsg('Simplifikasi kode di '+selectedFile+'. Hapus dead code, perpendek fungsi yang terlalu panjang, perbaiki naming. Jangan ubah fungsionalitas. Gunakan write_file untuk patch minimal.');

    } else if (base==='/color') {
      const color = parts[1]?.trim();
      const colors = {red:'#ef4444',green:'#22c55e',blue:'#3b82f6',purple:'#a855f7',yellow:'#eab308',pink:'#ec4899',orange:'#f97316',off:'off'};
      if (!color || !colors[color]) {
        setMessages(m=>[...m,{role:'assistant',content:'🎨 Session color sekarang: '+(sessionColor||'off')+'\nUsage: /color red|green|blue|purple|yellow|pink|orange|off',actions:[]}]);
        return;
      }
      const newColor = color==='off' ? null : colors[color];
      setSessionColor(newColor);
      Preferences.set({key:'yc_session_color',value:newColor||''});
      setMessages(m=>[...m,{role:'assistant',content:'🎨 Session color: **'+color+'**',actions:[]}]);

    } else if (base==='/config') {
      setShowConfig(true);

    } else if (base==='/watch') {
      if (fileWatcherActive) {
        clearInterval(fileWatcherInterval);
        setFileWatcherActive(false);
        setFileWatcherInterval(null);
        setMessages(m=>[...m,{role:'assistant',content:'👁 File watcher dimatikan.',actions:[]}]);
      } else {
        setFileWatcherActive(true);
        setFileSnapshots({});
        setMessages(m=>[...m,{role:'assistant',content:'👁 File watcher aktif. Yuyu akan notify real-time via WebSocket kalau ada file berubah dari luar app.',actions:[]}]);
      }

    } else if (base==='/refactor') {
      const oldName = parts[1]?.trim();
      const newName2 = parts[2]?.trim();
      if (!oldName || !newName2) {
        setMessages(m=>[...m,{role:'assistant',content:'Usage: /refactor <nama_lama> <nama_baru>',actions:[]}]);
        return;
      }
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'🔄 Refactor: '+oldName+' → '+newName2+'...',actions:[]}]);
      const searchR = await callServer({type:'search', path:folder+'/src', content:oldName});
      const fileList = searchR.ok ? [...new Set((searchR.data||'').split('\n').filter(Boolean).map(l=>{ const mx=l.match(/^(.+?):\d+:/); return mx?mx[1]:null; }).filter(Boolean))] : [];
      if (fileList.length === 0) {
        setMessages(m=>[...m,{role:'assistant',content:'❌ '+oldName+' tidak ditemukan di src/',actions:[]}]);
        setLoading(false); return;
      }
      await sendMsg('REFACTOR: rename ' + oldName + ' menjadi ' + newName2 + ' di: ' + fileList.join(', ') + '. Baca tiap file, ganti semua occurrence, lalu write_file.');
      setLoading(false);

    } else if (base==='/lint') {
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'🔍 Running lint...',actions:[]}]);
      const lintR = await callServer({type:'exec', path:folder, command:'npm run lint 2>&1 || true'});
      const lintOut = lintR.data || '';
      const hasLintErr = lintOut.toLowerCase().includes('error') && !lintOut.includes('0 error');
      setMessages(m=>[...m,{role:'assistant',content:'```bash\n'+lintOut.slice(0,1000)+'\n```',actions:[]}]);
      if (hasLintErr) {
        setTimeout(()=>sendMsg('Ada lint error. Fix semua error ini:\n```\n'+lintOut.slice(0,600)+'\n```'), 500);
      } else {
        setMessages(m=>[...m,{role:'assistant',content:'✅ Lint clean!',actions:[]}]);
      }
      setLoading(false);

    } else if (base==='/open') {
      const openUrl = parts.slice(1).join(' ').trim();
      if (!openUrl) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /open https://...',actions:[]}]); return; }
      window.open(openUrl, '_blank');
      setMessages(m=>[...m,{role:'assistant',content:'🌐 Membuka: '+openUrl,actions:[]}]);

    } else if (base==='/self-edit') {
      const task = parts.slice(1).join(' ').trim() || 'Fix bugs, hapus dead code, optimasi performa';
      setLoading(true);
      const appPath = folder + '/src/App.jsx';
      const r = await callServer({type:'read', path:appPath, from:1, to:50});
      if (!r.ok) {
        setMessages(m=>[...m,{role:'assistant',content:`❌ Tidak bisa baca \`${appPath}\`\n\nPastikan folder project sudah benar.`,actions:[]}]);
        setLoading(false); return;
      }
      setMessages(m=>[...m,{role:'assistant',content:`🔧 **Self-edit dimulai...**\n\nTask: _${task}_`,actions:[]}]);
      setLoading(false);
      await sendMsg(`MODE: SELF-EDIT\n\nTask: ${task}\n\nBaca src/App.jsx secara bertahap dengan read_file (from/to 100 baris per request). Setelah baca bagian yang relevan, gunakan write_file untuk patch minimal. Jangan tulis ulang seluruh file.`);

    } else if (base==='/search') {
      const query = parts.slice(1).join(' ').trim();
      if (!query) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /search <query>\nContoh: /search react useEffect cleanup',actions:[]}]); return; }
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'🔍 Searching: **'+query+'**...',actions:[]}]);
      const r = await callServer({type:'web_search', query});
      if (r.ok && r.data) {
        setMessages(m=>[...m,{role:'assistant',content:'🌐 **Web Search: '+query+'**\n\n'+r.data,actions:[]}]);
      } else {
        setMessages(m=>[...m,{role:'assistant',content:'❌ Search gagal: '+(r.data||'unknown error'),actions:[]}]);
      }
      setLoading(false);

    } else if (base==='/init') {
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'🌱 Menganalisis project untuk generate SKILL.md...',actions:[]}]);
      // Gather project info
      const [pkgR, structR, gitR, existR] = await Promise.all([
        callServer({type:'read', path:folder+'/package.json'}),
        callServer({type:'list', path:folder+'/src'}),
        callServer({type:'exec', path:folder, command:'git log --oneline -5 2>/dev/null || echo "no git"'}),
        callServer({type:'read', path:folder+'/SKILL.md'}),
      ]);
      if (existR.ok && existR.data) {
        setMessages(m=>[...m,{role:'assistant',content:'⚠️ SKILL.md sudah ada. Ketik `/init overwrite` untuk timpa.',actions:[]}]);
        if (parts[1] !== 'overwrite') { setLoading(false); return; }
      }
      const pkgInfo = pkgR.ok ? pkgR.data.slice(0,800) : 'tidak ada package.json';
      const srcFiles = structR.ok && Array.isArray(structR.data) ? structR.data.filter(f=>!f.isDir).map(f=>f.name).join(', ') : 'tidak diketahui';
      const gitLog = gitR.ok ? gitR.data.trim() : '';
      await sendMsg(`Generate SKILL.md untuk project ini. Analisis:

package.json:
\`\`\`
${pkgInfo}
\`\`\`
File di src/: ${srcFiles}
Git log: ${gitLog}

Buat SKILL.md yang berisi:
1. Tentang project (1-2 baris)
2. Stack & dependencies utama
3. Struktur file penting
4. Aturan coding project ini (naming convention, dll)
5. Command penting (dev, build, test)

Tulis ke SKILL.md menggunakan write_file. Format singkat, padat, max 50 baris.`);
      setLoading(false);

    } else if (base==='/tree') {
      setLoading(true);
      const depth = parseInt(parts[1]) || 2;
      const r = await callServer({type:'tree', path:folder, depth});
      setMessages(m=>[...m,{role:'assistant',content:'📁 **Tree (depth '+depth+'):**\n```\n'+(r.data||'(kosong)').slice(0,2000)+'\n```',actions:[]}]);
      setLoading(false);

    } else if (base==='/summarize') {
      const fromN = parseInt(parts[1]) || 0;
      const slice = fromN > 0 ? messages.slice(fromN) : messages.slice(1, -6);
      if (slice.length < 3) { setMessages(m=>[...m,{role:'assistant',content:'Tidak cukup pesan untuk disummarize.',actions:[]}]); return; }
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'📦 Summarizing '+slice.length+' pesan...',actions:[]}]);
      const ctrl = new AbortController(); abortRef.current = ctrl;
      try {
        const summary = await askCerebrasStream([
          {role:'system', content:'Buat ringkasan padat percakapan coding ini. Fokus: keputusan teknis, file yang diubah, bug fix, status. Maks 200 kata. Bahasa Indonesia.'},
          {role:'user', content:slice.map(m=>m.role+': '+(m.content||'').slice(0,300)).join('\n\n')},
        ], 'llama3.1-8b', ()=>{}, ctrl.signal, {maxTokens:512});
        const kept = fromN > 0 ? messages.slice(0, fromN) : [messages[0], ...messages.slice(-6)];
        setMessages([...kept, {role:'assistant',content:'📦 **Summary ('+slice.length+' pesan):**\n\n'+summary,actions:[]}]);
      } catch(e) { if(e.name!=='AbortError') setMessages(m=>[...m,{role:'assistant',content:'❌ '+e.message,actions:[]}]); }
      setLoading(false);

    } else if (base==='/scaffold') {
      const tpl = parts[1]?.toLowerCase();
      const validTemplates = ['react','node','express'];
      if (!tpl || !validTemplates.includes(tpl)) {
        setMessages(m=>[...m,{role:'assistant',content:'🏗 Usage: /scaffold react|node|express\n\n**react** — Vite + React 19\n**node** — Node.js CLI app\n**express** — Express REST API',actions:[]}]);
        return;
      }
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'🏗 Scaffolding **'+tpl+'** project di '+folder+'...',actions:[]}]);
      await sendMsg('Scaffold project '+tpl+' di folder '+folder+'. Buat struktur file lengkap dengan write_file: package.json, file utama, README.md singkat. Pakai dependencies terbaru 2025. Langsung buat tanpa tanya.');
      setLoading(false);

    } else if (base==='/test') {
      const targetPath = parts.slice(1).join(' ').trim();
      const filePath = targetPath
        ? folder + '/' + targetPath.replace(/^\//, '')
        : selectedFile;

      if (!filePath) {
        setMessages(m=>[...m,{role:'assistant',content:'Usage: /test atau /test src/api.js\nBuka file dulu, atau sebutkan path-nya.',actions:[]}]);
        return;
      }
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'🧪 Generating tests untuk **'+filePath.split('/').pop()+'**...',actions:[]}]);
      const r = await callServer({type:'read', path: filePath});
      if (!r.ok) {
        setMessages(m=>[...m,{role:'assistant',content:'❌ Tidak bisa baca file: '+filePath,actions:[]}]);
        setLoading(false); return;
      }
      const ext = filePath.split('.').pop();
      const testPath = filePath.replace(/\.(jsx?|tsx?)$/, '.test.$1').replace(/(src\/)/, '$1');
      await sendMsg(
        'Generate unit tests untuk file ini:\n\nFile: ' + filePath + '\n```' + ext + '\n' + r.data.slice(0, 4000) + '\n```\n\n' +
        'Buat test file di: ' + testPath + '\n' +
        'Gunakan Vitest (import { describe, it, expect } from "vitest"). ' +
        'Cover: happy path, edge case, error case. ' +
        'Langsung write_file, jangan tanya.'
      );
      setLoading(false);

    }
  }, [model, folder, branch, messages, selectedFile, fileContent, notes, memories, skills,
      thinkingEnabled, effort, loopActive, loopIntervalRef, agentMemory, splitView,
      pushToTalk, sessionName, sessionColor, fileWatcherActive, fileWatcherInterval]);

  return { handleSlashCommand };
}
