// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockPreferencesSet    = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockPreferencesRemove = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockAskCerebrasStream = vi.hoisted(() => vi.fn().mockResolvedValue('• Gunakan arrow function'));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get:    vi.fn().mockResolvedValue({ value: null }),
    set:    mockPreferencesSet,
    remove: mockPreferencesRemove,
  },
}));
vi.mock('../api.js', () => ({
  askCerebrasStream: mockAskCerebrasStream,
  callServer: vi.fn().mockResolvedValue({ ok: true, data: '' }),
}));
vi.mock('../features.js', () => ({
  tfidfRank: vi.fn((mems, _txt, n) => mems.slice(0, n).map(m => ({ ...m, _score: 1 }))),
}));

// Mock useDb — tests run in happy-dom (web), SQLite unavailable
const mockDbSaveMessages    = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockDbSaveMemories    = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockDbSaveCheckpoint  = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockDbLoadCheckpoints = vi.hoisted(() => vi.fn().mockResolvedValue(null));
const mockDbLoadMessages = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockDbSearchMessages = vi.hoisted(() => vi.fn().mockResolvedValue([]));
vi.mock('./useDb.js', () => ({
  dbSaveMessages:    mockDbSaveMessages,
  dbLoadMessages:    mockDbLoadMessages,
  dbSearchMessages:  mockDbSearchMessages,
  dbSaveMemories:    mockDbSaveMemories,
  dbLoadMemories:    vi.fn().mockResolvedValue([]),
  dbSaveCheckpoint:  mockDbSaveCheckpoint,
  dbLoadCheckpoints: mockDbLoadCheckpoints,
}));

import { useChatStore } from './useChatStore.js';

beforeEach(() => {
  vi.clearAllMocks();
  // clearAllMocks resets implementations — restore defaults
  mockPreferencesSet.mockResolvedValue(undefined);
  mockPreferencesRemove.mockResolvedValue(undefined);
  mockAskCerebrasStream.mockResolvedValue('• Gunakan arrow function');
  global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
  global.URL.revokeObjectURL = vi.fn();
});

// ── Initial state ─────────────────────────────────────────────────────────────

describe('useChatStore — message operations', () => {
  it('deleteMessage removes by index', () => {
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.setMessages([
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' },
      ]);
    });
    act(() => { result.current.deleteMessage(0); });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('hello');
  });

  it('editMessage updates content by index', () => {
    const { result } = renderHook(() => useChatStore());
    act(() => { result.current.setMessages([{ role: 'user', content: 'old' }]); });
    act(() => { result.current.editMessage(0, 'new content'); });
    expect(result.current.messages[0].content).toBe('new content');
  });

  it('searchMessages finds matches case-insensitively', async () => {
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.setMessages([
        { role: 'user', content: 'Fix the React bug' },
        { role: 'assistant', content: 'Sure, here is the fix' },
        { role: 'user', content: 'Thanks' },
      ]);
    });
    const matches = await result.current.searchMessages('react');
    expect(matches).toHaveLength(1);
    expect(matches[0].content).toContain('React');
  });

  it('searchMessages returns empty for blank query', async () => {
    const { result } = renderHook(() => useChatStore());
    expect(await result.current.searchMessages('')).toEqual([]);
    expect(await result.current.searchMessages('   ')).toEqual([]);
  });
});
