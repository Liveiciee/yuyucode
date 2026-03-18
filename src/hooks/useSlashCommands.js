import { useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { callServer } from '../api.js';
import { MODELS } from '../constants.js';
import { askCerebrasStream } from '../api.js';
import { countTokens } from '../utils.js';
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
  // functions
  sendMsg, compactContext, saveCheckpoint, exportChat, generateCommitMsg,
  runTests, browseTo, runAgentSwarm, callAI, addHistory, runHooks,
  // refs
  abortRef,
}) {
  const handleSlashCommand = useCallback(async (cmd) => {
    const parts = cmd.trim().split(' ');
    const base = parts[0];

    if (base==='/model') {
      const next = model===MODELS[0].id ? MODELS[1].id : MODELS[0].id;
      setModel(next); Preferences.set({key:'yc_model',value:next});
      setMessages(m=>[...m,{role:'assistant',content:'🔄 Model diganti ke: '+MODELS.find(m=>m.id===next)?.label,actions:[]}]);

    } else if (base==='/compact') {
      await compactContext();

    } else if (base==='/checkpoint') {
      saveCheckpoint();

    } else if (base==='/restore') {
      setShowCheckpoints(true);

    } else if (base==='/cost') {
      const total = messages.reduce((a,m)=>a+m.content.length,0);
      const tokens = Math.round(total/4);
      setMessages(m=>[...m,{role:'assistant',content:`💰 Estimasi token: ~${tokens}tk | ~${messages.length} pesan | Cerebras gratis jadi $0 😄`,actions:[]}]);

    } else if (base==='/review') {
      if (!selectedFile) { setMessages(m=>[...m,{role:'assistant',content:'Buka file dulu Papa~',actions:[]}]); return; }
      await sendMsg('Lakukan code review menyeluruh pada file '+selectedFile+'. Cari: bugs potensial, performance issues, security issues, dan saran improvement.');

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
      const r = await callServer({type:'read', path:selectedFile});
      if (!r.ok) return;
      const imports = [];
      const regex = /(?:import|require)\s+.*?['"](.+?)['"]/g;
      let m;
      while ((m=regex.exec(r.data))!==null) imports.push(m[1]);
      setDepGraph({file:selectedFile.split('/').pop(), imports});
      setShowDepGraph(true);

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
      const r = await callServer({type:'mcp',tool:'sqlite',action:'query',params:{dbPath:folder+'/data.db',query:q}});
      setMessages(m=>[...m,{role:'assistant',content:'🗄 Query result:\n```\n'+(r.data||'kosong')+'\n```',actions:[]}]);
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
      setMessages(m=>[...m,{role:'assistant',content:'🔍 Indexing...',actions:[]}]);
      const idxR = await callServer({type:'list', path:folder+'/src'});
      const idxCount = idxR.ok && Array.isArray(idxR.data) ? idxR.data.filter(f=>!f.isDir).length : 0;
      setMessages(m=>[...m,{role:'assistant',content:'✅ Index: '+idxCount+' files di src/~',actions:[]}]);
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
      setMessages(m=>[...m,{role:'assistant',content:'🧠 Extended thinking '+(next?'aktif':'nonaktif'),actions:[]}]);

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
      const id = await runBackgroundAgent(task, folder, callAI);
      setMessages(m=>[...m,{role:'assistant',content:'🤖 Background agent: '+task+'\nID: '+id,actions:[]}]);

    } else if (base==='/bgstatus') {
      const agents = getBgAgents();
      const statusLines = agents.map(a=>'['+a.status+'] '+a.id+'\n'+a.task+(a.log?'\n'+a.log.slice(-1).join(''):'')).join('\n\n');
      setMessages(m=>[...m,{role:'assistant',content:'🤖 **Background Agents:**\n\n'+statusLines,actions:[]}]);

    } else if (base==='/bgmerge') {
      const id = parts[1]?.trim();
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'🔀 Merging '+id+'...',actions:[]}]);
      const result = await mergeBackgroundAgent(id, folder);
      setMessages(m=>[...m,{role:'assistant',content:result.ok?'✅ '+result.msg:'❌ '+result.msg,actions:[]}]);
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
      if (!batchCmd) { setMessages(m=>[...m,{role:'assistant',content:'Usage: /batch <command>\nContoh: /batch tambah console.log di setiap fungsi\nAkan dijalankan ke semua file di src/',actions:[]}]); return; }
      setLoading(true);
      setMessages(m=>[...m,{role:'assistant',content:'📦 Batch operation: **'+batchCmd+'**\nMengambil daftar file...',actions:[]}]);
      const listR = await callServer({type:'list', path:folder+'/src'});
      if (!listR.ok) { setMessages(m=>[...m,{role:'assistant',content:'❌ Tidak bisa list src/',actions:[]}]); setLoading(false); return; }
      const files = (listR.data||[]).filter(f=>!f.isDir && (f.name.endsWith('.jsx')||f.name.endsWith('.js')||f.name.endsWith('.ts')));
      await sendMsg('BATCH OPERATION pada '+files.length+' file di src/:\n'+files.map(f=>f.name).join(', ')+'\n\nTask: '+batchCmd+'\n\nUntuk setiap file, gunakan read_file lalu write_file jika perlu perubahan. Lakukan per file satu-satu.');
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
        setMessages(m=>[...m,{role:'assistant',content:'👁 File watcher aktif. Yuyu akan notify kalau ada file yang berubah dari luar app (check tiap 30 detik).',actions:[]}]);
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
    }
  }, [model, folder, branch, messages, selectedFile, fileContent, notes, memories, skills,
      thinkingEnabled, effort, loopActive, loopIntervalRef, agentMemory, splitView,
      pushToTalk, sessionName, sessionColor, fileWatcherActive, fileWatcherInterval]);

  return { handleSlashCommand };
}
