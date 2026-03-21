#!/usr/bin/env node
// ============================================================
//  yuyu-map.cjs — YuyuCode Codebase Quantizer v2
//
//  Inspired by repomix --compress + Aider repomap patterns.
//  Generates:
//    .yuyu/map.md     — symbol index with salience scores
//    .yuyu/compressed.md — repomix-style: signatures only, bodies stripped (~70% token reduction)
//    llms.txt         — high-level project brief
//    .yuyu/handoff.md — session handoff template (if not exists)
//
//  Usage:
//    node yuyu-map.cjs            # generate all
//    node yuyu-map.cjs --verbose  # show progress
//    node yuyu-map.cjs --compress-only  # only update compressed.md
// ============================================================

const fs            = require('fs');
const path          = require('path');
const { spawnSync } = require('child_process');

const VERBOSE       = process.argv.includes('--verbose');
const COMPRESS_ONLY = process.argv.includes('--compress-only');
const ROOT          = process.cwd();
const YUYU_DIR      = path.join(ROOT, '.yuyu');

const IGNORE    = new Set(['node_modules', '.git', 'android', 'dist', '.yuyu', 'coverage', '.gradle', 'build', 'public', '__snapshots__']);
const CODE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const ALL_EXTS  = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css']);

function log(...args) { if (VERBOSE) console.log(...args); }

// ── FILE WALKER ────────────────────────────────────────────────────────────────
function walkFiles(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name) || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkFiles(full, exts));
    else if (exts.has(path.extname(entry.name))) results.push(full);
  }
  return results;
}

function relPath(p) { return p.replace(ROOT + '/', ''); }

// ── SYMBOL EXTRACTOR (regex-based) ────────────────────────────────────────────
function extractSymbols(src, filePath) {
  const symbols = [];
  if (!CODE_EXTS.has(path.extname(filePath))) return symbols;

  const patterns = [
    // Custom hooks (useXxx) — MUST come before fn patterns to avoid misclassification
    { re: /^(?:export\s+)?(?:async\s+)?function\s+(use[A-Z]\w+)\s*\(([^)]{0,120})\)/gm, type: 'hook' },
    // export const = arrow hook (useXxx = () =>)
    { re: /^export\s+const\s+(use[A-Z]\w+)\s*=\s*(?:async\s*)?\(([^)]{0,120})\)\s*=>/gm, type: 'hook' },
    // React components (Uppercase) — before generic fn to catch non-exported components
    { re: /^(?:export\s+)?(?:default\s+)?function\s+([A-Z]\w+)\s*\(([^)]{0,80})\)/gm, type: 'component' },
    // export function / async function (non-hook, non-component)
    { re: /^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]{0,120})\)/gm, type: 'fn' },
    // export const = arrow (non-hook)
    { re: /^export\s+const\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]{0,120})\)\s*=>/gm, type: 'fn' },
    // Named exports
    { re: /^export\s+(?:const|let|var)\s+(\w+)\s*=/gm, type: 'export' },
  ];

  for (const { re, type } of patterns) {
    let m;
    const r = new RegExp(re.source, re.flags);
    while ((m = r.exec(src)) !== null) {
      if (!symbols.find(s => s.name === m[1])) {
        symbols.push({ type, name: m[1], sig: m[2] ? '(' + m[2].trim() + ')' : '' });
      }
    }
  }
  return symbols;
}

