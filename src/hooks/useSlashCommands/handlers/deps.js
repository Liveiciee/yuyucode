// deps.js — handlers untuk /deps
import { callServer } from '../../../api.js';
import { withLoading } from '../helpers/withLoading.js';
import { simpleResponse } from '../helpers/simpleResponse.js';

export function handleDeps({ selectedFile, setLoading, setMessages, setDepGraph, setShowDepGraph }) {
  if (!selectedFile) {
    simpleResponse(setMessages, 'Buka file dulu Papa~');
    return;
  }
  
  withLoading(setLoading, async () => {
    simpleResponse(setMessages, '🕸 Building dep graph (2 levels)...');
    const importRegex = /(?:import|require)\s+[^'"]*['"]([^'"]+)['"]/g;
    const nodesMap = {};
    const edges = [];

    async function parseFile(path, depth) {
      if (depth > 2 || nodesMap[path]) return;
      const r = await callServer({ type: 'read', path });
      if (!r.ok) return;
      const label = path.split('/').pop().replace(/\.(jsx?|tsx?)$/, '');
      nodesMap[path] = { id: path, label, type: depth === 0 ? 'root' : 'local' };
      await parseImports(r.data || '', path, depth);
    }

    async function parseImports(src, fromPath, depth) {
      const re = new RegExp(importRegex.source, 'g');
      let m2;
      while ((m2 = re.exec(src)) !== null) {
        const imp = m2[1];
        if (!imp.startsWith('.')) {
          if (!nodesMap[imp]) nodesMap[imp] = { id: imp, label: imp.split('/').pop(), type: 'external' };
          edges.push({ source: fromPath, target: imp });
        } else {
          await resolveLocalImport(imp, fromPath, depth);
        }
      }
    }

    async function resolveLocalImport(imp, fromPath, depth) {
      const base2 = fromPath.split('/').slice(0, -1).join('/');
      const candidates = [imp, imp + '.jsx', imp + '.js', imp + '.ts', imp + '.tsx']
        .map(s => base2 + '/' + s.replace('./', '/').replace('//', '/'))
        .concat([base2 + '/' + imp.replace('./', '').replace('//', '/')]);
      for (const cand of candidates) {
        const cr = await callServer({ type: 'read', path: cand });
        if (cr.ok) {
          if (!nodesMap[cand]) await parseFile(cand, depth + 1);
          edges.push({ source: fromPath, target: cand });
          break;
        }
      }
    }

    await parseFile(selectedFile, 0);
    const nodes = Object.values(nodesMap);
    setDepGraph({ file: selectedFile.split('/').pop(), nodes, edges });
    setShowDepGraph(true);
    simpleResponse(setMessages, `🕸 Dep graph: **${nodes.length}** nodes, **${edges.length}** edges`);
  });
}
