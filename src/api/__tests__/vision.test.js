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
});
