// @vitest-environment node
// yuyu-server.test.cjs — Test suite untuk yuyu-server.js v2
//
// Architecture note: yuyu-server.js uses require() (CJS) but package.json has
// "type":"module", so Vitest (ESM-first) cannot require() it directly.
// Solution: handleForTest() mirrors production handle() logic inside this .cjs
// file. Keep in sync when adding new handler types to production.
// CodeQL false positive: from/to/paths/depth at L138 ARE used in handlers below.

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

// ── HTTP helper ───────────────────────────────────────────────────────────────
function request(port, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req  = http.request({
      hostname: '127.0.0.1', port, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(body);
    req.end();
  });
}

function get(port, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, method: 'GET', path: urlPath || '/' }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// ── Test server ───────────────────────────────────────────────────────────────
let server, PORT;

beforeAll(async () => {
  await new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

      if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', uptime: 0, version: 'test', port: PORT }));
        return;
      }
      if (req.method === 'GET' && req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', uptime: 0, version: 'test', port: PORT, memory_mb: 0, tools: [] }));
        return;
      }
      if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, version: 'test' }));
        return;
      }

      let body = '';
      req.on('data', d => body += d);
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const result  = handleForTest(payload);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, data: e.message }));
        }
      });
    });
    server.listen(0, '127.0.0.1', () => { PORT = server.address().port; resolve(); });
    server.on('error', reject);
  });
}, 10000);

afterAll(() => { if (server) server.close(); });

// ── handleForTest — mirrors yuyu-server.js handle() ──────────────────────────
const HOME_TEST = os.tmpdir();
const READ_CACHE = new Map();

function execSafeTest(command, cwd, timeoutMs = 5000) {
  const { execSync } = require('child_process');
  try {
    const out = execSync(command + ' 2>&1', {
      cwd: cwd || HOME_TEST, encoding: 'utf8',
      timeout: timeoutMs, maxBuffer: 1024 * 1024,
    });
    return { ok: true, data: out || '(done)' };
  } catch (e) {
    return { ok: false, data: (e.stdout || e.stderr || e.message || '').slice(0, 500) };
  }
}

function applyPatchTest(filePath, oldStr, newStr) {
  if (!filePath || !oldStr) return { ok: false, data: 'path dan old_str diperlukan' };
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); }
  catch (_e) { return { ok: false, data: 'File tidak ditemukan: ' + filePath }; }
  const replacement = newStr !== undefined ? newStr : '';
  if (content.includes(oldStr)) {
    fs.writeFileSync(filePath, content.replace(oldStr, replacement));
    return { ok: true, data: '✅ Patch OK' };
  }
  return { ok: false, data: '⚠ old_str tidak ditemukan' };
}

function shellEscTest(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\0/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$\(/g, '\\$(');
}

function isValidGitHubIdentifierTest(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_.-]+$/.test(value);
}

function buildTreeTest(dirPath, depth, maxDepth, prefix) {
  if (depth > maxDepth) return '';
  let entries;
  try { entries = fs.readdirSync(dirPath, { withFileTypes: true }); }
  catch { return ''; }
  const skip = new Set(['.git', 'node_modules']);
  entries = entries.filter(e => !skip.has(e.name)).sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  let out = '';
  entries.forEach((e, i) => {
    const last = i === entries.length - 1;
    const branch = last ? '└── ' : '├── ';
    const child = last ? '    ' : '│   ';
    out += prefix + branch + e.name + (e.isDirectory() ? '/' : '') + '\n';
    if (e.isDirectory()) {
      out += buildTreeTest(path.join(dirPath, e.name), depth + 1, maxDepth, prefix + child);
    }
  });
  return out;
}

