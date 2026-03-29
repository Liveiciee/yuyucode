import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askAIStream } from '../../api.js';
import * as cerebrasModule from '../providers/cerebras.js';
import * as groqModule from '../providers/groq.js';

vi.mock('../../constants.js');
vi.mock('../../runtimeKeys.js');

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
