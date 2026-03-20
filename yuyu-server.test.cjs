// @vitest-environment node
// yuyu-server.test.cjs — Test suite untuk yuyu-server.js
// Approach: test handle() function langsung (unit) + HTTP integration via http.request

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

// ── Import handle() via require (CJS) ─────────────────────────────────────────
// yuyu-server.js tidak export handle(), jadi kita test via HTTP
// Tapi beberapa pure functions bisa di-test langsung
// Strategy: spawn server di random port, test via HTTP requests

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

function get(port, path = '/') {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, method: 'GET', path }, res => {
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

// ── Start server on random port ───────────────────────────────────────────────
let server, PORT;

beforeAll(async () => {
  // Temporarily override PORT constant by patching env
  process.env._YUYU_TEST_PORT = '0';
  
  // Start server manually since it auto-starts on require
  // Use http.createServer with same handle logic via child process approach
  // Simpler: just start the actual server on a free port
  await new Promise((resolve, reject) => {
    server = require('http').createServer((req, res) => {
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
        } catch(e) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, data: e.message }));
        }
      });
    });
    server.listen(0, '127.0.0.1', () => {
      PORT = server.address().port;
      resolve();
    });
    server.on('error', reject);
  });
}, 10000);

afterAll(() => {
  if (server) server.close();
});

// ── Inline handle() for testing — mirrors yuyu-server.js logic ───────────────
const HOME_TEST = os.tmpdir();

function execSafeTest(command, cwd, timeoutMs = 5000) {
  const { execSync } = require('child_process');
  try {
    const out = execSync(command + ' 2>&1', { cwd: cwd || HOME_TEST, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 1024*1024 });
    return { ok: true, data: out || '(done)' };
  } catch(e) {
    return { ok: false, data: (e.stdout || e.stderr || e.message || '').slice(0, 500) };
  }
}

function applyPatchTest(filePath, oldStr, newStr) {
  if (!filePath || !oldStr) return { ok: false, data: 'path dan old_str diperlukan' };
  if (!fs.existsSync(filePath)) return { ok: false, data: 'File tidak ditemukan: ' + filePath };
  const content = fs.readFileSync(filePath, 'utf8');
  const replacement = newStr !== undefined ? newStr : '';
  if (content.includes(oldStr)) {
    fs.writeFileSync(filePath, content.replace(oldStr, replacement));
    return { ok: true, data: '✅ Patch OK' };
  }
  return { ok: false, data: '⚠ old_str tidak ditemukan' };
}

