import { ValidationError } from './errors.js';
import { CONFIG } from './config.js';

export function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    throw new ValidationError('messages', 'Must be an array');
  }
  if (messages.length === 0) {
    throw new ValidationError('messages', 'Cannot be empty');
  }
  if (messages.length > 100) {
    throw new ValidationError('messages', `Too many messages: ${messages.length} > 100`);
  }

  let totalChars = 0;
  for (const [idx, msg] of messages.entries()) {
    if (!msg.role || !['system', 'user', 'assistant'].includes(msg.role)) {
      throw new ValidationError(`messages[${idx}]`, `Invalid role: ${msg.role}`);
    }
    if (!msg.content && msg.content !== '') {
      throw new ValidationError(`messages[${idx}]`, 'Missing content');
    }
    if (typeof msg.content === 'string') {
      totalChars += msg.content.length;
    } else if (Array.isArray(msg.content)) {
      totalChars += JSON.stringify(msg.content).length;
    }
    if (msg.content?.length > 100000) {
      throw new ValidationError(`messages[${idx}]`, 'Content too large (>100k chars)');
    }
  }

  if (totalChars > 500000) {
    throw new ValidationError('messages', `Total content too large: ${totalChars} chars`);
  }

  return true;
}

export function validateApiKey(key, provider) {
  const normalized = typeof key === 'string' ? key.trim() : '';
  if (!normalized) {
    throw new ValidationError('apiKey', `${provider} API key is required`);
  }
  if (normalized.length < 20) {
    throw new ValidationError('apiKey', `${provider} API key too short (${normalized.length} chars)`);
  }
  if (/^your[_-\s]/i.test(normalized) || /placeholder|example/i.test(normalized)) {
    throw new ValidationError('apiKey', `${provider} API key is not configured (using placeholder)`);
  }
  return true;
}

export function hasUsableApiKey(key) {
  if (typeof key !== 'string') return false;
  const normalized = key.trim();
  return !!normalized && normalized.length >= 20 &&
    !/^your[_-\s]/i.test(normalized) &&
    !/placeholder|example/i.test(normalized);
}

export function getProviderForModel(modelId, MODELS) {
  const model = MODELS.find(m => m.id === modelId);
  return model?.provider || 'cerebras';
}

export function getMaxTokensForModel(modelId, MODELS, CONFIG) {
  const model = MODELS.find(m => m.id === modelId);
  if (model?.contextWindow) {
    return Math.min(CONFIG.AI.MAX_TOKENS.default, model.contextWindow - 100);
  }
  return CONFIG.AI.MAX_TOKENS.default;
}
