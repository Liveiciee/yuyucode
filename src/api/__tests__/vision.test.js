// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { injectVisionImage } from '../providers/base.js';

describe('injectVisionImage', () => {
  it('does nothing when imageBase64 is null/undefined', () => {
    const messages = [{ role: 'user', content: 'hello' }];
    const result = injectVisionImage(messages, null);
    expect(result).toEqual(messages);
  });

  it('injects image into last user message only', () => {
    const messages = [
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'reply' },
      { role: 'user', content: 'last' },
    ];
    const result = injectVisionImage(messages, 'base64data');

    expect(result[0].content).toBe('first');
    expect(result[1].content).toBe('reply');
    expect(Array.isArray(result[2].content)).toBe(true);
    expect(result[2].content.some(c => c.type === 'image_url')).toBe(true);
  });

  it('handles string content', () => {
    const messages = [{ role: 'user', content: 'describe this' }];
    const result = injectVisionImage(messages, 'base64data');

    expect(result[0].content).toEqual([
      { type: 'text', text: 'describe this' },
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,base64data' } },
    ]);
  });

  it('handles array content (preserves text, adds image)', () => {
    const messages = [{
      role: 'user',
      content: [{ type: 'text', text: 'describe this' }]
    }];
    const result = injectVisionImage(messages, 'base64data');

    expect(Array.isArray(result[0].content)).toBe(true);
    expect(result[0].content.find(c => c.type === 'text')).toBeDefined();
    expect(result[0].content.find(c => c.type === 'image_url')).toBeDefined();
  });

  it('handles null content (converts to empty string)', () => {
    const messages = [{ role: 'user', content: null }];
    const result = injectVisionImage(messages, 'base64data');

    expect(Array.isArray(result[0].content)).toBe(true);
    expect(result[0].content.find(c => c.type === 'text').text).toBe('');
  });

  it('skips non-last messages even if they are user role', () => {
    const messages = [
      { role: 'user', content: 'first message' },
      { role: 'user', content: 'second message' },
    ];
    const result = injectVisionImage(messages, 'base64data');

    expect(result[0].content).toBe('first message');
    expect(Array.isArray(result[1].content)).toBe(true);
  });

  it('joins multiple text parts and ignores non-text array content', () => {
    const messages = [{
      role: 'user',
      content: [
        { type: 'text', text: 'first' },
        { type: 'image_url', image_url: { url: 'x' } },
        { type: 'text', text: 'second' },
      ],
    }];

    const result = injectVisionImage(messages, 'base64data');
    const textPart = result[0].content.find(c => c.type === 'text');
    const imageParts = result[0].content.filter(c => c.type === 'image_url');

    expect(textPart.text).toBe('first second');
    expect(imageParts).toHaveLength(1);
    expect(imageParts[0].image_url.url).toBe('data:image/jpeg;base64,base64data');
  });
});
