import './polyfills.js'; // ensure polyfills run first
import { KeyStore } from './keystore.js';
import { CONFIG } from './config.js';
export {
  KeyStorageError,
  KeyValidationError,
  KeyLoadError,
  KeySaveError,
} from './errors.js';
export { CONFIG } from './config.js';
export { KeyStore } from './keystore.js';

const store = new KeyStore();

export const loadRuntimeKeys = (options) => store.load(options);
export const saveRuntimeKeys = (keys, options) => store.save(keys, options);
export const clearRuntimeKeys = () => store.clear();
export const getRuntimeCerebrasKey = () => store.getKey('cerebras');
export const getRuntimeGroqKey = () => store.getKey('groq');
export const checkKeysStatus = () => store.getStatus();
export const forceReloadKeys = (options = {}) => store.forceReload(options);
export const initializeRuntimeKeys = (options = {}) => store.initialize(options);
