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
