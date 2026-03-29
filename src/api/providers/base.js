import { logger } from '../../utils.js';
import { CONFIG, MODELS } from '../config.js';
import { AIError, RateLimitError, ServerError, TimeoutError, ValidationError } from '../errors.js';
import { validateMessages, validateApiKey, getMaxTokensForModel } from '../validators.js';
import { getCircuitBreaker } from '../circuitBreaker.js';
import { responseCache } from '../cache.js';

async function readSSEStream(response, onChunk, signal, timeoutMs = 30000) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  let lastChunkTime = Date.now();

  const timeoutChecker = setInterval(() => {
    if (Date.now() - lastChunkTime > timeoutMs && fullContent) {
      logger.warn?.('SSE stream timeout, no data received');
    }
  }, 5000);

  try {
    while (true) {
      let done, value;
      try {
        ({ done, value } = await reader.read());
        lastChunkTime = Date.now();
      } catch (_readError) {
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        break;
      }
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const rawLine of lines) {
        const line = rawLine.trimEnd();
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trimStart();
        if (payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload);
          const content = json.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk?.(fullContent);
          }
        } catch (parseError) {
          if (CONFIG.ENV.isDev) {
            logger.debug?.('SSE parse error:', parseError.message);
          }
        }
      }
    }

    const finalLine = buffer.trimEnd();
    if (finalLine.startsWith('data:')) {
      const payload = finalLine.slice(5).trimStart();
      if (payload !== '[DONE]') {
        try {
          const json = JSON.parse(payload);
          const content = json.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk?.(fullContent);
          }
        } catch (parseError) {
          if (CONFIG.ENV.isDev) {
            logger.debug?.('SSE final parse error:', parseError.message);
          }
        }
      }
    }
  } finally {
    clearInterval(timeoutChecker);
    try { reader.releaseLock(); } catch (_e) { /* ignore */ }
  }

  return fullContent;
}

export async function makeAIRequest({
  url, apiKey, provider, messages, model, onChunk, signal, options = {}, useCache = true,
}) {
  validateMessages(messages);
  validateApiKey(apiKey, provider);

  const cacheKey = useCache ? responseCache.getKey(messages, model, options) : null;
  if (cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached) {
      logger.debug?.(`Cache hit for ${provider} request`);
      onChunk?.(cached);
      return cached;
    }
  }

  const breaker = getCircuitBreaker(provider);

  return breaker.call(async () => {
    const controller = new AbortController();
    const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, options.timeoutMs || CONFIG.AI.REQUEST_TIMEOUT);

    const maxTokens = options.maxTokens || getMaxTokensForModel(model, MODELS, CONFIG);
    const temperature = options.temperature ?? CONFIG.AI.DEFAULT_TEMPERATURE;
    const topP = options.topP ?? CONFIG.AI.DEFAULT_TOP_P;

    const requestBody = {
      model,
      messages,
      max_tokens: maxTokens,
      stream: true,
      temperature,
      top_p: topP,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
    };

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        signal: combinedSignal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'User-Agent': 'YuyuCode/5.0.0',
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError') {
        throw new TimeoutError(provider, options.timeoutMs || CONFIG.AI.REQUEST_TIMEOUT);
      }
      throw new AIError(`${provider} network error`, 'NETWORK_ERROR', {
        provider,
        message: error?.message || 'Unknown network error',
      });
    }

    clearTimeout(timeoutId);

    if (!response || typeof response.status !== 'number') {
      throw new AIError(`${provider} invalid response`, 'INVALID_RESPONSE', { provider });
    }

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
      throw new RateLimitError(retryAfter, provider);
    }

    if (response.status >= 500) {
      throw new ServerError(provider, response.status);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new AIError(`${provider} error: HTTP ${response.status}`, 'HTTP_ERROR', {
        statusCode: response.status,
        details: errorText.slice(0, 500),
      });
    }

    const result = await readSSEStream(response, onChunk, signal);

    if (cacheKey && result) {
      responseCache.set(cacheKey, result);
    }

    return result;
  });
}
