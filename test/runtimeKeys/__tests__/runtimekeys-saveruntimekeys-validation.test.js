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
      cerebras: freshStore.getKey('cerebras'),
      groq: freshStore.getKey('groq'),
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
      cerebras: '  csk-valid-long-key-1234567890  ',
      groq: '  gsk-valid-long-key-1234567890  ',
    }, { password: 'test-pass' });

    expect(mockSet).toHaveBeenCalledTimes(2);
    // Data tersimpan dalam bentuk terenkripsi (base64), tidak perlu diparsing
  // Cukup pastikan state internal sudah benar melalui getState()

    // State internal sudah diperiksa di bawah
    

    const state = store.getState();
    expect(state.cerebras).toBe('csk-valid-long-key-1234567890');
    expect(state.groq).toBe('gsk-valid-long-key-1234567890');
  });

  it('treats null/undefined/empty as skip', async () => {
    const store = await createFreshStore();

    mockGet.mockResolvedValueOnce({ value: null });
    mockSet.mockResolvedValue(undefined);

    await store.saveRuntimeKeys({
      cerebras: null,
      groq: undefined,
      other: '',
    }, { password: 'test-pass' });

    expect(mockSet).toHaveBeenCalledTimes(0);
    // Data tersimpan dalam bentuk terenkripsi (base64), tidak perlu diparsing
  // Cukup pastikan state internal sudah benar melalui getState()
  });

  it('throws KeyValidationError for short key', async () => {
    const store = await createFreshStore();

    mockGet.mockResolvedValueOnce({ value: null });

    await expect(store.saveRuntimeKeys({ cerebras: 'short' }, { password: 'test-pass' })).rejects.toThrow(KeyValidationError);
    await expect(store.saveRuntimeKeys({ cerebras: 'short' }, { password: 'test-pass' })).rejects.toThrow(/minimal 20 karakter/);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('throws KeyValidationError for non-string key', async () => {
    const store = await createFreshStore();

    mockGet.mockResolvedValueOnce({ value: null });

    await expect(store.saveRuntimeKeys({ cerebras: 12345 }, { password: 'test-pass' })).rejects.toThrow(KeyValidationError);
    await expect(store.saveRuntimeKeys({ cerebras: 12345 }, { password: 'test-pass' })).rejects.toThrow(/harus berupa string/);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('emits console.warn for sk- prefix', async () => {
    const store = await createFreshStore();
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockGet.mockResolvedValueOnce({ value: null });
    mockSet.mockResolvedValue(undefined);

    await store.saveRuntimeKeys({ cerebras: 'sk-valid-long-key-1234567890' }, { password: 'test-pass' });

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('sk- prefix is deprecated'));
    consoleWarnSpy.mockRestore();
  });

  it('throws KeySaveError if Preferences.set fails', async () => {
    const store = await createFreshStore();

    mockGet.mockResolvedValueOnce({ value: null });
    mockSet.mockRejectedValue(new Error('Storage full'));

    await expect(store.saveRuntimeKeys({ cerebras: 'csk-valid-long-key-1234567890' }, { password: 'test-pass' })).rejects.toThrow(KeySaveError);
    await expect(store.saveRuntimeKeys({ cerebras: 'csk-valid-long-key-1234567890' }, { password: 'test-pass' })).rejects.toThrow(/gagal menyimpan runtime keys/);
  });
});
