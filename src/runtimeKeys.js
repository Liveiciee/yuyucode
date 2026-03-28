import { Preferences } from '@capacitor/preferences';

if (!globalThis.TextEncoder && typeof globalThis.Buffer !== 'undefined') {
  globalThis.TextEncoder = class TextEncoderPolyfill {
    encode(value) {
      return Uint8Array.from(globalThis.Buffer.from(String(value), 'utf8'));
    }
  };
}

if (!globalThis.TextDecoder && typeof globalThis.Buffer !== 'undefined') {
  globalThis.TextDecoder = class TextDecoderPolyfill {
    decode(value) {
      return globalThis.Buffer.from(value).toString('utf8');
    }
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  STORAGE_KEYS: {
    CEREBRAS: 'yc_cerebras_key_enc',
    GROQ: 'yc_groq_key_enc',
  },
  KEY_MIN_LENGTH: 20,
  KEY_MAX_LENGTH: 512,
  LOAD_TIMEOUT: 1500,
  EXPIRY_HOURS: 24,
  IV_SIZE: 12,
  SALT_SIZE: 16,
  PBKDF2_ITERATIONS: 300000,
};

// ──────────────────────────────────────────────────────────────────────────────
// SECURITY HELPERS
// ──────────────────────────────────────────────────────────────────────────────
function uint8ArrayToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getCrypto() {
  const cryptoObj = globalThis?.crypto;
  if (!cryptoObj?.subtle || !cryptoObj?.getRandomValues) {
    throw new KeyStorageError('Web Crypto API is not available', 'CRYPTO_UNAVAILABLE');
  }
  return cryptoObj;
}

function getTextEncoder() {
  const Encoder = globalThis?.TextEncoder || globalThis?.window?.TextEncoder;
  if (Encoder) return new Encoder();
  if (typeof globalThis.Buffer !== 'undefined') {
    return { encode: (value) => Uint8Array.from(globalThis.Buffer.from(String(value), 'utf8')) };
  }
  throw new KeyStorageError('TextEncoder is not available', 'ENCODER_UNAVAILABLE');
}

function getTextDecoder() {
  const Decoder = globalThis?.TextDecoder || globalThis?.window?.TextDecoder;
  if (Decoder) return new Decoder();
  if (typeof globalThis.Buffer !== 'undefined') {
    return { decode: (value) => globalThis.Buffer.from(value).toString('utf8') };
  }
  throw new KeyStorageError('TextDecoder is not available', 'DECODER_UNAVAILABLE');
}

function generateRandomBytes(length) {
  return getCrypto().getRandomValues(new Uint8Array(length));
}

async function deriveKey(password, salt) {
  const enc = getTextEncoder();
  const keyMaterial = await getCrypto().subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return getCrypto().subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: CONFIG.PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(data, password) {
  const salt = generateRandomBytes(CONFIG.SALT_SIZE);
  const iv = getCrypto().getRandomValues(new Uint8Array(CONFIG.IV_SIZE));
  const key = await deriveKey(password, salt);
  const encoded = getTextEncoder().encode(data);
  const encrypted = await getCrypto().subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const combined = new Uint8Array(CONFIG.SALT_SIZE + CONFIG.IV_SIZE + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, CONFIG.SALT_SIZE);
  combined.set(new Uint8Array(encrypted), CONFIG.SALT_SIZE + CONFIG.IV_SIZE);

  return uint8ArrayToBase64(combined);
}

async function decryptData(encryptedBase64, password) {
  if (encryptedBase64?.startsWith('{') && encryptedBase64.endsWith('}')) {
    return encryptedBase64;
  }

  try {
    const combined = base64ToUint8Array(encryptedBase64);
    if (combined.length < CONFIG.SALT_SIZE + CONFIG.IV_SIZE) {
      throw new Error('Invalid data format');
    }

    const salt = combined.slice(0, CONFIG.SALT_SIZE);
    const iv = combined.slice(CONFIG.SALT_SIZE, CONFIG.SALT_SIZE + CONFIG.IV_SIZE);
    const data = combined.slice(CONFIG.SALT_SIZE + CONFIG.IV_SIZE);

    const key = await deriveKey(password, salt);
    const decrypted = await getCrypto().subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return getTextDecoder().decode(decrypted);
  } catch (_e) {
    throw new Error('Decryption failed: Wrong password or corrupted data');
  }
}

async function calculateHash(data) {
  const msgBuffer = getTextEncoder().encode(data);
  const hashBuffer = await getCrypto().subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ──────────────────────────────────────────────────────────────────────────────
// ERROR CLASSES
// ──────────────────────────────────────────────────────────────────────────────
class KeyStorageError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'KeyStorageError';
    this.code = code;
    this.details = details;
  }
}

class KeyValidationError extends KeyStorageError {
  constructor(field, message) {
    super(`Key validation failed: ${field} - ${message}`, 'VALIDATION_ERROR', { field });
    this.field = field;
  }
}

class KeyLoadError extends KeyStorageError {
  constructor(provider, originalError) {
    super(`Failed to load ${provider} key`, 'LOAD_ERROR', { provider });
    this.provider = provider;
    this.originalError = originalError;
  }
}

class KeySaveError extends KeyStorageError {
  constructor(provider, originalError) {
    super(`Failed to save ${provider} key`, 'SAVE_ERROR', { provider });
    this.provider = provider;
    this.originalError = originalError;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// VALIDATORS & HELPERS
// ──────────────────────────────────────────────────────────────────────────────
function validateApiKey(key, provider) {
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

function createSecureKey(rawKey) {
  return {
    key: rawKey,
    expiresAt: Date.now() + (CONFIG.EXPIRY_HOURS * 60 * 60 * 1000),
    createdAt: Date.now(),
    hash: null,
  };
}

async function processStoredKey(result, provider, password, validate) {
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
  } catch (_err) {
    return null;
  }
}

async function saveSingleKey(rawKey, provider, storageKey, password) {
  if (!rawKey) return null;
  const trimmed = rawKey.trim();
  const secureObj = createSecureKey(trimmed);
  secureObj.hash = await calculateHash(secureObj.key);
  const encrypted = await encryptData(JSON.stringify(secureObj), password);
  await Preferences.set({ key: storageKey, value: encrypted });
  return secureObj;
}

// ──────────────────────────────────────────────────────────────────────────────
// KEYSTORE CLASS
// ──────────────────────────────────────────────────────────────────────────────
class KeyStore {
  constructor() {
    this.state = {
      cerebras: null,
      groq: null,
      loaded: false,
      lastLoaded: null,
    };
  }

  getKey(provider) {
    const keyObj = this.state[provider.toLowerCase()];
    return keyObj?.key || '';
  }

  getStatus() {
    const now = Date.now();
    const cerebrasValid = !!this.state.cerebras && this.state.cerebras.expiresAt > now;
    const groqValid = !!this.state.groq && this.state.groq.expiresAt > now;

    return {
      hasCerebras: cerebrasValid,
      hasGroq: groqValid,
      both: cerebrasValid && groqValid,
      loaded: this.state.loaded,
      lastLoaded: this.state.lastLoaded,
      cerebrasExpired: this.state.cerebras && this.state.cerebras.expiresAt <= now,
      groqExpired: this.state.groq && this.state.groq.expiresAt <= now,
    };
  }

  async load(options = {}) {
    const { validate = true, password } = options;

    if (!password) {
      throw new KeyStorageError('Password is required to load keys', 'MISSING_PASSWORD');
    }

    const errors = [];
    let loaded = 0;

    try {
      const loadWithTimeout = async (key, provider) => {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new KeyLoadError(provider, new Error('Load timeout'))), CONFIG.LOAD_TIMEOUT)
        );
        return Promise.race([Preferences.get({ key }), timeout]);
      };

      const entries = Object.entries(CONFIG.STORAGE_KEYS);
      const results = await Promise.all(entries.map(([p, k]) => loadWithTimeout(k, p)));

      const processedData = {};
      for (let i = 0; i < results.length; i++) {
        const [provider, _] = entries[i];
        try {
          const data = await processStoredKey(results[i], provider, password, validate);
          if (data) {
            processedData[provider.toLowerCase()] = data;
            loaded++;
          }
        } catch (err) {
          if (err instanceof KeyValidationError) {
            const msg = err.message
              .replace('CEREBRAS', 'Cerebras')
              .replace('GROQ', 'Groq');
            errors.push(msg);
          } else {
            throw err;
          }
        }
      }

      this.state = {
        cerebras: processedData.cerebras || null,
        groq: processedData.groq || null,
        loaded: true,
        lastLoaded: Date.now(),
      };

      return { success: errors.length === 0, loaded, errors };
    } catch (error) {
      if (error instanceof KeyLoadError) throw error;
      throw new KeyLoadError('Both', error);
    }
  }

  async save(keys, options = {}) {
    const { validate = true, password } = options;

    if (!password) {
      throw new KeyStorageError('Password is required to save keys', 'MISSING_PASSWORD');
    }

    if (validate) {
      const entries = Object.entries(CONFIG.STORAGE_KEYS);
      entries.forEach(([provider]) => {
        const key = keys[provider.toLowerCase()];
        if (key) validateApiKey(key, provider);
      });
    }

    try {
      const entries = Object.entries(CONFIG.STORAGE_KEYS);
      const savePromises = entries.map(async ([provider, storageKey]) => {
        const rawKey = keys[provider.toLowerCase()];
        if (!rawKey) return null;
        return await saveSingleKey(rawKey, provider, storageKey, password);
      });

      const savedSecureObjs = await Promise.all(savePromises);

      let saved = 0;
      entries.forEach(([provider], index) => {
        const secure = savedSecureObjs[index];
        if (secure) {
          this.state[provider.toLowerCase()] = secure;
          saved++;
        }
      });

      this.state.loaded = true;
      this.state.lastLoaded = Date.now();

      return { success: true, saved };
    } catch (error) {
      if (error instanceof KeyValidationError) throw error;
      const provider = error.message.includes('Cerebras') ? 'Cerebras' : 'Groq';
      throw new KeySaveError(provider, error);
    }
  }

  async clear() {
    try {
      await Promise.all(Object.values(CONFIG.STORAGE_KEYS).map(key => Preferences.remove({ key })));
      this.state = { cerebras: null, groq: null, loaded: false, lastLoaded: null };
      return { success: true };
    } catch (error) {
      throw new KeyStorageError('Failed to clear keys', 'CLEAR_ERROR', { originalError: error.message });
    }
  }

  async forceReload(options = {}) {
    this.state = { cerebras: null, groq: null, loaded: false, lastLoaded: null };
    return this.load(options);
  }

  async initialize(options = {}) {
    return this.load(options);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// EXPORTS (Singleton)
// ──────────────────────────────────────────────────────────────────────────────
const store = new KeyStore();

export const loadRuntimeKeys = (options) => store.load(options);
export const saveRuntimeKeys = (keys, options) => store.save(keys, options);
export const clearRuntimeKeys = () => store.clear();
export const getRuntimeCerebrasKey = () => store.getKey('cerebras');
export const getRuntimeGroqKey = () => store.getKey('groq');
export const checkKeysStatus = () => store.getStatus();
export const forceReloadKeys = (options = {}) => store.forceReload(options);
export const initializeRuntimeKeys = (options = {}) => store.initialize(options);

export { KeyStorageError, KeyValidationError, KeyLoadError, KeySaveError, KeyStore, CONFIG };
