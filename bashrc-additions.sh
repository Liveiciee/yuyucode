# ================================================
# ~/.bashrc - YuyuCode Optimized for Snapdragon 680
# HP $130 — RAM 8GB — Termux Best Practice
# ================================================

export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Check Android SDK
if [ ! -d "$ANDROID_HOME" ]; then
    echo "⚠️ Android SDK not found at $ANDROID_HOME"
    echo "   Run: mkdir -p $ANDROID_HOME"
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"

# ── Optimasi untuk HP Snapdragon 680 + 8GB RAM ─────────────────────
export NODE_OPTIONS="--max-old-space-size=512"
alias nt="npm test -- --run"          # test cepat tanpa watch mode
alias nl="npm run lint -- --fix"

# ── Server Management ──────────────────────────────────────────────
yuyu-server-stop() {
  pkill -f "node.*yuyu-server.js" && echo "✅ Server stopped" || echo "ℹ️ Server not running"
}

yuyu-server-start() {
  yuyu-server-stop
  while true; do
    node ~/yuyu-server.js >> ~/.yuyu-server.log 2>&1
    echo "⚠️ yuyu-server crashed — restarting in 2s... ($(date))" >> ~/.yuyu-server.log
    sleep 2
  done &
  echo $! > ~/.yuyu-server.pid
  echo "✅ yuyu-server running (PID: $!)"
}

yuyu-server-logs() {
  tail -f ~/.yuyu-server.log
}

# Auto-start server
yuyu-server-start

# ── yuyu-apply — Apply zip dari Claude ─────────────────────────────
yuyu-apply() {
  local zip="${1:-yuyu-overhaul.zip}"
  local DRY=0
  
  # Proper argument parsing
  if [ "$1" = "--dry-run" ]; then
    DRY=1
    zip="${2:-yuyu-overhaul.zip}"
    echo "🔍 DRY RUN mode"
  elif [ "$2" = "--dry-run" ]; then
    DRY=1
    echo "🔍 DRY RUN mode"
  fi

  cd ~/yuyucode || { echo "❌ yuyucode directory not found"; return 1; }
  
  local zip_path="/sdcard/Download/$zip"
  if [ ! -f "$zip_path" ]; then
    echo "❌ File not found: $zip_path"
    return 1
  fi

  echo "📦 Files dalam $zip:"
  unzip -l "$zip_path" 2>/dev/null | grep -E '^[[:space:]]+[0-9]+' | tail -n +4 | head -n -2 | awk '{print "  → " $NF}'

  if [ "$DRY" = "1" ]; then
    echo "🔍 Dry run selesai — jalankan tanpa --dry-run untuk apply"
    return 0
  fi

  local SNAPSHOT=$(git rev-parse HEAD)
  local STASHED=0
  
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "⚠️ Ada perubahan lokal — stashing..."
    git stash push -m "yuyu-apply auto-stash $(date +%Y%m%d-%H%M%S)"
    STASHED=1
  fi

  _yuyu_rollback() {
    echo "🔄 Rolling back..."
    git reset --hard "$SNAPSHOT"
    [ "$STASHED" = "1" ] && echo "💡 Run: git stash pop"
  }

  cp "$zip_path" ./ || { echo "❌ cp failed"; return 1; }
  unzip -o "$zip" || { echo "❌ unzip failed"; _yuyu_rollback; return 1; }

  echo "🧐 Running lint & test..."
  npm run lint || { echo "❌ Lint failed"; _yuyu_rollback; return 1; }
  npx vitest run || { echo "❌ Tests failed"; _yuyu_rollback; return 1; }

  rm -f "./$zip" "$zip_path"
  echo "✅ Semua berhasil!"
  [ "$STASHED" = "1" ] && echo "💡 Stash masih ada: git stash pop"
}

# ── yuyu-cp — Copy file dari Download (support subfolder) ──────────
yuyu-cp() {
  local file="$1"
  local dest_dir="${2:-}"
  local src="/sdcard/Download/${file}"
  local base="$HOME/yuyucode"

  if [ ! -f "$src" ]; then
    echo "❌ File tidak ditemukan di Download"
    echo "📁 Recent files:"
    ls -lt /sdcard/Download/ | head -n 5 | tail -n +2 | awk '{print "  → " $NF}'
    return 1
  fi

  if [[ "$file" == *.zip ]]; then
    yuyu-apply "$file"
    return $?
  fi

  local dest
  if [ -n "$dest_dir" ]; then
    dest="${base}/${dest_dir}/${file}"
  else
    dest="${base}/${file}"
  fi

  mkdir -p "$(dirname "$dest")"

  cd "$base" || return 1
  
  # Check git status
  local rel_path="${dest#$base/}"
  if git ls-files --error-unmatch "$rel_path" &>/dev/null 2>&1; then
    if ! git diff --quiet "$rel_path" 2>/dev/null; then
      echo -n "⚠️ File ada perubahan. Lanjut overwrite? (y/N): "
      read -r key
      [[ "$key" != "y" && "$key" != "Y" ]] && echo "✋ Dibatalkan" && return 0
    fi
  fi

  if cp "$src" "$dest" && rm "$src"; then
    echo "✅ '$file' berhasil disalin ke ${dest#$HOME/}"
  else
    echo "❌ Gagal copy file"
    return 1
  fi
}

