import { CONFIG } from './config.js';
import { KeyStorageError, KeyLoadError, KeySaveError, KeyValidationError } from './errors.js';
import { preferencesGet, preferencesRemove } from './storage.js';
import { validateApiKey, processStoredKey, saveSingleKey } from './validators.js';

export class KeyStore {
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
        return Promise.race([preferencesGet(key), timeout]);
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
      await Promise.all(Object.values(CONFIG.STORAGE_KEYS).map(key => preferencesRemove(key)));
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
