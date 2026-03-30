// config.js
'use strict';

const CONFIG = Object.freeze({
  // Security
  ALLOWED_COMMANDS: Object.freeze({
    rust: { cmd: 'rustc', compile: true, runTemplate: '{output}' },
    cpp: { cmd: 'g++', compile: true, runTemplate: '{output}' },
    go: { cmd: 'go', compile: false, runTemplate: 'run {entry}' },
    python: { cmd: 'python3', compile: false, runTemplate: '{entry}' },
    javascript: { cmd: 'node', compile: false, runTemplate: '{entry}' },
    java: { cmd: 'javac', compile: true, runTemplate: 'java -cp {dir} {class}' },
  }),
  
  // Path Security
  PATH_TRAVERSAL_PATTERNS: Object.freeze([
    /\.\./, /\~/, /^\//, /\\/, /%2e%2e/i, /%2f/i, /\0/,
    /\$[{\(]/, /`/, /\$\(/, /<script/i,
  ]),
  
  // Resource Limits
  MAX_ARGS: 32,
  MAX_TIMEOUT_MS: 60_000,
  MAX_MEMORY_MB: 512,
  MAX_OUTPUT_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  
  // Sandbox
  SANDBOX: Object.freeze({
    enabled: true,
    chroot: false,
    useFirejail: false,
    useDocker: false,
    restrictedEnv: Object.freeze({
      PATH: '/usr/local/bin:/usr/bin:/bin',
      HOME: '/tmp',
      TMPDIR: '/tmp',
      LANG: 'C.UTF-8',
      LD_PRELOAD: '',
      LD_LIBRARY_PATH: '',
    }),
  }),
  
  // Caching
  CACHE: Object.freeze({
    enabled: true,
    dir: require('path').join(require('os').tmpdir(), 'polyglot-cache'),
    maxAgeMs: 3600_000,
    maxSize: 100,
  }),
  
  // Analysis
  STATIC_ANALYSIS: Object.freeze({
    enabled: true,
    maxLines: 1000,
    patterns: Object.freeze({
      'dangerous-import': /\b(eval|exec|system|popen|subprocess\.\*|child_process)\b/,
      'network-request': /\b(fetch|axios|http\.|urllib|requests)\b/,
      'file-operation': /\b(fs\.|open\(|writeFile|readFile|unlink|rmdir)\b/,
      'env-access': /\b(process\.env|os\.environ|ENV\[)\b/,
      'inline-script': /<script|javascript:|data:text\/html/,
    }),
  }),
  
  // Heuristics
  HEURISTICS: Object.freeze({
    detectInfiniteLoop: true,
    loopPattern: /\b(while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\))\b/g,
    detectRecursion: true,
    recursionPattern: /function\s+(\w+).*?\{[\s\S]*?\b\1\s*\(/g,
  }),
  
  // Output Processing
  OUTPUT: Object.freeze({
    truncateLines: 500,
    truncateCols: 200,
    stripAnsi: true,
    sanitizeControlChars: true,
  }),
  
  // Tokens
  MAX_IDENTIFIER_LENGTH: 64,
  ALLOWED_EXTENSIONS: Object.freeze({
    rust: ['.rs'],
    cpp: ['.cpp', '.cc', '.cxx', '.c++'],
    go: ['.go'],
    python: ['.py'],
    javascript: ['.js', '.mjs', '.cjs'],
    java: ['.java'],
  }),
});

module.exports = { CONFIG };
