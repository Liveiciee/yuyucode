// ── FEATURES v2 — with Git Worktree Isolation ────────────────────────────────
import { callServer } from './api.js';
import { parseActions, executeAction } from './utils.js';
import { Preferences } from '@capacitor/preferences';

// ─── PLAN MODE ────────────────────────────────────────────────────────────────
export function parsePlanSteps(reply) {
  const lines = reply.split('\n');
  const steps = [];
  for (const line of lines) {
    const m = line.match(/^(\d+)\.\s+(.+)/);
    if (m) steps.push({ num: parseInt(m[1]), text: m[2].trim(), done: false, result: null });
  }
  return steps;
}

export async function generatePlan(task, folder, callAI, signal) {
  const reply = await callAI([
    { role: 'system', content: 'Buat rencana eksekusi bernomor untuk task berikut.\nFormat WAJIB:\n1. [action singkat]\n2. [action berikutnya]\nMaksimal 8 langkah. Langsung ke langkah, tanpa penjelasan.' },
    { role: 'user', content: 'Task: ' + task + '\nFolder: ' + folder },
  ], () => {}, signal);
  const steps = parsePlanSteps(reply);
  return { reply, steps };
}

export async function executePlanStep(step, folder, callAI, signal) {
  const reply = await callAI([
    { role: 'system', content: 'Eksekusi langkah: "' + step.text + '"\nFolder: ' + folder + '\nGunakan action blocks.' },
    { role: 'user', content: 'Lakukan: ' + step.text },
  ], () => {}, signal);
  const actions = parseActions(reply);
  const results = [];
  for (const a of actions) {
    if (a.type !== 'write_file') {
      const r = await executeAction(a, folder);
      results.push(r);
    }
  }
  return { reply, actions, results };
}

// ─── BACKGROUND AGENTS WITH GIT WORKTREE ISOLATION ───────────────────────────
const bgAgents = new Map();
const WORKTREE_BASE = '/data/data/com.termux/files/home/.yuyuworktrees';

export function getBgAgents() {
  return Array.from(bgAgents.entries()).map(([id, v]) => ({ id, ...v }));
}

async function execGit(folder, cmd) {
  const r = await callServer({ type: 'exec', path: folder, command: cmd });
  return r.data || '';
}

export async function runBackgroundAgent(task, folder, callAI) {
  const id = 'bg_' + Date.now();
  const branch = 'agent-' + id;
  const wtPath = WORKTREE_BASE + '/' + id;
  const agent = {
    task, status: 'preparing', log: [], result: null,
    branch, wtPath, folder,
  };
  bgAgents.set(id, agent);
  const ctrl = new AbortController();
  agent.abort = () => {
    ctrl.abort();
    // cleanup worktree on abort
    callServer({ type: 'exec', path: folder, command: 'git worktree remove --force ' + wtPath + ' 2>/dev/null; git branch -D ' + branch + ' 2>/dev/null' });
  };

  (async () => {
    try {
      // 1. Create worktree
      agent.log.push('🌿 Creating worktree: ' + branch);
      const wtResult = await execGit(folder, 'git worktree add ' + wtPath + ' -b ' + branch + ' 2>&1');
      if (wtResult.includes('error') || wtResult.includes('fatal')) {
        throw new Error('Worktree failed: ' + wtResult.slice(0, 100));
      }
      agent.status = 'running';
      agent.log.push('✅ Worktree siap di: ' + wtPath);

      // 2. Run AI in worktree context
      agent.log.push('🤖 Agent mulai task: ' + task);
      const reply = await callAI([
        {
          role: 'system',
          content: [
            'Kamu adalah isolated background agent.',
            'Working directory: ' + wtPath,
            'Branch: ' + branch,
            'Task: ' + task,
            'PENTING: Kamu HARUS menggunakan write_file action block untuk menulis file. Contoh:',
            ```action
{"type":"write_file","path":"PATH/nama-file.md","content":"ISI FILE"}
```
Gunakan path lengkap: ' + wtPath + '/nama-file. WAJIB pakai action block, bukan cerita saja.',
            'Setelah selesai, commit semua perubahan dengan pesan yang jelas.',
          ].join('\n'),
        },
        { role: 'user', content: task },
      ], () => {}, ctrl.signal);

      const actions = parseActions(reply);
      const writes = actions.filter(a => a.type === 'write_file');

      // 3. Execute non-write actions
      for (const a of actions.filter(a => a.type !== 'write_file')) {
        a.result = await executeAction(a, wtPath);
      }

      // 4. Apply writes to worktree
      for (const a of writes) {
        const wtAction = { ...a, path: a.path.startsWith(wtPath) ? a.path : wtPath + '/' + a.path.replace(folder + '/', '') };
        await callServer({ type: 'write', path: wtAction.path, content: a.content });
        agent.log.push('✏️ Ditulis: ' + wtAction.path.split('/').pop());
      }

      // 5. Commit in worktree
      if (writes.length > 0) {
        await execGit(wtPath, 'git add -A');
        await execGit(wtPath, 'git commit -m "agent(' + id + '): ' + task.slice(0, 50) + '"');
        agent.log.push('📝 Committed ' + writes.length + ' file di branch ' + branch);
      }

      agent.result = { reply, writes, branch, wtPath };
      agent.status = 'done';
      agent.log.push('✅ Selesai. ' + writes.length + ' file di branch ' + branch + '. Gunakan /bgmerge ' + id + ' untuk merge ke main.');

    } catch (e) {
      agent.status = 'error';
      agent.log.push('❌ Error: ' + (e.message || String(e)));
      // cleanup on error
      try {
        await callServer({ type: 'exec', path: folder, command: 'git worktree remove --force ' + wtPath + ' 2>/dev/null; git branch -D ' + branch + ' 2>/dev/null' });
      } catch {}
    }
  })();

  return id;
}

