// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWakeWord } from './useWakeWord.js';

class MockSpeechRecognition {
  static instances = [];

  constructor() {
    this.onresult = null;
    this.onend = null;
    this.onerror = null;
    this.start = vi.fn();
    this.stop = vi.fn();
    MockSpeechRecognition.instances.push(this);
  }
}

describe('useWakeWord', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockSpeechRecognition.instances = [];
    window.SpeechRecognition = undefined;
    window.webkitSpeechRecognition = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does not initialize recognition when disabled', () => {
    renderHook(() => useWakeWord({ enabled: false, onActivated: vi.fn() }));
    expect(MockSpeechRecognition.instances).toHaveLength(0);
  });

  it('returns early when SpeechRecognition API is unavailable', () => {
    const onActivated = vi.fn();
    renderHook(() => useWakeWord({ enabled: true, onActivated }));
    expect(onActivated).not.toHaveBeenCalled();
    expect(MockSpeechRecognition.instances).toHaveLength(0);
  });

  it('starts recognition and triggers callback when wake phrase appears', () => {
    window.SpeechRecognition = MockSpeechRecognition;
    const onActivated = vi.fn();

    renderHook(() => useWakeWord({ enabled: true, onActivated }));
    const rec = MockSpeechRecognition.instances[0];

    expect(rec.start).toHaveBeenCalledTimes(1);
    rec.onresult({
      results: [[{ transcript: 'hey yuyu tolong bantu' }]],
    });
    expect(onActivated).toHaveBeenCalledTimes(1);
  });

  it('schedules quick restart for no-speech error and slow restart for hard errors', () => {
    window.SpeechRecognition = MockSpeechRecognition;
    renderHook(() => useWakeWord({ enabled: true, onActivated: vi.fn() }));

    const first = MockSpeechRecognition.instances[0];
    first.onerror({ error: 'no-speech' });
    vi.advanceTimersByTime(500);
    expect(MockSpeechRecognition.instances).toHaveLength(2);

    const second = MockSpeechRecognition.instances[1];
    second.onerror({ error: 'network' });
    vi.advanceTimersByTime(1999);
    expect(MockSpeechRecognition.instances).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(MockSpeechRecognition.instances).toHaveLength(3);
  });

  it('stops active recognition on unmount', () => {
    window.webkitSpeechRecognition = MockSpeechRecognition;
    const { unmount } = renderHook(() => useWakeWord({ enabled: true, onActivated: vi.fn() }));
    const rec = MockSpeechRecognition.instances[0];

    unmount();
    expect(rec.stop).toHaveBeenCalledTimes(1);
  });
});