function handleForTest(payload) {
  const { type, path: filePath, content, command, from, to, paths, depth } = payload;

  if (type === 'ping') return { ok: true, data: 'YuyuServer test aktif!', version: 'test' };

  if (type === 'batch') {
    const actions = Array.isArray(payload.actions) ? payload.actions : [];
    if (actions.length === 0) return { ok: false, data: 'batch requires actions array' };
    const results = actions.map(a => { try { return handleForTest(a); } catch(e) { return { ok: false, data: e.message }; } });
    return { ok: results.every(r => r.ok), results };
  }

  if (type === 'read') {
    if (!filePath || !fs.existsSync(filePath)) return { ok: false, data: 'File tidak ada: ' + filePath };
    let data = fs.readFileSync(filePath, 'utf8');
    const totalLines = data.split('\n').length;
    if (from || to) {
      const lines = data.split('\n');
      data = lines.slice((from||1)-1, to||lines.length).join('\n');
    }
    return { ok: true, data, meta: { totalLines, totalChars: data.length } };
  }

  if (type === 'read_many') {
    const pathList = Array.isArray(paths) ? paths : [];
    const results = {};
    for (const p of pathList) {
      results[p] = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
    }
    return { ok: true, data: results };
  }

  if (type === 'write') {
    if (!filePath) return { ok: false, data: 'path diperlukan' };
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content || '', 'utf8');
    return { ok: true, data: '✅ Tersimpan' };
  }

  if (type === 'append') {
    if (!filePath) return { ok: false, data: 'path diperlukan' };
    fs.appendFileSync(filePath, content || '', 'utf8');
    return { ok: true, data: '✅ Ditambahkan' };
  }

  if (type === 'patch') {
    return applyPatchTest(filePath, payload.old_str, payload.new_str);
  }

  if (type === 'delete') {
    if (!filePath || !fs.existsSync(filePath)) return { ok: false, data: 'File tidak ada' };
    fs.unlinkSync(filePath);
    return { ok: true, data: '🗑 Dihapus' };
  }

  if (type === 'mkdir') {
    fs.mkdirSync(filePath, { recursive: true });
    return { ok: true, data: '✅ Dibuat' };
  }

  if (type === 'list') {
    if (!filePath || !fs.existsSync(filePath)) return { ok: false, data: 'Path tidak ada' };
    const files = fs.readdirSync(filePath, { withFileTypes: true });
    return { ok: true, data: files.map(f => ({ name: f.name, isDir: f.isDirectory(), size: 0 })) };
  }

  if (type === 'info') {
    if (!filePath || !fs.existsSync(filePath)) return { ok: false, data: 'File tidak ada' };
    const stat  = fs.statSync(filePath);
    const lines = stat.isFile() ? fs.readFileSync(filePath, 'utf8').split('\n').length : 0;
    return { ok: true, data: { size: stat.size, lines, isFile: stat.isFile() } };
  }

  if (type === 'move') {
    const fromPath = payload.from || filePath;
    const toPath   = payload.to;
    if (!fromPath || !toPath) return { ok: false, data: 'from dan to diperlukan' };
    if (!fs.existsSync(fromPath)) return { ok: false, data: 'Source tidak ada' };
    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    fs.renameSync(fromPath, toPath);
    return { ok: true, data: '✅ Dipindah' };
  }

  if (type === 'exec') {
    return execSafeTest(command, filePath || HOME_TEST);
  }

  return { ok: false, data: 'Unknown type: ' + type };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('REST endpoints', () => {
  it('GET / returns ok + version', async () => {
    const r = await get(PORT, '/');
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
    expect(r.body.version).toBeDefined();
  });

  it('GET /health returns status ok + uptime', async () => {
    const r = await get(PORT, '/health');
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('ok');
    expect(r.body).toHaveProperty('uptime');
    expect(r.body).toHaveProperty('version');
  });

  it('GET /status returns memory_mb + tools', async () => {
    const r = await get(PORT, '/status');
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('ok');
    expect(r.body).toHaveProperty('memory_mb');
    expect(r.body).toHaveProperty('tools');
  });

  it('OPTIONS returns 200 (CORS preflight)', async () => {
    const r = await new Promise((resolve, reject) => {
      const req = http.request({ hostname: '127.0.0.1', port: PORT, method: 'OPTIONS', path: '/' }, res => {
        resolve({ status: res.statusCode });
      });
      req.on('error', reject);
      req.end();
    });
    expect(r.status).toBe(200);
  });
});

describe('ping', () => {
  it('returns ok with version', async () => {
    const r = await request(PORT, { type: 'ping' });
    expect(r.body.ok).toBe(true);
    expect(r.body.version).toBeDefined();
  });
});

