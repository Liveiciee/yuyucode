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

describe('useChatStore — getRelevantMemories', () => {
  it('returns empty when no memories', () => {
    const { result } = renderHook(() => useChatStore());
    expect(result.current.getRelevantMemories('something')).toEqual([]);
  });

  it('returns ranked memories when present', () => {
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.setMemories([
        { id: 1, text: 'use arrow functions' },
        { id: 2, text: 'prefer const' },
      ]);
    });
    const ranked = result.current.getRelevantMemories('arrow function');
    expect(ranked.length).toBeGreaterThan(0);
  });

  it('falls back to most recent when tfidf scores are all 0', async () => {
    const { tfidfRank } = await import('../features.js');
    tfidfRank.mockReturnValueOnce([
      { id: 1, text: 'mem1', _score: 0 },
      { id: 2, text: 'mem2', _score: 0 },
    ]);
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.setMemories([{ id: 1, text: 'mem1' }, { id: 2, text: 'mem2' }]);
    });
    expect(result.current.getRelevantMemories('unrelated').length).toBeGreaterThan(0);
  });
});
