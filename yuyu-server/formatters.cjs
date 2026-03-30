// formatters.cjs
const path = require('path');

function formatPackageJSON(pkgData) {
  if (typeof pkgData === 'string') {
    try { pkgData = JSON.parse(pkgData); } catch(e) { return pkgData; }
  }
  
  const lines = [];
  lines.push(`📦 **${pkgData.name || 'Project'}** v${pkgData.version || '?'}`);
  lines.push(`   ${pkgData.private ? '🔒 Private' : '🌍 Public'}`);
  lines.push('');
  
  if (pkgData.scripts) {
    lines.push('⚙️ **Scripts yang tersedia:**');
    const scriptDesc = {
      'dev': '🚀 Jalankan development server (mode live-reload)',
      'build': '📦 Build untuk production (hasil siap deploy)',
      'lint': '🔍 Cek kualitas kode & style guide',
      'lint:fix': '✨ Perbaiki masalah linting otomatis',
      'test': '🧪 Jalankan semua tes',
      'test:watch': '👀 Tes otomatis saat ada perubahan',
      'preview': '👀 Preview hasil build di browser',
      'bench': '📊 Ukur performa aplikasi',
      'bench:save': '💾 Simpan hasil benchmark',
      'bench:reset': '🔄 Reset data benchmark',
    };
    for (const [name, cmd] of Object.entries(pkgData.scripts)) {
      const desc = scriptDesc[name] || `💻 ${cmd.slice(0, 50)}${cmd.length > 50 ? '...' : ''}`;
      lines.push(`   • \`npm run ${name}\` — ${desc}`);
    }
  }
  
  if (pkgData.dependencies) {
    const depCount = Object.keys(pkgData.dependencies).length;
    lines.push(`\n📚 **${depCount} dependensi utama** (library yang dipakai aplikasi)`);
    const important = {
      'react': 'Framework UI paling populer',
      'vue': 'Framework UI yang mudah dipelajari',
      'angular': 'Framework enterprise oleh Google',
      'typescript': 'JavaScript dengan tipe data',
      'node': 'Runtime JavaScript di server',
      'codemirror': 'Editor kode di browser',
      'vite': 'Build tool super cepat',
    };
    const highlighted = [];
    for (const [name, desc] of Object.entries(pkgData.dependencies)) {
      if (important[name]) {
        highlighted.push(`   • **${name}** (${desc})`);
      }
    }
    if (highlighted.length) {
      lines.push('\n   ✨ Yang sering dipakai:');
      lines.push(...highlighted.slice(0, 5));
    }
    const otherDeps = Object.keys(pkgData.dependencies).filter(d => !important[d]);
    if (otherDeps.length) {
      lines.push(`\n   📦 Lainnya: ${otherDeps.slice(0, 5).join(', ')}${otherDeps.length > 5 ? '...' : ''}`);
    }
  }
  
  if (pkgData.devDependencies) {
    const devCount = Object.keys(pkgData.devDependencies).length;
    lines.push(`\n🛠️ **${devCount} dev tools** (hanya dipakai saat development)`);
  }
  
  if (pkgData.overrides) {
    lines.push(`\n⚠️ **Overrides khusus**:`);
    for (const [pkg, override] of Object.entries(pkgData.overrides)) {
      lines.push(`   • ${pkg} → ${override}`);
    }
  }
  return lines.join('\n');
}

function formatConfigFile(configData, fileName) {
  if (typeof configData === 'string') {
    try { configData = JSON.parse(configData); } catch(e) { return configData; }
  }
  const lines = [];
  lines.push(`⚙️ **${fileName}**`);
  lines.push('');
  if (fileName === 'tsconfig.json') {
    lines.push('📝 **Konfigurasi TypeScript:**');
    if (configData.compilerOptions) {
      const opts = configData.compilerOptions;
      if (opts.target) lines.push(`   • Target: ${opts.target}`);
      if (opts.module) lines.push(`   • Module system: ${opts.module}`);
      if (opts.strict) lines.push(`   • Strict mode: ${opts.strict ? '✅ Aktif' : '❌ Nonaktif'}`);
      if (opts.jsx) lines.push(`   • JSX support: ${opts.jsx}`);
      if (opts.outDir) lines.push(`   • Output folder: ${opts.outDir}`);
      if (opts.rootDir) lines.push(`   • Source folder: ${opts.rootDir}`);
    }
  }
  if (fileName === 'vite.config.js' || fileName === 'vite.config.ts') {
    lines.push('⚡ **Konfigurasi Vite (build tool):**');
    lines.push('   📦 Build tool modern yang sangat cepat');
    if (configData.plugins) lines.push(`   • Plugins: ${configData.plugins.length || 0} plugin`);
  }
  if (fileName === '.eslintrc.json' || fileName === 'eslint.config.js') {
    lines.push('🔍 **Konfigurasi ESLint (code quality):**');
    lines.push('   • Memastikan kode konsisten & bebas error');
  }
  return lines.join('\n');
}

function formatEnvFile(envData) {
  const lines = [];
  lines.push('🔐 **Environment Variables**');
  lines.push('');
  const vars = envData.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  const sensitive = ['KEY', 'SECRET', 'TOKEN', 'PASSWORD', 'API', 'CREDENTIAL'];
  let publicCount = 0;
  let secretCount = 0;
  for (const line of vars) {
    const [key] = line.split('=');
    const isSecret = sensitive.some(s => key.includes(s));
    if (isSecret) secretCount++;
    else publicCount++;
  }
  lines.push(`   📊 Total: ${vars.length} variabel`);
  lines.push(`   🔒 Secret: ${secretCount}`);
  lines.push(`   🌍 Public: ${publicCount}`);
  lines.push('');
  lines.push('   ⚠️ Jangan commit file ini ke GitHub!');
  return lines.join('\n');
}

function formatMarkdown(mdData) {
  const lines = [];
  const titleMatch = mdData.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    lines.push(`📖 **${titleMatch[1]}**`);
  } else {
    lines.push('📖 **Dokumentasi**');
  }
  lines.push('');
  const sections = mdData.match(/^#{1,3}\s+.+$/gm) || [];
  lines.push(`📑 **${sections.length} section**`);
  const wordCount = mdData.split(/\s+/).length;
  lines.push(`📝 **~${wordCount} kata**`);
  const codeBlocks = (mdData.match(/```/g) || []).length;
  if (codeBlocks > 0) {
    lines.push(`💻 **${codeBlocks / 2} code block**`);
  }
  const links = (mdData.match(/\[.*?\]\(.*?\)/g) || []).length;
  if (links > 0) {
    lines.push(`🔗 **${links} link eksternal**`);
  }
  return lines.join('\n');
}

function humanFormat(content, filePath) {
  const fileName = path.basename(filePath).toLowerCase();
  if (fileName === 'package.json') return formatPackageJSON(content);
  if (fileName === 'tsconfig.json') return formatConfigFile(content, 'tsconfig.json');
  if (fileName.startsWith('vite.config')) return formatConfigFile(content, 'vite.config');
  if (fileName === '.eslintrc.json' || fileName === 'eslint.config.js') return formatConfigFile(content, 'eslint');
  if (fileName === '.env' || fileName.endsWith('.env')) return formatEnvFile(content);
  if (fileName.endsWith('.md')) return formatMarkdown(content);
  return content;
}

module.exports = { humanFormat };