# ── Utility tambahan ───────────────────────────────────────────────
yuyu-status() {
  echo "📡 Server  : $(curl -sf http://localhost:8765/health >/dev/null 2>&1 && echo '✅ running' || echo '❌ not running')"
  echo "🌿 Branch  : $(git -C ~/yuyucode branch --show-current 2>/dev/null || echo '?')"
  echo "📝 Dirty   : $(git -C ~/yuyucode status --short 2>/dev/null | wc -l | tr -d ' ') file(s)"
}

yuyu-clean() {
  cd ~/yuyucode
  rm -rf dist coverage .yuyu/compressed*.md node_modules/.cache 2>/dev/null
  echo "✅ Artifacts cleaned"
}

# ── Bench shortcuts ────────────────────────────────────────────────
yuyu-bench() { 
  cd ~/yuyucode && node yuyu-bench.cjs "$@"
}
alias yb="yuyu-bench"

# ── Memory monitoring ──────────────────────────────────────────────
yuyu-mem() {
  echo "📊 Memory Usage:"
  free -h 2>/dev/null || echo "free command not available"
  echo ""
  echo "🔋 Node processes:"
  ps aux | grep node | grep -v grep || echo "None"
  echo ""
  echo "💾 Max heap size: $(node -e "console.log(process.execArgv.join(' '))" 2>/dev/null | grep -o "max-old-space-size=[0-9]*" | cut -d= -f2 || echo "default") MB"
}

# ── Node version management ────────────────────────────────────────
yuyu-node() {
  local version="${1:-lts}"
  echo "🔄 Switching to Node $version..."
  nvm install "$version" 2>/dev/null || nvm use "$version"
  echo "✅ Now using: $(node -v)"
  echo "📦 Memory limit: $(node -e "console.log(process.execArgv.join(' '))" 2>/dev/null | grep -o "max-old-space-size=[0-9]*" | cut -d= -f2 || echo "default") MB"
}

# ── Performance profile ────────────────────────────────────────────
yuyu-profile() {
  echo "📱 Device: Snapdragon 680, 8GB RAM"
  echo "⚙️  Node Options: $NODE_OPTIONS"
  echo ""
  echo "Current CPU Governor:"
  cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null || echo "N/A"
  echo ""
  echo "Temperature:"
  cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null | head -1 | awk '{print $1/1000 "°C"}' || echo "N/A"
  echo ""
  echo "📊 Disk usage:"
  df -h ~ | tail -1
}

# ── Aliases for common tasks ──────────────────────────────────────
alias ylogs="tail -f ~/.yuyu-server.log"
alias ystop="yuyu-server-stop"
alias yrestart="yuyu-server-stop && yuyu-server-start"
alias ytest="npm test -- --run"
alias ylint="npm run lint -- --fix"
alias ybuild="npm run build"
alias ydev="npm run dev"
alias yclean="yuyu-clean"
alias ystat="yuyu-status"
alias ybench="yuyu-bench"
alias ymem="yuyu-mem"
alias yprofile="yuyu-profile"
alias ynode="yuyu-node"

# ── Help command ──────────────────────────────────────────────────
yuyu-help() {
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║           YuyuCode Commands for Snapdragon 680            ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo ""
  echo "📦 File Management:"
  echo "  yuyu-cp <file> [dir]  - Copy file from Download to yuyucode"
  echo "  yuyu-apply [zip]      - Apply zip file (with rollback on fail)"
  echo "  yuyu-clean            - Remove build artifacts"
  echo ""
  echo "🖥️  Server:"
  echo "  yuyu-server-start     - Start server with auto-restart"
  echo "  yuyu-server-stop      - Stop server"
  echo "  ylogs                 - Tail server logs"
  echo "  yrestart              - Restart server"
  echo ""
  echo "📊 Status & Info:"
  echo "  ystat / yuyu-status   - Show server, branch, and git status"
  echo "  ymem / yuyu-mem       - Show memory usage"
  echo "  yprofile              - Show device performance profile"
  echo ""
  echo "🛠️  Development:"
  echo "  ytest / nt            - Run tests"
  echo "  ylint / nl            - Run linter with fix"
  echo "  ybuild                - Run build"
  echo "  ydev                  - Run dev server"
  echo "  ybench / yb           - Run benchmarks"
  echo "  ynode [version]       - Switch Node.js version"
  echo ""
  echo "💡 Quick aliases: ylogs, ystop, yrestart, ytest, ylint, ystat"
}

echo "✅ ~/.bashrc YuyuCode (optimized for Snapdragon 680) telah dimuat!"
echo "💡 Ketik 'yuyu-help' untuk melihat semua perintah"