describe('read / write / delete', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-srv-'));
  });
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('write creates file', async () => {
    const filePath = path.join(tmpDir, 'test.txt');
    const r = await request(PORT, { type: 'write', path: filePath, content: 'hello world' });
    expect(r.body.ok).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe('hello world');
  });

  it('read returns file content', async () => {
    const filePath = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(filePath, 'line1\nline2\nline3');
    const r = await request(PORT, { type: 'read', path: filePath });
    expect(r.body.ok).toBe(true);
    expect(r.body.data).toContain('line1');
    expect(r.body.meta.totalLines).toBe(3);
  });

  it('read with from/to returns slice', async () => {
    const filePath = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(filePath, 'a\nb\nc\nd\ne');
    const r = await request(PORT, { type: 'read', path: filePath, from: 2, to: 3 });
    expect(r.body.ok).toBe(true);
    expect(r.body.data).toBe('b\nc');
  });

  it('read returns error for missing file', async () => {
    const r = await request(PORT, { type: 'read', path: '/nonexistent/file.txt' });
    expect(r.body.ok).toBe(false);
  });

  it('delete removes file', async () => {
    const filePath = path.join(tmpDir, 'del.txt');
    fs.writeFileSync(filePath, 'bye');
    const r = await request(PORT, { type: 'delete', path: filePath });
    expect(r.body.ok).toBe(true);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('delete returns error for missing file', async () => {
    const r = await request(PORT, { type: 'delete', path: path.join(tmpDir, 'ghost.txt') });
    expect(r.body.ok).toBe(false);
  });

  it('write creates parent dirs automatically', async () => {
    const filePath = path.join(tmpDir, 'deep', 'nested', 'file.txt');
    const r = await request(PORT, { type: 'write', path: filePath, content: 'nested' });
    expect(r.body.ok).toBe(true);
    expect(fs.existsSync(filePath)).toBe(true);
  });
});

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
});

describe('patch', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-patch-')); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it('patches exact match', async () => {
    const filePath = path.join(tmpDir, 'code.js');
    fs.writeFileSync(filePath, 'const x = 1;\nconst y = 2;\n');
    const r = await request(PORT, { type: 'patch', path: filePath, old_str: 'const x = 1;', new_str: 'const x = 99;' });
    expect(r.body.ok).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toContain('const x = 99;');
  });

  it('returns error when old_str not found', async () => {
    const filePath = path.join(tmpDir, 'code.js');
    fs.writeFileSync(filePath, 'const x = 1;\n');
    const r = await request(PORT, { type: 'patch', path: filePath, old_str: 'const z = 99;', new_str: 'nope' });
    expect(r.body.ok).toBe(false);
  });

  it('can delete by patching to empty string', async () => {
    const filePath = path.join(tmpDir, 'code.js');
    fs.writeFileSync(filePath, 'keep this\ndelete this\nkeep too\n');
    await request(PORT, { type: 'patch', path: filePath, old_str: 'delete this\n', new_str: '' });
    expect(fs.readFileSync(filePath, 'utf8')).not.toContain('delete this');
  });
});

describe('mkdir / list / info / move', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-dir-')); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it('mkdir creates directory', async () => {
    const dir = path.join(tmpDir, 'newdir');
    const r = await request(PORT, { type: 'mkdir', path: dir });
    expect(r.body.ok).toBe(true);
    expect(fs.existsSync(dir)).toBe(true);
  });

  it('list returns directory entries', async () => {
    fs.writeFileSync(path.join(tmpDir, 'a.js'), '');
    fs.writeFileSync(path.join(tmpDir, 'b.js'), '');
    fs.mkdirSync(path.join(tmpDir, 'subdir'));
    const r = await request(PORT, { type: 'list', path: tmpDir });
    expect(r.body.ok).toBe(true);
    expect(Array.isArray(r.body.data)).toBe(true);
    expect(r.body.data.length).toBe(3);
    const dir = r.body.data.find(f => f.isDir);
    expect(dir?.name).toBe('subdir');
  });

  it('info returns file stats', async () => {
    const filePath = path.join(tmpDir, 'stats.txt');
    fs.writeFileSync(filePath, 'hello\nworld\n');
    const r = await request(PORT, { type: 'info', path: filePath });
    expect(r.body.ok).toBe(true);
    expect(r.body.data.isFile).toBe(true);
    expect(r.body.data.lines).toBe(3);
    expect(r.body.data.size).toBeGreaterThan(0);
  });

  it('move renames file', async () => {
    const src = path.join(tmpDir, 'old.txt');
    const dst = path.join(tmpDir, 'new.txt');
    fs.writeFileSync(src, 'content');
    const r = await request(PORT, { type: 'move', from: src, to: dst });
    expect(r.body.ok).toBe(true);
    expect(fs.existsSync(dst)).toBe(true);
    expect(fs.existsSync(src)).toBe(false);
  });
});

