#!/usr/bin/env node
// yugit.cjs — YuyuCode git helper v2
// Usage:
//   node yugit.cjs "feat(api): add endpoint"          # commit + push
//   node yugit.cjs "fix: broken layout" --no-push     # commit only
//   node yugit.cjs "docs: update readme" --amend      # amend last commit
//   node yugit.cjs "revert: bad deploy" --hash abc123 # git revert <hash>
//   node yugit.cjs "feat: thing" "body text" "BREAKING CHANGE: x"  # with body/footer
//   node yugit.cjs "release: v2.x — desc"             # auto version bump + push
//   node yugit.cjs --push                              # push existing local commits
//   node yugit.cjs --squash 3                         # squash last N commits
//   node yugit.cjs --status                           # show branch + changes + recent commits

const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

// ── Parse args ────────────────────────────────────────────────────────────────
const rawArgs   = process.argv.slice(2);
const NO_PUSH   = rawArgs.includes('--no-push');
const AMEND     = rawArgs.includes('--amend');
const PUSH_ONLY = rawArgs.includes('--push');
const STATUS    = rawArgs.includes('--status');
const hashFlag  = rawArgs.find(a => a.startsWith('--hash='));
const hashIdx   = rawArgs.indexOf('--hash');
const HASH      = hashFlag ? hashFlag.split('=')[1] : (hashIdx !== -1 ? rawArgs[hashIdx + 1] : undefined);
const squashIdx = rawArgs.indexOf('--squash');
const SQUASH    = squashIdx !== -1 ? parseInt(rawArgs[squashIdx + 1], 10) : null;

// Filter flags out — remaining args are: [msg, body?, footer?]
const msgArgs = rawArgs.filter(a => !a.startsWith('--') && a !== HASH && (squashIdx === -1 || a !== rawArgs[squashIdx + 1]));
const msg     = msgArgs[0] || 'update by yuyu';
const body    = msgArgs[1] || null;
const footer  = msgArgs[2] || null;

const CWD = { cwd: process.cwd(), encoding: 'utf8', stdio: ['pipe','pipe','pipe'] };

function run(cmd) {
  return execSync(cmd, CWD).trim();
}

function tryRun(cmd) {
  try { return { ok: true, out: run(cmd) }; }
  catch (e) { return { ok: false, out: (e.stderr || e.stdout || e.message || '').trim() }; }
}

// ── Conventional commit type extractor (scope-aware) ─────────────────────────
// Handles: feat(api): desc → type=feat, scope=api
function parseCommitType(m) {
  const match = m.match(/^(\w+)(?:\(([^)]+)\))?(!)?:/);
  if (!match) return { type: null, scope: null, breaking: false };
  return { type: match[1], scope: match[2] || null, breaking: !!match[3] };
}

