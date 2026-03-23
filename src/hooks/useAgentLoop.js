import { useRef } from 'react';
import { askCerebrasStream, callServer } from '../api.js';
import { parseActions, executeAction, resolvePath, generateDiff } from '../utils.js';
import { runHooksV2, checkPermission, tokenTracker, parseElicitation, tfidfRank, selectSkills } from '../features.js';
import { BASE_SYSTEM, AUTO_COMPACT_CHARS, AUTO_COMPACT_MIN_MSG, MAX_FILE_PREVIEW, VISION_MODEL, getSystemForModel } from '../constants.js';

// ── Module-level helpers for sendMsg ─────────────────────────────────────────

async function checkServerHealth() {
  try {
    const ping = await callServer({ type: 'ping' });
    return ping.ok;
  } catch (_e) { return false; }
}

function isExecError(a) {
  if (a.type !== 'exec') return false;
  const out = (a.result?.data || '').toLowerCase();
  if (!out.trim()) return false;
  const hasErr = out.includes('error') || out.includes('exception') || out.includes('traceback') ||
    out.includes('cannot find module') || out.includes('command not found') ||
    out.includes('exit code 1') || out.includes('failed to compile') ||
    out.includes('syntaxerror') || out.includes('typeerror') || out.includes('referenceerror');
  const isFP = out.includes('no error') || out.includes('0 errors') ||
    out.includes('syntax ok') || out.includes('passed') || out.includes('✅');
  return hasErr && !isFP;
}

function buildFeedback(readActions, safeActions, webSearchActions, patchActions, fullWriteActions, execActions) {
  const FILE_FEEDBACK_LIMIT = 1200; // chars per file — cukup untuk patch, hemat token
  const fileData = [...readActions, ...safeActions]
    .filter(a => a.result?.ok && !['exec','web_search','patch_file'].includes(a.type))
    .map(a => {
      const content = (a.result?.data || '');
      const truncated = content.length > FILE_FEEDBACK_LIMIT
        ? content.slice(0, FILE_FEEDBACK_LIMIT) + '\n… [+' + (content.length - FILE_FEEDBACK_LIMIT) + ' chars, baca per chunk kalau perlu]'
        : content;
      return '=== ' + (a.path || a.type) + ' ===\n' + truncated;
    })
    .join('\n\n');
  const webData = webSearchActions
    .filter(a => a.result?.ok)
    .map(a => '🌐 ' + (a.query || '') + '\n' + (a.result?.data || ''))
    .join('\n\n');
  const patchData = patchActions.length
    ? patchActions.map(a => (a.result?.ok ? '✅ patch ' : '❌ patch ') + a.path).join('\n') : '';
  const writeData = fullWriteActions.length
    ? fullWriteActions.map(a => (a.result?.ok ? '✅ written ' : '❌ write failed ') + a.path).join('\n') : '';
  const execData = execActions
    .filter(a => a.type === 'exec' && a.result?.data)
    .map(a => '$ ' + a.command + '\n' + (a.result?.data || '').slice(0, 800))
    .join('\n\n');
  return [fileData, webData, patchData, writeData, execData].filter(Boolean).join('\n\n');
}

async function autoLoadImports(readActions, autoContext, projectFolder) {
  const importRegex = /(?:import|require)\s+[^'"]*['"]([^'"]+)['"]/g;
  for (const a of readActions) {
    if (!a.result?.ok || !a.path) continue;
    let im;
    const re = new RegExp(importRegex.source, 'g');
    while ((im = re.exec(a.result.data || '')) !== null) {
      const imp = im[1];
      if (!imp.startsWith('.')) continue;
      const base = a.path.split('/').slice(0, -1).join('/');
      const candidates = [imp, imp + '.jsx', imp + '.js', imp + '.ts', imp + '.tsx']
        .map(s => base + '/' + s.replace('./', '/').replace('//', '/'));
      for (const cand of candidates) {
        if (autoContext[cand]) continue;
        const r = await callServer({ type: 'read', path: resolvePath(projectFolder, cand) });
        if (r.ok) { autoContext[cand] = r.data; break; }
      }
    }
  }
}

