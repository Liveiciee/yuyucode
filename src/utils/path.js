// src/utils/path.js
export function resolvePath(base, p) {
  if (!p) return base;
  if (!base) return p;
  const b = base.replace(/\/$/, '');
  const q = p.replace(/^\//, '');
  if (q === b || q.startsWith(b + '/')) return q;
  const baseName = b.split('/').pop();
  if (baseName && (q === baseName || q.startsWith(baseName + '/'))) {
    return b + '/' + q.slice(baseName.length).replace(/^\//, '');
  }
  const stripped = q.startsWith(b) ? q.slice(b.length).replace(/^\//, '') : q;
  return b + '/' + stripped;
}
