// yuyu-server.js — v6
// Run dari ~: node ~/yuyu-server.js &
// Flags: --verbose (log every request)
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const { execSync, spawn } = require('child_process');

const VERBOSE    = process.argv.includes('--verbose');
const START_TIME = Date.now();

// ── Simple read cache — TTL 10s ──────────────────────────────────────────────
// Prevents duplicate reads of same file in same agent loop iteration.
const _readCache = new Map(); // path → { data, meta, ts }
const READ_CACHE_TTL = 10_000; // 10 seconds
const MAX_CACHE_SIZE = 50;
const MAX_CACHE_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getCached(filePath) {
  const e = _readCache.get(filePath);
  if (!e) return null;
  if (Date.now() - e.ts > READ_CACHE_TTL) { _readCache.delete(filePath); return null; }
  return e;
}

function setCache(filePath, data, meta) {
  // Skip caching files > 5MB
  if (data.length > MAX_CACHE_FILE_SIZE) return;
  _readCache.set(filePath, { data, meta, ts: Date.now() });
  // Limit cache size
  if (_readCache.size > MAX_CACHE_SIZE) _readCache.delete(_readCache.keys().next().value);
}

function invalidateCache(filePath) {
  _readCache.delete(resolvePath(filePath));
}

// ── Simple in-memory rate limiter ─────────────────────────────────────────────
// Prevents runaway agent loops from hammering the server.
// Default: 120 requests/minute per IP (generous for normal use).
const RATE_LIMIT    = 120;   // max requests per window
const RATE_WINDOW   = 60_000; // 1 minute
const _rateCounts   = new Map(); // ip → { count, windowStart }

function checkRateLimit(ip) {
  const now  = Date.now();
  const data = _rateCounts.get(ip) || { count: 0, windowStart: now };
  if (now - data.windowStart > RATE_WINDOW) {
    data.count = 0; data.windowStart = now;
  }
  data.count++;
  _rateCounts.set(ip, data);
  return data.count <= RATE_LIMIT;
}

// Cleanup old rate limit entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of _rateCounts) {
    if (now - data.windowStart > RATE_WINDOW * 2) {
      _rateCounts.delete(ip);
    }
  }
}, 3600000);

const HOME    = process.env.HOME;
const PORT    = 8765;
const WS_PORT = 8766;
const VERSION = 'v6';

// ── MCP TOOL REGISTRY ─────────────────────────────────────────────────────────
const MCP_TOOLS = {
  filesystem: { desc:'Baca/tulis/list/patch file',        actions:['read','write','patch','list','delete','search','info','append','move','mkdir','tree','read_many'] },
  git:        { desc:'Operasi git',                        actions:['status','log','diff','blame','branch','stash'] },
  fetch:      { desc:'Fetch URL dan scrape konten web',    actions:['browse','fetch_json','screenshot'] },
  sqlite:     { desc:'Query database SQLite',              actions:['query','tables','schema'] },
  github:     { desc:'GitHub API — issues, PRs, repos',    actions:['issues','pulls','create_issue','repo_info'] },
  system:     { desc:'Info sistem dan proses',             actions:['disk','memory','processes','env'] },
};

// ── External MCP Servers — loaded from ~/.yuyu/mcp-servers.json ──────────────
// Format: [{ name, url, description, actions: [] }]
// Agent can call: { type: 'mcp', tool: '<name>', action: '<action>', params: {} }
let EXTERNAL_MCP = [];
const EXTERNAL_MCP_PATH = path.join(HOME, '.yuyu', 'mcp-servers.json');

function loadExternalMCP() {
  try {
    if (fs.existsSync(EXTERNAL_MCP_PATH)) {
      EXTERNAL_MCP = JSON.parse(fs.readFileSync(EXTERNAL_MCP_PATH, 'utf8'));
      if (VERBOSE) console.log('[MCP] Loaded', EXTERNAL_MCP.length, 'external servers');
    }
  } catch(e) {
    console.error('[MCP] Failed to load external servers:', e.message);
    EXTERNAL_MCP = [];
  }
}

