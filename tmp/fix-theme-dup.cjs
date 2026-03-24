const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// 1. Fungsi resolveTheme yang akan ditambahkan ke panels.base.jsx
const RESOLVE_FN = `
export function resolveTheme(T) {
  return {
    bg:           T?.bg           || '#0a0a0f',
    bg2:          T?.bg2          || '#131108',
    bg3:          T?.bg3          || 'rgba(255,255,255,.04)',
    border:       T?.border       || 'rgba(255,255,255,.06)',
    borderMed:    T?.borderMed    || 'rgba(255,255,255,.1)',
    text:         T?.text         || '#f0f0f0',
    textSec:      T?.textSec      || 'rgba(255,255,255,.55)',
    textMute:     T?.textMute     || 'rgba(255,255,255,.3)',
    accent:       T?.accent       || '#a78bfa',
    accentBg:     T?.accentBg     || 'rgba(124,58,237,.1)',
    accentBorder: T?.accentBorder || 'rgba(124,58,237,.22)',
    success:      T?.success      || '#34d399',
    successBg:    T?.successBg    || 'rgba(52,211,153,.08)',
    error:        T?.error        || '#f87171',
    errorBg:      T?.errorBg      || 'rgba(248,113,113,.1)',
    warning:      T?.warning      || '#fbbf24',
    warningBg:    T?.warningBg    || 'rgba(251,191,36,.08)',
  };
}
`;

// 2. Tambahkan resolveTheme ke panels.base.jsx
const basePath = path.join(ROOT, 'src/components/panels.base.jsx');
let baseContent = fs.readFileSync(basePath, 'utf8');
if (!baseContent.includes('resolveTheme')) {
  baseContent += RESOLVE_FN;
  fs.writeFileSync(basePath, baseContent);
  console.log('✅ resolveTheme ditambahkan ke panels.base.jsx');
}

// 3. Transform panels files
const panelFiles = [
  'src/components/panels.agent.jsx',
  'src/components/panels.git.jsx',
  'src/components/panels.tools.jsx',
];

const THEME_LINE = /^(\s+)const (\w+)\s*= T\?\.\w+\s*\|\|/;

function transformFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const result = [];
  let i = 0;
  let needsImport = false;

  while (i < lines.length) {
    // Deteksi blok consecutive T?.* lines
    if (THEME_LINE.test(lines[i])) {
      const indent = lines[i].match(/^(\s+)/)?.[1] || '  ';
      const vars = [];
      while (i < lines.length && THEME_LINE.test(lines[i])) {
        const m = lines[i].match(/const (\w+)\s*=/);
        if (m) vars.push(m[1]);
        i++;
      }
      result.push(`${indent}const { ${vars.join(', ')} } = resolveTheme(T);`);
      needsImport = true;
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  let out = result.join('\n');

  // Tambah resolveTheme ke import dari panels.base.jsx
  if (needsImport && !out.includes('resolveTheme')) {
    out = out.replace(
      /import \{([^}]+)\} from ['"]\.\/panels\.base\.jsx['"]/,
      (m, imports) => `import {${imports}, resolveTheme } from './panels.base.jsx'`
    );
  }

  fs.writeFileSync(filepath, out);
  console.log(`✅ ${filepath} — ${needsImport ? 'direfactor' : 'tidak ada perubahan'}`);
}

for (const f of panelFiles) {
  transformFile(path.join(ROOT, f));
}

console.log('\n🎉 Selesai! Jalankan: npm test untuk verifikasi');
