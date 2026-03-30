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

describe('useChatStore — trimHistory', () => {
  it('returns unchanged when total chars under limit', () => {
    const { result } = renderHook(() => useChatStore());
    const msgs = [
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'world' },
    ];
    expect(result.current.trimHistory(msgs)).toHaveLength(2);
  });

  it('collapses middle messages when over 100k chars', () => {
    const { result } = renderHook(() => useChatStore());
    const bigContent = 'x'.repeat(10000);
    const msgs = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: bigContent,
    }));
    const trimmed = result.current.trimHistory(msgs);
    expect(trimmed.length).toBeLessThan(msgs.length);
    expect(trimmed.some(m => m.content.startsWith('[Ringkasan'))).toBe(true);
  });
});
