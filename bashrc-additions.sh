# ── YuyuCode v2.7+ .bashrc additions ─────────────────────────────────────────
# Tambahkan snippet ini ke ~/.bashrc, lalu: source ~/.bashrc

# ── Auto-restart server on crash ─────────────────────────────────────────────
# Ganti baris: node ~/yuyu-server.js > /dev/null 2>&1 &
# Dengan ini:
yuyu-server-start() {
  while true; do
    node ~/yuyu-server.js > ~/.yuyu-server.log 2>&1
    echo "⚠️  yuyu-server crashed — restarting in 2s..." >&2
    sleep 2
  done &
  echo "✅ yuyu-server running (auto-restart enabled)"
}
# Untuk auto-start di setiap sesi, tambahkan di .bashrc:
# yuyu-server-start

# ── yuyu-status — overview satu command ──────────────────────────────────────
yuyu-status() {
  local port=8765
  local server_status
  if curl -sf "http://localhost:${port}/health" > /dev/null 2>&1; then
    local health=$(curl -sf "http://localhost:${port}/health" 2>/dev/null)
    local uptime=$(echo "$health" | python3 -c "import json,sys; d=json.load(sys.stdin); u=d.get('uptime',0); print(f'{u//3600}h {(u%3600)//60}m' if u>=3600 else f'{u//60}m {u%60}s')" 2>/dev/null || echo "?")
    server_status="✅ running (uptime: ${uptime})"
  else
    server_status="❌ not running — jalankan: yuyu-server-start"
  fi

  local branch=$(git -C ~/yuyucode branch --show-current 2>/dev/null || echo "?")
  local ahead=$(git -C ~/yuyucode rev-list @{u}..HEAD --count 2>/dev/null || echo "0")
  local version=$(python3 -c "import json; print(json.load(open('$HOME/yuyucode/package.json'))['version'])" 2>/dev/null || echo "?")
  local dirty=$(git -C ~/yuyucode status --short 2>/dev/null | wc -l | tr -d ' ')

  echo ""
  echo "📡 Server  : ${server_status}"
  echo "🌿 Branch  : ${branch}$([ "$ahead" != "0" ] && echo " (${ahead} commit(s) belum push)")"
  echo "📦 Version : v${version}"
  echo "📝 Dirty   : ${dirty} file(s) uncommitted"
  echo ""
}