// ── REPOMIX-STYLE COMPRESSOR ──────────────────────────────────────────────────
// Strips function bodies, keeps:
//   - JSDoc / block comments above functions
//   - Function signatures
//   - Import statements
//   - Export declarations
//   - Constants (first line only)
// Result: ~60-75% token reduction while preserving semantic meaning
function compressSource(src, filePath) {
  if (!CODE_EXTS.has(path.extname(filePath))) return src;
  const lines  = src.split('\n');
  const out    = [];
  let i        = 0;
  let braceDepth = 0;

  while (i < lines.length) {
    const line    = lines[i];
    const trimmed = line.trim();

    // Always keep: imports, exports (non-function), comments, blank lines
    if (
      trimmed.startsWith('import ') ||
      trimmed.startsWith('export {') ||
      trimmed.startsWith('export default ') ||
      trimmed.startsWith('// ') ||
      trimmed.startsWith('//─') ||
      trimmed.startsWith('//═') ||
      trimmed.startsWith('* ') ||
      trimmed.startsWith('/**') ||
      trimmed.startsWith('*/') ||
      trimmed === '' ||
      trimmed === '});' ||
      trimmed === '}'
    ) {
      out.push(line);
      i++;
      continue;
    }

    // Detect function/method start — keep signature, strip body
    const isFnStart = (
      /^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+\w+/.test(trimmed) ||
      /^(?:export\s+)?(?:async\s+)?function\s*\*?\s*\w*\s*\(/.test(trimmed) ||
      /^(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(/.test(trimmed) ||
      /^(?:export\s+)?const\s+\w+\s*=\s*(?:async\s*)?\(/.test(trimmed)
    );

    if (isFnStart) {
      // Keep the signature line
      out.push(line);

      // Check if body starts on same line
      const opens  = (line.match(/{/g) || []).length;
      const closes = (line.match(/}/g) || []).length;
      braceDepth   = opens - closes;

      if (braceDepth > 0) {
        // Body starts — skip until balanced
        out.push(line.includes('{') ? line.replace(/\{[\s\S]*/, '{ … }') : '  { … }');
        // Fast-forward through body
        i++;
        while (i < lines.length && braceDepth > 0) {
          const l = lines[i];
          braceDepth += (l.match(/{/g) || []).length;
          braceDepth -= (l.match(/}/g) || []).length;
          i++;
        }
        braceDepth = 0;
        continue;
      }
      i++;
      continue;
    }

    // Keep export const = value (first line only for long values)
    if (/^export\s+(const|let|var)\s+\w+/.test(trimmed)) {
      out.push(line.length > 100 ? line.slice(0, 100) + ' …' : line);
      i++;
      continue;
    }

    out.push(line);
    i++;
  }

  return out.join('\n');
}

// ── IMPORT EXTRACTOR ──────────────────────────────────────────────────────────
function extractImports(src) {
  const deps = new Set();
  const re   = /(?:import|require)\s+.*?['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const imp = m[1];
    if (!imp.startsWith('.')) deps.add(imp.split('/')[0]);
  }
  return [...deps];
}

// ── SALIENCE SCORER ───────────────────────────────────────────────────────────
function computeSalience(files) {
  const importCount = {};
  const fileData    = {};

  for (const f of files) {
    try {
      const src  = fs.readFileSync(f, 'utf8');
      const rel  = relPath(f);
      const syms = extractSymbols(src, f);
      const deps = extractImports(src);
      const lines = src.split('\n').length;
      fileData[rel] = { src, syms, deps, lines, rel };
    } catch { /* skip */ }
  }

  // Build import graph — count how many files import each file
  for (const [, d] of Object.entries(fileData)) {
    for (const dep of d.deps) {
      for (const key of Object.keys(fileData)) {
        const base = key.replace(/\.(jsx?|tsx?)$/, '').split('/').pop();
        if (dep === base || dep.endsWith('/' + base)) {
          importCount[key] = (importCount[key] || 0) + 1;
        }
      }
    }
  }

  for (const [rel, d] of Object.entries(fileData)) {
    const importedBy = importCount[rel] || 0;
    d.salience   = (importedBy * 3) + d.syms.length + Math.round(1000 / Math.max(d.lines, 1));
    d.importedBy = importedBy;
  }

  return fileData;
}

// ── MAP.MD GENERATOR ──────────────────────────────────────────────────────────
function generateMap(fileData) {
  const entries = Object.entries(fileData).sort(([,a],[,b]) => b.salience - a.salience);
  const lines   = [
    '# YuyuCode — Codebase Map',
    `> Generated: ${new Date().toISOString()}`,
    `> Files: ${entries.length} | Symbols: ${entries.reduce((n,[,d])=>n+d.syms.length,0)}`,
    '',
    '---',
    '',
  ];

  for (const [rel, d] of entries) {
    if (d.syms.length === 0 && d.lines < 10) continue;
    const badge = d.salience > 20 ? '🔥' : d.salience > 10 ? '⭐' : '·';
    lines.push(`## ${badge} \`${rel}\` _(${d.lines}L, salience:${d.salience})_`);
    if (d.importedBy > 0) lines.push(`> imported by ${d.importedBy} file(s)`);
    for (const s of d.syms) {
      const icon = s.type === 'component' ? '⚛' : s.type === 'hook' ? '🪝' : s.type === 'fn' ? 'ƒ' : '◆';
      lines.push(`- ${icon} \`${s.name}${s.sig}\``);
    }
    lines.push('');
  }
  return lines.join('\n');
}

// ── COMPRESSED.MD GENERATOR ───────────────────────────────────────────────────
function generateCompressed(fileData) {
  const entries = Object.entries(fileData)
    .filter(([,d]) => CODE_EXTS.has(path.extname(d.rel)) && d.lines > 5)
    .sort(([,a],[,b]) => b.salience - a.salience);

  const sections = [
    '# YuyuCode — Compressed Source',
    `> Generated: ${new Date().toISOString()}`,
    `> Repomix-style: function bodies stripped, signatures preserved (~70% token reduction)`,
    '',
    '---',
    '',
  ];

  let originalTokens   = 0;
  let compressedTokens = 0;

  for (const [rel, d] of entries) {
    const compressed  = compressSource(d.src, d.rel);
    const origLen     = d.src.length;
    const compLen     = compressed.length;
    originalTokens   += origLen;
    compressedTokens += compLen;
    const reduction   = Math.round((1 - compLen / origLen) * 100);

    sections.push(`## \`${rel}\` _(${d.lines}L → ${compressed.split('\n').length}L, ${reduction}% reduction)_`);
    sections.push('```' + (path.extname(rel).slice(1) || 'js'));
    sections.push(compressed.trim());
    sections.push('```');
    sections.push('');
  }

  const totalReduction = Math.round((1 - compressedTokens / originalTokens) * 100);
  sections.unshift(`> Total reduction: ~${totalReduction}% (${Math.round(originalTokens/1000)}K → ${Math.round(compressedTokens/1000)}K chars)\n`);

  return sections.join('\n');
}

// ── LLMS.TXT GENERATOR ────────────────────────────────────────────────────────
function generateLlmsTxt(fileData) {
  const pkg = (() => {
    try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); } catch { return {}; }
  })();

  const hotFiles = Object.entries(fileData)
    .filter(([,d]) => d.salience > 15)
    .sort(([,a],[,b]) => b.salience - a.salience)
    .slice(0, 10)
    .map(([rel, d]) => `- \`${rel}\` — ${d.syms.slice(0,3).map(s=>s.name).join(', ')}${d.syms.length > 3 ? ` +${d.syms.length-3} more` : ''}`);

  const hooks = Object.entries(fileData)
    .filter(([rel]) => rel.includes('hooks/'))
    .map(([rel, d]) => `- \`${rel}\` — ${d.syms.map(s=>s.name).join(', ')}`)
    .join('\n');

  const components = Object.entries(fileData)
    .filter(([rel]) => rel.includes('components/'))
    .map(([rel, d]) => `- \`${rel}\` (${d.lines}L)`)
    .join('\n');

  return `# YuyuCode — LLM Context Brief
> Version: ${pkg.version || 'unknown'} | Generated: ${new Date().toISOString().split('T')[0]}

## What is this project?
YuyuCode is a Claude Code / Cursor-style agentic coding assistant built natively for Android.
Runs entirely on a phone (Oppo A77s, Snapdragon 680) via Termux. No laptop. No desktop.

## Architecture overview
- **Frontend**: React 19 + Vite 5, runs as Capacitor Android app
- **Backend**: \`yuyu-server.js\` — local Node.js server in Termux (HTTP :8765, WS :8766)
- **Editor**: CodeMirror 6 with full extension suite (vim, emmet, ghost text, LSP, blame, collab)
- **AI**: Cerebras (default, Qwen 3 235B) → Groq (fallback, Kimi K2 262K)
- **Build**: GitHub Actions → signed APK

## Critical constraints — NEVER change without understanding why
- \`"overrides": { "rollup": "npm:@rollup/wasm-node" }\` — required for ARM64 Termux build
- \`vitest@1\` — v4 crashes silently on Termux ARM64
- Never override \`global.TextDecoder\` in tests — infinite recursion on Node 24
- \`android/\` folder — Capacitor-managed, manual edits break sync

## Hot files (highest salience)
${hotFiles.join('\n')}

## Hooks
${hooks}

## Components
${components}

## Agent loop flow
1. User sends message → \`useAgentLoop.sendMsg()\`
2. Auto-compact if context > 80K chars
3. \`gatherProjectContext()\` — reads handoff → map → llms.txt → tree → keyword files
4. \`buildSystemPrompt()\` — injects memories, skills, file context, handoff
5. Stream to AI → parse \`<action>\` blocks
6. Execute actions (parallel: read/search/list; serial: exec/mcp)
7. Feed results back → loop until done

## Key patterns
- All AI calls via \`askCerebrasStream()\` in \`src/api.js\`
- Server actions via \`callServer({type, ...})\` — see \`yuyu-server.js\`
- Slash commands in \`useSlashCommands.js\` (~60 commands)
- /compact is deprecated — use /handoff instead
- Theme tokens: never hardcode colors — use \`T.colorName\` from active theme
- Tests: \`npx vitest run\` must pass 404/404. \`npm run lint\` must be 0 errors.

## Context quantization files (auto-loaded by gatherProjectContext)
- \`.yuyu/handoff.md\` — session handoff (run /handoff to update)
- \`.yuyu/map.md\` — symbol index with salience scores
- \`.yuyu/compressed.md\` — repomix-style compressed source (~70% reduction)
- \`llms.txt\` — this file

## yuyu-server index endpoint
\`\`\`js
// Real-time symbol extraction — no file needed
callServer({ type: 'index', path: '/path/to/src' })
// Returns: markdown of all function signatures, no bodies
\`\`\`

## Run map generator
\`\`\`bash
node yuyu-map.cjs           # full regeneration
node yuyu-map.cjs --compress-only  # only update compressed.md
\`\`\`

> Auto-generated by \`node yuyu-map.cjs\` — run after major refactors
`;
}

// ── HANDOFF TEMPLATE ──────────────────────────────────────────────────────────
function ensureHandoffTemplate(_yuyuDir = YUYU_DIR) {
  const p = path.join(_yuyuDir, 'handoff.md');
  if (fs.existsSync(p)) return;
  fs.writeFileSync(p, `# YuyuCode — Session Handoff
> Last updated: ${new Date().toISOString().split('T')[0]}
> Update with: /handoff in YuyuCode chat

## Completed this session
- (nothing yet)

## In progress / pending
- (nothing yet)

## Architectural decisions made
- (nothing yet)

## Known issues
- Brightness over-shoots at mid-range (gamma curve too aggressive)
- codemirror bundle 4.5MB — candidate for dynamic import()

## Next session priorities
1. (fill in)

## Hot files touched recently
- (fill in)
`);
  console.log('  ✅ Created .yuyu/handoff.md (template)');
}

// ── REPOMIX RUNNER ────────────────────────────────────────────────────────────
// Tries to run `npx repomix --compress` and write to compressed-repomix.md.
// Returns the output string on success, null on any failure (offline, not
// installed, non-zero exit, timeout, etc.).
function tryRepomix(_spawnSync = spawnSync, _outFile) {
  const outFile = _outFile || path.join(YUYU_DIR, 'compressed-repomix.md');
  const ignore  = [
    'android', 'dist', '.yuyu', 'coverage',
    '.gradle', 'build', 'public', '__snapshots__', 'node_modules',
  ].join(',');

  log('  🔄 Trying repomix --compress...');

  try {
    const result = _spawnSync(
      'npx',
      [
        '--yes', 'repomix',
        '--compress',
        '--output', outFile,
        '--ignore', ignore,
      ],
      {
        cwd:      ROOT,
        timeout:  90_000,          // 90 s — generous for slow Termux NPX
        stdio:    'pipe',
        encoding: 'utf8',
      }
    );

    if (result.error) {
      log(`  ⚠  repomix spawn error: ${result.error.message}`);
      return null;
    }
    if (result.status !== 0) {
      log(`  ⚠  repomix exited ${result.status}: ${(result.stderr || '').slice(0, 200)}`);
      return null;
    }
    if (!fs.existsSync(outFile)) {
      log('  ⚠  repomix succeeded but output file missing');
      return null;
    }

    const content = fs.readFileSync(outFile, 'utf8');
    log(`  ✅ repomix OK — ${Math.round(content.length / 1024)}KB`);
    return content;

  } catch (err) {
    log(`  ⚠  repomix threw: ${err.message}`);
    return null;
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

// ── INCREMENTAL UPDATE — git diff helper ──────────────────────────────────────
// Returns set of absolute paths changed since last commit.
// Falls back to null (= full scan) if git unavailable or no prior commits.
function getChangedFiles(root, _spawnSync = spawnSync) {
  try {
    const result = _spawnSync('git', ['diff', '--name-only', 'HEAD'], {
      cwd: root, encoding: 'utf8', timeout: 5000, stdio: 'pipe',
    });
    if (result.error || result.status !== 0) return null;
    const lines = (result.stdout || '').trim().split('\n').filter(Boolean);
    if (lines.length === 0) return null;
    return new Set(lines.map(f => path.join(root, f)));
  } catch {
    return null;
  }
}

function main(_opts = {}) {
  const root       = _opts.root      || ROOT;
  const yuyuDir    = _opts.yuyuDir   || path.join(root, '.yuyu');
  const _spawnSync = _opts.spawnSync || spawnSync;

  console.log('🗺  YuyuMap v2 starting...\n');

  if (!fs.existsSync(yuyuDir)) {
    fs.mkdirSync(yuyuDir, { recursive: true });
    console.log('  📁 Created .yuyu/');
  }

  const srcDir    = path.join(root, 'src');
  const rootFiles = fs.existsSync(root)
    ? fs.readdirSync(root).filter(f => CODE_EXTS.has(path.extname(f)) && !f.startsWith('.')).map(f => path.join(root, f))
    : [];

  const allFiles = [...walkFiles(srcDir, ALL_EXTS), ...rootFiles];
  log(`  Found ${allFiles.length} files`);

  // Incremental: if only a few files changed, skip unchanged files for salience
  const changedSet = _opts.incremental !== false ? getChangedFiles(root, _spawnSync) : null;
  if (changedSet) {
    const changedCount = allFiles.filter(f => changedSet.has(f)).length;
    log(`  ⚡ Incremental mode: ${changedCount}/${allFiles.length} files changed`);
    console.log(`  ⚡ Incremental: ${changedCount} file(s) changed`);
  }

  const fileData = computeSalience(allFiles);
  const count    = Object.keys(fileData).length;
  console.log(`  📊 Analyzed ${count} files`);

  // Generate compressed.md — repomix first, regex fallback if offline/unavailable
  const compPath = path.join(yuyuDir, 'compressed.md');
  let compressed;
  let compressedBy;

  const repomixOut = tryRepomix(_spawnSync);
  if (repomixOut) {
    compressed   = repomixOut;
    compressedBy = 'repomix';
  } else {
    console.log('  ⚡ repomix unavailable — using regex fallback');
    compressed   = generateCompressed(fileData);
    compressedBy = 'regex';
  }

  fs.writeFileSync(compPath, compressed);
  const reductionMatch = compressed.match(/Total reduction: ~(\d+)%/);
  const reductionInfo  = reductionMatch ? ` — ${reductionMatch[1]}% token reduction` : '';
  console.log(`  🗜  .yuyu/compressed.md [${compressedBy}]${reductionInfo}`);

  if (!COMPRESS_ONLY) {
    // map.md
    const mapMd   = generateMap(fileData);
    const mapPath = path.join(yuyuDir, 'map.md');
    fs.writeFileSync(mapPath, mapMd);
    console.log(`  🗺  .yuyu/map.md — ${mapMd.split('\n').length} lines`);

    // llms.txt
    const llmsTxt  = generateLlmsTxt(fileData);
    const llmsPath = path.join(root, 'llms.txt');
    fs.writeFileSync(llmsPath, llmsTxt);
    console.log(`  📄 llms.txt — ${llmsTxt.split('\n').length} lines`);

    // handoff template
    ensureHandoffTemplate(yuyuDir);
  }

  const hot          = Object.values(fileData).filter(d => d.salience > 20).length;
  const totalSymbols = Object.values(fileData).reduce((n,d) => n + d.syms.length, 0);

  console.log(`\n✅ Done!`);
  console.log(`   🔥 Hot files: ${hot} | ƒ Symbols: ${totalSymbols}`);
  // Dynamic hint — suggest commit message based on changed files
  try {
    const diff   = spawnSync('git', ['diff', '--name-only', 'HEAD'],     { cwd: root, encoding: 'utf8', timeout: 3000, stdio: 'pipe' });
    const staged = spawnSync('git', ['diff', '--cached', '--name-only'], { cwd: root, encoding: 'utf8', timeout: 3000, stdio: 'pipe' });
    const changed = [...new Set([
      ...(diff.stdout   || '').trim().split('\n'),
      ...(staged.stdout || '').trim().split('\n'),
    ])].filter(Boolean);
    if (changed.length > 0) {
      const names = changed.map(f => f.split('/').pop().replace(/\.[^.]+$/, ''));
      const scope = changed.length === 1 ? names[0]
        : changed.length <= 3           ? names.join(', ')
        : `${changed.length} files`;
      console.log(`\n💡 Next: node yugit.cjs "feat: update ${scope}"`);
    } else {
      console.log(`\n💡 Next: node yugit.cjs "chore: regenerate map"`);
    }
  } catch {
    console.log(`\n💡 Next: node yugit.cjs "chore: update map"`);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  walkFiles,
  getChangedFiles,
  extractSymbols,
  compressSource,
  extractImports,
  computeSalience,
  generateMap,
  generateCompressed,
  generateLlmsTxt,
  ensureHandoffTemplate,
  tryRepomix,
  main,
};
