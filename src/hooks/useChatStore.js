import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { MAX_HISTORY } from '../constants.js';
import { askCerebrasStream } from '../api.js';
import { tokenTracker, tfidfRank } from '../features.js';

export function useChatStore() {
  // ── Core chat ──
  const [messages, setMessages]   = useState([{ role: 'assistant', content: 'Halo Papa! Yuyu siap bantu coding. Mau ngerjain apa? 🌸' }]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [streaming, setStreaming] = useState('');
  const [agentRunning, setAgentRunning] = useState(false);
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
    Preferences.set({ key: 'yc_memories', value: JSON.stringify(next) });
  }
  function setCheckpoints(next) {
    setCheckpointsRaw(next);
    Preferences.set({ key: 'yc_checkpoints', value: JSON.stringify(next) });
  }

  // ── Load from Preferences ──
  function loadChatPrefs({ history, memories: mem, checkpoints: ckp }) {
    if (history) { try { setMessages(JSON.parse(history)); } catch {} }
    if (mem)     { try { setMemoriesRaw(JSON.parse(mem)); } catch {} }
    if (ckp)     { try { setCheckpointsRaw(JSON.parse(ckp)); } catch {} }
  }

  // ── Persist messages on change (called from useEffect in App) ──
  function persistMessages(msgs) {
    if (msgs.length > 1) {
      Preferences.set({
        key: 'yc_history',
        value: JSON.stringify(msgs.slice(-MAX_HISTORY).map(m => ({ role: m.role, content: m.content }))),
      });
    }
    setShowFollowUp(msgs.length > 1 && msgs[msgs.length - 1]?.role === 'assistant');
  }

  // ── trimHistory ──
  function trimHistory(msgs) {
    const MAX_CHARS = 100000;
    if (msgs.reduce((a, m) => a + m.content.length, 0) <= MAX_CHARS) return msgs;
    const HEAD = 4, TAIL = 12;
    if (msgs.length <= HEAD + TAIL + 1) return msgs;
    const middle = msgs.slice(HEAD + 1, -TAIL);
    const summary = middle.map(m =>
      (m.role === 'user' ? 'Papa' : 'Yuyu') + ': ' +
      m.content.replace(/```action[\s\S]*?```/g, '[action]').slice(0, 120)
    ).join(' | ');
    return [
      ...msgs.slice(0, HEAD + 1),
      { role: 'assistant', content: '[Ringkasan ' + middle.length + ' pesan: ' + summary.slice(0, 800) + ']' },
      ...msgs.slice(-TAIL),
    ];
  }

  // ── Auto memory extraction ──
  async function extractMemories(userMsg, aiReply, folder) {
    // Skip kalau reply terlalu pendek atau tidak technical
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
        .map(l => ({ id: Date.now() + Math.random(), text: l.slice(1).trim(), folder, ts: new Date().toLocaleDateString('id') }));
      if (!newMems.length) return;
      setMemories([...newMems, ...memories].slice(0, 50));
    } catch {}
  }

  // ── getRelevantMemories (TF-IDF scoring) ──
  function getRelevantMemories(txt) {
    if (!memories.length) return [];
    const ranked = tfidfRank(memories, txt, 5);
    // Fallback to most recent if no scores > 0
    const hasScore = ranked.some(m => (m._score || 0) > 0);
    return hasScore ? ranked : memories.slice(0, 5);
  }

  // ── saveCheckpoint ──
  function saveCheckpoint(folder, branch, notes) {
    const cp = { id: Date.now(), label: new Date().toLocaleString('id'), messages: messages.slice(-20), folder, branch, notes };
    setCheckpoints([cp, ...checkpoints].slice(0, 10));
    setMessages(m => [...m, { role: 'assistant', content: '📍 Checkpoint disimpan: ' + cp.label, actions: [] }]);
  }

  // ── restoreCheckpoint ──
  function restoreCheckpoint(cp, setFolder, setFolderInput, setNotesRaw) {
    setMessages(cp.messages);
    setFolder(cp.folder);
    setFolderInput(cp.folder);
    setNotesRaw(cp.notes || '');
    setMessages(m => [...m, { role: 'assistant', content: '✅ Restored checkpoint: ' + cp.label, actions: [] }]);
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
    setMessages([{ role: 'assistant', content: 'Chat baru. Mau ngerjain apa Papa? 🌸' }]);
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
    input, setInput,
    loading, setLoading,
    streaming, setStreaming,
    agentRunning, setAgentRunning,
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
    // functions
    loadChatPrefs, persistMessages,
    trimHistory, extractMemories, getRelevantMemories,
    saveCheckpoint, restoreCheckpoint,
    exportChat, clearChat,
    startRateLimitTimer,
  };
}
