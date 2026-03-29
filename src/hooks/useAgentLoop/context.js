// src/hooks/useAgentLoop/context.js
import { callServer } from '../../api.js';
import { extractMentionedFiles } from './helpers.js';

const isArm64 = /arm64|arm|aarch64/i.test(navigator?.platform || '') || /aarch64/i.test(navigator?.userAgent || '');

export async function gatherProjectContext(project, file, txt, _signal) {
  if (!project.folder) return {};
  const ctx = {};
  const folder = project.folder;

  const [handoffR, yuyuMdR, llmsR, mapR, treeR] = await Promise.all([
    callServer({ type: 'read', path: folder + '/.yuyu/handoff.md' }),
    callServer({ type: 'read', path: folder + '/YUYU.md' }),
    callServer({ type: 'read', path: folder + '/llms.txt', from: 1, to: 80 }),
    callServer({ type: 'read', path: folder + '/.yuyu/map.md', from: 1, to: 120 }),
    callServer({ type: 'tree', path: folder, depth: 2 }),
  ]);
  if (handoffR.ok && handoffR.data) ctx['__handoff__'] = handoffR.data;
  if (yuyuMdR.ok && yuyuMdR.data) { ctx['__yuyu_rules__'] = yuyuMdR.data; project.setYuyuMd(yuyuMdR.data); }
  if (llmsR.ok && llmsR.data)      ctx['__llms__'] = llmsR.data;
  if (mapR.ok && mapR.data)         ctx['__map__'] = mapR.data;
  if (treeR.ok)                     ctx['__tree__'] = treeR.data;

  const pinned = (file.pinnedFiles || []).slice(0, isArm64 ? 3 : 5);
  if (pinned.length) {
    const pinnedReads = await Promise.all(pinned.map(p => callServer({ type: 'read', path: p, to: 80 })));
    pinnedReads.forEach((r, i) => { if (r.ok) ctx['📌 ' + pinned[i].split('/').pop()] = r.data; });
  }

  if (/refactor|overhaul|all files|semuanya|codebase|arsitektur/i.test(txt)) {
    const compR = await callServer({ type: 'read', path: folder + '/.yuyu/compressed.md', from: 1, to: 150 });
    if (compR.ok && compR.data) ctx['__compressed__'] = compR.data;
  }

  const kw = txt.toLowerCase();
  const KEYWORD_FILES = [
    [['api','fetch','cerebras','groq'],         '/src/api.js'],
    [['agent','loop','sendmsg'],                 '/src/hooks/useAgentLoop.js'],
    [['panel','ui','modal'],                     '/src/components/panels.jsx'],
    [['constant','model','theme'],               '/src/constants.js'],
    [['server','yuyu-server','exec'],            '/yuyu-server.cjs'],
    [['feature','skill','plan'],                 '/src/features.js'],
    [['brightness','gamma','color'],             '/src/hooks/useBrightness.js'],
    [['slash','command'],                        '/src/hooks/useSlashCommands/index.js'],
    [['editor','codemirror','tab'],              '/src/components/FileEditor.jsx'],
  ];
  const keyFiles = [];
  const fileMatch = extractMentionedFiles(txt);
  if (fileMatch) fileMatch.forEach(f => keyFiles.push(f.startsWith('/') ? f : folder + '/src/' + f));
  KEYWORD_FILES.forEach(([keys, file]) => { if (keys.some(k => kw.includes(k))) keyFiles.push(folder + file); });

  const unique = [...new Set(keyFiles)].slice(0, isArm64 ? 3 : 5);
  const reads  = await Promise.all(unique.map(p => callServer({ type: 'read', path: p, from: 1, to: 50 })));
  unique.forEach((p, i) => { if (reads[i].ok && reads[i].data) ctx[p.split('/').pop()] = reads[i].data; });

  return ctx;
}
