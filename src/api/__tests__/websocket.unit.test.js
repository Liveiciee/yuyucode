import { describe, it, expect, vi } from 'vitest';
import { execStream } from '../websocket.js';

describe('execStream', () => {
  it('should handle WebSocket connection error', async () => {
    globalThis.WebSocket = vi.fn(() => { throw new Error('No WebSocket'); });
    await expect(execStream('ls', '/tmp', () => {}, null)).rejects.toThrow('WebSocket tidak tersedia');
  });
});
