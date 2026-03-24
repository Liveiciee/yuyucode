// git.js — handlers untuk /diff, /history, /status
import { MODELS } from '../../../constants.js';
import { callServer } from '../../../api.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleDiff({ parts, folder, setLoading, setMessages }) {
  const range = parts.slice(1).join(' ').trim();
  withLoading(setLoading, async () => {
    const cmd = range ? `git diff ${range} --stat` : 'git diff HEAD --stat';
    const r = await callServer({ type: 'exec', path: folder, command: cmd });
    if (!r.ok || !r.data?.trim()) {
      simpleResponse(setMessages, '±  Tidak ada diff.\n\nUsage: `/diff` (working tree) atau `/diff v3.0..v3.1`');
      return;
    }
    const lines = (r.data || '').split('\n').length;
    let full = '';
    if (lines < 50) {
      const rd = await callServer({ type: 'exec', path: folder, command: range ? `git diff ${range}` : 'git diff HEAD' });
      if (rd.ok) full = '\n```diff\n' + rd.data.slice(0, 3000) + '\n```';
    }
    simpleResponse(setMessages, '± **Git diff** ' + (range || 'HEAD') + ':\n```\n' + r.data + '\n```' + full);
  });
}

export function handleHistory({ selectedFile, setShowFileHistory, setMessages }) {
  if (!selectedFile) {
    simpleResponse(setMessages, 'Buka file dulu Papa~');
    return;
  }
  setShowFileHistory(true);
}

export function handleStatus({ folder, model, setLoading, setMessages }) {
  withLoading(setLoading, async () => {
    const [ping, git, nodeV, disk] = await Promise.all([
      callServer({ type: 'ping' }),
      callServer({ type: 'exec', path: folder, command: 'git status --short 2>&1 | head -5' }),
      callServer({ type: 'exec', path: folder, command: 'node --version 2>&1' }),
      callServer({ type: 'exec', path: folder, command: 'df -h . 2>&1 | tail -1' }),
    ]);
    const mx = MODELS?.find(x => x.id === model);
    simpleResponse(setMessages, '📊 **Status**\n**Server:** ' + (ping.ok ? '✅ Online' : '❌ Offline') + '\n**Model:** ' + (mx?.label || model) + '\n**Git:** ' + (git.data || '').trim().slice(0, 60) + '\n**Node:** ' + (nodeV.data || '').trim() + '\n**Disk:** ' + (disk.data || '').trim());
  });
}
