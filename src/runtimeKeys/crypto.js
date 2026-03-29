import { CONFIG } from './config.js';
import { textEncoder, textDecoder, BufferCtor } from './polyfills.js';
import { preferencesGet, preferencesSet, preferencesRemove } from './storage.js';

function uint8ArrayToBase64(bytes) {
  if (BufferCtor) {
    return BufferCtor.from(bytes).toString('base64');
  }
  if (typeof btoa !== 'function') {
    throw new Error('Base64 encoder is not available');
  }
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToUint8Array(base64) {
  if (BufferCtor) {
    return new Uint8Array(BufferCtor.from(base64, 'base64'));
  }
  if (typeof atob !== 'function') {
    throw new Error('Base64 decoder is not available');
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function generateRandomBytes(length) {
  const cryptoApi = globalThis?.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error('Web Crypto API is not available');
  }
  return cryptoApi.getRandomValues(new Uint8Array(length));
}

export async function deriveKey(password, salt) {
  const cryptoApi = globalThis?.crypto;
  if (!cryptoApi?.subtle) {
    throw new Error('Web Crypto Subtle API is not available');
  }
  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return cryptoApi.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: CONFIG.PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data, password) {
  const cryptoApi = globalThis?.crypto;
  if (!cryptoApi?.subtle) {
    throw new Error('Web Crypto Subtle API is not available');
  }
  const salt = generateRandomBytes(CONFIG.SALT_SIZE);
  const iv = generateRandomBytes(CONFIG.IV_SIZE);
  const key = await deriveKey(password, salt);
  const encoded = textEncoder.encode(data);
  const encrypted = await cryptoApi.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const combined = new Uint8Array(CONFIG.SALT_SIZE + CONFIG.IV_SIZE + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, CONFIG.SALT_SIZE);
  combined.set(new Uint8Array(encrypted), CONFIG.SALT_SIZE + CONFIG.IV_SIZE);

  return uint8ArrayToBase64(combined);
}

export async function decryptData(encryptedBase64, password) {
  if (encryptedBase64?.startsWith('{') && encryptedBase64.endsWith('}')) {
    return encryptedBase64;
  }

  try {
    const cryptoApi = globalThis?.crypto;
    if (!cryptoApi?.subtle) {
      throw new Error('Web Crypto Subtle API is not available');
    }
    const combined = base64ToUint8Array(encryptedBase64);
    if (combined.length < CONFIG.SALT_SIZE + CONFIG.IV_SIZE) {
      throw new Error('Invalid data format');
    }

    const salt = combined.slice(0, CONFIG.SALT_SIZE);
    const iv = combined.slice(CONFIG.SALT_SIZE, CONFIG.SALT_SIZE + CONFIG.IV_SIZE);
    const data = combined.slice(CONFIG.SALT_SIZE + CONFIG.IV_SIZE);

    const key = await deriveKey(password, salt);
    const decrypted = await cryptoApi.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return textDecoder.decode(new Uint8Array(decrypted));
  } catch (_error) {
    throw new Error('Decryption failed: Wrong password or corrupted data');
  }
}

export async function calculateHash(data) {
  const msgBuffer = textEncoder.encode(data);
  const cryptoApi = globalThis?.crypto;
  if (!cryptoApi?.subtle) {
    throw new Error('Web Crypto Subtle API is not available');
  }
  const hashBuffer = await cryptoApi.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