function getRunCmd(wr, projectFolder) {
  const ext = (wr.path || '').split('.').pop().toLowerCase();
  const abs = resolvePath(projectFolder, wr.path);
  if (['js','mjs','cjs'].includes(ext))  return `node "${abs}" 2>&1 | head -30`;
  if (ext === 'py')                       return `python3 "${abs}" 2>&1 | head -30`;
  if (ext === 'sh')                       return `bash "${abs}" 2>&1 | head -30`;
  if (wr.path?.includes('.test.'))        return `cd "${projectFolder}" && npx vitest run "${abs}" 2>&1 | tail -20`;
  return null;
}

async function autoVerifyWrites(fullWriteActions, projectFolder, allMessages, reply, iter, MAX_ITER) {
  for (const wr of fullWriteActions.filter(a => a.result?.ok)) {
    const runCmd = getRunCmd(wr, projectFolder);
    if (!runCmd) continue;
    const vr  = await callServer({ type: 'exec', path: projectFolder, command: runCmd });
    const out = (vr.data || '').trim();
    if (!out) continue;
    const hasErr = /error|exception|traceback|syntaxerror|typeerror|referenceerror|cannot find/i.test(out)
      && !/syntax ok|passed|✅|0 error/i.test(out);
    if (hasErr && iter < MAX_ITER) {
      return [
        ...allMessages,
        { role: 'assistant', content: reply.replace(/```action.*?```/gs, '').trim() },
        { role: 'user', content: '⚡ Auto-verify: run **' + wr.path.split('/').pop() + '**\n```\n' + out.slice(0, 600) + '\n```\nAda error — fix langsung.' },
      ];
    }
  }
  return null;
}

