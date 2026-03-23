// ── Runtime key store — overrides baked-in env vars at runtime ───────────────
import { Preferences } from '@capacitor/preferences';

let _cerebras = '';
let _groq      = '';

export async function loadRuntimeKeys() {
  const [c, g] = await Promise.all([
    Preferences.get({ key: 'yc_cerebras_key' }),
    Preferences.get({ key: 'yc_groq_key' }),
  ]);
  _cerebras = c.value || '';
  _groq      = g.value || '';
}

export async function saveRuntimeKeys(cerebras, groq) {
  _cerebras = cerebras || '';
  _groq      = groq     || '';
  await Promise.all([
    Preferences.set({ key: 'yc_cerebras_key', value: _cerebras }),
    Preferences.set({ key: 'yc_groq_key',      value: _groq }),
  ]);
}

export function getRuntimeCerebrasKey() { return _cerebras; }
export function getRuntimeGroqKey()     { return _groq; }
