// undo.js — handlers untuk /undo, /rewind
import { callServer } from '../../../api.js';
import { rewindMessages } from '../../../features.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleUndo({ parts, editHistory, setEditHistory, setLoading, setMessages }) {
  const n = parseInt(parts[1]) || 1;
  const history = editHistory || [];
  if (history.length === 0) {
    simpleResponse(setMessages, '⏪ Tidak ada edit yang bisa di-undo.');
    return;
  }
  
  withLoading(setLoading, async () => {
    const toUndo = history.slice(-n);
    const undone = [];
    for (const item of toUndo) {
      const r = await callServer({ type: 'write', path: item.path, content: item.content });
      if (r.ok) undone.push(item.path.split('/').pop());
    }
    setEditHistory(h => h.slice(0, -n));
    simpleResponse(setMessages, `⏪ **Undo ${undone.length} edit:** ${undone.join(', ')}\n\nFile dikembalikan ke versi sebelumnya.`);
  });
}

export function handleRewind({ parts, messages, setMessages }) {
  const turns = parseInt(parts[1]) || 1;
  const rewound = rewindMessages(messages, turns);
  setMessages(rewound);
  simpleResponse(setMessages, '⏪ Rewind ' + turns + ' turn. ' + rewound.length + ' pesan tersisa.');
}
