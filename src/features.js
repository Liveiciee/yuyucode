// ── FEATURES v1 ──────────────────────────────────────────────────────────────
// Plan mode, Background agents, Skills system, HTTP hooks,
// Session resume, Effort levels, Token tracking, Elicitation, Rewind

import { callServer } from './api.js';
import { parseActions, executeAction } from './utils.js';

// ─── PLAN MODE ────────────────────────────────────────────────────────────────
// Parse numbered plan steps from AI reply
export function parsePlanSteps(reply) {
  const lines = reply.split('\n');
  const steps = [];
  for (const line of lines) {
    const m = line.match(/^(\d+)\.\s+(.+)/);
    if (m) steps.push({ num: parseInt(m[1]), text: m[2].trim(), done: false, result: null });
  }
  return steps;
}

// Generate a plan for a task, returns { reply, steps }
export async function generatePlan(task, folder, callAI, signal) {
  const reply = await callAI([
    {
      role: 'system',
      content: [
        'Kamu adalah planning agent. Buat rencana eksekusi bernomor untuk task berikut.',
        'Format WAJIB:',
        '1. [action singkat dan spesifik]',
        '2. [action berikutnya]',
        '...',
        'Maksimal 8 langkah. Setiap langkah harus actionable dan atomic.',
        'Jangan tulis penjelasan panjang. Langsung ke langkah.',
      ].join('\n'),
    },
    { role: 'user', content: 'Task: ' + task + '\nFolder: ' + folder },
  ], () => {}, signal);
  const steps = parsePlanSteps(reply);
  return { reply, steps };
}

