// config.cjs
const path = require('path');

const IGNORE    = new Set(['node_modules', '.git', 'android', 'dist', '.yuyu', 'coverage', '.gradle', 'build', 'public', '__snapshots__', 'tmp', 'patch']);
const CODE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const ALL_EXTS  = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css']);

// Symbol extraction patterns
const SYMBOL_PATTERNS = [
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

module.exports = { IGNORE, CODE_EXTS, ALL_EXTS, SYMBOL_PATTERNS };
