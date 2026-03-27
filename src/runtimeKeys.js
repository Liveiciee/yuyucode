// ============================================================
// FILE: src/runtimeKeys.js
// Runtime Key Store - GOD MODE (Encrypted + Expiry + Integrity)
// ============================================================
// Features Added:
// - AES-GCM Encryption (Native Web Crypto API)
// - SHA-256 Integrity Check
// - Auto-Expiry (24 hours default)
// - No external dependencies!
// ============================================================

import { Preferences } from '@capacitor/preferences';

// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────────────────────────────────────
const CONFIG = Object.freeze({
  STORAGE_KEYS: {
    CEREBRAS: 'yc_cerebras_key_enc', // Changed suffix to indicate encrypted
    GROQ: 'yc_groq_key_enc',
  },
  KEY_MIN_LENGTH: 20,
  KEY_MAX_LENGTH: 512,
  LOAD_TIMEOUT: 5000,
  // Security Settings
  ENCRYPTION_SALT: 'yuyu-runtime-keys-v1-salt', // Static salt for demo (In prod, derive from user PIN)
  EXPIRY_HOURS: 24, // Auto-expire after 24h
});

// ──────────────────────────────────────────────────────────────────────────────
// STATE (In-Memory Cache)
// ──────────────────────────────────────────────────────────────────────────────
let _state = {
  cerebras: null, // { key: string, expiresAt: number, hash: string }
  groq: null,
  loaded: false,
  lastLoaded: null,
};

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
// CRYPTO HELPERS (Native Web Crypto API)
// ──────────────────────────────────────────────────────────────────────────────
async function deriveKey(password) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(CONFIG.ENCRYPTION_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(data, password) {
  const key = await deriveKey(password);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(data);
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  
  // Combine IV + Encrypted Data for storage
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

async function decryptData(encryptedBase64, password) {
  try {
    const key = await deriveKey(password);
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    throw new Error('Decryption failed: Wrong password or corrupted data');
  }
}

async function calculateHash(data) {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ──────────────────────────────────────────────────────────────────────────────
// VALIDATORS
// ──────────────────────────────────────────────────────────────────────────────
function validateApiKey(key, provider) {
  if (typeof key !== 'string') {
    throw new KeyValidationError(provider, 'Key must be a string');
  }
  
  const trimmed = key.trim();
  
  if (trimmed === '') {
    throw new KeyValidationError(provider, 'Key cannot be empty');
  }
  
  if (trimmed.length < CONFIG.KEY_MIN_LENGTH) {
    throw new KeyValidationError(
      provider, 
      `Key too short (${trimmed.length} chars). Minimum: ${CONFIG.KEY_MIN_LENGTH}`
    );
  }
  
  if (trimmed.length > CONFIG.KEY_MAX_LENGTH) {
    throw new KeyValidationError(
      provider,
      `Key too long (${trimmed.length} chars). Maximum: ${CONFIG.KEY_MAX_LENGTH}`
    );
  }
  
  if (trimmed.includes('sk-') && provider === 'Cerebras') {
    console.warn('[Key Warning] Key starts with "sk-" which is typically OpenAI format. Verify this is correct.');
  }
  
  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// CORE FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Helper to create secure key object
 */
function createSecureKey(rawKey) {
  const expiresAt = Date.now() + (CONFIG.EXPIRY_HOURS * 60 * 60 * 1000);
  return {
    key: rawKey,
    expiresAt,
    createdAt: Date.now(),
    hash: null // Will be calculated later
  };
}

/**
 * Load API keys from persistent storage
 */
export async function loadRuntimeKeys(options = {}) {
  const { validate = true, password = 'default-secret-password' } = options; // Default password for demo
  const errors = [];
  let loaded = 0;
  
  try {
    const loadWithTimeout = async (key, provider) => {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new KeyLoadError(provider, new Error('Load timeout'))), CONFIG.LOAD_TIMEOUT)
      );
      const storage = Preferences.get({ key });
      return Promise.race([storage, timeout]);
    };
    
    const [cerebrasResult, groqResult] = await Promise.all([
      loadWithTimeout(CONFIG.STORAGE_KEYS.CEREBRAS, 'Cerebras'),
      loadWithTimeout(CONFIG.STORAGE_KEYS.GROQ, 'Groq'),
    ]);
    
    const processStoredKey = async (result, provider) => {
      if (!result?.value) return null;
      
      try {
        // Decrypt
        const decryptedJson = await decryptData(result.value, password);
        const parsed = JSON.parse(decryptedJson);
        
        // Check Expiry
        if (Date.now() > parsed.expiresAt) {
          console.warn(`[${provider}] Key expired!`);
          return null;
        }
        
        // Check Integrity
        const currentHash = await calculateHash(parsed.key);
        if (parsed.hash !== currentHash) {
          console.error(`[${provider}] Integrity check failed! Key may be tampered.`);
          return null;
        }
        
        if (validate) {
          validateApiKey(parsed.key, provider);
        }
        
        return parsed;
      } catch (err) {
        console.error(`[${provider}] Load/Decrypt failed:`, err.message);
        return null;
      }
    };

    const cerebrasData = await processStoredKey(cerebrasResult, 'Cerebras');
    const groqData = await processStoredKey(groqResult, 'Groq');

    if (cerebrasData) {
      _state.cerebras = cerebrasData;
      loaded++;
    }
    if (groqData) {
      _state.groq = groqData;
      loaded++;
    }

    _state.loaded = true;
    _state.lastLoaded = Date.now();

    console.log(`[RuntimeKeys] Loaded ${loaded}/2 keys (Encrypted & Verified)`);
    return { success: errors.length === 0, loaded, errors };

  } catch (error) {
    console.error('[RuntimeKeys] Load failed:', error.message);
    if (error instanceof KeyLoadError) throw error;
    throw new KeyLoadError('Both', error);
  }
}

/**
 * Save API keys to persistent storage
 */
export async function saveRuntimeKeys(cerebras, groq, options = {}) {
  const { validate = true, password = 'default-secret-password' } = options;
  let saved = 0;
  
  if (validate) {
    if (cerebras) validateApiKey(cerebras, 'Cerebras');
    if (groq) validateApiKey(groq, 'Groq');
  }
  
  try {
    const saveKey = async (rawKey, provider, storageKey) => {
      if (!rawKey) return;
      
      const secureObj = createSecureKey(rawKey.trim());
      secureObj.hash = await calculateHash(secureObj.key);
      
      const encrypted = await encryptData(JSON.stringify(secureObj), password);
      await Preferences.set({ key: storageKey, value: encrypted });
      saved++;
    };

    await Promise.all([
      saveKey(cerebras, 'Cerebras', CONFIG.STORAGE_KEYS.CEREBRAS),
      saveKey(groq, 'Groq', CONFIG.STORAGE_KEYS.GROQ),
    ]);

    // Update in-memory state (store raw key for immediate use, but mark as secure)
    if (cerebras) _state.cerebras = createSecureKey(cerebras.trim());
    if (groq) _state.groq = createSecureKey(groq.trim());
    
    _state.loaded = true;
    _state.lastLoaded = Date.now();

    console.log(`[RuntimeKeys] Saved ${saved}/2 keys (Encrypted)`);
    return { success: true, saved };

  } catch (error) {
    if (error instanceof KeyValidationError) throw error;
    console.error('[RuntimeKeys] Save failed:', error.message);
    const provider = error.message.includes('Cerebras') ? 'Cerebras' : 'Groq';
    throw new KeySaveError(provider, error);
  }
}

// ... (Getter functions remain mostly the same, just return the key string) ...
export function getRuntimeCerebrasKey() {
  return _state.cerebras?.key || '';
}

export function getRuntimeGroqKey() {
  return _state.groq?.key || '';
}

export async function clearRuntimeKeys() {
  try {
    await Promise.all([
      Preferences.remove({ key: CONFIG.STORAGE_KEYS.CEREBRAS }),
      Preferences.remove({ key: CONFIG.STORAGE_KEYS.GROQ }),
    ]);
    _state = { cerebras: null, groq: null, loaded: false, lastLoaded: null };
    console.log('[RuntimeKeys] All keys cleared');
    return { success: true };
  } catch (error) {
    throw new KeyStorageError('Failed to clear keys', 'CLEAR_ERROR', { originalError: error.message });
  }
}

export function checkKeysStatus() {
  const now = Date.now();
  return {
    hasCerebras: !!_state.cerebras && _state.cerebras.expiresAt > now,
    hasGroq: !!_state.groq && _state.groq.expiresAt > now,
    both: (_state.cerebras?.expiresAt > now) && (_state.groq?.expiresAt > now),
    loaded: _state.loaded,
    lastLoaded: _state.lastLoaded,
    cerebrasExpired: _state.cerebras && _state.cerebras.expiresAt <= now,
    groqExpired: _state.groq && _state.groq.expiresAt <= now,
  };
}

export async function forceReloadKeys() {
  _state = { cerebras: null, groq: null, loaded: false, lastLoaded: null };
  return loadRuntimeKeys({ validate: true });
}

export async function initializeRuntimeKeys() {
  try {
    const result = await loadRuntimeKeys({ validate: true });
    if (!result.success) console.warn('[RuntimeKeys] Some keys failed validation:', result.errors);
    if (result.loaded === 0) console.info('[RuntimeKeys] No keys found.');
  } catch (error) {
    console.error('[RuntimeKeys] Initialization failed:', error.message);
  }
}

export {
  KeyStorageError,
  KeyValidationError,
  KeyLoadError,
  KeySaveError,
  CONFIG,
};
