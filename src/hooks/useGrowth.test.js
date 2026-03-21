// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const mockPreferencesGet = vi.hoisted(() => vi.fn());
const mockPreferencesSet = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockAskCerebrasStream = vi.hoisted(() => vi.fn().mockResolvedValue('• Selalu pakai single quote\n• Prefer arrow function'));

vi.mock('@capacitor/preferences', () => ({
  Preferences: { get: mockPreferencesGet, set: mockPreferencesSet },
}));
vi.mock('../api.js', () => ({
  askCerebrasStream: mockAskCerebrasStream,
  callServer: vi.fn().mockResolvedValue({ ok: true, data: '' }),
}));

import { useGrowth } from './useGrowth.js';

// Freeze time so toLocaleDateString('id') is deterministic across hook & test
const FIXED_DATE = new Date('2025-01-15T10:00:00.000Z');
const TODAY_ID = FIXED_DATE.toLocaleDateString('id');

beforeEach(() => {
  // Hanya fake Date — jangan fake setTimeout/setInterval.
  // Kalau setTimeout ikut difake, React internal scheduler + waitFor polling
  // dari @testing-library beku → semua async test timeout 5s.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(FIXED_DATE);
  vi.clearAllMocks();

  mockPreferencesSet.mockResolvedValue(undefined);
  mockAskCerebrasStream.mockResolvedValue('• Selalu pakai single quote\n• Prefer arrow function');

  // Default: all null — but last_active = today so streak logic is skipped
  mockPreferencesGet.mockImplementation(({ key }) => {
    if (key === 'yc_last_active') return Promise.resolve({ value: TODAY_ID });
    return Promise.resolve({ value: null });
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useGrowth — initial state', () => {
  it('starts with 0 xp and 0 streak', async () => {
    const { result } = renderHook(() => useGrowth());
    // waitFor: wait until async useEffect has settled
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    expect(result.current.xp).toBe(0);
    expect(result.current.streak).toBe(0);
  });

  it('starts as Apprentice level', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    expect(result.current.level).toBe('Apprentice');
  });

  it('progress is 0 at start', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    expect(result.current.progress).toBe(0);
  });

  it('nextXp is 500 at start', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    expect(result.current.nextXp).toBe(500);
  });

  it('badges starts empty', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    expect(result.current.badges).toEqual([]);
  });

  it('exposes XP_TABLE', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    expect(result.current.XP_TABLE.message_sent).toBe(10);
    expect(result.current.XP_TABLE.commit_made).toBe(150);
  });

  it('loads persisted xp from Preferences', async () => {
    mockPreferencesGet.mockImplementation(({ key }) => {
      if (key === 'yc_xp') return Promise.resolve({ value: '250' });
      if (key === 'yc_last_active') return Promise.resolve({ value: TODAY_ID });
      return Promise.resolve({ value: null });
    });
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(result.current.xp).toBe(250));
  });

  it('increments streak when last active was yesterday', async () => {
    const YESTERDAY_ID = new Date(FIXED_DATE - 86400000).toLocaleDateString('id');
    mockPreferencesGet.mockImplementation(({ key }) => {
      if (key === 'yc_last_active') return Promise.resolve({ value: YESTERDAY_ID });
      if (key === 'yc_streak') return Promise.resolve({ value: '2' });
      return Promise.resolve({ value: null });
    });
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(result.current.streak).toBe(3));
  });

  it('resets streak to 1 when last active was more than 1 day ago', async () => {
    mockPreferencesGet.mockImplementation(({ key }) => {
      if (key === 'yc_last_active') return Promise.resolve({ value: '01/01/2020' });
      if (key === 'yc_streak') return Promise.resolve({ value: '10' });
      return Promise.resolve({ value: null });
    });
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(result.current.streak).toBe(1));
  });
});

