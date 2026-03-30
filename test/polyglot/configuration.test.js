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


describe('Configuration', () => {
  it('should have frozen config', () => {
    expect(() => {
      CONFIG.MAX_ARGS = 999;
    }).toThrow();
  });

  it('should have valid regex patterns', () => {
    CONFIG.PATH_TRAVERSAL_PATTERNS.forEach(pattern => {
      expect(pattern).toBeInstanceOf(RegExp);
    });
  });

  it('should have consistent limits', () => {
    expect(CONFIG.MAX_TIMEOUT_MS).toBeGreaterThan(0);
    expect(CONFIG.MAX_MEMORY_MB).toBeGreaterThan(0);
    expect(CONFIG.MAX_OUTPUT_BYTES).toBeGreaterThan(CONFIG.MAX_FILE_SIZE_BYTES);
  });

  it('should have all required token weights', () => {
    const weights = CONFIG.TOKEN_WEIGHTS;
    expect(weights.keyword).toBeGreaterThan(0);
    expect(weights.identifier).toBeGreaterThan(0);
  });
});