async function callExternalMCP(server, action, params) {
  const { url } = server;
  try {
    const body = JSON.stringify({ action, params: params || {} });
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) return { ok: false, data: 'HTTP ' + resp.status };
    const data = await resp.json();
    return { ok: true, data: typeof data === 'string' ? data : JSON.stringify(data, null, 2).slice(0, 4000) };
  } catch(e) {
    return { ok: false, data: e.message };
  }
}

loadExternalMCP();
// Watch for changes to mcp-servers.json
try {
  fs.watch(path.dirname(EXTERNAL_MCP_PATH), (event, filename) => {
    if (filename === 'mcp-servers.json') loadExternalMCP();
  });
} catch(_e) {}

// ── HELPERS ────────────────────────────────────────────────────────────────────
function resolvePath(filePath) {
  if (!filePath) return HOME;
  if (filePath.startsWith('/')) return filePath;
  return path.join(HOME, filePath);
}

// Shell-safe escaping untuk string yang diinterpolasi ke command.
// Escape: null bytes, backslash, double quote, backtick, $() substitution.
function shellEsc(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\0/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$\(/g, '\\$(');
}

// Whitelist type yang diizinkan — cegah remote property injection
const ALLOWED_TYPES = new Set([
  'ping', 'batch', 'mcp', 'mcp_list', 'index',
  'read', 'read_many', 'write', 'append', 'patch', 'delete', 'move', 'mkdir',
  'list', 'tree', 'info', 'search', 'web_search', 'exec', 'browse', 'fetch_json', 'sqlite',
]);

