const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, exec, spawn } = require('child_process');

const HOME = process.env.HOME;
const PORT = 8765;
const VERSION = 'v3-mcp';

// ── MCP TOOL REGISTRY ─────────────────────────────────────────────────────────
const MCP_TOOLS = {
  filesystem: {
    desc: 'Baca/tulis/list file di sistem',
    actions: ['read','write','list','delete','search','info','append']
  },
  git: {
    desc: 'Operasi git',
    actions: ['status','log','diff','blame','branch','stash']
  },
  fetch: {
    desc: 'Fetch URL dan scrape konten web',
    actions: ['browse','fetch_json','screenshot']
  },
  sqlite: {
    desc: 'Query database SQLite',
    actions: ['query','tables','schema']
  },
  github: {
    desc: 'GitHub API — issues, PRs, repos',
    actions: ['issues','pulls','create_issue','repo_info']
  },
  system: {
    desc: 'Info sistem dan proses',
    actions: ['disk','memory','processes','env']
  }
};

// ── HELPERS ────────────────────────────────────────────────────────────────────
function resolvePath(filePath) {
  if (!filePath) return HOME;
  if (filePath.startsWith('/')) return filePath;
  return path.join(HOME, filePath);
}

function execSafe(command, cwd, timeoutMs = 60000) {
  try {
    const mergedCmd = command.includes("2>") ? command : command + " 2>&1";
    const out = execSync(mergedCmd, {
      cwd: cwd || HOME,
      encoding: 'utf8',
      timeout: timeoutMs,
      maxBuffer: 10 * 1024 * 1024
    });
    return { ok: true, data: out || '(selesai)' };
  } catch(e) {
    const errMsg = (e.stdout || '') + (e.stderr || '') || e.message;
    return { ok: false, data: errMsg.slice(0, 2000) };
  }
}

// ── HANDLER MAP ───────────────────────────────────────────────────────────────
function handle(payload) {
  const { type, path: filePath, content, command, from, to, url,
          query, dbPath, token, owner, repo, tool, action, params } = payload;
  const full = resolvePath(filePath);

  // ── PING ──
  if (type === 'ping') {
    return { ok: true, data: 'YuyuServer ' + VERSION + ' aktif!',
             mcp: Object.keys(MCP_TOOLS), version: VERSION };
  }

  // ── MCP DISPATCH ──
  if (type === 'mcp') {
    return handleMCP(tool, action, params || payload);
  }

  // ── MCP TOOLS LIST ──
  if (type === 'mcp_list') {
    return { ok: true, data: MCP_TOOLS };
  }

  // ── FILE OPS ──
  if (type === 'read') {
    let data = fs.readFileSync(full, 'utf8');
    const totalLines = data.split('\n').length;
    const totalChars = data.length;
    if (from || to) {
      const lines = data.split('\n');
      const f = (from || 1) - 1;
      const t = to || lines.length;
      data = lines.slice(f, t).join('\n');
    }
    return { ok: true, data, meta: { totalLines, totalChars } };
  }

  if (type === 'write') {
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
    return { ok: true, data: '✅ Tersimpan: ' + filePath };
  }

  if (type === 'append') {
    fs.appendFileSync(full, content, 'utf8');
    return { ok: true, data: '✅ Ditambahkan ke: ' + filePath };
  }

  if (type === 'delete') {
    fs.unlinkSync(full);
    return { ok: true, data: '🗑 Dihapus: ' + filePath };
  }

  if (type === 'list') {
    const files = fs.readdirSync(full, { withFileTypes: true });
    const data = files.map(f => ({
      name: f.name,
      isDir: f.isDirectory(),
      size: f.isFile() ? fs.statSync(path.join(full, f.name)).size : 0
    }));
    return { ok: true, data };
  }

  if (type === 'search') {
    const searchPath = full || HOME;
    const r = execSafe(
      `grep -rn "${(content||'').replace(/"/g,'\\"')}" "${searchPath}" --include="*.jsx" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" 2>/dev/null || echo ""`,
      HOME
    );
    return { ok: true, data: r.data.trim() || 'Tidak ditemukan' };
  }

  if (type === 'web_search') {
    const q = (payload.query || '').trim();
    if (!q) return { ok: false, data: 'Query diperlukan' };
    const tavilyKey = process.env.TAVILY_API_KEY || '';
    if (!tavilyKey) return { ok: false, data: 'Set dulu: export TAVILY_API_KEY=tvly-xxx' };
    const tmpFile = HOME + '/.tavily_body.json';
    fs.writeFileSync(tmpFile, JSON.stringify({ api_key: tavilyKey, query: q, search_depth: 'basic', max_results: 5 }));
    const r = execSafe(
      'curl -sL --max-time 15 -X POST "https://api.tavily.com/search" -H "Content-Type: application/json" -d @' + tmpFile,
      HOME, 18000
    );
    if (!r.ok || !r.data) return { ok: false, data: 'Tavily request gagal' };
    try {
      const d = JSON.parse(r.data);
      if (d.error) return { ok: false, data: 'Tavily error: ' + d.error };
      const lines = (d.results || []).slice(0, 5).map(function(item, i) {
        return (i+1) + '. **' + item.title + '**\n' + item.content.slice(0, 300) + '\n🔗 ' + item.url;
      });
      return { ok: true, data: lines.join('\n\n') || 'Tidak ada hasil' };
    } catch(e) {
      return { ok: false, data: 'Parse error: ' + e.message };
    }
  }

    if (type === 'exec') {
    const cwd = filePath ? resolvePath(filePath) : HOME;
    return execSafe(command, cwd);
  }

  if (type === 'info') {
    const stat = fs.statSync(full);
    const lines = stat.isFile() ? fs.readFileSync(full, 'utf8').split('\n').length : 0;
    return { ok: true, data: { size: stat.size, lines, isFile: stat.isFile(), modified: stat.mtime } };
  }

  // ── BROWSE (curl-based) ──
  if (type === 'browse') {
    const target = url || filePath;
    if (!target) return { ok: false, data: 'URL diperlukan' };
    const r = execSafe(
      `curl -sL --max-time 15 -A "Mozilla/5.0" "${target}" | sed 's/<[^>]*>//g' | sed '/^[[:space:]]*$/d' | head -200`,
      HOME, 20000
    );
    return r;
  }

  // ── FETCH JSON ──
  if (type === 'fetch_json') {
    const target = url || filePath;
    const headers = token ? `-H "Authorization: Bearer ${token}"` : '';
    const r = execSafe(`curl -sL --max-time 15 ${headers} "${target}"`, HOME, 20000);
    return r;
  }

  // ── SQLITE ──
  if (type === 'sqlite') {
    const db = resolvePath(dbPath || filePath);
    const r = execSafe(`sqlite3 "${db}" "${(query||'').replace(/"/g,'\\"')}"`, HOME);
    return r;
  }

  return { ok: false, data: 'Unknown type: ' + type };
}

