// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ═══════════════════════════════════════════════════════════════════════════════
// useMediaHandlers
// ═══════════════════════════════════════════════════════════════════════════════

// Mock @capacitor/camera at hoist time — vi.doMock leaks across tests
// when isolate: false, causing subsequent renderHook calls to fail.
const mockCameraGetPhoto = vi.hoisted(() => vi.fn());
vi.mock('@capacitor/camera', () => ({
  Camera: { getPhoto: mockCameraGetPhoto },
  CameraResultType: { Base64: 'base64' },
  CameraSource: { Camera: 'CAMERA', Photos: 'PHOTOS' },
}));

import { useMediaHandlers } from './useMediaHandlers.js';

function makeMediaCtx() {
  return {
    setVisionImage: vi.fn(),
    setInput: vi.fn(),
    haptic: vi.fn(),
    setDragOver: vi.fn(),
  };
}

// Helper: fake FileReader that fires onload synchronously
function mockFileReader(result) {
  const reader = {
    onload: null,
    readAsDataURL: vi.fn().mockImplementation(function () {
      this.onload?.({ target: { result } });
    }),
    readAsText: vi.fn().mockImplementation(function () {
      this.onload?.({ target: { result } });
    }),
  };
  vi.spyOn(global, 'FileReader').mockImplementation(() => reader);
  return reader;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCameraGetPhoto.mockResolvedValue({ base64String: 'camera_base64' });
});

describe('useMediaHandlers — handleImageAttach', () => {
  it('reads image file and sets visionImage', () => {
    mockFileReader('data:image/png;base64,abc123');
    const ctx = makeMediaCtx();
    const { result } = renderHook(() => useMediaHandlers(ctx));
    const mockFile = new File(['img'], 'photo.png', { type: 'image/png' });
    act(() => {
      result.current.handleImageAttach({ target: { files: [mockFile] } });
    });
    expect(ctx.setVisionImage).toHaveBeenCalledWith('abc123');
    expect(ctx.haptic).toHaveBeenCalledWith('light');
  });

  it('does nothing when no file selected', () => {
    const ctx = makeMediaCtx();
    const { result } = renderHook(() => useMediaHandlers(ctx));
    act(() => {
      result.current.handleImageAttach({ target: { files: [] } });
    });
    expect(ctx.setVisionImage).not.toHaveBeenCalled();
  });
});

describe('useMediaHandlers — handleDrop', () => {
  it('handles dropped image file', () => {
    mockFileReader('data:image/jpeg;base64,xyz==');
    const ctx = makeMediaCtx();
    const { result } = renderHook(() => useMediaHandlers(ctx));
    const mockFile = new File(['img'], 'drop.jpg', { type: 'image/jpeg' });
    act(() => {
      result.current.handleDrop({
        preventDefault: vi.fn(),
        dataTransfer: { files: [mockFile] },
      });
    });
    expect(ctx.setDragOver).toHaveBeenCalledWith(false);
    expect(ctx.setVisionImage).toHaveBeenCalledWith('xyz==');
  });

  it('handles dropped text file — appends to input', () => {
    mockFileReader('const x = 1;');
    const ctx = makeMediaCtx();
    const { result } = renderHook(() => useMediaHandlers(ctx));
    const mockFile = new File(['code'], 'script.js', { type: 'text/javascript' });
    act(() => {
      result.current.handleDrop({
        preventDefault: vi.fn(),
        dataTransfer: { files: [mockFile] },
      });
    });
    expect(ctx.setInput).toHaveBeenCalledWith(expect.any(Function));
  });

  it('does nothing when no file dropped', () => {
    const ctx = makeMediaCtx();
    const { result } = renderHook(() => useMediaHandlers(ctx));
    act(() => {
      result.current.handleDrop({ preventDefault: vi.fn(), dataTransfer: { files: [] } });
    });
    expect(ctx.setVisionImage).not.toHaveBeenCalled();
    expect(ctx.setInput).not.toHaveBeenCalled();
  });
});

describe('useMediaHandlers — handleCameraCapture', () => {
  it('calls Camera.getPhoto and sets vision image', async () => {
    const ctx = makeMediaCtx();
    const { result } = renderHook(() => useMediaHandlers(ctx));
    await act(async () => { await result.current.handleCameraCapture(); });
    expect(mockCameraGetPhoto).toHaveBeenCalled();
    expect(ctx.setVisionImage).toHaveBeenCalledWith('camera_base64');
  });

  it('handles camera cancellation silently', async () => {
    mockCameraGetPhoto.mockRejectedValueOnce(new Error('User cancelled photos app'));
    const ctx = makeMediaCtx();
    const { result } = renderHook(() => useMediaHandlers(ctx));
    await expect(
      act(async () => { await result.current.handleCameraCapture(); })
    ).resolves.not.toThrow();
    expect(ctx.setVisionImage).not.toHaveBeenCalled();
  });
});

describe('useMediaHandlers — fileInputRef', () => {
  it('exposes a fileInputRef', () => {
    const ctx = makeMediaCtx();
    const { result } = renderHook(() => useMediaHandlers(ctx));
    expect(result.current.fileInputRef).toBeDefined();
    expect(result.current.fileInputRef.current).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// useBrightness
// ═══════════════════════════════════════════════════════════════════════════════
const mockGetBrightness     = vi.hoisted(() => vi.fn());
const mockAddListener       = vi.hoisted(() => vi.fn());
const mockRemoveAllListeners = vi.hoisted(() => vi.fn());

vi.mock('../plugins/brightness.js', () => ({
  BrightnessPlugin: {
    getBrightness:      mockGetBrightness,
    addListener:        mockAddListener,
    removeAllListeners: mockRemoveAllListeners,
  },
}));

import { useBrightness } from './useBrightness.js';

// Separate beforeEach for brightness — re-setup after clearAllMocks
beforeEach(() => {
  mockGetBrightness.mockResolvedValue({ brightness: 0.8 });
  mockAddListener.mockResolvedValue({ remove: vi.fn() });
  mockRemoveAllListeners.mockResolvedValue(undefined);
});

describe('useBrightness', () => {
  it('reads initial brightness on mount', async () => {
    const setBrightnessLevel = vi.fn();
    const { unmount } = renderHook(() => useBrightness(setBrightnessLevel));
    await act(async () => {});
    expect(mockGetBrightness).toHaveBeenCalled();
    expect(setBrightnessLevel).toHaveBeenCalledWith(0.8);
    unmount();
  });

  it('registers brightnessChange listener', async () => {
    const setBrightnessLevel = vi.fn();
    const { unmount } = renderHook(() => useBrightness(setBrightnessLevel));
    await act(async () => {});
    expect(mockAddListener).toHaveBeenCalledWith('brightnessChange', expect.any(Function));
    unmount();
  });

  it('calls removeAllListeners on unmount', async () => {
    const setBrightnessLevel = vi.fn();
    const { unmount } = renderHook(() => useBrightness(setBrightnessLevel));
    await act(async () => {});
    unmount();
    await act(async () => {});
    expect(mockRemoveAllListeners).toHaveBeenCalled();
  });

  it('handles getBrightness failure gracefully', async () => {
    mockGetBrightness.mockRejectedValueOnce(new Error('plugin not available'));
    const setBrightnessLevel = vi.fn();
    const { unmount } = renderHook(() => useBrightness(setBrightnessLevel));
    await expect(act(async () => {})).resolves.not.toThrow();
    unmount();
  });
});
