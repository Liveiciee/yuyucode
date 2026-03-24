import { executePlanStep, parsePlanSteps } from '../features.js';
import { getWriteTargets, applyWriteBatch } from './approvalHelpers.js';


// ── Local helpers ────────────────────────────────────────────────────────────

function handleReject(idx, targets, setMessages, sendMsgRef) {
  setMessages(m => m.map((x, i) => i === idx
    ? { ...x, actions: x.actions?.map(a => targets.includes(a)
        ? { ...a, executed: true, result: { ok: false, data: "Ditolak." } }
        : a) }
    : x));
  const rejectedPaths = targets.map(a => a.path).join(", ");
  setTimeout(() => sendMsgRef.current?.(
    "❌ User menolak perubahan ke: **" + rejectedPaths + "**\n\n" +
    "Coba pendekatan lain atau tanya dulu apa yang diinginkan sebelum menulis ulang."
  ), 300);
}

function autoResumeIfAllDone(msg, targets, idx, setMessages, sendMsgRef) {
  const allDone = (msg.actions || [])
    .filter(a => a.type === "write_file" || a.type === "patch_file")
    .every(a => a.executed);
  if (!allDone) return;
  const writtenPaths = targets.filter(a => a.result?.ok).map(a => a.path).join(", ");
  if (writtenPaths) {
    setTimeout(() => sendMsgRef.current?.(
      "✅ Semua perubahan disetujui dan berhasil ditulis: **" + writtenPaths + "**\n\nLanjutkan task."
    ), 400);
  }
}
// ── Hook ─────────────────────────────────────────────────────────────────────

export function useApprovalFlow({
  messages, setMessages,
  folder, hooks, permissions,
  _editHistory, setEditHistory,
  sendMsgRef, callAI, abortRef,
  setLoading,
}) {
  async function handleApprove(idx, ok, targetPath) {
    const msg     = messages[idx];
    const targets = getWriteTargets(msg, targetPath);
    if (!ok) { handleReject(idx, targets, setMessages, sendMsgRef); return; }
    const ok2 = await applyWriteBatch({ targets, folder, idx, setEditHistory, setMessages, hooks, permissions, sendMsgRef });
    if (ok2) autoResumeIfAllDone(msg, targets, idx, setMessages, sendMsgRef);
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

    if (steps.length === 0) {
      await sendMsgRef.current?.('Plan diapprove. Mulai eksekusi step by step.');
      return;
    }

    const ctrl = new AbortController();
    if (abortRef) abortRef.current = ctrl;
    setLoading?.(true);
    setMessages(m => [...m, { role: 'assistant', content: `🚀 Eksekusi plan — ${steps.length} step...`, actions: [] }]);

    for (const step of steps) {
      if (ctrl.signal.aborted) break;
      setMessages(m => [...m, { role: 'assistant', content: `⚙️ **Step ${step.num}/${steps.length}:** ${step.text}`, actions: [] }]);
      try {
        const { reply, actions } = await executePlanStep(step, folder, callAI, ctrl.signal, () => {});
        const writes  = actions.filter(a => a.type === 'write_file' || a.type === 'patch_file');
        const cleaned = reply.replace(/```action.*?```/gs, '').trim();
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