export async function mergeBackgroundAgent(id, folder) {
  const agent = bgAgents.get(id);
  if (!agent) return { ok: false, msg: 'Agent tidak ditemukan' };
  if (agent.status !== 'done') return { ok: false, msg: 'Agent belum selesai (status: ' + agent.status + ')' };

  try {
    // Merge branch ke main
    const mergeResult = await execGit(folder, 'git merge ' + agent.branch + ' --no-ff -m "merge: agent ' + id + ' — ' + agent.task.slice(0, 40) + '" 2>&1');
    const conflict = mergeResult.includes('CONFLICT');

    if (conflict) {
      return { ok: false, msg: 'Ada konflik merge. Cek dengan /status dan resolve manual.' };
    }

    // Cleanup worktree
    await execGit(folder, 'git worktree remove --force ' + agent.wtPath + ' 2>/dev/null');
    await execGit(folder, 'git branch -D ' + agent.branch + ' 2>/dev/null');
    agent.status = 'merged';
    agent.log.push('🎉 Merged ke main dan worktree dihapus.');
    return { ok: true, msg: 'Merged! ' + (agent.result?.writes?.length || 0) + ' file masuk ke main.' };
  } catch (e) {
    return { ok: false, msg: 'Merge error: ' + e.message };
  }
}

export function abortBgAgent(id) {
  const agent = bgAgents.get(id);
  if (agent && agent.abort) agent.abort();
  if (agent) agent.status = 'aborted';
}

// ─── SKILLS SYSTEM ────────────────────────────────────────────────────────────
export async function loadSkills(folder) {
  const skills = [];
  const classic = await callServer({ type: 'read', path: folder + '/SKILL.md' });
  if (classic.ok && classic.data) {
    skills.push({ name: 'SKILL.md', content: classic.data, active: true });
  }
  const list = await callServer({ type: 'list', path: folder + '/.claude/skills' });
  if (list.ok && Array.isArray(list.data)) {
    const mdFiles = list.data.filter(f => !f.isDir && f.name.endsWith('.md'));
    await Promise.all(mdFiles.map(async f => {
      const r = await callServer({ type: 'read', path: folder + '/.claude/skills/' + f.name });
      if (r.ok) skills.push({ name: f.name, content: r.data, active: true });
    }));
  }
  return skills;
}

