const makeSSEBody = (text) => new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({choices:[{delta:{content:text}}]})}

`)); controller.close(); } });
// @vitest-environment node
// api.branch.test.js — condition branch coverage untuk api.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./constants.js', () => ({
  CEREBRAS_KEY:  'test-cerebras-key',
  GROQ_KEY:      'test-groq-key',
  YUYU_SERVER:   'http://localhost:8765',
  WS_SERVER:     'ws://localhost:8766',
  MODELS:        [
    { id: 'qwen-cerebras', provider: 'cerebras' },
    { id: 'kimi-groq',     provider: 'groq' },
  ],
  FALLBACK_MODEL: 'kimi-groq',
}));

import { readSSEStream, askCerebrasStream } from './api.js';

function makeChunk(content) {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n`;
}

function makeSseResponse(chunks) {
  const lines = Array.isArray(chunks) ? chunks : [chunks];
  const text = lines.join('') + 'data: [DONE]\n';
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  let pos = 0;
  const stream = new ReadableStream({
    pull(ctrl) {
      if (pos < encoded.length) { ctrl.enqueue(encoded.slice(pos, pos + 50)); pos += 50; }
      else ctrl.close();
    },
  });
  return {
    ok: true, status: 200,
    headers: new Headers({ 'retry-after': '30' }),
    body: stream,
    text: async () => '',
  };
}

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.restoreAllMocks(); });

// ── readSSEStream — _readErr when NOT aborted ─────────────────────────────────
describe('readSSEStream — _readErr non-abort', () => {
  it('breaks loop on read error when signal not aborted', async () => {
    const reader = {
      read: vi.fn().mockRejectedValue(new Error('network reset')),
      releaseLock: vi.fn(),
    };
    const resp = { body: { getReader: () => reader } };
    const result = await readSSEStream(resp, () => {}, new AbortController().signal);
    expect(result).toBe('');
  });
});

// ── readSSEStream — flush buffer ──────────────────────────────────────────────
describe('readSSEStream — buffer flush', () => {
  it('flushes remaining buffer that starts with data:', async () => {
    const chunk = makeChunk('hello');
    const encoder = new TextEncoder();
    const encoded = encoder.encode(chunk.trimEnd());
    let done = false;
    const stream = new ReadableStream({
      pull(ctrl) {
        if (!done) { done = true; ctrl.enqueue(encoded); }
        else ctrl.close();
      },
    });
    const resp = { ok: true, status: 200, body: stream, headers: new Headers() };
    const result = await readSSEStream(resp, () => {}, new AbortController().signal);
    expect(result).toBe('hello');
  });
});

// ── injectVision — content is array ──────────────────────────────────────────
describe('askCerebrasStream — injectVision content array', () => {
  it('handles array content in last user message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(makeSseResponse(makeChunk('ok')));
    await askCerebrasStream(
      [{ role: 'user', content: [{ type: 'text', text: 'describe this' }] }],
      'qwen-cerebras', () => {}, new AbortController().signal,
      { imageBase64: 'base64data' }
    );
    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    const lastMsg = body.messages[body.messages.length - 1];
    expect(Array.isArray(lastMsg.content)).toBe(true);
    expect(lastMsg.content.some(c => c.type === 'image_url')).toBe(true);
  });

  it('handles null content (empty string fallback)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(makeSseResponse(makeChunk('ok')));
    await askCerebrasStream(
      [{ role: 'user', content: null }],
      'qwen-cerebras', () => {}, new AbortController().signal,
      { imageBase64: 'base64data' }
    );
    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    const lastMsg = body.messages[body.messages.length - 1];
    expect(Array.isArray(lastMsg.content)).toBe(true);
  });
});

// ── injectVision — non-last message not modified ─────────────────────────────
describe('askCerebrasStream — injectVision skips non-last', () => {
  it('leaves earlier messages unchanged when imageBase64 set', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(makeSseResponse(makeChunk('ok')));
    await askCerebrasStream(
      [
        { role: 'user',      content: 'first message' },
        { role: 'assistant', content: 'reply' },
        { role: 'user',      content: 'last message' },
      ],
      'qwen-cerebras', () => {}, new AbortController().signal,
      { imageBase64: 'base64' }
    );
    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(body.messages[0].content).toBe('first message');
    expect(Array.isArray(body.messages[2].content)).toBe(true);
  });
});

// ── Groq model — 5xx retry ────────────────────────────────────────────────────
describe('askCerebrasStream — Groq 5xx retry', () => {
  it('retries Groq model on GROQ_SERVER error up to 2 times', async () => {
    vi.useFakeTimers();
    let calls = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      calls++;
      if (calls < 3) return Promise.resolve({ ok: false, status: 503, headers: new Headers(), text: async () => 'server error' });
      return Promise.resolve(makeSseResponse(makeChunk('ok')));
    });
    const p = askCerebrasStream(
      [{ role: 'user', content: 'hi' }],
      'kimi-groq', () => {}, new AbortController().signal, {}
    );
    await vi.runAllTimersAsync();
    const result = await p;
    expect(result).toBe('ok');
    expect(calls).toBe(3);
    vi.useRealTimers();
  });
});

