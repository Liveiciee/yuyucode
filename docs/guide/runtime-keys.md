# Runtime Key Encryption

API keys for Cerebras and Groq are encrypted at rest using `src/runtimeKeys.js` — a singleton `KeyStore` class built on the Web Crypto API.

## Why This Exists

Keys baked into the APK at build time (via `VITE_CEREBRAS_API_KEY` env var) are readable by anyone who unpacks the APK. `runtimeKeys.js` provides an alternative: keys entered at runtime, encrypted before storage, expired automatically.

The two systems coexist. If runtime keys are present and valid, they take precedence over the baked-in build-time keys.

## Encryption Scheme

```
User enters key
    │
    ▼
PBKDF2-SHA256 (300,000 iterations, random 16-byte salt)
    │ derives
    ▼
AES-256-GCM key
    │
    ▼
Encrypt(key + metadata JSON, random 12-byte IV)
    │
    ▼
base64(salt ‖ IV ‖ ciphertext) → stored in Capacitor Preferences
```

Every `saveRuntimeKeys()` call generates a fresh salt and IV.

## Key Metadata

Each stored key wraps more than just the raw string:

```json
{
  "key": "csk-...",
  "createdAt": 1748000000000,
  "expiresAt": 1748086400000,
  "hash": "sha256 of key"
}
```

On load, `KeyStore` checks:
1. `expiresAt > Date.now()` — expired keys are silently dropped
2. `hash === SHA-256(key)` — integrity check, detects storage corruption

## Expiry

Keys expire after **24 hours**. After expiry, `KeyStore.load()` returns `null` for that provider — the app falls back to the build-time key. Re-enter keys with `/apikeys` to refresh the 24h window.

## API

```javascript
import {
  saveRuntimeKeys,
  loadRuntimeKeys,
  clearRuntimeKeys,
  getRuntimeCerebrasKey,
  getRuntimeGroqKey,
  checkKeysStatus,
  forceReloadKeys,
} from './runtimeKeys.js';

// Save (encrypts and persists)
await saveRuntimeKeys({ cerebras: 'csk-...', groq: 'gsk-...' }, { password, validate: true });

// Load (decrypts, checks expiry + integrity)
const result = await loadRuntimeKeys({ password, validate: true });
// → { success: true, loaded: 2, errors: [] }

// Quick access (from in-memory state after load)
const key = getRuntimeCerebrasKey(); // '' if not loaded or expired

// Status check
const status = checkKeysStatus();
// → { hasCerebras, hasGroq, both, loaded, cerebrasExpired, groqExpired }
```

## Error Classes

| Class | Code | When |
|-------|------|------|
| `KeyValidationError` | `VALIDATION_ERROR` | Key too short/long, wrong format |
| `KeyLoadError` | `LOAD_ERROR` | Decryption failed, timeout, corrupted data |
| `KeySaveError` | `SAVE_ERROR` | Preferences write failed |
| `KeyStorageError` | `MISSING_PASSWORD` | Password not provided to load/save |

## Changing Keys

```bash
/apikeys
```

Opens `ApiKeySettings.jsx` — a panel that calls `saveRuntimeKeys()` directly. No APK rebuild, no restart required. New keys take effect on the next AI call.

## Constraints

- `KEY_MIN_LENGTH`: 20 characters
- `KEY_MAX_LENGTH`: 512 characters
- `LOAD_TIMEOUT`: 1500ms — if Preferences takes longer, `KeyLoadError` is thrown
- `PBKDF2_ITERATIONS`: 300,000 — high enough to resist brute-force, fast enough on Snapdragon 680 (~200ms)

::: tip Password
`saveRuntimeKeys` and `loadRuntimeKeys` require a `password` parameter used as the PBKDF2 passphrase. In practice this is derived from a device-stable value (e.g. device ID or a fixed app secret) so the user never has to type it manually.
:::
