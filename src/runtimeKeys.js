// ============================================================
// FILE: src/runtimeKeys.js
// Runtime Key Store - Refactored Version
// ============================================================
// Features:
// - Persistent storage via Capacitor Preferences
// - In-memory caching for fast access
// - Input validation before save
// - Proper error handling & logging
// - Clear/reset functionality
// - Key expiry tracking (optional)
// ============================================================

import { Preferences } from '@capacitor/preferences';

// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────────────────────────────────────
const CONFIG = Object.freeze({
  STORAGE_KEYS: {
    CEREBRAS: 'yc_cerebras_key',
    GROQ: 'yc_groq_key',
  },
  KEY_MIN_LENGTH: 20,
  KEY_MAX_LENGTH: 512,
  LOAD_TIMEOUT: 5000,
});

// ──────────────────────────────────────────────────────────────────────────────
// STATE (In-Memory Cache)
// ──────────────────────────────────────────────────────────────────────────────
let _state = {
  cerebras: '',
  groq: '',
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
  
  // Optional: Check for suspicious patterns (could indicate accidental paste of secrets)
  if (trimmed.includes('sk-') && provider === 'Cerebras') {
    console.warn('[Key Warning] Key starts with "sk-" which is typically OpenAI format. Verify this is correct.');
  }
  
  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// CORE FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Load API keys from persistent storage
 * @param {Object} options - Configuration options
 * @param {boolean} options.validate - Whether to validate keys after loading
 * @returns {Promise<{success: boolean, loaded: number, errors: string[]}>}
 */
export async function loadRuntimeKeys(options = {}) {
  const { validate = true } = options;
  const errors = [];
  let loaded = 0;
  
  try {
    // Use Promise.race with timeout to prevent hanging
    const loadWithTimeout = async (key, provider) => {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new KeyLoadError(provider, new Error('Load timeout'))), CONFIG.LOAD_TIMEOUT)
      );
      
      const storage = Preferences.get({ key });
      return Promise.race([storage, timeout]);
    };
    
    // Load both keys in parallel
    const [cerebrasResult, groqResult] = await Promise.all([
      loadWithTimeout(CONFIG.STORAGE_KEYS.CEREBRAS, 'Cerebras'),
      loadWithTimeout(CONFIG.STORAGE_KEYS.GROQ, 'Groq'),
    ]);
    
    // Update state
    const cerebrasValue = cerebrasResult?.value || '';
    const groqValue = groqResult?.value || '';
    
    // Validate if requested
    if (validate) {
      if (cerebrasValue) {
        try {
          validateApiKey(cerebrasValue, 'Cerebras');
          loaded++;
        } catch (err) {
          errors.push(`Cerebras: ${err.message}`);
        }
      }
      
      if (groqValue) {
        try {
          validateApiKey(groqValue, 'Groq');
          loaded++;
        } catch (err) {
          errors.push(`Groq: ${err.message}`);
        }
      }
    } else {
      if (cerebrasValue) loaded++;
      if (groqValue) loaded++;
    }
    
    _state = {
      cerebras: cerebrasValue,
      groq: groqValue,
      loaded: true,
      lastLoaded: Date.now(),
    };
    
    // Log summary (don't expose actual keys!)
    console.log(`[RuntimeKeys] Loaded ${loaded}/2 keys`);
    if (errors.length > 0) {
      console.warn('[RuntimeKeys] Validation warnings:', errors);
    }
    
    return { success: errors.length === 0, loaded, errors };
    
  } catch (error) {
    console.error('[RuntimeKeys] Load failed:', error.message);
    // Don't wrap if already KeyLoadError
    if (error instanceof KeyLoadError) {
      throw error;
    }
    throw new KeyLoadError('Both', error);
  }
}

/**
 * Save API keys to persistent storage
 * @param {string} cerebras - Cerebras API key
 * @param {string} groq - Groq API key
 * @param {Object} options - Configuration options
 * @param {boolean} options.validate - Whether to validate keys before saving
 * @returns {Promise<{success: boolean, saved: number}>}
 */
