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


describe('ExecutionEngine', () => {
  let engine;
  let validator;

  beforeEach(() => {
    validator = new SecurityValidator();
    engine = new ExecutionEngine(validator);
    vi.clearAllMocks();
  });

  afterEach(() => {
    engine.cleanup();
  });

  describe('Command Building', () => {
    it('should use hardcoded command for interpreted languages', () => {
      const info = engine.buildCommand('javascript', 'file.js', []);
      expect(info.command).toBe('node');
      expect(info.isCompilation).toBe(false);
    });

    it('should setup compilation for C++', () => {
      fs.statSync.mockReturnValue(createMockStats());
      const info = engine.buildCommand('cpp', 'main.cpp', []);
      expect(info.command).toBe('g++');
      expect(info.isCompilation).toBe(true);
      expect(info.commandArgs).toContain('-o');
    });

    it('should setup compilation for Rust', () => {
      fs.statSync.mockReturnValue(createMockStats());
      const info = engine.buildCommand('rust', 'main.rs', []);
      expect(info.command).toBe('rustc');
      expect(info.isCompilation).toBe(true);
    });

    it('should NEVER use user input as command', () => {
      const maliciousEntry = '; rm -rf /; echo';
      fs.statSync.mockReturnValue(createMockStats());
      fs.realpathSync.mockImplementation((p) => p);
      
      const info = engine.buildCommand('javascript', maliciousEntry, []);
      expect(info.command).toBe('node'); // Hardcoded, not user input
      expect(info.command).not.toContain('rm');
    });
  });

  describe('Process Execution', () => {
    it('should handle successful execution', async () => {
      spawnSync.mockReturnValue({ status: 0, stdout: '/usr/bin/node' });
      
      const mockProc = createMockProcess({ exitCode: 0 });
      spawn.mockReturnValue(mockProc);

      const result = await engine.spawnProcess({
        command: 'node',
        args: ['file.js'],
        cwd: TEST_DIR,
        timeoutMs: 5000,
        env: {},
        maxBuffer: 1024,
      });

      expect(result.exitCode).toBe(0);
    });

    it('should handle command not found', async () => {
      spawnSync.mockReturnValue({ status: 1, stderr: 'not found' });
      
      const result = await engine.spawnProcess({
        command: 'nonexistent',
        args: [],
        cwd: TEST_DIR,
        timeoutMs: 5000,
        env: {},
        maxBuffer: 1024,
      });

      expect(result.exitCode).toBe(127);
      expect(result.stderr).toContain('not found');
    });

    it('should enforce timeout', async () => {
      spawnSync.mockReturnValue({ status: 0, stdout: '/usr/bin/node' });
      
      const mockProc = createMockProcess();
      mockProc.on = vi.fn((event, cb) => {
        if (event === 'close') {
          // Simulate timeout kill
          setTimeout(() => cb(null, 'SIGTERM'), 100);
        }
      });
      spawn.mockReturnValue(mockProc);

      const result = await engine.spawnProcess({
        command: 'node',
        args: ['slow.js'],
        cwd: TEST_DIR,
        timeoutMs: 50,
        env: {},
        maxBuffer: 1024,
      });

      expect(result.signal).toBe('SIGTERM');
    });

    it('should enforce output buffer limit', async () => {
      spawnSync.mockReturnValue({ status: 0, stdout: '/usr/bin/node' });
      
      let dataCallback;
      const mockProc = {
        stdout: { 
          on: vi.fn((evt, cb) => { 
            if (evt === 'data') dataCallback = cb;
          }) 
        },
        stderr: { on: vi.fn() },
        on: vi.fn((evt, cb) => {
          if (evt === 'close') {
            // Emit large data then close
            setTimeout(() => {
              dataCallback(Buffer.alloc(CONFIG.MAX_OUTPUT_BYTES + 1000));
              setTimeout(() => cb(0, null), 10);
            }, 10);
          }
        }),
        kill: vi.fn(),
      };
      spawn.mockReturnValue(mockProc);

      const result = await engine.spawnProcess({
        command: 'node',
        args: ['verbose.js'],
        cwd: TEST_DIR,
        timeoutMs: 5000,
        env: {},
        maxBuffer: CONFIG.MAX_OUTPUT_BYTES,
      });

      expect(mockProc.kill).toHaveBeenCalled();
    });
  });

  describe('Result Processing', () => {
    it('should strip ANSI codes', () => {
      const result = {
        stdout: '\x1b[31mred\x1b[0m text',
        stderr: '',
        exitCode: 0,
        killed: false,
        timedOut: false,
      };

      const processed = engine.processResult(result, 100, 'javascript');
      expect(processed.data).not.toContain('\x1b[');
    });

    it('should truncate long output', () => {
      const longOutput = Array(CONFIG.OUTPUT.truncateLines + 50).fill('line').join('\n');
      const result = {
        stdout: longOutput,
        stderr: '',
        exitCode: 0,
        killed: false,
        timedOut: false,
      };

      const processed = engine.processResult(result, 100, 'javascript');
      expect(processed.data).toContain('lines more');
    });

    it('should detect timeout kills', () => {
      const result = {
        stdout: '',
        stderr: '',
        exitCode: null,
        killed: true,
        timedOut: true,
      };

      const processed = engine.processResult(result, 1000, 'javascript');
      expect(processed.ok).toBe(false);
      expect(processed.data).toContain('timeout');
    });
  });
});
