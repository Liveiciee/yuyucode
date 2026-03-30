// handlers/index.cjs
const { resolvePath, execSafe, HOME } = require('../helpers.cjs');
const { getCached, setCache, invalidateCache } = require('../cache.cjs');
const { humanFormat } = require('../formatters.cjs');
const { applyPatch } = require('../patch.cjs');
const { buildTree, walkSync, extractSigs } = require('../tree.cjs');
const { handleMCP, MCP_TOOLS, EXTERNAL_MCP } = require('../mcp/index.cjs');
const { handleFilesystem } = require('./filesystem.cjs');
const fs = require('fs');
const path = require('path');

// Set of filesystem-related actions that should be handled by handleFilesystem
const FS_TYPES = new Set([
  'read', 'read_many', 'write', 'append', 'patch', 'delete', 'move', 'mkdir',
  'list', 'tree', 'info', 'search'
]);

function handle(payload) {
  const { type, path: filePath, content, command, from, to, url, query, dbPath, token, tool, action, params, paths, depth, human } = payload;

  if (type && FS_TYPES.has(type)) {
    // Delegate to filesystem handler
    return handleFilesystem(payload);
  }

  const ALLOWED_TYPES = new Set([
    'ping', 'batch', 'mcp', 'mcp_list', 'index',
    'web_search', 'exec', 'browse', 'fetch_json', 'sqlite',
  ]);

  if (type && !ALLOWED_TYPES.has(type)) return { ok: false, data: 'Unknown type: ' + type };

  if (type === 'ping') return { ok: true, data: 'YuyuServer ' + require('../config.cjs').VERSION + ' aktif!', mcp: Object.keys(MCP_TOOLS), version: require('../config.cjs').VERSION };

  if (type === 'batch') {
    const actions = Array.isArray(payload.actions) ? payload.actions : [];
    if (actions.length === 0) return { ok: false, data: 'batch requires actions array' };
    const results = actions.map(a => { try { return handle(a); } catch (e) { return { ok: false, data: e.message }; } });
    return { ok: results.every(r => r.ok), results };
  }

  if (type === 'mcp') return handleMCP(tool, action, params || payload);
  if (type === 'mcp_list') return { ok: true, data: { ...MCP_TOOLS, ...Object.fromEntries(EXTERNAL_MCP.map(s => [s.name, { desc: s.description || s.url, actions: s.actions || [] }])) } };

  if (type === 'index') {
    const srcPath = filePath ? resolvePath(filePath) : path.join(HOME, 'yuyucode', 'src');
    if (!fs.existsSync(srcPath)) return { ok: false, data: 'Path tidak ada: ' + srcPath };
    const files = walkSync(srcPath);
    const result = [];
    let totalSymbols = 0;
    for (const f of files) {
      try {
        const src = fs.readFileSync(f, 'utf8');
        const rel = f.replace(HOME + '/', '');
        const sigs = extractSigs(src, f);
        const lines = src.split('\n').length;
        if (sigs.length === 0 && lines < 15) continue;
        totalSymbols += sigs.length;
        result.push({ file: rel, lines, symbols: sigs });
      } catch (_) {}
    }
    const md = result.map(r => '`' + r.file + '` (' + r.lines + 'L)' + (r.symbols.length ? '\n' + r.symbols.map(s => '  ' + s.icon + ' `' + s.name + s.sig + '`').join('\n') : '')).join('\n\n');
    return { ok: true, data: md, meta: { files: files.length, symbols: totalSymbols } };
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
      const lines = (d.results || []).slice(0, 5).map((item, i) => (i+1) + '. **' + item.title + '**\n' + (item.content || '').slice(0, 300) + '\n🔗 ' + item.url);
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
    return execSafe(`curl -sL --max-time 15 -A "Mozilla/5.0" "${target}" | sed 's/<[^>]*>//g' | sed '/^[[:space:]]*$/d' | head -200`, HOME, 20000);
  }

  if (type === 'fetch_json') {
    const target = url || filePath;
    const headers = token ? `-H "Authorization: Bearer ${require('../helpers.cjs').shellEsc(token)}"` : '';
    return execSafe(`curl -sL --max-time 15 ${headers} "${target}"`, HOME, 20000);
  }

  if (type === 'sqlite') {
    const db = resolvePath(dbPath || filePath);
    return execSafe(`sqlite3 "${require('../helpers.cjs').shellEsc(db)}" "${require('../helpers.cjs').shellEsc(query || '')}"`, HOME);
  }

  return { ok: false, data: 'Unknown type: ' + type };
}

module.exports = { handle };