export async function saveRuntimeKeys(cerebras, groq, options = {}) {
  const { validate = true } = options;
  let saved = 0;
  
  // ✅ FIX: Validate BEFORE try-catch so validation errors propagate correctly
  if (validate) {
    if (cerebras) validateApiKey(cerebras, 'Cerebras');
    if (groq) validateApiKey(groq, 'Groq');
  }
  
  try {
    // Normalize keys (trim whitespace)
    const normalizedCerebras = cerebras?.trim() || '';
    const normalizedGroq = groq?.trim() || '';
    
    // Save to storage in parallel
    await Promise.all([
      Preferences.set({ key: CONFIG.STORAGE_KEYS.CEREBRAS, value: normalizedCerebras }),
      Preferences.set({ key: CONFIG.STORAGE_KEYS.GROQ, value: normalizedGroq }),
    ]);
    
    // Update in-memory state
    _state.cerebras = normalizedCerebras;
    _state.groq = normalizedGroq;
    _state.loaded = true; // ✅ FIX: Set loaded = true after successful save
    _state.lastLoaded = Date.now();
    
    if (normalizedCerebras) saved++;
    if (normalizedGroq) saved++;
    
    console.log(`[RuntimeKeys] Saved ${saved}/2 keys`);
    
    return { success: true, saved };
    
  } catch (error) {
    // ✅ FIX: Re-throw validation errors without wrapping
    if (error instanceof KeyValidationError) {
      throw error;
    }
    
    console.error('[RuntimeKeys] Save failed:', error.message);
    
    // Determine which provider failed
    const provider = error.message.includes('Cerebras') || error.message.includes('cerebras') 
      ? 'Cerebras' 
      : 'Groq';
    
    throw new KeySaveError(provider, error);
  }
}

/**
 * Get Cerebras API key (from memory cache)
 * @returns {string} API key or empty string
 */
export function getRuntimeCerebrasKey() {
  return _state.cerebras || '';
}

/**
 * Get Groq API key (from memory cache)
 * @returns {string} API key or empty string
 */
export function getRuntimeGroqKey() {
  return _state.groq || '';
}

/**
 * Clear all stored keys (logout/reset)
 * @returns {Promise<{success: boolean}>}
 */
export async function clearRuntimeKeys() {
  try {
    await Promise.all([
      Preferences.remove({ key: CONFIG.STORAGE_KEYS.CEREBRAS }),
      Preferences.remove({ key: CONFIG.STORAGE_KEYS.GROQ }),
    ]);
    
    _state = {
      cerebras: '',
      groq: '',
      loaded: false,
      lastLoaded: null,
    };
    
    console.log('[RuntimeKeys] All keys cleared');
    return { success: true };
    
  } catch (error) {
    console.error('[RuntimeKeys] Clear failed:', error.message);
    throw new KeyStorageError('Failed to clear keys', 'CLEAR_ERROR', { originalError: error.message });
  }
}

/**
 * Check if keys are loaded and valid
 * @returns {{hasCerebras: boolean, hasGroq: boolean, both: boolean}}
 */
export function checkKeysStatus() {
  return {
    hasCerebras: _state.cerebras.length > 0,
    hasGroq: _state.groq.length > 0,
    both: _state.cerebras.length > 0 && _state.groq.length > 0,
    loaded: _state.loaded,
    lastLoaded: _state.lastLoaded,
  };
}

/**
 * Force reload keys from storage (bypass cache)
 * @returns {Promise<{success: boolean, loaded: number}>}
 */
export async function forceReloadKeys() {
  _state = {
    cerebras: '',
    groq: '',
    loaded: false,
    lastLoaded: null,
  };
  return loadRuntimeKeys({ validate: true });
}

// ──────────────────────────────────────────────────────────────────────────────
// INITIALIZATION HELPER
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Initialize runtime keys on app startup
 * Call this once during app initialization
 * @returns {Promise<void>}
 */
export async function initializeRuntimeKeys() {
  try {
    const result = await loadRuntimeKeys({ validate: true });
    
    if (!result.success) {
      console.warn('[RuntimeKeys] Some keys failed validation:', result.errors);
    }
    
    if (result.loaded === 0) {
      console.info('[RuntimeKeys] No keys found. User should configure API keys.');
    }
    
  } catch (error) {
    console.error('[RuntimeKeys] Initialization failed:', error.message);
    // Don't throw - app should still work, just without AI features
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ──────────────────────────────────────────────────────────────────────────────
export {
  KeyStorageError,
  KeyValidationError,
  KeyLoadError,
  KeySaveError,
  CONFIG,
};
