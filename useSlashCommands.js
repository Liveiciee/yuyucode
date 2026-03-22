import { useCallback, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { callServer, askCerebrasStream } from '../api.js';
import { MODELS } from '../constants.js';
import { countTokens, parseActions } from '../utils.js';
import { generatePlan, runBackgroundAgent, mergeBackgroundAgent, tokenTracker, saveSession, loadSessions, rewindMessages } from '../features.js';

// ── Shared helpers ─────────────────────────────────────────────────────────────

function pushMsg(setMessages, content) {
  setMessages(m => [...m, { role: 'assistant', content, actions: [] }]);
}

function pushErr(setMessages, msg) {
  pushMsg(setMessages, '❌ ' + msg);
}

// ── processBatchFile ────────────────────────────────────────────────────────
async function processBatchFile(f, folder, batchCmd, callAI, signal, setMessages) {
  const filePath = folder + '/src/' + f.name;
  const r = await callServer({ type: 'read', path: filePath });
  if (!r.ok) return 'failed';
  try {
    const reply = await callAI([
      { role: 'system', content: 'Kamu adalah code editor. Task: ' + batchCmd + '\nFile: ' + filePath + '\nGunakan write_file action untuk apply perubahan. Kalau tidak ada yang perlu diubah, balas hanya kata SKIP.' },
      { role: 'user', content: '```\n' + r.data.slice(0, 6000) + '\n```' },
    ], () => { }, signal);
    if (reply.trim().toUpperCase().startsWith('SKIP')) return 'skipped';
    const acts = parseActions(reply).filter(a => a.type === 'write_file');
    acts.forEach(w => { if (!w.path.startsWith('/')) w.path = folder + '/src/' + w.path.replace(/^\.\//, ''); });
    return acts;
  } catch (e) {
    if (e.name === 'AbortError') return 'aborted';
    pushMsg(setMessages, '  ❌ ' + f.name + ': ' + e.message.slice(0, 60));
    return 'failed';
  }
}

// ── Loop helpers ────────────────────────────────────────────────────────────

function makeLoopMsg(time, r, errorStreak, MAX_ERRORS, loopCmd) {
  if (errorStreak >= MAX_ERRORS)
    return { done: true,  content: '⏹ Loop auto-stop: ' + MAX_ERRORS + ' error berturut-turut pada `' + loopCmd + '`.' };
  if (errorStreak > 0)
    return { done: false, content: '🔄 Loop [' + time + '] ❌ Error ' + errorStreak + '/' + MAX_ERRORS + ':\n```\n' + (r.data || '').slice(0, 400) + '\n```' };
  return   { done: false, content: '🔄 Loop [' + time + ']:\n```bash\n' + (r.data || '').slice(0, 500) + '\n```' };
}

function stopLoop(setLoopIntervalRef, setLoopActive, iv = null) {
  if (iv !== null) clearInterval(iv);
  setLoopIntervalRef(null);
  setLoopActive(false);
}

// ── MCP sub-handlers ────────────────────────────────────────────────────────

async function mcpList(setLoading, setMessages) {
  setLoading(true);
  const r = await callServer({ type: 'mcp_list' });
  setLoading(false);
  if (!r.ok) { pushErr(setMessages, r.data); return; }
  const lines = Object.entries(r.data).map(([name, info]) =>
    '**' + name + '** — ' + (info.desc || '') + '\n  Actions: `' + (info.actions || []).join('`, `') + '`'
  ).join('\n\n');
  pushMsg(setMessages, '🔧 **MCP Tools:**\n\n' + lines);
}

async function mcpConnect(parts, setLoading, setMessages) {
  const name = parts[2], url = parts[3], desc = parts.slice(4).join(' ') || '';
  if (!name || !url) { pushMsg(setMessages, 'Usage: `/mcp connect <n> <url> [description]`\nContoh: `/mcp connect myapi http://localhost:3001 My custom API`'); return; }
  setLoading(true);
  const readR = await callServer({ type: 'read', path: '~/.yuyu/mcp-servers.json' });
  let servers = [];
  if (readR.ok) { try { servers = JSON.parse(readR.data); } catch(_e){} }
  servers = servers.filter(s => s.name !== name);
  servers.push({ name, url, description: desc, actions: [] });
  const writeR = await callServer({ type: 'write', path: '~/.yuyu/mcp-servers.json', content: JSON.stringify(servers, null, 2) });
  setLoading(false);
  pushMsg(setMessages, writeR.ok
    ? '✅ MCP server **' + name + '** tersambung → `' + url + '`\nGunakan `/mcp list` untuk lihat semua, atau `/mcp connect` lagi untuk update.'
    : '❌ Gagal simpan: ' + writeR.data
  );
}

async function mcpDisconnect(parts, setLoading, setMessages) {
  const name = parts[2];
  if (!name) { pushMsg(setMessages, 'Usage: `/mcp disconnect <n>`'); return; }
  setLoading(true);
  const readR = await callServer({ type: 'read', path: '~/.yuyu/mcp-servers.json' });
  let servers = [];
  if (readR.ok) { try { servers = JSON.parse(readR.data); } catch(_e){} }
  const before = servers.length;
  servers = servers.filter(s => s.name !== name);
  await callServer({ type: 'write', path: '~/.yuyu/mcp-servers.json', content: JSON.stringify(servers, null, 2) });
  setLoading(false);
  pushMsg(setMessages, before > servers.length ? '✅ **' + name + '** dihapus dari MCP servers.' : '⚠ Server **' + name + '** tidak ditemukan.');
}

// ── Review sub-handlers ─────────────────────────────────────────────────────

async function reviewAll(folder, setLoading, setMessages, sendMsg) {
  setLoading(true);
  pushMsg(setMessages, '🔍 Menganalisis semua file yang berubah vs HEAD...');
  const diffR = await callServer({ type: 'exec', path: folder, command: 'git diff --name-only HEAD 2>/dev/null' });
  const changedFiles = (diffR.ok ? diffR.data : '').trim().split('\n').filter(f => f && /\.(js|jsx|ts|tsx|css|json)$/.test(f));
  if (changedFiles.length === 0) { pushMsg(setMessages, '✅ Tidak ada file yang berubah vs HEAD.'); setLoading(false); return; }
  const toReview = changedFiles.slice(0, 8);
  const reads = await Promise.all(toReview.map(f => callServer({ type: 'read', path: folder + '/' + f })));
  const fileBlocks = toReview.map((f, i) => {
    const content = reads[i]?.ok ? reads[i].data.slice(0, 2500) : '[tidak bisa dibaca]';
    return '### ' + f + '\n```' + f.split('.').pop() + '\n' + content + '\n```';
  }).join('\n\n');
  setLoading(false);
  await sendMsg('🔍 **Code Review — ' + toReview.length + ' file changed vs HEAD**\n\nReview setiap file di bawah. Untuk setiap file cari:\n1. 🐛 Bugs potensial\n2. ⚡ Performance issues\n3. 🔒 Security issues\n4. 🧪 Missing error handling\n5. 💡 Saran improvement\n\nFormat output: per-file dengan severity (🔴 High / 🟡 Medium / 🟢 Low).\n\n' + fileBlocks);
}

async function reviewFile(targetPath, folder, setLoading, setMessages, sendMsg) {
  setLoading(true);
  const r = await callServer({ type: 'read', path: folder + '/' + targetPath.replace(/^\//, '') });
  setLoading(false);
  if (!r.ok) { pushErr(setMessages, 'File tidak ditemukan: ' + targetPath); return; }
  await sendMsg('Lakukan code review menyeluruh pada file ' + targetPath + '. Cari: bugs potensial, performance issues, security issues, dan saran improvement.\n\n```\n' + r.data.slice(0, 5000) + '\n```');
}


export function useSlashCommands({
  model, folder, branch, messages, selectedFile, fileContent, notes,
  memories, checkpoints: _checkpoints, skills, thinkingEnabled, effort, loopActive,
  loopIntervalRef, agentMemory, splitView, pushToTalk, sessionName,
  sessionColor, fileWatcherActive, fileWatcherInterval,
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
  sendMsg, compactContext, saveCheckpoint, exportChat, searchMessages,
  setGracefulStop, loading,
  editHistory, setEditHistory, pinnedFiles, togglePin,
  browseTo, runAgentSwarm, callAI, abTest,
  growth,
  sendNotification, haptic,
  abortRef,
}) {
  const activeDbRef = useRef({});

  const handleModel = useCallback(() => {
    const idx = MODELS.findIndex(m => m.id === model);
    const next = MODELS[(idx + 1) % MODELS.length];
    setModel(next.id);
    Preferences.set({ key: 'yc_model', value: next.id });
    pushMsg(setMessages, '🔄 Model: **' + next.label + '** (' + ((idx + 1) % MODELS.length + 1) + '/' + MODELS.length + ')');
  }, [model, setModel, setMessages]);

  const handleCompact = useCallback(async (parts) => {
    if (parts[1] === 'force') await compactContext();
    else pushMsg(setMessages, '⚠️ **/compact** pakai recursive summary — accuracy bisa turun di sesi panjang.\n\n💡 Coba **/handoff** — generate session brief yang structured dan disimpan ke `.yuyu/handoff.md`, lalu di-load otomatis di sesi berikutnya.\n\nMau tetap compact? Ketik `/compact force`');
  }, [compactContext, setMessages]);

  const handleHandoff = useCallback(async () => {
    setLoading(true);
    pushMsg(setMessages, '📋 Generating session handoff...');
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
        pushMsg(setMessages, '✅ **Handoff saved** to `.yuyu/handoff.md`\n\nPaste this at the start of your next Claude session, or it will be auto-loaded by `gatherProjectContext`.\n\n---\n\n' + handoffMd);
      } else {
        pushMsg(setMessages, '📋 **Session Handoff:**\n\n' + handoffMd + '\n\n> Tip: set a project folder to auto-save.');
      }
    } catch (e) {
      pushErr(setMessages, 'Handoff gagal: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [folder, messages, setLoading, setMessages]);

  const handleReview = useCallback(async (parts) => {
    const targetPath = parts.slice(1).join(' ').trim();
    if (targetPath === '--all' || targetPath === '-a') {
      await reviewAll(folder, setLoading, setMessages, sendMsg);
    } else if (targetPath) {
      await reviewFile(targetPath, folder, setLoading, setMessages, sendMsg);
    } else if (selectedFile) {
      const reviewContent = fileContent ? '\n\n```\n' + fileContent.slice(0, 5000) + '\n```' : '';
      await sendMsg('Lakukan code review menyeluruh pada file ' + selectedFile + '. Cari: bugs potensial, performance issues, security issues, dan saran improvement.' + reviewContent);
    } else {
      pushMsg(setMessages, '**`/review`** — Code review\n\n- `/review` — review file yang terbuka\n- `/review src/api.js` — review file spesifik\n- `/review --all` — review semua file changed vs HEAD');
    }
  }, [folder, selectedFile, fileContent, setLoading, setMessages, sendMsg]);

  const handleSearch = useCallback((parts) => {
    const q = parts.slice(1).join(' ');
    if (!q) { pushMsg(setMessages, '🔍 Usage: /search <query>\n\nContoh: /search "useAgentLoop"'); return; }
    const results = searchMessages(q);
    if (!results || results.length === 0) {
      pushMsg(setMessages, '🔍 Tidak ada hasil untuk "' + q + '"');
    } else {
      const preview = results.slice(0, 5).map(r =>
        `**[${r.idx + 1}]** ${r.role === 'user' ? '👤 Kamu' : '🌸 Yuyu'}: ${(r.content || '').slice(0, 100)}${r.content?.length > 100 ? '...' : ''}`
      ).join('\n\n');
      pushMsg(setMessages, `🔍 **${results.length} hasil** untuk "${q}":\n\n${preview}`);
    }
  }, [searchMessages, setMessages]);

  const handleDiff = useCallback(async (parts) => {
    const range = parts.slice(1).join(' ').trim();
    setLoading(true);
    const cmd = range ? `git diff ${range} --stat` : 'git diff HEAD --stat';
    const r = await callServer({ type: 'exec', path: folder, command: cmd });
    setLoading(false);
    if (!r.ok || !r.data?.trim()) { pushMsg(setMessages, '±  Tidak ada diff.\n\nUsage: `/diff` (working tree) atau `/diff v3.0..v3.1`'); return; }
    const lines = (r.data || '').split('\n').length;
    let full = '';
    if (lines < 30) {
      const rd = await callServer({ type: 'exec', path: folder, command: range ? `git diff ${range}` : 'git diff HEAD' });
      if (rd.ok) full = '\n```diff\n' + rd.data.slice(0, 3000) + '\n```';
    }
    pushMsg(setMessages, '± **Git diff** ' + (range || 'HEAD') + ':\n```\n' + r.data + '\n```' + full);
  }, [folder, setLoading, setMessages]);

  const handleDeps = useCallback(async () => {
    if (!selectedFile) { pushMsg(setMessages, 'Buka file dulu Papa~'); return; }
    setLoading(true);
    pushMsg(setMessages, '🕸 Building dep graph (2 levels)...');
    const importRegex = /(?:import|require)\s+[^'"]*['"]([^'"]+)['"]/g;
    const nodesMap = {}, edges = [];

    async function parseFile(path, depth) {
      if (depth > 2 || nodesMap[path]) return;
      const r = await callServer({ type: 'read', path });
      if (!r.ok) return;
      nodesMap[path] = { id: path, label: path.split('/').pop().replace(/\.(jsx?|tsx?)$/, ''), type: depth === 0 ? 'root' : 'local' };
      await parseImports(r.data || '', path, depth);
    }

    async function parseImports(src, fromPath, depth) {
      const re = new RegExp(importRegex.source, 'g');
      let m2;
      while ((m2 = re.exec(src)) !== null) {
        const imp = m2[1];
        if (!imp.startsWith('.')) {
          if (!nodesMap[imp]) nodesMap[imp] = { id: imp, label: imp.split('/').pop(), type: 'external' };
          edges.push({ source: fromPath, target: imp });
        } else {
          await resolveLocalImport(imp, fromPath, depth);
        }
      }
    }

    async function resolveLocalImport(imp, fromPath, depth) {
      const base2 = fromPath.split('/').slice(0, -1).join('/');
      const candidates = [imp, imp + '.jsx', imp + '.js', imp + '.ts', imp + '.tsx']
        .map(s => base2 + '/' + s.replace('./', '/').replace('//', '/'))
        .concat([base2 + '/' + imp.replace('./', '').replace('//', '/')]);
      for (const cand of candidates) {
        const cr = await callServer({ type: 'read', path: cand });
        if (cr.ok) { if (!nodesMap[cand]) await parseFile(cand, depth + 1); edges.push({ source: fromPath, target: cand }); break; }
      }
    }

    await parseFile(selectedFile, 0);
    const nodes = Object.values(nodesMap);
    setDepGraph({ file: selectedFile.split('/').pop(), nodes, edges });
    setShowDepGraph(true);
    pushMsg(setMessages, `🕸 Dep graph: **${nodes.length}** nodes, **${edges.length}** edges`);
    setLoading(false);
  }, [selectedFile, setLoading, setMessages, setDepGraph, setShowDepGraph]);

  const handleDb = useCallback(async (parts) => {
    const q = parts.slice(1).join(' ');
    if (!q) { pushMsg(setMessages, 'Usage: /db SELECT * FROM table'); return; }
    setLoading(true);
    const listR = await callServer({ type: 'list', path: folder });
    const dbFiles = listR.ok && Array.isArray(listR.data)
      ? listR.data.filter(f => !f.isDir && f.name.endsWith('.db')).map(f => folder + '/' + f.name) : [];
    if (parts[1] === 'use' && parts[2]) {
      activeDbRef.current[folder] = folder + '/' + parts[2];
      pushMsg(setMessages, '🗄 DB aktif: **' + parts[2] + '** (sesi ini). Query berikutnya pakai file ini.');
      setLoading(false); return;
    }
    let dbPath = activeDbRef.current[folder] || folder + '/data.db';
    if (!activeDbRef.current[folder] && dbFiles.length === 1) dbPath = dbFiles[0];
    else if (!activeDbRef.current[folder] && dbFiles.length > 1)
      pushMsg(setMessages, '🗄 Ditemukan ' + dbFiles.length + ' DB: ' + dbFiles.map(f => f.split('/').pop()).join(', ') + '\nUsage: /db <query> — pakai `/db use <nama.db>` untuk pilih.\nAktif: ' + dbPath.split('/').pop());
    const r = await callServer({ type: 'mcp', tool: 'sqlite', action: 'query', params: { dbPath, query: q } });
    pushMsg(setMessages, '🗄 **' + dbPath.split('/').pop() + '** → `' + q + '`\n```\n' + (r.data || 'kosong') + '\n```');
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
    pushMsg(setMessages,
      '📊 **Status**\n**Server:** ' + (ping.ok ? '✅ Online' : '❌ Offline') +
      '\n**Model:** ' + (mx?.label || model) +
      '\n**Git:** ' + (git.data || '').trim().slice(0, 60) +
      '\n**Node:** ' + (nodeV.data || '').trim() +
      '\n**Disk:** ' + (disk.data || '').trim()
    );
    setLoading(false);
  }, [folder, model, setLoading, setMessages]);

  const handlePin = useCallback((parts) => {
    const target = parts.slice(1).join(' ').trim();
    const pins   = pinnedFiles || [];
    if (!target) {
      pushMsg(setMessages, pins.length === 0
        ? '📌 Belum ada file yang di-pin.\n\nUsage: `/pin src/api.js` — file ini akan selalu masuk context.'
        : '📌 **Pinned files** (selalu masuk context):\n' + pins.map(p => '- `' + p + '`').join('\n') + '\n\n`/pin <file>` untuk tambah, `/unpin <file>` untuk hapus.'
      );
      return;
    }
    const fullPath = folder + '/' + target.replace(/^\//, '');
    togglePin(fullPath);
    pushMsg(setMessages,
      (!pins.includes(fullPath) ? '📌 Pinned' : '📌 Unpinned') + ': `' + target + '`\n' +
      (!pins.includes(fullPath) ? 'File ini akan selalu masuk context agent loop.' : 'File dikeluarkan dari pinned context.')
    );
  }, [folder, pinnedFiles, togglePin, setMessages]);

  const handleUndo = useCallback(async (parts) => {
    const n = parseInt(parts[1]) || 1;
    const history = editHistory || [];
    if (history.length === 0) { pushMsg(setMessages, '⏪ Tidak ada edit yang bisa di-undo.'); return; }
    const toUndo = history.slice(-n);
    const undone = [];
    for (const item of toUndo) {
      const r = await callServer({ type: 'write', path: item.path, content: item.content });
      if (r.ok) undone.push(item.path.split('/').pop());
    }
    setEditHistory(h => h.slice(0, -n));
    pushMsg(setMessages, `⏪ **Undo ${undone.length} edit:** ${undone.join(', ')}\n\nFile dikembalikan ke versi sebelumnya.`);
  }, [editHistory, setEditHistory, setMessages]);

  const handleLoop = useCallback(async (parts) => {
    const args = parts.slice(1).join(' ').trim();
    if (!args || args === 'stop') {
      if (loopActive) { stopLoop(setLoopIntervalRef, setLoopActive, loopIntervalRef); pushMsg(setMessages, '⏹ Loop dihentikan.'); }
      else pushMsg(setMessages, '**`/loop`** — jalankan command berulang\n\n- `/loop 5m git status` — setiap 5 menit\n- `/loop 1h npm run test` — setiap 1 jam\n- `/loop stop` — hentikan loop aktif\n\nLoop otomatis berhenti setelah 3 error berturut-turut.');
      return;
    }
    const lm = args.match(/^(\d+)(s|m|h)\s+(.+)/);
    if (!lm) { pushMsg(setMessages, 'Format: `/loop <interval> <cmd>`. Contoh: `/loop 5m git status`'); return; }
    const multipliers = { s: 1000, m: 60000, h: 3600000 };
    const loopMs = parseInt(lm[1]) * multipliers[lm[2]], loopCmd = lm[3];
    const label  = lm[1] + (lm[2] === 'h' ? ' jam' : lm[2] === 'm' ? ' menit' : ' detik');
    if (loopMs < 10000) { pushMsg(setMessages, '⚠ Interval minimum 10 detik.'); return; }
    if (loopActive) clearInterval(loopIntervalRef);
    let errorStreak = 0;
    const MAX_ERRORS = 3;
    setLoopActive(true);
    pushMsg(setMessages, '🔄 Loop aktif: `' + loopCmd + '` setiap **' + label + '**\n_Auto-stop setelah ' + MAX_ERRORS + ' error berturut-turut. `/loop stop` untuk hentikan._');
    const iv = setInterval(async () => {
      const r    = await callServer({ type: 'exec', path: folder, command: loopCmd });
      const time = new Date().toLocaleTimeString('id');
      if (!r.ok || /error|exception|traceback|command not found/i.test(r.data || '')) errorStreak++;
      else errorStreak = 0;
      const { done, content } = makeLoopMsg(time, r, errorStreak, MAX_ERRORS, loopCmd);
      pushMsg(setMessages, content);
      if (done) stopLoop(setLoopIntervalRef, setLoopActive, iv);
    }, loopMs);
    setLoopIntervalRef(iv);
  }, [folder, loopActive, loopIntervalRef, setLoopActive, setLoopIntervalRef, setMessages]);

  const handleAmemory = useCallback((parts) => {
    const sub   = parts[1]?.toLowerCase();
    const scope = ['user', 'project', 'local'].includes(parts[2]) ? parts[2] : 'user';
    const content = parts.slice(3).join(' ').trim();
    if (sub === 'add' && content) {
      const next = { ...agentMemory, [scope]: [...(agentMemory[scope] || []), { text: content, ts: new Date().toLocaleDateString('id'), id: Date.now() }] };
      setAgentMemory(next);
      Preferences.set({ key: 'yc_agent_memory', value: JSON.stringify(next) });
      pushMsg(setMessages, '🧠 Memory [' + scope + ']: ' + content);
    } else if (sub === 'clear') {
      const next = { ...agentMemory, [scope]: [] };
      setAgentMemory(next);
      Preferences.set({ key: 'yc_agent_memory', value: JSON.stringify(next) });
      pushMsg(setMessages, '🧠 Memory [' + scope + '] dihapus.');
    } else {
      const all = ['user', 'project', 'local'].map(s =>
        '**' + s + '** (' + (agentMemory[s] || []).length + '):\n' +
        ((agentMemory[s] || []).map(mx => '• ' + mx.text + (mx.ts ? ' (' + mx.ts + ')' : '')).join('\n') || 'kosong')
      ).join('\n\n');
      pushMsg(setMessages, '🧠 **Agent Memory:**\n\n' + all + '\n\nUsage: /amemory add user|project|local <teks>\n/amemory clear user|project|local');
    }
  }, [agentMemory, setAgentMemory, setMessages]);

  const handleBatch = useCallback(async (parts) => {
    const batchCmd = parts.slice(1).join(' ').trim();
    if (!batchCmd) { pushMsg(setMessages, 'Usage: /batch <command>\nContoh: /batch tambah JSDoc ke setiap fungsi\nAkan dijalankan ke semua file di src/'); return; }
    setLoading(true);
    const listR = await callServer({ type: 'list', path: folder + '/src' });
    if (!listR.ok) { pushErr(setMessages, 'Tidak bisa list src/'); setLoading(false); return; }
    const files = (listR.data || []).filter(f => !f.isDir && (f.name.endsWith('.jsx') || f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.tsx')));
    pushMsg(setMessages, '📦 **Batch: ' + batchCmd + '**\n' + files.length + ' file akan dianalisis (baca penuh)...');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const allWrites = [];
    let skipped = 0, failed = 0;
    for (const f of files) {
      if (ctrl.signal.aborted) break;
      const result = await processBatchFile(f, folder, batchCmd, callAI, ctrl.signal, setMessages);
      if (result === 'aborted') break;
      if (result === 'failed')  { failed++;  continue; }
      if (result === 'skipped') { skipped++; continue; }
      allWrites.push(...result);
      pushMsg(setMessages, '  ' + (result.length > 0 ? '✅' : '⏭') + ' ' + f.name + (result.length > 0 ? ' — ' + result.length + ' perubahan' : ''));
    }
    if (allWrites.length > 0) {
      setMessages(m => [...m, { role: 'assistant', content: '📦 **Batch siap — menunggu approval!**\n' + allWrites.length + ' perubahan di ' + new Set(allWrites.map(w => w.path.split('/').pop())).size + ' file (' + skipped + ' di-skip, ' + failed + ' gagal).\nReview dan approve di bawah~', actions: allWrites.map(a => ({ ...a, executed: false })) }]);
    } else {
      pushMsg(setMessages, '📦 Batch selesai — tidak ada perubahan diperlukan (' + skipped + ' di-skip, ' + failed + ' gagal).');
    }
    setLoading(false);
  }, [folder, abortRef, callAI, setLoading, setMessages]);

  const handleRulesAdd = useCallback(async (parts) => {
    const ruleText = parts.slice(2).join(' ').replace(/^["']|["']$/g, '');
    if (!ruleText) { pushMsg(setMessages, 'Usage: `/rules add "selalu pakai TypeScript strict mode"`'); return; }
    setLoading(true);
    const existing = await callServer({ type: 'read', path: folder + '/YUYU.md' });
    const currentContent = (existing.ok && existing.data) ? existing.data : '# YUYU.md — Project Rules\n\n## Rules\n';
    const newContent = currentContent.includes('## Rules')
      ? currentContent.replace(/## Rules\n/, '## Rules\n- ' + ruleText + '\n')
      : currentContent.trimEnd() + '\n\n## Rules\n- ' + ruleText + '\n';
    const wr = await callServer({ type: 'write', path: folder + '/YUYU.md', content: newContent });
    pushMsg(setMessages, wr.ok
      ? '✅ Rule ditambahkan ke YUYU.md:\n> `' + ruleText + '`\n\nAktif di sesi berikutnya dan setiap agent loop.'
      : '❌ Gagal tulis YUYU.md: ' + (wr.data || '?')
    );
    setLoading(false);
  }, [folder, setLoading, setMessages]);

  const handleRulesClear = useCallback(async () => {
    setLoading(true);
    const wr = await callServer({ type: 'write', path: folder + '/YUYU.md', content: '# YUYU.md — Project Rules\n\n## Rules\n' });
    pushMsg(setMessages, wr.ok ? '🗑 YUYU.md di-reset. Rules lama dihapus.' : '❌ Gagal reset: ' + (wr.data || '?'));
    setLoading(false);
  }, [folder, setLoading, setMessages]);

  const handleRulesInit = useCallback(async (parts) => {
    setLoading(true);
    const existR = await callServer({ type: 'read', path: folder + '/YUYU.md' });
    if (existR.ok && existR.data && parts[2] !== 'overwrite') {
      pushMsg(setMessages, '⚠️ YUYU.md sudah ada. Ketik `/rules init overwrite` untuk timpa.');
      setLoading(false); return;
    }
    await sendMsg('Buat YUYU.md di root project ini. Analisis codebase sebentar (tree + package.json), lalu tulis YUYU.md berisi:\n\n## Coding Standards\n(naming convention, strict TS, dll)\n\n## Architecture Decisions\n(state management, file structure, dll)\n\n## Forbidden Patterns\n(anti-patterns yang harus dihindari)\n\n## Preferred Libraries\n(library yang sudah dipilih untuk tiap kategori)\n\n## Commands\n(dev, build, test, deploy)\n\nSingkat, padat, max 60 baris. Tulis dengan write_file ke YUYU.md.');
    setLoading(false);
  }, [folder, setLoading, setMessages, sendMsg]);

  const handleRules = useCallback(async (parts) => {
    const subHandlers = { add: () => handleRulesAdd(parts), clear: () => handleRulesClear(), init: () => handleRulesInit(parts), edit: () => sendMsg('Baca YUYU.md lalu bantu aku edit. Tampilkan isinya dulu.') };
    if (!parts[1] || parts[1] === 'show') {
      setLoading(true);
      const r = await callServer({ type: 'read', path: folder + '/YUYU.md' });
      pushMsg(setMessages, r.ok && r.data
        ? '📋 **YUYU.md** — Project rules aktif:\n\n```markdown\n' + r.data + '\n```\n\n*Edit: `/rules add "..."` atau `/rules edit`*'
        : '📋 **YUYU.md belum ada.**\n\nBuat dengan `/rules add "rule pertama kamu"` atau `/rules init` untuk template lengkap.'
      );
      setLoading(false);
    } else if (subHandlers[parts[1]]) {
      await subHandlers[parts[1]]();
    } else {
      pushMsg(setMessages, '**`/rules`** — Manage project rules (YUYU.md)\n\n- `/rules` — lihat rules aktif\n- `/rules add "..."` — tambah rule\n- `/rules clear` — hapus semua\n- `/rules init` — generate dari project\n- `/rules edit` — edit via AI');
    }
  }, [folder, setLoading, setMessages, sendMsg]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInit = useCallback(async (parts) => {
    setLoading(true);
    pushMsg(setMessages, '🌱 Menganalisis project untuk generate SKILL.md...');
    const [pkgR, structR, gitR, existR] = await Promise.all([
      callServer({ type: 'read', path: folder + '/package.json' }),
      callServer({ type: 'list', path: folder + '/src' }),
      callServer({ type: 'exec', path: folder, command: 'git log --oneline -5 2>/dev/null || echo "no git"' }),
      callServer({ type: 'read', path: folder + '/SKILL.md' }),
    ]);
    if (existR.ok && existR.data && parts[1] !== 'overwrite') {
      pushMsg(setMessages, '⚠️ SKILL.md sudah ada. Ketik `/init overwrite` untuk timpa.');
      setLoading(false); return;
    }
    const pkgInfo  = pkgR.ok ? pkgR.data.slice(0, 800) : 'tidak ada package.json';
    const srcFiles = structR.ok && Array.isArray(structR.data) ? structR.data.filter(f => !f.isDir).map(f => f.name).join(', ') : 'tidak diketahui';
    const gitLog   = gitR.ok ? gitR.data.trim() : '';
    await sendMsg(`Generate SKILL.md untuk project ini. Analisis:\n\npackage.json:\n\`\`\`\n${pkgInfo}\n\`\`\`\nFile di src/: ${srcFiles}\nGit log: ${gitLog}\n\nBuat SKILL.md yang berisi:\n1. Tentang project (1-2 baris)\n2. Stack & dependencies utama\n3. Struktur file penting\n4. Aturan coding project ini (naming convention, dll)\n5. Command penting (dev, build, test)\n\nTulis ke SKILL.md menggunakan write_file. Format singkat, padat, max 50 baris.`);
    setLoading(false);
  }, [folder, setLoading, setMessages, sendMsg]);

  const handleBgMerge = useCallback(async (parts) => {
    const id = parts[1]?.trim();
    if (!id) { pushMsg(setMessages, 'Usage: /bgmerge <agent-id>'); return; }
    setLoading(true);
    pushMsg(setMessages, '🔀 Merging agent ' + id + '...');
    const result = await mergeBackgroundAgent(id, folder);
    if (result.hasConflicts) {
      setMergeConflictData(result); setShowMergeConflict(true);
      pushMsg(setMessages, '⚠ **Konflik di ' + result.conflicts.length + ' file:**\n' + result.conflicts.map(c => '• ' + c).join('\n') + '\n\nBuka panel konflik untuk pilih strategi resolusi.');
    } else {
      pushMsg(setMessages, result.ok ? '✅ ' + result.msg : '❌ ' + result.msg);
    }
    setLoading(false);
  }, [folder, setLoading, setMessages, setMergeConflictData, setShowMergeConflict]);

  const handleRefactor = useCallback(async (parts) => {
    const oldName = parts[1]?.trim(), newName2 = parts[2]?.trim();
    if (!oldName || !newName2) { pushMsg(setMessages, 'Usage: /refactor <nama_lama> <nama_baru>'); return; }
    setLoading(true);
    pushMsg(setMessages, '🔄 Refactor: ' + oldName + ' → ' + newName2 + '...');
    const searchR = await callServer({ type: 'search', path: folder + '/src', content: oldName });
    const fileList = searchR.ok
      ? [...new Set((searchR.data || '').split('\n').filter(Boolean).map(l => { const mx = l.match(/^(.+?):\d+:/); return mx ? mx[1] : null; }).filter(Boolean))]
      : [];
    if (fileList.length === 0) { pushErr(setMessages, oldName + ' tidak ditemukan di src/'); setLoading(false); return; }
    await sendMsg('REFACTOR: rename ' + oldName + ' menjadi ' + newName2 + ' di: ' + fileList.join(', ') + '. Baca tiap file, ganti semua occurrence, lalu write_file.');
    setLoading(false);
  }, [folder, setLoading, setMessages, sendMsg]);

  const handleLint = useCallback(async () => {
    setLoading(true);
    pushMsg(setMessages, '🔍 Running lint...');
    const lintR = await callServer({ type: 'exec', path: folder, command: 'npm run lint 2>&1 || true' });
    const lintOut = lintR.data || '';
    pushMsg(setMessages, '```bash\n' + lintOut.slice(0, 1000) + '\n```');
    if (lintOut.toLowerCase().includes('error') && !lintOut.includes('0 error'))
      setTimeout(() => sendMsg('Ada lint error. Fix semua error ini:\n```\n' + lintOut.slice(0, 600) + '\n```'), 500);
    else pushMsg(setMessages, '✅ Lint clean!');
    setLoading(false);
  }, [folder, setLoading, setMessages, sendMsg]);

  const handleSelfEdit = useCallback(async (parts) => {
    const task = parts.slice(1).join(' ').trim() || 'Fix bugs, hapus dead code, optimasi performa';
    setLoading(true);
    const appPath = folder + '/src/App.jsx';
    const r = await callServer({ type: 'read', path: appPath, from: 1, to: 50 });
    if (!r.ok) { pushErr(setMessages, `Tidak bisa baca \`${appPath}\`\n\nPastikan folder project sudah benar.`); setLoading(false); return; }
    pushMsg(setMessages, `🔧 **Self-edit dimulai...**\n\nTask: _${task}_`);
    setLoading(false);
    await sendMsg(`MODE: SELF-EDIT\n\nTask: ${task}\n\nBaca src/App.jsx secara bertahap dengan read_file (from/to 100 baris per request). Setelah baca bagian yang relevan, gunakan write_file untuk patch minimal. Jangan tulis ulang seluruh file.`);
  }, [folder, setLoading, setMessages, sendMsg]);

  const handleWebsearch = useCallback(async (parts) => {
    const query = parts.slice(1).join(' ').trim();
    if (!query) { pushMsg(setMessages, 'Usage: /websearch <query>\nContoh: /websearch react useEffect cleanup'); return; }
    setLoading(true);
    pushMsg(setMessages, '🔍 Searching: **' + query + '**...');
    const r = await callServer({ type: 'web_search', query });
    pushMsg(setMessages, r.ok && r.data ? '🌐 **Web Search: ' + query + '**\n\n' + r.data : '❌ Search gagal: ' + (r.data || 'unknown error'));
    setLoading(false);
  }, [setLoading, setMessages]);

  const handleSummarize = useCallback(async (parts) => {
    const fromN  = parseInt(parts[1]) || 0;
    const slice  = fromN > 0 ? messages.slice(fromN) : messages.slice(1, -6);
    if (slice.length < 3) { pushMsg(setMessages, 'Tidak cukup pesan untuk disummarize.'); return; }
    setLoading(true);
    pushMsg(setMessages, '📦 Summarizing ' + slice.length + ' pesan...');
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
      if (e.name !== 'AbortError') pushErr(setMessages, e.message);
    }
    setLoading(false);
  }, [messages, abortRef, setLoading, setMessages]);

  const handlePlan = useCallback(async (parts) => {
    const task = parts.slice(1).join(' ').trim();
    setLoading(true);
    pushMsg(setMessages, '📋 Generating plan...');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const { steps } = await generatePlan(task, folder, callAI, ctrl.signal);
      setPlanSteps(steps.map(s => ({ ...s, done: false })));
      setPlanTask(task);
      pushMsg(setMessages, '📋 **Plan (' + steps.length + ' langkah):**\n\n' + steps.map(s => s.num + '. ' + s.text).join('\n'));
    } catch (e) {
      if (e.name !== 'AbortError') pushErr(setMessages, e.message);
    }
    setLoading(false);
  }, [folder, abortRef, callAI, setLoading, setMessages, setPlanSteps, setPlanTask]);

  const handleAsk = useCallback((parts) => {
    const modelAlias = { 'kimi': 'moonshotai/kimi-k2-instruct-0905', 'llama': 'llama-3.3-70b-versatile', 'llama8b': 'llama-3.1-8b-instant', 'qwen': 'qwen/qwen3-32b', 'scout': 'meta-llama/llama-4-scout-17b-16e-instruct', 'qwen235': 'qwen-3-235b-a22b-instruct-2507' };
    const alias = parts[1]?.toLowerCase(), targetModel = modelAlias[alias] || parts[1], prompt = parts.slice(2).join(' ').trim();
    if (!targetModel || !prompt) {
      pushMsg(setMessages, '🤖 Usage: `/ask <model> <prompt>`\n\nAlias: `kimi` `llama` `llama8b` `qwen` `scout` `qwen235`\n\nContoh: `/ask kimi review kode ini`');
    } else {
      pushMsg(setMessages, '🤖 Asking **' + alias + '** (' + targetModel.split('/').pop() + ')...');
      sendMsg(prompt, { overrideModel: targetModel });
    }
  }, [setMessages, sendMsg]);

  const handleXp = useCallback(() => {
    const g = growth;
    if (!g) { pushMsg(setMessages, 'Growth system tidak aktif.'); return; }
    const BADGE_DEFS = [
      { id: 'first_blood', label: '🩸 First Blood' }, { id: 'apprentice', label: '🌱 Apprentice' },
      { id: 'coder', label: '⚡ Coder' },             { id: 'hacker', label: '🔥 Hacker' },
      { id: 'streak_3', label: '📅 Konsisten' },      { id: 'streak_7', label: '🗓 Seminggu Penuh' },
      { id: 'streak_30', label: '👑 One Month' },
    ];
    const badgeList = g.badges.length ? g.badges.map(id => BADGE_DEFS.find(x => x.id === id)?.label || id).join(', ') : 'Belum ada';
    const styleInfo = g.learnedStyle ? '\n\n**🧬 Gaya coding yang dipelajari:**\n' + g.learnedStyle : '\n\n_Yuyu belum belajar gaya codingmu. Lanjutkan sesi!_';
    pushMsg(setMessages, `🎮 **YuyuCode Growth**\n\n**Level:** ${g.level}\n**XP:** ${g.xp}${g.nextXp ? ' / ' + g.nextXp + ' (' + g.progress + '%)' : ' — MAX LEVEL 👑'}\n**Streak:** 🔥 ${g.streak} hari\n**Badge:** ${badgeList}` + styleInfo);
  }, [growth, setMessages]);

  const handleBench = useCallback(async (parts) => {
    const sub = parts[1]?.toLowerCase();
    const subCmds = { save: 'node yuyu-bench.cjs --save 2>&1', reset: 'node yuyu-bench.cjs --reset 2>&1', trend: 'node yuyu-bench.cjs --trend 2>&1', export: 'node yuyu-bench.cjs --export 2>&1' };
    if (sub && !subCmds[sub]) { pushMsg(setMessages, '📊 **Usage /bench:**\n`/bench` — run + compare ke baseline\n`/bench save` — update baseline\n`/bench reset` — hapus history\n`/bench trend` — lihat sparkline history\n`/bench export` — export history ke JSON'); return; }
    const cmd = subCmds[sub] || 'node yuyu-bench.cjs 2>&1';
    setLoading(true);
    pushMsg(setMessages, `📊 Running \`${cmd.split(' ').slice(0, 3).join(' ')}\`...`);
    const r      = await callServer({ type: 'exec', path: folder, command: cmd });
    const output = (r.data || r.error || '(no output)').slice(0, 3000);
    const icon   = output.includes('🔴') || output.includes('regression') ? '⚠️' : output.includes('THERMAL WARNING') ? '🌡' : '✅';
    pushMsg(setMessages, `${icon} **Bench result:**\n\`\`\`\n${output}\n\`\`\``);
    setLoading(false);
  }, [folder, setLoading, setMessages]);

  const handleTest = useCallback(async (parts) => {
    const targetPath = parts.slice(1).join(' ').trim();
    const filePath   = targetPath ? folder + '/' + targetPath.replace(/^\//, '') : selectedFile;
    if (!filePath) { pushMsg(setMessages, 'Usage: /test atau /test src/api.js\nBuka file dulu, atau sebutkan path-nya.'); return; }
    setLoading(true);
    pushMsg(setMessages, '🧪 Generating tests untuk **' + filePath.split('/').pop() + '**...');
    const r = await callServer({ type: 'read', path: filePath });
    if (!r.ok) { pushErr(setMessages, 'Tidak bisa baca file: ' + filePath); setLoading(false); return; }
    const ext      = filePath.split('.').pop();
    const testPath = filePath.replace(/\.(jsx?|tsx?)$/, '.test.$1').replace(/(src\/)/, '$1');
    await sendMsg('Generate unit tests untuk file ini:\n\nFile: ' + filePath + '\n```' + ext + '\n' + r.data.slice(0, 4000) + '\n```\n\nBuat test file di: ' + testPath + '\nGunakan Vitest (import { describe, it, expect } from "vitest"). Cover: happy path, edge case, error case. Langsung write_file, jangan tanya.');
    setLoading(false);
  }, [folder, selectedFile, setLoading, setMessages, sendMsg]);

  const handleScaffold = useCallback(async (parts) => {
    const tpl = parts[1]?.toLowerCase();
    if (!tpl || !['react', 'node', 'express'].includes(tpl)) {
      pushMsg(setMessages, '🏗 Usage: /scaffold react|node|express\n\n**react** — Vite + React 19\n**node** — Node.js CLI app\n**express** — Express REST API');
      return;
    }
    setLoading(true);
    pushMsg(setMessages, '🏗 Scaffolding **' + tpl + '** project di ' + folder + '...');
    await sendMsg('Scaffold project ' + tpl + ' di folder ' + folder + '. Buat struktur file lengkap dengan write_file: package.json, file utama, README.md singkat. Pakai dependencies terbaru 2025. Langsung buat tanpa tanya.');
    setLoading(false);
  }, [folder, setLoading, setMessages, sendMsg]);

  const handleMcp = useCallback(async (parts) => {
    const sub = parts[1]?.toLowerCase();
    const mcpSubs = { list: () => mcpList(setLoading, setMessages), connect: () => mcpConnect(parts, setLoading, setMessages), disconnect: () => mcpDisconnect(parts, setLoading, setMessages) };
    if (mcpSubs[sub]) await mcpSubs[sub]();
    else setShowMCP(true);
  }, [setShowMCP, setLoading, setMessages]);

  // ── Main dispatcher ────────────────────────────────────────────────────────

  const handleSlashCommand = useCallback(async (cmd) => {
    const parts = cmd.trim().split(' ');
    const base  = parts[0];

    const simpleActions = {
      '/checkpoint':  () => saveCheckpoint(),
      '/restore':     () => setShowCheckpoints(true),
      '/export':      () => exportChat(),
      '/history':     () => { if (!selectedFile) { pushMsg(setMessages, 'Buka file dulu Papa~'); return; } setShowFileHistory(true); },
      '/actions':     () => setShowCustomActions(true),
      '/split':       () => { setSplitView(s => !s); pushMsg(setMessages, 'Split view ' + (splitView ? 'dimatikan' : 'diaktifkan') + '~'); },
      '/browse':      () => { const url = parts.slice(1).join(' '); if (!url) { pushMsg(setMessages, 'Usage: /browse https://...'); return; } browseTo(url); },
      '/swarm':       () => { const task = parts.slice(1).join(' '); if (!task) { pushMsg(setMessages, 'Usage: /swarm <deskripsi task>'); return; } runAgentSwarm(task); },
      '/theme':       () => setShowThemeBuilder(true),
      '/mcp':         () => handleMcp(parts),
      '/github':      () => setShowGitHub(true),
      '/deploy':      () => setShowDeploy(true),
      '/skills':      () => setShowSkills(true),
      '/permissions': () => setShowPermissions(true),
      '/sessions':    async () => { const sessions = await loadSessions(); setSessionList(sessions); setShowSessions(true); },
      '/plugin':      () => setShowPlugins(true),
      '/config':      () => setShowConfig(true),
      '/bgstatus':    () => setShowBgAgents(true),
      '/usage':       () => pushMsg(setMessages, tokenTracker.summary()),
      '/simplify':    () => { if (!selectedFile) { pushMsg(setMessages, 'Buka file dulu Papa~'); return; } sendMsg('Simplifikasi kode di ' + selectedFile + '. Hapus dead code, perpendek fungsi yang terlalu panjang, perbaiki naming. Jangan ubah fungsionalitas. Gunakan write_file untuk patch minimal.'); },
      '/ptt':         () => { setPushToTalk(p => !p); pushMsg(setMessages, '🎙 Push-to-talk ' + (pushToTalk ? 'dimatikan' : 'diaktifkan. Tahan 🎙 untuk rekam, lepas untuk kirim.') + '.'); },
      '/open':        () => { const url = parts.slice(1).join(' ').trim(); if (!url) { pushMsg(setMessages, 'Usage: /open https://...'); return; } window.open(url, '_blank'); pushMsg(setMessages, '🌐 Membuka: ' + url); },
    };

    if (simpleActions[base]) { await simpleActions[base](); return; }

    const handlers = {
      '/model':     () => handleModel(),
      '/compact':   () => handleCompact(parts),
      '/handoff':   () => handleHandoff(),
      '/cost':      () => { const s = tokenTracker.summary(); const c = ((tokenTracker.inputTokens / 1000) * 0.03 + (tokenTracker.outputTokens / 1000) * 0.06).toFixed(3); pushMsg(setMessages, s + '\n\n💰 **Estimasi vs GPT-4o:** ~$' + c + ' (kamu pakai gratis 🎉)'); },
      '/review':    () => handleReview(parts),
      '/stop':      () => { if (loading) { setGracefulStop(true); pushMsg(setMessages, '⏸ **Graceful stop** — Yuyu akan menyelesaikan iterasi ini lalu berhenti.'); } else pushMsg(setMessages, '✅ Tidak ada yang berjalan sekarang.'); },
      '/clear':     () => { if (parts[1] !== 'force' && messages.length > 3) { pushMsg(setMessages, '🗑 **Mau clear chat?**\n\n- `/save` dulu untuk simpan sesi ini\n- `/clear force` untuk langsung hapus tanpa simpan\n\n_Ketik salah satu atau lanjut ngobrol._'); } else { setMessages([{ role: 'assistant', content: 'Chat dibersihkan. Mau ngerjain apa Papa? 🌸' }]); Preferences.remove({ key: 'yc_history' }); } },
      '/search':    () => handleSearch(parts),
      '/diff':      () => handleDiff(parts),
      '/deps':      () => handleDeps(),
      '/font':      () => { const size = parseInt(parts[1]) || 14; setFontSize(size); Preferences.set({ key: 'yc_fontsize', value: String(size) }); pushMsg(setMessages, '🔤 Font size diubah ke ' + size + 'px~'); },
      '/db':        () => handleDb(parts),
      '/status':    () => handleStatus(),
      '/tokens':    () => { const bd = messages.slice(-10).map(m => (m.role === 'user' ? 'Papa' : 'Yuyu') + ': ~' + Math.round(m.content.length / 4) + 'tk').join('\n'); pushMsg(setMessages, '📓 **Token breakdown (10 pesan terakhir)**\n```\n' + bd + '\n```\n**Total:** ~' + countTokens(messages) + 'tk | Cerebras gratis 🎉'); },
      '/pin':       () => handlePin(parts),
      '/unpin':     () => { const target = parts.slice(1).join(' ').trim() || selectedFile; if (target) { togglePin(target.startsWith('/') ? target : folder + '/' + target); pushMsg(setMessages, '📌 Unpinned: `' + target + '`'); } },
      '/index':     async () => { setLoading(true); pushMsg(setMessages, '🔍 Building symbol index...'); const srcPath = parts[1] ? folder + '/' + parts[1] : folder + '/src'; const idxR = await callServer({ type: 'index', path: srcPath }); const meta = idxR.meta || {}; pushMsg(setMessages, idxR.ok ? `✅ **Symbol Index** (${meta.files || '?'} files, ${meta.symbols || '?'} symbols)\n\n${idxR.data}` : '❌ Index gagal: ' + (idxR.data || 'unknown error')); setLoading(false); },
      '/thinking':  () => { const next = !thinkingEnabled; setThinkingEnabled(next); Preferences.set({ key: 'yc_thinking', value: next ? '1' : '0' }); pushMsg(setMessages, '🧠 Think-aloud mode ' + (next ? 'aktif — Yuyu akan tulis reasoning singkat dalam <think> sebelum jawab.' : 'nonaktif.')); },
      '/save':      async () => { const name = parts.slice(1).join(' ').trim() || sessionName || 'Session ' + new Date().toLocaleString('id'); const s = await saveSession(name, messages, folder, branch); setSessionName(name); pushMsg(setMessages, '💾 Sesi disimpan: **' + s.name + '**'); },
      '/debug':     () => pushMsg(setMessages, ['**Debug Info**', 'Model: ' + model, 'Effort: ' + effort, 'Thinking: ' + (thinkingEnabled ? 'on' : 'off'), 'Messages: ' + messages.length, 'Tokens (est): ~' + countTokens(messages) + 'tk', 'Skills: ' + skills.length, 'Folder: ' + folder, 'Branch: ' + branch].join('\n')),
      '/plan':      () => handlePlan(parts),
      '/effort':    () => { const lvl = parts[1]?.toLowerCase(); if (!['low', 'medium', 'high'].includes(lvl)) { pushMsg(setMessages, '⚡ Effort sekarang: **' + effort + '**\nUsage: /effort low|medium|high'); return; } setEffort(lvl); Preferences.set({ key: 'yc_effort', value: lvl }); pushMsg(setMessages, '⚡ Effort: **' + lvl + '**'); },
      '/undo':      () => handleUndo(parts),
      '/rewind':    () => { const turns = parseInt(parts[1]) || 1; const rewound = rewindMessages(messages, turns); setMessages(rewound); pushMsg(setMessages, '⏪ Rewind ' + turns + ' turn. ' + rewound.length + ' pesan tersisa.'); },
      '/rename':    () => { const name = parts.slice(1).join(' ').trim(); setSessionName(name); Preferences.set({ key: 'yc_session_name', value: name }); pushMsg(setMessages, '✏️ Sesi: **' + name + '**'); },
      '/bg':        async () => { const task = parts.slice(1).join(' ').trim(); const id = await runBackgroundAgent(task, folder, callAI, (id, agent) => { sendNotification('YuyuCode 🤖', 'Agent selesai! ' + (agent.result?.allWrites?.length || 0) + ' file siap. Buka /bgstatus untuk merge.'); setShowBgAgents(true); haptic('heavy'); }); pushMsg(setMessages, '🤖 Background agent: ' + task + '\nID: ' + id); },
      '/bgmerge':   () => handleBgMerge(parts),
      '/loop':      () => handleLoop(parts),
      '/amemory':   () => handleAmemory(parts),
      '/batch':     () => handleBatch(parts),
      '/color':     () => { const color = parts[1]?.trim(); const colors = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6', purple: '#a855f7', yellow: '#eab308', pink: '#ec4899', orange: '#f97316', off: 'off' }; if (!color || !colors[color]) { pushMsg(setMessages, '🎨 Session color sekarang: ' + (sessionColor || 'off') + '\nUsage: /color red|green|blue|purple|yellow|pink|orange|off'); return; } const newColor = color === 'off' ? null : colors[color]; setSessionColor(newColor); Preferences.set({ key: 'yc_session_color', value: newColor || '' }); pushMsg(setMessages, '🎨 Session color: **' + color + '**'); },
      '/watch':     () => { if (fileWatcherActive) { clearInterval(fileWatcherInterval); setFileWatcherActive(false); setFileWatcherInterval(null); pushMsg(setMessages, '👁 File watcher dimatikan.'); } else { setFileWatcherActive(true); setFileSnapshots({}); pushMsg(setMessages, '👁 File watcher aktif. Yuyu akan notify real-time via WebSocket kalau ada file berubah dari luar app.'); } },
      '/refactor':  () => handleRefactor(parts),
      '/lint':      () => handleLint(),
      '/bench':     () => handleBench(parts),
      '/self-edit': () => handleSelfEdit(parts),
      '/websearch': () => handleWebsearch(parts),
      '/rules':     () => handleRules(parts),
      '/init':      () => handleInit(parts),
      '/tree':      async () => { setLoading(true); const depth = parseInt(parts[1]) || 2; const r = await callServer({ type: 'tree', path: folder, depth }); pushMsg(setMessages, '📁 **Tree (depth ' + depth + '):**\n```\n' + (r.data || '(kosong)').slice(0, 2000) + '\n```'); setLoading(false); },
      '/summarize': () => handleSummarize(parts),
      '/scaffold':  () => handleScaffold(parts),
      '/ask':       () => handleAsk(parts),
      '/ab':        async () => { const task = parts.slice(1).join(' ').trim(); if (!task) { pushMsg(setMessages, 'Usage: /ab <task>\nContoh: /ab implementasi dark mode toggle\n\nOtomatis test dua model terbaik secara paralel.'); return; } await abTest(task, 'qwen-3-235b-a22b-instruct-2507', 'moonshotai/kimi-k2-instruct-0905'); },
      '/xp':        () => handleXp(),
      '/test':      () => handleTest(parts),
    };

    if (handlers[base]) await handlers[base]();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, folder, branch, messages, selectedFile, fileContent, notes, memories, skills,
      thinkingEnabled, effort, loopActive, loopIntervalRef, agentMemory, splitView,
      pushToTalk, sessionName, sessionColor, fileWatcherActive, fileWatcherInterval,
      loading, editHistory, pinnedFiles,
      handleModel, handleCompact, handleHandoff, handleReview, handleSearch, handleDiff,
      handleDeps, handleDb, handleStatus, handlePin, handleUndo, handleLoop, handleAmemory,
      handleBatch, handleRules, handleInit, handleBgMerge, handleRefactor, handleLint,
      handleBench, handleSelfEdit, handleWebsearch, handleSummarize, handlePlan, handleAsk, handleXp,
      handleTest, handleScaffold, handleMcp]);

  return { handleSlashCommand };
}
