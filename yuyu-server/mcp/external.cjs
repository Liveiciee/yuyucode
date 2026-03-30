// mcp/external.cjs
const { fetch } = require('undici');

async function callExternalMCP(server, action, params) {
  const { url } = server;
  try {
    const body = JSON.stringify({ action, params: params || {} });
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) return { ok: false, data: 'HTTP ' + resp.status };
    const data = await resp.json();
    return { ok: true, data: typeof data === 'string' ? data : JSON.stringify(data, null, 2).slice(0, 4000) };
  } catch(e) {
    return { ok: false, data: e.message };
  }
}

module.exports = { callExternalMCP };