# ── yuyu-clean — hapus artifacts ─────────────────────────────────────────────
yuyu-clean() {
  cd ~/yuyucode
  echo "🧹 Cleaning build artifacts..."
  local removed=0

  [ -d "dist" ]      && rm -rf dist      && echo "  🗑  dist/"         && removed=$((removed+1))
  [ -d "coverage" ]  && rm -rf coverage  && echo "  🗑  coverage/"     && removed=$((removed+1))

  for f in .yuyu/compressed*.md; do
    [ -f "$f" ] && rm "$f" && echo "  🗑  $f" && removed=$((removed+1))
  done

  for f in /sdcard/Download/*.zip; do
    [ -f "$f" ] && echo "  ⚠️  Download zip found: $(basename $f) — hapus manual kalau mau"
  done

  if [ "$removed" -eq 0 ]; then
    echo "  ✨ Already clean!"
  else
    echo ""
    echo "✅ Cleaned ${removed} artifact(s)"
  fi
}

# ── yuyu-cp v2 — support subdirectory ────────────────────────────────────────
# Ganti fungsi yuyu-cp yang lama dengan versi ini
yuyu-cp() {
  local file="${1}"
  local dest_dir="${2:-}"   # optional: target subdir relative to yuyucode root

  local src="/sdcard/Download/${file}"
  local base_dest="$HOME/yuyucode"

  if [ ! -f "$src" ]; then
    echo "❌ File '$file' tidak ditemukan di /sdcard/Download/"
    echo "📂 Isi Download terbaru:"
    ls -t /sdcard/Download/ | head -n 5
    return 1
  fi

  if [[ "$file" == *.zip ]]; then
    echo "📦 Zip terdeteksi — delegasi ke yuyu-apply..."
    yuyu-apply "$file"
    return $?
  fi

  # Determine destination
  # Arg ke-2 bisa berupa: subdir ("src/hooks") atau full path ("src/hooks/useX.js")
  local dest
  if [ -n "$dest_dir" ]; then
    # Kalau arg ke-2 sudah berakhiran nama file yang sama → full path
    if [[ "$dest_dir" == */"$file" ]] || [[ "$dest_dir" == "$file" ]]; then
      dest="${base_dest}/${dest_dir}"
    else
      dest="${base_dest}/${dest_dir}/${file}"
    fi
  else
    dest="${base_dest}/${file}"
  fi

  cd ~/yuyucode

  # Warn if git-tracked with uncommitted changes
  local rel_dest="${dest#$base_dest/}"
  if git ls-files --error-unmatch "$rel_dest" &>/dev/null 2>&1; then
    if ! git diff --quiet "$rel_dest" 2>/dev/null; then
      echo "⚠️  '$rel_dest' ada uncommitted changes di git."
      echo -n "Lanjut overwrite? Tekan y/Y untuk lanjut, lainnya batal: "
      read -s -n 1 key
      echo ""
      case "$key" in
        y|Y) echo "👍 Overwriting..." ;;
        *)   echo "✋ Dibatalkan."; return 0 ;;
      esac
    fi
  fi

  mkdir -p "$(dirname "$dest")"
  if cp "$src" "$dest" && rm "$src"; then
    echo "✅ '$file' → ${dest#$HOME/} ✓ (Download dibersihkan)"
  else
    echo "⚠️  Gagal memindahkan file. Cek izin storage Termux!"
    return 1
  fi
}

# ── Tab completions (update) ──────────────────────────────────────────────────
_yuyu_cp_completion() {
  local cur="${COMP_WORDS[COMP_CWORD]}"
  local files=$(ls /sdcard/Download/ 2>/dev/null)
  COMPREPLY=( $(compgen -W "$files" -- "$cur") )
}
complete -F _yuyu_cp_completion yuyu-cp

# ── yuyu-unstash — pop stash, auto-resolve conflicts ke HEAD ─────────────────
yuyu-unstash() {
  cd ~/yuyucode

  local stash="${1:-stash@{0}}"

  # Cek ada stash
  if ! git stash list | grep -q "stash@"; then
    echo "✅ Tidak ada stash."
    return 0
  fi

  echo "📦 Popping $stash..."
  git stash pop "$stash" 2>&1 | head -20

  # Cek konflik
  local conflicts=$(git diff --name-only --diff-filter=U 2>/dev/null)
  if [ -z "$conflicts" ]; then
    echo "✅ Stash pop bersih, tidak ada konflik."
    return 0
  fi

  echo ""
  echo "⚠️  Konflik ditemukan — auto-resolve ke HEAD:"
  for f in $conflicts; do
    git checkout HEAD -- "$f"
    git add "$f"
    echo "  ✅ $f → kept HEAD"
  done

  git stash drop 2>/dev/null
  echo ""
  echo "✅ Selesai! Perubahan stash yang tidak konflik sudah masuk."
}

# ── YuyuCode Bench v3 commands ────────────────────────────────────────────────
# Berdasarkan workflow: bench sebelum commit, setelah refactor, dan release.

# ── yuyu-bench — shortcut utama ──────────────────────────────────────────────
yuyu-bench() {
  cd ~/yuyucode
  node yuyu-bench.cjs "$@"
}

# ── yuyu-bench-save — update baseline (pakai setelah refactor disengaja) ─────
yuyu-bench-save() {
  cd ~/yuyucode
  echo "💾 Updating baseline..."
  node yuyu-bench.cjs --save
}

