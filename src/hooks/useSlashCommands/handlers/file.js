// file.js — handlers untuk /pin, /unpin, /index, /tree, /deps, /history
import { callServer } from '../../../api.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handlePin({ parts, folder, selectedFile, pinnedFiles, togglePin, setMessages }) {
  const target = parts.slice(1).join(' ').trim();
  if (!target) {
    const pins = (pinnedFiles || []);
    if (pins.length === 0) {
      simpleResponse(setMessages, '📌 Belum ada file yang di-pin.\n\nUsage: `/pin src/api.js` — file ini akan selalu masuk context.');
    } else {
      simpleResponse(setMessages, '📌 **Pinned files** (selalu masuk context):\n' + pins.map(p => '- `' + p + '`').join('\n') + '\n\n`/pin <file>` untuk tambah, `/unpin <file>` untuk hapus.');
    }
  } else {
    togglePin(folder + '/' + target.replace(/^\//, ''));
    const isNowPinned = !(pinnedFiles || []).includes(folder + '/' + target.replace(/^\//, ''));
    simpleResponse(setMessages, (isNowPinned ? '📌 Pinned' : '📌 Unpinned') + ': `' + target + '`\n' + (isNowPinned ? 'File ini akan selalu masuk context agent loop.' : 'File dikeluarkan dari pinned context.'));
  }
}

export function handleUnpin({ parts, folder, selectedFile, togglePin, setMessages }) {
  const target = parts.slice(1).join(' ').trim() || selectedFile;
  if (target) {
    togglePin(target.startsWith('/') ? target : folder + '/' + target);
    simpleResponse(setMessages, '📌 Unpinned: `' + target + '`');
  }
}

export function handleIndex({ parts, folder, setLoading, setMessages }) {
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '🔍 Building symbol index...');
    const srcPath = parts[1] ? folder + '/' + parts[1] : folder + '/src';
    const idxR = await callServer({ type: 'index', path: srcPath });
    if (idxR.ok) {
      const meta = idxR.meta || {};
      simpleResponse(setMessages, `✅ **Symbol Index** (${meta.files || '?'} files, ${meta.symbols || '?'} symbols)\n\n${idxR.data}`);
    } else {
      simpleResponse(setMessages, '❌ Index gagal: ' + (idxR.data || 'unknown error'));
    }
  });
}

export function handleTree({ parts, folder, setLoading, setMessages }) {
  withLoading(setLoading, async () => {
    const depth = parseInt(parts[1]) || 2;
    const r = await callServer({ type: 'tree', path: folder, depth });
    simpleResponse(setMessages, '📁 **Tree (depth ' + depth + '):**\n```\n' + (r.data || '(kosong)').slice(0, 2000) + '\n```');
  });
}

export function handleHistory({ selectedFile, setShowFileHistory, setMessages }) {
  if (!selectedFile) {
    simpleResponse(setMessages, 'Buka file dulu Papa~');
    return;
  }
  setShowFileHistory(true);
}
