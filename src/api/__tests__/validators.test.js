import { describe, it, expect } from 'vitest';
import { validateMessages, validateApiKey, hasUsableApiKey, getProviderForModel, getMaxTokensForModel } from '../validators.js';
import { CONFIG, MODELS } from '../config.js';

describe('validators', () => {
  describe('validateMessages', () => {
    it('throws on non-array', () => {
      expect(() => validateMessages(null)).toThrow('messages');
    });
    it('throws on empty array', () => {
      expect(() => validateMessages([])).toThrow('messages');
    });
    it('throws on too many messages (>100)', () => {
      const many = Array(101).fill({ role: 'user', content: 'x' });
      expect(() => validateMessages(many)).toThrow('Too many messages');
    });
    it('throws on missing role', () => {
      expect(() => validateMessages([{ content: 'hi' }])).toThrow('messages[0]');
    });
    it('throws on missing content', () => {
      expect(() => validateMessages([{ role: 'user' }])).toThrow('messages[0]');
    });
    it('throws on content too large (>100k chars)', () => {
      const long = 'a'.repeat(100001);
      expect(() => validateMessages([{ role: 'user', content: long }])).toThrow('Content too large');
    });
    it('throws on total chars >500k', () => {
      const big = Array(10).fill({ role: 'user', content: 'a'.repeat(50001) });
      expect(() => validateMessages(big)).toThrow('Total content too large');
    });
    it('passes valid messages', () => {
      const valid = [{ role: 'user', content: 'hi' }];
      expect(validateMessages(valid)).toBe(true);
    });
  });

  describe('validateApiKey', () => {
    it('throws on empty key', () => {
      expect(() => validateApiKey('', 'cerebras')).toThrow('API key is required');
    });
    it('throws on too short', () => {
      expect(() => validateApiKey('short', 'cerebras')).toThrow('too short');
    });
    it('throws on placeholder', () => {
      expect(() => validateApiKey('your-key-here', 'cerebras')).toThrow('not configured');
    });
    it('passes valid key', () => {
      expect(validateApiKey('a'.repeat(20), 'cerebras')).toBe(true);
    });
  });

  describe('hasUsableApiKey', () => {
    it('returns false for non-string', () => {
      expect(hasUsableApiKey(null)).toBe(false);
    });
    it('returns false for short key', () => {
      expect(hasUsableApiKey('short')).toBe(false);
    });
    it('returns false for placeholder', () => {
      expect(hasUsableApiKey('your_key_here')).toBe(false);
    });
    it('returns true for valid key', () => {
      expect(hasUsableApiKey('a'.repeat(20))).toBe(true);
    });
  });

  describe('getProviderForModel', () => {
    it('returns provider from MODELS', () => {
      const models = [{ id: 'test', provider: 'cerebras' }];
      expect(getProviderForModel('test', models)).toBe('cerebras');
    });
    it('falls back to cerebras', () => {
      expect(getProviderForModel('unknown', [])).toBe('cerebras');
    });
  });

  describe('getMaxTokensForModel', () => {
    it('returns default when model not found', () => {
      const result = getMaxTokensForModel('unknown', [], CONFIG);
      expect(result).toBe(CONFIG.AI.MAX_TOKENS.default);
    });
    it('returns limited by contextWindow', () => {
      const models = [{ id: 'test', contextWindow: 5000 }];
      const result = getMaxTokensForModel('test', models, CONFIG);
      expect(result).toBe(Math.min(CONFIG.AI.MAX_TOKENS.default, 5000 - 100));
    });
  });
});
