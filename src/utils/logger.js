/* eslint-disable no-console */
// src/utils/logger.js

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

// Default: DEBUG in dev, INFO in prod
let _level  = import.meta.env?.DEV !== false ? LEVELS.debug : LEVELS.info;
let _buffer = null; // When set to [], log calls are buffered instead of printed

function timestamp() {
  // HH:MM:SS.mmm — cheap, no Date alloc on hot path if level is filtered
  return new Date().toISOString().slice(11, 23);
}

function emit(levelName, consoleFn, args) {
  if (LEVELS[levelName] < _level) return;
  if (_buffer !== null) {
    _buffer.push({ level: levelName, args, ts: Date.now() });
    return;
  }
  consoleFn(`[${timestamp()}] [${levelName.toUpperCase()}]`, ...args);
}

export const logger = {
  debug: (...args) => emit('debug', console.debug, args),
  info:  (...args) => emit('info',  console.log,   args),
  warn:  (...args) => emit('warn',  console.warn,  args),
  error: (...args) => emit('error', console.error, args),

  /**
   * Set minimum log level at runtime.
   * Use 'silent' to suppress all output (handy in tests).
   * @param {'debug'|'info'|'warn'|'error'|'silent'} level
   */
  setLevel(level) {
    if (!(level in LEVELS)) throw new Error(`Unknown log level: "${level}". Valid: ${Object.keys(LEVELS).join(', ')}`);
    _level = LEVELS[level];
  },

  /** Current level name */
  get level() {
    return Object.keys(LEVELS).find(k => LEVELS[k] === _level) ?? 'info';
  },

  /**
   * Start buffering log calls instead of printing them.
   * Useful in tests to assert what was logged without console noise.
   *
   * @example
   *   logger.startBuffer();
   *   doSomething();
   *   const logs = logger.flushBuffer();
   *   expect(logs.some(l => l.level === 'warn')).toBe(true);
   */
  startBuffer() {
    _buffer = [];
  },

  /**
   * Return buffered entries and stop buffering.
   * @returns {Array<{level: string, args: any[], ts: number}>}
   */
  flushBuffer() {
    const logs = _buffer ?? [];
    _buffer = null;
    return logs;
  },
};
