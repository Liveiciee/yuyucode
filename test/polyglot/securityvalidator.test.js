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


describe('SecurityValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new SecurityValidator();
    fs.existsSync.mockReturnValue(true);
    fs.realpathSync.mockImplementation((p) => p);
  });

  describe('Path Traversal Defense', () => {
    it.each([
      ['../etc/passwd', 'double dot'],
      ['....//etc/passwd', 'encoded traversal'],
      ['~/.ssh/id_rsa', 'home directory'],
      ['/etc/passwd', 'absolute path'],
      ['file%2e%2e%2fconfig', 'URL encoded'],
      ['file\x00.txt', 'null byte'],
      ['file`whoami`.txt', 'backtick'],
      ['file$(whoami).txt', 'command substitution'],
      ['file${HOME}.txt', 'variable expansion'],
      ['<script>alert(1)</script>', 'XSS attempt'],
    ])('should block dangerous path: %s (%s)', (dangerousPath, desc) => {
      expect(() => {
        validator.validatePath(dangerousPath, TEST_DIR);
      }).toThrow(/Security violation|Path traversal/);
    });

    it('should allow valid relative paths', () => {
      fs.realpathSync.mockImplementation((p) => p);
      const result = validator.validatePath('src/index.js', TEST_DIR);
      expect(result).toContain(TEST_DIR);
    });

    it('should detect symlink traversal attacks', () => {
      fs.realpathSync.mockImplementation((p) => {
        if (p.includes('symlink')) return '/etc/passwd';
        return p;
      });
      
      expect(() => {
        validator.validatePath('symlink', TEST_DIR);
      }).toThrow(/Symlink traversal/);
    });

    it('should normalize path correctly', () => {
      const result = validator.validatePath('./deep/../shallow/file.js', TEST_DIR);
      expect(result).not.toContain('..');
    });
  });

  describe('File Size Validation', () => {
    it('should accept files under limit', () => {
      fs.statSync.mockReturnValue(createMockStats({ size: 1024 }));
      expect(() => validator.validateFileSize('small.js')).not.toThrow();
    });

    it('should reject oversized files', () => {
      fs.statSync.mockReturnValue(createMockStats({ 
        size: CONFIG.MAX_FILE_SIZE_BYTES + 1 
      }));
      expect(() => validator.validateFileSize('huge.js')).toThrow(/too large/);
    });
  });

  describe('Extension Validation', () => {
    it.each([
      ['javascript', 'file.js', true],
      ['javascript', 'file.mjs', true],
      ['javascript', 'file.py', false],
      ['python', 'file.py', true],
      ['rust', 'file.rs', true],
      ['cpp', 'file.cpp', true],
      ['cpp', 'file.cc', true],
      ['cpp', 'file.txt', false],
      ['go', 'file.go', true],
    ])('should validate %s extension for %s', (runtime, filename, shouldPass) => {
      if (shouldPass) {
        expect(validator.validateExtension(filename, runtime)).toBe(path.extname(filename));
      } else {
        expect(() => validator.validateExtension(filename, runtime)).toThrow(/Invalid extension/);
      }
    });
  });

  describe('Static Analysis', () => {
    it('should detect dangerous imports', () => {
      const code = 'const x = eval("1+1");';
      const result = validator.staticAnalysis(code, 'javascript');
      expect(result.safe).toBe(false);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({ category: 'dangerous-import' })
      );
    });

    it('should detect network requests', () => {
      const code = 'fetch("http://evil.com")';
      const result = validator.staticAnalysis(code, 'javascript');
      expect(result.warnings).toContainEqual(
        expect.objectContaining({ category: 'network-request' })
      );
    });

    it('should detect infinite loops', () => {
      const code = 'while(true){} while(true){} while(true){} while(true){} while(true){} while(true){}';
      const result = validator.staticAnalysis(code, 'javascript');
      const loopWarning = result.warnings.find(w => w.category === 'suspicious-loop');
      expect(loopWarning).toBeDefined();
    });

    it('should pass safe code', () => {
      const code = 'console.log("hello world");';
      const result = validator.staticAnalysis(code, 'javascript');
      expect(result.safe).toBe(true);
    });
  });

  describe('Argument Sanitization', () => {
    it('should limit argument count', () => {
      const args = Array(CONFIG.MAX_ARGS + 10).fill('arg');
      const result = validator.sanitizeArgs(args);
      expect(result).toHaveLength(CONFIG.MAX_ARGS);
    });

    it('should truncate long arguments', () => {
      const longArg = 'x'.repeat(1000);
      const result = validator.sanitizeArgs([longArg]);
      expect(result[0]).toHaveLength(512);
    });

    it.each([
      ['; rm -rf /', 'semicolon'],
      ['| cat /etc/passwd', 'pipe'],
      ['`whoami`', 'backtick'],
      ['$(echo pwned)', 'command substitution'],
    ])('should reject dangerous chars in args: %s (%s)', (badArg, desc) => {
      expect(() => validator.sanitizeArgs([badArg])).toThrow(/Dangerous character/);
    });

    it('should allow safe arguments', () => {
      const args = ['--port', '3000', '--env', 'production'];
      expect(validator.sanitizeArgs(args)).toEqual(args);
    });
  });

  describe('Cache Path Generation', () => {
    it('should generate deterministic hash', () => {
      fs.statSync.mockReturnValue(createMockStats({ mtime: new Date(1234567890) }));
      const path1 = validator.generateSafeOutputPath('rust', '/src/main.rs');
      const path2 = validator.generateSafeOutputPath('rust', '/src/main.rs');
      expect(path1).toBe(path2);
    });

    it('should include runtime in path', () => {
      const result = validator.generateSafeOutputPath('rust', 'main.rs');
      expect(result).toContain('rust_');
    });
  });
});
