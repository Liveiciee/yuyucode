import { callServer } from '../api.js';
import { executeAction, resolvePath } from '../utils.js';
import { runHooksV2, executePlanStep, parsePlanSteps } from '../features.js';

export function useApprovalFlow({
  messages, setMessages,
  folder, hooks, permissions,
  _editHistory, setEditHistory,
  sendMsgRef, callAI, abortRef,
  setLoading,
}) {
  async function handleApprove(idx, ok, targetPath) {
    const msg = messages[idx];
    const isWrite = a => (a.type === 'write_file' || a.type === 'patch_file') && !a.executed;
    const targets = targetPath === '__all__'
      ? (msg.actions || []).filter(isWrite)
      : (msg.actions || []).filter(a => isWrite(a) && (targetPath ? a.path === targetPath : true));

    if (!ok) {
      setMessages(m => m.map((x, i) => i === idx
        ? { ...x, actions: x.actions?.map(a => targets.includes(a) ? { ...a, executed: true, result: { ok: false, data: 'Dibatalkan.' } } : a) }
        : x));
      return;
    }

    // Backup sebelum tulis
    const backups = [];
    for (const a of targets) {
      const backup = await callServer({ type: 'read', path: resolvePath(folder, a.path) });
      if (backup.ok) { backups.push({ path: resolvePath(folder, a.path), content: backup.data }); a.original = backup.data; }
    }
    if (backups.length) setEditHistory(h => [...h.slice(-(10 - backups.length)), ...backups]);

    const results = await Promise.all(targets.map(a => executeAction(a, folder)));
    const failed  = results.filter(r => !r.ok);

    // Atomic rollback jika ada yang gagal
    if (failed.length > 0 && targets.length > 1) {
      await Promise.all(backups.map(b => callServer({ type: 'write', path: b.path, content: b.content })));
      setMessages(m => [...m, { role: 'assistant', content: '❌ Atomic write gagal (' + failed.length + ' file). Rollback.' }]);
      return;
    }

    results.forEach((r, i) => { targets[i].result = r; targets[i].executed = true; });
    setMessages(m => m.map((x, i) => i === idx ? { ...x } : x));
    if (targets.length > 1)
      setMessages(m => [...m, { role: 'assistant', content: '✅ ' + targets.length + ' file berhasil ditulis~', actions: [] }]);
    await runHooksV2(hooks?.postWrite || [], targets.map(a => a.path).join(','), folder);

    // Syntax verify (jika exec permission aktif)
    if (permissions?.exec) {
      for (const wr of targets) {
        const ext = (wr.path || '').split('.').pop().toLowerCase();
        let verifyCmd = null;
        const absPath = resolvePath(folder, wr.path);
        if (['js', 'cjs', 'mjs'].includes(ext))
          verifyCmd = `node --check "${absPath}" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
        else if (ext === 'json')
          verifyCmd = `python3 -m json.tool "${absPath}" > /dev/null 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
        else if (ext === 'sh')
          verifyCmd = `bash -n "${absPath}" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
        if (!verifyCmd) continue;
        const vr   = await callServer({ type: 'exec', path: folder, command: verifyCmd });
        const vOut = (vr.data || '').trim();
        if (!vOut) continue;
        if (vOut.includes('SYNTAX_ERR') || (vOut.toLowerCase().includes('error') && !vOut.includes('SYNTAX_OK'))) {
          const fname = (wr.path || '').split('/').pop();
          setMessages(m => [...m, { role: 'assistant', content: 'Syntax error di ' + fname + ':\n```\n' + vOut.slice(0, 300) + '\n```', actions: [] }]);
          setTimeout(() => sendMsgRef.current?.('Fix syntax error di ' + wr.path + ':\n```\n' + vOut.slice(0, 300) + '\n```'), 700);
        }
      }
    }
  }

  async function handlePlanApprove(idx, approved) {
    if (!approved) {
      setMessages(m => m.map((x, i) => i === idx ? { ...x, planApproved: false } : x));
      await sendMsgRef.current?.('Ubah plan.');
      return;
    }
    setMessages(m => m.map((x, i) => i === idx ? { ...x, planApproved: true } : x));
    const msg   = messages[idx];
    const steps = parsePlanSteps(msg.content || '');
    if (steps.length === 0) { await sendMsgRef.current?.('Plan diapprove. Mulai eksekusi step by step.'); return; }

    const ctrl = new AbortController();
    if (abortRef) abortRef.current = ctrl;
    setLoading?.(true);
    setMessages(m => [...m, { role: 'assistant', content: `🚀 Eksekusi plan — ${steps.length} step...`, actions: [] }]);

    for (let i = 0; i < steps.length; i++) {
      if (ctrl.signal.aborted) break;
      const step = steps[i];
      setMessages(m => [...m, { role: 'assistant', content: `⚙️ **Step ${step.num}/${steps.length}:** ${step.text}`, actions: [] }]);
      try {
        const { reply, actions } = await executePlanStep(step, folder, callAI, ctrl.signal, () => {});
        const writes  = actions.filter(a => a.type === 'write_file' || a.type === 'patch_file');
        const cleaned = reply.replace(/```action[\s\S]*?```/g, '').trim();
        if (writes.length > 0) {
          setMessages(m => [...m, { role: 'assistant', content: cleaned, actions: writes.map(a => ({ ...a, executed: false })) }]);
        } else if (cleaned) {
          setMessages(m => [...m, { role: 'assistant', content: cleaned, actions: [] }]);
        }
      } catch (e) {
        if (e.name === 'AbortError') break;
        setMessages(m => [...m, { role: 'assistant', content: '❌ Step ' + step.num + ' error: ' + e.message, actions: [] }]);
      }
    }

    setLoading?.(false);
    setMessages(m => [...m, { role: 'assistant', content: '✅ Plan selesai! (' + steps.length + ' steps)', actions: [] }]);
  }

  return { handleApprove, handlePlanApprove };
}