function execSafe(command, cwd, timeoutMs = 60000) {
  try {
    const mergedCmd = command.includes('2>') ? command : `${command} 2>&1`;
    const out = execSync(mergedCmd, {
      cwd: cwd || HOME, encoding: 'utf8',
      timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024,
    });
    return { ok: true, data: out || '(selesai)' };
  } catch(e) {
    const errMsg = `${e.stdout || ''}${e.stderr || ''}` || e.message;
    // Better ARM64 error detection
    if (errMsg.includes('Illegal instruction')) {
      return { ok: false, data: '⚠️ Illegal instruction — possible ARM64 incompatibility. Check if command uses x86-specific instructions.' };
    }
    if (errMsg.includes('cannot allocate memory')) {
      return { ok: false, data: '⚠️ Out of memory — try reducing workload or closing other apps.' };
    }
    return { ok: false, data: errMsg.slice(0, 3000) };
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────
// find-and-replace dengan fallback whitespace normalization
function applyPatch(filePath, oldStr, newStr) {
  if (!filePath || !oldStr) return { ok: false, data: 'path dan old_str diperlukan' };
  const full = resolvePath(filePath);
  let content;
  try { content = fs.readFileSync(full, 'utf8'); }
  catch (_e) { return { ok: false, data: `File tidak ditemukan: ${filePath}` }; }
  const replacement = newStr !== undefined ? newStr : '';

  // Exact match
  if (content.includes(oldStr)) {
    fs.writeFileSync(full, content.replace(oldStr, replacement), 'utf8');
    invalidateCache(full);
    return { ok: true, data: `✅ Patch OK: ${filePath}` };
  }

  // Whitespace-normalized fallback
  const normalize = s => s.replace(/\r\n/g, '\n').replace(/\t/g, '  ');
  const normContent = normalize(content);
  const normOld     = normalize(oldStr);
  if (normContent.includes(normOld)) {
    fs.writeFileSync(full, normContent.replace(normOld, replacement), 'utf8');
    invalidateCache(full);
    return { ok: true, data: `✅ Patch (whitespace-norm) OK: ${filePath}` };
  }

  // Trim-lines fallback (untuk trailing space)
  const trimLines  = s => s.split('\n').map(l => l.trimEnd()).join('\n');
  const trimContent = trimLines(normContent);
  const trimOld     = trimLines(normOld);
  if (trimContent.includes(trimOld)) {
    fs.writeFileSync(full, trimContent.replace(trimOld, replacement), 'utf8');
    invalidateCache(full);
    return { ok: true, data: `✅ Patch (trimmed) OK: ${filePath}` };
  }

  // Not found: return context around closest match for debugging
  const oldLines = normOld.split('\n');
  const firstLine = oldLines[0].trim();
  const fileLines = normContent.split('\n');
  const nearIdx   = fileLines.findIndex(l => l.trim().includes(firstLine.slice(0, 30)));
  const ctx = nearIdx !== -1
    ? `\n\nContext sekitar baris ${nearIdx + 1}:\n${fileLines.slice(Math.max(0, nearIdx - 2), nearIdx + 5).join('\n')}`
    : '';
  return {
    ok: false,
    data: `⚠ old_str tidak ditemukan di ${filePath}. Pastikan exact match (case-sensitive, spasi, baris baru).${ctx}`,
  };
}

// ── DIRECTORY TREE ────────────────────────────────────────────────────────────
function buildTree(dirPath, depth, maxDepth, prefix) {
  if (depth > maxDepth) return '';
  let entries;
  try { entries = fs.readdirSync(dirPath, { withFileTypes: true }); }
  catch { return ''; }

  const skip = new Set(['.git','node_modules','dist','build','.gradle','.idea','__pycache__','.DS_Store']);
  entries = entries.filter(e => !skip.has(e.name)).sort((a,b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  let out = '';
  entries.forEach((e, i) => {
    const last   = i === entries.length - 1;
    const branch = last ? '└── ' : '├── ';
    const child  = last ? '    ' : '│   ';
    out += prefix + branch + e.name + (e.isDirectory() ? '/' : '') + '\n';
    if (e.isDirectory()) {
      out += buildTree(path.join(dirPath, e.name), depth + 1, maxDepth, prefix + child);
    }
  });
  return out;
}

const CODE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const IGNORE    = new Set(['node_modules', '.git', 'android', 'dist', '__snapshots__']);

function walkSync(dir) {
  const out = [];
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (IGNORE.has(e.name) || e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) out.push(...walkSync(full));
      else if (CODE_EXTS.has(path.extname(e.name))) out.push(full);
    }
  } catch (_) {}
  return out;
}

function extractSigs(src, _filePath) {
  const sigs = [];
  // export function / async function
  const re1 = /^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]{0,120})\)/gm;
  // export const = arrow
  const re2 = /^export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]{0,80})\)\s*=>/gm;
  // function Component / function useHook
  const re3 = /^(?:export\s+)?(?:default\s+)?function\s+([A-Za-z]\w+)\s*\(([^)]{0,80})\)/gm;
  for (const re of [re1, re2, re3]) {
    let m;
    while ((m = re.exec(src)) !== null) {
      if (!sigs.find(s => s.name === m[1])) {
        const icon = /^use[A-Z]/.test(m[1]) ? '🪝' : /^[A-Z]/.test(m[1]) ? '⚛' : 'ƒ';
        sigs.push({ name: m[1], sig: '(' + m[2].trim() + ')', icon });
      }
    }
  }
  return sigs;
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
function handle(payload) {
  const {
    type, path: filePath, content, command, from, to, url,
    query, dbPath, token, tool, action, params,
    paths, depth,
  } = payload;
  const full = resolvePath(filePath);

  // Validate type against whitelist — prevent remote property injection
  if (type && !ALLOWED_TYPES.has(type)) {
    return { ok: false, data: 'Unknown type: ' + type };
  }

  if (type === 'ping') {
    return { ok: true, data: 'YuyuServer ' + VERSION + ' aktif!', mcp: Object.keys(MCP_TOOLS), version: VERSION };
  }

  // ── BATCH — run multiple actions in one request ────────────────────────────
  if (type === 'batch') {
    const actions = Array.isArray(payload.actions) ? payload.actions : [];
    if (actions.length === 0) return { ok: false, data: 'batch requires actions array' };
    const results = actions.map(a => {
      try { return handle(a); }
      catch (e) { return { ok: false, data: e.message }; }
    });
    const allOk = results.every(r => r.ok);
    return { ok: allOk, results };
  }

  if (type === 'mcp')      return handleMCP(tool, action, params || payload);
  if (type === 'mcp_list') return { ok: true, data: { ...MCP_TOOLS, ...Object.fromEntries(EXTERNAL_MCP.map(s => [s.name, { desc: s.description || s.url, actions: s.actions || [] }])) } };

  // ── CODEBASE INDEX — real-time symbol extraction ──────────────────────────
  if (type === 'index') {
    const srcPath = filePath ? resolvePath(filePath) : path.join(HOME, 'yuyucode', 'src');
    if (!fs.existsSync(srcPath)) return { ok: false, data: 'Path tidak ada: ' + srcPath };

    const files = walkSync(srcPath);
    const result = [];
    let totalSymbols = 0;

    for (const f of files) {
      try {
        const src  = fs.readFileSync(f, 'utf8');
        const rel  = f.replace(HOME + '/', '');
        const sigs = extractSigs(src, f);
        const lines = src.split('\n').length;
        if (sigs.length === 0 && lines < 15) continue;
        totalSymbols += sigs.length;
        result.push({
          file: rel,
          lines,
          symbols: sigs,
        });
      } catch (_) {}
    }

    // Format as compact markdown
    const md = result.map(r =>
      '`' + r.file + '` (' + r.lines + 'L)' +
      (r.symbols.length ? '\n' + r.symbols.map(s => '  ' + s.icon + ' `' + s.name + s.sig + '`').join('\n') : '')
    ).join('\n\n');

    return { ok: true, data: md, meta: { files: files.length, symbols: totalSymbols } };
  }

  // ── FILE OPS ──
  if (type === 'read') {
    if (!fs.existsSync(full)) return { ok: false, data: 'File tidak ada: ' + filePath };
    // Use cache for full reads (no from/to) — saves disk I/O in agent loops
    if (!from && !to) {
      const cached = getCached(full);
      if (cached) return { ok: true, data: cached.data, meta: cached.meta, cached: true };
    }
    let data = fs.readFileSync(full, 'utf8');
    const totalLines = data.split('\n').length;
    const totalChars = data.length;
    if (!from && !to) setCache(full, data, { totalLines, totalChars });
    if (from || to) {
      const lines = data.split('\n');
      const f = (from || 1) - 1;
      const t = to || lines.length;
      data = lines.slice(f, t).join('\n');
    }
    return { ok: true, data, meta: { totalLines, totalChars } };
  }

  // ── BATCH READ ──
  if (type === 'read_many') {
    const pathList = Array.isArray(paths) ? paths : [];
    const results = {};
    for (const p of pathList) {
      const abs = resolvePath(p);
      try {
        if (fs.existsSync(abs)) {
          results[p] = fs.readFileSync(abs, 'utf8');
        } else {
          results[p] = null;
        }
      } catch(_e) { results[p] = null; }
    }
    return { ok: true, data: results };
  }

  if (type === 'write') {
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
    invalidateCache(full);
    return { ok: true, data: '✅ Tersimpan: ' + filePath };
  }

  if (type === 'append') {
    fs.appendFileSync(full, content, 'utf8');
    invalidateCache(full);
    return { ok: true, data: '✅ Ditambahkan ke: ' + filePath };
  }

  if (type === 'patch') {
    const result = applyPatch(filePath, payload.old_str, payload.new_str);
    if (result.ok) invalidateCache(full);
    return result;
  }

  if (type === 'delete') {
    try { fs.unlinkSync(full); }
    catch (_e) { return { ok: false, data: 'File tidak ada: ' + filePath }; }
    invalidateCache(full);
    return { ok: true, data: '🗑 Dihapus: ' + filePath };
  }

  if (type === 'move') {
    const fromFull = resolvePath(payload.from || filePath);
    const toFull   = resolvePath(payload.to || content);
    fs.mkdirSync(path.dirname(toFull), { recursive: true });
    try { fs.renameSync(fromFull, toFull); }
    catch (_e) { return { ok: false, data: 'Source tidak ada: ' + (payload.from || filePath) }; }
    invalidateCache(fromFull);
    invalidateCache(toFull);
    return { ok: true, data: '✅ Dipindah: ' + (payload.from || filePath) + ' → ' + (payload.to || content) };
  }

  if (type === 'mkdir') {
    fs.mkdirSync(full, { recursive: true });
    return { ok: true, data: '✅ Dibuat: ' + filePath };
  }

  if (type === 'list') {
    let files;
    try { files = fs.readdirSync(full, { withFileTypes: true }); }
    catch (_e) { return { ok: false, data: 'Path tidak ada: ' + filePath }; }
    const data  = files.map(f => ({
      name: f.name, isDir: f.isDirectory(),
      size: f.isFile() ? fs.statSync(path.join(full, f.name)).size : 0,
    }));
    return { ok: true, data };
  }

  if (type === 'tree') {
    const maxDepth = parseInt(depth) || 3;
    if (!fs.existsSync(full)) return { ok: false, data: 'Path tidak ada: ' + filePath };
    const tree = (filePath || '.') + '/\n' + buildTree(full, 1, maxDepth, '');
    return { ok: true, data: tree || '(kosong)' };
  }

  if (type === 'info') {
    if (!fs.existsSync(full)) return { ok: false, data: 'File tidak ada: ' + filePath };
    const stat  = fs.statSync(full);
    const lines = stat.isFile() ? fs.readFileSync(full, 'utf8').split('\n').length : 0;
    return { ok: true, data: { size: stat.size, lines, isFile: stat.isFile(), modified: stat.mtime } };
  }

  // ── SEARCH (ripgrep → grep fallback) ──
  if (type === 'search') {
    const searchPath = full || HOME;
    const q = shellEsc((content || '').slice(0, 500));
    // try rg first (faster, respects .gitignore)
    const rgCheck = execSafe('which rg 2>/dev/null', HOME, 2000);
    if (rgCheck.ok && rgCheck.data.trim()) {
      const ext = (payload.ext || 'jsx,js,ts,tsx,json,md,py,sh').split(',').map(e => '-g "**/*.'+e+'"').join(' ');
      const r = execSafe(`rg -n --color=never ${ext} "${q}" "${searchPath}" 2>/dev/null | head -100`, HOME, 15000);
      return { ok: true, data: r.data.trim() || 'Tidak ditemukan' };
    }
    // grep fallback
    const exts = '--include="*.jsx" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" --include="*.py" --include="*.sh"';
    const r = execSafe(`grep -rn "${q}" "${searchPath}" ${exts} 2>/dev/null | head -100 || echo ""`, HOME, 15000);
    return { ok: true, data: r.data.trim() || 'Tidak ditemukan' };
  }

  if (type === 'web_search') {
    const q = (query || '').trim();
    if (!q) return { ok: false, data: 'Query diperlukan' };
    const tavilyKey = process.env.TAVILY_API_KEY || '';
    if (!tavilyKey) return { ok: false, data: 'Set: export TAVILY_API_KEY=tvly-xxx' };
    const tmpFile = HOME + '/.tavily_body.json';
    fs.writeFileSync(tmpFile, JSON.stringify({ api_key: tavilyKey, query: q, search_depth: 'basic', max_results: 5 }));
    const r = execSafe('curl -sL --max-time 15 -X POST "https://api.tavily.com/search" -H "Content-Type: application/json" -d @' + tmpFile, HOME, 18000);
    if (!r.ok || !r.data) return { ok: false, data: 'Tavily request gagal' };
    try {
      const d = JSON.parse(r.data);
      if (d.error) return { ok: false, data: 'Tavily: ' + d.error };
      const lines = (d.results || []).slice(0, 5).map((item, i) =>
        (i+1) + '. **' + item.title + '**\n' + (item.content || '').slice(0, 300) + '\n🔗 ' + item.url
      );
      return { ok: true, data: lines.join('\n\n') || 'Tidak ada hasil' };
    } catch(e) { return { ok: false, data: 'Parse error: ' + e.message }; }
  }

  if (type === 'exec') {
    const cwd = filePath ? resolvePath(filePath) : HOME;
    return execSafe(command, cwd);
  }

  if (type === 'browse') {
    const target = url || filePath;
    if (!target) return { ok: false, data: 'URL diperlukan' };
    const r = execSafe(
      `curl -sL --max-time 15 -A "Mozilla/5.0" "${target}" | sed 's/<[^>]*>//g' | sed '/^[[:space:]]*$/d' | head -200`,
      HOME, 20000
    );
    return r;
  }

  if (type === 'fetch_json') {
    const target = url || filePath;
    const headers = token ? `-H "Authorization: Bearer ${shellEsc(token)}"` : '';
    return execSafe(`curl -sL --max-time 15 ${headers} "${target}"`, HOME, 20000);
  }

  if (type === 'sqlite') {
    const db = resolvePath(dbPath || filePath);
    return execSafe(`sqlite3 "${shellEsc(db)}" "${shellEsc(query || '')}"`, HOME);
  }

  return { ok: false, data: 'Unknown type: ' + type };
}

