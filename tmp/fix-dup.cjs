const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

// ─── FIX 1: api.js — ekstrak _aiOnce helper ────────────────────────────────
const apiPath = path.join(ROOT, 'src/api.js');
let api = fs.readFileSync(apiPath, 'utf8');

const OLD_CEREBRAS = `// ── CEREBRAS STREAMING ─────────────────────────────────────────────────────────
async function _cerebrasOnce(messages, model, onChunk, signal, options) {
  const resp = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getCerebrasKey() },
    body: JSON.stringify({
      model,
      messages: injectVision(messages, options.imageBase64),
      max_tokens: options.maxTokens || 4096,
      stream: true,
      temperature: options.temperature || 0.3,
    }),
  });
  if (resp.status === 429) {
    const retry = Number.parseInt(resp.headers.get('retry-after') || '60', 10);
    throw new Error(\`RATE_LIMIT:\${retry}\`);
  }
  if (resp.status >= 500) throw new Error(\`CEREBRAS_SERVER:\${resp.status}\`);
  if (!resp.ok) throw new Error(\`Cerebras error: HTTP \${resp.status}\`);
  return readSSEStream(resp, onChunk, signal);
}

// ── GROQ STREAMING ─────────────────────────────────────────────────────────────
async function _groqOnce(messages, model, onChunk, signal, options) {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getGroqKey() },
    body: JSON.stringify({
      model,
      messages: injectVision(messages, options.imageBase64),
      max_tokens: options.maxTokens || 4096,
      stream: true,
      temperature: options.temperature || 0.3,
    }),
  });
  if (resp.status === 429) {
    const retry = Number.parseInt(resp.headers.get('retry-after') || '30', 10);
    throw new Error(\`RATE_LIMIT:\${retry}\`);
  }
  if (resp.status >= 500) throw new Error(\`GROQ_SERVER:\${resp.status}\`);
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(\`Groq error: HTTP \${resp.status} — \${err.slice(0, 100)}\`);
  }
  return readSSEStream(resp, onChunk, signal);
}`;

const NEW_AI = `// ── SHARED AI FETCH HELPER ────────────────────────────────────────────────────
async function _aiOnce({ url, authKey, providerLabel, serverErrorPrefix, defaultRetry, readErrBody = false, messages, model, onChunk, signal, options }) {
  const resp = await fetch(url, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authKey },
    body: JSON.stringify({
      model,
      messages: injectVision(messages, options.imageBase64),
      max_tokens: options.maxTokens || 4096,
      stream: true,
      temperature: options.temperature || 0.3,
    }),
  });
  if (resp.status === 429) {
    const retry = Number.parseInt(resp.headers.get('retry-after') || String(defaultRetry), 10);
    throw new Error(\`RATE_LIMIT:\${retry}\`);
  }
  if (resp.status >= 500) throw new Error(\`\${serverErrorPrefix}:\${resp.status}\`);
  if (!resp.ok) {
    const detail = readErrBody ? ' — ' + (await resp.text()).slice(0, 100) : '';
    throw new Error(\`\${providerLabel} error: HTTP \${resp.status}\${detail}\`);
  }
  return readSSEStream(resp, onChunk, signal);
}

// ── CEREBRAS STREAMING ─────────────────────────────────────────────────────────
async function _cerebrasOnce(messages, model, onChunk, signal, options) {
  return _aiOnce({ url: 'https://api.cerebras.ai/v1/chat/completions', authKey: getCerebrasKey(), providerLabel: 'Cerebras', serverErrorPrefix: 'CEREBRAS_SERVER', defaultRetry: 60, messages, model, onChunk, signal, options });
}

// ── GROQ STREAMING ─────────────────────────────────────────────────────────────
async function _groqOnce(messages, model, onChunk, signal, options) {
  return _aiOnce({ url: 'https://api.groq.com/openai/v1/chat/completions', authKey: getGroqKey(), providerLabel: 'Groq', serverErrorPrefix: 'GROQ_SERVER', defaultRetry: 30, readErrBody: true, messages, model, onChunk, signal, options });
}`;

if (api.includes('_cerebrasOnce') && !api.includes('_aiOnce')) {
  api = api.replace(OLD_CEREBRAS, NEW_AI);
  fs.writeFileSync(apiPath, api);
  console.log('✅ api.js — _aiOnce helper diekstrak');
} else {
  console.log('⚠️  api.js — skip (sudah ada atau pattern tidak cocok)');
}