# ── yuyu-bench-trend — lihat grafik history semua metric ─────────────────────
yuyu-bench-trend() {
  cd ~/yuyucode
  node yuyu-bench.cjs --trend
}

# ── yuyu-bench-watch — auto re-run tiap file src/ berubah ────────────────────
yuyu-bench-watch() {
  cd ~/yuyucode
  echo "👁  Watch mode aktif. Ctrl+C untuk berhenti."
  node yuyu-bench.cjs --watch
}

# ── yuyu-precommit — full check sebelum node yugit.cjs ───────────────────────
# Urutan: lint → test → bench. Berhenti kalau salah satu gagal.
yuyu-precommit() {
  cd ~/yuyucode
  echo ""
  echo "═══════════════════════════════════════"
  echo "  🚦 YuyuCode Pre-commit Check"
  echo "═══════════════════════════════════════"
  echo ""

  # 1. Lint
  echo "① Lint..."
  if ! npm run lint --silent 2>&1 | tail -3; then
    echo "❌ Lint gagal — fix dulu sebelum commit."
    return 1
  fi
  echo "✅ Lint OK"
  echo ""

  # 2. Test
  echo "② Tests..."
  local test_out
  test_out=$(npx vitest run --reporter=verbose 2>&1 | tail -5)
  echo "$test_out"
  if echo "$test_out" | grep -q "failed"; then
    echo "❌ Tests gagal — fix dulu sebelum commit."
    return 1
  fi
  echo "✅ Tests OK"
  echo ""

  # 3. Bench
  echo "③ Bench..."
  node yuyu-bench.cjs
  local bench_exit=$?
  if [ $bench_exit -ne 0 ]; then
    echo ""
    echo "⚠️  Ada regresi bench. Tetap commit?"
    echo -n "y = lanjut commit  |  n = batal: "
    read -s -n 1 key
    echo ""
    [ "$key" != "y" ] && [ "$key" != "Y" ] && echo "✋ Commit dibatalkan." && return 1
  fi

  echo ""
  echo "═══════════════════════════════════════"
  echo "  ✅ Semua check passed — siap commit!"
  echo "═══════════════════════════════════════"
  echo ""
  echo "💡 Jalankan: node yugit.cjs \"feat: ...\""
}

# ── yuyu-release-check — bench compare sebelum/sesudah refactor besar ────────
# Usage: yuyu-release-check <tag-lama>
# Contoh: yuyu-release-check v4.1.0
yuyu-release-check() {
  cd ~/yuyucode
  local old_tag="${1}"
  if [ -z "$old_tag" ]; then
    echo "Usage: yuyu-release-check <git-tag>"
    echo "Contoh: yuyu-release-check v4.1.0"
    return 1
  fi

  echo "📊 Comparing bench: $old_tag → HEAD"

  # Simpan baseline HEAD
  node yuyu-bench.cjs --export
  local head_snap=".yuyu/bench-export.json"
  local old_snap=".yuyu/bench-${old_tag}.json"

  # Checkout tag → run bench → export
  git stash -q
  git checkout -q "$old_tag" 2>/dev/null || { echo "❌ Tag '$old_tag' tidak ditemukan."; git stash pop -q; return 1; }
  node yuyu-bench.cjs --export
  cp "$head_snap" "$old_snap"

  # Kembali ke HEAD
  git checkout - -q 2>/dev/null
  git stash pop -q 2>/dev/null

  # Compare
  node yuyu-bench.cjs --compare "$old_snap" "$head_snap"
}

# ── Tab completions ───────────────────────────────────────────────────────────
_yuyu_bench_completion() {
  local cur="${COMP_WORDS[COMP_CWORD]}"
  COMPREPLY=( $(compgen -W "--save --reset --trend --watch --export --compare" -- "$cur") )
}
complete -F _yuyu_bench_completion yuyu-bench