export function selectSkills(skills, taskText) {
  if (!skills.length) return [];
  return skills.filter(s => {
    if (!taskText) return s.name === 'SKILL.md';
    const keywords = taskText.toLowerCase();
    const skillName = s.name.toLowerCase().replace('.md', '');
    return skillName === 'skill' || keywords.includes(skillName);
  });
}

// ─── HOOKS v2 ────────────────────────────────────────────────────────────────
export const DEFAULT_HOOKS = {
  preToolCall: [],
  postToolCall: [],
  preWrite: [],
  postWrite: [],
  onError: [],
  onNotification: [],
};

export async function runHooksV2(hookList, context, folder) {
  if (!hookList || !hookList.length) return;
  for (const hook of hookList) {
    try {
      if (typeof hook === 'string') {
        await callServer({ type: 'exec', path: folder || '', command: hook.replace('{{context}}', context || '') });
      } else if (hook.type === 'http') {
        await fetch(hook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(hook.headers || {}) },
          body: JSON.stringify({ context, folder, timestamp: Date.now() }),
        }).catch(() => {});
      } else if (hook.type === 'shell') {
        await callServer({ type: 'exec', path: folder || '', command: (hook.command || '').replace('{{context}}', context || '') });
      }
    } catch {}
  }
}

// ─── TOKEN TRACKER ────────────────────────────────────────────────────────────
export class TokenTracker {
  constructor() { this.reset(); }
  reset() { this.inputTokens = 0; this.outputTokens = 0; this.requests = 0; this.startTime = Date.now(); }
  record(inTk, outTk) { this.inputTokens += inTk || 0; this.outputTokens += outTk || 0; this.requests += 1; }
  summary() {
    const total = this.inputTokens + this.outputTokens;
    const mins = Math.round((Date.now() - this.startTime) / 60000);
    return '📊 **Token Usage**\nInput: ~' + this.inputTokens + 'tk\nOutput: ~' + this.outputTokens + 'tk\nTotal: ~' + total + 'tk\nRequests: ' + this.requests + '\nDurasi: ' + mins + ' menit\nCerebras: gratis';
  }
}

export const tokenTracker = new TokenTracker();

// ─── SESSION MANAGER ─────────────────────────────────────────────────────────
export async function saveSession(name, messages, folder, branch) {
  const session = {
    id: Date.now(),
    name: name || 'Session ' + new Date().toLocaleString('id'),
    messages: messages.slice(-50),
    folder, branch,
    savedAt: new Date().toISOString(),
  };
  const existing = await loadSessions();
  const updated = [session, ...existing.filter(s => s.name !== name)].slice(0, 20);
  await Preferences.set({ key: 'yc_sessions', value: JSON.stringify(updated) });
  return session;
}

export async function loadSessions() {
  try {
    const r = await Preferences.get({ key: 'yc_sessions' });
    return r.value ? JSON.parse(r.value) : [];
  } catch { return []; }
}

// ─── REWIND ──────────────────────────────────────────────────────────────────
export function rewindMessages(messages, turns) {
  const idx = Math.max(1, messages.length - ((turns || 1) * 2));
  return messages.slice(0, idx);
}

// ─── EFFORT LEVELS ───────────────────────────────────────────────────────────
export const EFFORT_CONFIG = {
  low:    { maxIter: 3,  systemSuffix: '\n\nMode: LOW EFFORT. Jawab singkat, skip read loop.', label: 'Low' },
  medium: { maxIter: 10, systemSuffix: '', label: 'Medium' },
  high:   { maxIter: 15, systemSuffix: '\n\nMode: HIGH EFFORT. Baca semua file relevan. Analisis mendalam.', label: 'High' },
};

// ─── PERMISSIONS ─────────────────────────────────────────────────────────────
export const DEFAULT_PERMISSIONS = {
  read_file: true, write_file: false, exec: false,
  list_files: true, search: true, mcp: false,
  delete_file: false, browse: false,
};

export function checkPermission(permissions, actionType) {
  if (!permissions) return false;
  return permissions[actionType] !== undefined ? permissions[actionType] : (DEFAULT_PERMISSIONS[actionType] || false);
}

// ─── ELICITATION ─────────────────────────────────────────────────────────────
export function parseElicitation(reply) {
  const m = reply.match(/ELICIT:\s*({[\s\S]*?})/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}