// ── Groq model — AbortError propagates ───────────────────────────────────────
describe('askCerebrasStream — Groq AbortError propagates', () => {
  it('throws AbortError without retry for Groq model', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(
      new DOMException('Aborted', 'AbortError')
    );
    // DOMException message = 'Aborted', name = 'AbortError'
    await expect(
      askCerebrasStream(
        [{ role: 'user', content: 'hi' }],
        'kimi-groq', () => {}, new AbortController().signal, {}
      )
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});

// ── Groq model — RATE_LIMIT propagates ───────────────────────────────────────
describe('askCerebrasStream — Groq RATE_LIMIT propagates', () => {
  it('throws RATE_LIMIT for Groq model', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 429,
      headers: new Headers({ 'retry-after': '30' }),
      text: async () => '',
    });
    await expect(
      askCerebrasStream(
        [{ role: 'user', content: 'hi' }],
        'kimi-groq', () => {}, new AbortController().signal, {}
      )
    ).rejects.toThrow('RATE_LIMIT');
  });
});

// ── Both Cerebras and Groq rate limit → throw original ───────────────────────
describe('askCerebrasStream — both rate limit', () => {
  it('throws original Cerebras RATE_LIMIT when Groq also fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 429,
      headers: new Headers({ 'retry-after': '60' }),
      text: async () => '',
    });
    await expect(
      askCerebrasStream(
        [{ role: 'user', content: 'hi' }],
        'qwen-cerebras', () => {}, new AbortController().signal, {}
      )
    ).rejects.toThrow('RATE_LIMIT:60');
  });
});

// ── Groq AbortError during Cerebras fallback ──────────────────────────────────
describe('askCerebrasStream — Groq AbortError in fallback', () => {
  it('throws when Groq fallback is aborted', async () => {
    let calls = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      calls++;
      if (calls === 1) return Promise.resolve({
        ok: false, status: 429,
        headers: new Headers({ 'retry-after': '60' }),
        text: async () => '',
      });
      return Promise.reject(new DOMException('Aborted', 'AbortError'));
    });
    await expect(
      askCerebrasStream(
        [{ role: 'user', content: 'hi' }],
        'qwen-cerebras', () => {}, new AbortController().signal, {}
      )
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});

// ── Cerebras fetch network error → retry ─────────────────────────────────────
describe('askCerebrasStream — fetch network error retry', () => {
  it('retries on fetch network error', async () => {
    vi.useFakeTimers();
    let calls = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      calls++;
      if (calls < 2) return Promise.reject(new Error('fetch failed'));
      return Promise.resolve(makeSseResponse(makeChunk('recovered')));
    });
    const p = askCerebrasStream(
      [{ role: 'user', content: 'hi' }],
      'qwen-cerebras', () => {}, new AbortController().signal, {}
    );
    await vi.runAllTimersAsync();
    const result = await p;
    expect(result).toBe('recovered');
    vi.useRealTimers();
  });
});

// ── Cerebras 401 → throw immediately ─────────────────────────────────────────
describe('askCerebrasStream — Cerebras non-ok non-rate-limit', () => {
  it('throws immediately on 401 unauthorized', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 401,
      headers: new Headers(),
      text: async () => 'unauthorized',
    });
    await expect(
      askCerebrasStream(
        [{ role: 'user', content: 'hi' }],
        'qwen-cerebras', () => {}, new AbortController().signal, {}
      )
    ).rejects.toThrow('Cerebras error: HTTP 401');
  });
});


// ── Additional branch coverage ────────────────────────────────────────────────
describe('askCerebrasStream — Groq server retry', () => {
  it('retries on GROQ_SERVER error up to 2 times', async () => {
    const { askCerebrasStream } = await import('./api.js');
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'server error' })
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'server error' })
      .mockResolvedValueOnce({ ok: true, status: 200, body: makeSSEBody('ok') });
    global.fetch = mockFetch;
    const result = await askCerebrasStream(
      [{ role: 'user', content: 'hi' }],
      'moonshotai/kimi-k2-instruct-0905',
      () => {}, null, {}
    );
    expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});

describe('askCerebrasStream — empty messages guard', () => {
  it('throws on empty messages array', async () => {
    const { askCerebrasStream } = await import('./api.js');
    await expect(askCerebrasStream([], 'llama3.1-8b', () => {}, null))
      .rejects.toThrow('non-empty array');
  });

  it('throws on non-array messages', async () => {
    const { askCerebrasStream } = await import('./api.js');
    await expect(askCerebrasStream(null, 'llama3.1-8b', () => {}, null))
      .rejects.toThrow('non-empty array');
  });
});

describe('askCerebrasStream — Groq non-rate-limit error stops chain', () => {
  it('stops fallback chain on auth error', async () => {
    const { askCerebrasStream } = await import('./api.js');
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 429, headers: { get: () => '1' } }) // Cerebras rate limit
      .mockResolvedValueOnce({ ok: false, status: 401, text: async () => 'unauthorized' }); // Groq auth fail
    await expect(
      askCerebrasStream([{ role: 'user', content: 'hi' }], 'llama3.1-8b', () => {}, null, {})
    ).rejects.toThrow();
  });
});
