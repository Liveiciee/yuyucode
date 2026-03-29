// src/runtimeKeys.test.js
// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ──────────────────────────────────────────────────────────────────────────────
// MOCK CAPACITOR PREFERENCES
// ──────────────────────────────────────────────────────────────────────────────
const mockPreferences = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

vi.mock('@capacitor/preferences', () => ({
  Preferences: mockPreferences,
}));

// ──────────────────────────────────────────────────────────────────────────────
// MOCK CRYPTO - Factory function untuk fresh mock tiap panggil
// ──────────────────────────────────────────────────────────────────────────────
const createMockCrypto = () => {
  const mockHashValue = 'mock-hash-1234567890';
  
  return {
    subtle: {
      importKey: vi.fn().mockResolvedValue({}),
      deriveKey: vi.fn().mockResolvedValue({}),
      encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
      decrypt: vi.fn().mockImplementation(async () => {
        const mockJson = JSON.stringify({
          key: 'test-key-12345678901234567890',
          expiresAt: Date.now() + 1000000,
          hash: mockHashValue,
        });
        return new TextEncoder().encode(mockJson);
      }),
      digest: vi.fn().mockImplementation(async (_, data) => {
        const input = new TextDecoder().decode(data);
        if (input.includes('csk-valid-long-key')) return new TextEncoder().encode(mockHashValue).buffer;
        if (input.includes('gsk-valid-long-key')) return new TextEncoder().encode(mockHashValue).buffer;
        if (input.includes('short')) return new TextEncoder().encode('hash-short').buffer;
        if (input.includes('new-csk')) return new TextEncoder().encode('mock-hash-new').buffer;
        if (input.includes('old-csk')) return new TextEncoder().encode('mock-hash-old').buffer;
        if (input.includes('csk-long-valid-key')) return new TextEncoder().encode(mockHashValue).buffer;
        if (input.includes('gsk-long-valid-key')) return new TextEncoder().encode(mockHashValue).buffer;
        return new TextEncoder().encode(mockHashValue).buffer;
      }),
    },
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) arr[i] = i % 256;
      return arr;
    }),
  };
};

