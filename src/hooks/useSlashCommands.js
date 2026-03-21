import { useCallback, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { callServer, askCerebrasStream } from '../api.js';
import { MODELS } from '../constants.js';
import { countTokens, parseActions } from '../utils.js';
import { generatePlan, runBackgroundAgent, mergeBackgroundAgent, tokenTracker, saveSession, loadSessions, rewindMessages } from '../features.js';

export function useSlashCommands({
  // state
  model, folder, branch, messages, selectedFile, fileContent, notes,
  memories, checkpoints: _checkpoints, skills, thinkingEnabled, effort, loopActive,
  loopIntervalRef, agentMemory, splitView, pushToTalk, sessionName,
  sessionColor, fileWatcherActive, fileWatcherInterval,
  // setters
  setModel, setMessages, setFolder: _setFolder, setFolderInput: _setFolderInput, setLoading, setStreaming: _setStreaming,
  setThinkingEnabled, setEffort, setLoopActive, setLoopIntervalRef,
  setSplitView, setPushToTalk, setSessionName, setSessionColor,
  setSkills: _setSkills, setFileWatcherActive, setFileWatcherInterval, setFileSnapshots,
  setYuyuMd: _setYuyuMd,
  setPlanSteps, setPlanTask, setAgentMemory, setSessionList,
  setShowCheckpoints, setShowMemory: _setShowMemory, setShowMCP, setShowGitHub, setShowDeploy,
  setShowSessions, setShowPermissions, setShowPlugins, setShowConfig,
  setShowCustomActions, setShowFileHistory, setShowThemeBuilder,
  setShowDepGraph,
  setDepGraph, setFontSize,
  setShowMergeConflict, setMergeConflictData,
  setShowSkills, setShowBgAgents,
  // functions
  sendMsg, compactContext, saveCheckpoint, exportChat, searchMessages,
  setGracefulStop, loading,
  editHistory, setEditHistory, pinnedFiles, togglePin,
  browseTo, runAgentSwarm, callAI, abTest,
  growth,
  sendNotification, haptic,
  // refs
  abortRef,
}) {
  const activeDbRef = useRef({});

  // ── Individual command handlers ────────────────────────────────────────────

  const handleModel = useCallback(() => {
    const idx = MODELS.findIndex(m => m.id === model);
    const next = MODELS[(idx + 1) % MODELS.length];
    setModel(next.id);
    Preferences.set({ key: 'yc_model', value: next.id });
    setMessages(m => [...m, { role: 'assistant', content: '🔄 Model: **' + next.label + '** (' + ((idx + 1) % MODELS.length + 1) + '/' + MODELS.length + ')', actions: [] }]);
  }, [model, setModel, setMessages]);

  const handleCompact = useCallback(async (parts) => {
    if (parts[1] === 'force') {
      await compactContext();
    } else {
      setMessages(m => [...m, { role: 'assistant', content: '⚠️ **/compact** pakai recursive summary — accuracy bisa turun di sesi panjang.\n\n💡 Coba **/handoff** — generate session brief yang structured dan disimpan ke `.yuyu/handoff.md`, lalu di-load otomatis di sesi berikutnya.\n\nMau tetap compact? Ketik `/compact force`', actions: [] }]);
    }
  }, [compactContext, setMessages]);

  const handleHandoff = useCallback(async () => {
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '📋 Generating session handoff...', actions: [] }]);
    const recentMsgs = messages.slice(-20);
    const ctrl2 = new AbortController();
    let handoffMd = '';
    try {
      await askCerebrasStream([
        { role: 'system', content: 'You are a technical writer. Output ONLY markdown, no preamble.' },
        { role: 'user', content: `Based on this conversation, write a session handoff for the next Claude session.\nFormat EXACTLY as:\n# YuyuCode — Session Handoff\n> Last updated: ${new Date().toISOString().split('T')[0]}\n\n## Completed this session\n- (bullet list of what was done)\n\n## In progress / pending\n- (what was started but not finished)\n\n## Architectural decisions made\n- (any important decisions or patterns established)\n\n## Known issues\n- (bugs or problems discovered)\n\n## Next session priorities\n1. (ordered list)\n\n## Hot files touched recently\n- (file paths that were changed)\n\nConversation:\n${recentMsgs.map(m => m.role + ': ' + (m.content || '').slice(0, 400)).join('\n\n')}` },
      ], 'llama3.1-8b', chunk => { handoffMd = chunk; }, ctrl2.signal);

      if (folder && handoffMd) {
        const handoffPath = folder + '/.yuyu/handoff.md';
        await callServer({ type: 'mkdir', path: folder + '/.yuyu' });
        await callServer({ type: 'write', path: handoffPath, content: handoffMd });
        setMessages(m => [...m, { role: 'assistant', content: '✅ **Handoff saved** to `.yuyu/handoff.md`\n\nPaste this at the start of your next Claude session, or it will be auto-loaded by `gatherProjectContext`.\n\n---\n\n' + handoffMd, actions: [] }]);
      } else {
        setMessages(m => [...m, { role: 'assistant', content: '📋 **Session Handoff:**\n\n' + handoffMd + '\n\n> Tip: set a project folder to auto-save.', actions: [] }]);
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: '❌ Handoff gagal: ' + e.message, actions: [] }]);
    } finally {
      setLoading(false);
    }
  }, [folder, messages, setLoading, setMessages]);

  const handleReview = useCallback(async (parts) => {
    const targetPath = parts.slice(1).join(' ').trim();
    if (targetPath === '--all' || targetPath === '-a') {
      setLoading(true);
      setMessages(m => [...m, { role: 'assistant', content: '🔍 Menganalisis semua file yang berubah vs HEAD...', actions: [] }]);
      const diffR = await callServer({ type: 'exec', path: folder, command: 'git diff --name-only HEAD 2>/dev/null' });
      const changedFiles = (diffR.ok ? diffR.data : '')
        .trim().split('\n').filter(f => f && /\.(js|jsx|ts|tsx|css|json)$/.test(f));
      if (changedFiles.length === 0) {
        setMessages(m => [...m, { role: 'assistant', content: '✅ Tidak ada file yang berubah vs HEAD.', actions: [] }]);
        setLoading(false);
        return;
      }
      const toReview = changedFiles.slice(0, 8);
      const reads = await Promise.all(toReview.map(f => callServer({ type: 'read', path: folder + '/' + f })));
      const fileBlocks = toReview.map((f, i) => {
        const content = reads[i]?.ok ? reads[i].data.slice(0, 2500) : '[tidak bisa dibaca]';
        const ext = f.split('.').pop();
        return '### ' + f + '\n```' + ext + '\n' + content + '\n```';
      }).join('\n\n');
      setLoading(false);
      await sendMsg('🔍 **Code Review — ' + toReview.length + ' file changed vs HEAD**\n\nReview setiap file di bawah. Untuk setiap file cari:\n1. 🐛 Bugs potensial\n2. ⚡ Performance issues\n3. 🔒 Security issues\n4. 🧪 Missing error handling\n5. 💡 Saran improvement\n\nFormat output: per-file dengan severity (🔴 High / 🟡 Medium / 🟢 Low).\n\n' + fileBlocks);
    } else if (targetPath) {
      setLoading(true);
      const r = await callServer({ type: 'read', path: folder + '/' + targetPath.replace(/^\//, '') });
      setLoading(false);
      if (!r.ok) { setMessages(m => [...m, { role: 'assistant', content: '❌ File tidak ditemukan: ' + targetPath, actions: [] }]); return; }
      await sendMsg('Lakukan code review menyeluruh pada file ' + targetPath + '. Cari: bugs potensial, performance issues, security issues, dan saran improvement.\n\n```\n' + r.data.slice(0, 5000) + '\n```');
    } else if (selectedFile) {
      const reviewContent = fileContent ? '\n\n```\n' + fileContent.slice(0, 5000) + '\n```' : '';
      await sendMsg('Lakukan code review menyeluruh pada file ' + selectedFile + '. Cari: bugs potensial, performance issues, security issues, dan saran improvement.' + reviewContent);
    } else {
      setMessages(m => [...m, { role: 'assistant', content: '**`/review`** — Code review\n\n- `/review` — review file yang terbuka\n- `/review src/api.js` — review file spesifik\n- `/review --all` — review semua file changed vs HEAD', actions: [] }]);
    }
  }, [folder, selectedFile, fileContent, setLoading, setMessages, sendMsg]);

  const handleSearch = useCallback((parts) => {
    const q = parts.slice(1).join(' ');
    if (!q) {
      setMessages(m => [...m, { role: 'assistant', content: '🔍 Usage: /search <query>\n\nContoh: /search "useAgentLoop"', actions: [] }]);
      return;
    }
    const results = searchMessages(q);
    if (!results || results.length === 0) {
      setMessages(m => [...m, { role: 'assistant', content: '🔍 Tidak ada hasil untuk "' + q + '"', actions: [] }]);
    } else {
      const preview = results.slice(0, 5).map((r, _i) =>
        `**[${r.idx + 1}]** ${r.role === 'user' ? '👤 Kamu' : '🌸 Yuyu'}: ${(r.content || '').slice(0, 100)}${r.content?.length > 100 ? '...' : ''}`
      ).join('\n\n');
      setMessages(m => [...m, { role: 'assistant', content: `🔍 **${results.length} hasil** untuk "${q}":\n\n${preview}`, actions: [] }]);
    }
  }, [searchMessages, setMessages]);

  const handleDiff = useCallback(async (parts) => {
    const range = parts.slice(1).join(' ').trim();
    setLoading(true);
    const cmd = range ? `git diff ${range} --stat` : 'git diff HEAD --stat';
    const r = await callServer({ type: 'exec', path: folder, command: cmd });
    setLoading(false);
    if (!r.ok || !r.data?.trim()) {
      setMessages(m => [...m, { role: 'assistant', content: '±  Tidak ada diff.\n\nUsage: `/diff` (working tree) atau `/diff v3.0..v3.1`', actions: [] }]);
      return;
    }
    const lines = (r.data || '').split('\n').length;
    let full = '';
    if (lines < 30) {
      const rd = await callServer({ type: 'exec', path: folder, command: range ? `git diff ${range}` : 'git diff HEAD' });
      if (rd.ok) full = '\n```diff\n' + rd.data.slice(0, 3000) + '\n```';
    }
    setMessages(m => [...m, { role: 'assistant', content: '± **Git diff** ' + (range || 'HEAD') + ':\n```\n' + r.data + '\n```' + full, actions: [] }]);
  }, [folder, setLoading, setMessages]);

  const handleDeps = useCallback(async () => {
    if (!selectedFile) { setMessages(m => [...m, { role: 'assistant', content: 'Buka file dulu Papa~', actions: [] }]); return; }
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '🕸 Building dep graph (2 levels)...', actions: [] }]);
    const importRegex = /(?:import|require)\s+.*?['"](.+?)['"]/g;
    const nodesMap = {};
    const edges = [];

    async function parseFile(path, depth) {
      if (depth > 2 || nodesMap[path]) return;
      const r = await callServer({ type: 'read', path });
      if (!r.ok) return;
      const label = path.split('/').pop().replace(/\.(jsx?|tsx?)$/, '');
      nodesMap[path] = { id: path, label, type: depth === 0 ? 'root' : 'local' };
      const src = r.data || '';
      let m2;
      const re = new RegExp(importRegex.source, 'g');
      while ((m2 = re.exec(src)) !== null) {
        const imp = m2[1];
        if (!imp.startsWith('.')) {
          if (!nodesMap[imp]) nodesMap[imp] = { id: imp, label: imp.split('/').pop(), type: 'external' };
          edges.push({ source: path, target: imp });
        } else {
          const base2 = path.split('/').slice(0, -1).join('/');
          const candidates = [imp, imp + '.jsx', imp + '.js', imp + '.ts', imp + '.tsx']
            .map(s => base2 + '/' + s.replace('./', '/').replace('//', '/'))
            .concat([base2 + '/' + imp.replace('./', '').replace('//', '/')]);
          for (const cand of candidates) {
            const cr = await callServer({ type: 'read', path: cand });
            if (cr.ok) {
              if (!nodesMap[cand]) await parseFile(cand, depth + 1);
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
    setMessages(m => [...m, { role: 'assistant', content: `🕸 Dep graph: **${nodes.length}** nodes, **${edges.length}** edges`, actions: [] }]);
    setLoading(false);
  }, [selectedFile, setLoading, setMessages, setDepGraph, setShowDepGraph]);

  const handleDb = useCallback(async (parts) => {
    const q = parts.slice(1).join(' ');
    if (!q) { setMessages(m => [...m, { role: 'assistant', content: 'Usage: /db SELECT * FROM table', actions: [] }]); return; }
    setLoading(true);
    const listR = await callServer({ type: 'list', path: folder });
    const dbFiles = listR.ok && Array.isArray(listR.data)
      ? listR.data.filter(f => !f.isDir && f.name.endsWith('.db')).map(f => folder + '/' + f.name)
      : [];
    if (parts[1] === 'use' && parts[2]) {
      activeDbRef.current[folder] = folder + '/' + parts[2];
      setMessages(m => [...m, { role: 'assistant', content: '🗄 DB aktif: **' + parts[2] + '** (sesi ini). Query berikutnya pakai file ini.', actions: [] }]);
      setLoading(false);
      return;
    }
    let dbPath = activeDbRef.current[folder] || folder + '/data.db';
    if (!activeDbRef.current[folder] && dbFiles.length === 1) {
      dbPath = dbFiles[0];
    } else if (!activeDbRef.current[folder] && dbFiles.length > 1) {
      setMessages(m => [...m, { role: 'assistant', content: '🗄 Ditemukan ' + dbFiles.length + ' DB: ' + dbFiles.map(f => f.split('/').pop()).join(', ') + '\nUsage: /db <query> — pakai `/db use <nama.db>` untuk pilih.\nAktif: ' + dbPath.split('/').pop(), actions: [] }]);
    }
    const r = await callServer({ type: 'mcp', tool: 'sqlite', action: 'query', params: { dbPath, query: q } });
    setMessages(m => [...m, { role: 'assistant', content: '🗄 **' + dbPath.split('/').pop() + '** → `' + q + '`\n```\n' + (r.data || 'kosong') + '\n```', actions: [] }]);
    setLoading(false);
  }, [folder, setLoading, setMessages]);

  const handleStatus = useCallback(async () => {
    setLoading(true);
    const [ping, git, nodeV, disk] = await Promise.all([
      callServer({ type: 'ping' }),
      callServer({ type: 'exec', path: folder, command: 'git status --short 2>&1 | head -5' }),
      callServer({ type: 'exec', path: folder, command: 'node --version 2>&1' }),
      callServer({ type: 'exec', path: folder, command: 'df -h . 2>&1 | tail -1' }),
    ]);
    const mx = MODELS.find(x => x.id === model);
    setMessages(prev => [...prev, { role: 'assistant', content: '📊 **Status**\n**Server:** ' + (ping.ok ? '✅ Online' : '❌ Offline') + '\n**Model:** ' + (mx?.label || model) + '\n**Git:** ' + (git.data || '').trim().slice(0, 60) + '\n**Node:** ' + (nodeV.data || '').trim() + '\n**Disk:** ' + (disk.data || '').trim(), actions: [] }]);
    setLoading(false);
  }, [folder, model, setLoading, setMessages]);

  const handlePin = useCallback((parts) => {
    const target = parts.slice(1).join(' ').trim();
    if (!target) {
      const pins = (pinnedFiles || []);
      if (pins.length === 0) {
        setMessages(m => [...m, { role: 'assistant', content: '📌 Belum ada file yang di-pin.\n\nUsage: `/pin src/api.js` — file ini akan selalu masuk context.', actions: [] }]);
      } else {
        setMessages(m => [...m, { role: 'assistant', content: '📌 **Pinned files** (selalu masuk context):\n' + pins.map(p => '- `' + p + '`').join('\n') + '\n\n`/pin <file>` untuk tambah, `/unpin <file>` untuk hapus.', actions: [] }]);
      }
    } else {
      togglePin(folder + '/' + target.replace(/^\//, ''));
      const isNowPinned = !(pinnedFiles || []).includes(folder + '/' + target.replace(/^\//, ''));
      setMessages(m => [...m, { role: 'assistant', content: (isNowPinned ? '📌 Pinned' : '📌 Unpinned') + ': `' + target + '`\n' + (isNowPinned ? 'File ini akan selalu masuk context agent loop.' : 'File dikeluarkan dari pinned context.'), actions: [] }]);
    }
  }, [folder, pinnedFiles, togglePin, setMessages]);

  const handleUndo = useCallback(async (parts) => {
    const n = parseInt(parts[1]) || 1;
    const history = editHistory || [];
    if (history.length === 0) {
      setMessages(m => [...m, { role: 'assistant', content: '⏪ Tidak ada edit yang bisa di-undo.', actions: [] }]);
      return;
    }
    const toUndo = history.slice(-n);
    const undone = [];
    for (const item of toUndo) {
      const r = await callServer({ type: 'write', path: item.path, content: item.content });
      if (r.ok) undone.push(item.path.split('/').pop());
    }
    setEditHistory(h => h.slice(0, -n));
    setMessages(m => [...m, { role: 'assistant', content: `⏪ **Undo ${undone.length} edit:** ${undone.join(', ')}\n\nFile dikembalikan ke versi sebelumnya.`, actions: [] }]);
  }, [editHistory, setEditHistory, setMessages]);

  const handleLoop = useCallback(async (parts) => {
    const args = parts.slice(1).join(' ').trim();
    if (!args) {
      if (loopActive) {
        clearInterval(loopIntervalRef);
        setLoopIntervalRef(null);
        setLoopActive(false);
        setMessages(m => [...m, { role: 'assistant', content: '⏹ Loop dihentikan.', actions: [] }]);
      } else {
        setMessages(m => [...m, { role: 'assistant', content: 'Usage: /loop <interval> <command>\nContoh: /loop 5m git status\nInterval: 1m 5m 10m 30m 1h', actions: [] }]);
      }
      return;
    }
    const lm = args.match(/^(\d+)(m|h)\s+(.+)/);
    if (!lm) { setMessages(m => [...m, { role: 'assistant', content: 'Format: /loop <interval> <cmd>. Contoh: /loop 5m git status', actions: [] }]); return; }
    const loopMs = parseInt(lm[1]) * (lm[2] === 'h' ? 3600000 : 60000);
    const loopCmd = lm[3];
    if (loopActive) clearInterval(loopIntervalRef);
    setLoopActive(true);
    setMessages(m => [...m, { role: 'assistant', content: '🔄 Loop aktif: **' + loopCmd + '** setiap ' + lm[1] + (lm[2] === 'h' ? ' jam' : ' menit') + '. /loop untuk stop.', actions: [] }]);
    const iv = setInterval(async () => {
      const r = await callServer({ type: 'exec', path: folder, command: loopCmd });
      setMessages(m => [...m, { role: 'assistant', content: '🔄 Loop [' + new Date().toLocaleTimeString('id') + ']:\n```bash\n' + (r.data || '').slice(0, 500) + '\n```', actions: [] }]);
    }, loopMs);
    setLoopIntervalRef(iv);
  }, [folder, loopActive, loopIntervalRef, setLoopActive, setLoopIntervalRef, setMessages]);

  const handleAmemory = useCallback((parts) => {
    const sub = parts[1]?.toLowerCase();
    const scope = ['user', 'project', 'local'].includes(parts[2]) ? parts[2] : 'user';
    const content = parts.slice(3).join(' ').trim();
    if (sub === 'add' && content) {
      const next = { ...agentMemory, [scope]: [...(agentMemory[scope] || []), { text: content, ts: new Date().toLocaleDateString('id'), id: Date.now() }] };
      setAgentMemory(next);
      Preferences.set({ key: 'yc_agent_memory', value: JSON.stringify(next) });
      setMessages(m => [...m, { role: 'assistant', content: '🧠 Memory [' + scope + ']: ' + content, actions: [] }]);
    } else if (sub === 'clear') {
      const next = { ...agentMemory, [scope]: [] };
      setAgentMemory(next);
      Preferences.set({ key: 'yc_agent_memory', value: JSON.stringify(next) });
      setMessages(m => [...m, { role: 'assistant', content: '🧠 Memory [' + scope + '] dihapus.', actions: [] }]);
    } else {
      const all = ['user', 'project', 'local'].map(s =>
        '**' + s + '** (' + (agentMemory[s] || []).length + '):\n' +
        ((agentMemory[s] || []).map(mx => '• ' + mx.text + (mx.ts ? ' (' + mx.ts + ')' : '')).join('\n') || 'kosong')
      ).join('\n\n');
      setMessages(m => [...m, { role: 'assistant', content: '🧠 **Agent Memory:**\n\n' + all + '\n\nUsage: /amemory add user|project|local <teks>\n/amemory clear user|project|local', actions: [] }]);
    }
  }, [agentMemory, setAgentMemory, setMessages]);

  const handleBatch = useCallback(async (parts) => {
    const batchCmd = parts.slice(1).join(' ').trim();
    if (!batchCmd) { setMessages(m => [...m, { role: 'assistant', content: 'Usage: /batch <command>\nContoh: /batch tambah JSDoc ke setiap fungsi\nAkan dijalankan ke semua file di src/', actions: [] }]); return; }
    setLoading(true);
    const listR = await callServer({ type: 'list', path: folder + '/src' });
    if (!listR.ok) { setMessages(m => [...m, { role: 'assistant', content: '❌ Tidak bisa list src/', actions: [] }]); setLoading(false); return; }
    const files = (listR.data || []).filter(f => !f.isDir && (f.name.endsWith('.jsx') || f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.tsx')));
    setMessages(m => [...m, { role: 'assistant', content: '📦 **Batch: ' + batchCmd + '**\n' + files.length + ' file akan dianalisis (baca penuh)...', actions: [] }]);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const allWrites = [];
    let skipped = 0;
    let failed = 0;
    for (const f of files) {
      if (ctrl.signal.aborted) break;
      const filePath = folder + '/src/' + f.name;
      const r = await callServer({ type: 'read', path: filePath });
      if (!r.ok) { failed++; continue; }
      try {
        const reply = await callAI([
          { role: 'system', content: 'Kamu adalah code editor. Task: ' + batchCmd + '\nFile: ' + filePath + '\nGunakan write_file action untuk apply perubahan. Kalau tidak ada yang perlu diubah, balas hanya kata SKIP.' },
          { role: 'user', content: '```\n' + r.data.slice(0, 6000) + '\n```' },
        ], () => { }, ctrl.signal);
        if (reply.trim().toUpperCase().startsWith('SKIP')) { skipped++; continue; }
        const writes = parseActions(reply).filter(a => a.type === 'write_file');
        writes.forEach(w => { if (!w.path.startsWith('/')) w.path = folder + '/src/' + w.path.replace(/^\.?\//, ''); });
        allWrites.push(...writes);
        setMessages(m => [...m, { role: 'assistant', content: '  ' + (writes.length > 0 ? '✅' : '⏭') + ' ' + f.name + (writes.length > 0 ? ' — ' + writes.length + ' perubahan' : ''), actions: [] }]);
      } catch (e) {
        if (e.name === 'AbortError') break;
        failed++;
        setMessages(m => [...m, { role: 'assistant', content: '  ❌ ' + f.name + ': ' + e.message.slice(0, 60), actions: [] }]);
      }
    }
    if (allWrites.length > 0) {
      setMessages(m => [...m, { role: 'assistant', content: '📦 **Batch siap — menunggu approval!**\n' + allWrites.length + ' perubahan di ' + new Set(allWrites.map(w => w.path.split('/').pop())).size + ' file (' + skipped + ' di-skip, ' + failed + ' gagal).\nReview dan approve di bawah~', actions: allWrites.map(a => ({ ...a, executed: false })) }]);
    } else {
      setMessages(m => [...m, { role: 'assistant', content: '📦 Batch selesai — tidak ada perubahan diperlukan (' + skipped + ' di-skip, ' + failed + ' gagal).', actions: [] }]);
    }
    setLoading(false);
  }, [folder, abortRef, callAI, setLoading, setMessages]);

  const handleRules = useCallback(async (parts) => {
    const subCmd = parts[1];
    if (!subCmd || subCmd === 'show') {
      setLoading(true);
      const r = await callServer({ type: 'read', path: folder + '/YUYU.md' });
      if (r.ok && r.data) {
        setMessages(m => [...m, { role: 'assistant', content: '📋 **YUYU.md** — Project rules aktif:\n\n```markdown\n' + r.data + '\n```\n\n*Edit: `/rules add "..."` atau `/rules edit`*', actions: [] }]);
      } else {
        setMessages(m => [...m, { role: 'assistant', content: '📋 **YUYU.md belum ada.**\n\nBuat dengan `/rules add "rule pertama kamu"` atau `/rules init` untuk template lengkap.', actions: [] }]);
      }
      setLoading(false);
    } else if (subCmd === 'add') {
      await handleRulesAdd(parts);
    } else if (subCmd === 'clear') {
      await handleRulesClear();
    } else if (subCmd === 'init') {
      await handleRulesInit(parts);
    } else if (subCmd === 'edit') {
      await sendMsg('Baca YUYU.md lalu bantu aku edit. Tampilkan isinya dulu.');
    } else {
      setMessages(m => [...m, { role: 'assistant', content: '**`/rules`** — Manage project rules (YUYU.md)\n\n- `/rules` — lihat rules aktif\n- `/rules add "..."` — tambah rule\n- `/rules clear` — hapus semua\n- `/rules init` — generate dari project\n- `/rules edit` — edit via AI', actions: [] }]);
    }
  }, [folder, setLoading, setMessages, sendMsg]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRulesAdd = useCallback(async (parts) => {
    const ruleText = parts.slice(2).join(' ').replace(/^["']|["']$/g, '');
    if (!ruleText) { setMessages(m => [...m, { role: 'assistant', content: 'Usage: `/rules add "selalu pakai TypeScript strict mode"`', actions: [] }]); return; }
    setLoading(true);
    const existing = await callServer({ type: 'read', path: folder + '/YUYU.md' });
    const currentContent = (existing.ok && existing.data) ? existing.data : '# YUYU.md — Project Rules\n\n## Rules\n';
    const newContent = currentContent.includes('## Rules')
      ? currentContent.replace(/## Rules\n/, '## Rules\n- ' + ruleText + '\n')
      : currentContent.trimEnd() + '\n\n## Rules\n- ' + ruleText + '\n';
    const wr = await callServer({ type: 'write', path: folder + '/YUYU.md', content: newContent });
    if (wr.ok) {
      setMessages(m => [...m, { role: 'assistant', content: '✅ Rule ditambahkan ke YUYU.md:\n> `' + ruleText + '`\n\nAktif di sesi berikutnya dan setiap agent loop.', actions: [] }]);
    } else {
      setMessages(m => [...m, { role: 'assistant', content: '❌ Gagal tulis YUYU.md: ' + (wr.data || '?'), actions: [] }]);
    }
    setLoading(false);
  }, [folder, setLoading, setMessages]);

  const handleRulesClear = useCallback(async () => {
    setLoading(true);
    const wr = await callServer({ type: 'write', path: folder + '/YUYU.md', content: '# YUYU.md — Project Rules\n\n## Rules\n' });
    setMessages(m => [...m, { role: 'assistant', content: wr.ok ? '🗑 YUYU.md di-reset. Rules lama dihapus.' : '❌ Gagal reset: ' + (wr.data || '?'), actions: [] }]);
    setLoading(false);
  }, [folder, setLoading, setMessages]);

  const handleRulesInit = useCallback(async (parts) => {
    setLoading(true);
    const existR = await callServer({ type: 'read', path: folder + '/YUYU.md' });
    if (existR.ok && existR.data && parts[2] !== 'overwrite') {
      setMessages(m => [...m, { role: 'assistant', content: '⚠️ YUYU.md sudah ada. Ketik `/rules init overwrite` untuk timpa.', actions: [] }]);
      setLoading(false);
      return;
    }
    await sendMsg('Buat YUYU.md di root project ini. Analisis codebase sebentar (tree + package.json), lalu tulis YUYU.md berisi:\n\n## Coding Standards\n(naming convention, strict TS, dll)\n\n## Architecture Decisions\n(state management, file structure, dll)\n\n## Forbidden Patterns\n(anti-patterns yang harus dihindari)\n\n## Preferred Libraries\n(library yang sudah dipilih untuk tiap kategori)\n\n## Commands\n(dev, build, test, deploy)\n\nSingkat, padat, max 60 baris. Tulis dengan write_file ke YUYU.md.');
    setLoading(false);
  }, [folder, setLoading, setMessages, sendMsg]);

  const handleInit = useCallback(async (parts) => {
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '🌱 Menganalisis project untuk generate SKILL.md...', actions: [] }]);
    const [pkgR, structR, gitR, existR] = await Promise.all([
      callServer({ type: 'read', path: folder + '/package.json' }),
      callServer({ type: 'list', path: folder + '/src' }),
      callServer({ type: 'exec', path: folder, command: 'git log --oneline -5 2>/dev/null || echo "no git"' }),
      callServer({ type: 'read', path: folder + '/SKILL.md' }),
    ]);
    if (existR.ok && existR.data && parts[1] !== 'overwrite') {
      setMessages(m => [...m, { role: 'assistant', content: '⚠️ SKILL.md sudah ada. Ketik `/init overwrite` untuk timpa.', actions: [] }]);
      setLoading(false);
      return;
    }
    const pkgInfo = pkgR.ok ? pkgR.data.slice(0, 800) : 'tidak ada package.json';
    const srcFiles = structR.ok && Array.isArray(structR.data) ? structR.data.filter(f => !f.isDir).map(f => f.name).join(', ') : 'tidak diketahui';
    const gitLog = gitR.ok ? gitR.data.trim() : '';
    await sendMsg(`Generate SKILL.md untuk project ini. Analisis:\n\npackage.json:\n\`\`\`\n${pkgInfo}\n\`\`\`\nFile di src/: ${srcFiles}\nGit log: ${gitLog}\n\nBuat SKILL.md yang berisi:\n1. Tentang project (1-2 baris)\n2. Stack & dependencies utama\n3. Struktur file penting\n4. Aturan coding project ini (naming convention, dll)\n5. Command penting (dev, build, test)\n\nTulis ke SKILL.md menggunakan write_file. Format singkat, padat, max 50 baris.`);
    setLoading(false);
  }, [folder, setLoading, setMessages, sendMsg]);

  const handleBgMerge = useCallback(async (parts) => {
    const id = parts[1]?.trim();
    if (!id) { setMessages(m => [...m, { role: 'assistant', content: 'Usage: /bgmerge <agent-id>', actions: [] }]); return; }
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '🔀 Merging agent ' + id + '...', actions: [] }]);
    const result = await mergeBackgroundAgent(id, folder);
    if (result.hasConflicts) {
      setMergeConflictData(result);
      setShowMergeConflict(true);
      setMessages(m => [...m, { role: 'assistant', content: '⚠ **Konflik di ' + result.conflicts.length + ' file:**\n' + result.conflicts.map(c => '• ' + c).join('\n') + '\n\nBuka panel konflik untuk pilih strategi resolusi.', actions: [] }]);
    } else {
      setMessages(m => [...m, { role: 'assistant', content: result.ok ? '✅ ' + result.msg : '❌ ' + result.msg, actions: [] }]);
    }
    setLoading(false);
  }, [folder, setLoading, setMessages, setMergeConflictData, setShowMergeConflict]);

  const handleRefactor = useCallback(async (parts) => {
    const oldName = parts[1]?.trim();
    const newName2 = parts[2]?.trim();
    if (!oldName || !newName2) { setMessages(m => [...m, { role: 'assistant', content: 'Usage: /refactor <nama_lama> <nama_baru>', actions: [] }]); return; }
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '🔄 Refactor: ' + oldName + ' → ' + newName2 + '...', actions: [] }]);
    const searchR = await callServer({ type: 'search', path: folder + '/src', content: oldName });
    const fileList = searchR.ok
      ? [...new Set((searchR.data || '').split('\n').filter(Boolean).map(l => { const mx = l.match(/^(.+?):\d+:/); return mx ? mx[1] : null; }).filter(Boolean))]
      : [];
    if (fileList.length === 0) {
      setMessages(m => [...m, { role: 'assistant', content: '❌ ' + oldName + ' tidak ditemukan di src/', actions: [] }]);
      setLoading(false);
      return;
    }
    await sendMsg('REFACTOR: rename ' + oldName + ' menjadi ' + newName2 + ' di: ' + fileList.join(', ') + '. Baca tiap file, ganti semua occurrence, lalu write_file.');
    setLoading(false);
  }, [folder, setLoading, setMessages, sendMsg]);

  const handleLint = useCallback(async () => {
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '🔍 Running lint...', actions: [] }]);
    const lintR = await callServer({ type: 'exec', path: folder, command: 'npm run lint 2>&1 || true' });
    const lintOut = lintR.data || '';
    const hasLintErr = lintOut.toLowerCase().includes('error') && !lintOut.includes('0 error');
    setMessages(m => [...m, { role: 'assistant', content: '```bash\n' + lintOut.slice(0, 1000) + '\n```', actions: [] }]);
    if (hasLintErr) {
      setTimeout(() => sendMsg('Ada lint error. Fix semua error ini:\n```\n' + lintOut.slice(0, 600) + '\n```'), 500);
    } else {
      setMessages(m => [...m, { role: 'assistant', content: '✅ Lint clean!', actions: [] }]);
    }
    setLoading(false);
  }, [folder, setLoading, setMessages, sendMsg]);

  const handleSelfEdit = useCallback(async (parts) => {
    const task = parts.slice(1).join(' ').trim() || 'Fix bugs, hapus dead code, optimasi performa';
    setLoading(true);
    const appPath = folder + '/src/App.jsx';
    const r = await callServer({ type: 'read', path: appPath, from: 1, to: 50 });
    if (!r.ok) {
      setMessages(m => [...m, { role: 'assistant', content: `❌ Tidak bisa baca \`${appPath}\`\n\nPastikan folder project sudah benar.`, actions: [] }]);
      setLoading(false);
      return;
    }
    setMessages(m => [...m, { role: 'assistant', content: `🔧 **Self-edit dimulai...**\n\nTask: _${task}_`, actions: [] }]);
    setLoading(false);
    await sendMsg(`MODE: SELF-EDIT\n\nTask: ${task}\n\nBaca src/App.jsx secara bertahap dengan read_file (from/to 100 baris per request). Setelah baca bagian yang relevan, gunakan write_file untuk patch minimal. Jangan tulis ulang seluruh file.`);
  }, [folder, setLoading, setMessages, sendMsg]);

  const handleWebsearch = useCallback(async (parts) => {
    const query = parts.slice(1).join(' ').trim();
    if (!query) { setMessages(m => [...m, { role: 'assistant', content: 'Usage: /websearch <query>\nContoh: /websearch react useEffect cleanup', actions: [] }]); return; }
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '🔍 Searching: **' + query + '**...', actions: [] }]);
    const r = await callServer({ type: 'web_search', query });
    if (r.ok && r.data) {
      setMessages(m => [...m, { role: 'assistant', content: '🌐 **Web Search: ' + query + '**\n\n' + r.data, actions: [] }]);
    } else {
      setMessages(m => [...m, { role: 'assistant', content: '❌ Search gagal: ' + (r.data || 'unknown error'), actions: [] }]);
    }
    setLoading(false);
  }, [setLoading, setMessages]);

  const handleSummarize = useCallback(async (parts) => {
    const fromN = parseInt(parts[1]) || 0;
    const slice = fromN > 0 ? messages.slice(fromN) : messages.slice(1, -6);
    if (slice.length < 3) { setMessages(m => [...m, { role: 'assistant', content: 'Tidak cukup pesan untuk disummarize.', actions: [] }]); return; }
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '📦 Summarizing ' + slice.length + ' pesan...', actions: [] }]);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const summary = await askCerebrasStream([
        { role: 'system', content: 'Buat ringkasan padat percakapan coding ini. Fokus: keputusan teknis, file yang diubah, bug fix, status. Maks 200 kata. Bahasa Indonesia.' },
        { role: 'user', content: slice.map(m => m.role + ': ' + (m.content || '').slice(0, 300)).join('\n\n') },
      ], 'llama3.1-8b', () => { }, ctrl.signal, { maxTokens: 512 });
      const kept = fromN > 0 ? messages.slice(0, fromN) : [messages[0], ...messages.slice(-6)];
      setMessages([...kept, { role: 'assistant', content: '📦 **Summary (' + slice.length + ' pesan):**\n\n' + summary, actions: [] }]);
    } catch (e) {
      if (e.name !== 'AbortError') setMessages(m => [...m, { role: 'assistant', content: '❌ ' + e.message, actions: [] }]);
    }
    setLoading(false);
  }, [messages, abortRef, setLoading, setMessages]);

  const handlePlan = useCallback(async (parts) => {
    const task = parts.slice(1).join(' ').trim();
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '📋 Generating plan...', actions: [] }]);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const { steps } = await generatePlan(task, folder, callAI, ctrl.signal);
      setPlanSteps(steps.map(s => ({ ...s, done: false })));
      setPlanTask(task);
      setMessages(m => [...m, { role: 'assistant', content: '📋 **Plan (' + steps.length + ' langkah):**\n\n' + steps.map(s => s.num + '. ' + s.text).join('\n'), actions: [] }]);
    } catch (e) {
      if (e.name !== 'AbortError') setMessages(m => [...m, { role: 'assistant', content: '❌ ' + e.message, actions: [] }]);
    }
    setLoading(false);
  }, [folder, abortRef, callAI, setLoading, setMessages, setPlanSteps, setPlanTask]);

  const handleAsk = useCallback((parts) => {
    const modelAlias = {
      'kimi': 'moonshotai/kimi-k2-instruct-0905',
      'llama': 'llama-3.3-70b-versatile',
      'llama8b': 'llama-3.1-8b-instant',
      'qwen': 'qwen/qwen3-32b',
      'scout': 'meta-llama/llama-4-scout-17b-16e-instruct',
      'qwen235': 'qwen-3-235b-a22b-instruct-2507',
    };
    const alias = parts[1]?.toLowerCase();
    const targetModel = modelAlias[alias] || parts[1];
    const prompt = parts.slice(2).join(' ').trim();
    if (!targetModel || !prompt) {
      setMessages(m => [...m, { role: 'assistant', content: '🤖 Usage: `/ask <model> <prompt>`\n\nAlias: `kimi` `llama` `llama8b` `qwen` `scout` `qwen235`\n\nContoh: `/ask kimi review kode ini`', actions: [] }]);
    } else {
      setMessages(m => [...m, { role: 'assistant', content: '🤖 Asking **' + alias + '** (' + targetModel.split('/').pop() + ')...', actions: [] }]);
      sendMsg(prompt, { overrideModel: targetModel });
    }
  }, [setMessages, sendMsg]);

  const handleXp = useCallback(() => {
    const g = growth;
    if (!g) { setMessages(m => [...m, { role: 'assistant', content: 'Growth system tidak aktif.', actions: [] }]); return; }
    const BADGE_DEFS = [
      { id: 'first_blood', label: '🩸 First Blood' }, { id: 'apprentice', label: '🌱 Apprentice' },
      { id: 'coder', label: '⚡ Coder' }, { id: 'hacker', label: '🔥 Hacker' },
      { id: 'streak_3', label: '📅 Konsisten' }, { id: 'streak_7', label: '🗓 Seminggu Penuh' },
      { id: 'streak_30', label: '👑 One Month' },
    ];
    const badgeList = g.badges.length
      ? g.badges.map(id => BADGE_DEFS.find(x => x.id === id)?.label || id).join(', ')
      : 'Belum ada';
    const styleInfo = g.learnedStyle
      ? '\n\n**🧬 Gaya coding yang dipelajari:**\n' + g.learnedStyle
      : '\n\n_Yuyu belum belajar gaya codingmu. Lanjutkan sesi!_';
    setMessages(m => [...m, {
      role: 'assistant', content:
        `🎮 **YuyuCode Growth**\n\n` +
        `**Level:** ${g.level}\n` +
        `**XP:** ${g.xp}${g.nextXp ? ' / ' + g.nextXp + ' (' + g.progress + '%)' : ' — MAX LEVEL 👑'}\n` +
        `**Streak:** 🔥 ${g.streak} hari\n` +
        `**Badge:** ${badgeList}` +
        styleInfo,
      actions: []
    }]);
  }, [growth, setMessages]);

  const handleTest = useCallback(async (parts) => {
    const targetPath = parts.slice(1).join(' ').trim();
    const filePath = targetPath ? folder + '/' + targetPath.replace(/^\//, '') : selectedFile;
    if (!filePath) { setMessages(m => [...m, { role: 'assistant', content: 'Usage: /test atau /test src/api.js\nBuka file dulu, atau sebutkan path-nya.', actions: [] }]); return; }
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '🧪 Generating tests untuk **' + filePath.split('/').pop() + '**...', actions: [] }]);
    const r = await callServer({ type: 'read', path: filePath });
    if (!r.ok) { setMessages(m => [...m, { role: 'assistant', content: '❌ Tidak bisa baca file: ' + filePath, actions: [] }]); setLoading(false); return; }
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
  }, [folder, selectedFile, setLoading, setMessages, sendMsg]);

  const handleScaffold = useCallback(async (parts) => {
    const tpl = parts[1]?.toLowerCase();
    const validTemplates = ['react', 'node', 'express'];
    if (!tpl || !validTemplates.includes(tpl)) {
      setMessages(m => [...m, { role: 'assistant', content: '🏗 Usage: /scaffold react|node|express\n\n**react** — Vite + React 19\n**node** — Node.js CLI app\n**express** — Express REST API', actions: [] }]);
      return;
    }
    setLoading(true);
    setMessages(m => [...m, { role: 'assistant', content: '🏗 Scaffolding **' + tpl + '** project di ' + folder + '...', actions: [] }]);
    await sendMsg('Scaffold project ' + tpl + ' di folder ' + folder + '. Buat struktur file lengkap dengan write_file: package.json, file utama, README.md singkat. Pakai dependencies terbaru 2025. Langsung buat tanpa tanya.');
    setLoading(false);
  }, [folder, setLoading, setMessages, sendMsg]);

  // ── Main dispatcher ────────────────────────────────────────────────────────

  const handleSlashCommand = useCallback(async (cmd) => {
    const parts = cmd.trim().split(' ');
    const base = parts[0];

    const simpleActions = {
      '/checkpoint': () => saveCheckpoint(),
      '/restore':    () => setShowCheckpoints(true),
      '/export':     () => exportChat(),
      '/history':    () => { if (!selectedFile) { setMessages(m => [...m, { role: 'assistant', content: 'Buka file dulu Papa~', actions: [] }]); return; } setShowFileHistory(true); },
      '/actions':    () => setShowCustomActions(true),
      '/split':      () => { setSplitView(s => !s); setMessages(m => [...m, { role: 'assistant', content: 'Split view ' + (splitView ? 'dimatikan' : 'diaktifkan') + '~', actions: [] }]); },
      '/browse':     () => { const url = parts.slice(1).join(' '); if (!url) { setMessages(m => [...m, { role: 'assistant', content: 'Usage: /browse https://...', actions: [] }]); return; } browseTo(url); },
      '/swarm':      () => { const task = parts.slice(1).join(' '); if (!task) { setMessages(m => [...m, { role: 'assistant', content: 'Usage: /swarm <deskripsi task>', actions: [] }]); return; } runAgentSwarm(task); },
      '/theme':      () => setShowThemeBuilder(true),
      '/mcp':        () => setShowMCP(true),
      '/github':     () => setShowGitHub(true),
      '/deploy':     () => setShowDeploy(true),
      '/skills':     () => setShowSkills(true),
      '/permissions':() => setShowPermissions(true),
      '/sessions':   async () => { const sessions = await loadSessions(); setSessionList(sessions); setShowSessions(true); },
      '/plugin':     () => setShowPlugins(true),
      '/config':     () => setShowConfig(true),
      '/bgstatus':   () => setShowBgAgents(true),
      '/usage':      () => setMessages(m => [...m, { role: 'assistant', content: tokenTracker.summary(), actions: [] }]),
      '/simplify':   () => { if (!selectedFile) { setMessages(m => [...m, { role: 'assistant', content: 'Buka file dulu Papa~', actions: [] }]); return; } sendMsg('Simplifikasi kode di ' + selectedFile + '. Hapus dead code, perpendek fungsi yang terlalu panjang, perbaiki naming. Jangan ubah fungsionalitas. Gunakan write_file untuk patch minimal.'); },
      '/ptt':        () => { setPushToTalk(p => !p); setMessages(m => [...m, { role: 'assistant', content: '🎙 Push-to-talk ' + (pushToTalk ? 'dimatikan' : 'diaktifkan. Tahan 🎙 untuk rekam, lepas untuk kirim.') + '.', actions: [] }]); },
      '/open':       () => { const url = parts.slice(1).join(' ').trim(); if (!url) { setMessages(m => [...m, { role: 'assistant', content: 'Usage: /open https://...', actions: [] }]); return; } window.open(url, '_blank'); setMessages(m => [...m, { role: 'assistant', content: '🌐 Membuka: ' + url, actions: [] }]); },
    };

    if (simpleActions[base]) {
      await simpleActions[base]();
      return;
    }

    const handlers = {
      '/model':      () => handleModel(),
      '/compact':    () => handleCompact(parts),
      '/handoff':    () => handleHandoff(),
      '/cost':       () => { const summary = tokenTracker.summary(); const gpt4Cost = ((tokenTracker.inputTokens / 1000) * 0.03 + (tokenTracker.outputTokens / 1000) * 0.06).toFixed(3); setMessages(m => [...m, { role: 'assistant', content: summary + '\n\n💰 **Estimasi vs GPT-4o:** ~$' + gpt4Cost + ' (kamu pakai gratis 🎉)', actions: [] }]); },
      '/review':     () => handleReview(parts),
      '/stop':       () => { if (loading) { setGracefulStop(true); setMessages(m => [...m, { role: 'assistant', content: '⏸ **Graceful stop** — Yuyu akan menyelesaikan iterasi ini lalu berhenti.', actions: [] }]); } else { setMessages(m => [...m, { role: 'assistant', content: '✅ Tidak ada yang berjalan sekarang.', actions: [] }]); } },
      '/clear':      () => { const force = parts[1] === 'force'; if (!force && messages.length > 3) { setMessages(m => [...m, { role: 'assistant', content: '🗑 **Mau clear chat?**\n\n- `/save` dulu untuk simpan sesi ini\n- `/clear force` untuk langsung hapus tanpa simpan\n\n_Ketik salah satu atau lanjut ngobrol._', actions: [] }]); } else { setMessages([{ role: 'assistant', content: 'Chat dibersihkan. Mau ngerjain apa Papa? 🌸' }]); Preferences.remove({ key: 'yc_history' }); } },
      '/search':     () => handleSearch(parts),
      '/diff':       () => handleDiff(parts),
      '/deps':       () => handleDeps(),
      '/font':       () => { const size = parseInt(parts[1]) || 14; setFontSize(size); Preferences.set({ key: 'yc_fontsize', value: String(size) }); setMessages(m => [...m, { role: 'assistant', content: '🔤 Font size diubah ke ' + size + 'px~', actions: [] }]); },
      '/db':         () => handleDb(parts),
      '/status':     () => handleStatus(),
      '/tokens':     () => { const breakdown = messages.slice(-10).map(m => { const tk = Math.round(m.content.length / 4); return (m.role === 'user' ? 'Papa' : 'Yuyu') + ': ~' + tk + 'tk'; }).join('\n'); setMessages(prev => [...prev, { role: 'assistant', content: '📓 **Token breakdown (10 pesan terakhir)**\n```\n' + breakdown + '\n```\n**Total:** ~' + countTokens(messages) + 'tk | Cerebras gratis 🎉', actions: [] }]); },
      '/pin':        () => handlePin(parts),
      '/unpin':      () => { const target = parts.slice(1).join(' ').trim() || selectedFile; if (target) { togglePin(target.startsWith('/') ? target : folder + '/' + target); setMessages(m => [...m, { role: 'assistant', content: '📌 Unpinned: `' + target + '`', actions: [] }]); } },
      '/index':      async () => { setLoading(true); setMessages(m => [...m, { role: 'assistant', content: '🔍 Building symbol index...', actions: [] }]); const srcPath = parts[1] ? folder + '/' + parts[1] : folder + '/src'; const idxR = await callServer({ type: 'index', path: srcPath }); if (idxR.ok) { const meta = idxR.meta || {}; setMessages(m => [...m, { role: 'assistant', content: `✅ **Symbol Index** (${meta.files || '?'} files, ${meta.symbols || '?'} symbols)\n\n${idxR.data}`, actions: [] }]); } else { setMessages(m => [...m, { role: 'assistant', content: '❌ Index gagal: ' + (idxR.data || 'unknown error'), actions: [] }]); } setLoading(false); },
      '/thinking':   () => { const next = !thinkingEnabled; setThinkingEnabled(next); Preferences.set({ key: 'yc_thinking', value: next ? '1' : '0' }); setMessages(m => [...m, { role: 'assistant', content: '🧠 Think-aloud mode ' + (next ? 'aktif — Yuyu akan tulis reasoning singkat dalam <think> sebelum jawab.' : 'nonaktif.'), actions: [] }]); },
      '/save':       async () => { const name = parts.slice(1).join(' ').trim() || sessionName || 'Session ' + new Date().toLocaleString('id'); const s = await saveSession(name, messages, folder, branch); setSessionName(name); setMessages(m => [...m, { role: 'assistant', content: '💾 Sesi disimpan: **' + s.name + '**', actions: [] }]); },
      '/debug':      () => { const info = ['**Debug Info**', 'Model: ' + model, 'Effort: ' + effort, 'Thinking: ' + (thinkingEnabled ? 'on' : 'off'), 'Messages: ' + messages.length, 'Tokens (est): ~' + countTokens(messages) + 'tk', 'Skills: ' + skills.length, 'Folder: ' + folder, 'Branch: ' + branch].join('\n'); setMessages(m => [...m, { role: 'assistant', content: info, actions: [] }]); },
      '/plan':       () => handlePlan(parts),
      '/effort':     () => { const lvl = parts[1]?.toLowerCase(); if (!['low', 'medium', 'high'].includes(lvl)) { setMessages(m => [...m, { role: 'assistant', content: '⚡ Effort sekarang: **' + effort + '**\nUsage: /effort low|medium|high', actions: [] }]); return; } setEffort(lvl); Preferences.set({ key: 'yc_effort', value: lvl }); setMessages(m => [...m, { role: 'assistant', content: '⚡ Effort: **' + lvl + '**', actions: [] }]); },
      '/undo':       () => handleUndo(parts),
      '/rewind':     () => { const turns = parseInt(parts[1]) || 1; const rewound = rewindMessages(messages, turns); setMessages(rewound); setMessages(m => [...m, { role: 'assistant', content: '⏪ Rewind ' + turns + ' turn. ' + rewound.length + ' pesan tersisa.', actions: [] }]); },
      '/rename':     () => { const name = parts.slice(1).join(' ').trim(); setSessionName(name); Preferences.set({ key: 'yc_session_name', value: name }); setMessages(m => [...m, { role: 'assistant', content: '✏️ Sesi: **' + name + '**', actions: [] }]); },
      '/bg':         async () => { const task = parts.slice(1).join(' ').trim(); const id = await runBackgroundAgent(task, folder, callAI, (id, agent) => { sendNotification('YuyuCode 🤖', 'Agent selesai! ' + (agent.result?.allWrites?.length || 0) + ' file siap. Buka /bgstatus untuk merge.'); setShowBgAgents(true); haptic('heavy'); }); setMessages(m => [...m, { role: 'assistant', content: '🤖 Background agent: ' + task + '\nID: ' + id, actions: [] }]); },
      '/bgmerge':    () => handleBgMerge(parts),
      '/loop':       () => handleLoop(parts),
      '/amemory':    () => handleAmemory(parts),
      '/batch':      () => handleBatch(parts),
      '/color':      () => { const color = parts[1]?.trim(); const colors = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', purple: '#a855f7', yellow: '#eab308', pink: '#ec4899', orange: '#f97316', off: 'off' }; if (!color || !colors[color]) { setMessages(m => [...m, { role: 'assistant', content: '🎨 Session color sekarang: ' + (sessionColor || 'off') + '\nUsage: /color red|green|blue|purple|yellow|pink|orange|off', actions: [] }]); return; } const newColor = color === 'off' ? null : colors[color]; setSessionColor(newColor); Preferences.set({ key: 'yc_session_color', value: newColor || '' }); setMessages(m => [...m, { role: 'assistant', content: '🎨 Session color: **' + color + '**', actions: [] }]); },
      '/watch':      () => { if (fileWatcherActive) { clearInterval(fileWatcherInterval); setFileWatcherActive(false); setFileWatcherInterval(null); setMessages(m => [...m, { role: 'assistant', content: '👁 File watcher dimatikan.', actions: [] }]); } else { setFileWatcherActive(true); setFileSnapshots({}); setMessages(m => [...m, { role: 'assistant', content: '👁 File watcher aktif. Yuyu akan notify real-time via WebSocket kalau ada file berubah dari luar app.', actions: [] }]); } },
      '/refactor':   () => handleRefactor(parts),
      '/lint':       () => handleLint(),
      '/self-edit':  () => handleSelfEdit(parts),
      '/websearch':  () => handleWebsearch(parts),
      '/rules':      () => handleRules(parts),
      '/init':       () => handleInit(parts),
      '/tree':       async () => { setLoading(true); const depth = parseInt(parts[1]) || 2; const r = await callServer({ type: 'tree', path: folder, depth }); setMessages(m => [...m, { role: 'assistant', content: '📁 **Tree (depth ' + depth + '):**\n```\n' + (r.data || '(kosong)').slice(0, 2000) + '\n```', actions: [] }]); setLoading(false); },
      '/summarize':  () => handleSummarize(parts),
      '/scaffold':   () => handleScaffold(parts),
      '/ask':        () => handleAsk(parts),
      '/ab':         async () => { const task = parts.slice(1).join(' ').trim(); if (!task) { setMessages(m => [...m, { role: 'assistant', content: 'Usage: /ab <task>\nContoh: /ab implementasi dark mode toggle\n\nOtomatis test dua model terbaik secara paralel.', actions: [] }]); return; } await abTest(task, 'qwen-3-235b-a22b-instruct-2507', 'moonshotai/kimi-k2-instruct-0905'); },
      '/xp':         () => handleXp(),
      '/test':       () => handleTest(parts),
    };

    if (handlers[base]) {
      await handlers[base]();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, folder, branch, messages, selectedFile, fileContent, notes, memories, skills,
      thinkingEnabled, effort, loopActive, loopIntervalRef, agentMemory, splitView,
      pushToTalk, sessionName, sessionColor, fileWatcherActive, fileWatcherInterval,
      loading, editHistory, pinnedFiles,
      handleModel, handleCompact, handleHandoff, handleReview, handleSearch, handleDiff,
      handleDeps, handleDb, handleStatus, handlePin, handleUndo, handleLoop, handleAmemory,
      handleBatch, handleRules, handleInit, handleBgMerge, handleRefactor, handleLint,
      handleSelfEdit, handleWebsearch, handleSummarize, handlePlan, handleAsk, handleXp,
      handleTest, handleScaffold]);

  return { handleSlashCommand };
}
