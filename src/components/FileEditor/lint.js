import { linter, lintGutter } from '@codemirror/lint';
import { callServer } from '../../api.js';

export function makeSyntaxLinter(path, folder) {
  const ext = path?.split('.').pop()?.toLowerCase();
  if (ext === 'json') {
    return linter(view => {
      const src = view.state.doc.toString();
      try { JSON.parse(src); return []; }
      catch (e) {
        const match = e.message.match(/position (\d+)/);
        const pos = match ? parseInt(match[1]) : 0;
        return [{ from: pos, to: Math.min(pos + 1, src.length), severity: 'error', message: e.message }];
      }
    }, { delay: 600 });
  }
  if (['js', 'mjs', 'cjs'].includes(ext)) {
    return linter(async view => {
      const src  = view.state.doc.toString();
      const safe = src.replace(/\\/g, '\\\\').replace(/'/g, "'\\''");
      try {
        const r = await callServer({ type: 'exec', path: folder || '.',
          command: `echo '${safe}' | node --input-type=module --check 2>&1 || true` });
        if (!r.ok) return [];
        const line = (r.data || '').match(/stdin:(\d+)/);
        if (!line) return [];
        const lineNum = parseInt(line[1]);
        const doc = view.state.doc;
        const lineObj = doc.line(Math.min(lineNum, doc.lines));
        return [{ from: lineObj.from, to: lineObj.to, severity: 'error', message: (r.data || '').split('\n')[0] }];
      } catch (_) { return []; }
    }, { delay: 1200 });
  }
  return null;
}
