import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askAIStream } from '../../api.js';
import * as cerebrasModule from '../providers/cerebras.js';
import * as groqModule from '../providers/groq.js';

// Mock constants dengan model yang benar
vi.mock('../../constants.js', () => ({
  MODELS: [
    { id: 'cerebras-model', provider: 'cerebras' },
    { id: 'groq-model', provider: 'groq' },
  ],
  GROQ_FALLBACK_CHAIN: [],
  YUYU_SERVER: 'http://localhost:8765',
  WS_SERVER: 'ws://127.0.0.1:8766',
}));

vi.mock('../../runtimeKeys.js', () => ({
  getRuntimeCerebrasKey: () => 'mock-key',
  getRuntimeGroqKey: () => 'mock-key',
}));

beforeEach(() => {
  vi.spyOn(cerebrasModule, 'cerebrasRequest').mockResolvedValue('cerebras response');
  vi.spyOn(groqModule, 'groqRequest').mockResolvedValue('groq response');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('askAIStream - provider routing', () => {
  it('calls cerebrasRequest for cerebras model', async () => {
    await askAIStream([{ role: 'user', content: 'hi' }], 'cerebras-model', () => {}, null);
    expect(cerebrasModule.cerebrasRequest).toHaveBeenCalled();
  });

  it('calls groqRequest for groq model', async () => {
    await askAIStream([{ role: 'user', content: 'hi' }], 'groq-model', () => {}, null);
    expect(groqModule.groqRequest).toHaveBeenCalled();
  });
});
