// src/hooks/useAgentLoop/compact.js
import { askCerebrasStream } from '../../api.js';

export async function compactContext(chat, project, abortRef, inlineCall = false) {
  const currentMsgs = chat.messages;
  if (currentMsgs.length < 10) {
    chat.setMessages(m => [...m, { role: 'assistant', content: 'Context masih kecil, belum perlu compact~', actions: [] }]);
    return;
  }
  if (!inlineCall) chat.setLoading(true);
  const ctrl = new AbortController();
  if (!inlineCall) abortRef.current = ctrl;
  const signal = inlineCall ? abortRef.current?.signal : ctrl.signal;
  try {
    const toCompact = currentMsgs.slice(1, -6);
    const summary   = await askCerebrasStream([
      { role: 'system', content: 'Buat ringkasan singkat percakapan coding ini. Fokus: keputusan teknis, files diubah, bug fix, status project. Maks 300 kata. Bahasa Indonesia.' },
      { role: 'user',   content: toCompact.map(m => m.role + ': ' + (m.content || '').slice(0, 300)).join('\n\n') },
    ], 'llama3.1-8b', () => {}, signal, { maxTokens: 512 });
    const compacted = [
      currentMsgs[0],
      { role: 'assistant', content: '📦 **Context dicompact** (' + toCompact.length + ' pesan):\n\n' + summary, actions: [] },
      ...currentMsgs.slice(-6),
    ];
    chat.setMessages(compacted);
  } catch (e) {
    if (e.name !== 'AbortError') {
      chat.setMessages(m => [...m, { role: 'assistant', content: '❌ Compact gagal: ' + e.message, actions: [] }]);
    }
  }
  if (!inlineCall) chat.setLoading(false);
}