// ── MCP HANDLER ───────────────────────────────────────────────────────────────
function handleMCP(tool, action, params) {
  const { path: p, query, token, owner, repo, title, body, dbPath, url } = params;

  if (tool === 'git') {
    const cwd  = p ? resolvePath(p) : HOME;
    const cmds = {
      status: 'git status --short',
      log:    'git log --oneline -20',
      diff:   'git diff HEAD',
      blame:  `git blame "${p || '.'}" 2>/dev/null | head -50`,
      branch: 'git branch -a',
      stash:  'git stash list',
    };
    if (!cmds[action]) return { ok: false, data: 'Unknown git action: ' + action };
    return execSafe(cmds[action], cwd);
  }

  if (tool === 'fetch') {
    const target = url || p;
    if (action === 'browse' || action === 'fetch') {
      return execSafe(`curl -sL --max-time 15 -A "Mozilla/5.0" "${target}" | sed 's/<[^>]*>//g' | sed '/^[[:space:]]*$/d' | head -300`, HOME, 25000);
    }
    if (action === 'fetch_json') {
      const headers = token ? `-H "Authorization: Bearer ${shellEsc(token)}"` : '';
      return execSafe(`curl -sL --max-time 15 ${headers} "${target}"`, HOME, 20000);
    }
  }

  if (tool === 'sqlite') {
    const db = resolvePath(dbPath || p);
    if (action === 'tables') return execSafe(`sqlite3 "${db}" ".tables"`, HOME);
    if (action === 'schema') return execSafe(`sqlite3 "${db}" ".schema"`, HOME);
    if (action === 'query')  return execSafe(`sqlite3 "${db}" "${(query||'').replace(/"/g, '\\"')}"`, HOME);
    return { ok: false, data: 'Unknown sqlite action: ' + action };
  }

  if (tool === 'github') {
    const ghToken = token || process.env.GITHUB_TOKEN || '';
    if (!ghToken) return { ok: false, data: 'GitHub token diperlukan. Set GITHUB_TOKEN env.' };
    const base = `curl -sL -H "Authorization: Bearer ${ghToken}" -H "Accept: application/vnd.github+json"`;
    if (action === 'repo_info')    return execSafe(`${base} "https://api.github.com/repos/${owner}/${repo}"`, HOME, 15000);
    if (action === 'issues')       return execSafe(`${base} "https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=20"`, HOME, 15000);
    if (action === 'pulls')        return execSafe(`${base} "https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=20"`, HOME, 15000);
    if (action === 'create_issue') {
      const bd = JSON.stringify({ title, body: body || '' });
      return execSafe(`${base} -X POST -d '${bd}' "https://api.github.com/repos/${owner}/${repo}/issues"`, HOME, 15000);
    }
    return { ok: false, data: 'Unknown github action: ' + action };
  }

  if (tool === 'system') {
    if (action === 'disk')      return execSafe('df -h', HOME);
    if (action === 'memory')    return execSafe('free -h 2>/dev/null || cat /proc/meminfo | head -5', HOME);
    if (action === 'processes') return execSafe('ps aux | head -20', HOME);
    if (action === 'env')       return { ok: true, data: JSON.stringify(process.env, null, 2).slice(0, 2000) };
    return { ok: false, data: 'Unknown system action: ' + action };
  }

  if (tool === 'filesystem') {
    return handle({ type: action, path: p, content: params.content, from: params.from, to: params.to, old_str: params.old_str, new_str: params.new_str });
  }

  // ── External MCP servers ──────────────────────────────────────────────────
  const extServer = EXTERNAL_MCP.find(s => s.name === tool);
  if (extServer) return callExternalMCP(extServer, action, params);

  return { ok: false, data: 'Unknown MCP tool: ' + tool + '. Available: ' + [...Object.keys(MCP_TOOLS), ...EXTERNAL_MCP.map(s => s.name)].join(', ') };
}

