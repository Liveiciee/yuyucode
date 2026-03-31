// src/utils/syntax.js
import { callServer } from '../api/server.js';
import { resolvePath } from './path.js';

export function getSyntaxCmd(ext, absPath) {
  if (['js', 'cjs', 'mjs'].includes(ext))
    return `node --check "${absPath}" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
  if (ext === 'json')
    return `python3 -m json.tool "${absPath}" > /dev/null 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
  if (ext === 'sh')
    return `bash -n "${absPath}" 2>&1 && echo "SYNTAX_OK" || echo "SYNTAX_ERR"`;
  return null;
}

export async function verifySyntaxBatch(targets, folder, setMessages, sendMsgRef = null) {
  for (const wr of targets) {
    const ext     = (wr.path || '').split('.').pop().toLowerCase();
    const absPath = resolvePath(folder, wr.path);
    const cmd     = getSyntaxCmd(ext, absPath);
    if (!cmd) continue;
    const vr   = await callServer({ type: 'exec', path: folder, command: cmd });
    const vOut = (vr.data || '').trim();
    if (!vOut) continue;
    const hasError = vOut.includes('SYNTAX_ERR') ||
      (vOut.toLowerCase().includes('error') && !vOut.includes('SYNTAX_OK'));
    if (hasError) {
      const fname = (wr.path || '').split('/').pop();
      setMessages(m => [...m, {
        role: 'assistant',
        content: 'Syntax error di ' + fname + ':\n```\n' + vOut.slice(0, 300) + '\n```',
        actions: [],
      }]);
      if (sendMsgRef) {
        setTimeout(() => sendMsgRef.current?.(
          'Fix syntax error di ' + wr.path + ':\n```\n' + vOut.slice(0, 300) + '\n```'
        ), 700);
      }
    }
  }
}
