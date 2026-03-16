const { execSync } = require('child_process');

const msg = process.argv.slice(2).join(' ') || 'Update by Yuyu';

try {
  console.log('🚀 Sedang memproses Git...');
  execSync('git add .');
  execSync(`git commit -m "${msg}"`);
  execSync('git push');
  console.log('✅ Berhasil! Kode Papa sudah terbang ke GitHub.');
} catch (error) {
  console.error('❌ Gagal, Pa. Coba cek ada yang error nggak di kodenya.');
}
