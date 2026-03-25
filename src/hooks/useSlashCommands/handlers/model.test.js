// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleModel, handleEffort, handleThinking } from './model.js';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../../constants.js', () => ({
  MODELS: [
    { id: 'gpt-4', label: 'GPT-4' },
    { id: 'claude-3', label: 'Claude 3' },
    { id: 'llama-3', label: 'Llama 3' },
  ],
}));

vi.mock('../helpers/simpleResponse.js', () => ({
  simpleResponse: vi.fn(),
}));

import { simpleResponse } from '../helpers/simpleResponse.js';
import { Preferences } from '@capacitor/preferences';

describe('model handlers', () => {
  let mockSetMessages;
  let mockSetModel;
  let mockSetEffort;
  let mockSetThinkingEnabled;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetMessages = vi.fn();
    mockSetModel = vi.fn();
    mockSetEffort = vi.fn();
    mockSetThinkingEnabled = vi.fn();
  });

  describe('handleModel', () => {
    it('cycles to next model', () => {
      handleModel({
        model: 'gpt-4',
        setModel: mockSetModel,
        setMessages: mockSetMessages,
      });

      expect(mockSetModel).toHaveBeenCalledWith('claude-3');
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_model', value: 'claude-3' });
      expect(simpleResponse).toHaveBeenCalled();
    });
  });

  describe('handleEffort', () => {
    it('shows current effort when no arg given', () => {
      handleEffort({
        parts: ['/effort'],
        effort: 'medium',
        setEffort: mockSetEffort,
        setMessages: mockSetMessages,
      });

      expect(simpleResponse).toHaveBeenCalledWith(
        mockSetMessages,
        expect.stringContaining('Effort sekarang: **medium**')
      );
      expect(mockSetEffort).not.toHaveBeenCalled();
    });

    it('sets effort to high with valid arg', () => {
      handleEffort({
        parts: ['/effort', 'high'],
        effort: 'medium',
        setEffort: mockSetEffort,
        setMessages: mockSetMessages,
      });

      expect(mockSetEffort).toHaveBeenCalledWith('high');
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_effort', value: 'high' });
      expect(simpleResponse).toHaveBeenCalledWith(mockSetMessages, '⚡ Effort: **high**');
    });

    it('sets effort to low with valid arg', () => {
      handleEffort({
        parts: ['/effort', 'low'],
        effort: 'medium',
        setEffort: mockSetEffort,
        setMessages: mockSetMessages,
      });

      expect(mockSetEffort).toHaveBeenCalledWith('low');
    });

    it('ignores invalid effort level', () => {
      handleEffort({
        parts: ['/effort', 'invalid'],
        effort: 'medium',
        setEffort: mockSetEffort,
        setMessages: mockSetMessages,
      });

      expect(mockSetEffort).not.toHaveBeenCalled();
      expect(simpleResponse).toHaveBeenCalledWith(
        mockSetMessages,
        expect.stringContaining('Usage: /effort')
      );
    });
  });

  describe('handleThinking', () => {
    it('toggles thinking from false to true', () => {
      handleThinking({
        thinkingEnabled: false,
        setThinkingEnabled: mockSetThinkingEnabled,
        setMessages: mockSetMessages,
      });

      expect(mockSetThinkingEnabled).toHaveBeenCalledWith(true);
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_thinking', value: '1' });
      expect(simpleResponse).toHaveBeenCalledWith(
        mockSetMessages,
        expect.stringContaining('aktif')
      );
    });

    it('toggles thinking from true to false', () => {
      handleThinking({
        thinkingEnabled: true,
        setThinkingEnabled: mockSetThinkingEnabled,
        setMessages: mockSetMessages,
      });

      expect(mockSetThinkingEnabled).toHaveBeenCalledWith(false);
      expect(Preferences.set).toHaveBeenCalledWith({ key: 'yc_thinking', value: '0' });
      expect(simpleResponse).toHaveBeenCalledWith(
        mockSetMessages,
        expect.stringContaining('nonaktif')
      );
    });
  });
});
