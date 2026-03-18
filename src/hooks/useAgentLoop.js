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

  // ── callAI — thin wrapper, re-created on model/effort change ──
  function callAI(msgs, onChunk, signal, imageBase64) {
    const cfg = project.effortCfg;
    return askCerebrasStream(msgs, project.model, onChunk, signal, { maxTokens: cfg.maxTokens, imageBase64 });
  }

  // ── compactContext ──
  async function compactContext() {
    if (chat.messages.length < 10) {
      chat.setMessages(m => [...m, { role: 'assistant', content: 'Context masih kecil~', actions: [] }]);
      return;
    }
    chat.setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const toCompact = chat.messages.slice(1, -6);
      const summary   = await askCerebrasStream([
        { role: 'system', content: 'Buat ringkasan singkat dari percakapan coding ini. Fokus: keputusan teknis, files diubah, bug fix, status project. Maks 300 kata.' },
        { role: 'user',   content: toCompact.map(m => m.role + ': ' + m.content.slice(0, 300)).join('\n\n') },
      ], 'llama3.1-8b', () => {}, ctrl.signal);
      chat.setMessages([
        chat.messages[0],
        { role: 'assistant', content: '📦 **Context dicompact** (' + toCompact.length + ' pesan):\n\n' + summary },
        ...chat.messages.slice(-6),
      ]);
      chat.setMessages(m => [...m, { role: 'assistant', content: '✅ Context berhasil dikompres!', actions: [] }]);
    } catch (e) {
      if (e.name !== 'AbortError') chat.setMessages(m => [...m, { role: 'assistant', content: '❌ ' + e.message }]);
    }
    chat.setLoading(false);
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

    // Auto-compact kalau context > 80K chars
    const AUTO_COMPACT_THRESHOLD = 80000;
    const totalChars = history.reduce((a, m) => a + (m.content?.length || 0), 0);
    if (totalChars > AUTO_COMPACT_THRESHOLD && history.length > 12) {
      chat.setMessages(m => [...m, { role: 'assistant', content: '📦 Auto-compact — context terlalu besar (~' + Math.round(totalChars / 1000) + 'K chars). Mengkompress...', actions: [] }]);
      await compactContext();
    }

    try {
      const cfg          = project.effortCfg;
      const notesCtx     = project.notes ? '\n\nProject notes:\n' + project.notes : '';
      const skillCtx     = project.skill ? '\n\nSKILL.md:\n' + project.skill : '';
      const pinnedCtx    = file.pinnedFiles.length ? '\n\nPinned files: ' + file.pinnedFiles.join(', ') : '';
      const fileCtx      = file.selectedFile && file.fileContent ? '\n\nFile terbuka: ' + file.selectedFile + '\n```\n' + file.fileContent.slice(0, 1500) + '\n```' : '';
      const memPool      = chat.getRelevantMemories(txt);
      const memCtx       = memPool.length ? '\n\nMemories:\n' + memPool.map(m => '• ' + m.text).join('\n') : '';
      const visionCtx    = chat.visionImage ? '\n\n[Gambar dilampirkan]' : '';
      const agentMemCtx  = ['user', 'project', 'local'].map(s =>
        (project.agentMemory[s] || []).length
          ? '\n\n[' + s + ' memory]:\n' + project.agentMemory[s].map(mx => '• ' + mx.text).join('\n')
          : ''
      ).join('');
      const thinkNote    = project.thinkingEnabled ? '\n\nSebelum respons, tulis reasoning singkat dalam <think>...</think>. Singkat, max 2 kalimat.' : '';
      const systemPrompt = BASE_SYSTEM + cfg.systemSuffix + thinkNote +
        '\n\nFolder aktif: ' + project.folder + '\nBranch: ' + project.branch +
        notesCtx + skillCtx + pinnedCtx + fileCtx + memCtx + agentMemCtx + visionCtx;

      // Pre-load pinned files ke autoContext
      autoContextRef.current = {};
      if (file.pinnedFiles.length) {
        const loaded = await file.readFilesParallel(file.pinnedFiles.slice(0, 3), project.folder);
        Object.entries(loaded).forEach(([p, r]) => { if (r.ok) autoContextRef.current[p] = r.data; });
      }

      const MAX_ITER = cfg.maxIter || 10;
      let iter = 0, allMessages = [...history], finalContent = '', finalActions = [];
      let autoContext = { ...(autoContextRef.current || {}) };

      while (iter < MAX_ITER) {
        iter++;
        if (iter > 1) chat.setAgentRunning(true);

        const DECISION_HINT = iter === 1
          ? '\n[ATURAN: Jawab langsung jika bisa dari context. DILARANG tanya balik. Kalau butuh file, baca sendiri pakai read_file.]'
          : '';
        const autoCtxBlock = Object.keys(autoContext).length
          ? '\n\nAuto-loaded context:\n' + Object.entries(autoContext).map(([p, c]) => '=== ' + p + ' ===\n' + c.slice(0, 800)).join('\n\n')
          : '';

        const groqMsgs = [
          { role: 'system', content: systemPrompt + DECISION_HINT + autoCtxBlock },
          ...chat.trimHistory(allMessages).map(m => ({
            role:    m.role,
            content: m.content.replace(/```action[\s\S]*?```/g, '').replace(/PROJECT_NOTE:.*?\n/g, '').trim(),
          })),
        ];

        let reply = await callAI(groqMsgs, chat.setStreaming, ctrl.signal, iter === 1 ? chat.visionImage : null);
        chat.setStreaming('');

        // Token tracking
        const inTk = Math.round(groqMsgs.reduce((a, m) => a + (m.content?.length || 0), 0) / 4);
        tokenTracker.record(inTk, Math.round(reply.length / 4), project.model);

        const allActs         = parseActions(reply);
        const writes          = allActs.filter(a => a.type === 'write_file' || a.type === 'patch_file');
        const nonWrites       = allActs.filter(a => a.type !== 'write_file' && a.type !== 'patch_file');
        const readActions     = nonWrites.filter(a => a.type === 'read_file');
        const webSearchActions = nonWrites.filter(a => a.type === 'web_search');
        const otherActions    = nonWrites.filter(a => a.type !== 'read_file' && a.type !== 'web_search');

        // ── Read files (parallel jika > 1) ──
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
          await runHooksV2(project.hooks.preToolCall, 'web_search:batch', project.folder);
          const res = await Promise.all(webSearchActions.map(a => executeAction(a, project.folder)));
          webSearchActions.forEach((a, i) => { a.result = res[i]; });
          await runHooksV2(project.hooks.postToolCall, 'web_search:batch', project.folder);
        }

        // ── Other actions dengan permission check ──
        for (const a of otherActions) {
          if (!checkPermission(project.permissions, a.type)) {
            a.result = { ok: false, data: '⛔ Permission ditolak untuk action: ' + a.type + '. Aktifkan di /permissions.' };
          } else {
            await runHooksV2(project.hooks.preToolCall, a.type + ':' + (a.path || a.command || ''), project.folder);
            a.result = await executeAction(a, project.folder);
            await runHooksV2(project.hooks.postToolCall, a.type + ':' + (a.path || a.command || ''), project.folder);
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
            const base       = a.path.split('/').slice(0, -1).join('/');
            const candidates = [imp, imp + '.jsx', imp + '.js', imp + '.ts', imp + '.tsx']
              .map(s => base + '/' + s.replace('./', '/').replace('//', '/'));
            for (const cand of candidates) {
              if (autoContext[cand]) continue;
              const r = await callServer({ type: 'read', path: resolvePath(project.folder, cand) });
              if (r.ok) { autoContext[cand] = r.data; break; }
            }
          }
        }

        // ── Exec error → re-loop untuk auto-fix ──
        const execErrors = otherActions.filter(a => {
          if (a.type !== 'exec') return false;
          const out = (a.result?.data || '').toLowerCase();
          if (!out.trim()) return false;
          const hasErr = out.includes('error') || out.includes('exception') || out.includes('traceback') ||
            out.includes('cannot find module') || out.includes('command not found') ||
            out.includes('exit code 1') || out.includes('failed to compile');
          const isFP = out.includes('no error') || out.includes('0 errors') || out.includes('syntax ok') || out.includes('passed');
          return hasErr && !isFP;
        });

        if (execErrors.length > 0 && iter < MAX_ITER) {
          const errSummary = execErrors.map(a =>
            '[ERROR] ' + (a.command || a.path || '?') + '\n' + (a.result?.data || '').slice(0, 400)
          ).join('\n\n');
          allMessages = [
            ...allMessages,
            { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
            { role: 'user',      content: 'Error saat eksekusi:\n\n' + errSummary + '\n\nAnalisis dan fix.' },
          ];
          continue;
        }

        // ── Build combined data untuk loop berikutnya ──
        const allNonWrites = [...readActions, ...webSearchActions, ...otherActions];
        const webData  = webSearchActions.filter(a => a.result?.ok).map(a => '🌐 Web Search: ' + a.query + '\n' + a.result.data).join('\n\n');
        const fileData = allNonWrites.filter(a => a.result?.ok && a.type !== 'exec' && a.type !== 'web_search').map(a => '=== ' + a.path + ' ===\n' + a.result.data).join('\n\n');
        const combinedData = [fileData, webData].filter(Boolean).join('\n\n');

        if (!combinedData && writes.length === 0) { finalContent = reply; finalActions = allNonWrites; break; }
        if (writes.length > 0) {
          await runHooksV2(project.hooks.preWrite, writes.map(a => a.path).join(','), project.folder);
          finalContent = reply;
          finalActions = [...allNonWrites, ...writes.map(a => ({ ...a, executed: false }))];
          break;
        }
        const agentNote = iter < MAX_ITER ? '' : '\n\n(Iterasi terakhir, berikan jawaban final.)';
        allMessages = [
          ...allMessages,
          { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
          { role: 'user',      content: 'Hasil aksi:\n' + combinedData + '\n\nLanjutkan.' + agentNote },
        ];
      }

      chat.setAgentRunning(false);
      if (iter > 1) sendNotification('YuyuCode ✅', 'Agent selesai! ' + txt.slice(0, 40));

      // Auto-continue
      if (finalContent.trim().endsWith('CONTINUE')) {
        setTimeout(() => sendMsg('Lanjutkan dari titik terakhir.'), 300);
        return;
      }

      // PROJECT_NOTE
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
          chat.setMessages(m => [...m, { role: 'assistant', content: '⏳ Rate limit — tunggu ' + secs + ' detik ya Papa~' }]);
        } else if (!navigator.onLine) {
          chat.setMessages(m => [...m, { role: 'assistant', content: '📡 Internet terputus~' }]);
        } else {
          chat.setMessages(m => [...m, { role: 'assistant', content: '❌ ' + e.message }]);
        }
      }
    }
    chat.setLoading(false);
  }

  // ── Derived actions ──
  function cancelMsg() { abortRef.current?.abort(); chat.setLoading(false); chat.setStreaming(''); }

  async function continueMsg() { await sendMsg('Lanjutkan response sebelumnya dari titik terakhir.'); }

  async function retryLast() {
    const lastUser = [...chat.messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    chat.setMessages(m => { const idx = m.indexOf(lastUser); return m.slice(0, idx); });
    await sendMsg(lastUser.content);
  }

  return { sendMsg, callAI, compactContext, cancelMsg, continueMsg, retryLast };
}
