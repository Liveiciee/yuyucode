// @vitest-environment node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { handlePolyglotAction, RUNTIMES } = require('./polyglot-runner.cjs');

describe('polyglot-runner', () => {
  it('lists available runtimes', () => {
    const r = handlePolyglotAction('list');
    expect(r.ok).toBe(true);
    expect(r.data).toEqual(expect.arrayContaining(Object.keys(RUNTIMES)));
  });

  it('returns health report map', () => {
    const r = handlePolyglotAction('health');
    expect(r.ok).toBe(true);
    expect(r.data).toHaveProperty('javascript');
    expect(r.data).toHaveProperty('python');
  });

  it('fails for unknown runtime in run action', () => {
    const r = handlePolyglotAction('run', { runtime: 'lua', entry: 'x' });
    expect(r.ok).toBe(false);
    expect(r.data).toContain('Unknown runtime');
  });

  it('runs a javascript entry successfully', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-poly-'));
    const script = path.join(dir, 'hello.js');
    fs.writeFileSync(script, 'console.log("polyglot-ok")\n', 'utf8');

    const r = handlePolyglotAction('run', {
      runtime: 'javascript',
      cwd: dir,
      entry: 'hello.js',
      timeoutMs: 3000,
    });
    expect(r.ok).toBe(true);
    expect(r.data).toContain('polyglot-ok');
  });

  it('blocks path traversal entries', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-poly-'));
    const r = handlePolyglotAction('run', {
      runtime: 'javascript',
      cwd: dir,
      entry: '../outside.js',
    });
    expect(r.ok).toBe(false);
    expect(r.data).toContain('inside working directory');
  });
});