describe('useGrowth — addXP', () => {
  it('adds XP for known event', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    act(() => { result.current.addXP('message_sent'); });
    expect(result.current.xp).toBe(10);
    expect(mockPreferencesSet).toHaveBeenCalled();
  });

  it('adds correct XP for different events', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    act(() => { result.current.addXP('file_written'); });
    expect(result.current.xp).toBe(50);
  });

  it('ignores unknown events (no XP change)', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    act(() => { result.current.addXP('nonexistent_event'); });
    expect(result.current.xp).toBe(0);
  });

  it('accumulates XP across multiple calls', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    act(() => { result.current.addXP('message_sent'); }); // 10
    act(() => { result.current.addXP('message_sent'); }); // 20
    act(() => { result.current.addXP('exec_success'); });  // 40
    expect(result.current.xp).toBe(40);
  });

  it('unlocks first_blood badge at 10 XP', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    act(() => { result.current.addXP('message_sent'); });
    expect(result.current.badges).toContain('first_blood');
  });

  it('sets newBadge on badge unlock', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    act(() => { result.current.addXP('message_sent'); });
    expect(result.current.newBadge).not.toBeNull();
    expect(result.current.newBadge.id).toBe('first_blood');
  });

  it('newBadge clears after 4s', async () => {
    // setTimeout tidak difake secara global (supaya waitFor + React scheduler bisa jalan).
    // Intercept hanya setTimeout(fn, 4000) dari addXP, capture callback-nya,
    // lalu invoke manual dalam act — tanpa perlu advanceTimersByTime.
    const realSetTimeout = globalThis.setTimeout;
    let badgeClearFn = null;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, delay, ...args) => {
      if (delay === 4000) {
        badgeClearFn = fn;
        return 1; // fake timer id, jangan schedule asli
      }
      return realSetTimeout(fn, delay, ...args); // semua timer lain tetap real
    });

    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());

    act(() => { result.current.addXP('message_sent'); });
    expect(result.current.newBadge).not.toBeNull();
    expect(badgeClearFn).not.toBeNull();

    act(() => { badgeClearFn(); }); // simulasi 4s lewat
    expect(result.current.newBadge).toBeNull();

    vi.restoreAllMocks();
  });

  it('does not duplicate badge on second addXP', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    act(() => { result.current.addXP('message_sent'); });
    act(() => { result.current.addXP('message_sent'); });
    expect(result.current.badges.filter(b => b === 'first_blood')).toHaveLength(1);
  });
});

describe('useGrowth — level progression', () => {
  it('shows Coder between 500 and 1999 XP', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    // 4 * 150 = 600 XP → Coder (500–1999)
    act(() => { result.current.addXP('commit_made'); });
    act(() => { result.current.addXP('commit_made'); });
    act(() => { result.current.addXP('commit_made'); });
    act(() => { result.current.addXP('commit_made'); });
    expect(result.current.level).toBe('Coder');
  });

  it('shows Hacker between 2000 and 4999 XP', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    // 14 * 150 = 2100 XP → Hacker (2000–4999)
    for (let i = 0; i < 14; i++) {
      act(() => { result.current.addXP('commit_made'); });
    }
    expect(result.current.level).toBe('Hacker');
  });

  it('shows Legend at 5000+ XP with null nextXp', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    // 34 * 150 = 5100 XP → Legend
    for (let i = 0; i < 34; i++) {
      act(() => { result.current.addXP('commit_made'); });
    }
    expect(result.current.level).toBe('Legend');
    expect(result.current.nextXp).toBeNull();
    expect(result.current.progress).toBe(100);
  });
});

describe('useGrowth — learnFromSession', () => {
  it('skips if messages < 5', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    await act(async () => {
      await result.current.learnFromSession([
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' },
      ], '/project');
    });
    expect(mockAskCerebrasStream).not.toHaveBeenCalled();
  });

  it('skips if no file activity in messages', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    const msgs = Array.from({ length: 6 }, (_, i) => ({ role: 'user', content: `msg ${i}` }));
    await act(async () => {
      await result.current.learnFromSession(msgs, '/project');
    });
    expect(mockAskCerebrasStream).not.toHaveBeenCalled();
  });

  it('calls AI and updates learnedStyle when conditions met', async () => {
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    const msgs = [
      ...Array.from({ length: 5 }, (_, i) => ({ role: 'user', content: `task ${i}` })),
      { role: 'assistant', content: 'write_file src/App.jsx done' },
    ];
    await act(async () => {
      await result.current.learnFromSession(msgs, '/project');
    });
    expect(mockAskCerebrasStream).toHaveBeenCalled();
    expect(result.current.learnedStyle).toContain('•');
  });

  it('skips if AI reply has no bullets', async () => {
    mockAskCerebrasStream.mockResolvedValueOnce('Nothing to learn.');
    const { result } = renderHook(() => useGrowth());
    await waitFor(() => expect(mockPreferencesGet).toHaveBeenCalled());
    const msgs = [
      ...Array.from({ length: 5 }, (_, i) => ({ role: 'user', content: `task ${i}` })),
      { role: 'assistant', content: 'write_file done' },
    ];
    await act(async () => {
      await result.current.learnFromSession(msgs, '/project');
    });
    expect(result.current.learnedStyle).toBe('');
  });
});
