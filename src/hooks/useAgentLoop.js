import { useRef } from 'react';
import { askCerebrasStream, callServer } from '../api.js';
import { parseActions, executeAction, resolvePath } from '../utils.js';
import { runHooksV2, checkPermission, tokenTracker, parseElicitation } from '../features.js';
import { BASE_SYSTEM } from '../constants.js';

export function useAgentLoop({
  project, chat, file, ui,
  sendNotification, haptic, speakText,
  abortRef, handleSlashCommandRef,
}) {
  const autoContextRef = useRef({});

  // ── callAI ──
  function callAI(msgs, onChunk, signal, imageBase64) {
    const cfg = project.effortCfg;
    return askCerebrasStream(msgs, project.model, onChunk, signal, {
      maxTokens: cfg.maxTokens,
      imageBase64,
    });
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

  // ── sendMsg — agent loop ──
  async function sendMsg(override) {
    const txt = (override || chat.input).trim();
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
    if (totalChars > 80000 && history.length > 12) {
      chat.setMessages(m => [...m, {
        role: 'assistant',
        content: '📦 Auto-compact — context ~' + Math.round(totalChars / 1000) + 'K chars...',
        actions: [],
      }]);
      await compactContext();
    }

    try {
      const cfg = project.effortCfg;

      // Pakai messages terbaru — bisa sudah dicompact oleh auto-compact di atas
      const freshHistory = chat.messages;

      // ── Build system context ──
      const notesCtx   = project.notes ? '\n\nProject notes:\n' + project.notes : '';
      const skillCtx   = project.skill ? '\n\nSKILL.md:\n' + project.skill : '';
      const pinnedCtx  = file.pinnedFiles.length ? '\n\nPinned files: ' + file.pinnedFiles.join(', ') : '';
      const fileCtx    = file.selectedFile && file.fileContent
        ? '\n\nFile terbuka: ' + file.selectedFile + '\n```\n' + file.fileContent.slice(0, 2000) + '\n```'
        : '';
      const memPool   = chat.getRelevantMemories(txt);
      const memCtx    = memPool.length ? '\n\nMemories:\n' + memPool.map(m => '• ' + m.text).join('\n') : '';
      const visionCtx = chat.visionImage ? '\n\n[Gambar dilampirkan]' : '';
      const agentMemCtx = ['user', 'project', 'local'].map(s =>
        (project.agentMemory[s] || []).length
          ? '\n\n[' + s + ' memory]:\n' + project.agentMemory[s].map(mx => '• ' + mx.text).join('\n')
          : ''
      ).join('');
      const thinkNote = project.thinkingEnabled
        ? '\n\nSebelum respons, tulis reasoning dalam <think>...</think>. Singkat, max 2 kalimat.'
        : '';

      const systemPrompt = BASE_SYSTEM + cfg.systemSuffix + thinkNote +
        '\n\nFolder aktif: ' + project.folder +
        '\nBranch: ' + project.branch +
        notesCtx + skillCtx + pinnedCtx + fileCtx + memCtx + agentMemCtx + visionCtx;

      // ── Pre-load pinned files ──
      autoContextRef.current = {};
      if (file.pinnedFiles.length) {
        const loaded = await file.readFilesParallel(file.pinnedFiles.slice(0, 3), project.folder);
        Object.entries(loaded).forEach(([p, r]) => { if (r.ok) autoContextRef.current[p] = r.data; });
      }

      const MAX_ITER = cfg.maxIter || 10;
      let iter = 0, allMessages = [...freshHistory], finalContent = '', finalActions = [];
      let autoContext = { ...(autoContextRef.current || {}) };

      // ── MAIN AGENT LOOP ──
      while (iter < MAX_ITER) {
        iter++;
        if (iter > 1) chat.setAgentRunning(true);

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
          ...chat.trimHistory(allMessages).map(m => ({
            role:    m.role,
            content: (m.content || '').replace(/```action[\s\S]*?```/g, '').replace(/PROJECT_NOTE:.*?\n/g, '').trim(),
          })),
        ];

        let reply = await callAI(groqMsgs, chat.setStreaming, ctrl.signal, iter === 1 ? chat.visionImage : null);
        chat.setStreaming('');

        // Token tracking
        const inTk  = Math.round(groqMsgs.reduce((a, m) => a + (m.content?.length || 0), 0) / 4);
        const outTk = Math.round((reply?.length || 0) / 4);
        tokenTracker.record(inTk, outTk, project.model);

        const allActs = parseActions(reply);

        // ── Separate actions by type ──
        // patch_file → auto-execute (no approval, safe find-and-replace)
        // write_file → queue for user approval
        // everything else → execute inline
        const patchActions     = allActs.filter(a => a.type === 'patch_file');
        const fullWriteActions = allActs.filter(a => a.type === 'write_file');
        const readActions      = allActs.filter(a => a.type === 'read_file');
        const webSearchActions = allActs.filter(a => a.type === 'web_search');
        const otherActions     = allActs.filter(a =>
          a.type !== 'write_file' && a.type !== 'patch_file' &&
          a.type !== 'read_file'  && a.type !== 'web_search'
        );

        // ── Read files (parallel if > 1) ──
        if (readActions.length > 1) {
          await runHooksV2(project.hooks.preToolCall, 'read_file:batch', project.folder);
          const res = await Promise.all(readActions.map(a => executeAction(a, project.folder)));
          readActions.forEach((a, i) => { a.result = res[i]; });
          await runHooksV2(project.hooks.postToolCall, 'read_file:batch', project.folder);
        } else {
          for (const a of readActions) {
            await runHooksV2(project.hooks.preToolCall, 'read_file:' + a.path, project.folder);
            a.result = await executeAction(a, project.folder);
            await runHooksV2(project.hooks.postToolCall, 'read_file:' + a.path, project.folder);
          }
        }

        // ── Web search (parallel) ──
        if (webSearchActions.length > 0) {
          const res = await Promise.all(webSearchActions.map(a => executeAction(a, project.folder)));
          webSearchActions.forEach((a, i) => { a.result = res[i]; });
        }

        // ── Other actions with permission check ──
        for (const a of otherActions) {
          a.result = await executeWithPermission(a, project.folder);
        }

        // ── AUTO-EXECUTE patch_file (no approval needed, like Claude Code edits) ──
        if (patchActions.length > 0) {
          await runHooksV2(project.hooks.preWrite, patchActions.map(a => a.path).join(','), project.folder);
          const patchResults = await Promise.all(patchActions.map(a => executeAction(a, project.folder)));
          patchActions.forEach((a, i) => {
            a.result   = patchResults[i];
            a.executed = true;
          });
          await runHooksV2(project.hooks.postWrite, patchActions.map(a => a.path).join(','), project.folder);

          // Notify failures
          const failed = patchActions.filter(a => !a.result?.ok);
          if (failed.length > 0) {
            // Patch failed — feed back to AI for self-correction
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
        const execErrors = otherActions.filter(a => {
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

        // ── Build feedback data untuk loop berikutnya ──
        const allInlineActions = [...readActions, ...webSearchActions, ...otherActions, ...patchActions];

        const fileData = allInlineActions
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

        const execData = otherActions
          .filter(a => a.type === 'exec' && a.result?.data)
          .map(a => '$ ' + a.command + '\n' + (a.result?.data || '').slice(0, 800))
          .join('\n\n');

        const combinedData = [fileData, webData, patchData, execData].filter(Boolean).join('\n\n');

        // ── Jika ada write_file → break, queue untuk approval ──
        if (fullWriteActions.length > 0) {
          await runHooksV2(project.hooks.preWrite, fullWriteActions.map(a => a.path).join(','), project.folder);
          finalContent = reply;
          finalActions = [
            ...allInlineActions,
            ...fullWriteActions.map(a => ({ ...a, executed: false })),
          ];
          break;
        }

        // ── Tidak ada data baru dan tidak ada write → done ──
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

  return { sendMsg, callAI, compactContext, cancelMsg, continueMsg, retryLast };
}
