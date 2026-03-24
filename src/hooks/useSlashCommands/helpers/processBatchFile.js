// processBatchFile.js — batch command processor
import { callServer } from '../../../api.js';
import { parseActions } from '../../../utils.js';

const isArm64 = /arm64|arm|aarch64/i.test(navigator?.platform || '') || /aarch64/i.test(navigator?.userAgent || '');
const MAX_FILE_READ = isArm64 ? 4000 : 6000;

export async function processBatchFile(f, folder, batchCmd, callAI, signal, setMessages) {
  const filePath = folder + '/src/' + f.name;
  const r = await callServer({ type: 'read', path: filePath });
  if (!r.ok) return 'failed';
  try {
    const reply = await callAI([
      { role: 'system', content: 'Kamu adalah code editor. Task: ' + batchCmd + '\nFile: ' + filePath + '\nGunakan write_file action untuk apply perubahan. Kalau tidak ada yang perlu diubah, balas hanya kata SKIP.' },
      { role: 'user', content: '```\n' + r.data.slice(0, MAX_FILE_READ) + '\n```' },
    ], () => { }, signal);
    if (reply.trim().toUpperCase().startsWith('SKIP')) return 'skipped';
    const acts = parseActions(reply).filter(a => a.type === 'write_file');
    acts.forEach(w => { if (!w.path.startsWith('/')) w.path = folder + '/src/' + w.path.replace(/^\.\//, ''); });
    return acts;
  } catch (e) {
    if (e.name === 'AbortError') return 'aborted';
    setMessages(m => [...m, { role: 'assistant', content: '  ❌ ' + f.name + ': ' + e.message.slice(0, 60), actions: [] }]);
    return 'failed';
  }
}
