import { describe, it, expect } from 'vitest';
import { askAIStream, ValidationError } from '../../api.js';
import * as cerebrasModule from '../providers/cerebras.js';
import { vi } from 'vitest';

vi.mock('../../constants.js');
vi.mock('../../runtimeKeys.js');

describe('Input Validation', () => {
  beforeEach(() => {
    vi.spyOn(cerebrasModule, 'cerebrasRequest').mockResolvedValue('ok');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws on empty messages array', async () => {
    await expect(askAIStream([], 'cerebras-model', () => {}, null))
      .rejects.toThrow(ValidationError);
  });

  it('throws on non-array messages', async () => {
    await expect(askAIStream(null, 'cerebras-model', () => {}, null))
      .rejects.toThrow(ValidationError);
  });

  it('throws on messages without role', async () => {
    await expect(askAIStream([{ content: 'hi' }], 'cerebras-model', () => {}, null))
      .rejects.toThrow(ValidationError);
  });

  it('throws on messages without content', async () => {
    await expect(askAIStream([{ role: 'user' }], 'cerebras-model', () => {}, null))
      .rejects.toThrow(ValidationError);
  });
});
