// config.cjs
const VERSION = 'v7';
const PORT = 8765;
const WS_PORT = 8766;
const READ_CACHE_TTL = 10000;
const MAX_CACHE_SIZE = 50;
const MAX_CACHE_FILE_SIZE = 5 * 1024 * 1024;
const RATE_LIMIT = 120;
const RATE_WINDOW = 60000;
const VERBOSE = process.argv.includes('--verbose');
const START_TIME = Date.now();

module.exports = {
  VERSION,
  PORT,
  WS_PORT,
  READ_CACHE_TTL,
  MAX_CACHE_SIZE,
  MAX_CACHE_FILE_SIZE,
  RATE_LIMIT,
  RATE_WINDOW,
  VERBOSE,
  START_TIME
};
