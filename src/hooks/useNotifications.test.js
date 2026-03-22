// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications.js';

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'Notification', {
    writable: true, configurable: true,
    value: Object.assign(
      vi.fn().mockImplementation(() => {}),
      { permission: 'granted', requestPermission: vi.fn().mockResolvedValue('granted') }
    ),
  });
  Object.defineProperty(navigator, 'vibrate', {
    writable: true, configurable: true,
    value: vi.fn().mockReturnValue(true),
  });
  Object.defineProperty(window, 'speechSynthesis', {
    writable: true, configurable: true,
    value: { cancel: vi.fn(), speak: vi.fn(), getVoices: vi.fn().mockReturnValue([]) },
  });
});

describe('useNotifications — sendNotification', () => {
  it('sends notification when permission is granted', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.sendNotification('Title', 'Body'); });
    expect(window.Notification).toHaveBeenCalledWith('Title', expect.objectContaining({ body: 'Body' }));
  });

  it('requests permission when not yet granted', () => {
    Object.defineProperty(window, 'Notification', {
      writable: true, configurable: true,
      value: Object.assign(
        vi.fn(),
        { permission: 'default', requestPermission: vi.fn().mockResolvedValue('granted') }
      ),
    });
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.sendNotification('T', 'B'); });
    expect(window.Notification.requestPermission).toHaveBeenCalled();
  });

  it('does nothing when permission is denied', () => {
    // Tests the denied branch — equivalent real-world edge case to "Notification unavailable"
    Object.defineProperty(window, 'Notification', {
      writable: true, configurable: true,
      value: Object.assign(vi.fn(), { permission: 'denied', requestPermission: vi.fn() }),
    });
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.sendNotification('T', 'B'); });
    // Neither Notification constructor nor requestPermission should be called
    expect(window.Notification).not.toHaveBeenCalled();
    expect(window.Notification.requestPermission).not.toHaveBeenCalled();
  });
});

describe('useNotifications — haptic', () => {
  it('vibrates with short pulse for light', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.haptic('light'); });
    expect(navigator.vibrate).toHaveBeenCalledWith(10);
  });

  it('vibrates with medium pulse', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.haptic('medium'); });
    expect(navigator.vibrate).toHaveBeenCalledWith(30);
  });

  it('vibrates with pattern for heavy', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.haptic('heavy'); });
    expect(navigator.vibrate).toHaveBeenCalledWith([50, 30, 50]);
  });

  it('defaults to light when no type given', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.haptic(); });
    expect(navigator.vibrate).toHaveBeenCalledWith(10);
  });
});

describe('useNotifications — speakText', () => {
  it('calls speechSynthesis.speak with utterance', () => {
    window.SpeechSynthesisUtterance = vi.fn().mockImplementation(text => ({ text, lang: '', rate: 1, pitch: 1, voice: null }));
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.speakText('Hello world'); });
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('cancels previous speech before speaking', () => {
    window.SpeechSynthesisUtterance = vi.fn().mockImplementation(text => ({ text }));
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.speakText('Text'); });
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('strips markdown before speaking', () => {
    let spokenText = '';
    window.SpeechSynthesisUtterance = vi.fn().mockImplementation(text => {
      spokenText = text;
      return { text };
    });
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.speakText('**Bold** and `code` and # Header'); });
    expect(spokenText).not.toContain('**');
    expect(spokenText).not.toContain('`');
    expect(spokenText).not.toContain('#');
  });



  it('does nothing when SpeechSynthesisUtterance is unavailable', () => {
    // window.SpeechSynthesisUtterance = null → typeof === 'object' (not 'function')
    // guard fires → return before cancel() or new window.SpeechSynthesisUtterance()
    const orig = window.SpeechSynthesisUtterance;
    window.SpeechSynthesisUtterance = null;
    const { result } = renderHook(() => useNotifications());
    expect(() => result.current.speakText('Hello')).not.toThrow();
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
    window.SpeechSynthesisUtterance = orig;
  });

  it('stopTts cancels speech', () => {
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.stopTts(); });
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('selects preferred Indonesian voice when available', () => {
    const mockVoices = [
      { lang: 'id-ID', name: 'Female Indonesian', localService: true },
      { lang: 'en-US', name: 'English', localService: true },
    ];
    let capturedUtt = null;
    window.SpeechSynthesisUtterance = vi.fn().mockImplementation(text => {
      capturedUtt = { text, lang: '', rate: 1, pitch: 1, voice: null };
      return capturedUtt;
    });
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true, configurable: true,
      value: { cancel: vi.fn(), speak: vi.fn(), getVoices: vi.fn().mockReturnValue(mockVoices) },
    });
    const { result } = renderHook(() => useNotifications());
    act(() => { result.current.speakText('Halo'); });
    expect(capturedUtt.voice).toBeTruthy();
    expect(capturedUtt.voice.lang).toBe('id-ID');
  });
});
