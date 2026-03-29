export const CONFIG = {
  STORAGE_KEYS: {
    CEREBRAS: 'yc_cerebras_key_enc',
    GROQ: 'yc_groq_key_enc',
  },
  KEY_MIN_LENGTH: 20,
  KEY_MAX_LENGTH: 512,
  LOAD_TIMEOUT: 1500,
  EXPIRY_HOURS: 24,
  IV_SIZE: 12,
  SALT_SIZE: 16,
  PBKDF2_ITERATIONS: 300000,
};
