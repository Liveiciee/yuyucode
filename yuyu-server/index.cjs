// index.cjs — YuyuServer entry point
const http = require('http');
const { PORT, WS_PORT, VERSION, VERBOSE, START_TIME } = require('./config.cjs');
const { checkRateLimit } = require('./rateLimiter.cjs');
const { handle } = require('./handlers/index.cjs');
const { startWebSocket } = require('./websocket.cjs');
const { _readCache } = require('./cache.cjs');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (VERBOSE) {
    const safeMethod = ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'].includes(req.method) ? req.method : 'UNKNOWN';
    const safeUrl = req.url ? req.url.replace(/[\r\n]/g, '') : '/';
    console.log(`[${new Date().toISOString()}] ${safeMethod} ${safeUrl}`);
  }

  if (req.method === 'POST') {
    const ip = req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, data: 'Rate limit exceeded. Max 120 req/min.' }));
      if (VERBOSE) console.log(`  ⚠ Rate limit hit: ${ip}`);
      return;
    }
  }

  if (req.method === 'GET' && req.url === '/health') {
    const uptime = Math.round((Date.now() - START_TIME) / 1000);
    const memUsed = Math.round(process.memoryUsage().rss / 1024 / 1024);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime, version: VERSION, port: PORT, memory_mb: memUsed, cache_size: _readCache.size }));
    return;
  }
  if (req.method === 'GET' && req.url === '/status') {
    const uptime = Math.round((Date.now() - START_TIME) / 1000);
    const memUsed = Math.round(process.memoryUsage().rss / 1024 / 1024);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime, version: VERSION, port: PORT, memory_mb: memUsed, tools: Object.keys(require('./mcp/index.cjs').MCP_TOOLS), external_mcp: require('./mcp/index.cjs').EXTERNAL_MCP.length, cache_entries: _readCache.size }));
    return;
  }
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, version: VERSION, mcp: Object.keys(require('./mcp/index.cjs').MCP_TOOLS), external_mcp: require('./mcp/index.cjs').EXTERNAL_MCP.length, endpoints: ['/health', '/status', 'POST /'] }));
    return;
  }

  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      const result  = handle(payload);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch(e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, data: e.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🌸 YuyuServer ${VERSION} — HTTP :${PORT}`);
  console.log(`   HOME: ${process.env.HOME}`);
  console.log(`   Tools: ${Object.keys(require('./mcp/index.cjs').MCP_TOOLS).join(', ')}`);
  console.log(`   Memory limit: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
});

// WebSocket
let wss = null;
try {
  require.resolve('ws');
  wss = startWebSocket(WS_PORT);
  console.log(`🔌 YuyuServer WebSocket — WS :${WS_PORT} (file watch + streaming exec)`);
} catch(e) {
  console.log('⚠ ws tidak tersedia — jalankan: npm install -g ws');
}

process.on('uncaughtException', e => console.error('❌ Uncaught:', e.message));
process.on('unhandledRejection', e => console.error('❌ Rejection:', e));
process.on('SIGTERM', () => {
  console.log('📴 Shutting down...');
  server.close(() => process.exit(0));
  if (wss) wss.close();
  setTimeout(() => process.exit(0), 3000);
});
