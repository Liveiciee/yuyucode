// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

async function freshModule() {
  vi.resetModules();
  return import('./runtimeKeys.js');
}

describe('runtimeKeys — initial state', () => {
  it('getRuntimeCerebrasKey returns empty string before load', async () => {
    const { getRuntimeCerebrasKey } = await freshModule();
    expect(getRuntimeCerebrasKey()).toBe('');
  });

  it('getRuntimeGroqKey returns empty string before load', async () => {
    const { getRuntimeGroqKey } = await freshModule();
    expect(getRuntimeGroqKey()).toBe('');
  });
});

describe('runtimeKeys — loadRuntimeKeys', () => {
  it('loads cerebras key from Preferences', async () => {
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockImplementation(({ key }) =>
      Promise.resolve({ value: key === 'yc_cerebras_key' ? 'csk-test' : null })
    );
    const { loadRuntimeKeys, getRuntimeCerebrasKey } = await freshModule();
    await loadRuntimeKeys();
    expect(getRuntimeCerebrasKey()).toBe('csk-test');
  });

  it('loads groq key from Preferences', async () => {
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockImplementation(({ key }) =>
      Promise.resolve({ value: key === 'yc_groq_key' ? 'gsk-test' : null })
    );
    const { loadRuntimeKeys, getRuntimeGroqKey } = await freshModule();
    await loadRuntimeKeys();
    expect(getRuntimeGroqKey()).toBe('gsk-test');
  });

  it('falls back to empty string when Preferences returns null', async () => {
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockResolvedValue({ value: null });
    const { loadRuntimeKeys, getRuntimeCerebrasKey, getRuntimeGroqKey } = await freshModule();
    await loadRuntimeKeys();
    expect(getRuntimeCerebrasKey()).toBe('');
    expect(getRuntimeGroqKey()).toBe('');
  });

  it('loads both keys in parallel', async () => {
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockImplementation(({ key }) =>
      Promise.resolve({ value: key === 'yc_cerebras_key' ? 'csk-abc' : 'gsk-xyz' })
    );
    const { loadRuntimeKeys, getRuntimeCerebrasKey, getRuntimeGroqKey } = await freshModule();
    await loadRuntimeKeys();
    expect(getRuntimeCerebrasKey()).toBe('csk-abc');
    expect(getRuntimeGroqKey()).toBe('gsk-xyz');
  });
});

describe('runtimeKeys — saveRuntimeKeys', () => {
  it('saves both keys to Preferences', async () => {
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockResolvedValue({ value: null });
    const { saveRuntimeKeys } = await freshModule();
    await saveRuntimeKeys('csk-new', 'gsk-new');
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_cerebras_key', value: 'csk-new' });
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_groq_key', value: 'gsk-new' });
  });

  it('updates in-memory values immediately', async () => {
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockResolvedValue({ value: null });
    const { saveRuntimeKeys, getRuntimeCerebrasKey, getRuntimeGroqKey } = await freshModule();
    await saveRuntimeKeys('csk-mem', 'gsk-mem');
    expect(getRuntimeCerebrasKey()).toBe('csk-mem');
    expect(getRuntimeGroqKey()).toBe('gsk-mem');
  });

  it('saves empty string when null passed', async () => {
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockResolvedValue({ value: null });
    const { saveRuntimeKeys, getRuntimeCerebrasKey, getRuntimeGroqKey } = await freshModule();
    await saveRuntimeKeys(null, null);
    expect(getRuntimeCerebrasKey()).toBe('');
    expect(getRuntimeGroqKey()).toBe('');
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_cerebras_key', value: '' });
    expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_groq_key', value: '' });
  });

  it('saves empty string when undefined passed', async () => {
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockResolvedValue({ value: null });
    const { saveRuntimeKeys, getRuntimeCerebrasKey } = await freshModule();
    await saveRuntimeKeys(undefined, undefined);
    expect(getRuntimeCerebrasKey()).toBe('');
  });

  it('saves raw value from caller', async () => {
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockResolvedValue({ value: null });
    const { saveRuntimeKeys, getRuntimeCerebrasKey } = await freshModule();
    await saveRuntimeKeys('csk-padded', 'gsk-padded');
    expect(getRuntimeCerebrasKey()).toBe('csk-padded');
  });

  it('overwrites previous key on second save', async () => {
    const { Preferences } = await import('@capacitor/preferences');
    Preferences.get.mockResolvedValue({ value: null });
    const { saveRuntimeKeys, getRuntimeCerebrasKey } = await freshModule();
    await saveRuntimeKeys('csk-first', 'gsk-first');
    await saveRuntimeKeys('csk-second', 'gsk-second');
    expect(getRuntimeCerebrasKey()).toBe('csk-second');
  });
});
