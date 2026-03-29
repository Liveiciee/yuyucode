import { CONFIG } from '../config.js';
import { getRuntimeCerebrasKey } from '../../runtimeKeys.js';
import { CEREBRAS_KEY } from '../../constants.js';
import { AIError } from '../errors.js';
import { injectVisionImage } from '../../utils.js';
import { makeAIRequest } from './base.js';

export function getCerebrasKey() {
  const key = getRuntimeCerebrasKey() || CEREBRAS_KEY || '';
  if (!key || key.includes('your_') || key.includes('placeholder')) {
    if (CONFIG.ENV.isDev) {
      console.warn('[WARN] Cerebras API key not properly configured');
    }
    return '';
  }
  return key;
}

export async function cerebrasRequest(messages, model, onChunk, signal, options) {
  const apiKey = getCerebrasKey();
  if (!apiKey) {
    throw new AIError('Cerebras API key not configured', 'AUTH_ERROR', { provider: 'cerebras' });
  }

  const processedMessages = injectVisionImage(messages, options?.imageBase64, options?.imageMimeType);

  return makeAIRequest({
    url: options?.altUrl ? CONFIG.API.CEREBRAS_ALT_URL : CONFIG.API.CEREBRAS_URL,
    apiKey,
    provider: 'Cerebras',
    messages: processedMessages,
    model,
    onChunk,
    signal,
    options: {
      ...options,
      maxTokens: options.maxTokens ?? CONFIG.AI.MAX_TOKENS.cerebras,
    },
    useCache: options?.useCache ?? true,
  });
}
