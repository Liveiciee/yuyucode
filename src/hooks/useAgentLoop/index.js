// src/hooks/useAgentLoop/index.js
import { useRef } from 'react';
import { callServer } from '../../api.js';
import { parseActions, executeAction, resolvePath, generateDiff } from '../../utils.js';
import { runHooksV2, tokenTracker, parseElicitation } from '../../features.js';
import { BASE_SYSTEM, AUTO_COMPACT_CHARS, AUTO_COMPACT_MIN_MSG, MAX_FILE_PREVIEW, VISION_MODEL } from '../../constants.js';
import { extractMentionedFiles, checkServerHealth, isExecError, buildFeedback, autoLoadImports, autoVerifyWrites } from './helpers.js';
import { gatherProjectContext } from './context.js';
import { buildSystemPrompt } from './systemPrompt.js';
import { executeWithPermission } from './permissions.js';
import { callAI } from './callAI.js';
import { compactContext } from './compact.js';
import { abTest } from './abTest.js';

// Re-export extractMentionedFiles for tests
export { extractMentionedFiles };

const isArm64 = /arm64|arm|aarch64/i.test(navigator?.platform || '') || /aarch64/i.test(navigator?.userAgent || '');
const MAX_CONTEXT_FILES = isArm64 ? 3 : 4;
const MAX_PREVIEW_CHARS = isArm64 ? 600 : 800;

