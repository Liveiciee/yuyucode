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


describe('Edge Cases & Stress Tests', () => {
  let runner;

  beforeEach(() => {
    runner = new PolyglotRunner();
  });

  afterEach(() => {
    runner.cleanup();
  });

  it('should handle empty files', async () => {
    fs.readFileSync.mockReturnValue('');
    fs.statSync.mockReturnValue(createMockStats({ size: 0 }));
    
    const analysis = new SecurityValidator().staticAnalysis('', 'javascript');
    expect(analysis.safe).toBe(true);
  });

  it('should handle unicode in paths', () => {
    const validator = new SecurityValidator();
    fs.realpathSync.mockImplementation((p) => p);
    
    expect(() => {
      validator.validatePath('文件.js', TEST_DIR);
    }).not.toThrow();
  });

  it('should handle very long paths', () => {
    const longPath = 'a/'.repeat(100) + 'file.js';
    fs.realpathSync.mockImplementation((p) => p);
    
    const validator = new SecurityValidator();
    expect(() => {
      validator.validatePath(longPath, TEST_DIR);
    }).not.toThrow();
  });

  it('should handle rapid successive executions', async () => {
    fs.readFileSync.mockReturnValue('console.log(1)');
    spawnSync.mockReturnValue({ status: 0, stdout: '/usr/bin/node' });
    
    const mockProc = createMockProcess({ exitCode: 0 });
    spawn.mockReturnValue(mockProc);

    const promises = Array(10).fill(0).map((_, i) => 
      runner.run({
        runtime: 'javascript',
        entry: `test${i}.js`,
        cwd: TEST_DIR,
      })
    );

    const results = await Promise.all(promises);
    expect(results).toHaveLength(10);
    results.forEach(r => expect(r).toBeDefined());
  });

  it('should handle concurrent cleanup', () => {
    expect(() => {
      runner.cleanup();
      runner.cleanup(); // Double cleanup should not throw
    }).not.toThrow();
  });

  it('should handle binary output', async () => {
    spawnSync.mockReturnValue({ status: 0, stdout: '/usr/bin/node' });
    
    const mockProc = createMockProcess({ exitCode: 0 });
    mockProc.stdout.on = vi.fn((evt, cb) => {
      if (evt === 'data') {
        // Simulate binary data
        cb(Buffer.from([0x00, 0x01, 0x02, 0x03]));
      }
    });
    spawn.mockReturnValue(mockProc);

    const result = await runner.run({
      runtime: 'javascript',
      entry: 'binary.js',
      cwd: TEST_DIR,
    });

    expect(result.ok).toBe(true);
  });

  it('should handle environment variable injection attempts', () => {
    const validator = new SecurityValidator();
    const args = ['$HOME', '${PATH}', '%SYSTEMROOT%'];
    
    args.forEach(arg => {
      expect(() => validator.sanitizeArgs([arg])).not.toThrow(); // Should sanitize, not throw
    });
  });

  it('should handle all runtime configurations', () => {
    Object.keys(CONFIG.ALLOWED_COMMANDS).forEach(runtime => {
      const cfg = CONFIG.ALLOWED_COMMANDS[runtime];
      expect(cfg).toHaveProperty('cmd');
      expect(cfg).toHaveProperty('compile');
      expect(typeof cfg.compile).toBe('boolean');
    });
  });
});
