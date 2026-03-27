// src/runtimeKeys.test.ts
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
} from './runtimeKeys.js';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

const { Preferences } = await import('@capacitor/preferences');

async function freshModule() {
  vi.resetModules();
  return import('./runtimeKeys.js');
}

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
// Core Getters & Status
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
    });
  });

  it('checkKeysStatus reflects loaded keys', async () => {
    const mod = await freshModule();
    await mod.saveRuntimeKeys('csk-long-valid-key-12345678901234567890', 'gsk-long-valid-key-12345678901234567890');

    const status = mod.checkKeysStatus();
    expect(status.hasCerebras).toBe(true);
    expect(status.hasGroq).toBe(true);
    expect(status.both).toBe(true);
    expect(status.loaded).toBe(true);
    expect(status.lastLoaded).toBeDefined();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// loadRuntimeKeys
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — loadRuntimeKeys', () => {
  it('loads both keys successfully with validation', async () => {
    Preferences.get.mockImplementation(({ key }) =>
      Promise.resolve({ value: key === 'yc_cerebras_key' ? 'csk-valid-long-key-1234567890' : 'gsk-valid-long-key-0987654321' })
    );

    const mod = await freshModule();
    const result = await mod.loadRuntimeKeys();

    expect(result.success).toBe(true);
    expect(result.loaded).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it('loads with some validation failures', async () => {
    Preferences.get.mockImplementation(({ key }) =>
      Promise.resolve({ value: key === 'yc_cerebras_key' ? 'short' : 'gsk-valid-long-key-1234567890' })
    );

    const mod = await freshModule();
    const result = await mod.loadRuntimeKeys();

    expect(result.success).toBe(false);
    expect(result.loaded).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Cerebras');
  });

  it('loads without validation', async () => {
    Preferences.get.mockImplementation(({ key }) =>
      Promise.resolve({ value: key === 'yc_cerebras_key' ? 'short' : 'short-groq' })
    );

    const mod = await freshModule();
    const result = await mod.loadRuntimeKeys({ validate: false });

    expect(result.success).toBe(true);
    expect(result.loaded).toBe(2);
  });

  it('throws KeyLoadError on timeout', async () => {
    Preferences.get.mockImplementation(() => new Promise(() => {}));

    const mod = await freshModule();
    await expect(mod.loadRuntimeKeys()).rejects.toThrow(KeyLoadError);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// saveRuntimeKeys + Validation
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — saveRuntimeKeys & validation', () => {
  it('saves valid keys, trims, updates state', async () => {
    const mod = await freshModule();
    const result = await mod.saveRuntimeKeys('  csk-valid-long-key-12345  ', 'gsk-valid-long-key-67890');

    expect(result.success).toBe(true);
    expect(result.saved).toBe(2);
    expect(mod.getRuntimeCerebrasKey()).toBe('csk-valid-long-key-12345');
  });

  it('treats null/undefined/empty as empty string', async () => {
    const mod = await freshModule();
    await mod.saveRuntimeKeys(null, undefined);

    expect(mod.getRuntimeCerebrasKey()).toBe('');
    expect(mod.getRuntimeGroqKey()).toBe('');
  });

  it('throws KeyValidationError for short key', async () => {
    const mod = await freshModule();
    await expect(mod.saveRuntimeKeys('short', 'gsk-valid-long-key-1234567890'))
      .rejects.toThrow(KeyValidationError);
  });

  it('throws KeyValidationError for non-string key', async () => {
    const mod = await freshModule();
    await expect(mod.saveRuntimeKeys(123 as any, 'valid-groq'))
      .rejects.toThrow(KeyValidationError);
  });

  it('emits console.warn for suspicious sk- prefix on Cerebras', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mod = await freshModule();
    await mod.saveRuntimeKeys('sk-12345678901234567890', 'gsk-valid');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Key Warning]'),
      expect.any(String)
    );
  });

  it('throws KeySaveError when Preferences.set fails', async () => {
    Preferences.set.mockRejectedValueOnce(new Error('Storage full'));

    const mod = await freshModule();
    await expect(mod.saveRuntimeKeys('valid-cerebras-long-key-12345', 'valid-groq'))
      .rejects.toThrow(KeySaveError);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Clear & Force Reload
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — clear & force reload', () => {
  it('clearRuntimeKeys resets storage and memory', async () => {
    const mod = await freshModule();
    await mod.saveRuntimeKeys('csk-xxx', 'gsk-yyy');

    await mod.clearRuntimeKeys();

    expect(mod.getRuntimeCerebrasKey()).toBe('');
    expect(mod.checkKeysStatus().loaded).toBe(false);
    expect(Preferences.remove).toHaveBeenCalledTimes(2);
  });

  it('throws KeyStorageError on clear failure', async () => {
    Preferences.remove.mockRejectedValueOnce(new Error('IO error'));

    const mod = await freshModule();
    await expect(mod.clearRuntimeKeys()).rejects.toThrow(KeyStorageError);
  });

  it('forceReloadKeys resets then reloads', async () => {
    const mod = await freshModule();
    await mod.saveRuntimeKeys('old-csk', 'old-gsk');

    Preferences.get.mockImplementation(({ key }) =>
      Promise.resolve({ value: key === 'yc_cerebras_key' ? 'new-csk-long-key' : 'new-gsk-long-key' })
    );

    const result = await mod.forceReloadKeys();
    expect(result.loaded).toBe(2);
    expect(mod.getRuntimeCerebrasKey()).toBe('new-csk-long-key');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Initialize
// ──────────────────────────────────────────────────────────────────────────────
describe('runtimeKeys — initializeRuntimeKeys', () => {
  it('succeeds silently on normal load', async () => {
    const mod = await freshModule();
    await expect(mod.initializeRuntimeKeys()).resolves.not.toThrow();
  });

  it('handles validation failure gracefully (no throw)', async () => {
    Preferences.get.mockImplementation(({ key }) =>
      Promise.resolve({ value: key === 'yc_cerebras_key' ? 'short' : 'valid-groq' })
    );

    const mod = await freshModule();
    await expect(mod.initializeRuntimeKeys()).resolves.not.toThrow();
  });
});
