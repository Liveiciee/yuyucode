#!/bin/bash
# Diagnostik YuyuCode - Babak 1

echo "========================================="
echo "📁 STRUKTUR & FILE"
echo "========================================="
echo "Total baris kode (src):"
find src -name "*.js" -o -name "*.jsx" | xargs wc -l | tail -1
echo ""
echo "File terbesar (top 10):"
find src -name "*.js" -o -name "*.jsx" | xargs wc -l | sort -rn | head -10
echo ""

echo "========================================="
echo "📦 DEPENDENSI"
echo "========================================="
npm list --depth=0 2>/dev/null | head -20
echo ""
echo "Kesalahan peer/version (jika ada):"
npm ls --depth=0 2>&1 | grep -i "UNMET\|invalid\|missing"
echo ""

echo "========================================="
echo "🧪 TEST & COVERAGE"
echo "========================================="
echo "Jalankan test (ringkasan) — butuh waktu..."
npm test -- --run --reporter=basic 2>&1 | tail -20
echo ""
echo "Coverage terakhir (jika ada):"
if [ -f coverage/coverage-summary.json ]; then
  cat coverage/coverage-summary.json | grep -A5 "total"
else
  echo "Belum ada coverage, jalankan 'npm run coverage'"
fi
echo ""

echo "========================================="
echo "🔧 ESLINT & FORMAT"
echo "========================================="
npm run lint 2>&1 | tail -15
echo ""

echo "========================================="
echo "🏗️ BUILD"
echo "========================================="
npm run build 2>&1 | tail -10
echo ""

echo "========================================="
echo "🌐 E2E (Playwright) — jika ada test"
echo "========================================="
if [ -d e2e ]; then
  npx playwright test --list 2>&1 | head -10
else
  echo "Folder e2e tidak ditemukan"
fi
echo ""

echo "========================================="
echo "🖥️ ENVIRONMENT"
echo "========================================="
echo "Node: $(node -v)"
echo "NPM: $(npm -v)"
echo "OS: $(uname -a)"
echo "Arch: $(uname -m)"
echo ""

echo "========================================="
echo "✅ DIAGNOSIS SELESAI"
echo "========================================="
