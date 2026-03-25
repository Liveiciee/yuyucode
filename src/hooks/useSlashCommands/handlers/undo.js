import { simpleResponse } from '../helpers/simpleResponse.js';
import { callServer } from '../../../api.js';
import { rewindMessages } from '../../../features.js';
import { withLoading } from '../helpers/withLoading.js';

export function handleUndo({ parts, editHistory, setEditHistory, setLoading, setMessages }) {
  if (editHistory.length === 0) {
    simpleResponse(setMessages, 'Tidak ada edit yang bisa diundo.');
    return;
  }

  const n = parseInt(parts[1]) || 1;
  const itemsToUndo = editHistory.slice(-n).reverse(); // proses dari yang paling baru

  return withLoading(setLoading, async () => {
    const results = await Promise.allSettled(
      itemsToUndo.map(item =>
        callServer({ type: 'write', path: item.path, content: item.content })
      )
    );

    setEditHistory(prev => prev.slice(0, -n));

    const successful = itemsToUndo
      .filter((_, i) => results[i].status === 'fulfilled' && results[i].value?.ok)
      .map(item => item.path);

    simpleResponse(setMessages, `Berhasil undo: ${successful.join(', ')}`);
  });
}

export function handleRewind({ parts, messages, setMessages }) {
  const turns = parseInt(parts[1]) || 1;
  const newMessages = rewindMessages(messages, turns);
  setMessages(newMessages);
  simpleResponse(setMessages, `Rewind ${turns} turn`);
}
