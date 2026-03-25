// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { simpleResponse } from './simpleResponse.js';

describe('simpleResponse', () => {
  it('calls setMessages exactly once', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, 'Hello');
    expect(setMessages).toHaveBeenCalledTimes(1);
  });

  it('passes a function (updater) to setMessages', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, 'Hello');
    expect(typeof setMessages.mock.calls[0][0]).toBe('function');
  });

  it('adds assistant message with content', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, 'Hello world');

    const updater = setMessages.mock.calls[0][0];
    const result = updater([]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      role: 'assistant',
      content: 'Hello world',
      actions: [],
    });
  });

  it('role is always assistant', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, 'anything');

    const updater = setMessages.mock.calls[0][0];
    const result = updater([]);

    expect(result[0].role).toBe('assistant');
  });

  it('actions is always an empty array', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, 'anything');

    const updater = setMessages.mock.calls[0][0];
    const result = updater([]);

    expect(result[0].actions).toEqual([]);
    expect(Array.isArray(result[0].actions)).toBe(true);
  });

  it('preserves existing messages', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, 'New message');

    const updater = setMessages.mock.calls[0][0];
    const oldMessages = [{ role: 'user', content: 'Hello', actions: [] }];
    const result = updater(oldMessages);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(oldMessages[0]);
    expect(result[1].content).toBe('New message');
  });

  it('does not mutate the original messages array', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, 'Test');

    const updater = setMessages.mock.calls[0][0];
    const original = [{ role: 'user', content: 'Hi', actions: [] }];
    const snapshot = [...original];

    updater(original);

    expect(original).toEqual(snapshot);
    expect(original).toHaveLength(1);
  });

  it('returns a new array reference', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, 'Test');

    const updater = setMessages.mock.calls[0][0];
    const original = [];
    const result = updater(original);

    expect(result).not.toBe(original);
  });

  it('works with empty string content', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, '');

    const updater = setMessages.mock.calls[0][0];
    const result = updater([]);

    expect(result[0].content).toBe('');
  });

  it('works with special characters and unicode', () => {
    const setMessages = vi.fn();
    const content = '✅ Berhasil! <script>alert("xss")</script> \n\t emoji 🎉';
    simpleResponse(setMessages, content);

    const updater = setMessages.mock.calls[0][0];
    const result = updater([]);

    expect(result[0].content).toBe(content);
  });

  it('works with very long content', () => {
    const setMessages = vi.fn();
    const content = 'a'.repeat(10000);
    simpleResponse(setMessages, content);

    const updater = setMessages.mock.calls[0][0];
    const result = updater([]);

    expect(result[0].content).toHaveLength(10000);
  });

  it('multiple calls are independent', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, 'First');
    simpleResponse(setMessages, 'Second');

    expect(setMessages).toHaveBeenCalledTimes(2);

    const updater1 = setMessages.mock.calls[0][0];
    const updater2 = setMessages.mock.calls[1][0];

    const result1 = updater1([]);
    const result2 = updater2([]);

    expect(result1[0].content).toBe('First');
    expect(result2[0].content).toBe('Second');
  });

  it('each message has its own actions array (not shared reference)', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, 'A');
    simpleResponse(setMessages, 'B');

    const updater1 = setMessages.mock.calls[0][0];
    const updater2 = setMessages.mock.calls[1][0];

    const msgA = updater1([])[0];
    const msgB = updater2([])[0];

    msgA.actions.push('x');
    expect(msgB.actions).toHaveLength(0);
  });

  it('appends to array with many existing messages', () => {
    const setMessages = vi.fn();
    simpleResponse(setMessages, 'Last');

    const updater = setMessages.mock.calls[0][0];
    const existing = Array.from({ length: 100 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `msg ${i}`,
      actions: [],
    }));

    const result = updater(existing);

    expect(result).toHaveLength(101);
    expect(result[100].content).toBe('Last');
  });
});
