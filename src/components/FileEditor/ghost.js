// src/components/FileEditor/ghost.js
import { StateEffect, StateField } from '@codemirror/state';
import { EditorView, Decoration, WidgetType, ViewPlugin, keymap } from '@codemirror/view';

const setGhostEffect   = StateEffect.define();
const clearGhostEffect = StateEffect.define();
const setGhostL2Effect = StateEffect.define();

export const ghostField = StateField.define({
  create: () => ({ text: '', pos: 0, level: 1 }),
  update(val, tr) {
    if (tr.docChanged) return { text: '', pos: 0, level: 1 };
    for (const e of tr.effects) {
      if (e.is(setGhostEffect))   return e.value;
      if (e.is(clearGhostEffect)) return { text: '', pos: 0, level: 1 };
    }
    return val;
  },
});

export const ghostL2Field = StateField.define({
  create: () => ({ text: '', pos: 0 }),
  update(val, tr) {
    if (tr.docChanged) return { text: '', pos: 0 };
    for (const e of tr.effects) {
      if (e.is(setGhostL2Effect))   return e.value;
      if (e.is(clearGhostEffect))   return { text: '', pos: 0 };
      if (e.is(setGhostEffect))     return { text: '', pos: 0 };
    }
    return val;
  },
});

class GhostWidget extends WidgetType {
  constructor(text, level) { super(); this.text = text; this.level = level; }
  toDOM() {
    const span = document.createElement('span');
    span.textContent = this.text;
    span.style.cssText = this.level === 2
      ? 'opacity:0.22;color:#79b8ff;pointer-events:none;white-space:pre;'
      : 'opacity:0.38;color:inherit;pointer-events:none;';
    return span;
  }
  eq(other) { return this.text === other.text && this.level === other.level; }
  ignoreEvent() { return true; }
}

export const ghostDecorations = EditorView.decorations.compute([ghostField], state => {
  const { text, pos } = state.field(ghostField);
  if (!text || pos > state.doc.length) return Decoration.none;
  return Decoration.set([Decoration.widget({ widget: new GhostWidget(text, 1), side: 1 }).range(pos)]);
});

export const ghostL2Decorations = EditorView.decorations.compute([ghostL2Field, ghostField], state => {
  const l1 = state.field(ghostField);
  const { text, pos } = state.field(ghostL2Field);
  if (!text || pos > state.doc.length || l1.text) return Decoration.none;
  return Decoration.set([Decoration.widget({ widget: new GhostWidget(text, 2), side: 1 }).range(pos)]);
});

async function fetchL1Suggestion(prefix) {
  const key = import.meta?.env?.VITE_CEREBRAS_API_KEY || '';
  if (!key) return null;
  try {
    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1-8b', max_tokens: 40, temperature: 0.1,
        messages: [
          { role: 'system', content: 'Complete next line of code only. Reply with the completion text ONLY. No markdown, no backticks, no explanation.' },
          { role: 'user', content: prefix.slice(-400) },
        ],
        stop: ['\n\n', '```', '\n// ', '\n/*'],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (_) { return null; }
}

async function fetchL2Suggestion(prefix) {
  const key = import.meta?.env?.VITE_CEREBRAS_API_KEY || '';
  if (!key) return null;
  try {
    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1-8b', max_tokens: 120, temperature: 0.2,
        messages: [
          { role: 'system', content: 'Complete the next 2-3 lines of code. Reply with completion text ONLY. No markdown, no backticks.' },
          { role: 'user', content: prefix.slice(-800) },
        ],
        stop: ['\n\n\n', '```', '// ---'],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (_) { return null; }
}

export function makeGhostPlugin() {
  return ViewPlugin.fromClass(class {
    timerL1 = null;
    timerL2 = null;
    update(upd) {
      if (!upd.docChanged) return;
      clearTimeout(this.timerL1);
      clearTimeout(this.timerL2);
      const { text } = upd.view.state.field(ghostField);
      if (text) upd.view.dispatch({ effects: clearGhostEffect.of(null) });
      const view = upd.view;

      this.timerL1 = setTimeout(() => {
        if (view.isDestroyed) return;
        const pos    = view.state.selection.main.head;
        const prefix = view.state.doc.sliceString(0, pos);
        if ((prefix.split('\n').pop() || '').trim().length < 3) return;
        fetchL1Suggestion(prefix).then(text => {
          if (!text || view.isDestroyed) return;
          if (view.state.selection.main.head !== pos) return;
          view.dispatch({ effects: setGhostEffect.of({ text, pos, level: 1 }) });
        });
      }, 300);

      this.timerL2 = setTimeout(() => {
        if (view.isDestroyed) return;
        const pos    = view.state.selection.main.head;
        const prefix = view.state.doc.sliceString(0, pos);
        if ((prefix.split('\n').pop() || '').trim().length < 6) return;
        fetchL2Suggestion(prefix).then(text => {
          if (!text || view.isDestroyed) return;
          if (view.state.selection.main.head !== pos) return;
          view.dispatch({ effects: setGhostL2Effect.of({ text, pos }) });
        });
      }, 900);
    }
    destroy() { clearTimeout(this.timerL1); clearTimeout(this.timerL2); }
  });
}

export const ghostAcceptKeymap = keymap.of([{
  key: 'Tab',
  run(view) {
    const l1 = view.state.field(ghostField);
    const l2 = view.state.field(ghostL2Field);
    const now = Date.now();
    if (!l1.text && l2.text) {
      view.dispatch({ changes: { from: l2.pos, insert: l2.text },
        effects: clearGhostEffect.of(null), selection: { anchor: l2.pos + l2.text.length } });
      return true;
    }
    if (l1.text) {
      view._lastTabTime = view._lastTabTime || 0;
      if (now - view._lastTabTime < 400 && l2.text) {
        view.dispatch({ changes: { from: l1.pos, insert: l1.text + l2.text },
          effects: clearGhostEffect.of(null), selection: { anchor: l1.pos + l1.text.length + l2.text.length } });
      } else {
        view.dispatch({ changes: { from: l1.pos, insert: l1.text },
          effects: clearGhostEffect.of(null), selection: { anchor: l1.pos + l1.text.length } });
      }
      view._lastTabTime = now;
      return true;
    }
    return false;
  },
}, {
  key: 'Escape',
  run(view) {
    const { text } = view.state.field(ghostField);
    const l2 = view.state.field(ghostL2Field);
    if (!text && !l2.text) return false;
    view.dispatch({ effects: clearGhostEffect.of(null) });
    return true;
  },
}]);
