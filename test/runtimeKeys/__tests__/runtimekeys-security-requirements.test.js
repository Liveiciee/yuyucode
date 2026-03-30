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
}