// ── Auto version bump ─────────────────────────────────────────────────────────
function bumpVersion() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) return null;

  const pkg     = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const current = pkg.version || '0.0.0';
  const parts   = current.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  // Explicit vX.Y or vX.Y.Z in message → set directly
  const vMatch = msg.match(/\bv(\d+\.\d+(?:\.\d+)?)\b/);
  let next;
  if (vMatch) {
    const targetParts = vMatch[1].split('.').map(Number);
    while (targetParts.length < 3) targetParts.push(0);
    next = targetParts.join('.');
  } else {
    const lowerMsg = msg.toLowerCase();
    const { breaking } = parseCommitType(msg);
    if (breaking || lowerMsg.includes('major')) {
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

// ── Diff stat display ─────────────────────────────────────────────────────────
function showDiffStat() {
  const stat = tryRun('git diff --cached --stat');
  if (stat.ok && stat.out) {
    console.log('📊 Staged changes:\n' + stat.out + '\n');
  }
}

// ── Build commit message (multi-line support) ─────────────────────────────────
function buildCommitArgs(finalMsg) {
  const args = [`-m "${finalMsg.replace(/"/g, "'")}"`];
  if (body)   args.push(`-m "${body.replace(/"/g, "'")}"`);
  if (footer) args.push(`-m "${footer.replace(/"/g, "'")}"`);
  return args.join(' ');
}

console.log('🚀 YuyuGit v2 starting...\n');

// ── Sanity check ──────────────────────────────────────────────────────────────
const status = tryRun('git status --short');
if (!status.ok) {
  console.error('❌ Bukan git repo atau git tidak tersedia:\n', status.out);
  process.exit(1);
}

// ── STATUS mode ───────────────────────────────────────────────────────────────
if (STATUS) {
  const branch    = tryRun('git branch --show-current');
  const ahead     = tryRun('git rev-list @{u}..HEAD --count 2>/dev/null || echo 0');
  const logRecent = tryRun('git log --oneline -3');
  const dirty     = status.out.trim();

  console.log(`🌿 Branch: ${branch.ok ? branch.out : '(unknown)'}`);
  if (ahead.ok && ahead.out !== '0') console.log(`📡 ${ahead.out} commit(s) belum di-push`);
  if (dirty) {
    console.log(`\n📝 Uncommitted changes:\n${dirty}`);
  } else {
    console.log('✅ Working tree clean');
  }
  if (logRecent.ok && logRecent.out) {
    console.log(`\n🕐 3 commit terakhir:\n${logRecent.out}`);
  }
  process.exit(0);
}

// ── PUSH-ONLY mode ────────────────────────────────────────────────────────────
if (PUSH_ONLY) {
  console.log('📡 Pushing existing local commits...');
  const push = tryRun('git push');
  if (!push.ok) {
    console.error('❌ git push gagal:\n' + push.out);
    if (push.out.includes('rejected')) {
      console.log('\n💡 Fix: git pull --rebase dulu baru push lagi.');
    }
    process.exit(1);
  }
  console.log('✅ Push berhasil! 🌸');
  if (push.out) console.log(push.out);
  process.exit(0);
}

// ── SQUASH mode ───────────────────────────────────────────────────────────────
if (SQUASH !== null) {
  if (isNaN(SQUASH) || SQUASH < 2) {
    console.error('❌ --squash butuh angka >= 2. Contoh: node yugit.cjs --squash 3');
    process.exit(1);
  }
  console.log(`🗜  Squashing ${SQUASH} commit terakhir...\n`);
  const log = tryRun(`git log --oneline -${SQUASH}`);
  if (log.ok) console.log('Commits yang akan di-squash:\n' + log.out + '\n');

  // Get the commit message of the oldest commit being squashed
  const oldestMsg = tryRun(`git log --format=%s -1 HEAD~${SQUASH - 1}`);
  const squashMsg = msg || (oldestMsg.ok ? oldestMsg.out : `squash: ${SQUASH} commits`);

  const squash = tryRun(`git reset --soft HEAD~${SQUASH}`);
  if (!squash.ok) { console.error('❌ squash gagal:\n', squash.out); process.exit(1); }

  const commitArgs = buildCommitArgs(squashMsg);
  const commit = tryRun(`git commit ${commitArgs}`);
  if (!commit.ok) { console.error('❌ commit gagal:\n', commit.out); process.exit(1); }
  console.log('✅ Squash selesai:', commit.out.split('\n')[0]);

  if (!NO_PUSH) {
    console.log('📡 Force pushing...');
    const push = tryRun('git push --force-with-lease');
    if (!push.ok) { console.error('❌ push gagal:\n', push.out); process.exit(1); }
    console.log('✅ Force push berhasil!');
  } else {
    console.log('💡 --no-push: jalankan: git push --force-with-lease');
  }
  process.exit(0);
}

const { type: commitType, scope, breaking } = parseCommitType(msg);
const isRelease = msg.trim().toLowerCase().startsWith('release:');
const isRevert  = msg.trim().toLowerCase().startsWith('revert:');

if (scope)    console.log(`📦 Scope: ${scope}`);
if (breaking) console.log('⚠️  BREAKING CHANGE detected');

// ── AMEND mode ────────────────────────────────────────────────────────────────
if (AMEND) {
  console.log('✏️  Amending last commit...\n');
  const add = tryRun('git add -A');
  if (!add.ok) { console.error('❌ git add gagal:\n', add.out); process.exit(1); }
  showDiffStat();
  const amend = tryRun(`git commit --amend ${buildCommitArgs(msg)}`);
  if (!amend.ok) { console.error('❌ amend gagal:\n', amend.out); process.exit(1); }
  console.log('✅ Amended:', amend.out.split('\n')[0]);
  if (!NO_PUSH) {
    console.log('📡 Force pushing...');
    const push = tryRun('git push --force-with-lease');
    if (!push.ok) { console.error('❌ push gagal:\n', push.out); process.exit(1); }
    console.log('✅ Force push berhasil!');
  } else {
    console.log('💡 --no-push: skip push. Jalankan: git push --force-with-lease');
  }
  process.exit(0);
}

// ── REVERT mode ───────────────────────────────────────────────────────────────
if (isRevert && HASH) {
  console.log(`⏪ Reverting commit ${HASH}...\n`);
  const revert = tryRun(`git revert ${HASH} --no-edit`);
  if (!revert.ok) { console.error('❌ revert gagal:\n', revert.out); process.exit(1); }
  console.log('✅ Reverted:', revert.out.split('\n')[0]);
  if (!NO_PUSH) {
    console.log('📡 Pushing...');
    const push = tryRun('git push');
    if (!push.ok) { console.error('❌ push gagal:\n', push.out); process.exit(1); }
    console.log('✅ Push berhasil!');
  }
  process.exit(0);
}

// ── Auto bump version on release ──────────────────────────────────────────────
let bumped = null;
if (isRelease) {
  bumped = bumpVersion();
  if (bumped) console.log(`🔢 Version bumped: ${bumped.from} → ${bumped.to}\n`);
}

// ── Re-check status after possible package.json edit ─────────────────────────
const statusAfter = tryRun('git status --short');
if (!statusAfter.out && !status.out) {
  console.log('✅ Tidak ada perubahan. Sudah up to date~');
  process.exit(0);
}
console.log('📝 Changed files:\n' + (statusAfter.out || status.out) + '\n');

// ── git add ───────────────────────────────────────────────────────────────────
const add = tryRun('git add -A');
if (!add.ok) { console.error('❌ git add gagal:\n', add.out); process.exit(1); }

showDiffStat();

// ── git commit ────────────────────────────────────────────────────────────────
const finalMsg    = bumped ? `${msg} [v${bumped.to}]` : msg;
const commitArgs  = buildCommitArgs(finalMsg);
const commit      = tryRun(`git commit ${commitArgs}`);

if (!commit.ok) {
  if (commit.out.includes('nothing to commit')) {
    console.log('✅ Nothing to commit, working tree clean~');
  } else {
    console.error('❌ git commit gagal:\n', commit.out);
    process.exit(1);
  }
} else {
  console.log('✅ Committed:', commit.out.split('\n')[0]);
  if (body)   console.log('   Body:', body);
  if (footer) console.log('   Footer:', footer);
}

// ── git push ──────────────────────────────────────────────────────────────────
if (NO_PUSH) {
  console.log('\n💡 --no-push: commit lokal selesai. Jalankan: node yugit.cjs --push');
  process.exit(0);
}

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
    console.log(`   git push --set-upstream origin ${branch.out || 'main'}`);
  }
  process.exit(1);
}

console.log('✅ Push berhasil! Kode Papa sudah terbang ke GitHub 🌸');
if (bumped)  console.log(`📦 Package version: ${bumped.to}`);
if (push.out) console.log(push.out);
