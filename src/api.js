import { CEREBRAS_KEY, YUYU_SERVER } from './constants.js';

export async function askCerebrasStream(messages, model, onChunk, signal, options = {}) {
  // Validasi input minimal
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages must be a non-empty array');
  }

  // Inject vision image ke pesan user terakhir jika ada
  let finalMessages = messages;
  if (options.imageBase64 && typeof options.imageBase64 === 'string') {
    finalMessages = messages.map((m, i) => {
      if (i === messages.length - 1 && m.role === 'user') {
        const textContent = typeof m.content === 'string' ? m.content :
                             Array.isArray(m.content) ? m.content.filter(c => c.type === 'text').map(c => c.text).join(' ') :
                             '';
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
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CEREBRAS_KEY,
    },
    body: JSON.stringify({
      model,
      messages: finalMessages,
      max_tokens: options.maxTokens || 1500,
      stream: true
    }),
  });

  if (resp.status === 429) {
    const retry = parseInt(resp.headers.get('retry-after') || '60', 10);
    throw new Error(`RATE_LIMIT:${retry}`);
  }

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Cerebras error: HTTP ${resp.status} - ${errText}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  try {
    while (true) {
      let done, value;
      try {
        ({ done, value } = await reader.read());
      } catch (readErr) {
        // Stream bisa terputus saat AbortController di-cancel — bukan error fatal
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        console.warn('Stream read error:', readErr);
        break;
      }

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop(); // Simpan sisa yang belum penuh

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        if (line === 'data: [DONE]') continue;

        try {
          const parsed = JSON.parse(line.slice(6));
          const content = parsed.choices?.[0]?.delta?.content || '';
          full += content;
          onChunk(full);
        } catch (e) {
          console.warn('Failed to parse stream chunk:', e, 'line:', line);
        }
      }
    }

    // Flush sisa buffer jika ada
    if (buffer.length > 0) {
      try {
        if (buffer.startsWith('data: ') && buffer !== 'data: [DONE]') {
          const parsed = JSON.parse(buffer.slice(6));
          const content = parsed.choices?.[0]?.delta?.content || '';
          full += content;
          onChunk(full);
        }
      } catch (e) {
        console.warn('Failed to parse final buffer:', e, 'buffer:', buffer);
      }
    }
  } finally {
    // Selalu release lock — cegah ReadableStream locked error di request berikutnya
    try { reader.releaseLock(); } catch {}
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

    if (!resp.ok) {
      const err = await resp.text();
      console.warn('Server error response:', err);
      return { ok: false, data: `Server error: ${resp.status}` };
    }

    return await resp.json();
  } catch (e) {
    console.error('Network error when calling YuyuServer:', e);
    return { ok: false, data: 'YuyuServer tidak dapat dihubungi. Pastikan server sedang berjalan.' };
  }
}
