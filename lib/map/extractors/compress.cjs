// compress.cjs
const path = require('path');
const { CODE_EXTS } = require('../config.cjs');

function compressSource(src, filePath) {
  if (!CODE_EXTS.has(path.extname(filePath))) return src;
  
  if (src.length > 100 * 1024) {
    return src.slice(0, 50000) + '\n// ... (file truncated for performance)';
  }
  
  const lines  = src.split('\n');
  const out    = [];
  let i        = 0;
  let braceDepth = 0;

  const IMPORT_PATTERN = /^import\s+/;
  const EXPORT_BRACE_PATTERN = /^export\s*{/;
  const EXPORT_DEFAULT_PATTERN = /^export\s+default\s+/;
  const COMMENT_PATTERN = /^\/\/\s*[─═]/;
  const JS_DOC_PATTERN = /^\/\*\*/;
  const JS_DOC_END_PATTERN = /^\*\//;
  const FN_START_PATTERN = /^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+\w+|^(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(/;
  const EXPORT_CONST_PATTERN = /^export\s+(const|let|var)\s+\w+/;

  while (i < lines.length) {
    const line    = lines[i];
    const trimmed = line.trim();
    
    if (trimmed === '' || trimmed === '}' || trimmed === '});') {
      out.push(line);
      i++;
      continue;
    }

    if (
      IMPORT_PATTERN.test(trimmed) ||
      EXPORT_BRACE_PATTERN.test(trimmed) ||
      EXPORT_DEFAULT_PATTERN.test(trimmed) ||
      COMMENT_PATTERN.test(trimmed) ||
      trimmed.startsWith('// ') ||
      trimmed.startsWith('* ') ||
      JS_DOC_PATTERN.test(trimmed) ||
      JS_DOC_END_PATTERN.test(trimmed)
    ) {
      out.push(line);
      i++;
      continue;
    }

    if (FN_START_PATTERN.test(trimmed)) {
      out.push(line);
      
      const opens  = (line.match(/{/g) || []).length;
      const closes = (line.match(/}/g) || []).length;
      braceDepth   = opens - closes;

      if (braceDepth > 0) {
        out.push(line.includes('{') ? line.replace(/\{[\s\S]*/, '{ … }') : '  { … }');
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

    if (EXPORT_CONST_PATTERN.test(trimmed)) {
      out.push(line.length > 100 ? line.slice(0, 100) + ' …' : line);
      i++;
      continue;
    }

    out.push(line);
    i++;
  }

  return out.join('\n');
}

module.exports = { compressSource };