// Note: from/to/paths/depth destructured here ARE used in the handlers below.
function handleForTest(payload) {
  const { type, path: filePath, content, command, from, to, paths, depth } = payload;

  if (type === 'ping') return { ok: true, data: 'YuyuServer test aktif!', version: 'test' };

  if (type === 'batch') {
    const actions = Array.isArray(payload.actions) ? payload.actions : [];
    if (actions.length === 0) return { ok: false, data: 'batch requires actions array' };
    const results = actions.map(a => {
      try { return handleForTest(a); }
      catch (e) { return { ok: false, data: e.message }; }
    });
    return { ok: results.every(r => r.ok), results };
  }

  if (type === 'read') {
    let data;
    try { data = fs.readFileSync(filePath, 'utf8'); }
    catch (_e) { return { ok: false, data: 'File tidak ada: ' + filePath }; }
    const totalLines = data.split('\n').length;
    const totalChars = data.length;
    if (from || to) {
      const lines = data.split('\n');
      data = lines.slice((from || 1) - 1, to || lines.length).join('\n');
    }
    return { ok: true, data, meta: { totalLines, totalChars } };
  }

  if (type === 'read_many') {
    const pathList = Array.isArray(paths) ? paths : [];
    const results = {};
    for (const p of pathList) {
      try { results[p] = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; }
      catch (_e) { results[p] = null; }
    }
    return { ok: true, data: results };
  }

  if (type === 'write') {
    if (!filePath) return { ok: false, data: 'path diperlukan' };
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content || '', 'utf8');
    READ_CACHE.delete(filePath);
    return { ok: true, data: '✅ Tersimpan' };
  }

  if (type === 'append') {
    if (!filePath) return { ok: false, data: 'path diperlukan' };
    fs.appendFileSync(filePath, content || '', 'utf8');
    READ_CACHE.delete(filePath);
    return { ok: true, data: '✅ Ditambahkan' };
  }

  if (type === 'patch') {
    const result = applyPatchTest(filePath, payload.old_str, payload.new_str);
    if (result.ok) READ_CACHE.delete(filePath);
    return result;
  }

  if (type === 'delete') {
    try { fs.unlinkSync(filePath); READ_CACHE.delete(filePath); }
    catch (_e) { return { ok: false, data: 'File tidak ada' }; }
    return { ok: true, data: '🗑 Dihapus' };
  }

  if (type === 'mkdir') {
    fs.mkdirSync(filePath, { recursive: true });
    return { ok: true, data: '✅ Dibuat' };
  }

  if (type === 'list') {
    let files;
    try { files = fs.readdirSync(filePath, { withFileTypes: true }); }
    catch (_e) { return { ok: false, data: 'Path tidak ada' }; }
    return { ok: true, data: files.map(f => ({ name: f.name, isDir: f.isDirectory(), size: 0 })) };
  }

  if (type === 'info') {
    if (!fs.existsSync(filePath)) return { ok: false, data: 'File tidak ada' };
    const stat  = fs.statSync(filePath);
    const lines = stat.isFile() ? fs.readFileSync(filePath, 'utf8').split('\n').length : 0;
    return { ok: true, data: { size: stat.size, lines, isFile: stat.isFile() } };
  }

  if (type === 'move') {
    const fromPath = payload.from || filePath;
    const toPath   = payload.to;
    if (!fromPath || !toPath) return { ok: false, data: 'from dan to diperlukan' };
    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    try { fs.renameSync(fromPath, toPath); READ_CACHE.delete(fromPath); READ_CACHE.delete(toPath); }
    catch (_e) { return { ok: false, data: 'Source tidak ada' }; }
    return { ok: true, data: '✅ Dipindah' };
  }

  if (type === 'tree') {
    const maxDepth = parseInt(depth) || 3;
    if (!fs.existsSync(filePath)) return { ok: false, data: 'Path tidak ada' };
    const tree = path.basename(filePath) + '/\n' + buildTreeTest(filePath, 1, maxDepth, '');
    return { ok: true, data: tree || '(kosong)' };
  }

  if (type === 'exec') {
    return execSafeTest(command, filePath || HOME_TEST);
  }

  return { ok: false, data: 'Unknown type: ' + type };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════════


describe('append', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-app-')); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it('appends content to existing file', async () => {
    const filePath = path.join(tmpDir, 'log.txt');
    fs.writeFileSync(filePath, 'line1\n');
    await request(PORT, { type: 'append', path: filePath, content: 'line2\n' });
    expect(fs.readFileSync(filePath, 'utf8')).toBe('line1\nline2\n');
  });
}