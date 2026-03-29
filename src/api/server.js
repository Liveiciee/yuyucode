import { logger } from '../utils.js';
import { CONFIG } from './config.js';
import { YUYU_SERVER } from '../constants.js';
import { sleep, getBackoffDelay } from '../utils.js';

export async function callServer(payload, retries = 2) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.SERVER.REQUEST_TIMEOUT);

      const response = await fetch(YUYU_SERVER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        logger.warn?.(`Server error ${response.status}: ${errorText.slice(0, 200)}`);

        if (attempt < retries && response.status >= 500) {
          await sleep(getBackoffDelay(attempt));
          continue;
        }

        return { ok: false, data: `Server error: ${response.status} — ${errorText.slice(0, 200)}` };
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (error.name === 'AbortError') {
        logger.error?.('Request timeout', { payload: payload.type });
        return { ok: false, data: 'Request timeout. Server may be busy.' };
      }

      if (attempt < retries) {
        await sleep(getBackoffDelay(attempt));
        continue;
      }
    }
  }

  logger.error?.('Server unreachable after retries', lastError);
  return {
    ok: false,
    data: 'YuyuServer tidak dapat dihubungi. Jalankan: node yuyu-server.cjs &',
  };
}

export async function callServerBatch(payloads, concurrency = 3) {
  const results = [];
  for (let i = 0; i < payloads.length; i += concurrency) {
    const batch = payloads.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(payload => callServer(payload)));
    results.push(...batchResults);
  }
  return results;
}

export async function healthCheck() {
  const results = {
    server: { available: false, latency: null, error: null },
    timestamp: Date.now(),
  };

  const serverStart = Date.now();
  try {
    const response = await fetch(`${YUYU_SERVER}/health`, { signal: AbortSignal.timeout(2000) });
    results.server.available = response.ok;
    results.server.latency = Date.now() - serverStart;
  } catch (error) {
    results.server.error = error.message;
  }

  return results;
}
