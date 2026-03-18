import { CEREBRAS_KEY, YUYU_SERVER } from './constants.js';

export async function askCerebrasStream(messages, model, onChunk, signal, options = {}) {
  // Inject vision image ke pesan user terakhir jika ada
  let finalMessages = messages;
  if (options.imageBase64) {
    finalMessages = messages.map((m, i) => {
      if (i === messages.length - 1 && m.role === 'user') {
        return {
          ...m,
          content: [
            { type: 'text', text: typeof m.content === 'string' ? m.content : '' },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + options.imageBase64 } },
          ],
        };
      }
      return m;
    });
  }

  const resp = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST', signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CEREBRAS_KEY,
    },
    body: JSON.stringify({ model, messages: finalMessages, max_tokens: options.maxTokens || 1500, stream: true }),
  });
  if (resp.status === 429) {
    const retry = parseInt(resp.headers.get('retry-after') || '60');
    throw new Error('RATE_LIMIT:' + retry);
  }
  if (!resp.ok) throw new Error('Cerebras error: HTTP ' + resp.status);
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split('\n')) {
      if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
      try {
        const d = JSON.parse(line.slice(6)).choices[0].delta.content || '';
        full += d;
        onChunk(full);
      } catch {}
    }
  }
  return full;
}



export async function callServer(payload) {
  try {
    const resp = await fetch(YUYU_SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await resp.json();
  } catch (_e) {
    return { ok: false, data: 'YuyuServer tidak aktif. Jalankan: node ~/yuyu-server.js' };
  }
}