// ──────────────────────────────────────────────────────────────────────────────
// HELPER: Create Fresh Store Instance (BUKAN singleton!)
// ──────────────────────────────────────────────────────────────────────────────
async function createFreshStore() {
  // Reset modules & globals
  vi.resetModules();
  vi.unstubAllGlobals();
  
  // Setup fresh crypto mock
  const mockCrypto = createMockCrypto();
  vi.stubGlobal('crypto', mockCrypto);
  vi.stubGlobal('window', { crypto: mockCrypto });
  
  // Import actual module dengan config override
  const actual = await vi.importActual('../index.js');
  
  // Buat instance KeyStore baru (bukan pake singleton!)
  const freshStore = new actual.KeyStore();
  
  // Override config untuk test (cepat)
  actual.CONFIG.PBKDF2_ITERATIONS = 1;
  actual.CONFIG.LOAD_TIMEOUT = 100;
  actual.CONFIG.KEY_MIN_LENGTH = 1;
  actual.CONFIG.KEY_MAX_LENGTH = 1000;
  
  // Return object dengan methods yang sama kayak singleton export
  return {
    loadRuntimeKeys: (opts) => freshStore.load(opts),
    saveRuntimeKeys: (keys, opts) => freshStore.save(keys, opts),
    clearRuntimeKeys: () => freshStore.clear(),
    getRuntimeCerebrasKey: () => freshStore.getKey('cerebras'),
    getRuntimeGroqKey: () => freshStore.getKey('groq'),
    checkKeysStatus: () => freshStore.getStatus(),
    forceReloadKeys: (opts = {}) => freshStore.forceReload(opts),
    initializeRuntimeKeys: (opts = {}) => freshStore.initialize(opts),
    CONFIG: actual.CONFIG,
    KeyStore: actual.KeyStore,
    _store: freshStore, // internal access untuk debug
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// SETUP & TEARDOWN
// ──────────────────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset mock implementations
  mockPreferences.get.mockReset();
  mockPreferences.set.mockReset();
  mockPreferences.remove.mockReset();
  
  // Default: empty storage
  mockPreferences.get.mockResolvedValue({ value: null });
  mockPreferences.set.mockResolvedValue(undefined);
  mockPreferences.remove.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ──────────────────────────────────────────────────────────────────────────────
// GROUP 1: Security & Password Requirement
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — Security Requirements', () => {
  it('throws MISSING_PASSWORD on save if password missing', async () => {
    const mod = await createFreshStore();
    await expect(
      mod.saveRuntimeKeys({ cerebras: 'valid-key-12345678901234567890' })
    ).rejects.toHaveProperty('code', 'MISSING_PASSWORD');
  });

  it('throws MISSING_PASSWORD on load if password missing', async () => {
    const mod = await createFreshStore();
    await expect(mod.loadRuntimeKeys()).rejects.toHaveProperty('code', 'MISSING_PASSWORD');
  });

  it('accepts valid password on save', async () => {
    const mod = await createFreshStore();
    const result = await mod.saveRuntimeKeys(
      { cerebras: 'valid-key-12345678901234567890', groq: 'valid-key-12345678901234567890' },
      { password: 'my-secret-password' }
    );
    expect(result.success).toBe(true);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// GROUP 2: Getters & Status
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — getters & status', () => {
  it('initial state is empty', async () => {
    const mod = await createFreshStore();
    expect(mod.getRuntimeCerebrasKey()).toBe('');
    expect(mod.getRuntimeGroqKey()).toBe('');

    const status = mod.checkKeysStatus();
    expect(status).toEqual({
      hasCerebras: false,
      hasGroq: false,
      both: false,
      loaded: false,
      lastLoaded: null,
      cerebrasExpired: null,
      groqExpired: null,
    });
  });

  it('checkKeysStatus reflects loaded keys correctly', async () => {
    const mod = await createFreshStore();
    await mod.saveRuntimeKeys(
      { cerebras: 'csk-long-valid-key-12345678901234567890', groq: 'gsk-long-valid-key-12345678901234567890' },
      { password: 'test-pass' }
    );

    const status = mod.checkKeysStatus();
    expect(status.hasCerebras).toBe(true);
    expect(status.hasGroq).toBe(true);
    expect(status.both).toBe(true);
    expect(status.loaded).toBe(true);
    expect(status.lastLoaded).toBeDefined();
    expect(status.cerebrasExpired).toBe(false);
    expect(status.groqExpired).toBe(false);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// GROUP 3: Load Logic
// ──────────────────────────────────────────────────────────────────────────────
const mockHashValue = 'mock-hash-1234567890';

describe('runtimeKeys — loadRuntimeKeys', () => {
  it('loads both keys successfully', async () => {
    const mockData = JSON.stringify({
      key: 'csk-valid-long-key-1234567890',
      expiresAt: Date.now() + 1000000,
      hash: mockHashValue,
    });

    mockPreferences.get.mockImplementation(({ key }) => {
      if (key === 'yc_cerebras_key_enc') return Promise.resolve({ value: mockData });
      if (key === 'yc_groq_key_enc') return Promise.resolve({ value: mockData.replace('csk', 'gsk') });
      return Promise.resolve({ value: null });
    });

    const mod = await createFreshStore();
    const result = await mod.loadRuntimeKeys({ password: 'test-pass' });

    expect(result.success).toBe(true);
    expect(result.loaded).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it('loads with some validation failures', async () => {
    const mockDataShort = JSON.stringify({
      key: 'short',
      expiresAt: Date.now() + 1000000,
      hash: 'hash-short',
    });
    const mockDataValid = JSON.stringify({
      key: 'gsk-valid-long-key-1234567890',
      expiresAt: Date.now() + 1000000,
      hash: mockHashValue,
    });

    mockPreferences.get.mockImplementation(({ key }) => {
      if (key === 'yc_cerebras_key_enc') return Promise.resolve({ value: mockDataShort });
      if (key === 'yc_groq_key_enc') return Promise.resolve({ value: mockDataValid });
      return Promise.resolve({ value: null });
    });

    const mod = await createFreshStore();
    const result = await mod.loadRuntimeKeys({ password: 'test-pass' });

    expect(result.loaded).toBe(2);
    expect(mod.getRuntimeGroqKey()).toBe('gsk-valid-long-key-1234567890');
    expect(mod.getRuntimeCerebrasKey()).toBe('short');
  });

  it('loads without validation (validate: false)', async () => {
    const mockDataShort = JSON.stringify({
      key: 'short',
      expiresAt: Date.now() + 1000000,
      hash: 'hash-short',
    });

    mockPreferences.get.mockImplementation(() => Promise.resolve({ value: mockDataShort }));

    const mod = await createFreshStore();
    const result = await mod.loadRuntimeKeys({ password: 'test-pass', validate: false });

    expect(result.success).toBe(true);
    expect(result.loaded).toBe(2);
  });

  it('throws KeyLoadError on timeout', async () => {
    mockPreferences.get.mockImplementation(() => new Promise(() => {}));

    const mod = await createFreshStore();
    await expect(mod.loadRuntimeKeys({ password: 'test-pass' })).rejects.toHaveProperty('code', 'LOAD_ERROR');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// GROUP 4: Save & Validation
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — saveRuntimeKeys & validation', () => {
  it('saves valid keys, trims, updates state', async () => {
    const mod = await createFreshStore();
    const result = await mod.saveRuntimeKeys(
      { cerebras: '  csk-valid-long-key-12345  ', groq: 'gsk-valid-long-key-67890' },
      { password: 'test-pass' }
    );

    expect(result.success).toBe(true);
    expect(result.saved).toBe(2);
    expect(mod.getRuntimeCerebrasKey()).toBe('csk-valid-long-key-12345');

    const status = mod.checkKeysStatus();
    expect(status.hasCerebras).toBe(true);
  });

  it('treats null/undefined/empty as skip', async () => {
    const mod = await createFreshStore();
    await mod.clearRuntimeKeys();
    
    await mod.saveRuntimeKeys({ cerebras: null, groq: undefined }, { password: 'test-pass' });

    expect(mod.getRuntimeCerebrasKey()).toBe('');
    expect(mod.getRuntimeGroqKey()).toBe('');
  });

  it('throws KeyValidationError for short key', async () => {
    const mod = await createFreshStore();
    mod.CONFIG.KEY_MIN_LENGTH = 20;
    await expect(
      mod.saveRuntimeKeys({ cerebras: 'short', groq: 'gsk-valid-long-key-1234567890' }, { password: 'test-pass' })
    ).rejects.toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('throws KeyValidationError for non-string key', async () => {
    const mod = await createFreshStore();
    await expect(
      mod.saveRuntimeKeys({ cerebras: 123, groq: 'valid-groq' }, { password: 'test-pass' })
    ).rejects.toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('emits console.warn untuk sk- prefix', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mod = await createFreshStore();
    await mod.saveRuntimeKeys(
      { cerebras: 'sk-12345678901234567890', groq: 'gsk-valid-long-key-1234567890' },
      { password: 'test-pass' }
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Key Warning]')
    );
  });

  it('throws KeySaveError kalau Preferences.set gagal', async () => {
    mockPreferences.set.mockRejectedValueOnce(new Error('Storage full'));

    const mod = await createFreshStore();
    await expect(
      mod.saveRuntimeKeys(
        { cerebras: 'valid-cerebras-long-key-12345', groq: 'valid-groq-long-key-12345678' },
        { password: 'test-pass' }
      )
    ).rejects.toHaveProperty('code', 'SAVE_ERROR');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// GROUP 5: Expiry, Integrity, Tamper Protection
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — Expiry & Integrity', () => {
  it('rejects expired keys', async () => {
    const expiredData = JSON.stringify({
      key: 'csk-valid-long-key-1234567890',
      expiresAt: Date.now() - 10000,
      hash: mockHashValue,
    });

    mockPreferences.get.mockImplementation(({ key }) => {
      if (key === 'yc_cerebras_key_enc') return Promise.resolve({ value: expiredData });
      return Promise.resolve({ value: null });
    });

    const mod = await createFreshStore();
    const result = await mod.loadRuntimeKeys({ password: 'test-pass' });

    expect(result.loaded).toBe(0);
    expect(mod.getRuntimeCerebrasKey()).toBe('');
  });

  it('rejects tampered keys (hash mismatch)', async () => {
    const tamperedData = JSON.stringify({
      key: 'csk-valid-long-key-1234567890',
      expiresAt: Date.now() + 1000000,
      hash: 'wrong-hash-value',
    });

    mockPreferences.get.mockImplementation(({ key }) => {
      if (key === 'yc_cerebras_key_enc') return Promise.resolve({ value: tamperedData });
      return Promise.resolve({ value: null });
    });

    const mod = await createFreshStore();
    const result = await mod.loadRuntimeKeys({ password: 'test-pass' });

    expect(result.loaded).toBe(0);
  });

  it('rejects corrupt data', async () => {
    mockPreferences.get.mockImplementation(() => Promise.resolve({ value: '{ invalid json }' }));

    const mod = await createFreshStore();
    const result = await mod.loadRuntimeKeys({ password: 'test-pass' });

    expect(result.loaded).toBe(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// GROUP 6: Clear & Force Reload
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — clear & force reload', () => {
  it('clearRuntimeKeys reset storage dan memory', async () => {
    const mod = await createFreshStore();
    await mod.saveRuntimeKeys(
      { cerebras: 'csk-valid-long-key-1234567890', groq: 'gsk-valid-long-key-1234567890' },
      { password: 'test-pass' }
    );

    await mod.clearRuntimeKeys();

    expect(mod.getRuntimeCerebrasKey()).toBe('');
    expect(mod.checkKeysStatus().loaded).toBe(false);
    expect(mockPreferences.remove).toHaveBeenCalledTimes(2);
  });

  it('throws CLEAR_ERROR kalau Preferences.remove gagal', async () => {
    mockPreferences.remove.mockRejectedValueOnce(new Error('IO error'));

    const mod = await createFreshStore();
    await expect(mod.clearRuntimeKeys()).rejects.toHaveProperty('code', 'CLEAR_ERROR');
  });

  it('forceReloadKeys reset lalu reload', async () => {
    const mod = await createFreshStore();
    await mod.saveRuntimeKeys(
      { cerebras: 'old-csk-long-key-1234567890', groq: 'old-gsk-long-key-1234567890' },
      { password: 'test-pass' }
    );

    const newData = JSON.stringify({
      key: 'new-csk-long-key-1234567890',
      expiresAt: Date.now() + 1000000,
      hash: 'mock-hash-new',
    });

    mockPreferences.get.mockImplementation(({ key }) => {
      if (key === 'yc_cerebras_key_enc') return Promise.resolve({ value: newData });
      if (key === 'yc_groq_key_enc') return Promise.resolve({ value: newData.replace('csk', 'gsk') });
      return Promise.resolve({ value: null });
    });

    const result = await mod.forceReloadKeys({ password: 'test-pass' });
    expect(result.loaded).toBe(2);
    expect(mod.getRuntimeCerebrasKey()).toBe('new-csk-long-key-1234567890');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// GROUP 7: Initialize
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — initializeRuntimeKeys', () => {
  it('succeeds silently on normal load', async () => {
    const mod = await createFreshStore();
    await expect(mod.initializeRuntimeKeys({ password: 'test-pass' })).resolves.not.toThrow();
  });

  it('handles validation failure gracefully', async () => {
    const mockDataShort = JSON.stringify({
      key: 'short',
      expiresAt: Date.now() + 1000000,
      hash: 'hash-short',
    });

    mockPreferences.get.mockImplementation(() => Promise.resolve({ value: mockDataShort }));

    const mod = await createFreshStore();
    await expect(mod.initializeRuntimeKeys({ password: 'test-pass' })).resolves.not.toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// BONUS: Performance Benchmark Tests
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — Performance Benchmarks', () => {
  it('loadRuntimeKeys completes under 500ms', async () => {
    const mod = await createFreshStore();
    const start = performance.now();
    
    await mod.loadRuntimeKeys({ password: 'test-pass' });
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });

  it('saveRuntimeKeys completes under 300ms', async () => {
    const mod = await createFreshStore();
    const start = performance.now();
    
    await mod.saveRuntimeKeys(
      { cerebras: 'csk-fast-key-1234567890', groq: 'gsk-fast-key-1234567890' },
      { password: 'test-pass' }
    );
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(300);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// BONUS: CONFIG Tests
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — CONFIG', () => {
  it('has fast test config overrides', async () => {
    const mod = await createFreshStore();
    expect(mod.CONFIG.PBKDF2_ITERATIONS).toBe(1);
    expect(mod.CONFIG.LOAD_TIMEOUT).toBe(100);
  });
});