export function useAgentLoop({
  project, chat, file, ui,
  sendNotification, haptic, speakText,
  abortRef, handleSlashCommandRef,
  growth,
}) {
  const autoContextRef = useRef({});

  // ── callAI ──
  function callAI(msgs, onChunk, signal, imageBase64) {
    const cfg   = project.effortCfg;
    const model = imageBase64 ? VISION_MODEL : project.model;
    return askCerebrasStream(msgs, model, onChunk, signal, {
      maxTokens: cfg.maxTokens,
      imageBase64,
      onFallback: (fallbackModel) => {
        const label = fallbackModel.split('/').pop().split('-').slice(0, 3).join('-');
        chat.setMessages(m => [...m, {
          role: 'assistant',
          content: '⚡ Rate limit — lanjut pakai **' + label + '**',
          actions: [],
        }]);
      },
    });
  }

  // ── abTest — kirim ke dua model paralel, tampilkan side by side ──
  async function abTest(task, modelA, modelB) {
    const cfg  = project.effortCfg;
    const msgs = [{ role: 'user', content: task }];
    const sys  = buildSystemPrompt(task, cfg);
    const full = [{ role: 'system', content: sys }, ...msgs];

    chat.setMessages(m => [...m,
      { role: 'user', content: task, actions: [] },
      { role: 'assistant', content: `⚗️ **A/B Test:** \`${modelA.split('/').pop()}\` vs \`${modelB.split('/').pop()}\`
Menunggu kedua model...`, actions: [] }
    ]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    chat.setLoading(true);

    let outA = '', outB = '';
    try {
      const [replyA, replyB] = await Promise.all([
        askCerebrasStream(full, modelA, (t) => { outA = t; }, ctrl.signal, { maxTokens: cfg.maxTokens }),
        askCerebrasStream(full, modelB, (t) => { outB = t; }, ctrl.signal, { maxTokens: cfg.maxTokens }),
      ]);
      outA = replyA; outB = replyB;
    } catch (_e) {
      chat.setMessages(m => [...m, { role: 'assistant', content: '❌ A/B test gagal.', actions: [] }]);
      chat.setLoading(false);
      return;
    }

    const labelA = modelA.split('/').pop().slice(0, 20);
    const labelB = modelB.split('/').pop().slice(0, 20);
    chat.setMessages(m => [
      ...m.slice(0, -1), // hapus "Menunggu..." bubble
      {
        role: 'assistant',
        content: `⚗️ **A/B Test selesai!**

**🅰 ${labelA}:**
${outA.slice(0, 1500)}

---

**🅱 ${labelB}:**
${outB.slice(0, 1500)}

*Pilih yang terbaik untuk dilanjutkan, atau ketik pesan baru.*`,
        actions: [],
      }
    ]);
    chat.setLoading(false);
    growth?.addXP('message_sent');
  }

  // ── compactContext ──
  async function compactContext(inlineCall = false) {
    const currentMsgs = chat.messages;
    if (currentMsgs.length < 10) {
      chat.setMessages(m => [...m, { role: 'assistant', content: 'Context masih kecil, belum perlu compact~', actions: [] }]);
      return;
    }
    if (!inlineCall) chat.setLoading(true);
    const ctrl = new AbortController();
    if (!inlineCall) abortRef.current = ctrl;
    const signal = inlineCall ? abortRef.current?.signal : ctrl.signal;
    try {
      const toCompact = currentMsgs.slice(1, -6);
      const summary   = await askCerebrasStream([
        { role: 'system', content: 'Buat ringkasan singkat percakapan coding ini. Fokus: keputusan teknis, files diubah, bug fix, status project. Maks 300 kata. Bahasa Indonesia.' },
        { role: 'user',   content: toCompact.map(m => m.role + ': ' + (m.content || '').slice(0, 300)).join('\n\n') },
      ], 'llama3.1-8b', () => {}, signal, { maxTokens: 512 });
      const compacted = [
        currentMsgs[0],
        { role: 'assistant', content: '📦 **Context dicompact** (' + toCompact.length + ' pesan):\n\n' + summary, actions: [] },
        ...currentMsgs.slice(-6),
      ];
      chat.setMessages(compacted);
    } catch (e) {
      if (e.name !== 'AbortError') {
        chat.setMessages(m => [...m, { role: 'assistant', content: '❌ Compact gagal: ' + e.message, actions: [] }]);
      }
    }
    if (!inlineCall) chat.setLoading(false);
  }

  // ── executeWithPermission ──
  async function executeWithPermission(a, folder) {
    if (!checkPermission(project.permissions, a.type)) {
      return { ok: false, data: '⛔ Permission ditolak: ' + a.type + '. Aktifkan di /permissions.' };
    }
    await runHooksV2(project.hooks.preToolCall, a.type + ':' + (a.path || a.command || ''), folder);
    const result = await executeAction(a, folder);
    await runHooksV2(project.hooks.postToolCall, a.type + ':' + (a.path || a.command || ''), folder);
    return result;
  }


  // ── gatherProjectContext — "read before act" ─────────────────────────────────
  async function gatherProjectContext(txt, _signal) {
    if (!project.folder) return {};
    const ctx = {};
    const folder = project.folder;

    const [handoffR, yuyuMdR, llmsR, mapR, treeR] = await Promise.all([
      callServer({ type: 'read', path: folder + '/.yuyu/handoff.md' }),
      callServer({ type: 'read', path: folder + '/YUYU.md' }),
      callServer({ type: 'read', path: folder + '/llms.txt', from: 1, to: 80 }),
      callServer({ type: 'read', path: folder + '/.yuyu/map.md', from: 1, to: 120 }),
      callServer({ type: 'tree', path: folder, depth: 2 }),
    ]);
    if (handoffR.ok && handoffR.data) ctx['__handoff__'] = handoffR.data;
    if (yuyuMdR.ok && yuyuMdR.data) { ctx['__yuyu_rules__'] = yuyuMdR.data; project.setYuyuMd(yuyuMdR.data); }
    if (llmsR.ok && llmsR.data)      ctx['__llms__'] = llmsR.data;
    if (mapR.ok && mapR.data)         ctx['__map__'] = mapR.data;
    if (treeR.ok)                     ctx['__tree__'] = treeR.data;

    const pinned = (file.pinnedFiles || []).slice(0, 5);
    if (pinned.length) {
      const pinnedReads = await Promise.all(pinned.map(p => callServer({ type: 'read', path: p, to: 80 })));
      pinnedReads.forEach((r, i) => { if (r.ok) ctx['📌 ' + pinned[i].split('/').pop()] = r.data; });
    }

    if (/refactor|overhaul|all files|semuanya|codebase|arsitektur/i.test(txt)) {
      const compR = await callServer({ type: 'read', path: folder + '/.yuyu/compressed.md', from: 1, to: 200 });
      if (compR.ok && compR.data) ctx['__compressed__'] = compR.data;
    }

    const kw = txt.toLowerCase();
    const KEYWORD_FILES = [
      [['api','fetch','cerebras','groq'],         '/src/api.js'],
      [['agent','loop','sendmsg'],                 '/src/hooks/useAgentLoop.js'],
      [['panel','ui','modal'],                     '/src/components/panels.jsx'],
      [['constant','model','theme'],               '/src/constants.js'],
      [['server','yuyu-server','exec'],            '/yuyu-server.js'],
      [['feature','skill','plan'],                 '/src/features.js'],
      [['brightness','gamma','color'],             '/src/hooks/useBrightness.js'],
      [['slash','command'],                        '/src/hooks/useSlashCommands.js'],
      [['editor','codemirror','tab'],              '/src/components/FileEditor.jsx'],
    ];
    const keyFiles = [];
    const fileMatch = txt.match(/\b([\w/-]+\.(?:js|jsx|ts|tsx|json|md|css|py|sh))\b/g);
    if (fileMatch) fileMatch.forEach(f => keyFiles.push(f.startsWith('/') ? f : folder + '/src/' + f));
    KEYWORD_FILES.forEach(([keys, file]) => { if (keys.some(k => kw.includes(k))) keyFiles.push(folder + file); });

    const unique = [...new Set(keyFiles)].slice(0, 5);
    const reads  = await Promise.all(unique.map(p => callServer({ type: 'read', path: p, from: 1, to: 50 })));
    unique.forEach((p, i) => { if (reads[i].ok && reads[i].data) ctx[p.split('/').pop()] = reads[i].data; });

    return ctx;
  }

  // ── buildSystemPrompt ───────────────────────────────────────────────────────
  function buildSystemPrompt(txt, cfg) {
    const stripFrontmatter = s => s.replace(/^---[\s\S]*?---\n?/, '').trim();
    const notesCtx    = project.notes ? '\n\nProject notes:\n' + project.notes : '';
    const agentsMdCtx = project.agentsMd
      ? '\n\n## AGENTS.md (kontrak project — WAJIB diikuti):\n' + project.agentsMd.slice(0, 3000)
      : '';
    const yuyuMdCtx = project.yuyuMd
      ? '\n\n## YUYU.md (project rules — ikuti selalu):\n' + project.yuyuMd.slice(0, 2000)
      : '';
    const selectedSkills = selectSkills((project.skills || []).filter(s => s.active !== false), txt);
    // Track which skills were used — feeds recency scoring
    if (selectedSkills.length) {
      const now = Date.now();
      project.setSkills?.(skills => skills.map(s =>
        selectedSkills.some(sel => sel.name === s.name) ? { ...s, lastUsed: now } : s
      ));
    }
    const skillCtx    = selectedSkills.length
      ? '\n\nSkill context:\n' + selectedSkills.map(s => '## ' + s.name + '\n' + stripFrontmatter(s.content || '')).join('\n\n---\n\n')
      : '';
    const pinnedCtx   = file.pinnedFiles.length ? '\n\nPinned files: ' + file.pinnedFiles.join(', ') : '';
    // Inject file context only on iter 1 — subsequent iters have it in allMessages already
    const fileCtx     = file.selectedFile && file.fileContent && (cfg._iter === undefined || cfg._iter <= 1)
      ? '\n\nFile terbuka: ' + file.selectedFile + '\n```\n' + file.fileContent.slice(0, MAX_FILE_PREVIEW) + '\n```'
      : '';
    const memPool     = chat.getRelevantMemories(txt);
    const memCtx      = memPool.length ? '\n\nMemories:\n' + memPool.map(m => '• ' + m.text).join('\n') : '';
    const visionCtx   = chat.visionImage ? '\n\n[Gambar dilampirkan]' : '';
    const agentMemCtx = ['user', 'project', 'local'].map(s => {
      const pool   = project.agentMemory[s] || [];
      if (!pool.length) return '';
      const ranked = tfidfRank(pool, txt, 5);
      return '\n\n[' + s + ' memory]:\n' + ranked.map(mx => '• ' + mx.text).join('\n');
    }).join('');
    const thinkNote   = project.thinkingEnabled
      ? '\n\nSebelum respons, tulis reasoning dalam <think>...</think>. Singkat, max 2 kalimat.'
      : '';
    const styleCtx = growth?.learnedStyle
      ? '\n\n[Gaya coding yang dipelajari dari sesi sebelumnya]:\n' + growth.learnedStyle
      : '';
    const modelSystem = getSystemForModel(cfg.model || project?.model || '');
    return modelSystem + cfg.systemSuffix + thinkNote + styleCtx +
      '\n\nFolder aktif: ' + project.folder +
      '\nBranch: ' + project.branch +
      agentsMdCtx + yuyuMdCtx + notesCtx + skillCtx + pinnedCtx + fileCtx + memCtx + agentMemCtx + visionCtx;
  }

    // ── sendMsg — agent loop ──
  async function sendMsg(override, _opts = {}) {
    const txt = (typeof override === 'string' ? override : chat.input).trim();
    if (!txt || chat.loading) return;

    if (txt.startsWith('/')) {
      chat.setInput('');
      chat.setSlashSuggestions([]);
      await handleSlashCommandRef.current?.(txt);
      return;
    }

    chat.setInput('');
    project.setHistIdx(-1);
    project.addHistory(txt);
    chat.setShowFollowUp(false);
    file.setActiveTab('chat');
    chat.setSlashSuggestions([]);
    chat.setVisionImage(null);
    haptic('light');

    const history = [...chat.messages, { role: 'user', content: txt }];
    chat.setMessages(history);
    chat.setLoading(true);
    chat.setStreaming('');
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const totalChars = history.reduce((a, m) => a + (m.content?.length || 0), 0);
    if (totalChars > AUTO_COMPACT_CHARS && history.length > AUTO_COMPACT_MIN_MSG) {
      chat.setMessages(m => [...m, {
        role: 'assistant',
        content: '📦 Auto-compact — context ~' + Math.round(totalChars / 1000) + 'K chars...',
        actions: [],
      }]);
      await compactContext(true); // inline — jangan reset abortRef atau loading
    }

    try {
      const cfg = project.effortCfg;
      const systemPrompt = buildSystemPrompt(txt, { ...cfg, model: project.model });

      // ── Pre-load pinned files ──
      autoContextRef.current = {};
      if (file.pinnedFiles.length) {
        const loaded = await file.readFilesParallel(file.pinnedFiles.slice(0, 3), project.folder);
        Object.entries(loaded).forEach(([p, r]) => { if (r.ok) autoContextRef.current[p] = r.data; });
      }

      // ── Read before act — gather project context sebelum iter 1 ──
      if (project.folder && txt.length > 10 && !txt.startsWith('/')) {
        chat.setAgentStatus('Membaca context...');
        chat.setStreaming('Membaca project context...');
        const gathered = await gatherProjectContext(txt, ctrl.signal);
        Object.assign(autoContextRef.current, gathered);
        chat.setStreaming('');
      }

      const MAX_ITER = cfg.maxIter || 10;
      let iter = 0, allMessages = [...history], finalContent = '', finalActions = [];
      let autoContext = { ...(autoContextRef.current || {}) };

      // ── MAIN AGENT LOOP ──
      // ── Server health check before first iter ──
      const serverOk = await checkServerHealth();
      if (!serverOk) {
        chat.setLoading(false); chat.setStreaming(''); chat.setAgentStatus(null);
        chat.setMessages(m => [...m, { role: 'assistant', content: '❌ **yuyu-server tidak dapat dijangkau!**\n\nPastikan server berjalan di Termux:\n```bash\nyuyu-server-start\n# atau\nnode ~/yuyu-server.js &\n```\n\nLalu coba lagi.', actions: [] }]);
        return;
      }

      let gracefulStopPending = false;
      while (iter < MAX_ITER) {
        iter++;
        if (chat.gracefulStop) {
          chat.setGracefulStop(false);
          chat.setAgentStatus('Menyelesaikan iterasi terakhir...');
          gracefulStopPending = true;
        }
        if (iter > 1) chat.setAgentRunning(true);
        chat.setAgentStatus(`Iter ${iter}/${MAX_ITER}`);

        const DECISION_HINT = iter === 1
          ? '\n\n[WAJIB DIIKUTI — TIDAK ADA PENGECUALIAN]:\n1. LANGSUNG ACTION. Jangan tulis rencana, jangan minta konfirmasi, jangan tanya balik.\n2. Butuh file? Tulis read_file action SEKARANG, bukan bilang "aku akan baca".\n3. Tidak tahu struktur? Tulis tree action SEKARANG.\n4. Bisa jawab dari context? Jawab langsung, tidak perlu action.\n5. DILARANG KERAS: "Saya akan...", "Mari kita...", "Pertama-tama...", "Apakah kamu..."]'
          : '\n[Lanjutkan dengan action. Jangan tanya, jangan rencana — eksekusi langsung.]';
        // Only include autoContext entries not already visible in recent messages
        const recentContent = allMessages.slice(-4).map(m => m.content || '').join('\n');
        const freshCtx = Object.entries(autoContext)
          .filter(([p]) => !recentContent.includes(p))
          .slice(0, 4); // max 4 files in context at once
        const autoCtxBlock = freshCtx.length
          ? '\n\nAuto-loaded context:\n' + freshCtx
              .map(([p, cv]) => '=== ' + p + ' ===\n' + cv.slice(0, 800))
              .join('\n\n')
          : '';

        const systemPromptIter = iter > 1
          ? buildSystemPrompt(txt, { ...cfg, _iter: iter, model: project.model })
          : systemPrompt;
        const groqMsgs = [
          { role: 'system', content: systemPromptIter + DECISION_HINT + autoCtxBlock },
          ...chat.trimHistory(allMessages, project.model).map(m => {
            const raw = Array.isArray(m.content)
              ? m.content.filter(c => c.type === 'text').map(c => c.text).join(' ')
              : (m.content || '');
            return {
              role: m.role,
              content: raw.replace(/```action[\s\S]*?```/g, '').replace(/PROJECT_NOTE:.*?\n/g, '').trim(),
            };
          }),
        ];

        let reply = await callAI(groqMsgs, chat.setStreaming, ctrl.signal, iter === 1 ? chat.visionImage : null);
        chat.setStreaming('');
        chat.setAgentStatus('');

        const inTk  = Math.round(groqMsgs.reduce((a, m) => a + (m.content?.length || 0), 0) / 4);
        const outTk = Math.round((reply?.length || 0) / 4);
        tokenTracker.record(inTk, outTk, project.model);

        const allActs = parseActions(reply);

        // ── Separate actions by type ──
        const patchActions     = allActs.filter(a => a.type === 'patch_file');
        const fullWriteActions = allActs.filter(a => a.type === 'write_file');
        const readActions      = allActs.filter(a => a.type === 'read_file');
        const webSearchActions = allActs.filter(a => a.type === 'web_search');
        const safeParallelTypes = new Set(['list_files','tree','search','mkdir','file_info','find_symbol','move_file']);
        const safeActions      = allActs.filter(a => safeParallelTypes.has(a.type));
        const execActions      = allActs.filter(a => a.type === 'exec' || a.type === 'mcp');

        // ── Read files (parallel) ──
        if (readActions.length > 0) {
          await runHooksV2(project.hooks.preToolCall, 'read_file:batch', project.folder);
          const res = await Promise.all(readActions.map(a => executeAction(a, project.folder)));
          readActions.forEach((a, i) => { a.result = res[i]; });
          await runHooksV2(project.hooks.postToolCall, 'read_file:batch', project.folder);
        }

        // ── Web search + safe actions (all parallel) ──
        if (webSearchActions.length > 0 || safeActions.length > 0) {
          const combined = [...webSearchActions, ...safeActions];
          const res = await Promise.all(combined.map(a => executeWithPermission(a, project.folder)));
          combined.forEach((a, i) => { a.result = res[i]; });
        }

        // ── Exec / MCP (serial — order matters) ──
        for (const a of execActions) {
          a.result = await executeWithPermission(a, project.folder);
        }

        // ── AUTO-EXECUTE / DIFF REVIEW: patch_file ──
        if (patchActions.length > 0) {
          if (project.diffReview) {
            // ── Diff Review mode — pre-compute diff, pause loop, tunggu user ──
            await runHooksV2(project.hooks.preWrite, patchActions.map(a => a.path).join(','), project.folder);
            for (const a of patchActions) {
              const orig = await callServer({ type: 'read', path: resolvePath(project.folder, a.path) });
              if (orig.ok && orig.data && a.old_str) {
                const patched = orig.data.replace(a.old_str, a.new_str ?? '');
                a.diffPreview = generateDiff(orig.data, patched, 60);
                a.original = orig.data;
              }
              a.executed = false; // pending — belum dieksekusi
            }
            finalContent = reply;
            finalActions  = [...allActs];
            chat.setMessages(m => [...m, { role: 'assistant', content: finalContent, actions: finalActions }]);
            chat.setLoading(false);
            chat.setAgentRunning(false);
            return; // loop pause — resume via /continue setelah user approve
          }

          await runHooksV2(project.hooks.preWrite, patchActions.map(a => a.path).join(','), project.folder);
          const patchResults = await Promise.all(patchActions.map(a => executeAction(a, project.folder)));
          patchActions.forEach((a, i) => {
            a.result   = patchResults[i];
            a.executed = true;
          });
          await runHooksV2(project.hooks.postWrite, patchActions.map(a => a.path).join(','), project.folder);

          const failed = patchActions.filter(a => !a.result?.ok);
          if (failed.length > 0) {
            const failInfo = failed.map(a =>
              'patch_file GAGAL di ' + a.path + ': ' + (a.result?.data || '?')
            ).join('\n');
            const ok = patchActions.filter(a => a.result?.ok);
            allMessages = [
              ...allMessages,
              { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
              {
                role:    'user',
                content: (ok.length ? '✅ ' + ok.length + ' patch OK.\n' : '') +
                         '❌ Patch gagal:\n' + failInfo +
                         '\n\nCek old_str — harus exact match. Coba baca ulang bagian file yang relevan lalu patch lagi.',
              },
            ];
            continue;
          }
        }

        // ── AUTO-EXECUTE / DIFF REVIEW: write_file ──
        if (fullWriteActions.length > 0) {
          if (project.diffReview) {
            // ── Diff Review mode — pre-compute diff, pause loop ──
            await runHooksV2(project.hooks.preWrite, fullWriteActions.map(a => a.path).join(','), project.folder);
            for (const a of fullWriteActions) {
              const orig = await callServer({ type: 'read', path: resolvePath(project.folder, a.path) });
              if (orig.ok && orig.data) {
                a.diffPreview = generateDiff(orig.data, a.content || '', 60);
                a.original = orig.data;
              } else {
                const lines = (a.content || '').split('\n');
                a.diffPreview = lines.slice(0, 30).map((l, i) => '+ L' + (i+1) + ': ' + l).join('\n') +
                  (lines.length > 30 ? '\n... (+' + (lines.length - 30) + ' baris lagi)' : '');
              }
              a.executed = false;
            }
            finalContent = reply;
            finalActions  = [...allActs];
            chat.setMessages(m => [...m, { role: 'assistant', content: finalContent, actions: finalActions }]);
            chat.setLoading(false);
            chat.setAgentRunning(false);
            return;
          }

          await runHooksV2(project.hooks.preWrite, fullWriteActions.map(a => a.path).join(','), project.folder);
          const writeResults = await Promise.all(fullWriteActions.map(async a => {
            const backup = await callServer({ type: 'read', path: resolvePath(project.folder, a.path) });
            if (backup.ok) a.original = backup.data;
            return executeAction(a, project.folder);
          }));
          fullWriteActions.forEach((a, i) => {
            a.result   = writeResults[i];
            a.executed = true;
          });
          await runHooksV2(project.hooks.postWrite, fullWriteActions.map(a => a.path).join(','), project.folder);

          const backups = fullWriteActions
            .filter(a => a.original !== undefined)
            .map(a => ({ path: resolvePath(project.folder, a.path), content: a.original }));
          if (backups.length) file.setEditHistory(h => [...h.slice(-(10 - backups.length)), ...backups]);

          // ── Defensive review pass — security & edge cases ──
          if (project.permissions?.exec && fullWriteActions.filter(a=>a.result?.ok).length > 0 && iter < MAX_ITER) {
            const writtenPaths = fullWriteActions.filter(a=>a.result?.ok).map(a=>a.path).join(', ');
            const defReply = await callAI([
              { role: 'system', content: 'Kamu adalah security reviewer. Review kode yang baru ditulis. Cari: (1) missing input validation, (2) unhandled edge cases/errors, (3) potential crashes. Jika ditemukan: tulis patch_file langsung. Jika kode sudah aman: balas hanya "LGTM" tanpa penjelasan.' },
              { role: 'user', content: 'File yang baru ditulis: ' + writtenPaths + '\n\nBaca dan review.' },
            ], ()=>{}, ctrl.signal);
            if (defReply && !defReply.trim().startsWith('LGTM') && !ctrl.signal.aborted) {
              const defActs = parseActions(defReply).filter(a => a.type === 'patch_file');
              for (const a of defActs) {
                const r = await executeWithPermission(a, project.folder);
                a.result = r; a.executed = true;
              }
              if (defActs.some(a => a.result?.ok)) {
                allMessages = [
                  ...allMessages,
                  { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
                  { role: 'user', content: '🛡 Defensive review applied ' + defActs.filter(a=>a.result?.ok).length + ' patch. Lanjutkan.' },
                ];
              }
            }
          }

          // ── Auto-verify after write — run file, feed error back ──
          if (project.permissions?.exec) {
            const verifyBreak = await autoVerifyWrites(fullWriteActions, project.folder, allMessages, reply, iter, MAX_ITER);
            if (verifyBreak) { allMessages = verifyBreak; continue; }
          }
        }

        // ── Auto-load imports dari file yang dibaca ──
        await autoLoadImports(readActions, autoContext, project.folder);

        // ── Exec error → auto-fix loop ──
        const execErrors = execActions.filter(isExecError);

        if (execErrors.length > 0 && iter < MAX_ITER) {
          const errSummary = execErrors.map(a =>
            '[ERROR] ' + (a.command || a.path || '?') + '\n' + (a.result?.data || '').slice(0, 500)
          ).join('\n\n');
          allMessages = [
            ...allMessages,
            { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
            { role: 'user',      content: 'Error output:\n\n' + errSummary + '\n\nAnalisis dan fix langsung.' },
          ];
          continue;
        }

        // ── Build feedback ──
        const allInlineActions = [
          ...readActions, ...webSearchActions, ...safeActions,
          ...execActions, ...patchActions, ...fullWriteActions,
        ];
        const combinedData = buildFeedback(readActions, safeActions, webSearchActions, patchActions, fullWriteActions, execActions);

        // ── Tidak ada data baru → done ──
        if (!combinedData) {
          finalContent = reply;
          finalActions  = allInlineActions;
          break;
        }

        // ── Ada data → feed back ke AI ──
        const agentNote = iter >= MAX_ITER ? '\n\n(Iterasi terakhir. Berikan jawaban final sekarang.)' : '';
        allMessages = [
          ...allMessages,
          { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
          { role: 'user',      content: 'Hasil aksi:\n' + combinedData + '\n\nLanjutkan.' + agentNote },
        ];

        if (gracefulStopPending) {
          finalContent = reply;
          finalActions  = allInlineActions;
          break;
        }
      }

      chat.setAgentRunning(false);
    growth?.addXP('message_sent');
    growth?.learnFromSession(chat.messages, project.folder);
      if (iter > 1) sendNotification('YuyuCode ✅', 'Agent selesai: ' + txt.slice(0, 40));

      if (finalContent.trim().endsWith('CONTINUE')) {
        setTimeout(() => sendMsg('Lanjutkan response sebelumnya dari titik terakhir.'), 300);
        return;
      }

      if (finalContent.includes('PROJECT_NOTE:')) {
        const nm = finalContent.match(/PROJECT_NOTE:(.*?)(?:\n|$)/);
        if (nm) project.setNotes((project.notes + '\n' + nm[1].trim()).trim(), project.folder);
      }

      chat.setMessages(m => [...m, { role: 'assistant', content: finalContent, actions: finalActions }]);

      const elicit = parseElicitation(finalContent);
      if (elicit) ui.setElicitationData(elicit);

      chat.extractMemories(txt, finalContent, project.folder);
      if (chat.ttsEnabled && finalContent) speakText(finalContent);

    } catch (e) {
      chat.setAgentRunning(false);
      if (e.name !== 'AbortError') {
        growth?.addXP('message_sent');
        growth?.learnFromSession(chat.messages, project.folder);
        await runHooksV2(project.hooks.onError, e.message, project.folder).catch(() => {});
        if (e.message.startsWith('RATE_LIMIT:')) {
          const secs = parseInt(e.message.split(':')[1]);
          chat.startRateLimitTimer(secs);
          chat.setMessages(m => [...m, { role: 'assistant', content: '⏳ Rate limit — tunggu ' + secs + 's~', actions: [] }]);
        } else if (!navigator.onLine) {
          chat.setMessages(m => [...m, { role: 'assistant', content: '📡 Internet terputus~', actions: [] }]);
        } else {
          chat.setMessages(m => [...m, { role: 'assistant', content: '❌ ' + e.message, actions: [] }]);
        }
      }
    }
    chat.setLoading(false);
  }

  // ── Derived actions ──
  function cancelMsg() {
    abortRef.current?.abort();
    chat.setLoading(false);
    chat.setStreaming('');
    chat.setAgentRunning(false);
  }

  async function continueMsg() {
    await sendMsg('Lanjutkan response sebelumnya dari titik terakhir.');
  }

  async function retryLast() {
    const lastUser = [...chat.messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    chat.setMessages(m => {
      const idx = m.lastIndexOf(lastUser);
      return idx !== -1 ? m.slice(0, idx) : m;
    });
    await sendMsg(lastUser.content);
  }

  return { sendMsg, callAI, compactContext, cancelMsg, continueMsg, retryLast, abTest };
}
