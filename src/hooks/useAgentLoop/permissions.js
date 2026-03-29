// src/hooks/useAgentLoop/permissions.js
import { runHooksV2, checkPermission } from '../../features.js';
import { executeAction } from '../../utils.js';

export async function executeWithPermission(a, folder, project) {
  if (!checkPermission(project.permissions, a.type)) {
    return { ok: false, data: '⛔ Permission ditolak: ' + a.type + '. Aktifkan di /permissions.' };
  }
  await runHooksV2(project.hooks.preToolCall, a.type + ':' + (a.path || a.command || ''), folder);
  const result = await executeAction(a, folder);
  await runHooksV2(project.hooks.postToolCall, a.type + ':' + (a.path || a.command || ''), folder);
  return result;
}
