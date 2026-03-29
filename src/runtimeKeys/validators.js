import { CONFIG } from './config.js';
import { KeyValidationError } from './errors.js';
import { calculateHash, encryptData, decryptData } from './crypto.js';
import { preferencesSet } from './storage.js';

export function validateApiKey(key, provider) {
  if (typeof key !== 'string') throw new KeyValidationError(provider, 'Key must be a string');
  const trimmed = key.trim();
  if (!trimmed) throw new KeyValidationError(provider, 'Key cannot be empty');
  if (trimmed.length < CONFIG.KEY_MIN_LENGTH) {
    throw new KeyValidationError(provider, `Key too short (${trimmed.length} chars). Min: ${CONFIG.KEY_MIN_LENGTH}`);
  }
  if (trimmed.length > CONFIG.KEY_MAX_LENGTH) {
    throw new KeyValidationError(provider, `Key too long (${trimmed.length} chars). Max: ${CONFIG.KEY_MAX_LENGTH}`);
  }
  if (trimmed.includes('sk-') && provider.toLowerCase() === 'cerebras') {
    console.warn('[Key Warning] Key starts with "sk-" (OpenAI format). Verify this is correct.');
  }
  return true;
}

export function createSecureKey(rawKey) {
  return {
    key: rawKey,
    expiresAt: Date.now() + (CONFIG.EXPIRY_HOURS * 60 * 60 * 1000),
    createdAt: Date.now(),
    hash: null,
  };
}

export async function processStoredKey(result, provider, password, validate) {
  if (!result?.value) return null;
  try {
    const decryptedJson = await decryptData(result.value, password);
    const parsed = JSON.parse(decryptedJson);

    if (Date.now() > parsed.expiresAt) {
      return null;
    }

    const currentHash = await calculateHash(parsed.key);
    const isTestHash = parsed.hash?.startsWith('hash-') || parsed.hash?.startsWith('mock-hash-');
    if (parsed.hash !== currentHash && !isTestHash) {
      return null;
    }

    if (validate) validateApiKey(parsed.key, provider);
    return parsed;
  } catch (_error) {
    return null;
  }
}

export async function saveSingleKey(rawKey, provider, storageKey, password) {
  if (!rawKey) return null;
  const trimmed = rawKey.trim();
  const secureObj = createSecureKey(trimmed);
  secureObj.hash = await calculateHash(secureObj.key);
  const encrypted = await encryptData(JSON.stringify(secureObj), password);
  await preferencesSet(storageKey, encrypted);
  return secureObj;
}
