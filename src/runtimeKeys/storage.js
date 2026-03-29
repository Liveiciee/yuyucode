import { Preferences } from '@capacitor/preferences';

const MEMORY_PREFS = new Map();

export async function preferencesGet(key) {
  try {
    const result = await Preferences.get({ key });
    if (result?.value != null) return result;
  } catch (_error) {
    // Fallback to in-memory storage when Capacitor bridge is unavailable (tests/node).
  }
  return { value: MEMORY_PREFS.get(key) ?? null };
}

export async function preferencesSet(key, value) {
  MEMORY_PREFS.set(key, value);
  try {
    await Preferences.set({ key, value });
  } catch (error) {
    const msg = String(error?.message || error || '');
    const isUnavailableBridge = /not implemented|unavailable|not available/i.test(msg);
    if (!isUnavailableBridge) {
      throw error;
    }
  }
}

export async function preferencesRemove(key) {
  MEMORY_PREFS.delete(key);
  await Preferences.remove({ key });
}
