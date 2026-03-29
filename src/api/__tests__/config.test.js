import { describe, it, expect } from 'vitest';
import { CONFIG, MODELS } from '../../api.js';

describe('CONFIG', () => {
  it('has AI config with default values', () => {
    expect(CONFIG.AI.MAX_TOKENS.default).toBe(4096);
    expect(CONFIG.AI.DEFAULT_TEMPERATURE).toBe(0.3);
  });

  it('has retry configuration', () => {
    expect(CONFIG.RETRY.MAX_ATTEMPTS).toBe(5);
    expect(CONFIG.RETRY.RETRYABLE_STATUSES).toContain(429);
  });
});

describe('MODELS', () => {
  it('is an array', () => {
    expect(Array.isArray(MODELS)).toBe(true);
  });

  it('each model has id and provider', () => {
    MODELS.forEach(model => {
      expect(model).toHaveProperty('id');
      expect(model).toHaveProperty('provider');
    });
  });
});
