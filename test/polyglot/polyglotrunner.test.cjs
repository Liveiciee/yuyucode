// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { spawnSync, spawn } from 'child_process';
import {
  PolyglotRunner,
  handlePolyglotAction,
  CONFIG,
  SecurityValidator,
  ExecutionEngine,
  RUNTIMES,
} from './polyglot-runner.cjs';

// ============================================================================
// MOCKS & FIXTURES
// ============================================================================

vi.mock('child_process', () => ({
  spawnSync: vi.fn(),
  spawn: vi.fn(),
}));

// Mock fs untuk kontrol total
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
    statSync: vi.fn(),
    realpathSync: vi.fn((p) => p),
    readdirSync: vi.fn(),
    unlinkSync: vi.fn(),
    mkdtempSync: vi.fn(),
  };
});

const createMockStats = (overrides = {}) => ({
  size: 1024,
  mtime: new Date(),
  atime: new Date(),
  ...overrides,
});

const createMockProcess = (overrides = {}) => ({
  stdout: { on: vi.fn(), pipe: vi.fn() },
  stderr: { on: vi.fn(), pipe: vi.fn() },
  on: vi.fn((event, cb) => {
    if (event === 'close') setTimeout(() => cb(overrides.exitCode || 0, null), 10);
  }),
  kill: vi.fn(),
  ...overrides,
});

// ============================================================================
// SETUP & UTILITIES
// ============================================================================

const TEST_DIR = path.join(os.tmpdir(), 'polyglot-test-' + Date.now());
const FIXTURES = {
  validJs: 'console.log("hello");',
  dangerousJs: 'const x = eval(process.env.SECRET);',
  infiniteLoop: 'while(true){}',
  largeFile: 'x'.repeat(CONFIG.MAX_FILE_SIZE_BYTES + 100),
  traversal: '../../../etc/passwd',
  symlink: '/tmp/fake',
};

beforeAll(() => {
  fs.mkdirSync.mockReturnValue(undefined);
  fs.existsSync.mockReturnValue(true);
  fs.realpathSync.mockImplementation((p) => p);
  fs.statSync.mockReturnValue(createMockStats());
});

afterAll(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// SECURITY VALIDATOR TESTS (Komprehensif)
// ============================================================================


describe('PolyglotRunner', () => {
  let runner;

  beforeEach(() => {
    runner = new PolyglotRunner();
    vi.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.statSync.mockReturnValue(createMockStats({ size: 1024 }));
    fs.readFileSync.mockReturnValue('console.log("test");');
  });

  afterEach(() => {
    runner.cleanup();
  });

  describe('Runtime Health Checks', () => {
    it('should check all runtimes health', async () => {
      spawnSync.mockReturnValue({
        status: 0,
        stdout: 'v18.0.0\n',
      });

      const result = await runner.listRuntimes();
      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(Object.keys(RUNTIMES).length);
    });

    it('should detect missing runtimes', async () => {
      spawnSync.mockReturnValue({
        status: 1,
        stderr: 'command not found',
      });

      const health = await runner.checkHealth('rust');
      expect(health.ok).toBe(false);
    });
  });

  describe('Execution Flow', () => {
    it('should execute JavaScript successfully', async () => {
      fs.readFileSync.mockReturnValue('console.log("hello");');
      
      spawnSync.mockReturnValue({ status: 0, stdout: '/usr/bin/node' });
      
      const mockProc = createMockProcess({ exitCode: 0 });
      mockProc.stdout.on = vi.fn((evt, cb) => {
        if (evt === 'data') setTimeout(() => cb(Buffer.from('hello\n')), 10);
      });
      spawn.mockReturnValue(mockProc);

      const result = await runner.run({
        runtime: 'javascript',
        entry: 'test.js',
        cwd: TEST_DIR,
      });

      expect(result.ok).toBe(true);
      expect(result.stage).toBe('execution');
    });

    it('should block dangerous code', async () => {
      fs.readFileSync.mockReturnValue('eval("malicious");');
      
      const result = await runner.run({
        runtime: 'javascript',
        entry: 'evil.js',
        cwd: TEST_DIR,
      });

      expect(result.ok).toBe(false);
      expect(result.stage).toBe('security-scan');
    });

    it('should block path traversal', async () => {
      const result = await runner.run({
        runtime: 'javascript',
        entry: '../../../etc/passwd',
        cwd: TEST_DIR,
      });

      expect(result.ok).toBe(false);
      expect(result.stage).toBe('validation');
    });

    it('should handle compilation for C++', async () => {
      fs.readFileSync.mockReturnValue('int main(){ return 0; }');
      
      // which g++
      spawnSync.mockReturnValueOnce({ status: 0, stdout: '/usr/bin/g++' });
      // Compilation
      spawnSync.mockReturnValueOnce({ status: 0, stdout: '' });
      
      const mockProc = createMockProcess({ exitCode: 0 });
      spawn.mockReturnValue(mockProc);

      const result = await runner.run({
        runtime: 'cpp',
        entry: 'main.cpp',
        cwd: TEST_DIR,
      });

      // Should handle compilation phase
      expect(result).toBeDefined();
    });

    it('should respect timeout', async () => {
      fs.readFileSync.mockReturnValue('while(true){}');
      
      spawnSync.mockReturnValue({ status: 0, stdout: '/usr/bin/node' });
      
      const mockProc = createMockProcess({ timedOut: true });
      spawn.mockReturnValue(mockProc);

      const result = await runner.run({
        runtime: 'javascript',
        entry: 'infinite.js',
        cwd: TEST_DIR,
        timeoutMs: 100,
      });

      expect(result.meta?.killed || result.data?.includes('timeout')).toBeTruthy();
    });
  });

  describe('Cache Management', () => {
    it('should use cache for compiled languages', async () => {
      fs.readFileSync.mockReturnValue('int main(){}');
      fs.readdirSync.mockReturnValue(['rust_main_abc123def4567890']);
      fs.statSync.mockReturnValue(createMockStats({ 
        mtime: new Date(Date.now() - 1000) // Fresh
      }));

      const result = runner.cache.get('main.rs', 'rust');
      expect(result).toContain('rust_main_');
    });

    it('should clean expired cache', () => {
      fs.readdirSync.mockReturnValue(['old_file_123']);
      fs.statSync.mockReturnValue(createMockStats({ 
        mtime: new Date(Date.now() - CONFIG.CACHE.maxAgeMs - 1000) 
      }));

      const result = runner.cache.clean();
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('should enforce LRU when too many files', () => {
      const files = Array(150).fill(0).map((_, i) => `file_${i}`);
      fs.readdirSync.mockReturnValue(files);
      fs.statSync.mockImplementation(() => 
        createMockStats({ atime: new Date(Date.now() - Math.random() * 10000) })
      );

      runner.cache.clean();
      expect(fs.unlinkSync).toHaveBeenCalled();
    });
  });

  describe('Statistics Tracking', () => {
    it('should track run counts', async () => {
      expect(runner.stats.runs).toBe(0);
      
      fs.readFileSync.mockReturnValue('console.log(1)');
      spawnSync.mockReturnValue({ status: 0 });
      
      try {
        await runner.run({ runtime: 'javascript', entry: 'x.js', cwd: TEST_DIR });
      } catch (e) {}
      
      expect(runner.stats.runs).toBeGreaterThan(0);
    });
  });
}