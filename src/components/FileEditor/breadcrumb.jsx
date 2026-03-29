import React, { useState, useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { Compartment, StateEffect } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { ChevronRight } from 'lucide-react';

export function Breadcrumb({ viewRef, T }) {
  const [crumbs, setCrumbs] = useState([]);
  const setCrumbsRef = useRef(setCrumbs);
  useEffect(() => { setCrumbsRef.current = setCrumbs; }, [setCrumbs]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    function update(v) {
      const pos  = v.state.selection.main.head;
      const tree = syntaxTree(v.state);
      const path = [];
      let node = tree.resolveInner(pos, -1);
      const seen = new Set();
      while (node && node.parent) {
        const name = node.type.name;
        if (/^(FunctionDeclaration|FunctionExpression|ArrowFunction|MethodDefinition|ClassDeclaration)$/.test(name)) {
          const idNode = node.getChild('VariableDefinition') || node.getChild('PropertyDefinition') || node.firstChild;
          const raw = idNode ? v.state.doc.sliceString(idNode.from, Math.min(idNode.to, idNode.from + 30)) : name.replace('Declaration', '');
          const label = raw.trim().split(/[\s({]/)[0];
          if (label && !seen.has(label)) { seen.add(label); path.unshift(label); }
        }
        node = node.parent;
      }
      setCrumbsRef.current(path.slice(-4));
    }
    update(view);
    const ext = EditorView.updateListener.of(upd => {
      if (upd.selectionSet || upd.docChanged) update(upd.view);
    });
    const comp = new Compartment();
    view.dispatch({ effects: StateEffect.appendConfig.of(comp.of(ext)) });
    return () => {
      try { view.dispatch({ effects: comp.reconfigure([]) }); } catch (_) {}
    };
  }, [viewRef]);

  if (crumbs.length === 0) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '2px',
      padding: '2px 10px', borderBottom: '1px solid ' + (T?.border || 'rgba(255,255,255,.06)'),
      background: T?.bg2 || '#111116', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none',
      minHeight: '22px',
    }}>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={9} style={{ color: T?.textMute || 'rgba(255,255,255,.3)', flexShrink: 0 }}/>}
          <span style={{
            fontSize: '10px',
            color: i === crumbs.length - 1 ? T?.accent || '#a78bfa' : T?.textMute || 'rgba(255,255,255,.3)',
            fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{c}</span>
        </React.Fragment>
      ))}
    </div>
  );
}
