import { callServer } from './api.js';
import { diffLines } from 'diff';

// ── TOKEN COUNT ──
export function countTokens(msgs) {
  return Math.round(msgs.reduce((a, m) => a + (m.content?.length || 0), 0) / 4);
}

// ── FILE ICON ──
export function getFileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  const icons = {
    jsx:'jsx', tsx:'tsx', js:'js', ts:'ts', json:'{}',
    md:'md', yml:'yml', yaml:'yml', css:'css', html:'html', sh:'sh',
    txt:'txt', png:'img', jpg:'img', svg:'svg', py:'py', rb:'rb',
    go:'go', rs:'rs', java:'java', kt:'kt', swift:'sw',
  };
  return icons[ext] || ext || '?';
}
// ── SYNTAX HIGHLIGHT ──
// Baru untuk dimasukkan ke utils.js
// Ganti function hl() yang lama
export function hl(code, lang = '') {
  let s = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const L = lang.toLowerCase();

  // Protect already-generated spans from subsequent regex passes
  function protect(str, fn) {
    const saved = [];
    const hidden = str.replace(/<span[^>]*>[\s\S]*?<\/span>/g, m => {
      saved.push(m);
      return `_${saved.length - 1}_`;
    });
    const result = fn(hidden);
    return result.replace(/_(\d+)_/g, (_, i) => saved[+i]);
  }

  if (L === 'json') {
    s = protect(s, t => t.replace(/(\"(?:[^\"\\]|\\.)*\")(\s*:)/g, '<span style="color:#79b8ff">$1</span>$2')); // eslint-disable-line no-useless-escape
    s = protect(s, t => t.replace(/:\s*(\"(?:[^\"\\]|\\.)*\")/g, ': <span style="color:#98c379">$1</span>')); // eslint-disable-line no-useless-escape
    s = protect(s, t => t.replace(/\b(true|false|null)\b/g, '<span style="color:#f97583">$1</span>'));
    s = protect(s, t => t.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#d19a66">$1</span>'));
    return s;
  }
  if (L === 'bash' || L === 'sh') {
    s = protect(s, t => t.replace(/(#.*$)/gm, '<span style="color:#6a737d">$1</span>'));
    s = protect(s, t => t.replace(/\b(echo|cd|ls|git|npm|node|export|source|if|then|fi|for|do|done|while|function|return|mkdir|cp|mv|rm|chmod|curl|wget)\b/g, '<span style="color:#c678dd">$1</span>'));
    s = protect(s, t => t.replace(/(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>')); // eslint-disable-line no-useless-escape
    s = protect(s, t => t.replace(/(\$\w+|\$\{[^}]+\})/g, '<span style="color:#79b8ff">$1</span>'));
    return s;
  }
  if (L === 'python' || L === 'py') {
    s = protect(s, t => t.replace(/(#.*$)/gm, '<span style="color:#6a737d">$1</span>'));
    s = protect(s, t => t.replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g, '<span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/\b(def|class|import|from|return|if|elif|else|for|while|try|except|with|as|in|not|and|or|True|False|None|lambda|yield|async|await|pass|raise|del|global|nonlocal)\b/g, '<span style="color:#c678dd">$1</span>'));
    s = protect(s, t => t.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#d19a66">$1</span>'));
    return s;
  }
  if (L === 'css') {
    s = protect(s, t => t.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6a737d">$1</span>'));
    s = protect(s, t => t.replace(/([.#]?[\w-]+)\s*\{/g, '<span style="color:#79b8ff">$1</span>{'));
    s = protect(s, t => t.replace(/([\w-]+)\s*:/g, '<span style="color:#b392f0">$1</span>:'));
    s = protect(s, t => t.replace(/:\s*([^;{]+)/g, ': <span style="color:#98c379">$1</span>'));
    return s;
  }
  // default JS/JSX/TS/TSX
  s = protect(s, t => t.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span style="color:#6a737d">$1</span>'));
  s = protect(s, t => t.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color:#98c379">$1</span>'));
  s = protect(s, t => t.replace(/(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>')); // eslint-disable-line no-useless-escape
  s = protect(s, t => t.replace(/\b(const|let|var|function|return|if|else|for|while|import|export|default|async|await|try|catch|finally|class|new|this|from|of|in|typeof|instanceof|null|undefined|true|false|throw|switch|case|break|continue|extends|super|static|get|set|type|interface|enum|as|keyof|readonly)\b/g, '<span style="color:#c678dd">$1</span>'));
  s = protect(s, t => t.replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span style="color:#79b8ff">$1</span>'));
  s = protect(s, t => t.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#d19a66">$1</span>'));
  return s;
}


// ── PATH RESOLVER ──
export function resolvePath(base, p) {
  if (!p) return base;
  if (!base) return p;
  const b = base.replace(/\/$/, '');      // strip trailing slash
  const q = p.replace(/^\//, '');          // strip leading slash
  if (q === b || q.startsWith(b + '/')) return q;
  const stripped = q.startsWith(b) ? q.slice(b.length).replace(/^\//, '') : q;
  return b + '/' + stripped;
}

// ── ACTION PARSER ──
export function parseActions(text) {
  const regex = /```action\n([\s\S]*?)```/g;
  const actions = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    try { actions.push(JSON.parse(m[1].trim())); } catch (_e) { }
  }
  return actions;
}

// ── SIMPLE DIFF GENERATOR ──
// Returns a compact unified-diff-style string for display (not patch format).
export function generateDiff(original, patched, maxLines = 40) {
  if (!original || !patched) return '';
  const hunks = diffLines(original, patched);
  const result = [];
  let shown = 0;
  let oldLine = 1, newLine = 1;
  for (const hunk of hunks) {
    const hunkLines = hunk.value.split('\n').filter((l, i, a) => !(i === a.length - 1 && l === ''));
    if (!hunk.added && !hunk.removed) {
      oldLine += hunkLines.length;
      newLine += hunkLines.length;
      continue;
    }
    for (const line of hunkLines) {
      if (shown >= maxLines) { result.push(`... (baris lebih)`); return result.join('\n'); }
      if (hunk.removed) { result.push(`- L${oldLine}: ${line}`); oldLine++; shown++; }
      if (hunk.added)   { result.push(`+ L${newLine}: ${line}`); newLine++; shown++; }
    }
    if (!hunk.removed) newLine += hunkLines.length - (hunk.added ? hunkLines.length : 0);
    if (!hunk.added)   oldLine += hunkLines.length - (hunk.removed ? hunkLines.length : 0);
  }
  return result.join('\n');
}

// ── ACTION EXECUTOR ──
export async function executeAction(action, baseFolder) {
  const base = baseFolder || '';

  if (action.type === 'read_file') {
    const payload = { type: 'read', path: resolvePath(base, action.path) };
    if (action.from) payload.from = action.from;
    if (action.to)   payload.to   = action.to;
    const r = await callServer(payload);
    if (r.ok && r.meta) {
      r.data = `[Lines ${action.from || 1}–${action.to || r.meta.totalLines} / ${r.meta.totalLines} | ${Math.round(r.meta.totalChars / 1000)}KB]\n` + r.data;
    }
    return r;
  }

  if (action.type === 'write_file') {
    return callServer({ type: 'write', path: resolvePath(base, action.path), content: action.content });
  }

  if (action.type === 'append_file') {
    return callServer({ type: 'append', path: resolvePath(base, action.path), content: action.content });
  }

  if (action.type === 'patch_file') {
    return callServer({
      type:    'patch',
      path:    resolvePath(base, action.path),
      old_str: action.old_str,
      new_str: action.new_str !== undefined ? action.new_str : '',
    });
  }

  if (action.type === 'list_files') {
    const r = await callServer({ type: 'list', path: resolvePath(base, action.path) });
    if (r.ok && Array.isArray(r.data)) {
      r.data = r.data
        .map(f => (f.isDir ? '📁 ' : '📄 ') + f.name + (f.size ? ` (${Math.round(f.size / 1024)}KB)` : ''))
        .join('\n');
    }
    return r;
  }

  if (action.type === 'tree') {
    return callServer({ type: 'tree', path: resolvePath(base, action.path || ''), depth: action.depth || 3 });
  }

  if (action.type === 'exec') {
    return callServer({ type: 'exec', path: base, command: action.command });
  }

  if (action.type === 'search') {
    return callServer({ type: 'search', path: resolvePath(base, action.path || ''), content: action.query });
  }

  if (action.type === 'web_search') {
    return callServer({ type: 'web_search', query: action.query });
  }

  if (action.type === 'file_info') {
    return callServer({ type: 'info', path: resolvePath(base, action.path) });
  }

  if (action.type === 'delete_file') {
    return callServer({ type: 'delete', path: resolvePath(base, action.path) });
  }

  if (action.type === 'move_file') {
    return callServer({
      type: 'move',
      from: resolvePath(base, action.from || action.path),
      to:   resolvePath(base, action.to),
    });
  }

  if (action.type === 'mkdir') {
    return callServer({ type: 'mkdir', path: resolvePath(base, action.path) });
  }

  if (action.type === 'find_symbol') {
    return callServer({ type: 'search', path: resolvePath(base, action.path || ''), content: action.symbol });
  }

  if (action.type === 'mcp') {
    return callServer({ type: 'mcp', tool: action.tool, action: action.action, params: action.params || {} });
  }

  if (action.type === 'create_structure') {
    const results = [];
    for (const item of (action.files || [])) {
      const r = await callServer({ type: 'write', path: resolvePath(base, item.path), content: item.content || '' });
      results.push((r.ok ? '✅' : '❌') + ' ' + item.path);
    }
    return { ok: true, data: results.join('\n') };
  }

  if (action.type === 'lint') {
    const r = await callServer({ type: 'read', path: resolvePath(base, action.path) });
    if (!r.ok) return r;
    const issues = [];
    const lines  = r.data.split('\n');
    let opens = 0, closes = 0;
    lines.forEach((line, i) => {
      opens  += (line.match(/[{[(]/g) || []).length;
      closes += (line.match(/[}\])]/g) || []).length;
      if (line.includes('console.log') && !action.allowLogs) issues.push('Line ' + (i + 1) + ': console.log');
      if (line.length > 200) issues.push('Line ' + (i + 1) + ': baris terlalu panjang (' + line.length + ')');
    });
    if (opens !== closes) issues.push('Bracket tidak balance: ' + opens + ' buka, ' + closes + ' tutup');
    return { ok: true, data: issues.length ? issues.join('\n') : '✅ Clean' };
  }

  return { ok: false, data: 'Unknown action type: ' + action.type };
}
