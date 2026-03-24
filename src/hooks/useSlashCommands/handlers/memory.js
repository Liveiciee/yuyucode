// memory.js — handlers untuk /amemory, /summarize, /compact, /handoff (handoff sudah di chat.js)
import { Preferences } from '@capacitor/preferences';
import { askCerebrasStream } from '../../../api.js';
import { tokenTracker } from '../../../features.js';
import { countTokens } from '../../../utils.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleAmemory({ parts, agentMemory, setAgentMemory, setMessages }) {
  const sub = parts[1]?.toLowerCase();
  const scope = ['user', 'project', 'local'].includes(parts[2]) ? parts[2] : 'user';
  const content = parts.slice(3).join(' ').trim();
  
  if (sub === 'add' && content) {
    const next = { ...agentMemory, [scope]: [...(agentMemory[scope] || []), { text: content, ts: new Date().toLocaleDateString('id'), id: Date.now() }] };
    setAgentMemory(next);
    Preferences.set({ key: 'yc_agent_memory', value: JSON.stringify(next) });
    simpleResponse(setMessages, '🧠 Memory [' + scope + ']: ' + content);
  } else if (sub === 'clear') {
    const next = { ...agentMemory, [scope]: [] };
    setAgentMemory(next);
    Preferences.set({ key: 'yc_agent_memory', value: JSON.stringify(next) });
    simpleResponse(setMessages, '🧠 Memory [' + scope + '] dihapus.');
  } else {
    const all = ['user', 'project', 'local'].map(s =>
      '**' + s + '** (' + (agentMemory[s] || []).length + '):\n' +
      ((agentMemory[s] || []).map(mx => '• ' + mx.text + (mx.ts ? ' (' + mx.ts + ')' : '')).join('\n') || 'kosong')
    ).join('\n\n');
    simpleResponse(setMessages, '🧠 **Agent Memory:**\n\n' + all + '\n\nUsage: /amemory add user|project|local <teks>\n/amemory clear user|project|local');
  }
}

export function handleSummarize({ parts, messages, setLoading, setMessages }) {
  const fromN = parseInt(parts[1]) || 0;
  const slice = fromN > 0 ? messages.slice(fromN) : messages.slice(1, -6);
  
  if (slice.length < 3) {
    simpleResponse(setMessages, 'Tidak cukup pesan untuk disummarize.');
    return;
  }
  
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '📦 Summarizing ' + slice.length + ' pesan...');
    const ctrl = new AbortController();
    try {
      const summary = await askCerebrasStream([
        { role: 'system', content: 'Buat ringkasan padat percakapan coding ini. Fokus: keputusan teknis, file yang diubah, bug fix, status. Maks 200 kata. Bahasa Indonesia.' },
        { role: 'user', content: slice.map(m => m.role + ': ' + (m.content || '').slice(0, 300)).join('\n\n') },
      ], 'llama3.1-8b', () => { }, ctrl.signal, { maxTokens: 512 });
      
      const kept = fromN > 0 ? messages.slice(0, fromN) : [messages[0], ...messages.slice(-6)];
      setMessages([...kept, { role: 'assistant', content: '📦 **Summary (' + slice.length + ' pesan):**\n\n' + summary, actions: [] }]);
    } catch (e) {
      if (e.name !== 'AbortError') simpleResponse(setMessages, '❌ ' + e.message);
    }
  });
}

export function handleCost({ setMessages }) {
  const summary = tokenTracker.summary();
  const gpt4Cost = ((tokenTracker.inputTokens / 1000) * 0.03 + (tokenTracker.outputTokens / 1000) * 0.06).toFixed(3);
  simpleResponse(setMessages, summary + '\n\n💰 **Estimasi vs GPT-4o:** ~$' + gpt4Cost + ' (kamu pakai gratis 🎉)');
}

export function handleUsage({ setMessages }) {
  simpleResponse(setMessages, tokenTracker.summary());
}

export function handleTokens({ messages, setMessages }) {
  const breakdown = messages.slice(-10).map(m => { 
    const tk = Math.round((m.content || '').length / 4); 
    return (m.role === 'user' ? 'Papa' : 'Yuyu') + ': ~' + tk + 'tk'; 
  }).join('\n');
  const totalTk = countTokens ? countTokens(messages) : Math.round(messages.reduce((a, m) => a + (m.content || '').length, 0) / 4);
  simpleResponse(setMessages, '📓 **Token breakdown (10 pesan terakhir)**\n```\n' + breakdown + '\n```\n**Total:** ~' + totalTk + 'tk | Cerebras gratis 🎉');
}
