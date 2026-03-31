import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadRuntimeKeys } from '../../../src/runtimeKeys/index.js';
import { KeyLoadError } from '../../../src/runtimeKeys/errors.js';

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
globalThis.crypto = {
  subtle: {
    digest: mockDigest,
  },
};

describe('runtimeKeys — loadRuntimeKeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockSet.mockReset();
    
    // Default mock for crypto subtle digest
    mockDigest.mockImplementation(async (algorithm, data) => {
      const input = new TextDecoder().decode(data);
      if (input.includes('csk-valid-long-key')) return new TextEncoder().encode(mockHashValue).buffer;
      if (input.includes('gsk-valid-long-key')) return new TextEncoder().encode(mockHashValue).buffer;
      if (input.includes('csk-long-valid-key')) return new TextEncoder().encode(mockHashValue).buffer;
      if (input.includes('gsk-long-valid-key')) return new TextEncoder().encode(mockHashValue).buffer;
      return new TextEncoder().encode(mockHashValue).buffer;
    });
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('loads both keys successfully', async () => {
    const now = Date.now();
    mockGet.mockImplementation(async ({ key }) => {
      if (key === 'runtime_keys') {
        return {
          value: JSON.stringify({
            csk: {
              key: 'csk-valid-long-key-1234567890',
              expiresAt: now + 1000000,
              hash: mockHashValue,
            },
            gsk: {
              key: 'gsk-valid-long-key-1234567890',
              expiresAt: now + 1000000,
              hash: mockHashValue,
            },
          }),
        };
      }
      return { value: null };
    });

    const result = await loadRuntimeKeys();
    expect(result.csk).toBe('csk-valid-long-key-1234567890');
    expect(result.gsk).toBe('gsk-valid-long-key-1234567890');
  });

  it('loads with some validation failures', async () => {
    const now = Date.now();
    mockGet.mockImplementation(async ({ key }) => {
      if (key === 'runtime_keys') {
        return {
          value: JSON.stringify({
            csk: {
              key: 'csk-short',
              expiresAt: now + 1000000,
              hash: mockHashValue,
            },
            gsk: {
              key: 'gsk-valid-long-key-1234567890',
              expiresAt: now + 1000000,
              hash: mockHashValue,
            },
          }),
        };
      }
      return { value: null };
    });

    const result = await loadRuntimeKeys();
    expect(result.csk).toBeNull();
    expect(result.gsk).toBe('gsk-valid-long-key-1234567890');
  });

  it('loads without validation (validate: false)', async () => {
    const now = Date.now();
    mockGet.mockImplementation(async ({ key }) => {
      if (key === 'runtime_keys') {
        return {
          value: JSON.stringify({
            csk: {
              key: 'csk-short',
              expiresAt: now + 1000000,
              hash: mockHashValue,
            },
          }),
        };
      }
      return { value: null };
    });

    const result = await loadRuntimeKeys({ validate: false });
    expect(result.csk).toBe('csk-short');
  });

  it('throws KeyLoadError on timeout', async () => {
    mockGet.mockImplementation(() => new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 100);
    }));

    await expect(loadRuntimeKeys()).rejects.toThrow(KeyLoadError);
    await expect(loadRuntimeKeys()).rejects.toThrow(/gagal load runtime keys/i);
  });
});