// Execute a single plan step via agentic loop
export async function executePlanStep(step, folder, callAI, signal) {
  const reply = await callAI([
    {
      role: 'system',
      content: 'Eksekusi langkah ini: "' + step.text + '"\nFolder: ' + folder + '\nGunakan action blocks. Jangan jelaskan, langsung lakukan.',
    },
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

// ─── BACKGROUND AGENTS ────────────────────────────────────────────────────────
// Run an agent task in background, returns a promise + id
const bgAgents = new Map(); // id -> { task, status, log, result }

export function getBgAgents() {
  return Array.from(bgAgents.entries()).map(([id, v]) => ({ id, ...v }));
}

export async function runBackgroundAgent(task, folder, callAI) {
  const id = 'bg_' + Date.now();
  const agent = { task, status: 'running', log: [], result: null };
  bgAgents.set(id, agent);

  const ctrl = new AbortController();
  agent.abort = () => ctrl.abort();

  (async () => {
    try {
      agent.log.push('🚀 Mulai: ' + task);
      const reply = await callAI([
        {
          role: 'system',
          content: 'Kamu adalah background agent. Selesaikan task ini secara mandiri. Folder: ' + folder + '. Gunakan action blocks.',
        },
        { role: 'user', content: task },
      ], () => {}, ctrl.signal);
      const actions = parseActions(reply);
      const writes = actions.filter(a => a.type === 'write_file');
      agent.result = { reply, writes };
      agent.status = 'done';
      agent.log.push('✅ Selesai. ' + writes.length + ' file siap ditulis.');
    } catch (e) {
      agent.status = 'error';
      agent.log.push('❌ ' + e.message);
    }
  })();

  return id;
}

export function abortBgAgent(id) {
  const agent = bgAgents.get(id);
  if (agent?.abort) agent.abort();
  if (agent) agent.status = 'aborted';
}

// ─── SKILLS SYSTEM ────────────────────────────────────────────────────────────
// Load multiple skill files from .claude/skills/ or SKILL.md
export async function loadSkills(folder) {
  const skills = [];

  // 1. Load classic SKILL.md
  const classic = await callServer({ type: 'read', path: folder + '/SKILL.md' });
  if (classic.ok && classic.data) {
    skills.push({ name: 'SKILL.md', content: classic.data, active: true });
  }

  // 2. Load .claude/skills/*.md
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

// Auto-activate skills based on task context
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
// Supports shell commands and HTTP POST hooks
export const DEFAULT_HOOKS = {
  preToolCall: [],
  postToolCall: [],
  preWrite: [],
  postWrite: [],
  onError: [],
  onNotification: [],
};

export async function runHooksV2(hookList, context = '', folder = '') {
  if (!hookList || !hookList.length) return;
  for (const hook of hookList) {
    try {
      if (typeof hook === 'string') {
        // Shell command
        await callServer({
          type: 'exec',
          path: folder,
          command: hook.replace('{{context}}', context),
        });
      } else if (hook.type === 'http') {
        // HTTP POST hook
        await fetch(hook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(hook.headers || {}) },
          body: JSON.stringify({ context, folder, timestamp: Date.now() }),
        }).catch(() => {});
      } else if (hook.type === 'shell') {
        await callServer({
          type: 'exec',
          path: folder,
          command: (hook.command || '').replace('{{context}}', context),
        });
      }
    } catch {}
  }
}

// ─── TOKEN TRACKER ────────────────────────────────────────────────────────────
// Accurate per-request token tracking from Cerebras response headers
export class TokenTracker {
  constructor() {
    this.reset();
  }

  reset() {
    this.inputTokens = 0;
    this.outputTokens = 0;
    this.requests = 0;
    this.startTime = Date.now();
  }

  record(inputTk, outputTk) {
    this.inputTokens += inputTk || 0;
    this.outputTokens += outputTk || 0;
    this.requests += 1;
  }

  summary() {
    const total = this.inputTokens + this.outputTokens;
    const mins = Math.round((Date.now() - this.startTime) / 60000);
    return [
      '📊 **Token Usage (sesi ini)**',
      'Input: ~' + this.inputTokens + 'tk',
      'Output: ~' + this.outputTokens + 'tk',
      'Total: ~' + total + 'tk',
      'Requests: ' + this.requests,
      'Durasi: ' + mins + ' menit',
      'Cerebras: gratis 🎉',
    ].join('\n');
  }
}

export const tokenTracker = new TokenTracker();

// ─── SESSION MANAGER ────────────────────────────────────────────────────────
export async function saveSession(name, messages, folder, branch) {
  const session = {
    id: Date.now(),
    name: name || 'Session ' + new Date().toLocaleString('id'),
    messages: messages.slice(-50),
    folder,
    branch,
    savedAt: new Date().toISOString(),
    tokenCount: messages.reduce((a, m) => a + m.content.length, 0),
  };
  const existing = await loadSessions();
  const updated = [session, ...existing.filter(s => s.name !== name)].slice(0, 20);
  const { Preferences } = await import('@capacitor/preferences');
  await Preferences.set({ key: 'yc_sessions', value: JSON.stringify(updated) });
  return session;
}

export async function loadSessions() {
  try {
    const { Preferences } = await import('@capacitor/preferences');
    const r = await Preferences.get({ key: 'yc_sessions' });
    return r.value ? JSON.parse(r.value) : [];
  } catch {
    return [];
  }
}

// ─── REWIND ──────────────────────────────────────────────────────────────────
// Undo N conversation turns + associated file edits
export function rewindMessages(messages, turns = 1) {
  // turns = number of user+assistant pairs to remove from end
  let count = 0;
  let idx = messages.length - 1;
  while (idx >= 0 && count < turns * 2) {
    idx--;
    count++;
  }
  return messages.slice(0, Math.max(1, idx + 1));
}

// ─── PERMISSIONS ─────────────────────────────────────────────────────────────
export const DEFAULT_PERMISSIONS = {
  read_file:       true,
  write_file:      false, // always ask
  exec:            false, // always ask
  list_files:      true,
  search:          true,
  mcp:             false,
  delete_file:     false,
  browse:          false,
};

export function checkPermission(permissions, actionType) {
  return permissions?.[actionType] ?? DEFAULT_PERMISSIONS[actionType] ?? false;
}

// ─── EFFORT LEVELS ───────────────────────────────────────────────────────────
export const EFFORT_CONFIG = {
  low:    { maxIter: 3,  systemSuffix: '\n\nMode: LOW EFFORT. Jawab singkat, skip read loop kalau bisa, prioritas kecepatan.', label: '⚡ Low' },
  medium: { maxIter: 10, systemSuffix: '', label: '◎ Medium' },
  high:   { maxIter: 15, systemSuffix: '\n\nMode: HIGH EFFORT. Baca semua file relevan dulu. Parallel reads. Analisis mendalam sebelum jawab. Prioritas akurasi.', label: '🔥 High' },
};

// ─── ELICITATION ─────────────────────────────────────────────────────────────
// Handle MCP server requesting structured input
export function parseElicitation(reply) {
  const m = reply.match(/ELICIT:\s*({[\s\S]*?})/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}
