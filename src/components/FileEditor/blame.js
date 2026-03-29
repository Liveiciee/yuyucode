// src/components/FileEditor/blame.js
import { GutterMarker, gutter } from '@codemirror/view';
import { callServer } from '../../api.js';

export class BlameMarker extends GutterMarker {
  constructor(info) { super(); this.info = info; }
  toDOM() {
    const el = document.createElement('span');
    el.className = 'cm-blame-gutter';
    el.textContent = this.info;
    el.title = this.info;
    return el;
  }
}

export function makeBlameGutter(blameMap) {
  return gutter({
    class: 'cm-blame-gutter',
    lineMarker(view, line) {
      const lineNo = view.state.doc.lineAt(line.from).number;
      const info = blameMap.get(lineNo);
      return info ? new BlameMarker(info) : null;
    },
    initialSpacer: () => new BlameMarker('a1b2c3 you 1d'),
  });
}

export async function fetchBlame(folder, filePath) {
  const rel = filePath.replace(folder.endsWith('/') ? folder : folder + '/', '');
  const r = await callServer({
    type: 'exec', path: folder,
    command: `git blame --abbrev=7 --date=short -- "${rel}" 2>/dev/null | head -2000`,
  });
  if (!r.ok || !r.data) return new Map();
  const map = new Map();
  (r.data || '').split('\n').forEach((line, idx) => {
    const m = line.match(/^[\^]?([0-9a-f]{4,})\s+\(([^)]+?)\s+(\d{4}-\d{2}-\d{2})\s+\d+\)/);
    if (!m) return;
    const hash   = m[1].slice(0, 7);
    const author = m[2].trim().split(/\s+/)[0].slice(0, 8).padEnd(8);
    const date   = m[3];
    map.set(idx + 1, `${hash} ${author} ${date}`);
  });
  return map;
}
export { BlameMarker };
