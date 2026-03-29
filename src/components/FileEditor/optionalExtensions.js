// src/components/FileEditor/optionalExtensions.js
import { keymap } from '@codemirror/view';
import { selectNextOccurrence, selectSelectionMatches } from '@codemirror/search';
import { indentWithTab } from '@codemirror/commands';
import { vim } from '@replit/codemirror-vim';
import { abbreviationTracker, expandAbbreviation } from '@emmetio/codemirror6-plugin';
import { collab } from '@codemirror/collab';
import { lintGutter } from '@codemirror/lint';
import { isEmmetLang, isTsLang } from './editorUtils.js';
import { ghostField, ghostL2Field, ghostDecorations, ghostL2Decorations, ghostAcceptKeymap, makeGhostPlugin } from './ghost.js';
import { makeSyntaxLinter } from './lint.js';
import { makeCollabPlugin } from './collab.js';

export function buildOptionalExtensions(cfg, path, folder, collabWsRef) {
  const exts = [];
  if (cfg?.vimMode)   exts.push(vim({ status: true }));
  if (cfg?.emmet && isEmmetLang(path)) {
    exts.push(abbreviationTracker());
    exts.push(keymap.of([{ key: 'Ctrl-e', run: expandAbbreviation }]));
  }
  if (cfg?.ghostText) exts.push(ghostField, ghostL2Field, ghostDecorations, ghostL2Decorations, ghostAcceptKeymap, makeGhostPlugin());
  if (cfg?.lint) {
    const linterExt = makeSyntaxLinter(path, folder);
    if (linterExt) exts.push(linterExt, lintGutter());
  }
  if (cfg?.multiCursor) {
    exts.push(keymap.of([
      { key: 'Ctrl-d',       run: selectNextOccurrence },
      { key: 'Ctrl-Shift-l', run: selectSelectionMatches },
    ]));
  }
  if (cfg?.collab && collabWsRef) {
    exts.push(collab({ startVersion: 0 }), makeCollabPlugin(collabWsRef));
  }
  return exts;
}
