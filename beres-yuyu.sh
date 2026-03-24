#!/data/data/com.termux/files/usr/bin/bash
# Jalankan dari dalam folder yuyucode-main:
#   cd yuyucode-main && bash beres-yuyu.sh

set -e
ROOT="$(pwd)"

echo "=== Bebersih duplikat yuyucode-main ==="

if [ ! -f "$ROOT/package.json" ] || [ ! -d "$ROOT/src" ]; then
  echo "ERROR: Jalankan dari dalam folder yuyucode-main!"
  exit 1
fi

echo "[1/3] Hapus file .jsx & .js duplikat di root..."
for f in App.jsx AppChat.jsx MsgBubble.jsx api.js yugit.cjs; do
  [ -f "$ROOT/$f" ] && echo "  Hapus: $f" && rm "$ROOT/$f"
done

echo "[2/3] Hapus folder docs duplikat di root..."
for d in features guide reference; do
  [ -d "$ROOT/$d" ] && echo "  Hapus folder: $d/" && rm -rf "$ROOT/$d"
done

echo "[3/3] Hapus file .md duplikat di root..."
for f in faq.md index.md changelog.md roadmap.md; do
  [ -f "$ROOT/$f" ] && echo "  Hapus: $f" && rm "$ROOT/$f"
done

echo ""
echo "=== Selesai! File tersisa di root: ==="
ls -1 "$ROOT"

