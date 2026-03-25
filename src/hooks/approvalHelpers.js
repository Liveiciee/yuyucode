import { callServer } from '../api.js';
import { executeAction, verifySyntaxBatch, backupFiles } from '../utils.js';
import { runHooksV2 } from '../features.js';

export function getWriteTargets(msg, targetPath) {
  const isWrite = a => (a.type === 'write_file' || a.type === 'patch_file') && !a.executed;
  if (targetPath === '__all__') return (msg.actions || []).filter(isWrite);
  return (msg.actions || []).filter(a => isWrite(a) && (!targetPath || a.path === targetPath));
}

export async function applyWriteBatch({ targets, folder, idx, setEditHistory, setMessages, hooks, permissions, sendMsgRef }) {
  const backups = await backupFiles(targets, folder);
  if (backups && backups.length) setEditHistory(h => [...h.slice(-(10 - backups.length)), ...backups]);

  const results = await Promise.all(targets.map(a => executeAction(a, folder)));
  const failed  = results.filter(r => !r.ok);

  if (failed.length > 0 && targets.length > 1) {
    await Promise.all(backups.map(b => callServer({ type: 'write', path: b.path, content: b.content })));
    setMessages(m => [...m, { role: 'assistant', content: '\u274c Atomic write gagal (' + failed.length + ' file). Rollback.' }]);
    return false;
  }

  results.forEach((r, i) => { targets[i].result = r; targets[i].executed = true; });
  setMessages(m => m.map((x, i) => i === idx ? { ...x } : x));
  if (targets.length > 1)
    setMessages(m => [...m, { role: 'assistant', content: '\u2705 ' + targets.length + ' file berhasil ditulis~', actions: [] }]);

  await runHooksV2(hooks?.postWrite || [], targets.map(a => a.path).join(','), folder);
  if (permissions?.exec) await verifySyntaxBatch(targets, folder, setMessages, sendMsgRef);
  return true;
}
