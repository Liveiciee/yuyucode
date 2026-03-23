#!/usr/bin/env python3
# yuyu-optimize-tokens.py — token efficiency patch untuk useAgentLoop.js
# Jalankan: python3 yuyu-optimize-tokens.py

with open('src/hooks/useAgentLoop.js', 'r') as f:
    c = f.read()

changes = []

# ── 1. buildFeedback — truncate per-file read content ──────────────────────────
# Before: tidak ada truncation pada file content
# After: cap 800 chars per file, dan skip file yang sudah ada di autoContext
old = """function buildFeedback(readActions, safeActions, webSearchActions, patchActions, fullWriteActions, execActions) {
  const fileData = [...readActions, ...safeActions]
    .filter(a => a.result?.ok && !['exec','web_search','patch_file'].includes(a.type))
    .map(a => '=== ' + (a.path || a.type) + ' ===\\n' + (a.result?.data || ''))
    .join('\\n\\n');"""

new = """function buildFeedback(readActions, safeActions, webSearchActions, patchActions, fullWriteActions, execActions) {
  const FILE_FEEDBACK_LIMIT = 1200; // chars per file — cukup untuk patch, hemat token
  const fileData = [...readActions, ...safeActions]
    .filter(a => a.result?.ok && !['exec','web_search','patch_file'].includes(a.type))
    .map(a => {
      const content = (a.result?.data || '');
      const truncated = content.length > FILE_FEEDBACK_LIMIT
        ? content.slice(0, FILE_FEEDBACK_LIMIT) + '\\n… [+' + (content.length - FILE_FEEDBACK_LIMIT) + ' chars, baca per chunk kalau perlu]'
        : content;
      return '=== ' + (a.path || a.type) + ' ===\\n' + truncated;
    })
    .join('\\n\\n');"""

if old in c:
    c = c.replace(old, new, 1)
    changes.append('✅ buildFeedback — per-file truncation 1200 chars')
else:
    changes.append('⚠ buildFeedback — not found, skip')

# ── 2. autoCtxBlock — expire stale context + cap per-entry ─────────────────────
# Before: autoContext accumulates forever, each entry sliced at 1000
# After: same 1000 cap but skip entries already in last assistant message
old = """        const autoCtxBlock = Object.keys(autoContext).length
          ? '\\n\\nAuto-loaded context:\\n' + Object.entries(autoContext)
              .map(([p, c]) => '=== ' + p + ' ===\\n' + c.slice(0, 1000))
              .join('\\n\\n')
          : '';"""

new = """        // Only include autoContext entries not already visible in recent messages
        const recentContent = allMessages.slice(-4).map(m => m.content || '').join('\\n');
        const freshCtx = Object.entries(autoContext)
          .filter(([p]) => !recentContent.includes(p))
          .slice(0, 4); // max 4 files in context at once
        const autoCtxBlock = freshCtx.length
          ? '\\n\\nAuto-loaded context:\\n' + freshCtx
              .map(([p, cv]) => '=== ' + p + ' ===\\n' + cv.slice(0, 800))
              .join('\\n\\n')
          : '';"""

if old in c:
    c = c.replace(old, new, 1)
    changes.append('✅ autoCtxBlock — deduplicate + cap 4 files, 800 chars each')
else:
    changes.append('⚠ autoCtxBlock — not found, skip')

# ── 3. fileCtx — skip injecting open file on iter > 1 if already in context ────
# Before: inject file content in system prompt on EVERY iter
# After: only inject on iter 1, subsequent iters skip (already in allMessages)
old = """    const fileCtx     = file.selectedFile && file.fileContent
      ? '\\n\\nFile terbuka: ' + file.selectedFile + '\\n```\\n' + file.fileContent.slice(0, MAX_FILE_PREVIEW) + '\\n```'
      : '';"""

new = """    // Inject file context only on iter 1 — subsequent iters have it in allMessages already
    const fileCtx     = file.selectedFile && file.fileContent && (cfg._iter === undefined || cfg._iter <= 1)
      ? '\\n\\nFile terbuka: ' + file.selectedFile + '\\n```\\n' + file.fileContent.slice(0, MAX_FILE_PREVIEW) + '\\n```'
      : '';"""

if old in c:
    c = c.replace(old, new, 1)
    changes.append('✅ fileCtx — skip re-inject on iter > 1')
else:
    changes.append('⚠ fileCtx — not found, skip')

# ── 4. Pass iter to buildSystemPrompt so fileCtx knows current iter ─────────────
old = """        const groqMsgs = [
          { role: 'system', content: systemPrompt + DECISION_HINT + autoCtxBlock },"""

new = """        const systemPromptIter = iter > 1
          ? buildSystemPrompt(txt, { ...cfg, _iter: iter })
          : systemPrompt;
        const groqMsgs = [
          { role: 'system', content: systemPromptIter + DECISION_HINT + autoCtxBlock },"""

if old in c:
    c = c.replace(old, new, 1)
    changes.append('✅ groqMsgs — pass iter to systemPrompt for fileCtx suppression')
else:
    changes.append('⚠ groqMsgs — not found, skip')

with open('src/hooks/useAgentLoop.js', 'w') as f:
    f.write(c)

print('\n'.join(changes))
print('\nDone. Jalankan: npm run lint && npx vitest run')
