#!/usr/bin/env node
// yugit.cjs — YuyuCode git helper
// Usage: node yugit.cjs "commit message"
// Auto-bumps package.json version on "release:" prefix commits.

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const msg = process.argv.slice(2).join(' ') || 'update by yuyu';
const CWD = { cwd: process.cwd(), encoding: 'utf8', stdio: ['pipe','pipe','pipe'] };

function run(cmd) {
  return execSync(cmd, CWD).trim();
}

function tryRun(cmd) {
  try { return { ok: true, out: run(cmd) }; }
  catch (e) { return { ok: false, out: (e.stderr || e.stdout || e.message || '').trim() }; }
}

// ── Auto version bump ─────────────────────────────────────────────────────────
function bumpVersion() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) return null;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const current = pkg.version || '0.0.0';
  const parts = current.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  // Jika pesan mengandung vX.Y atau vX.Y.Z → SET langsung ke versi itu
  const vMatch = msg.match(/\bv(\d+\.\d+(?:\.\d+)?)\b/);
  let next;
  if (vMatch) {
    const targetParts = vMatch[1].split('.').map(Number);
    while (targetParts.length < 3) targetParts.push(0);
    next = targetParts.join('.');
  } else {
    // patch bump: 2.5.0 → 2.5.1, unless msg contains "major" or "minor"
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes('major')) {
      parts[0]++; parts[1] = 0; parts[2] = 0;
    } else if (lowerMsg.includes('minor')) {
      parts[1]++; parts[2] = 0;
    } else {
      parts[2]++;
    }
    next = parts.join('.');
  }
  pkg.version = next;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  return { from: current, to: next };
}

console.log('🚀 YuyuGit starting...\n');

// ── status ────────────────────────────────────────────────────────────────────
const status = tryRun('git status --short');
if (!status.ok) {
  console.error('❌ Bukan git repo atau git tidak tersedia:\n', status.out);
  process.exit(1);
}

const isRelease = msg.trim().toLowerCase().startsWith('release:');

// ── auto bump version jika release ───────────────────────────────────────────
let bumped = null;
if (isRelease) {
  bumped = bumpVersion();
  if (bumped) {
    console.log(`🔢 Version bumped: ${bumped.from} → ${bumped.to}\n`);
  }
}

// Re-check status after possible package.json edit
const statusAfter = tryRun('git status --short');
if (!statusAfter.out && !status.out) {
  console.log('✅ Tidak ada perubahan. Sudah up to date~');
  process.exit(0);
}
console.log('📝 Changed files:\n' + (statusAfter.out || status.out) + '\n');

// ── add ───────────────────────────────────────────────────────────────────────
const add = tryRun('git add -A');
if (!add.ok) {
  console.error('❌ git add gagal:\n', add.out);
  process.exit(1);
}

// ── commit ────────────────────────────────────────────────────────────────────
const finalMsg = bumped ? `${msg} [v${bumped.to}]` : msg;
const commit = tryRun(`git commit -m "${finalMsg.replace(/"/g, "'")}"`);
if (!commit.ok) {
  if (commit.out.includes('nothing to commit')) {
    console.log('✅ Nothing to commit, working tree clean~');
  } else {
    console.error('❌ git commit gagal:\n', commit.out);
    process.exit(1);
  }
} else {
  console.log('✅ Committed:', commit.out.split('\n')[0]);
}

// ── push ──────────────────────────────────────────────────────────────────────
console.log('📡 Pushing...');
const push = tryRun('git push');
if (!push.ok) {
  console.error('❌ git push gagal:\n' + push.out);

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
if (bumped) console.log(`📦 Package version: ${bumped.to}`);
if (push.out) console.log(push.out);
