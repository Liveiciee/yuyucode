import { useRef } from 'react';
import { askCerebrasStream, callServer } from '../api.js';
import { parseActions, executeAction, resolvePath } from '../utils.js';
import { runHooksV2, checkPermission, tokenTracker, parseElicitation, tfidfRank, selectSkills } from '../features.js';
import { BASE_SYSTEM, AUTO_COMPACT_CHARS, AUTO_COMPACT_MIN_MSG, MAX_FILE_PREVIEW, VISION_MODEL, CONTEXT_WARN_CHARS } from '../constants.js';

export function useAgentLoop({
  project, chat, file, ui,
  sendNotification, haptic, speakText,
  abortRef, handleSlashCommandRef,
  growth,
}) {
  const autoContextRef = useRef({});

  // ── callAI ──
  function callAI(msgs, onChunk, signal, imageBase64) {
    const cfg = project.effortCfg;
    // Llama 4 Scout support vision, llama-3.3-70b tidak
    const model = imageBase64 ? VISION_MODEL : project.model;
    return askCerebrasStream(msgs, model, onChunk, signal, {
      maxTokens: cfg.maxTokens,
      imageBase64,
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

    // Tampilkan hasil side by side
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
  async function compactContext() {
    const currentMsgs = chat.messages;
    if (currentMsgs.length < 10) {
      chat.setMessages(m => [...m, { role: 'assistant', content: 'Context masih kecil, belum perlu compact~', actions: [] }]);
      return;
    }
    chat.setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const toCompact = currentMsgs.slice(1, -6);
      const summary   = await askCerebrasStream([
        { role: 'system', content: 'Buat ringkasan singkat percakapan coding ini. Fokus: keputusan teknis, files diubah, bug fix, status project. Maks 300 kata. Bahasa Indonesia.' },
        { role: 'user',   content: toCompact.map(m => m.role + ': ' + (m.content || '').slice(0, 300)).join('\n\n') },
      ], 'llama3.1-8b', () => {}, ctrl.signal, { maxTokens: 512 });
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
    chat.setLoading(false);
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
  // Priority: handoff.md → map.md → llms.txt → tree → keyword heuristic files
  async function gatherProjectContext(txt, _signal) {
    if (!project.folder) return {};
    const ctx = {};

    // 1. Session handoff — highest priority (previous session context)
    const handoffR = await callServer({ type: 'read', path: project.folder + '/.yuyu/handoff.md' });
    if (handoffR.ok && handoffR.data) ctx['__handoff__'] = handoffR.data;

    // 1b. Pinned files — always inject into context
    const pinned = project.pinnedFiles || [];
    if (pinned.length > 0) {
      const pinnedReads = await Promise.all(
        pinned.slice(0, 5).map(p => callServer({ type: 'read', path: p, to: 80 }))
      );
      pinnedReads.forEach((r, i) => {
        if (r.ok) ctx['📌 ' + pinned[i].split('/').pop()] = r.data;
      });
    }

    // 2. Codebase map — symbol index (signatures only, low token cost)
    const mapR = await callServer({ type: 'read', path: project.folder + '/.yuyu/map.md', from: 1, to: 120 });
    if (mapR.ok && mapR.data) ctx['__map__'] = mapR.data;

    // 2b. Compressed source — repomix-style, bodies stripped (~70% reduction)
    // Only load if task is complex (mentions multiple files or refactor keywords)
    const needsCompressed = /refactor|overhaul|all files|semuanya|codebase|arsitektur/i.test(txt);
    if (needsCompressed) {
      const compR = await callServer({ type: 'read', path: project.folder + '/.yuyu/compressed.md', from: 1, to: 200 });
      if (compR.ok && compR.data) ctx['__compressed__'] = compR.data;
    }

    // 3. llms.txt — project brief (architecture, constraints, patterns)
    const llmsR = await callServer({ type: 'read', path: project.folder + '/llms.txt', from: 1, to: 80 });
    if (llmsR.ok && llmsR.data) ctx['__llms__'] = llmsR.data;

    // 4. Tree struktur (always — untuk spatial awareness)
    const treeR = await callServer({ type: 'tree', path: project.folder, depth: 2 });
    if (treeR.ok) ctx['__tree__'] = treeR.data;

    // 5. Keyword heuristic — file yang spesifik relevan dengan task
    const keywords = txt.toLowerCase();
    const keyFiles = [];

    // Task mentions file name directly
    const fileMatch = txt.match(/\b([\w/-]+\.(?:js|jsx|ts|tsx|json|md|css|py|sh))\b/g);
    if (fileMatch) fileMatch.forEach(f => keyFiles.push(
      f.startsWith('/') ? f : project.folder + '/src/' + f
    ));

    // Keyword → relevant file
    if (keywords.includes('api') || keywords.includes('fetch') || keywords.includes('cerebras') || keywords.includes('groq'))
      keyFiles.push(project.folder + '/src/api.js');
    if (keywords.includes('agent') || keywords.includes('loop') || keywords.includes('sendmsg'))
      keyFiles.push(project.folder + '/src/hooks/useAgentLoop.js');
    if (keywords.includes('panel') || keywords.includes('ui') || keywords.includes('modal'))
      keyFiles.push(project.folder + '/src/components/panels.jsx');
    if (keywords.includes('constant') || keywords.includes('model') || keywords.includes('theme'))
      keyFiles.push(project.folder + '/src/constants.js');
    if (keywords.includes('server') || keywords.includes('yuyu-server') || keywords.includes('exec'))
      keyFiles.push(project.folder + '/yuyu-server.js');
    if (keywords.includes('feature') || keywords.includes('skill') || keywords.includes('plan'))
      keyFiles.push(project.folder + '/src/features.js');
    if (keywords.includes('brightness') || keywords.includes('gamma') || keywords.includes('color'))
      keyFiles.push(project.folder + '/src/hooks/useBrightness.js');
    if (keywords.includes('slash') || keywords.includes('command'))
      keyFiles.push(project.folder + '/src/hooks/useSlashCommands.js');
    if (keywords.includes('editor') || keywords.includes('codemirror') || keywords.includes('tab'))
      keyFiles.push(project.folder + '/src/components/FileEditor.jsx');

    // 6. Baca paralel — max 5 additional files
    const unique = [...new Set(keyFiles)].slice(0, 5);
    const reads  = await Promise.all(unique.map(p => callServer({ type: 'read', path: p, from: 1, to: 50 })));
    unique.forEach((p, i) => {
      if (reads[i].ok && reads[i].data) ctx[p.split('/').pop()] = reads[i].data;
    });

    return ctx;
  }

  // ── buildSystemPrompt ───────────────────────────────────────────────────────
  function buildSystemPrompt(txt, cfg) {
    const stripFrontmatter = s => s.replace(/^---[\s\S]*?---\n?/, '').trim();
    const notesCtx    = project.notes ? '\n\nProject notes:\n' + project.notes : '';
    const agentsMdCtx = project.agentsMd
      ? '\n\n## AGENTS.md (kontrak project — WAJIB diikuti):\n' + project.agentsMd.slice(0, 3000)
      : '';
    const selectedSkills = selectSkills((project.skills || []).filter(s => s.active !== false), txt);
    const skillCtx    = selectedSkills.length
      ? '\n\nSkill context:\n' + selectedSkills.map(s => '## ' + s.name + '\n' + stripFrontmatter(s.content || '')).join('\n\n---\n\n')
      : '';
    const pinnedCtx   = file.pinnedFiles.length ? '\n\nPinned files: ' + file.pinnedFiles.join(', ') : '';
    const fileCtx     = file.selectedFile && file.fileContent
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
    return BASE_SYSTEM + cfg.systemSuffix + thinkNote + styleCtx +
      '\n\nFolder aktif: ' + project.folder +
      '\nBranch: ' + project.branch +
      agentsMdCtx + notesCtx + skillCtx + pinnedCtx + fileCtx + memCtx + agentMemCtx + visionCtx;
  }

    // ── sendMsg — agent loop ──
  async function sendMsg(override, _opts = {}) {
    const txt = (typeof override === 'string' ? override : chat.input).trim();
    if (!txt || chat.loading) return;

    // Slash command
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

    // Auto-compact jika context > 80K chars
    const totalChars = history.reduce((a, m) => a + (m.content?.length || 0), 0);
    if (totalChars > AUTO_COMPACT_CHARS && history.length > AUTO_COMPACT_MIN_MSG) {
      chat.setMessages(m => [...m, {
        role: 'assistant',
        content: '📦 Auto-compact — context ~' + Math.round(totalChars / 1000) + 'K chars...',
        actions: [],
      }]);
      await compactContext();
      // compactContext sudah update chat.messages — tapi kita gunakan history lama
      // untuk allMessages awal (messages baru akan terpakai di iter berikutnya via getState)
    }

    try {
      const cfg = project.effortCfg;
      const systemPrompt = buildSystemPrompt(txt, cfg);

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
      try {
        const ping = await callServer({ type: 'ping' });
        if (!ping.ok) throw new Error('server not ok');
      } catch (_pingErr) {
        chat.setLoading(false);
        chat.setStreaming('');
        chat.setAgentStatus(null);
        chat.setMessages(m => [...m, {
          role: 'assistant',
          content: '❌ **yuyu-server tidak dapat dijangkau!**\n\nPastikan server berjalan di Termux:\n```bash\nyuyu-server-start\n# atau\nnode ~/yuyu-server.js &\n```\n\nLalu coba lagi.',
          actions: []
        }]);
        return;
      }

      while (iter < MAX_ITER) {
        iter++;
        // Graceful stop — finish this iteration then stop
        if (chat.gracefulStop) {
          chat.setGracefulStop(false);
          chat.setAgentStatus('Menyelesaikan iterasi terakhir...');
        }
        if (iter > 1) chat.setAgentRunning(true);
        chat.setAgentStatus(`Iter ${iter}/${MAX_ITER}`);

        const DECISION_HINT = iter === 1
          ? '\n[ATURAN: Jawab langsung jika bisa dari context. DILARANG tanya balik. Butuh file → baca sendiri.]'
          : '';
        const autoCtxBlock = Object.keys(autoContext).length
          ? '\n\nAuto-loaded context:\n' + Object.entries(autoContext)
              .map(([p, c]) => '=== ' + p + ' ===\n' + c.slice(0, 1000))
              .join('\n\n')
          : '';

        const groqMsgs = [
          { role: 'system', content: systemPrompt + DECISION_HINT + autoCtxBlock },
          ...chat.trimHistory(allMessages).map(m => {
            // content bisa array (vision dari iter sebelumnya) — flatten ke string untuk history
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

        // Token tracking
        const inTk  = Math.round(groqMsgs.reduce((a, m) => a + (m.content?.length || 0), 0) / 4);
        const outTk = Math.round((reply?.length || 0) / 4);
        tokenTracker.record(inTk, outTk, project.model);

        const allActs = parseActions(reply);

        // ── Separate actions by type ──
        // patch_file  → auto-execute (find-and-replace)
        // write_file  → auto-execute WITH backup (Claude Code behavior)
        // read_file   → parallel
        // web_search  → parallel
        // safe others (list,tree,search,mkdir,file_info,find_symbol) → parallel
        // exec        → serial (side effects, order matters)
        // mcp         → serial
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

        // ── AUTO-EXECUTE patch_file ──
        if (patchActions.length > 0) {
          await runHooksV2(project.hooks.preWrite, patchActions.map(a => a.path).join(','), project.folder);
          const patchResults = await Promise.all(patchActions.map(a => executeAction(a, project.folder)));
          patchActions.forEach((a, i) => {
            a.result   = patchResults[i];
            a.executed = true;
          });
          await runHooksV2(project.hooks.postWrite, patchActions.map(a => a.path).join(','), project.folder);

          // Patch failed → self-correct
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

        // ── AUTO-EXECUTE write_file (Claude Code style: backup → write → continue) ──
        if (fullWriteActions.length > 0) {
          await runHooksV2(project.hooks.preWrite, fullWriteActions.map(a => a.path).join(','), project.folder);
          const writeResults = await Promise.all(fullWriteActions.map(async a => {
            // Backup dulu untuk undo
            const backup = await callServer({ type: 'read', path: resolvePath(project.folder, a.path) });
            if (backup.ok) a.original = backup.data;
            return executeAction(a, project.folder);
          }));
          fullWriteActions.forEach((a, i) => {
            a.result   = writeResults[i];
            a.executed = true;
          });
          await runHooksV2(project.hooks.postWrite, fullWriteActions.map(a => a.path).join(','), project.folder);

          // Store backups for undo
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
            for (const wr of fullWriteActions.filter(a => a.result?.ok)) {
              const ext  = (wr.path || '').split('.').pop().toLowerCase();
              const abs  = resolvePath(project.folder, wr.path);
              let runCmd = null;
              if (['js','mjs','cjs'].includes(ext))  runCmd = `node "${abs}" 2>&1 | head -30`;
              else if (ext === 'py')                  runCmd = `python3 "${abs}" 2>&1 | head -30`;
              else if (ext === 'sh')                  runCmd = `bash "${abs}" 2>&1 | head -30`;
              else if (wr.path?.includes('.test.'))   runCmd = `cd "${project.folder}" && npx vitest run "${abs}" 2>&1 | tail -20`;
              if (!runCmd) continue;
              const vr  = await callServer({ type: 'exec', path: project.folder, command: runCmd });
              const out = (vr.data || '').trim();
              if (!out) continue;
              const hasErr = /error|exception|traceback|syntaxerror|typeerror|referenceerror|cannot find/i.test(out)
                && !/syntax ok|passed|✅|0 error/i.test(out);
              if (hasErr && iter < MAX_ITER) {
                allMessages = [
                  ...allMessages,
                  { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
                  { role: 'user', content: '⚡ Auto-verify: run **' + wr.path.split('/').pop() + '**\n```\n' + out.slice(0, 600) + '\n```\nAda error — fix langsung.' },
                ];
                break; // re-enter loop with error context
              }
            }
          }
        }

        // ── Auto-load imports dari file yang dibaca ──
        for (const a of readActions) {
          if (!a.result?.ok || !a.path) continue;
          const importRegex = /(?:import|require)\s+.*?['"](.+?)['"]/g;
          let im;
          while ((im = importRegex.exec(a.result.data || '')) !== null) {
            const imp = im[1];
            if (!imp.startsWith('.')) continue;
            const base = a.path.split('/').slice(0, -1).join('/');
            const candidates = [imp, imp + '.jsx', imp + '.js', imp + '.ts', imp + '.tsx']
              .map(s => base + '/' + s.replace('./', '/').replace('//', '/'));
            for (const cand of candidates) {
              if (autoContext[cand]) continue;
              const r = await callServer({ type: 'read', path: resolvePath(project.folder, cand) });
              if (r.ok) { autoContext[cand] = r.data; break; }
            }
          }
        }

        // ── Exec error → auto-fix loop ──
        const execErrors = execActions.filter(a => {
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
        });

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

        const fileData = [...readActions, ...safeActions]
          .filter(a => a.result?.ok && !['exec', 'web_search', 'patch_file'].includes(a.type))
          .map(a => '=== ' + (a.path || a.type) + ' ===\n' + (a.result?.data || ''))
          .join('\n\n');

        const webData = webSearchActions
          .filter(a => a.result?.ok)
          .map(a => '🌐 ' + (a.query || '') + '\n' + (a.result?.data || ''))
          .join('\n\n');

        const patchData = patchActions.length
          ? patchActions.map(a =>
              (a.result?.ok ? '✅ patch ' : '❌ patch ') + a.path
            ).join('\n')
          : '';

        const writeData = fullWriteActions.length
          ? fullWriteActions.map(a =>
              (a.result?.ok ? '✅ written ' : '❌ write failed ') + a.path
            ).join('\n')
          : '';

        const execData = execActions
          .filter(a => a.type === 'exec' && a.result?.data)
          .map(a => '$ ' + a.command + '\n' + (a.result?.data || '').slice(0, 800))
          .join('\n\n');

        const combinedData = [fileData, webData, patchData, writeData, execData].filter(Boolean).join('\n\n');

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
      }

      chat.setAgentRunning(false);
    // Tambah XP per sesi dan pelajari style
    growth?.addXP('message_sent');
    growth?.learnFromSession(chat.messages, project.folder);
      if (iter > 1) sendNotification('YuyuCode ✅', 'Agent selesai: ' + txt.slice(0, 40));

      // Auto-continue
      if (finalContent.trim().endsWith('CONTINUE')) {
        setTimeout(() => sendMsg('Lanjutkan response sebelumnya dari titik terakhir.'), 300);
        return;
      }

      // PROJECT_NOTE extraction
      if (finalContent.includes('PROJECT_NOTE:')) {
        const nm = finalContent.match(/PROJECT_NOTE:(.*?)(?:\n|$)/);
        if (nm) project.setNotes((project.notes + '\n' + nm[1].trim()).trim(), project.folder);
      }

      chat.setMessages(m => [...m, { role: 'assistant', content: finalContent, actions: finalActions }]);

      // Elicitation
      const elicit = parseElicitation(finalContent);
      if (elicit) ui.setElicitationData(elicit);

      chat.extractMemories(txt, finalContent, project.folder);
      if (chat.ttsEnabled && finalContent) speakText(finalContent);

    } catch (e) {
      chat.setAgentRunning(false);
    // Tambah XP per sesi dan pelajari style
    growth?.addXP('message_sent');
    growth?.learnFromSession(chat.messages, project.folder);
      if (e.name !== 'AbortError') {
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
    // Tambah XP per sesi dan pelajari style
    growth?.addXP('message_sent');
    growth?.learnFromSession(chat.messages, project.folder);
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
