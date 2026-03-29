import { callServer } from './api.js';
import { diffLines } from 'diff';
import { CONFIG } from './api/config.js';

// ── LOGGER UTILITY ───────────────────────────────────────────────────────────
export const logger = {
  debug: (...args) => {
    if (import.meta.env?.DEV !== false) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// ── TOKEN COUNT & ICON ────────────────────────────────────────────────────────
export function countTokens(msgs) {
  return Math.round(msgs.reduce((a, m) => a + (m.content?.length || 0), 0) / 4);
}

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

// ── SYNTAX HIGHLIGHT ──────────────────────────────────────────────────────────
export function hl(code, lang = '') {
  let s = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const L = lang.toLowerCase();

  function protect(str, fn) {
    const saved = [];
    const hidden = str.replace(/<span[^>]*>.*?<\/span>/gs, m => {
      saved.push(m);
      return `_${saved.length - 1}_`;
    });
    const result = fn(hidden);
    return result.replace(/_(\d+)_/g, (_, i) => saved[+i]);
  }

  if (L === 'json') {
    s = protect(s, t => t.replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span style="color:#79b8ff">$1</span>$2'));
    s = protect(s, t => t.replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/\b(true|false|null)\b/g, '<span style="color:#f97583">$1</span>'));
    s = protect(s, t => t.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#d19a66">$1</span>'));
    return s;
  }
  if (L === 'bash' || L === 'sh') {
    s = protect(s, t => t.replace(/(#.*$)/gm, '<span style="color:#6a737d">$1</span>'));
    s = protect(s, t => t.replace(/\b(echo|cd|ls|git|npm|node|export|source|if|then|fi|for|do|done|while|function|return|mkdir|cp|mv|rm|chmod|curl|wget)\b/g, '<span style="color:#c678dd">$1</span>'));
    s = protect(s, t => t.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/(\$\w+|\$\{[^}]+\})/g, '<span style="color:#79b8ff">$1</span>'));
    return s;
  }
  if (L === 'python' || L === 'py') {
    s = protect(s, t => t.replace(/(#.*$)/gm, '<span style="color:#6a737d">$1</span>'));
    s = protect(s, t => t.replace(/(""".*?"""|'''.*?''')/gs, '<span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>'));
    s = protect(s, t => t.replace(/\b(def|class|import|from|return|if|elif|else|for|while|try|except|with|as|in|not|and|or|True|False|None|lambda|yield|async|await|pass|raise|del|global|nonlocal)\b/g, '<span style="color:#c678dd">$1</span>'));
    s = protect(s, t => t.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#d19a66">$1</span>'));
    return s;
  }
  if (L === 'css') {
    s = protect(s, t => t.replace(/(\/\*.*?\*\/)/gs, '<span style="color:#6a737d">$1</span>'));
    s = protect(s, t => t.replace(/([.#]?[\w-]+)\s*\{/g, '<span style="color:#79b8ff">$1</span>{'));
    s = protect(s, t => t.replace(/([\w-]+)\s*:/g, '<span style="color:#b392f0">$1</span>:'));
    s = protect(s, t => t.replace(/:\s*([^;{]+)/g, ': <span style="color:#98c379">$1</span>'));
    return s;
  }
  // JS/JSX/TS/TSX and default
  s = protect(s, t => t.replace(/(\/\/.*$|\/\*.*?\*\/)/gms, '<span style="color:#6a737d">$1</span>'));
  s = protect(s, t => t.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color:#98c379">$1</span>'));
  s = protect(s, t => t.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span style="color:#98c379">$1</span>'));
  s = protect(s, t => t.replace(/\b(const|let|var|function|return|if|else|for|while|import|export|default|async|await|try|catch|finally|class|new|this|from|of|in|typeof|instanceof|null|undefined|true|false|throw|switch|case|break|continue|extends|super|static|get|set|type|interface|enum|as|keyof|readonly)\b/g, '<span style="color:#c678dd">$1</span>'));
  s = protect(s, t => t.replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span style="color:#79b8ff">$1</span>'));
  s = protect(s, t => t.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#d19a66">$1</span>'));
  return s;
}

// ── PATH RESOLVER ─────────────────────────────────────────────────────────────
export function resolvePath(base, p) {
  if (!p) return base;
  if (!base) return p;
  const b = base.replace(/\/$/, '');
  const q = p.replace(/^\//, '');
  if (q === b || q.startsWith(b + '/')) return q;
  const baseName = b.split('/').pop();
  if (baseName && (q === baseName || q.startsWith(baseName + '/'))) {
    return b + '/' + q.slice(baseName.length).replace(/^\//, '');
  }
  const stripped = q.startsWith(b) ? q.slice(b.length).replace(/^\//, '') : q;
  return b + '/' + stripped;
}

// ── ACTION PARSER ─────────────────────────────────────────────────────────────
export function parseActions(text) {
  const regex = /```action\n(.*?)```/gs;
  const actions = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    try { actions.push(JSON.parse(m[1].trim())); } catch (_e) { }
  }
  return actions;
}

// ── DIFF ENGINE — segmentedDiff dengan Triple Guard ───────────────────────────
const MYERS_THRESHOLD  = 2000;
const MIN_ANCHOR_RATIO = 0.3;
const MAX_CHUNK_SIZE   = 500;
const MAX_DIFF_RATIO   = 1.5;

function findStrictAnchors(aLines, bLines) {
  const aFreq = new Map(), bFreq = new Map();
  for (const l of aLines) aFreq.set(l, (aFreq.get(l) || 0) + 1);
  for (const l of bLines) bFreq.set(l, (bFreq.get(l) || 0) + 1);

  const bMap = new Map();
  bLines.forEach((l, i) => { if (bFreq.get(l) === 1) bMap.set(l, i); });

  const anchors = [];
  let lastB = -1;
  for (let ai = 0; ai < aLines.length; ai++) {
    const line = aLines[ai];
    if (aFreq.get(line) === 1 && bMap.has(line)) {
      const bi = bMap.get(line);
      if (bi > lastB) { anchors.push({ a: ai, b: bi }); lastB = bi; }
    }
  }
  return anchors;
}

function segmentedDiff(aLines, bLines) {
  const maxLines = Math.max(aLines.length, bLines.length);
  const anchors  = findStrictAnchors(aLines, bLines);

  if (anchors.length < maxLines * MIN_ANCHOR_RATIO) {
    return diffLines(aLines.join('\n'), bLines.join('\n'));
  }

  const result = [];
  let prevA = 0, prevB = 0;

  for (const { a, b } of anchors) {
    if ((a - prevA) > MAX_CHUNK_SIZE || (b - prevB) > MAX_CHUNK_SIZE) {
      return diffLines(aLines.join('\n'), bLines.join('\n'));
    }
    const aChunk = aLines.slice(prevA, a), bChunk = bLines.slice(prevB, b);
    if (aChunk.length || bChunk.length) {
      result.push(...diffLines(aChunk.join('\n'), bChunk.join('\n')));
    }
    result.push({ value: aLines[a] + '\n', added: false, removed: false });
    prevA = a + 1; prevB = b + 1;
  }

  const aTail = aLines.slice(prevA), bTail = bLines.slice(prevB);
  if (aTail.length || bTail.length) result.push(...diffLines(aTail.join('\n'), bTail.join('\n')));

  if (result.length > maxLines * MAX_DIFF_RATIO) {
    return diffLines(aLines.join('\n'), bLines.join('\n'));
  }

  return result;
}

function formatDiffLine(hunk, line, oldLine, newLine) {
  if (hunk.removed) return { text: `- L${oldLine}: ${line}`, oldInc: 1, newInc: 0 };
  if (hunk.added)   return { text: `+ L${newLine}: ${line}`, oldInc: 0, newInc: 1 };
  return null;
}

function advanceContext(hunk, hunkLines) {
  const len = hunkLines.length;
  return {
    oldInc: hunk.removed ? 0 : len,
    newInc: hunk.added   ? 0 : len,
  };
}

export function generateDiff(original, patched, maxLines = 40) {
  if (!original || !patched || original === patched) return '';

  const aLines = original.split('\n');
  const bLines = patched.split('\n');

  const hunks = (aLines.length > MYERS_THRESHOLD || bLines.length > MYERS_THRESHOLD)
    ? segmentedDiff(aLines, bLines)
    : diffLines(original, patched);

  const result = [];
  let shown = 0, oldLine = 1, newLine = 1;

  for (const hunk of hunks) {
    const hunkLines = hunk.value.split('\n').filter((l, i, a) => !(i === a.length - 1 && l === ''));

    if (!hunk.added && !hunk.removed) {
      const adv = advanceContext(hunk, hunkLines);
      oldLine += adv.oldInc;
      newLine += adv.newInc;
      continue;
    }

    for (const line of hunkLines) {
      if (shown >= maxLines) { result.push('... (baris lebih)'); return result.join('\n'); }
      const fmt = formatDiffLine(hunk, line, oldLine, newLine);
      if (fmt) { result.push(fmt.text); oldLine += fmt.oldInc; newLine += fmt.newInc; shown++; }
    }
  }
  return result.join('\n');
}

// ── ACTION EXECUTOR ───────────────────────────────────────────────────────────
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

// ── SHARED SYNTAX CHECK ───────────────────────────────────────────────────────
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

// ── SHARED FILE BACKUP ────────────────────────────────────────────────────────
export async function backupFiles(targets, folder) {
  const backups = [];
  for (const a of targets) {
    const backup = await callServer({ type: 'read', path: resolvePath(folder, a.path) });
    if (backup.ok) {
      backups.push({ path: resolvePath(folder, a.path), content: backup.data });
      a.original = backup.data;
    }
  }
  return backups;
}

// ===== RETRY & BACKOFF HELPERS (from original api.js) =====
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getBackoffDelay = (attempt, withJitter = true) => {
  const delay = CONFIG.RETRY.BASE_DELAY_MS * Math.pow(2, attempt);
  const cappedDelay = Math.min(delay, CONFIG.RETRY.MAX_DELAY_MS);
  if (!withJitter) return cappedDelay;
  const jitter = Math.random() * CONFIG.RETRY.JITTER_MAX_MS;
  return cappedDelay + jitter;
};

export const isRetryableError = (error) => {
  if (error?.code && CONFIG.RETRY.RETRYABLE_CODES.includes(error.code)) {
    return true;
  }
  if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
    return true;
  }
  return false;
};

export const isRetryableStatus = (statusCode) => {
  return CONFIG.RETRY.RETRYABLE_STATUSES.includes(statusCode);
};

// ===== VISION SUPPORT (from original api.js) =====
export function injectVisionImage(messages, imageBase64, imageMimeType = 'image/jpeg') {
  if (!imageBase64) return messages;

  return messages.map((msg, idx) => {
    if (idx !== messages.length - 1 || msg.role !== 'user') {
      return msg;
    }

    const text = typeof msg.content === 'string'
      ? msg.content
      : Array.isArray(msg.content)
        ? msg.content.filter(c => c.type === 'text').map(c => c.text).join(' ')
        : '';

    return {
      ...msg,
      content: [
        { type: 'text', text },
        { type: 'image_url', image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
      ],
    };
  });
}
