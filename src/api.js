import { CEREBRAS_KEY, YUYU_SERVER, WS_SERVER } from './constants.js';

// ── CEREBRAS STREAMING (with auto-retry) ──────────────────────────────────────
export async function askCerebrasStream(messages, model, onChunk, signal, options = {}, _attempt = 0) {
  try {
    return await _askCerebrasStreamOnce(messages, model, onChunk, signal, options);
  } catch (e) {
    // Auto-retry on transient server errors (not rate limit, not abort)
    if (e.name === 'AbortError') throw e;
    if (e.message.startsWith('RATE_LIMIT:')) throw e;
    if (_attempt < 2 && (e.message.startsWith('CEREBRAS_SERVER:') || e.message.includes('fetch'))) {
      const delay = ((_attempt + 1) * 2000); // 2s, 4s
      await new Promise(r => setTimeout(r, delay));
      return askCerebrasStream(messages, model, onChunk, signal, options, _attempt + 1);
    }
    throw e;
  }
}

async function _askCerebrasStreamOnce(messages, model, onChunk, signal, options = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages must be a non-empty array');
  }

  // Inject vision image ke user message terakhir
  let finalMessages = messages;
  if (options.imageBase64 && typeof options.imageBase64 === 'string') {
    finalMessages = messages.map((m, i) => {
      if (i === messages.length - 1 && m.role === 'user') {
        const textContent = typeof m.content === 'string' ? m.content
          : Array.isArray(m.content) ? m.content.filter(c => c.type === 'text').map(c => c.text).join(' ')
          : '';
        return {
          ...m,
          content: [
            { type: 'text', text: textContent },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + options.imageBase64 } },
          ],
        };
      }
      return m;
    });
  }

  const resp = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + CEREBRAS_KEY,
    },
    body: JSON.stringify({
      model,
      messages: finalMessages,
      max_tokens: options.maxTokens || 4096,
      stream: true,
      temperature: options.temperature || 0.3,
    }),
  });

  if (resp.status === 429) {
    const retry = parseInt(resp.headers.get('retry-after') || '60', 10);
    throw new Error(`RATE_LIMIT:${retry}`);
  }
  if (resp.status >= 500) {
    const errText = await resp.text();
    throw new Error(`CEREBRAS_SERVER:${resp.status}:${errText.slice(0, 100)}`);
  }
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Cerebras error: HTTP ${resp.status} - ${errText}`);
  }

  const reader  = resp.body.getReader();
  const decoder = new TextDecoder();
  let full   = '';
  let buffer = '';

  try {
    while (true) {
      let done, value;
      try {
        ({ done, value } = await reader.read());
      } catch (readErr) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        console.warn('Stream read error:', readErr);
        break;
      }
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
        try {
          const parsed  = JSON.parse(line.slice(6));
          const content = parsed.choices?.[0]?.delta?.content || '';
          full += content;
          onChunk(full);
        } catch {}
      }
    }

    // Flush remaining buffer
    if (buffer.startsWith('data: ') && buffer !== 'data: [DONE]') {
      try {
        const parsed  = JSON.parse(buffer.slice(6));
        const content = parsed.choices?.[0]?.delta?.content || '';
        full += content;
        onChunk(full);
      } catch {}
    }
  } finally {
    try { reader.releaseLock(); } catch {}
  }

  return full;
}

// ── CALL SERVER (HTTP) ─────────────────────────────────────────────────────────
export async function callServer(payload) {
  try {
    const resp = await fetch(YUYU_SERVER, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.text();
      return { ok: false, data: `Server error: ${resp.status} — ${err.slice(0, 200)}` };
    }
    return await resp.json();
  } catch(e) {
    return { ok: false, data: 'YuyuServer tidak dapat dihubungi. Jalankan: node ~/yuyu-server.js &' };
  }
}

// ── EXEC STREAM via WebSocket ──────────────────────────────────────────────────
// Live terminal output. onLine(text, stream:'stdout'|'stderr'|'exit') dipanggil tiap ada data.
// Returns promise yang resolve {exitCode, output} saat proses selesai.
export function execStream(command, cwd, onLine, signal) {
  return new Promise((resolve, reject) => {
    let ws;
    try {
      ws = new WebSocket(WS_SERVER);
    } catch(e) {
      reject(new Error('WebSocket tidak tersedia'));
      return;
    }

    const id     = 'exec_' + Date.now();
    let output   = '';
    let settled  = false;

    function cleanup() {
      try { ws.close(); } catch {}
    }

    function done(exitCode) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ exitCode, output });
    }

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'exec_stream', id, command, cwd }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.id !== id) return;
        if (msg.type === 'stdout' || msg.type === 'stderr') {
          output += msg.data;
          onLine?.(msg.data, msg.type);
        } else if (msg.type === 'exit') {
          onLine?.('\n[exit ' + msg.code + ']', 'exit');
          done(msg.code);
        } else if (msg.type === 'error') {
          onLine?.('\n[error: ' + msg.data + ']', 'stderr');
          done(-1);
        }
      } catch {}
    };

    ws.onerror = (e) => {
      if (!settled) {
        settled = true;
        reject(new Error('WebSocket error — streaming exec tidak tersedia'));
      }
    };

    ws.onclose = () => {
      if (!settled) done(-1);
    };

    // Abort support
    if (signal) {
      signal.addEventListener('abort', () => {
        try { ws.send(JSON.stringify({ type: 'kill', id })); } catch {}
        cleanup();
        if (!settled) { settled = true; reject(new DOMException('Aborted', 'AbortError')); }
      }, { once: true });
    }
  });
}

// ── CALL SERVER BATCH (parallel HTTP calls) ────────────────────────────────────
export async function callServerBatch(payloads) {
  return Promise.all(payloads.map(p => callServer(p)));
}
