#!/usr/bin/env node
// yugit.cjs — YuyuCode git helper
// Usage: node yugit.cjs "commit message"

const { execSync } = require('child_process');
const os = require('os');

const msg = process.argv.slice(2).join(' ') || 'update by yuyu';
const CWD = { cwd: process.cwd(), encoding: 'utf8', stdio: ['pipe','pipe','pipe'] };

function run(cmd) {
  return execSync(cmd, CWD).trim();
}

function tryRun(cmd) {
  try { return { ok: true, out: run(cmd) }; }
  catch (e) { return { ok: false, out: (e.stderr || e.stdout || e.message || '').trim() }; }
}

console.log('🚀 YuyuGit starting...\n');

// ── status dulu ──
const status = tryRun('git status --short');
if (!status.ok) {
  console.error('❌ Bukan git repo atau git tidak tersedia:\n', status.out);
  process.exit(1);
}
if (!status.out) {
  console.log('✅ Tidak ada perubahan. Sudah up to date~');
  process.exit(0);
}
console.log('📝 Changed files:\n' + status.out + '\n');

// ── add ──
const add = tryRun('git add -A');
if (!add.ok) {
  console.error('❌ git add gagal:\n', add.out);
  process.exit(1);
}

// ── commit ──
const commit = tryRun(`git commit -m "${msg.replace(/"/g, "'")}"`);
if (!commit.ok) {
  // mungkin nothing to commit
  if (commit.out.includes('nothing to commit')) {
    console.log('✅ Nothing to commit, working tree clean~');
  } else {
    console.error('❌ git commit gagal:\n', commit.out);
    process.exit(1);
  }
} else {
  console.log('✅ Committed:', commit.out.split('\n')[0]);
}

// ── push ──
console.log('📡 Pushing...');
const push = tryRun('git push');
if (!push.ok) {
  console.error('❌ git push gagal:\n' + push.out);

  // hint spesifik
  if (push.out.includes('Authentication failed') || push.out.includes('Invalid username or token')) {
    console.log('\n💡 Fix: token GitHub invalid atau expired.');
    console.log('   1. Buat token baru: github.com → Settings → Developer settings → Personal access tokens');
    console.log('   2. Jalankan:');
    console.log('      git remote set-url origin https://TOKEN@github.com/Liveiciee/yuyucode.git');
  } else if (push.out.includes('rejected')) {
    console.log('\n💡 Fix: remote punya commit yang belum ada di local.');
    console.log('   Coba: git pull --rebase && node yugit.cjs "' + msg + '"');
  } else if (push.out.includes('no upstream')) {
    const branch = tryRun('git branch --show-current');
    console.log('\n💡 Fix: belum ada upstream branch. Jalankan:');
    console.log(`   git push --set-upstream origin ${branch.out||'main'}`);
  }
  process.exit(1);
}

console.log('✅ Push berhasil! Kode Papa sudah terbang ke GitHub 🌸');
if (push.out) console.log(push.out);
