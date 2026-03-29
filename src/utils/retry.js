// src/utils/retry.js
import { CONFIG } from '../api/config.js';

// ── Existing exports (unchanged) ──────────────────────────────────────────────

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getBackoffDelay = (attempt, withJitter = true) => {
  const delay       = CONFIG.RETRY.BASE_DELAY_MS * Math.pow(2, attempt);
  const cappedDelay = Math.min(delay, CONFIG.RETRY.MAX_DELAY_MS);
  if (!withJitter) return cappedDelay;
  const jitter = (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296) * CONFIG.RETRY.JITTER_MAX_MS;
  return cappedDelay + jitter;
};

export const isRetryableError = (error) => {
  if (error?.code && CONFIG.RETRY.RETRYABLE_CODES.includes(error.code)) return true;
  if (error?.message?.includes('network') || error?.message?.includes('timeout')) return true;
  return false;
};

export const isRetryableStatus = (statusCode) => {
  return CONFIG.RETRY.RETRYABLE_STATUSES.includes(statusCode);
};

// ── New: actual retry loop ────────────────────────────────────────────────────

/**
 * Retry an async function with exponential backoff + jitter.
 *
 * Replaces the manual retry loops scattered across server.js and
 * orchestrator.js. Drop-in usage:
 *
 *   const result = await withRetry(() => callApi(...), {
 *     maxAttempts: 3,
 *     onRetry: (err, attempt, delay) => logger.warn(`Retry ${attempt+1} in ${delay}ms:`, err.message),
 *   });
 *
 * @template T
 * @param {(attempt: number) => Promise<T>} fn  - Async function to retry. Receives current attempt (0-based).
 * @param {object}  [opts]
 * @param {number}  [opts.maxAttempts]            - Max total attempts. Default: CONFIG.RETRY.MAX_ATTEMPTS
 * @param {(err: Error, attempt: number) => boolean} [opts.shouldRetry]  - Return false to stop early
 * @param {(err: Error, attempt: number, delay: number) => void} [opts.onRetry]  - Called before each retry
 * @param {boolean} [opts.withJitter=true]
 * @returns {Promise<T>}
 */
export async function withRetry(fn, opts = {}) {
  const maxAttempts = opts.maxAttempts ?? CONFIG.RETRY.MAX_ATTEMPTS ?? 3;
  const shouldRetry = opts.shouldRetry ?? isRetryableError;
  const withJitter  = opts.withJitter  ?? true;

  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      const isLast = attempt === maxAttempts - 1;
      if (isLast || !shouldRetry(err, attempt)) throw err;
      const delay = getBackoffDelay(attempt, withJitter);
      opts.onRetry?.(err, attempt, delay);
      await sleep(delay);
    }
  }
  throw lastError;
}

/**
 * Retry based on HTTP response status.
 * Wraps fetch-style calls that return a Response-like object.
 *
 * Throws if the final response is still a retryable status after
 * all attempts are exhausted.
 *
 *   const res = await withRetryOnStatus(() => fetch(url, opts));
 *
 * @param {(attempt: number) => Promise<{status: number}>} fn
 * @param {object} [opts] - Same options as withRetry
 * @returns {Promise<{status: number}>} Final successful response
 */
export async function withRetryOnStatus(fn, opts = {}) {
  return withRetry(
    async (attempt) => {
      const response = await fn(attempt);
      if (isRetryableStatus(response.status)) {
        const err = Object.assign(new Error(`HTTP ${response.status}`), { status: response.status, response });
        throw err;
      }
      return response;
    },
    {
      ...opts,
      shouldRetry: (err) =>
        err.status != null ? isRetryableStatus(err.status) : isRetryableError(err),
    }
  );
}
