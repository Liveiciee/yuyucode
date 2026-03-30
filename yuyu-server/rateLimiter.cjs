// rateLimiter.cjs
const { RATE_LIMIT, RATE_WINDOW } = require('./config.cjs');

const _rateCounts = new Map();

function checkRateLimit(ip) {
  const now  = Date.now();
  const data = _rateCounts.get(ip) || { count: 0, windowStart: now };
  if (now - data.windowStart > RATE_WINDOW) {
    data.count = 0; data.windowStart = now;
  }
  data.count++;
  _rateCounts.set(ip, data);
  return data.count <= RATE_LIMIT;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of _rateCounts) {
    if (now - data.windowStart > RATE_WINDOW * 2) {
      _rateCounts.delete(ip);
    }
  }
}, 3600000);

module.exports = { checkRateLimit };