// ── MCP HANDLER ───────────────────────────────────────────────────────────────
function handleMCP(tool, action, params) {
  const { path: p, query, token, owner, repo, title, body, dbPath, url } = params;

  // ── MCP: GIT ──
  if (tool === 'git') {
    const cwd = p ? resolvePath(p) : HOME;
    const cmds = {
      status: 'git status --short',
      log: 'git log --oneline -20',
      diff: 'git diff HEAD',
      blame: `git blame "${p||'.'}" 2>/dev/null | head -50`,
      branch: 'git branch -a',
      stash: 'git stash list',
    };
    if (!cmds[action]) return { ok: false, data: 'Unknown git action: ' + action };
    return execSafe(cmds[action], cwd);
  }

  // ── MCP: FETCH ──
  if (tool === 'fetch') {
    if (action === 'browse' || action === 'fetch') {
      const target = url || p;
      const r = execSafe(`curl -sL --max-time 15 -A "Mozilla/5.0" "${target}" | sed 's/<[^>]*>//g' | sed '/^[[:space:]]*$/d' | head -300`, HOME, 25000);
      return r;
    }
    if (action === 'fetch_json') {
      const headers = token ? `-H "Authorization: Bearer ${token}"` : '';
      return execSafe(`curl -sL --max-time 15 ${headers} "${url||p}"`, HOME, 20000);
    }
  }

  // ── MCP: SQLITE ──
  if (tool === 'sqlite') {
    const db = resolvePath(dbPath || p);
    if (action === 'tables') return execSafe(`sqlite3 "${db}" ".tables"`, HOME);
    if (action === 'schema') return execSafe(`sqlite3 "${db}" ".schema"`, HOME);
    if (action === 'query') return execSafe(`sqlite3 "${db}" "${(query||'').replace(/"/g,'\\"')}"`, HOME);
    return { ok: false, data: 'Unknown sqlite action: ' + action };
  }

  // ── MCP: GITHUB ──
  if (tool === 'github') {
    if (!token) return { ok: false, data: 'GitHub token diperlukan. Set GITHUB_TOKEN di env.' };
    const ghToken = token || process.env.GITHUB_TOKEN || '';
    const base = `curl -sL -H "Authorization: Bearer ${ghToken}" -H "Accept: application/vnd.github+json"`;
    if (action === 'repo_info')
      return execSafe(`${base} "https://api.github.com/repos/${owner}/${repo}"`, HOME, 15000);
    if (action === 'issues')
      return execSafe(`${base} "https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=20"`, HOME, 15000);
    if (action === 'pulls')
      return execSafe(`${base} "https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=20"`, HOME, 15000);
    if (action === 'create_issue') {
      const bodyData = JSON.stringify({ title, body: body||'' });
      return execSafe(`${base} -X POST -d '${bodyData}' "https://api.github.com/repos/${owner}/${repo}/issues"`, HOME, 15000);
    }
    return { ok: false, data: 'Unknown github action: ' + action };
  }

  // ── MCP: SYSTEM ──
  if (tool === 'system') {
    if (action === 'disk') return execSafe('df -h', HOME);
    if (action === 'memory') return execSafe('free -h 2>/dev/null || cat /proc/meminfo | head -5', HOME);
    if (action === 'processes') return execSafe('ps aux | head -20', HOME);
    if (action === 'env') return { ok: true, data: JSON.stringify(process.env, null, 2).slice(0, 2000) };
    return { ok: false, data: 'Unknown system action: ' + action };
  }

  // ── MCP: FILESYSTEM ──
  if (tool === 'filesystem') {
    return handle({ type: action, path: p, content: params.content, from: params.from, to: params.to });
  }

  return { ok: false, data: `Unknown MCP tool: ${tool}` };
}

// ── SERVER ────────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // Health check via GET
  if (req.method === 'GET') {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ ok: true, version: VERSION, mcp: Object.keys(MCP_TOOLS) }));
    return;
  }

  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      const result = handle(payload);
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify(result));
    } catch(e) {
      res.writeHead(200, {'Content-Type':'application/json'});
      res.end(JSON.stringify({ ok: false, data: e.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🌸 YuyuServer ${VERSION} jalan di localhost:${PORT}`);
  console.log(`   HOME: ${HOME}`);
  console.log(`   MCP tools: ${Object.keys(MCP_TOOLS).join(', ')}`);
});

// Auto-restart watchdog
process.on('uncaughtException', e => {
  console.error('❌ Uncaught:', e.message);
});
process.on('unhandledRejection', e => {
  console.error('❌ Unhandled rejection:', e);
});