// ── HTTP SERVER ───────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (VERBOSE) {
    const safeMethod = ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'].includes(req.method) ? req.method : 'UNKNOWN';
    const safeUrl = req.url ? req.url.replace(/[\r\n]/g, '') : '/';
    console.log(`[${new Date().toISOString()}] ${safeMethod} ${safeUrl}`);
  }

  // Rate limit — only applies to POST (action requests)
  if (req.method === 'POST') {
    const ip = req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, data: 'Rate limit exceeded. Max ' + RATE_LIMIT + ' req/min.' }));
      if (VERBOSE) console.log(`  ⚠ Rate limit hit: ${ip}`);
      return;
    }
  }

  if (req.method === 'GET' && req.url === '/health') {
    const uptime = Math.round((Date.now() - START_TIME) / 1000);
    const memUsed = Math.round(process.memoryUsage().rss / 1024 / 1024);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', uptime, version: VERSION, port: PORT,
      memory_mb: memUsed, cache_size: _readCache.size 
    }));
    return;
  }

  if (req.method === 'GET' && req.url === '/status') {
    const uptime  = Math.round((Date.now() - START_TIME) / 1000);
    const memUsed = Math.round(process.memoryUsage().rss / 1024 / 1024);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok', uptime, version: VERSION, port: PORT,
      memory_mb: memUsed, tools: Object.keys(MCP_TOOLS),
      external_mcp: EXTERNAL_MCP.length,
      cache_entries: _readCache.size,
    }));
    return;
  }

  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      ok: true, version: VERSION, 
      mcp: Object.keys(MCP_TOOLS),
      external_mcp: EXTERNAL_MCP.length,
      endpoints: ['/health', '/status', 'POST /']
    }));
    return;
  }

  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      const result  = handle(payload);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch(e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, data: e.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🌸 YuyuServer ${VERSION} — HTTP :${PORT}`);
  console.log(`   HOME: ${HOME}`);
  console.log(`   Tools: ${Object.keys(MCP_TOOLS).join(', ')}`);
  console.log(`   Memory limit: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
});

