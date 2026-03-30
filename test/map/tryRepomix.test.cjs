// @vitest-environment node
// globals: true — vi, describe, it, expect, beforeEach, afterEach injected by vitest

const fs   = require('fs');
const path = require('path');
const os = require('os');

// Lazy-load once at module level for pure-function tests
const _yuyuMap = require('../../yuyu-map.cjs');
const extractSymbols      = _yuyuMap.extractSymbols;
const compressSource      = _yuyuMap.compressSource;
const extractImports      = _yuyuMap.extractImports;
const computeSalience     = _yuyuMap.computeSalience;
const walkFiles           = _yuyuMap.walkFiles;
const generateMap         = _yuyuMap.generateMap;
const generateCompressed  = _yuyuMap.generateCompressed;
const generateLlmsTxt     = _yuyuMap.generateLlmsTxt;
const ensureHandoffTemplate = _yuyuMap.ensureHandoffTemplate;
const getChangedFiles     = _yuyuMap.getChangedFiles;
const tryRepomix          = _yuyuMap.tryRepomix;
const main                = _yuyuMap.main;

// ─────────────────────────────────────────────────────────────────────────────
// tryRepomix — uses dependency injection: tryRepomix(_spawnSync?)
// ─────────────────────────────────────────────────────────────────────────────
describe('tryRepomix', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yuyu-test-'));
    fs.mkdirSync(path.join(tmpDir, '.yuyu'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns content string on success', () => {
    const outFile     = path.join(tmpDir, '.yuyu', 'compressed-repomix.md');
    const fakeContent = '# Repomix output\n\nsome compressed code';

    const mockSpawn = vi.fn(() => {
      fs.writeFileSync(outFile, fakeContent);
      return { status: 0, error: null, stderr: '' };
    });

    const result = tryRepomix(mockSpawn, outFile);
    expect(result).toBe(fakeContent);
  });

  it('returns null when spawnSync throws', () => {
    const mockSpawn = vi.fn(() => { throw new Error('ENOENT: npx not found'); });
    expect(tryRepomix(mockSpawn)).toBeNull();
  });

  it('returns null when spawnSync returns error object (offline/not found)', () => {
    const mockSpawn = vi.fn(() => ({ error: new Error('ENOENT'), status: null, stderr: '' }));
    expect(tryRepomix(mockSpawn)).toBeNull();
  });

  it('returns null when exit status is non-zero', () => {
    const mockSpawn = vi.fn(() => ({ error: null, status: 1, stderr: 'network timeout' }));
    expect(tryRepomix(mockSpawn)).toBeNull();
  });

  it('returns null when output file not created despite exit 0', () => {
    const mockSpawn   = vi.fn(() => ({ error: null, status: 0, stderr: '' }));
    const ghostFile   = path.join(tmpDir, '.yuyu', 'ghost-repomix.md'); // never written
    expect(tryRepomix(mockSpawn, ghostFile)).toBeNull();
  });

  it('calls spawnSync with correct repomix args', () => {
    const mockSpawn = vi.fn(() => ({ error: new Error('offline'), status: null, stderr: '' }));
    tryRepomix(mockSpawn);
    expect(mockSpawn).toHaveBeenCalledWith(
      'npx',
      expect.arrayContaining(['repomix', '--compress']),
      expect.objectContaining({ timeout: expect.any(Number) })
    );
  });

  it('uses longer timeout on ARM64', () => {
    const originalArch = process.arch;
    Object.defineProperty(process, 'arch', { value: 'arm64' });
    const mockSpawn = vi.fn(() => ({ error: new Error('offline'), status: null, stderr: '' }));
    tryRepomix(mockSpawn);
    const opts = mockSpawn.mock.calls[0][2];
    expect(opts.timeout).toBe(120_000);
    Object.defineProperty(process, 'arch', { value: originalArch });
  });

  it('uses 90s timeout on x86_64', () => {
    const originalArch = process.arch;
    Object.defineProperty(process, 'arch', { value: 'x64' });
    const mockSpawn = vi.fn(() => ({ error: new Error('offline'), status: null, stderr: '' }));
    tryRepomix(mockSpawn);
    const opts = mockSpawn.mock.calls[0][2];
    expect(opts.timeout).toBe(90_000);
    Object.defineProperty(process, 'arch', { value: originalArch });
  });
});