// ─── FIX 2: Ekstrak applyWriteBatch ke approvalHelpers.js ──────────────────
const helpersPath = path.join(ROOT, 'src/hooks/approvalHelpers.js');
if (!fs.existsSync(helpersPath)) {
  fs.writeFileSync(helpersPath, `import { callServer } from '../api.js';
import { executeAction, verifySyntaxBatch, backupFiles } from '../utils.js';
import { runHooksV2 } from '../features.js';

export function getWriteTargets(msg, targetPath) {
  const isWrite = a => (a.type === 'write_file' || a.type === 'patch_file') && !a.executed;
  if (targetPath === '__all__') return (msg.actions || []).filter(isWrite);
  return (msg.actions || []).filter(a => isWrite(a) && (!targetPath || a.path === targetPath));
}

export async function applyWriteBatch({ targets, folder, idx, setEditHistory, setMessages, hooks, permissions, sendMsgRef }) {
  const backups = await backupFiles(targets, folder);
  if (backups.length) setEditHistory(h => [...h.slice(-(10 - backups.length)), ...backups]);

  const results = await Promise.all(targets.map(a => executeAction(a, folder)));
  const failed  = results.filter(r => !r.ok);

  if (failed.length > 0 && targets.length > 1) {
    await Promise.all(backups.map(b => callServer({ type: 'write', path: b.path, content: b.content })));
    setMessages(m => [...m, { role: 'assistant', content: '\\u274c Atomic write gagal (' + failed.length + ' file). Rollback.' }]);
    return false;
  }

  results.forEach((r, i) => { targets[i].result = r; targets[i].executed = true; });
  setMessages(m => m.map((x, i) => i === idx ? { ...x } : x));
  if (targets.length > 1)
    setMessages(m => [...m, { role: 'assistant', content: '\\u2705 ' + targets.length + ' file berhasil ditulis~', actions: [] }]);

  await runHooksV2(hooks?.postWrite || [], targets.map(a => a.path).join(','), folder);
  if (permissions?.exec) await verifySyntaxBatch(targets, folder, setMessages, sendMsgRef);
  return true;
}
`);
  console.log('✅ src/hooks/approvalHelpers.js dibuat');
}

// ─── FIX 3: Refactor useApprovalFlow.js ────────────────────────────────────
const afPath = path.join(ROOT, 'src/hooks/useApprovalFlow.js');
let af = fs.readFileSync(afPath, 'utf8');
if (!af.includes('approvalHelpers')) {
  af = af
    .replace(
      `import { callServer } from '../api.js';\nimport { executeAction, verifySyntaxBatch, backupFiles } from '../utils.js';\nimport { runHooksV2, executePlanStep, parsePlanSteps } from '../features.js';`,
      `import { executePlanStep, parsePlanSteps } from '../features.js';\nimport { getWriteTargets, applyWriteBatch } from './approvalHelpers.js';`
    )
    .replace(
      /\/\/ ── Helpers ────[\s\S]+?\/\/ ── Hook ─/,
      `// ── Hook ─`
    );

  // Ganti body handleApprove
  const OLD_APPROVE = `  async function handleApprove(idx, ok, targetPath) {
    const msg     = messages[idx];
    const targets = getWriteTargets(msg, targetPath);

    if (!ok) {
      handleReject(idx, targets, setMessages, sendMsgRef);
      return;
    }

    const backups = await backupFiles(targets, folder);
    if (backups.length) setEditHistory(h => [...h.slice(-(10 - backups.length)), ...backups]);

    const results = await Promise.all(targets.map(a => executeAction(a, folder)));
    const failed  = results.filter(r => !r.ok);

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
    autoResumeIfAllDone(msg, targets, idx, setMessages, sendMsgRef);
    if (permissions?.exec) await verifySyntaxBatch(targets, folder, setMessages, sendMsgRef);
  }`;

  const NEW_APPROVE = `  async function handleApprove(idx, ok, targetPath) {
    const msg     = messages[idx];
    const targets = getWriteTargets(msg, targetPath);
    if (!ok) { handleReject(idx, targets, setMessages, sendMsgRef); return; }
    const ok2 = await applyWriteBatch({ targets, folder, idx, setEditHistory, setMessages, hooks, permissions, sendMsgRef });
    if (ok2) autoResumeIfAllDone(msg, targets, idx, setMessages, sendMsgRef);
  }`;

  if (af.includes(OLD_APPROVE)) {
    af = af.replace(OLD_APPROVE, NEW_APPROVE);
  }

  // Hapus autoResumeIfAllDone dan handleReject yang sekarang ada di helpers (tapi kita keep handleReject & autoResume karena masih dipakai di sini)
  fs.writeFileSync(afPath, af);
  console.log('✅ useApprovalFlow.js direfactor');
}

// ─── FIX 4: Refactor useFileStore.js ──────────────────────────────────────
const fsPath = path.join(ROOT, 'src/hooks/useFileStore.js');
let fsContent = fs.readFileSync(fsPath, 'utf8');
if (!fsContent.includes('approvalHelpers') && fsContent.includes('handleApprove')) {
  // Ganti import
  fsContent = fsContent.replace(
    `import { executeAction, resolvePath, verifySyntaxBatch, backupFiles } from '../utils.js';`,
    `import { executeAction, resolvePath } from '../utils.js';\nimport { getWriteTargets, applyWriteBatch } from './approvalHelpers.js';`
  );

  // Ganti handleApprove function
  const OLD_FS_APPROVE = /  \/\/ ── handleApprove \(write file batch with backup \+ rollback\) ──\n  async function handleApprove\([\s\S]+?\n  \}/;
  const NEW_FS_APPROVE = `  async function handleApprove(idx, ok, targetPath, messages, setMessages, folder, hooks, runHooksV2, permissions) {
    const msg = messages[idx];
    const targets = getWriteTargets(msg, targetPath);
    if (!ok) {
      setMessages(m => m.map((x, i) => i === idx
        ? { ...x, actions: x.actions?.map(a => targets.includes(a) ? { ...a, executed: true, result: { ok: false, data: 'Dibatalkan.' } } : a) }
        : x));
      return;
    }
    await applyWriteBatch({ targets, folder, idx, setEditHistory, setMessages, hooks, permissions });
  }`;

  fsContent = fsContent.replace(OLD_FS_APPROVE, NEW_FS_APPROVE);
  fs.writeFileSync(fsPath, fsContent);
  console.log('✅ useFileStore.js direfactor');
}

console.log('\n🎉 Selesai! Run: npm test');
