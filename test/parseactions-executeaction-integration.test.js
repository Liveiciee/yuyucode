// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { parseActions, executeAction, generateDiff, resolvePath } from './utils.js';

// ── Dependency injection — NO vi.mock needed, compatible with isolate:false ──
// executeAction(action, folder, _callServer) — inject a mock directly

// ── Integration: parseActions → executeAction ─────────────────────────────────

describe('parseActions + executeAction (integration)', () => {

  it('should parse then execute read_file action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true, data: 'isi file' });
    const text = '```action\n{"type":"read_file","path":"src/App.jsx"}\n```';
    const actions = parseActions(text);
    expect(actions).toHaveLength(1);

    const result = await executeAction(actions[0], '/home/user/project', mockCS);
    expect(mockCS).toHaveBeenCalledWith(expect.objectContaining({
      type: 'read',
      path: '/home/user/project/src/App.jsx',
    }));
    expect(result.ok).toBe(true);
    expect(result.data).toBe('isi file');
  });

  it('should parse then execute write_file action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true });
    const text = '```action\n{"type":"write_file","path":"output.txt","content":"hello"}\n```';
    const actions = parseActions(text);
    await executeAction(actions[0], '/base', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'write', path: '/base/output.txt', content: 'hello' });
  });

  it('should parse then execute exec action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true, data: 'npm test output' });
    const text = '```action\n{"type":"exec","command":"npm test"}\n```';
    const [action] = parseActions(text);
    const result = await executeAction(action, '/project', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'exec', path: '/project', command: 'npm test' });
    expect(result.data).toBe('npm test output');
  });

  it('should parse then execute patch_file action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true });
    const text = '```action\n{"type":"patch_file","path":"src/utils.js","old_str":"const x = 1","new_str":"const x = 2"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/base', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'patch', path: '/base/src/utils.js', old_str: 'const x = 1', new_str: 'const x = 2' });
  });

  it('should handle multiple actions in sequence', async () => {
    const mockCS = vi.fn()
      .mockResolvedValueOnce({ ok: true, data: 'file content' })
      .mockResolvedValueOnce({ ok: true });
    const text = [
      '```action\n{"type":"read_file","path":"src/App.jsx"}\n```',
      '```action\n{"type":"write_file","path":"output.txt","content":"done"}\n```',
    ].join('\n');
    const actions = parseActions(text);
    expect(actions).toHaveLength(2);
    const r1 = await executeAction(actions[0], '/proj', mockCS);
    const r2 = await executeAction(actions[1], '/proj', mockCS);
    expect(r1.data).toBe('file content');
    expect(r2.ok).toBe(true);
    expect(mockCS).toHaveBeenCalledTimes(2);
  });

  it('should handle list_files action and format output', async () => {
    const mockCS = vi.fn().mockResolvedValue({
      ok: true,
      data: [
        { name: 'App.jsx', isDir: false, size: 2048 },
        { name: 'components', isDir: true, size: 0 },
      ],
    });
    const text = '```action\n{"type":"list_files","path":"src"}\n```';
    const [action] = parseActions(text);
    const result = await executeAction(action, '/proj', mockCS);
    expect(result.ok).toBe(true);
    expect(result.data).toContain('📄 App.jsx');
    expect(result.data).toContain('📁 components');
  });

  it('should handle append_file action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true });
    const text = '```action\n{"type":"append_file","path":"log.txt","content":"new line"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/base', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'append', path: '/base/log.txt', content: 'new line' });
  });

  it('should handle tree action with default depth', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true, data: 'tree output' });
    const text = '```action\n{"type":"tree","path":"src"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/proj', mockCS);
    expect(mockCS).toHaveBeenCalledWith(expect.objectContaining({ type: 'tree', depth: 3 }));
  });

  it('should handle search action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true, data: 'search results' });
    const text = '```action\n{"type":"search","query":"useState","path":"src"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/proj', mockCS);
    expect(mockCS).toHaveBeenCalledWith(expect.objectContaining({ type: 'search', content: 'useState' }));
  });

  it('should handle web_search action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true, data: 'web results' });
    const text = '```action\n{"type":"web_search","query":"vitest DI"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/proj', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'web_search', query: 'vitest DI' });
  });

  it('should handle mkdir action', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true });
    const text = '```action\n{"type":"mkdir","path":"src/new-feature"}\n```';
    const [action] = parseActions(text);
    await executeAction(action, '/proj', mockCS);
    expect(mockCS).toHaveBeenCalledWith({ type: 'mkdir', path: '/proj/src/new-feature' });
  });

  it('should return unknown action error for unrecognized type', async () => {
    const mockCS = vi.fn();
    const action = { type: 'teleport', destination: 'mars' };
    const result = await executeAction(action, '/proj', mockCS);
    expect(result.ok).toBe(false);
    expect(result.data).toContain('Unknown action type');
    expect(mockCS).not.toHaveBeenCalled();
  });

  it('should handle create_structure with multiple files', async () => {
    const mockCS = vi.fn().mockResolvedValue({ ok: true });
    const action = {
      type: 'create_structure',
      files: [
        { path: 'src/a.js', content: 'const a = 1;' },
        { path: 'src/b.js', content: 'const b = 2;' },
      ],
    };
    const result = await executeAction(action, '/proj', mockCS);
    expect(mockCS).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    expect(result.data).toContain('✅');
  });

  it('should handle callServer rejection gracefully (throws)', async () => {
    const mockCS = vi.fn().mockRejectedValue(new Error('network error'));
    const action = { type: 'read_file', path: 'src/App.jsx' };
    await expect(executeAction(action, '/proj', mockCS)).rejects.toThrow('network error');
  });
});
