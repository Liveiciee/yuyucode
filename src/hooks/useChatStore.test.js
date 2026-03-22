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
vi.mock('./useDb.js', () => ({
  dbSaveMessages:    mockDbSaveMessages,
  dbLoadMessages:    vi.fn().mockResolvedValue([]),
  dbSearchMessages:  vi.fn().mockResolvedValue([]),
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
describe('useChatStore — initial state', () => {
  it('starts with welcome message', () => {
    const { result } = renderHook(() => useChatStore());
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('assistant');
  });

  it('starts with empty input and not loading', () => {
    const { result } = renderHook(() => useChatStore());
    expect(result.current.input).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.agentRunning).toBe(false);
  });
});

// ── Message operations ────────────────────────────────────────────────────────
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

// ── clearChat ─────────────────────────────────────────────────────────────────
describe('useChatStore — clearChat', () => {
  it('resets to single welcome message and calls Preferences.remove', () => {
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.setMessages([
        { role: 'user', content: 'a' },
        { role: 'assistant', content: 'b' },
      ]);
    });
    act(() => { result.current.clearChat(); });
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('assistant');
    expect(mockPreferencesRemove).toHaveBeenCalledWith({ key: 'yc_history' });
  });
});

// ── persistMessages ───────────────────────────────────────────────────────────
describe('useChatStore — persistMessages', () => {
  it('persists when more than 1 message', () => {
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.persistMessages([
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' },
      ]);
    });
    expect(mockDbSaveMessages).toHaveBeenCalled();
  });

  it('sets showFollowUp when last message is assistant', () => {
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.persistMessages([
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' },
      ]);
    });
    expect(result.current.showFollowUp).toBe(true);
  });

  it('does not persist when only 1 message', () => {
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.persistMessages([{ role: 'assistant', content: 'hi' }]);
    });
    expect(mockPreferencesSet).not.toHaveBeenCalled();
  });
});

// ── trimHistory ───────────────────────────────────────────────────────────────
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

// ── loadChatPrefs ─────────────────────────────────────────────────────────────
describe('useChatStore — loadChatPrefs', () => {
  it('restores messages, memories, checkpoints', async () => {
    const { result } = renderHook(() => useChatStore());
    const msgs = [{ role: 'user', content: 'restored' }];
    const mems = [{ id: 1, text: 'mem1' }];
    await act(async () => {
      result.current.loadChatPrefs({
        history: JSON.stringify(msgs),
        memories: JSON.stringify(mems),
        checkpoints: JSON.stringify([]),
      });
      // Wait for async db calls to resolve and fall back to Preferences data
      await new Promise(r => setTimeout(r, 10));
    });
    expect(result.current.messages[0].content).toBe('restored');
    expect(result.current.memories[0].text).toBe('mem1');
  });

  it('handles invalid JSON gracefully', () => {
    const { result } = renderHook(() => useChatStore());
    expect(() => {
      act(() => {
        result.current.loadChatPrefs({ history: 'BAD', memories: '{invalid}' });
      });
    }).not.toThrow();
  });
});

// ── setMemories / setCheckpoints ──────────────────────────────────────────────
describe('useChatStore — persisted setters', () => {
  it('setMemories persists to Preferences', () => {
    const { result } = renderHook(() => useChatStore());
    act(() => { result.current.setMemories([{ id: 1, text: 'tip' }]); });
    expect(mockDbSaveMemories).toHaveBeenCalled();
  });

  it('setCheckpoints persists to Preferences', () => {
    const { result } = renderHook(() => useChatStore());
    act(() => { result.current.setCheckpoints([{ id: 1 }]); });
    expect(mockPreferencesSet).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'yc_checkpoints' })
    );
  });
});

// ── getRelevantMemories ───────────────────────────────────────────────────────
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

// ── extractMemories ───────────────────────────────────────────────────────────
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

// ── saveCheckpoint ────────────────────────────────────────────────────────────
describe('useChatStore — saveCheckpoint', () => {
  it('saves checkpoint and adds confirmation message', async () => {
    const mockCallServer = vi.fn().mockResolvedValue({ ok: true, data: 'diff output' });
    const { result } = renderHook(() => useChatStore());
    act(() => {
      result.current.setMessages([
        { role: 'user', content: 'build feature' },
        { role: 'assistant', content: 'done' },
      ]);
    });
    await act(async () => {
      await result.current.saveCheckpoint('/project', 'main', 'notes', mockCallServer);
    });
    expect(result.current.checkpoints).toHaveLength(1);
    expect(result.current.messages.at(-1).content).toContain('Checkpoint');
  });
});

// ── startRateLimitTimer ───────────────────────────────────────────────────────
describe('useChatStore — startRateLimitTimer', () => {
  it('sets rateLimitTimer to given value', () => {
    const { result } = renderHook(() => useChatStore());
    act(() => { result.current.startRateLimitTimer(30); });
    expect(result.current.rateLimitTimer).toBe(30);
  });
});

// ── exportChat ────────────────────────────────────────────────────────────────
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
