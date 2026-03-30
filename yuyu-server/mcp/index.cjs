// mcp/index.cjs
const fs = require('fs');
const path = require('path');
const { execSafe, resolvePath, shellEsc, isValidGitHubIdentifier, HOME } = require('../helpers.cjs');
const { handlePolyglotAction } = require('../../polyglot-runner.cjs');
const { handleFilesystem } = require('../handlers/filesystem.cjs');
const { callExternalMCP } = require('./external.cjs');

const EXTERNAL_MCP_PATH = path.join(HOME, '.yuyu', 'mcp-servers.json');
let EXTERNAL_MCP = [];

function loadExternalMCP() {
  try {
    if (fs.existsSync(EXTERNAL_MCP_PATH)) {
      EXTERNAL_MCP = JSON.parse(fs.readFileSync(EXTERNAL_MCP_PATH, 'utf8'));
      if (process.env.VERBOSE) console.log('[MCP] Loaded', EXTERNAL_MCP.length, 'external servers');
    }
  } catch(e) {
    console.error('[MCP] Failed to load external servers:', e.message);
    EXTERNAL_MCP = [];
  }
}

loadExternalMCP();
try {
  fs.watch(path.dirname(EXTERNAL_MCP_PATH), (event, filename) => {
    if (filename === 'mcp-servers.json') loadExternalMCP();
  });
} catch(_e) {}

const MCP_TOOLS = {
  filesystem: { desc:'Baca/tulis/list/patch file',        actions:['read','write','patch','list','delete','search','info','append','move','mkdir','tree','read_many'] },
  git:        { desc:'Operasi git',                        actions:['status','log','diff','blame','branch','stash'] },
  fetch:      { desc:'Fetch URL dan scrape konten web',    actions:['browse','fetch_json','screenshot'] },
  sqlite:     { desc:'Query database SQLite',              actions:['query','tables','schema'] },
  github:     { desc:'GitHub API — issues, PRs, repos',    actions:['issues','pulls','create_issue','repo_info'] },
  system:     { desc:'Info sistem dan proses',             actions:['disk','memory','processes','env'] },
  polyglot:   { desc:'Jalankan task multi-bahasa (rust/cpp/go/python/js)', actions:['list','health','run'] },
};

function handleMCP(tool, action, params) {
  const { path: p, query, token, owner, repo, title, body, dbPath, url } = params;

  if (tool === 'git') {
    const cwd  = p ? resolvePath(p) : HOME;
    const cmds = { 
      status: 'git status --short', 
      log: 'git log --oneline -20', 
      diff: 'git diff HEAD', 
      blame: `git blame "${p || '.'}" 2>/dev/null | head -50`, 
      branch: 'git branch -a', 
      stash: 'git stash list' 
    };
    if (!cmds[action]) return { ok: false, data: 'Unknown git action: ' + action };
    return execSafe(cmds[action], cwd);
  }
  if (tool === 'fetch') {
    const target = url || p;
    if (action === 'browse' || action === 'fetch') return execSafe(`curl -sL --max-time 15 -A "Mozilla/5.0" "${target}" | sed 's/<[^>]*>//g' | sed '/^[[:space:]]*$/d' | head -300`, HOME, 25000);
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
    if (!isValidGitHubIdentifier(owner) || !isValidGitHubIdentifier(repo)) {
      return { ok: false, data: 'Owner/repo tidak valid' };
    }
    const ownerSafe = shellEsc(owner);
    const repoSafe = shellEsc(repo);
    const base = `curl -sL -H "Authorization: Bearer ${shellEsc(ghToken)}" -H "Accept: application/vnd.github+json"`;
    if (action === 'repo_info')    return execSafe(`${base} "https://api.github.com/repos/${ownerSafe}/${repoSafe}"`, HOME, 15000);
    if (action === 'issues')       return execSafe(`${base} "https://api.github.com/repos/${ownerSafe}/${repoSafe}/issues?state=open&per_page=20"`, HOME, 15000);
    if (action === 'pulls')        return execSafe(`${base} "https://api.github.com/repos/${ownerSafe}/${repoSafe}/pulls?state=open&per_page=20"`, HOME, 15000);
    if (action === 'create_issue') {
      const bd = JSON.stringify({ title, body: body || '' });
      return execSafe(`${base} -X POST -d '${bd}' "https://api.github.com/repos/${ownerSafe}/${repoSafe}/issues"`, HOME, 15000);
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
  if (tool === 'polyglot') {
    return handlePolyglotAction(action, params);
  }
  if (tool === 'filesystem') {
    return handleFilesystem({ type: action, path: p, content: params.content, from: params.from, to: params.to, old_str: params.old_str, new_str: params.new_str, human: params.human });
  }
  const extServer = EXTERNAL_MCP.find(s => s.name === tool);
  if (extServer) return callExternalMCP(extServer, action, params);
  return { ok: false, data: 'Unknown MCP tool: ' + tool + '. Available: ' + [...Object.keys(MCP_TOOLS), ...EXTERNAL_MCP.map(s => s.name)].join(', ') };
}

module.exports = { MCP_TOOLS, EXTERNAL_MCP, handleMCP, loadExternalMCP };
