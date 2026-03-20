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
  local dest
  if [ -n "$dest_dir" ]; then
    dest="${base_dest}/${dest_dir}/${file}"
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
