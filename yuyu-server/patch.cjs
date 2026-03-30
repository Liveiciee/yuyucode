// patch.cjs
const fs = require('fs');
const { invalidateCache } = require('./cache.cjs');
const { resolvePath } = require('./helpers.cjs');

function applyPatch(filePath, oldStr, newStr) {
  if (!filePath || !oldStr) return { ok: false, data: 'path dan old_str diperlukan' };
  const full = resolvePath(filePath);
  let content;
  try { content = fs.readFileSync(full, 'utf8'); }
  catch (_e) { return { ok: false, data: `File tidak ditemukan: ${filePath}` }; }
  const replacement = newStr !== undefined ? newStr : '';

  if (content.includes(oldStr)) {
    fs.writeFileSync(full, content.replace(oldStr, replacement), 'utf8');
    invalidateCache(full);
    return { ok: true, data: `✅ Patch OK: ${filePath}` };
  }

  const normalize = s => s.replace(/\r\n/g, '\n').replace(/\t/g, '  ');
  const normContent = normalize(content);
  const normOld     = normalize(oldStr);
  if (normContent.includes(normOld)) {
    fs.writeFileSync(full, normContent.replace(normOld, replacement), 'utf8');
    invalidateCache(full);
    return { ok: true, data: `✅ Patch (whitespace-norm) OK: ${filePath}` };
  }

  const trimLines  = s => s.split('\n').map(l => l.trimEnd()).join('\n');
  const trimContent = trimLines(normContent);
  const trimOld     = trimLines(normOld);
  if (trimContent.includes(trimOld)) {
    fs.writeFileSync(full, trimContent.replace(trimOld, replacement), 'utf8');
    invalidateCache(full);
    return { ok: true, data: `✅ Patch (trimmed) OK: ${filePath}` };
  }

  const oldLines = normOld.split('\n');
  const firstLine = oldLines[0].trim();
  const fileLines = normContent.split('\n');
  const nearIdx   = fileLines.findIndex(l => l.trim().includes(firstLine.slice(0, 30)));
  const ctx = nearIdx !== -1
    ? `\n\nContext sekitar baris ${nearIdx + 1}:\n${fileLines.slice(Math.max(0, nearIdx - 2), nearIdx + 5).join('\n')}`
    : '';
  return {
    ok: false,
    data: `⚠ old_str tidak ditemukan di ${filePath}. Pastikan exact match.${ctx}`,
  };
}

module.exports = { applyPatch };
