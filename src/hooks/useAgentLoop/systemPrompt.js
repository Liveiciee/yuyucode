// src/hooks/useAgentLoop/systemPrompt.js
import { getSystemForModel } from '../../constants.js';
import { selectSkills, tfidfRank } from '../../features.js';

const isArm64 = /arm64|arm|aarch64/i.test(navigator?.platform || '') || /aarch64/i.test(navigator?.userAgent || '');
const MAX_PREVIEW_CHARS = isArm64 ? 600 : 800;

export function buildSystemPrompt(txt, cfg, project, chat, file, growth) {
  const stripFrontmatter = s => s.replace(/^---[\s\S]*?---\n?/, '').trim();
  const notesCtx    = project.notes ? '\n\nProject notes:\n' + project.notes : '';
  const agentsMdCtx = project.agentsMd
    ? '\n\n## AGENTS.md (kontrak project — WAJIB diikuti):\n' + project.agentsMd.slice(0, 2500)
    : '';
  const yuyuMdCtx = project.yuyuMd
    ? '\n\n## YUYU.md (project rules — ikuti selalu):\n' + project.yuyuMd.slice(0, 1500)
    : '';
  const selectedSkills = selectSkills((project.skills || []).filter(s => s.active !== false), txt);
  if (selectedSkills.length) {
    const now = Date.now();
    project.setSkills?.(skills => skills.map(s =>
      selectedSkills.some(sel => sel.name === s.name) ? { ...s, lastUsed: now } : s
    ));
  }
  const skillCtx    = selectedSkills.length
    ? '\n\nSkill context:\n' + selectedSkills.map(s => '## ' + s.name + '\n' + stripFrontmatter(s.content || '')).join('\n\n---\n\n')
    : '';
  const pinnedCtx   = file?.pinnedFiles?.length ? '\n\nPinned files: ' + file.pinnedFiles.slice(0, 5).join(', ') : '';
  const fileCtx     = file?.selectedFile && file?.fileContent && (cfg._iter === undefined || cfg._iter <= 1)
    ? '\n\nFile terbuka: ' + file.selectedFile + '\n```\n' + file.fileContent.slice(0, MAX_PREVIEW_CHARS) + '\n```'
    : '';
  const memPool     = chat.getRelevantMemories(txt);
  const memCtx      = memPool.length ? '\n\nMemories:\n' + memPool.map(m => '• ' + m.text).join('\n') : '';
  const visionCtx   = chat.visionImage ? '\n\n[Gambar dilampirkan]' : '';
  const agentMemCtx = ['user', 'project', 'local'].map(s => {
    const pool   = project.agentMemory[s] || [];
    if (!pool.length) return '';
    const ranked = tfidfRank(pool, txt, 5);
    return '\n\n[' + s + ' memory]:\n' + ranked.map(mx => '• ' + mx.text).join('\n');
  }).join('');
  const thinkNote   = project.thinkingEnabled
    ? '\n\nSebelum respons, tulis reasoning dalam <think>...</think>. Singkat, max 2 kalimat.'
    : '';
  const styleCtx = growth?.learnedStyle
    ? '\n\n[Gaya coding yang dipelajari dari sesi sebelumnya]:\n' + growth.learnedStyle
    : '';
  const modelSystem = getSystemForModel(cfg.model || project?.model || '');
  return modelSystem + cfg.systemSuffix + thinkNote + styleCtx +
    '\n\nFolder aktif: ' + project.folder +
    '\nBranch: ' + project.branch +
    agentsMdCtx + yuyuMdCtx + notesCtx + skillCtx + pinnedCtx + fileCtx + memCtx + agentMemCtx + visionCtx;
}
