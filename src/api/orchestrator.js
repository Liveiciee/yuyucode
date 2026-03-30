import { logger } from '../utils.js';
import { CONFIG, MODELS } from './config.js';
import { AIError, RateLimitError, ServerError } from './errors.js';
import { validateMessages, hasUsableApiKey, getProviderForModel } from './validators.js';
import { sleep, getBackoffDelay, isRetryableError } from '../utils.js';

async function tryGroqFallbackChain(messages, onChunk, signal, options, attemptedModels = []) {
  for (const fallbackModel of CONFIG.GROQ_FALLBACK_CHAIN) {
    if (attemptedModels.includes(fallbackModel)) continue;
    try {
      options?.onFallback?.(fallbackModel);
      logger.info?.(`Attempting fallback to ${fallbackModel}`);
      return await groqRequest(messages, fallbackModel, onChunk, signal, options);
    } catch (error) {
      attemptedModels.push(fallbackModel);
      if (error.name === 'AbortError') throw error;
      if (error.code === 'RATE_LIMIT' || error.code === 'SERVER_ERROR') {
        logger.debug?.(`Fallback model ${fallbackModel} failed: ${error.code}, trying next...`);
        await sleep(getBackoffDelay(attemptedModels.length, false));
        continue;
      }
      throw error;
    }
  }
  return null;
}

async function tryAlternateProvider(messages, currentProvider, onChunk, signal, options) {
  const altProvider = currentProvider === 'cerebras' ? 'groq' : 'cerebras';
  const altModels = MODELS.filter(m => m.provider === altProvider);
  for (const model of altModels) {
    try {
      logger.info?.(`Attempting alternate provider ${altProvider} with ${model.id}`);
      if (altProvider === 'cerebras') {
        return await cerebrasRequest(messages, model.id, onChunk, signal, options);
      } else {
        return await groqRequest(messages, model.id, onChunk, signal, options);
      }
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      logger.debug?.(`Alternate provider ${altProvider} with ${model.id} failed: ${error.code}`);
      continue;
    }
  }
  return null;
}

export async function askAIStream(messages, model, onChunk, signal, options = {}) {
  const startTime = Date.now();
  validateMessages(messages);

  const modelDef = MODELS.find(m => m.id === model);
  const provider = modelDef?.provider || getProviderForModel(model, MODELS) || 'cerebras';

  logger.info?.(`AI Request: provider=${provider}, model=${model}, messages=${messages.length}, attempt=${options._attempt || 0}`);

  const providerRequest = async () => {
    if (provider === 'groq') {
      return await groqRequest(messages, model, onChunk, signal, options);
    }
    return await cerebrasRequest(messages, model, onChunk, signal, options);
  };

  try {
    const result = await providerRequest();
    const duration = Date.now() - startTime;
    logger.info?.(`AI Request successful: ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.debug?.(`AI Request failed: ${error.code}, duration=${duration}ms`);

    if (error.name === 'AbortError') throw error;

    // Rate limit fallback chain for Cerebras
    if (error.code === 'RATE_LIMIT' && provider === 'cerebras') {
      const groqKey = (await import('./providers/groq.js')).getGroqKey?.() || '';
      if (hasUsableApiKey(groqKey)) {
        try {
          const fallbackResult = await tryGroqFallbackChain(messages, onChunk, signal, options);
          if (fallbackResult !== null) {
            logger.info?.('Cerebras rate limited, using Groq fallback chain');
            return fallbackResult;
          }
        } catch (fallbackError) {
          if (fallbackError?.name === 'AbortError') throw fallbackError;
          logger.debug?.('Groq fallback chain failed:', fallbackError?.code);
        }
      }
    }

    // Alternate provider for server errors
    if (error.code === 'SERVER_ERROR') {
      const altProvider = provider === 'cerebras' ? 'groq' : 'cerebras';
      const altKey = altProvider === 'cerebras'
        ? (await import('./providers/cerebras.js')).getCerebrasKey?.() || ''
        : (await import('./providers/groq.js')).getGroqKey?.() || '';
      if (hasUsableApiKey(altKey)) {
        try {
          const altResult = await tryAlternateProvider(messages, provider, onChunk, signal, options);
          if (altResult !== null) {
            logger.info?.(`Switched to alternate provider due to ${error.code}`);
            return altResult;
          }
        } catch (altError) {
          logger.debug?.('Alternate provider failed:', altError?.code);
        }
      }
    }

    // Exponential backoff retry
    if (isRetryableError(error) && (options._attempt ?? 0) < CONFIG.RETRY.MAX_ATTEMPTS) {
      const attempt = options._attempt ?? 0;
      const delay = getBackoffDelay(attempt, true);
      logger.debug?.(`Retrying ${provider} request in ${delay}ms (attempt ${attempt + 1}/${CONFIG.RETRY.MAX_ATTEMPTS})`);
      await sleep(delay);
      return askAIStream(messages, model, onChunk, signal, { ...options, _attempt: attempt + 1 });
    }

    throw error;
  }
}

export async function askAIWithFallback(messages, model, onChunk, signal, options = {}) {
  const { cerebrasKey, groqKey } = options;

  if (cerebrasKey && hasUsableApiKey(cerebrasKey)) {
    try {
      return await askAIStream(messages, model, onChunk, signal, options);
    } catch (error) {
      if (error.code === 'RATE_LIMIT' && hasUsableApiKey(groqKey)) {
        logger.info?.('Rate limit hit, falling back to Groq');
        const fallbackModel = MODELS.find(m => m.provider === 'groq')?.id || 'mixtral-8x7b-32768';
        return await askAIStream(messages, fallbackModel, onChunk, signal, { ...options, apiKey: groqKey });
      }
      throw error;
    }
  }

  if (hasUsableApiKey(groqKey)) {
    const fallbackModel = MODELS.find(m => m.provider === 'groq')?.id || 'mixtral-8x7b-32768';
    return await askAIStream(messages, fallbackModel, onChunk, signal, options);
  }

  throw new AIError('No valid API key configured', 'AUTH_ERROR');
}
