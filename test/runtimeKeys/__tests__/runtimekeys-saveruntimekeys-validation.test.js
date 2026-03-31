import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyValidationError, KeySaveError } from '../../../src/runtimeKeys/errors.js';

const mockHashValue = 'mock-hash-1234567890';

// Mock Preferences
const mockGet = vi.fn();
const mockSet = vi.fn();

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: mockGet,
    set: mockSet,
  },
}));

// Mock crypto subtle for hash verification
const mockDigest = vi.fn();
vi.stubGlobal('crypto', {
  subtle: {
    digest: mockDigest,
  },
});

// Helper untuk membuat KeyStore instance baru dengan wrapper
const createFreshStore = async () => {
  const { KeyStore } = await import('../../../src/runtimeKeys/keystore.js');
  const freshStore = new KeyStore();
  return {
    saveRuntimeKeys: (keys, opts) => freshStore.save(keys, opts),
    getState: () => ({
      csk: freshStore.getKey('cerebras'),
      gsk: freshStore.getKey('groq'),
    }),
    getKey: (provider) => freshStore.getKey(provider),
  };
};

describe('runtimeKeys — saveRuntimeKeys & validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockSet.mockReset();

    mockDigest.mockImplementation(async (algorithm, data) => {
      const input = new TextDecoder().decode(data);
      if (input.includes('csk-valid')) return new TextEncoder().encode(mockHashValue).buffer;
      if (input.includes('gsk-valid')) return new TextEncoder().encode(mockHashValue).buffer;
      if (input.includes('csk-short')) return new TextEncoder().encode(mockHashValue).buffer;
      if (input.includes('gsk-short')) return new TextEncoder().encode(mockHashValue).buffer;
      return new TextEncoder().encode(mockHashValue).buffer;
    });

    mockGet.mockResolvedValue({ value: null });
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('saves valid keys, trims, updates state', async () => {
    const store = await createFreshStore();
    const now = Date.now();

    mockGet.mockResolvedValueOnce({ value: null });
    mockSet.mockResolvedValue(undefined);

    await store.saveRuntimeKeys({
      csk: '  csk-valid-long-key-1234567890  ',
      gsk: '  gsk-valid-long-key-1234567890  ',
    });

    expect(mockSet).toHaveBeenCalledTimes(1);
    const savedData = JSON.parse(mockSet.mock.calls[0][0].value);

    expect(savedData.csk.key).toBe('csk-valid-long-key-1234567890');
    expect(savedData.gsk.key).toBe('gsk-valid-long-key-1234567890');
    expect(savedData.csk.hash).toBeDefined();
    expect(savedData.gsk.hash).toBeDefined();
    expect(savedData.csk.expiresAt).toBeGreaterThan(now);
    expect(savedData.gsk.expiresAt).toBeGreaterThan(now);

    const state = store.getState();
    expect(state.csk).toBe('csk-valid-long-key-1234567890');
    expect(state.gsk).toBe('gsk-valid-long-key-1234567890');
  });

  it('treats null/undefined/empty as skip', async () => {
    const store = await createFreshStore();

    mockGet.mockResolvedValueOnce({ value: null });
    mockSet.mockResolvedValue(undefined);

    await store.saveRuntimeKeys({
      csk: null,
      gsk: undefined,
      other: '',
    });

    expect(mockSet).toHaveBeenCalledTimes(1);
    const savedData = JSON.parse(mockSet.mock.calls[0][0].value);
    expect(savedData.csk).toBeUndefined();
    expect(savedData.gsk).toBeUndefined();
  });

  it('throws KeyValidationError for short key', async () => {
    const store = await createFreshStore();

    mockGet.mockResolvedValueOnce({ value: null });

    await expect(store.saveRuntimeKeys({ csk: 'short' })).rejects.toThrow(KeyValidationError);
    await expect(store.saveRuntimeKeys({ csk: 'short' })).rejects.toThrow(/minimal 20 karakter/);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('throws KeyValidationError for non-string key', async () => {
    const store = await createFreshStore();

    mockGet.mockResolvedValueOnce({ value: null });

    await expect(store.saveRuntimeKeys({ csk: 12345 })).rejects.toThrow(KeyValidationError);
    await expect(store.saveRuntimeKeys({ csk: 12345 })).rejects.toThrow(/harus berupa string/);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('emits console.warn for sk- prefix', async () => {
    const store = await createFreshStore();
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockGet.mockResolvedValueOnce({ value: null });
    mockSet.mockResolvedValue(undefined);

    await store.saveRuntimeKeys({ csk: 'sk-valid-long-key-1234567890' });

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('sk- prefix is deprecated'));
    consoleWarnSpy.mockRestore();
  });

  it('throws KeySaveError if Preferences.set fails', async () => {
    const store = await createFreshStore();

    mockGet.mockResolvedValueOnce({ value: null });
    mockSet.mockRejectedValue(new Error('Storage full'));

    await expect(store.saveRuntimeKeys({ csk: 'csk-valid-long-key-1234567890' })).rejects.toThrow(KeySaveError);
    await expect(store.saveRuntimeKeys({ csk: 'csk-valid-long-key-1234567890' })).rejects.toThrow(/gagal menyimpan runtime keys/);
  });
});
