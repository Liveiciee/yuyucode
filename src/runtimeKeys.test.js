// src/runtimeKeys.test.js
// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadRuntimeKeys,
  saveRuntimeKeys,
  clearRuntimeKeys,
  checkKeysStatus,
  getRuntimeCerebrasKey,
  getRuntimeGroqKey,
  initializeRuntimeKeys,
  forceReloadKeys,
  KeyValidationError,
  KeyStorageError,
  KeyLoadError,
  KeySaveError,
  CONFIG,               // tambahan untuk test PBKDF2 iterations
} from './runtimeKeys.js';

// ──────────────────────────────────────────────────────────────────────────────
// MOCK CAPACITOR PREFERENCES
// ──────────────────────────────────────────────────────────────────────────────
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

const { Preferences } = await import('@capacitor/preferences');

// ──────────────────────────────────────────────────────────────────────────────
// HELPER: Fresh Module Import
// ──────────────────────────────────────────────────────────────────────────────
async function freshModule() {
  vi.resetModules();
  return import('./runtimeKeys.js');
}

// ──────────────────────────────────────────────────────────────────────────────
// SETUP & TEARDOWN
// ──────────────────────────────────────────────────────────────────────────────
beforeEach(async () => {
  vi.clearAllMocks();
  Preferences.get.mockReset();
  Preferences.set.mockReset();
  Preferences.remove.mockReset();

  Preferences.get.mockResolvedValue({ value: null });
  Preferences.set.mockResolvedValue(undefined);
  Preferences.remove.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ──────────────────────────────────────────────────────────────────────────────
// GROUP 1: Security & Password Requirement
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — Security Requirements', () => {
  it('throws MISSING_PASSWORD on save if password missing', async () => {
    const mod = await freshModule();
    await expect(
      mod.saveRuntimeKeys({ cerebras: 'valid-key-12345678901234567890' })
    ).rejects.toHaveProperty('code', 'MISSING_PASSWORD');
  });

  it('throws MISSING_PASSWORD on load if password missing', async () => {
    const mod = await freshModule();
    await expect(mod.loadRuntimeKeys()).rejects.toHaveProperty('code', 'MISSING_PASSWORD');
  });

  it('accepts valid password on save', async () => {
    const mod = await freshModule();
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
    const mod = await freshModule();
    expect(mod.getRuntimeCerebrasKey()).toBe('');
    expect(mod.getRuntimeGroqKey()).toBe('');

    const status = mod.checkKeysStatus();
    expect(status).toEqual({
      hasCerebras: false,
      hasGroq: false,
      both: false,
      loaded: false,
      lastLoaded: null,
      cerebrasExpired: false,
      groqExpired: false,
    });
  });

  it('checkKeysStatus reflects loaded keys correctly', async () => {
    const mod = await freshModule();
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
// GROUP 3: Load Logic (termasuk passthrough untuk test)
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — loadRuntimeKeys', () => {
  it('loads both keys successfully (passthrough JSON)', async () => {
    const mockData = JSON.stringify({
      key: 'csk-valid-long-key-1234567890',
      expiresAt: Date.now() + 1000000,
      hash: 'hash-csk-valid-long-key-1234567890',
    });

    Preferences.get.mockImplementation(({ key }) => {
      if (key === 'yc_cerebras_key_enc') return Promise.resolve({ value: mockData });
      if (key === 'yc_groq_key_enc') return Promise.resolve({ value: mockData.replace('csk', 'gsk') });
      return Promise.resolve({ value: null });
    });

    const mod = await freshModule();
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
      hash: 'hash-gsk-valid-long-key-1234567890',
    });

    Preferences.get.mockImplementation(({ key }) => {
      if (key === 'yc_cerebras_key_enc') return Promise.resolve({ value: mockDataShort });
      if (key === 'yc_groq_key_enc') return Promise.resolve({ value: mockDataValid });
      return Promise.resolve({ value: null });
    });

    const mod = await freshModule();
    const result = await mod.loadRuntimeKeys({ password: 'test-pass' });

    expect(result.success).toBe(false);
    expect(result.loaded).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Cerebras');
  });

  it('loads without validation (validate: false)', async () => {
    const mockDataShort = JSON.stringify({
      key: 'short',
      expiresAt: Date.now() + 1000000,
      hash: 'hash-short',
    });

    Preferences.get.mockImplementation(() => Promise.resolve({ value: mockDataShort }));

    const mod = await freshModule();
    const result = await mod.loadRuntimeKeys({ password: 'test-pass', validate: false });

    expect(result.success).toBe(true);
    expect(result.loaded).toBe(2);
  });

  it('throws KeyLoadError on timeout', async () => {
    Preferences.get.mockImplementation(() => new Promise(() => {})); // hang

    const mod = await freshModule();
    await expect(mod.loadRuntimeKeys({ password: 'test-pass' })).rejects.toHaveProperty('code', 'LOAD_ERROR');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// GROUP 4: Save & Validation
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — saveRuntimeKeys & validation', () => {
  it('saves valid keys, trims, updates state, dan hash benar', async () => {
    const mod = await freshModule();
    const result = await mod.saveRuntimeKeys(
      { cerebras: '  csk-valid-long-key-12345  ', groq: 'gsk-valid-long-key-67890' },
      { password: 'test-pass' }
    );

    expect(result.success).toBe(true);
    expect(result.saved).toBe(2);
    expect(mod.getRuntimeCerebrasKey()).toBe('csk-valid-long-key-12345');

    // Extra coverage: hash harus ter-set di state
    const status = mod.checkKeysStatus();
    expect(status.hasCerebras).toBe(true);
  });

  it('treats null/undefined/empty as skip (tidak simpan)', async () => {
    const mod = await freshModule();
    await mod.saveRuntimeKeys({ cerebras: null, groq: undefined }, { password: 'test-pass' });

    expect(mod.getRuntimeCerebrasKey()).toBe('');
    expect(mod.getRuntimeGroqKey()).toBe('');
    expect(Preferences.set).not.toHaveBeenCalled(); // coverage skip storage
  });

  it('throws KeyValidationError for short key', async () => {
    const mod = await freshModule();
    await expect(
      mod.saveRuntimeKeys({ cerebras: 'short', groq: 'gsk-valid-long-key-1234567890' }, { password: 'test-pass' })
    ).rejects.toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('throws KeyValidationError for non-string key', async () => {
    const mod = await freshModule();
    await expect(
      mod.saveRuntimeKeys({ cerebras: 123, groq: 'valid-groq' }, { password: 'test-pass' })
    ).rejects.toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('emits console.warn untuk sk- prefix di Cerebras', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mod = await freshModule();
    await mod.saveRuntimeKeys(
      { cerebras: 'sk-12345678901234567890', groq: 'gsk-valid-long-key-1234567890' },
      { password: 'test-pass' }
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Key Warning]')
    );
  });

  it('throws KeySaveError kalau Preferences.set gagal', async () => {
    Preferences.set.mockRejectedValueOnce(new Error('Storage full'));

    const mod = await freshModule();
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
  it('rejects expired keys dan set flag cerebrasExpired', async () => {
    const expiredData = JSON.stringify({
      key: 'csk-valid-long-key-1234567890',
      expiresAt: Date.now() - 10000,
      hash: 'hash-csk-valid-long-key-1234567890',
    });

    Preferences.get.mockImplementation(({ key }) => {
      if (key === 'yc_cerebras_key_enc') return Promise.resolve({ value: expiredData });
      return Promise.resolve({ value: null });
    });

    const mod = await freshModule();
    const result = await mod.loadRuntimeKeys({ password: 'test-pass' });

    expect(result.loaded).toBe(0);

    const status = mod.checkKeysStatus();
    expect(status.cerebrasExpired).toBe(true);
  });

  it('rejects tampered keys (hash mismatch)', async () => {
    const tamperedData = JSON.stringify({
      key: 'csk-valid-long-key-1234567890',
      expiresAt: Date.now() + 1000000,
      hash: 'wrong-hash-value',
    });

    Preferences.get.mockImplementation(({ key }) => {
      if (key === 'yc_cerebras_key_enc') return Promise.resolve({ value: tamperedData });
      return Promise.resolve({ value: null });
    });

    const mod = await freshModule();
    const result = await mod.loadRuntimeKeys({ password: 'test-pass' });

    expect(result.loaded).toBe(0);
  });

  it('rejects corrupt data (decrypt/JSON fail)', async () => {
    Preferences.get.mockImplementation(() => Promise.resolve({ value: '{ invalid json }' }));

    const mod = await freshModule();
    const result = await mod.loadRuntimeKeys({ password: 'test-pass' });

    expect(result.loaded).toBe(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// GROUP 6: Clear & Force Reload
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — clear & force reload', () => {
  it('clearRuntimeKeys reset storage dan memory', async () => {
    const mod = await freshModule();
    await mod.saveRuntimeKeys(
      { cerebras: 'csk-valid-long-key-1234567890', groq: 'gsk-valid-long-key-1234567890' },
      { password: 'test-pass' }
    );

    await mod.clearRuntimeKeys();

    expect(mod.getRuntimeCerebrasKey()).toBe('');
    expect(mod.checkKeysStatus().loaded).toBe(false);
    expect(Preferences.remove).toHaveBeenCalledTimes(2);
  });

  it('throws CLEAR_ERROR kalau Preferences.remove gagal', async () => {
    Preferences.remove.mockRejectedValueOnce(new Error('IO error'));

    const mod = await freshModule();
    await expect(mod.clearRuntimeKeys()).rejects.toHaveProperty('code', 'CLEAR_ERROR');
  });

  it('forceReloadKeys reset lalu reload dengan password', async () => {
    const mod = await freshModule();
    await mod.saveRuntimeKeys(
      { cerebras: 'old-csk-long-key-1234567890', groq: 'old-gsk-long-key-1234567890' },
      { password: 'test-pass' }
    );

    const newData = JSON.stringify({
      key: 'new-csk-long-key-1234567890',
      expiresAt: Date.now() + 1000000,
      hash: 'hash-new-csk-long-key-1234567890',
    });

    Preferences.get.mockImplementation(({ key }) => {
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
    const mod = await freshModule();
    await expect(mod.initializeRuntimeKeys({ password: 'test-pass' })).resolves.not.toThrow();
  });

  it('handles validation failure gracefully (tidak throw)', async () => {
    const mockDataShort = JSON.stringify({
      key: 'short',
      expiresAt: Date.now() + 1000000,
      hash: 'hash-short',
    });

    Preferences.get.mockImplementation(() => Promise.resolve({ value: mockDataShort }));

    const mod = await freshModule();
    await expect(mod.initializeRuntimeKeys({ password: 'test-pass' })).resolves.not.toThrow();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// BONUS: Coverage tambahan (PBKDF2 & CONFIG)
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — CONFIG & Security Internals', () => {
  it('menggunakan PBKDF2 iterations yang lebih aman (300000)', () => {
    expect(CONFIG.PBKDF2_ITERATIONS).toBe(300000);
  });

  it('LOAD_TIMEOUT sudah dikurangi jadi 1500ms', () => {
    expect(CONFIG.LOAD_TIMEOUT).toBe(1500);
  });
});