export function useAgentLoop({
  project, chat, file, ui,
  sendNotification, haptic, speakText,
  abortRef, handleSlashCommandRef,
  growth,
}) {
  const autoContextRef = useRef({});

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
      await compactContext(chat, project, abortRef, true);
    }

    try {
      const cfg = project.effortCfg;
      const systemPrompt = buildSystemPrompt(txt, { ...cfg, model: project.model }, project, chat, file, growth);

      autoContextRef.current = {};
      if (file.pinnedFiles.length) {
        const loaded = await file.readFilesParallel(file.pinnedFiles.slice(0, isArm64 ? 2 : 3), project.folder);
        Object.entries(loaded).forEach(([p, r]) => { if (r.ok) autoContextRef.current[p] = r.data; });
      }

      if (project.folder && txt.length > 10 && !txt.startsWith('/')) {
        chat.setAgentStatus('Membaca context...');
        chat.setStreaming('Membaca project context...');
        const gathered = await gatherProjectContext(project, file, txt, ctrl.signal);
        Object.assign(autoContextRef.current, gathered);
        chat.setStreaming('');
      }

      const MAX_ITER = cfg.maxIter || 10;
      let iter = 0, allMessages = [...history], finalContent = '', finalActions = [];
      const autoContext = { ...(autoContextRef.current || {}) };

      const serverOk = await checkServerHealth();
      if (!serverOk) {
        chat.setLoading(false); chat.setStreaming(''); chat.setAgentStatus(null);
        chat.setMessages(m => [...m, { role: 'assistant', content: '❌ **yuyu-server tidak dapat dijangkau!**\n\nPastikan server berjalan di Termux:\n```bash\nyuyu-server-start\n# atau\nnode ~/yuyu-server.cjs &\n```\n\nLalu coba lagi.', actions: [] }]);
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
        
        const recentContent = allMessages.slice(-4).map(m => m.content || '').join('\n');
        const freshCtx = Object.entries(autoContext)
          .filter(([p]) => !recentContent.includes(p))
          .slice(0, MAX_CONTEXT_FILES);
        const autoCtxBlock = freshCtx.length
          ? '\n\nAuto-loaded context:\n' + freshCtx
              .map(([p, cv]) => '=== ' + p + ' ===\n' + cv.slice(0, MAX_PREVIEW_CHARS))
              .join('\n\n')
          : '';

        const systemPromptIter = iter > 1
          ? buildSystemPrompt(txt, { ...cfg, _iter: iter, model: project.model }, project, chat, file, growth)
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

        const reply = await callAI(groqMsgs, chat.setStreaming, ctrl.signal, iter === 1 ? chat.visionImage : null, project, chat);
        chat.setStreaming('');
        chat.setAgentStatus('');

        const inTk  = Math.round(groqMsgs.reduce((a, m) => a + (m.content?.length || 0), 0) / 4);
        const outTk = Math.round((reply?.length || 0) / 4);
        tokenTracker.record(inTk, outTk, project.model);

        const allActs = parseActions(reply);
        const patchActions     = allActs.filter(a => a.type === 'patch_file');
        const fullWriteActions = allActs.filter(a => a.type === 'write_file');
        const readActions      = allActs.filter(a => a.type === 'read_file');
        const webSearchActions = allActs.filter(a => a.type === 'web_search');
        const safeParallelTypes = new Set(['list_files','tree','search','mkdir','file_info','find_symbol','move_file']);
        const safeActions      = allActs.filter(a => safeParallelTypes.has(a.type));
        const execActions      = allActs.filter(a => a.type === 'exec' || a.type === 'mcp');

        if (readActions.length > 0) {
          await runHooksV2(project.hooks.preToolCall, 'read_file:batch', project.folder);
          const res = await Promise.all(readActions.map(a => executeAction(a, project.folder)));
          readActions.forEach((a, i) => { a.result = res[i]; });
          await runHooksV2(project.hooks.postToolCall, 'read_file:batch', project.folder);
        }

        if (webSearchActions.length > 0 || safeActions.length > 0) {
          const combined = [...webSearchActions, ...safeActions];
          const res = await Promise.all(combined.map(a => executeWithPermission(a, project.folder, project)));
          combined.forEach((a, i) => { a.result = res[i]; });
        }

        for (const a of execActions) {
          a.result = await executeWithPermission(a, project.folder, project);
        }

        // Patch and write handling with diff review
        if (patchActions.length > 0 || fullWriteActions.length > 0) {
          if (project.diffReview) {
            const allWrites = [...patchActions, ...fullWriteActions];
            await runHooksV2(project.hooks.preWrite, allWrites.map(a => a.path).join(','), project.folder);
            for (const a of allWrites) {
              const orig = await callServer({ type: 'read', path: resolvePath(project.folder, a.path) });
              if (orig.ok && orig.data) {
                const newContent = a.type === 'patch_file' 
                  ? orig.data.replace(a.old_str, a.new_str ?? '')
                  : (a.content || '');
                a.diffPreview = generateDiff(orig.data, newContent, 60);
                a.original = orig.data;
              } else if (a.type === 'write_file') {
                const lines = (a.content || '').split('\n');
                a.diffPreview = lines.slice(0, 30).map((l, i) => '+ L' + (i+1) + ': ' + l).join('\n') +
                  (lines.length > 30 ? '\n... (+' + (lines.length - 30) + ' baris lagi)' : '');
              }
              a.executed = false;
            }
            finalContent = reply;
            finalActions = allActs;
            chat.setMessages(m => [...m, { role: 'assistant', content: finalContent, actions: finalActions }]);
            chat.setLoading(false);
            chat.setAgentRunning(false);
            return;
          }

          // Normal execution
          await runHooksV2(project.hooks.preWrite, [...patchActions, ...fullWriteActions].map(a => a.path).join(','), project.folder);
          const allWrites = [...patchActions, ...fullWriteActions];
          const results = await Promise.all(allWrites.map(a => executeAction(a, project.folder)));
          allWrites.forEach((a, i) => { a.result = results[i]; a.executed = true; });
          await runHooksV2(project.hooks.postWrite, allWrites.map(a => a.path).join(','), project.folder);

          const failed = allWrites.filter(a => !a.result?.ok);
          if (failed.length > 0) {
            const failInfo = failed.map(a => `${a.type} GAGAL di ${a.path}: ${a.result?.data || '?'}`).join('\n');
            const ok = allWrites.filter(a => a.result?.ok);
            allMessages = [
              ...allMessages,
              { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
              { role: 'user', content: (ok.length ? '✅ ' + ok.length + ' operation OK.\n' : '') + '❌ Gagal:\n' + failInfo + '\n\nCek dan patch lagi.' },
            ];
            continue;
          }

          // Backup for undo
          const backups = allWrites
            .filter(a => a.original !== undefined)
            .map(a => ({ path: resolvePath(project.folder, a.path), content: a.original }));
          if (backups.length) file.setEditHistory(h => [...h.slice(-(10 - backups.length)), ...backups]);

          // Auto-verify after writes
          if (project.permissions?.exec && fullWriteActions.length > 0) {
            const verifyBreak = await autoVerifyWrites(fullWriteActions, project.folder, allMessages, reply, iter, MAX_ITER);
            if (verifyBreak) { allMessages = verifyBreak; continue; }
          }
        }

        await autoLoadImports(readActions, autoContext, project.folder);

        const execErrors = execActions.filter(isExecError);
        if (execErrors.length > 0 && iter < MAX_ITER) {
          const errSummary = execErrors.map(a => '[ERROR] ' + (a.command || a.path || '?') + '\n' + (a.result?.data || '').slice(0, 500)).join('\n\n');
          allMessages = [
            ...allMessages,
            { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
            { role: 'user', content: 'Error output:\n\n' + errSummary + '\n\nAnalisis dan fix langsung.' },
          ];
          continue;
        }

        const allInlineActions = [...readActions, ...webSearchActions, ...safeActions, ...execActions, ...patchActions, ...fullWriteActions];
        const combinedData = buildFeedback(readActions, safeActions, webSearchActions, patchActions, fullWriteActions, execActions, isArm64);

        if (!combinedData) {
          finalContent = reply;
          finalActions = allInlineActions;
          break;
        }

        const agentNote = iter >= MAX_ITER ? '\n\n(Iterasi terakhir. Berikan jawaban final sekarang.)' : '';
        allMessages = [
          ...allMessages,
          { role: 'assistant', content: reply.replace(/```action[\s\S]*?```/g, '').trim() },
          { role: 'user', content: 'Hasil aksi:\n' + combinedData + '\n\nLanjutkan.' + agentNote },
        ];

        if (gracefulStopPending) {
          finalContent = reply;
          finalActions = allInlineActions;
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

  return { sendMsg, callAI: (msgs, onChunk, signal, imageBase64) => callAI(msgs, onChunk, signal, imageBase64, project, chat), compactContext: () => compactContext(chat, project, abortRef, false), cancelMsg, continueMsg, retryLast, abTest: (task, modelA, modelB) => abTest(task, modelA, modelB, project, chat, file, abortRef, growth) };
}
