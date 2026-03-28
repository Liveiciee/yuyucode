// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handlePlan, handleAsk } from './plan.js';

vi.mock('../../../features.js', () => ({
  generatePlan: vi.fn(),
}));

vi.mock('../helpers/withLoading.js', () => ({
  withLoading: async (setLoading, fn) => {
    setLoading?.(true);
    await fn();
    setLoading?.(false);
  },
}));

vi.mock('../helpers/simpleResponse.js', () => ({
  simpleResponse: vi.fn(),
}));

import { generatePlan } from '../../../features.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

describe('plan handlers', () => {
  const setMessages = vi.fn();
  const setLoading = vi.fn();
  const setPlanSteps = vi.fn();
  const setPlanTask = vi.fn();
  const sendMsg = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handlePlan shows usage when task is missing', () => {
    handlePlan({
      parts: ['/plan'],
      folder: '/project',
      callAI: vi.fn(),
      setLoading,
      setMessages,
      setPlanSteps,
      setPlanTask,
    });
    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('Usage: /plan')
    );
  });

  it('handlePlan stores plan steps and task on success', async () => {
    generatePlan.mockResolvedValueOnce({
      steps: [{ num: 1, text: 'audit code' }, { num: 2, text: 'write tests' }],
    });

    await handlePlan({
      parts: ['/plan', 'audit', 'project'],
      folder: '/project',
      callAI: vi.fn(),
      setLoading,
      setMessages,
      setPlanSteps,
      setPlanTask,
    });

    expect(setPlanTask).toHaveBeenCalledWith('audit project');
    expect(setPlanSteps).toHaveBeenCalledWith([
      { num: 1, text: 'audit code', done: false },
      { num: 2, text: 'write tests', done: false },
    ]);
  });

  it('handleAsk shows usage when arguments incomplete', () => {
    handleAsk({ parts: ['/ask', 'kimi'], setMessages, sendMsg });
    expect(simpleResponse).toHaveBeenCalledWith(
      setMessages,
      expect.stringContaining('Usage: `/ask <model> <prompt>`')
    );
  });

  it('handleAsk resolves alias and calls sendMsg', () => {
    handleAsk({
      parts: ['/ask', 'kimi', 'review', 'kode'],
      setMessages,
      sendMsg,
    });
    expect(sendMsg).toHaveBeenCalledWith('review kode', {
      overrideModel: 'moonshotai/kimi-k2-instruct-0905',
    });
  });
});
