// handlers/filesystem.cjs
const fs = require('fs');
const path = require('path');
const { resolvePath, execSafe, HOME } = require('../helpers.cjs');
const { getCached, setCache, invalidateCache } = require('../cache.cjs');
const { humanFormat } = require('../formatters.cjs');
const { applyPatch } = require('../patch.cjs');
const { buildTree, walkSync, extractSigs } = require('../tree.cjs');

function handleFilesystem(payload) {
  const { type, path: filePath, content, from, to, paths, depth, human } = payload;
  const full = resolvePath(filePath);

  if (type === 'read') {
    if (!fs.existsSync(full)) return { ok: false, data: 'File tidak ada: ' + filePath };
    if (!from && !to) {
      const cached = getCached(full);
      if (cached && !human) return { ok: true, data: cached.data, meta: cached.meta, cached: true };
    }
    let data = fs.readFileSync(full, 'utf8');
    const totalLines = data.split('\n').length;
    const totalChars = data.length;
    if (!from && !to && !human) setCache(full, data, { totalLines, totalChars });
    
    if (human) {
      try {
        const parsed = JSON.parse(data);
        data = humanFormat(parsed, filePath);
      } catch(e) {
        if (filePath.endsWith('.md')) {
          data = humanFormat(data, filePath);
        }
      }
    }
    
    if (from || to) {
      const lines = data.split('\n');
      const f = (from || 1) - 1;
      const t = to || lines.length;
      data = lines.slice(f, t).join('\n');
    }
    return { ok: true, data, meta: { totalLines, totalChars } };
  }

  if (type === 'read_many') {
    const pathList = Array.isArray(paths) ? paths : [];
    const results = {};
    for (const p of pathList) {
      const abs = resolvePath(p);
      try { results[p] = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null; } catch(_e) { results[p] = null; }
    }
    return { ok: true, data: results };
  }

  if (type === 'write') {
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
    invalidateCache(full);
    return { ok: true, data: '✅ Tersimpan: ' + filePath };
  }

  if (type === 'append') {
    fs.appendFileSync(full, content, 'utf8');
    invalidateCache(full);
    return { ok: true, data: '✅ Ditambahkan ke: ' + filePath };
  }

  if (type === 'patch') {
    const result = applyPatch(filePath, payload.old_str, payload.new_str);
    if (result.ok) invalidateCache(full);
    return result;
  }

  if (type === 'delete') {
    try { fs.unlinkSync(full); invalidateCache(full); } catch (_e) { return { ok: false, data: 'File tidak ada: ' + filePath }; }
    return { ok: true, data: '🗑 Dihapus: ' + filePath };
  }

  if (type === 'move') {
    const fromFull = resolvePath(payload.from || filePath);
    const toFull   = resolvePath(payload.to || content);
    fs.mkdirSync(path.dirname(toFull), { recursive: true });
    try { fs.renameSync(fromFull, toFull); invalidateCache(fromFull); invalidateCache(toFull); } catch (_e) { return { ok: false, data: 'Source tidak ada: ' + (payload.from || filePath) }; }
    return { ok: true, data: '✅ Dipindah: ' + (payload.from || filePath) + ' → ' + (payload.to || content) };
  }

  if (type === 'mkdir') { fs.mkdirSync(full, { recursive: true }); return { ok: true, data: '✅ Dibuat: ' + filePath }; }

  if (type === 'list') {
    let files; try { files = fs.readdirSync(full, { withFileTypes: true }); } catch (_e) { return { ok: false, data: 'Path tidak ada: ' + filePath }; }
    return { ok: true, data: files.map(f => ({ name: f.name, isDir: f.isDirectory(), size: f.isFile() ? fs.statSync(path.join(full, f.name)).size : 0 })) };
  }

  if (type === 'tree') {
    const maxDepth = parseInt(depth) || 3;
    if (!fs.existsSync(full)) return { ok: false, data: 'Path tidak ada: ' + filePath };
    const tree = (filePath || '.') + '/\n' + buildTree(full, 1, maxDepth, '');
    return { ok: true, data: tree || '(kosong)' };
  }

  if (type === 'info') {
    if (!fs.existsSync(full)) return { ok: false, data: 'File tidak ada: ' + filePath };
    const stat = fs.statSync(full);
    const lines = stat.isFile() ? fs.readFileSync(full, 'utf8').split('\n').length : 0;
    return { ok: true, data: { size: stat.size, lines, isFile: stat.isFile(), modified: stat.mtime } };
  }

  if (type === 'search') {
    const searchPath = full || HOME;
    const q = require('../helpers.cjs').shellEsc((content || '').slice(0, 500));
    const rgCheck = execSafe('which rg 2>/dev/null', HOME, 2000);
    if (rgCheck.ok && rgCheck.data.trim()) {
      const ext = (payload.ext || 'jsx,js,ts,tsx,json,md,py,sh').split(',').map(e => '-g "**/*.'+e+'"').join(' ');
      const r = execSafe(`rg -n --color=never ${ext} "${q}" "${searchPath}" 2>/dev/null | head -100`, HOME, 15000);
      return { ok: true, data: r.data.trim() || 'Tidak ditemukan' };
    }
    const exts = '--include="*.jsx" --include="*.js" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" --include="*.py" --include="*.sh"';
    const r = execSafe(`grep -rn "${q}" "${searchPath}" ${exts} 2>/dev/null | head -100 || echo ""`, HOME, 15000);
    return { ok: true, data: r.data.trim() || 'Tidak ditemukan' };
  }

  return { ok: false, data: 'Unknown filesystem type: ' + type };
}

module.exports = { handleFilesystem };
