// src/hooks/useAgentLoop/helpers.js
import { callServer } from '../../api.js';
import { resolvePath } from '../../utils.js';

export function extractMentionedFiles(txt = '') {
  return txt.match(/\b([\w/-]+\.(?:js|cjs|mjs|jsx|ts|tsx|json|md|css|py|sh))\b/g) || [];
}

export async function checkServerHealth() {
  try {
    const ping = await callServer({ type: 'ping' });
    return ping.ok;
  } catch (_e) { return false; }
}

export function isExecError(a) {
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

export function buildFeedback(readActions, safeActions, webSearchActions, patchActions, fullWriteActions, execActions, isArm64) {
  const FILE_FEEDBACK_LIMIT = isArm64 ? 800 : 1200;
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
    .map(a => '$ ' + a.command + '\n' + (a.result?.data || '').slice(0, 600))
    .join('\n\n');
  return [fileData, webData, patchData, writeData, execData].filter(Boolean).join('\n\n');
}

export async function autoLoadImports(readActions, autoContext, projectFolder) {
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

export function getRunCmd(wr, projectFolder) {
  const ext = (wr.path || '').split('.').pop().toLowerCase();
  const abs = resolvePath(projectFolder, wr.path);
  if (['js','mjs','cjs'].includes(ext))  return `node "${abs}" 2>&1 | head -30`;
  if (ext === 'py')                       return `python3 "${abs}" 2>&1 | head -30`;
  if (ext === 'sh')                       return `bash "${abs}" 2>&1 | head -30`;
  if (wr.path?.includes('.test.'))        return `cd "${projectFolder}" && npx vitest run "${abs}" 2>&1 | tail -20`;
  return null;
}

export async function autoVerifyWrites(fullWriteActions, projectFolder, allMessages, reply, iter, MAX_ITER) {
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
        { role: 'user', content: '⚡ Auto-verify: run **' + wr.path.split('/').pop() + '**\n```\n' + out.slice(0, 500) + '\n```\nAda error — fix langsung.' },
      ];
    }
  }
  return null;
}
