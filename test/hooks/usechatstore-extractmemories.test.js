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

describe('useChatStore — extractMemories', () => {
  it('skips when AI reply too short', async () => {
    const { result } = renderHook(() => useChatStore());
    await act(async () => {
      await result.current.extractMemories('fix bug', 'ok', 'project');
    });
    expect(mockAskCerebrasStream).not.toHaveBeenCalled();
  });

  it('skips when no technical signals', async () => {
    const { result } = renderHook(() => useChatStore());
    const nonTechnical = 'I am fine and happy today, nothing technical here at all, just chatting casually about nothing in particular whatsoever.';
    await act(async () => {
      await result.current.extractMemories('how are you', nonTechnical.repeat(3), 'project');
    });
    expect(mockAskCerebrasStream).not.toHaveBeenCalled();
  });

  it('calls AI and saves memory for technical content', async () => {
    mockAskCerebrasStream.mockResolvedValueOnce('• Gunakan async/await\n• Prefer const');
    const { result } = renderHook(() => useChatStore());
    const technicalReply = 'Fixed the bug in src/api.js using async/await pattern. '.repeat(10);
    await act(async () => {
      await result.current.extractMemories('fix the error', technicalReply, '/project');
    });
    expect(mockAskCerebrasStream).toHaveBeenCalled();
    expect(result.current.memories.length).toBeGreaterThan(0);
  });

  it('skips saving when AI returns "none"', async () => {
    mockAskCerebrasStream.mockResolvedValueOnce('none');
    const { result } = renderHook(() => useChatStore());
    const technicalReply = 'Fixed the bug in src/api.js using async/await pattern. '.repeat(10);
    await act(async () => {
      await result.current.extractMemories('fix', technicalReply, '/project');
    });
    expect(result.current.memories).toHaveLength(0);
  });
});
