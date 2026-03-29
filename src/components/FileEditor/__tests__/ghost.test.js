import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { ghostField, ghostL2Field, ghostDecorations, ghostL2Decorations, ghostAcceptKeymap, makeGhostPlugin } from '../ghost.js';

describe('ghost module', () => {
  let view;
  beforeEach(() => {
    const state = EditorState.create({
      doc: 'const x = 1;',
      extensions: [basicSetup, ghostField, ghostL2Field, ghostDecorations, ghostL2Decorations, ghostAcceptKeymap, makeGhostPlugin()],
    });
    view = new EditorView({ state, parent: document.body });
  });
  afterEach(() => {
    view?.destroy();
  });

  it('should have ghostField state', () => {
    const field = view.state.field(ghostField);
    expect(field).toEqual({ text: '', pos: 0, level: 1 });
  });

  it('should have ghostL2Field state', () => {
    const field = view.state.field(ghostL2Field);
    expect(field).toEqual({ text: '', pos: 0 });
  });
});