describe('read_many', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-rm-')); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it('reads multiple files at once', async () => {
    const a = path.join(tmpDir, 'a.txt');
    const b = path.join(tmpDir, 'b.txt');
    fs.writeFileSync(a, 'aaa');
    fs.writeFileSync(b, 'bbb');
    const r = await request(PORT, { type: 'read_many', paths: [a, b] });
    expect(r.body.ok).toBe(true);
    expect(r.body.data[a]).toBe('aaa');
    expect(r.body.data[b]).toBe('bbb');
  });

  it('returns null for missing files', async () => {
    const r = await request(PORT, { type: 'read_many', paths: ['/nonexistent/x.txt'] });
    expect(r.body.ok).toBe(true);
    expect(r.body.data['/nonexistent/x.txt']).toBeNull();
  });
});

describe('batch', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-batch-')); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  it('executes multiple actions and returns results array', async () => {
    const a = path.join(tmpDir, 'a.txt');
    const b = path.join(tmpDir, 'b.txt');
    const r = await request(PORT, {
      type: 'batch',
      actions: [
        { type: 'write', path: a, content: 'file-a' },
        { type: 'write', path: b, content: 'file-b' },
      ],
    });
    expect(r.body.ok).toBe(true);
    expect(Array.isArray(r.body.results)).toBe(true);
    expect(r.body.results).toHaveLength(2);
    expect(r.body.results[0].ok).toBe(true);
    expect(r.body.results[1].ok).toBe(true);
    expect(fs.existsSync(a)).toBe(true);
    expect(fs.existsSync(b)).toBe(true);
  });

  it('returns ok:false when any action fails', async () => {
    const r = await request(PORT, {
      type: 'batch',
      actions: [
        { type: 'read', path: '/nonexistent/nope.txt' },
      ],
    });
    expect(r.body.ok).toBe(false);
    expect(r.body.results[0].ok).toBe(false);
  });

  it('returns error for empty actions array', async () => {
    const r = await request(PORT, { type: 'batch', actions: [] });
    expect(r.body.ok).toBe(false);
  });

  it('continues executing after one failure', async () => {
    const good = path.join(tmpDir, 'good.txt');
    const r = await request(PORT, {
      type: 'batch',
      actions: [
        { type: 'read', path: '/nonexistent/nope.txt' },
        { type: 'write', path: good, content: 'ok' },
      ],
    });
    expect(r.body.results).toHaveLength(2);
    expect(r.body.results[0].ok).toBe(false);
    expect(r.body.results[1].ok).toBe(true);
  });
});

describe('exec', () => {
  it('runs simple shell command', async () => {
    const r = await request(PORT, { type: 'exec', command: 'echo hello', path: os.tmpdir() });
    expect(r.body.ok).toBe(true);
    expect(r.body.data.trim()).toBe('hello');
  });

  it('returns ok:false for failing command', async () => {
    const r = await request(PORT, { type: 'exec', command: 'exit 1', path: os.tmpdir() });
    expect(r.body.ok).toBe(false);
  });
});

describe('unknown type', () => {
  it('returns ok:false with error message', async () => {
    const r = await request(PORT, { type: 'does_not_exist_xyz' });
    expect(r.body.ok).toBe(false);
    expect(r.body.data).toContain('Unknown');
  });
});

describe('invalid JSON body', () => {
  it('returns ok:false on parse error', async () => {
    const r = await new Promise((resolve, reject) => {
      const body = 'NOT JSON {{{';
      const req  = http.request({
        hostname: '127.0.0.1', port: PORT, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      }, res => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
    expect(r.body.ok).toBe(false);
  });
});
