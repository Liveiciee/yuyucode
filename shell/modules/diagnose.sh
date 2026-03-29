#!/bin/bash
# shellcheck disable=SC2034
# Modul: Diagnose Project Health
# Usage: yuyu diagnose

diagnose_project() {
    echo "========================================="
    echo "📁 STRUKTUR & FILE"
    echo "========================================="
    
    if [ -d "src" ]; then
        echo "Total baris kode (src):"
        find src -type f $$ -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" $$ -exec wc -l {} + 2>/dev/null | tail -1
        
        echo -e "\nFile terbesar (top 5):"
        find src -type f $$ -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" $$ -exec wc -l {} + 2>/dev/null | sort -rn | head -5
    else
        echo "Folder 'src' tidak ditemukan."
    fi

    echo -e "\n========================================="
    echo "📦 DEPENDENSI"
    echo "========================================="
    if [ -f "package.json" ]; then
        npm list --depth=0 2>/dev/null | head -20
    else
        echo "package.json tidak ditemukan."
    fi

    echo -e "\n========================================="
    echo "🧪 TEST & COVERAGE"
    echo "========================================="
    if command -v npm &> /dev/null; then
        echo "Menjalankan test ringkas..."
        npm run test -- --run --reporter=basic 2>&1 | tail -10 || echo "Test command not found or failed."
    else
        echo "npm tidak ditemukan."
    fi

    echo -e "\n========================================="
    echo "🔧 ESLINT"
    echo "========================================="
    if command -v npm &> /dev/null; then
        npm run lint 2>&1 | tail -5 || echo "Lint command not found or failed."
    else
        echo "npm tidak ditemukan."
    fi

    echo -e "\n========================================="
    echo "🏗️ BUILD STATUS"
    echo "========================================="
    if [ -f "dist/index.html" ]; then
        echo "✅ Build terakhir ditemukan di dist/"
        ls -lh dist/index.html
    else
        echo "⚠️  Belum ada build di dist/"
    fi

    echo -e "\n========================================="
    echo "✅ DIAGNOSIS SELESAI"
    echo "========================================="
}

# Export fungsi agar bisa dipanggil dari luar
export -f diagnose_project
