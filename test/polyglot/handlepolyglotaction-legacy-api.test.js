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


describe('handlePolyglotAction (Legacy API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.statSync.mockReturnValue(createMockStats());
  });

  it('should list runtimes', () => {
    const result = handlePolyglotAction('list');
    expect(result.ok).toBe(true);
    expect(result.data).toContain('javascript');
    expect(result.data).toContain('python');
  });

  it('should check health synchronously', () => {
    spawnSync.mockReturnValue({
      status: 0,
      stdout: 'v3.10.0',
    });

    const result = handlePolyglotAction('health');
    expect(result.ok).toBe(true);
    expect(result.data).toHaveProperty('python');
    expect(result.data.python.ok).toBe(true);
  });

  it('should handle run action (async)', async () => {
    fs.readFileSync.mockReturnValue('console.log(1)');
    spawnSync.mockReturnValue({ status: 0, stdout: '/usr/bin/node' });
    
    const mockProc = createMockProcess({ exitCode: 0 });
    spawn.mockReturnValue(mockProc);

    const result = await handlePolyglotAction('run', {
      runtime: 'javascript',
      entry: 'test.js',
      cwd: TEST_DIR,
    });

    expect(result).toBeDefined();
  });

  it('should reject unknown actions', () => {
    const result = handlePolyglotAction('fly');
    expect(result.ok).toBe(false);
    expect(result.data).toContain('Unknown');
  });
});
