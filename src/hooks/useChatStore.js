import { useState } from 'react';
import { dbSaveMessages, dbLoadMessages, dbSearchMessages, dbSaveMemories, dbLoadMemories, dbSaveCheckpoint, dbLoadCheckpoints } from './useDb.js';
import { Preferences } from '@capacitor/preferences';
import { MAX_HISTORY } from '../constants.js';
import { askCerebrasStream } from '../api.js';
import { tfidfRank } from '../features.js';

export function useChatStore() {
  // ── Core chat ──
  const [messages, setMessages]   = useState([{ role: 'assistant', content: 'Halo Papa! Yuyu siap bantu coding. Mau ngerjain apa? 🌸' }]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [streaming, setStreaming] = useState('');
  const [agentRunning, setAgentRunning] = useState(false);
  const [gracefulStop, setGracefulStop]   = useState(false); // finish iter then stop
  const [agentStatus, setAgentStatus]   = useState(''); // e.g. 'Iter 2/10 · exec'
  const [showFollowUp, setShowFollowUp] = useState(false);

  // ── Rate limit ──
  const [rateLimitTimer, setRateLimitTimer] = useState(0);

  // ── Memories / Checkpoints ──
  const [memories, setMemoriesRaw]       = useState([]);
  const [checkpoints, setCheckpointsRaw] = useState([]);

  // ── Agent / Plan ──
  const [planSteps, setPlanSteps] = useState([]);
  const [planTask, setPlanTask]   = useState('');
  const [swarmRunning, setSwarmRunning] = useState(false);
  const [swarmLog, setSwarmLog]   = useState([]);

  // ── Input extras ──
  const [visionImage, setVisionImage]       = useState(null);
  const [slashSuggestions, setSlashSuggestions] = useState([]);
  const [ttsEnabled, setTtsEnabled]         = useState(false);

  // ── Persisted setters ──
  function setMemories(next) {
    setMemoriesRaw(next);
    dbSaveMemories(next); // SQLite primary, Preferences fallback inside
  }
  function setCheckpoints(next) {
    setCheckpointsRaw(next);
    Preferences.set({ key: 'yc_checkpoints', value: JSON.stringify(next) });
  }

  // ── Load from SQLite (with Preferences fallback) ──
  function loadChatPrefs({ history, memories: mem, checkpoints: ckp }) {
    // Try SQLite first — async, falls back to Preferences data if DB unavailable
    (async () => {
  try {
    const msgs = (await dbLoadMessages('default')) ?? [];

    if (msgs.length > 0) {
      setMessages(msgs);
    } else if (history) {
      try { setMessages(JSON.parse(history)); } catch {}
    }
  } catch {}
})();
    (async () => {
  try {
    const mems = (await dbLoadMemories()) ?? [];

    if (mems.length > 0) {
      setMemoriesRaw(mems);
    } else if (mem) {
      try { setMemoriesRaw(JSON.parse(mem)); } catch {}
    }
  } catch {}
})();
    (async () => {
  try {
    const c = await dbLoadCheckpoints();

    if (c) {
      setCheckpoints(c);
    } else if (ckp) {
      try { setCheckpoints(JSON.parse(ckp)); } catch {}
    }
  } catch {}
})();
  }

  // ── Persist messages on change (called from useEffect in App) ──
  function persistMessages(msgs) {
    if (msgs.length > 1) {
      // SQLite primary, Preferences fallback handled inside dbSaveMessages
      dbSaveMessages(msgs.slice(-MAX_HISTORY), 'default');
    }
    setShowFollowUp(msgs.length > 1 && msgs[msgs.length - 1]?.role === 'assistant');
  }

  // ── trimHistory — per-model context budget ──
  // compact (8B): ~24k chars | medium (32-70B): ~60k | full (235B+): ~100k
  function getMaxChars(modelId) {
    const id = modelId || '';
    if (id.includes('8b') || id.includes('8B')) return 24000;
    if (id.includes('32b') || id.includes('70b') || id.includes('scout')) return 60000;
    return 100000;
  }

  function trimHistory(msgs, modelId) {
    const MAX_CHARS = getMaxChars(modelId);
    const total = msgs.reduce((a, m) => a + (m.content?.length || 0), 0);
    if (total <= MAX_CHARS) return msgs;
    // compact models get tighter window — less HEAD/TAIL to preserve more recency
    const isCompact = MAX_CHARS <= 24000;
    const HEAD = isCompact ? 2 : 4;
    const TAIL = isCompact ? 8  : 12;
    if (msgs.length <= HEAD + TAIL + 1) return msgs;
    const middle = msgs.slice(HEAD + 1, -TAIL);
    const summaryLen = isCompact ? 400 : 800;
    const summary = middle.map(m =>
      (m.role === 'user' ? 'Papa' : 'Yuyu') + ': ' +
      (m.content || '').replace(/```action[\s\S]*?```/g, '[action]').slice(0, isCompact ? 60 : 120)
    ).join(' | ');
    return [
      ...msgs.slice(0, HEAD + 1),
      { role: 'assistant', content: '[Ringkasan ' + middle.length + ' pesan: ' + summary.slice(0, summaryLen) + ']' },
      ...msgs.slice(-TAIL),
    ];
  }

  // ── Auto memory extraction ──
  async function extractMemories(userMsg, aiReply, folder) {
    if (aiReply.length < 300) return;
    const technicalSignals = /\.(jsx?|tsx?|py|sh|json|yml|md)\b|```|patch_file|write_file|exec|import |function |class |const |error|bug|fix|install|npm|git/i;
    if (!technicalSignals.test(aiReply) && !technicalSignals.test(userMsg)) return;

    try {
      const ctrl = new AbortController();
      const reply = await askCerebrasStream([
        { role: 'system', content: 'Extract 0-2 hal penting yang perlu diingat dari percakapan coding ini. Format: satu per baris, dimulai "• ". Hanya extract keputusan teknis, bug fix, atau fakta project yang spesifik. Kalau tidak ada, tulis "none".' },
        { role: 'user', content: 'User: ' + userMsg.slice(0, 400) + '\n\nAI: ' + aiReply.slice(0, 600) },
      ], 'llama3.1-8b', () => {}, ctrl.signal, { maxTokens: 256 });
      if (reply.trim() === 'none' || !reply.includes('•')) return;
      const newMems = reply.split('\n').filter(l => l.startsWith('•'))
        .map(l => ({ id: crypto.randomUUID(), text: l.slice(1).trim(), folder, ts: new Date().toLocaleDateString('id') }));
      if (!newMems.length) return;
      setMemories([...newMems, ...memories].slice(0, 50));
    } catch (_e) { }
  }

  // ── getRelevantMemories (TF-IDF scoring) ──
  function getRelevantMemories(txt) {
    if (!memories.length) return [];
    const ranked = tfidfRank(memories, txt, 5);
    const hasScore = ranked.some(m => (m._score || 0) > 0);
    return hasScore ? ranked : memories.slice(0, 5);
  }

  // ── saveCheckpoint — chat + file snapshot via git stash snapshot ──
  async function saveCheckpoint(folder, branch, notes, callServerFn) {
    let filePatch = '';
    if (folder && callServerFn) {
      const diffR = await callServerFn({ type: 'exec', path: folder, command: 'git diff HEAD 2>/dev/null | head -200' });
      if (diffR.ok) filePatch = diffR.data || '';
    }
    const cp = {
      id: Date.now(),
      label: new Date().toLocaleString('id'),
      messages: messages.slice(-30),
      folder, branch, notes,
      filePatch,                       // git diff snapshot
      timestamp: Date.now(),
    };
    setCheckpoints([cp, ...checkpoints].slice(0, 10));
    dbSaveCheckpoint(cp); // persist to SQLite
    setMessages(m => [...m, { role: 'assistant', content: '📍 **Checkpoint disimpan:** ' + cp.label + (filePatch ? '\n_Git diff snapshot: ' + filePatch.split('\n').length + ' baris_' : ''), actions: [] }]);
  }

  // ── restoreCheckpoint — chat + optional file restore ──
  async function restoreCheckpoint(cp, setFolder, setFolderInput, setNotesRaw, callServerFn) {
    setMessages(cp.messages || []);
    if (cp.folder) { setFolder(cp.folder); setFolderInput(cp.folder); }
    if (cp.notes) setNotesRaw(cp.notes);
    if (cp.filePatch && cp.filePatch.trim() && callServerFn) {
      const revert = await callServerFn({ type: 'exec', path: cp.folder, command: 'git stash 2>/dev/null && echo STASHED || echo SKIP' });
      const stashed = revert.ok && (revert.data||'').includes('STASHED');
      setMessages(m => [...m, {
        role: 'assistant',
        content: '✅ **Restored checkpoint:** ' + cp.label +
          (stashed ? '\n🗂 File unstaged di-stash. Gunakan `git stash pop` untuk recover.' : ''),
        actions: []
      }]);
    } else {
      setMessages(m => [...m, { role: 'assistant', content: '✅ **Restored checkpoint:** ' + cp.label, actions: [] }]);
    }
  }

  // ── exportChat ──
  function exportChat() {
    const md = messages.map(m =>
      `**${m.role === 'user' ? 'Papa' : 'Yuyu'}:** ${m.content.replace(/```action[\s\S]*?```/g, '').trim()}`
    ).join('\n\n---\n\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `yuyucode-chat-${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
    setMessages(m => [...m, { role: 'assistant', content: '📤 Chat diekspor~', actions: [] }]);
  }

  // ── clearChat ──
  function clearChat() {
    setMessages([{ role: 'assistant', content: 'Halo Papa! Yuyu siap bantu coding. Mau ngerjain apa? 🌸' }]);
    Preferences.remove({ key: 'yc_history' });
    setShowFollowUp(false);
  }

  // ── startRateLimitTimer ──
  function startRateLimitTimer(secs) {
    setRateLimitTimer(secs);
    const iv = setInterval(() => setRateLimitTimer(t => {
      if (t <= 1) { clearInterval(iv); return 0; }
      return t - 1;
    }), 1000);
  }

  return {
    messages, setMessages,
    deleteMessage: (idx) => setMessages(m => m.filter((_, i) => i !== idx)),
    editMessage:   (idx, newContent) => setMessages(m => m.map((msg, i) => i === idx ? { ...msg, content: newContent } : msg)),
    searchMessages: async (q) => {
      if (!q.trim()) return [];
      // Try SQLite FTS first
      const sqlResults = (await dbSearchMessages(q, 'default')) ?? [];
      if (sqlResults.length > 0) return sqlResults;
      // Fallback: in-memory search
      const lq = q.toLowerCase();
      return messages
        .map((m, i) => ({ ...m, idx: i }))
        .filter(m => (m.content || '').toLowerCase().includes(lq));
    },
    input, setInput,
    loading, setLoading,
    streaming, setStreaming,
    agentRunning, setAgentRunning,
    gracefulStop, setGracefulStop,
    agentStatus, setAgentStatus,
    showFollowUp, setShowFollowUp,
    rateLimitTimer, setRateLimitTimer,
    memories, setMemories,
    checkpoints, setCheckpoints,
    planSteps, setPlanSteps,
    planTask, setPlanTask,
    swarmRunning, setSwarmRunning,
    swarmLog, setSwarmLog,
    visionImage, setVisionImage,
    slashSuggestions, setSlashSuggestions,
    ttsEnabled, setTtsEnabled,
    loadChatPrefs, persistMessages,
    trimHistory, extractMemories, getRelevantMemories,
    saveCheckpoint, restoreCheckpoint,
    exportChat, clearChat,
    startRateLimitTimer,
  };
}
