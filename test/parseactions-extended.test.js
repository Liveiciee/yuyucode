// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction, parseActions, resolvePath, generateDiff, countTokens } from '../src/utils.js';

vi.mock('../src/api.js', () => ({ callServer: vi.fn() }));
import { callServer } from '../src/api.js';

beforeEach(() => {
  vi.clearAllMocks();
  callServer.mockResolvedValue({ ok: true, data: '' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// executeAction — all remaining action types
// ═══════════════════════════════════════════════════════════════════════════════

describe('parseActions — extended', () => {
  it.skip('extracts action with complex nested JSON', () => {
    const text = '```action\n{"type":"create_structure","files":[{"path":"a.js","content":"// ok"}]}\n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);
    expect(actions[0].files[0].path).toBe('a.js');
  });

  it.skip('handles multiple actions with mixed valid/invalid', () => {
    const text = [
      '```action\n{"type":"read_file","path":"a.js"}\n```',
      '```action\nNOT JSON\n```',
      '```action\n{"type":"exec","command":"ls"}\n```',
    ].join('\n');
    const actions = parseActions(text);
    expect(actions).toHaveLength(2);
    expect(actions[0].type).toBe('read_file');
    expect(actions[1].type).toBe('exec');
  });

  it.skip('handles action block with extra whitespace', () => {
    const text = '```action\n  { "type": "exec", "command": "pwd" }  \n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);
    expect(actions[0].command).toBe('pwd');
  });

  it.skip('ignores non-action code blocks', () => {
    const text = '```js\nconst x = 1;\n```\n```bash\necho hi\n```';
    expect(parseActions(text)).toEqual([]);
  });
});
