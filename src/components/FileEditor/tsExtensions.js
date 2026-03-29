// src/components/FileEditor/tsExtensions.js
let _tsExtensions = null;
export async function getTsExtensions() {
  if (_tsExtensions) return _tsExtensions;
  try {
    const mod = await import('@valtown/codemirror-ts');
    _tsExtensions = mod;
    return mod;
  } catch (_) { return null; }
}
