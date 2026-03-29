import { CONFIG } from '../config.js';
import { getRuntimeGroqKey } from '../../runtimeKeys/index.js';
import { GROQ_KEY } from '../../constants.js';
import { AIError } from '../errors.js';
import { injectVisionImage } from '../../utils.js';
import { makeAIRequest } from './base.js';

function getGroqKey() {
  const key = getRuntimeGroqKey() || GROQ_KEY || '';
  if (!key || key.includes('your_') || key.includes('placeholder')) {
    if (CONFIG.ENV.isDev) {
      console.warn('[WARN] Groq API key not properly configured');
    }
    return '';
  }
  return key;
}

export async function groqRequest(messages, model, onChunk, signal, options) {
  const apiKey = getGroqKey();
  if (!apiKey) {
    throw new AIError('Groq API key not configured', 'AUTH_ERROR', { provider: 'groq' });
  }

  const processedMessages = injectVisionImage(messages, options?.imageBase64, options?.imageMimeType);

  return makeAIRequest({
    url: options?.altUrl ? CONFIG.API.GROQ_ALT_URL : CONFIG.API.GROQ_URL,
    apiKey,
    provider: 'Groq',
    messages: processedMessages,
    model,
    onChunk,
    signal,
    options: {
      ...options,
      maxTokens: options.maxTokens ?? CONFIG.AI.MAX_TOKENS.groq,
    },
    useCache: options?.useCache ?? true,
  });
}
