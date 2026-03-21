// ── FEATURES v3 — Overhaul ─────────────────────────────────────────────────────
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
    { role: 'system', content: 'Buat rencana eksekusi bernomor.\nFormat:\n1. [action singkat]\nMaksimal 8 langkah. Bahasa Indonesia. Singkat dan konkret.' },
    { role: 'user',   content: 'Task: ' + task + '\nFolder: ' + folder },
  ], () => {}, signal);
  return { reply, steps: parsePlanSteps(reply) };
}

export async function executePlanStep(step, folder, callAI, signal, onChunk) {
  const reply = await callAI([
    { role: 'system', content: 'Eksekusi langkah: "' + step.text + '"\nFolder: ' + folder + '\nGunakan action blocks. patch_file untuk edit, write_file untuk file baru.' },
    { role: 'user',   content: step.text },
  ], onChunk || (() => {}), signal);
  const actions = parseActions(reply);
  const results = [];
  for (const a of actions) {
    if (a.type !== 'write_file') results.push(await executeAction(a, folder));
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


// ── Background agent helpers ──────────────────────────────────────────────────

async function _setupBgWorktree(agent, folder, wtPath, branch) {
  agent.log.push('Setup worktree: ' + branch);
  const wtResult = await execGit(folder, 'git worktree add ' + wtPath + ' -b ' + branch + ' 2>&1');
  if (wtResult.includes('fatal') || (wtResult.toLowerCase().includes('error:') && !wtResult.includes('HEAD is now'))) {
    throw new Error('Worktree gagal: ' + wtResult.slice(0, 100));
  }
  agent.status = 'running';
  agent.log.push('Worktree siap: ' + wtPath);
}

async function _executeBgActions(agent, actions, wtPath) {
  const writes  = actions.filter(a => a.type === 'write_file');
  const patches = actions.filter(a => a.type === 'patch_file');
  const others  = actions.filter(a => !['write_file', 'patch_file'].includes(a.type));
  const allWrites = [];
  let totalPatches = 0;

  for (const a of others) {
    const r = await executeAction(a, wtPath);
    a.result = r;
    agent.log.push((r.ok ? '✅' : '❌') + ' ' + a.type + ': ' + (a.path || a.command || '').slice(0, 50));
  }
  for (const a of patches) {
    const p = a.path.startsWith(wtPath) ? a.path : wtPath + '/' + a.path.replace(/^\//, '');
    const r = await callServer({ type: 'patch', path: p, old_str: a.old_str, new_str: a.new_str || '' });
    a.result = r;
    if (r.ok) { totalPatches++; agent.log.push('✅ patch: ' + p.split('/').pop()); }
    else       agent.log.push('❌ patch GAGAL: ' + (r.data || '').slice(0, 100));
  }
  for (const a of writes) {
    const p = a.path.startsWith(wtPath) ? a.path : wtPath + '/' + a.path.replace(/^\//, '');
    const r = await callServer({ type: 'write', path: p, content: a.content });
    a.result = r;
    if (r.ok) { allWrites.push({ path: p, content: a.content }); agent.log.push('✅ write: ' + p.split('/').pop()); }
  }
  return { allWrites, totalPatches };
}

async function _runBgAgentLoop(agent, task, wtPath, branch, callAI, signal) {
  const MAX_BG_ITER = 8;
  const sysPrompt = [
    'Kamu adalah isolated background coding agent.',
    'Working dir: ' + wtPath, 'Branch: ' + branch, 'Task: ' + task, '',
    'ATURAN:',
    '- Gunakan read_file dengan path relatif terhadap ' + wtPath,
    '- patch_file untuk edit file yang ada',
    '- write_file untuk file baru (path wajib absolute: ' + wtPath + '/filename)',
    '- exec untuk jalankan command di ' + wtPath,
    '- Setelah selesai tulis DONE di akhir response',
  ].join('\n');

  let bgMessages = [{ role: 'user', content: task }];
  let allWrites = [], totalPatches = 0;

  for (let iter = 0; iter < MAX_BG_ITER; iter++) {
    agent.log.push(`Iter ${iter + 1}/${MAX_BG_ITER}`);
    const msgs = [{ role: 'system', content: sysPrompt }, ...bgMessages];

    let reply;
    try {
      reply = await callAI(msgs, () => {}, signal);
    } catch(e) {
      if (e.name === 'AbortError') throw e;
      agent.log.push('AI error: ' + e.message);
      break;
    }

    const actions = parseActions(reply);
    const res = await _executeBgActions(agent, actions, wtPath);
    allWrites = [...allWrites, ...res.allWrites];
    totalPatches += res.totalPatches;

    if (reply.includes('DONE') || (!actions.length && iter > 0)) {
      agent.log.push('Task selesai!');
      break;
    }

    const resultText = actions
      .filter(a => a.result)
      .map(a => (a.result.ok ? '✅' : '❌') + ' ' + a.type + ': ' + (a.result.data || '').slice(0, 200))
      .join('\n');
    bgMessages = [
      ...bgMessages,
      { role: 'assistant', content: reply.replace(/```action.*?```/gs, '').trim() },
      { role: 'user', content: resultText ? 'Hasil:\n' + resultText + '\n\nLanjutkan.' : 'Lanjutkan atau tulis DONE jika sudah selesai.' },
    ];
  }
  return { allWrites, totalPatches };
}

async function _commitBgChanges(agent, id, task, wtPath, branch, allWrites, totalPatches) {
  if (allWrites.length > 0 || totalPatches > 0) {
    await execGit(wtPath, 'git add -A');
    const commitMsg = 'agent(' + id.slice(-6) + '): ' + task.slice(0, 50);
    await execGit(wtPath, 'git commit -m "' + commitMsg + '"');
    agent.log.push('Committed ke ' + branch);
  }
  agent.result = { allWrites, branch, wtPath };
  agent.status = 'done';
  agent.log.push('Selesai. ' + allWrites.length + ' file. Gunakan /bgmerge ' + id + ' untuk merge.');
}

// Background agent dengan REAL agentic loop (tidak hanya satu call)
export async function runBackgroundAgent(task, folder, callAI, onDone) {
  const id     = 'bg_' + Date.now();
  const branch = 'agent-' + id.slice(-8);
  const wtPath = WORKTREE_BASE + '/' + id;
  const agent  = { task, status: 'preparing', log: [], result: null, branch, wtPath, folder, startedAt: Date.now() };
  bgAgents.set(id, agent);

  const ctrl = new AbortController();
  agent.abort = () => {
    ctrl.abort();
    callServer({ type: 'exec', path: folder, command: 'git worktree remove --force ' + wtPath + ' 2>/dev/null; git branch -D ' + branch + ' 2>/dev/null' });
  };

  // Async agent loop in background
  (async () => {
    try {
      await _setupBgWorktree(agent, folder, wtPath, branch);
      const { allWrites, totalPatches } = await _runBgAgentLoop(agent, task, wtPath, branch, callAI, ctrl.signal);
      await _commitBgChanges(agent, id, task, wtPath, branch, allWrites, totalPatches);
      if (typeof onDone === 'function') onDone(id, agent);
    } catch (e) {
      agent.status = 'error';
      agent.log.push('Error: ' + (e.message || String(e)));
      try {
        await callServer({ type: 'exec', path: folder, command: 'git worktree remove --force ' + wtPath + ' 2>/dev/null; git branch -D ' + branch + ' 2>/dev/null' });
      } catch (_e) { }
    }
  })();

  return id;
}

export async function mergeBackgroundAgent(id, folder) {
  const agent = bgAgents.get(id);
  if (!agent) return { ok: false, msg: 'Agent tidak ditemukan' };
  if (agent.status !== 'done') return { ok: false, msg: 'Agent belum selesai (status: ' + agent.status + ')' };
  try {
    const mergeResult = await execGit(folder, 'git merge ' + agent.branch + ' --no-ff -m "merge: agent ' + id.slice(-6) + ' — ' + agent.task.slice(0, 40) + '" 2>&1');
    if (mergeResult.includes('CONFLICT')) {
      const conflictOut = await execGit(folder, 'git diff --name-only --diff-filter=U 2>&1');
      const conflicts   = conflictOut.trim().split('\n').filter(Boolean);
      const previews    = [];
      for (const cf of conflicts.slice(0, 4)) {
        const r = await callServer({ type: 'read', path: folder + '/' + cf });
        if (r.ok && r.data) {
          const lines = r.data.split('\n');
          const start = lines.findIndex(l => l.startsWith('<<<<<<<'));
          const end   = lines.findIndex(l => l.startsWith('>>>>>>>'));
          const snippet = start !== -1 && end !== -1
            ? lines.slice(start, end + 1).join('\n').slice(0, 400)
            : r.data.slice(0, 300);
          previews.push({ file: cf, snippet });
        }
      }
      agent.status = 'conflict';
      return { ok: false, hasConflicts: true, conflicts, previews, branch: agent.branch, task: agent.task, msg: 'Konflik di ' + conflicts.length + ' file.' };
    }
    await execGit(folder, 'git worktree remove --force ' + agent.wtPath + ' 2>/dev/null');
    await execGit(folder, 'git branch -D ' + agent.branch + ' 2>/dev/null');
    agent.status = 'merged';
    agent.log.push('Merged ke main.');
    return { ok: true, msg: 'Merged! ' + (agent.result?.allWrites?.length || 0) + ' file masuk ke main.' };
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
// ── loadSkills: .yuyu/skills/*.md only ─────────────────────────────────────
export async function loadSkills(folder, activeMap = {}) {
  const skills = [];
  // .yuyu/skills/*.md
  const list = await callServer({ type: 'list', path: folder + '/.yuyu/skills' });
  if (list.ok && Array.isArray(list.data)) {
    const files = list.data.filter(f => !f.isDir && f.name.endsWith('.md'));
    const reads = await Promise.all(files.map(f =>
      callServer({ type: 'read', path: folder + '/.yuyu/skills/' + f.name })
    ));
    files.forEach((f, i) => {
      if (reads[i].ok && reads[i].data)
        skills.push({
          name: f.name, content: reads[i].data,
          path: folder + '/.yuyu/skills/' + f.name, builtin: false,
          active: activeMap[f.name] !== false,   // default on
        });
    });
  }
  return skills;
}

// ── Upload / save skill to .yuyu/skills/ ────────────────────────────────────
export async function saveSkillFile(folder, name, content) {
  const safeName = name.replace(/[^a-z0-9._-]/gi, '-').replace(/\.md$/i, '') + '.md';
  const path = folder + '/.yuyu/skills/' + safeName;
  await callServer({ type: 'mkdir', path: folder + '/.yuyu/skills' });
  return callServer({ type: 'write', path, content });
}

// ── Delete skill file ─────────────────────────────────────────────────────────
export async function deleteSkillFile(folder, name) {
  return callServer({ type: 'delete', path: folder + '/.yuyu/skills/' + name });
}

export function selectSkills(skills, taskText) {
  if (!skills.length) return [];
  if (!taskText) return skills.slice(0, 3);
  const kw = taskText.toLowerCase();
  return skills.filter(s => {
    const sn = s.name.toLowerCase().replace('.md', '');
    if (sn === 'skill') return true;
    if (kw.includes(sn)) return true;
    if (s.content) {
      const contentWords = s.content.toLowerCase().replace(/[#*`>_\-[]()]/g, ' ').split(/\s+/).filter(w => w.length > 3).slice(0, 20);
      if (contentWords.some(w => kw.includes(w))) return true;
    }
    if (s.content && s.content.length < 2048) return true;
    return false;
  });
}

// ─── HOOKS v2 ────────────────────────────────────────────────────────────────
export const DEFAULT_HOOKS = {
  preToolCall: [], postToolCall: [], preWrite: [], postWrite: [], onError: [], onNotification: [],
};

export async function runHooksV2(hookList, context, folder) {
  if (!hookList || !hookList.length) return;
  for (const hook of hookList) {
    try {
      if (typeof hook === 'string') {
        await callServer({ type: 'exec', path: folder || '', command: hook.replace('{{context}}', context || '') });
      } else if (hook.type === 'http') {
        await fetch(hook.url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(hook.headers || {}) }, body: JSON.stringify({ context, folder, timestamp: Date.now() }) }).catch(() => {});
      } else if (hook.type === 'shell') {
        await callServer({ type: 'exec', path: folder || '', command: (hook.command || '').replace('{{context}}', context || '') });
      }
    } catch (_e) { }
  }
}

// ─── TOKEN TRACKER ────────────────────────────────────────────────────────────
export class TokenTracker {
  constructor() { this.reset(); }
  reset() { this.inputTokens = 0; this.outputTokens = 0; this.requests = 0; this.startTime = Date.now(); this.history = []; }
  record(inTk, outTk, model) {
    this.inputTokens  += inTk  || 0;
    this.outputTokens += outTk || 0;
    this.requests += 1;
    this.history.push({ inTk: inTk || 0, outTk: outTk || 0, model: model || '?' });
    if (this.history.length > 100) this.history = this.history.slice(-100);
  }
  lastCost() {
    const last = this.history[this.history.length - 1];
    return last ? '[' + last.inTk + '->' + last.outTk + 'tk]' : '';
  }
  summary() {
    const total = this.inputTokens + this.outputTokens;
    const mins  = Math.round((Date.now() - this.startTime) / 60000);
    const avg   = this.requests > 0 ? Math.round(total / this.requests) : 0;
    const rec   = this.history.slice(-5).map((h, i) =>
      '  ' + (i + 1) + '. in:' + h.inTk + ' out:' + h.outTk + 'tk (' + h.model + ')'
    ).join('\n');
    return '📊 **Token Usage**\nInput:    ~' + this.inputTokens + 'tk\nOutput:   ~' + this.outputTokens + 'tk\nTotal:    ~' + total + 'tk\nRequests: ' + this.requests + ' (~' + avg + 'tk/req)\nDurasi:   ' + mins + ' menit\nCerebras: gratis 🎉\n\n**5 request terakhir:**\n' + rec;
  }
}
export const tokenTracker = new TokenTracker();

// ─── SESSION MANAGER ─────────────────────────────────────────────────────────
export async function saveSession(name, messages, folder, branch) {
  const session = {
    id:      Date.now(),
    name:    name || 'Session ' + new Date().toLocaleString('id'),
    messages: messages.slice(-50),
    folder, branch,
    savedAt: new Date().toISOString(),
  };
  const existing = await loadSessions();
  const updated  = [session, ...existing.filter(s => s.name !== name)].slice(0, 20);
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
  return messages.slice(0, Math.max(1, messages.length - ((turns || 1) * 2)));
}

// ─── EFFORT LEVELS ───────────────────────────────────────────────────────────
export const EFFORT_CONFIG = {
  low:    { maxIter: 3,  maxTokens: 1500,  systemSuffix: '\n\nMode: LOW EFFORT. Jawab singkat dan langsung.',                     label: 'Low'    },
  medium: { maxIter: 10, maxTokens: 2048,  systemSuffix: '',                                                                       label: 'Medium' },
  high:   { maxIter: 20, maxTokens: 4000, systemSuffix: '\n\nMode: HIGH EFFORT. Analisis mendalam. Pastikan kualitas tinggi.',   label: 'High'   },
};

// ─── PERMISSIONS ─────────────────────────────────────────────────────────────
export const DEFAULT_PERMISSIONS = {
  read_file:   true,
  write_file:  true,   // auto-execute like Claude Code
  patch_file:  true,
  exec:        true,   // Claude Code runs commands freely
  list_files:  true,
  tree:        true,
  search:      true,
  mcp:         false,
  delete_file: false,  // tetap false — terlalu destruktif
  move_file:   false,
  mkdir:       true,
  browse:      false,
  web_search:  true,
};

export function checkPermission(permissions, actionType) {
  if (!permissions) return false;
  // normalize: patch_file and write_file use separate permissions now
  const key = actionType;
  if (permissions[key] !== undefined) return permissions[key];
  return DEFAULT_PERMISSIONS[key] !== undefined ? DEFAULT_PERMISSIONS[key] : false;
}

// ─── ELICITATION ─────────────────────────────────────────────────────────────
export function parseElicitation(reply) {
  const idx = reply.indexOf('ELICIT:');
  if (idx === -1) return null;
  const start = reply.indexOf('{', idx);
  if (start === -1) return null;
  let depth = 0, end = -1;
  for (let i = start; i < reply.length; i++) {
    if (reply[i] === '{') depth++;
    else if (reply[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) return null;
  try { return JSON.parse(reply.slice(start, end + 1)); } catch { return null; }
}

// ─── TF-IDF MEMORY RANKING ───────────────────────────────────────────────────
export function tfidfRank(memories, queryText, topN = 5) {
  if (!memories.length) return [];
  if (!queryText) return memories.slice(0, topN);
  const queryWords = queryText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (!queryWords.length) return memories.slice(0, topN);
  const N = memories.length;
  const scored = memories.map(mem => {
    const memWords = mem.text.toLowerCase().split(/\s+/);
    let score = 0;
    for (const qw of queryWords) {
      const tf = memWords.filter(w => w === qw).length / (memWords.length || 1);
      const df = memories.filter(m => m.text.toLowerCase().includes(qw)).length;
      const idf = df > 0 ? Math.log((N + 1) / df) : 0;
      score += tf * idf;
    }
    const createdMs = mem.id ? Math.floor(mem.id) : 0;
    const ageDays   = createdMs > 0 ? (Date.now() - createdMs) / 86400000 : 999;
    score += Math.max(0, 0.15 * (1 - ageDays / 14));
    return { ...mem, _score: score };
  });
  return scored.sort((a, b) => b._score - a._score).slice(0, topN);
}
