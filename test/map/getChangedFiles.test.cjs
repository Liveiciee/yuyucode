// @vitest-environment node
// globals: true — vi, describe, it, expect, beforeEach, afterEach injected by vitest

const fs   = require('fs');
const path = require('path');
const os = require('os');

const _yuyuMap = require('../../yuyu-map.cjs');
const extractSymbols      = _yuyuMap.extractSymbols;
const compressSource      = _yuyuMap.compressSource;
const extractImports      = _yuyuMap.extractImports;
const computeSalience     = _yuyuMap.computeSalience;
const walkFiles           = _yuyuMap.walkFiles;
const generateMap         = _yuyuMap.generateMap;
const generateCompressed  = _yuyuMap.generateCompressed;
const generateLlmsTxt     = _yuyuMap.generateLlmsTxt;
const ensureHandoffTemplate = _yuyuMap.ensureHandoffTemplate;
const getChangedFiles     = _yuyuMap.getChangedFiles;
const tryRepomix          = _yuyuMap.tryRepomix;
const main                = _yuyuMap.main;

// ─────────────────────────────────────────────────────────────────────────────
// getChangedFiles
// ─────────────────────────────────────────────────────────────────────────────
describe('getChangedFiles', () => {
  it('returns a Set of absolute paths when git diff succeeds', () => {
    const mockSpawn = vi.fn(() => ({
      error: null, status: 0, stderr: '',
      stdout: 'src/utils.js\nsrc/App.jsx\n',
    }));
    const result = getChangedFiles('/home/user/project', mockSpawn);
    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect([...result].some(p => p.includes('utils.js'))).toBe(true);
    expect([...result].some(p => p.includes('App.jsx'))).toBe(true);
  });

  it('returns null when git exits non-zero (not a git repo)', () => {
    const mockSpawn = vi.fn(() => ({ error: null, status: 128, stderr: 'not a git repo', stdout: '' }));
    expect(getChangedFiles('/tmp/notgit', mockSpawn)).toBeNull();
  });

  it('returns null when spawnSync throws', () => {
    const mockSpawn = vi.fn(() => { throw new Error('spawn failed'); });
    expect(getChangedFiles('/tmp', mockSpawn)).toBeNull();
  });

  it('returns null when no files changed (empty diff)', () => {
    const mockSpawn = vi.fn(() => ({ error: null, status: 0, stdout: '\n', stderr: '' }));
    expect(getChangedFiles('/tmp', mockSpawn)).toBeNull();
  });

  it('paths in result are absolute (joined with root)', () => {
    const mockSpawn = vi.fn(() => ({
      error: null, status: 0, stdout: 'src/hooks/useStore.js\n', stderr: '',
    }));
    const result = getChangedFiles('/proj', mockSpawn);
    expect([...result][0]).toBe('/proj/src/hooks/useStore.js');
  });
});