// ── WEBSOCKET SERVER (port 8766) ──────────────────────────────────────────────
let WebSocketServer;
try {
  WebSocketServer = require('ws').WebSocketServer;
} catch {
  console.log('⚠ ws tidak tersedia — jalankan: npm install -g ws');
  console.log('  WebSocket (file watcher + streaming exec) tidak aktif.');
}

if (WebSocketServer) {
  const wss = new WebSocketServer({ port: WS_PORT });
  const execProcs = new Map();
  const collabRooms = new Map();

  wss.on('connection', ws => {
    let clientWatcher = null;

    ws.on('message', raw => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      if (msg.type === 'watch') {
        const watchPath = resolvePath(msg.path);
        if (!fs.existsSync(watchPath)) {
          ws.send(JSON.stringify({ event: 'error', data: `Path tidak ada: ${msg.path}` }));
          return;
        }
        if (clientWatcher) { try { clientWatcher.close(); } catch {} }
        try {
          clientWatcher = fs.watch(watchPath, { recursive: true }, (event, filename) => {
            if (!filename || filename.startsWith('.git/')) return;
            try { ws.send(JSON.stringify({ event, filename })); } catch {}
          });
          ws.send(JSON.stringify({ event: 'watching', path: watchPath }));
        } catch(e) {
          ws.send(JSON.stringify({ event: 'error', data: e.message }));
        }
        return;
      }

      if (msg.type === 'exec_stream') {
        const { id, command, cwd } = msg;
        if (!command || !id) return;
        const workDir = cwd ? resolvePath(cwd) : HOME;
        const proc = spawn('bash', ['-c', command], {
          cwd: workDir, env: { ...process.env },
        });
        execProcs.set(id, proc);

        proc.stdout.on('data', d => {
          try { ws.send(JSON.stringify({ type: 'stdout', id, data: d.toString() })); } catch {}
        });
        proc.stderr.on('data', d => {
          try { ws.send(JSON.stringify({ type: 'stderr', id, data: d.toString() })); } catch {}
        });
        proc.on('close', code => {
          execProcs.delete(id);
          try { ws.send(JSON.stringify({ type: 'exit', id, code })); } catch {}
        });
        proc.on('error', e => {
          execProcs.delete(id);
          try { ws.send(JSON.stringify({ type: 'error', id, data: e.message })); } catch {}
        });
        return;
      }

      if (msg.type === 'kill') {
        const proc = execProcs.get(msg.id);
        if (proc) { proc.kill('SIGTERM'); execProcs.delete(msg.id); }
        return;
      }

      if (msg.type === 'collab_join') {
        const room = msg.room || 'default';
        if (!collabRooms.has(room)) collabRooms.set(room, { version: 0, updates: [], clients: new Set() });
        const r = collabRooms.get(room);
        r.clients.add(ws);
        ws._collabRoom = room;
        try { ws.send(JSON.stringify({ type: 'collab_init', version: r.version })); } catch {}
        return;
      }

      if (msg.type === 'collab_push') {
        const room = ws._collabRoom;
        if (!room || !collabRooms.has(room)) return;
        const r = collabRooms.get(room);
        if (msg.version !== r.version) {
          try { ws.send(JSON.stringify({ type: 'collab_updates', updates: r.updates.slice(msg.version), version: r.version })); } catch {}
          return;
        }
        const newUpdates = msg.updates || [];
        r.updates.push(...newUpdates);
        r.version += newUpdates.length;
        r.clients.forEach(client => {
          if (client === ws || client.readyState !== 1) return;
          try { client.send(JSON.stringify({ type: 'collab_updates', updates: newUpdates, version: r.version })); } catch {}
        });
      }
    });

    ws.on('close', () => {
      if (clientWatcher) { try { clientWatcher.close(); } catch {} }
      if (ws._collabRoom && collabRooms.has(ws._collabRoom)) {
        collabRooms.get(ws._collabRoom).clients.delete(ws);
      }
      for (const [id, proc] of execProcs) {
        try { proc.kill('SIGTERM'); } catch {}
        execProcs.delete(id);
      }
    });
  });

  console.log(`🔌 YuyuServer WebSocket — WS :${WS_PORT} (file watch + streaming exec)`);
}

// ── ERROR GUARDS ──────────────────────────────────────────────────────────────
process.on('uncaughtException', e => console.error('❌ Uncaught:', e.message));
process.on('unhandledRejection', e => console.error('❌ Rejection:', e));

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('📴 Shutting down...');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000);
});
