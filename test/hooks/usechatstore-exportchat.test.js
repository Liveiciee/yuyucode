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
vi.mock('../../src/api.js', () => ({
  askCerebrasStream: mockAskCerebrasStream,
  callServer: vi.fn().mockResolvedValue({ ok: true, data: '' }),
}));
vi.mock('../../src/features.js', () => ({
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

import { useChatStore } from '../../src/hooks/useChatStore.js';

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

describe('useChatStore — exportChat', () => {
  it('creates blob and triggers download', () => {
    // Spy only on createElement('a') — pass all others through to avoid
    // breaking renderHook which internally calls createElement('div') etc.
    const realCreateElement = document.createElement.bind(document);
    const mockAnchor = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockImplementation((tag, ...args) => {
      if (tag === 'a') return mockAnchor;
      return realCreateElement(tag, ...args);
    });

    const { result } = renderHook(() => useChatStore());
    act(() => { result.current.setMessages([{ role: 'user', content: 'test' }]); });
    act(() => { result.current.exportChat(); });

    expect(mockAnchor.click).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
