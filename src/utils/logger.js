/* eslint-disable no-console */
// src/utils/logger.js
export const logger = {
  debug: (...args) => {
    if (import.meta.env?.DEV !== false) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};
