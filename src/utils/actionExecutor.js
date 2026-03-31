// src/utils/actionExecutor.js
import { callServer } from '../api/callServer.js';
import { resolvePath } from './path.js';

const ACTION_HANDLERS = {
  async read_file(action, base, cs) {
    const payload = { type: 'read', path: resolvePath(base, action.path) };
    if (action.from) payload.from = action.from;
    if (action.to)   payload.to   = action.to;
    const r = await cs(payload);
    if (r?.ok && r?.meta) {
      if (r) r.data = `[Lines ${action.from || 1}–${action.to || r.meta.totalLines} / ${r.meta.totalLines} | ${Math.round(r.meta.totalChars / 1000)}KB]\n` + r.data;
    }
    return r;
  },
  write_file:  (a, base, cs) => cs({ type: 'write',  path: resolvePath(base, a.path), content: a.content }),
  append_file: (a, base, cs) => cs({ type: 'append', path: resolvePath(base, a.path), content: a.content }),
  patch_file:  (a, base, cs) => cs({ type: 'patch',  path: resolvePath(base, a.path), old_str: a.old_str, new_str: a.new_str ?? '' }),
  tree:        (a, base, cs) => cs({ type: 'tree',   path: resolvePath(base, a.path || ''), depth: a.depth || 3 }),
  exec:        (a, base, cs) => cs({ type: 'exec',   path: base, command: a.command }),
  web_search:  (a, _b,  cs) => cs({ type: 'web_search', query: a.query }),
  file_info:   (a, base, cs) => cs({ type: 'info',   path: resolvePath(base, a.path) }),
  delete_file: (a, base, cs) => cs({ type: 'delete', path: resolvePath(base, a.path) }),
  mkdir:       (a, base, cs) => cs({ type: 'mkdir',  path: resolvePath(base, a.path) }),
  find_symbol: (a, base, cs) => cs({ type: 'search', path: resolvePath(base, a.path || ''), content: a.symbol }),
  mcp:         (a, _b,  cs) => cs({ type: 'mcp', tool: a.tool, action: a.action, params: a.params || {} }),

  async search(action, base, cs) {
    return cs({ type: 'search', path: resolvePath(base, action.path || ''), content: action.query });
  },

  async list_files(action, base, cs) {
    const r = await cs({ type: 'list', path: resolvePath(base, action.path) });
    if (r.ok && Array.isArray(r.data)) {
      r.data = r.data
        .map(f => (f.isDir ? '📁 ' : '📄 ') + f.name + (f.size ? ` (${Math.round(f.size / 1024)}KB)` : ''))
        .join('\n');
    }
    return r;
  },

  move_file(action, base, cs) {
    return cs({ type: 'move', from: resolvePath(base, action.from || action.path), to: resolvePath(base, action.to) });
  },

  async create_structure(action, base, cs) {
    const results = [];
    for (const item of (action.files || [])) {
      const r = await cs({ type: 'write', path: resolvePath(base, item.path), content: item.content || '' });
      results.push((r.ok ? '✅' : '❌') + ' ' + item.path);
    }
    return { ok: true, data: results.join('\n') };
  },

  async lint(action, base, cs) {
    const r = await cs({ type: 'read', path: resolvePath(base, action.path) });
    if (!r.ok) return r;
    const issues = [];
    const lines  = r.data.split('\n');
    let opens = 0, closes = 0;
    lines.forEach((line, i) => {
      opens  += (line.match(/[{[(]/g) || []).length;
      closes += (line.match(/[}\])]/g) || []).length;
      if (line.includes('logger.info') && !action.allowLogs) issues.push('Line ' + (i + 1) + ': logger.info');
      if (line.length > 200) issues.push('Line ' + (i + 1) + ': baris terlalu panjang (' + line.length + ')');
    });
    if (opens !== closes) issues.push('Bracket tidak balance: ' + opens + ' buka, ' + closes + ' tutup');
    return { ok: true, data: issues.length ? issues.join('\n') : '✅ Clean' };
  },
};

export async function executeAction(action, baseFolder, _callServer) {
  const base    = baseFolder || '';
  const cs      = _callServer || callServer;
  const handler = ACTION_HANDLERS[action.type];
  if (handler) return handler(action, base, cs);
  return { ok: false, data: 'Unknown action type: ' + action.type };
}
