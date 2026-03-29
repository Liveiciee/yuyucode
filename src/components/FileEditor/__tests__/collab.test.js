import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { makeCollabPlugin } from '../collab.js';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';

describe('collab module', () => {
  let view;
  let wsRef;
  beforeEach(() => {
    wsRef = { current: { readyState: 1, send: vi.fn() } };
    const state = EditorState.create({
      doc: 'test',
      extensions: [basicSetup, makeCollabPlugin(wsRef)],
    });
    view = new EditorView({ state, parent: document.body });
  });
  afterEach(() => {
    view?.destroy();
  });

  it('should create plugin without error', () => {
    expect(view).toBeDefined();
  });
});
