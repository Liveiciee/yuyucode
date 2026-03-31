#!/bin/bash

echo "========================================="
echo "Memperbaiki semua import path di test files"
echo "========================================="

# ----------------------------------------------------------------------
# 1. Perbaiki semua file di test/hooks/ (useAgentLoop, useChatStore, useApprovalFlow, utils, api, features, constants)
# ----------------------------------------------------------------------
echo "1. Memperbaiki file di test/hooks/..."

# useAgentLoop
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from '\''\./useAgentLoop\.js'\''|from '\''../../src/hooks/useAgentLoop.js'\''|g' {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from "\./useAgentLoop\.js"|from "../../src/hooks/useAgentLoop.js"|g' {} \;

# useChatStore
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from '\''\./useChatStore\.js'\''|from '\''../../src/hooks/useChatStore.js'\''|g' {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from "\./useChatStore\.js"|from "../../src/hooks/useChatStore.js"|g' {} \;

# useApprovalFlow
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from '\''\./useApprovalFlow\.js'\''|from '\''../../src/hooks/useApprovalFlow.js'\''|g' {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from "\./useApprovalFlow\.js"|from "../../src/hooks/useApprovalFlow.js"|g' {} \;

# utils.js
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from '\''\.\./utils\.js'\''|from '\''../../src/utils.js'\''|g' {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from "\.\./utils\.js"|from "../../src/utils.js"|g' {} \;

# api.js
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from '\''\.\./api\.js'\''|from '\''../../src/api.js'\''|g' {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from "\.\./api\.js"|from "../../src/api.js"|g' {} \;

# features.js
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from '\''\.\./features\.js'\''|from '\''../../src/features.js'\''|g' {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from "\.\./features\.js"|from "../../src/features.js"|g' {} \;

# constants.js
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from '\''\.\./constants\.js'\''|from '\''../../src/constants.js'\''|g' {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i 's|from "\.\./constants\.js"|from "../../src/constants.js"|g' {} \;

# vi.mock untuk api.js, utils.js, features.js, constants.js
find test/hooks -name "*.test.js" -type f -exec sed -i "s|vi\.mock('\.\./api\.js'|vi.mock('../../src/api.js'|g" {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i 's|vi\.mock("\.\./api\.js"|vi.mock("../../src/api.js"|g' {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i "s|vi\.mock('\.\./utils\.js'|vi.mock('../../src/utils.js'|g" {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i 's|vi\.mock("\.\./utils\.js"|vi.mock("../../src/utils.js"|g' {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i "s|vi\.mock('\.\./features\.js'|vi.mock('../../src/features.js'|g" {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i 's|vi\.mock("\.\./features\.js"|vi.mock("../../src/features.js"|g' {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i "s|vi\.mock('\.\./constants\.js'|vi.mock('../../src/constants.js'|g" {} \;
find test/hooks -name "*.test.js" -type f -exec sed -i 's|vi\.mock("\.\./constants\.js"|vi.mock("../../src/constants.js"|g' {} \;

# ----------------------------------------------------------------------
# 2. Perbaiki file test di root test/ (langsung di folder test)
# ----------------------------------------------------------------------
echo "2. Memperbaiki file di root test/..."

# utils.js
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i 's|from '\''\./utils\.js'\''|from '\''../src/utils.js'\''|g' {} \;
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i 's|from "\./utils\.js"|from "../src/utils.js"|g' {} \;

# api.js
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i 's|from '\''\./api\.js'\''|from '\''../src/api.js'\''|g' {} \;
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i 's|from "\./api\.js"|from "../src/api.js"|g' {} \;

# features.js
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i 's|from '\''\./features\.js'\''|from '\''../src/features.js'\''|g' {} \;
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i 's|from "\./features\.js"|from "../src/features.js"|g' {} \;

# constants.js
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i 's|from '\''\./constants\.js'\''|from '\''../src/constants.js'\''|g' {} \;
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i 's|from "\./constants\.js"|from "../src/constants.js"|g' {} \;

# vi.mock
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i "s|vi\.mock('\./utils\.js'|vi.mock('../src/utils.js'|g" {} \;
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i 's|vi\.mock("\./utils\.js"|vi.mock("../src/utils.js"|g' {} \;
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i "s|vi\.mock('\./api\.js'|vi.mock('../src/api.js'|g" {} \;
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i 's|vi\.mock("\./api\.js"|vi.mock("../src/api.js"|g' {} \;
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i "s|vi\.mock('\./features\.js'|vi.mock('../src/features.js'|g" {} \;
find test -maxdepth 1 -name "*.test.js" -type f -exec sed -i 's|vi\.mock("\./features\.js"|vi.mock("../src/features.js"|g' {} \;

# ----------------------------------------------------------------------
# 3. Perbaiki runtimeKeys test files
# ----------------------------------------------------------------------
echo "3. Memperbaiki runtimeKeys test files..."

# Ganti ../index.js dengan ../../../src/runtimeKeys/index.js
find test/runtimeKeys/__tests__ -name "*.test.js" -type f -exec sed -i 's|from '\''\.\./index\.js'\''|from '\''../../../src/runtimeKeys/index.js'\''|g' {} \;
find test/runtimeKeys/__tests__ -name "*.test.js" -type f -exec sed -i 's|from "\.\./index\.js"|from "../../../src/runtimeKeys/index.js"|g' {} \;
find test/runtimeKeys/__tests__ -name "*.test.js" -type f -exec sed -i "s|vi\.importActual('\.\./index\.js'|vi.importActual('../../../src/runtimeKeys/index.js'|g" {} \;
find test/runtimeKeys/__tests__ -name "*.test.js" -type f -exec sed -i 's|vi\.importActual("\.\./index\.js"|vi.importActual("../../../src/runtimeKeys/index.js"|g' {} \;

# Ganti globalThis.crypto = { ... } dengan vi.stubGlobal
find test/runtimeKeys/__tests__ -name "*.test.js" -type f -exec sed -i 's|globalThis\.crypto = {|vi.stubGlobal("crypto", {|g' {} \;

# Tambahkan mockHashValue jika belum ada (cek dan tambahkan setelah import)
for file in test/runtimeKeys/__tests__/*.test.js; do
  if ! grep -q "const mockHashValue =" "$file"; then
    sed -i '2i\
const mockHashValue = '\''mock-hash-1234567890'\'';\n' "$file"
  fi
done

# ----------------------------------------------------------------------
# 4. Perbaiki property-based test (fast-check)
# ----------------------------------------------------------------------
echo "4. Memperbaiki property-based test..."

if grep -q "fc is not defined" test/parseactions-property-based-100-random-inputs-each.test.js 2>/dev/null || ! grep -q "import \* as fc" test/parseactions-property-based-100-random-inputs-each.test.js; then
  sed -i '1iimport * as fc from "fast-check";\n' test/parseactions-property-based-100-random-inputs-each.test.js
fi

# ----------------------------------------------------------------------
# 5. Perbaiki polyglot test imports
# ----------------------------------------------------------------------
echo "5. Memperbaiki polyglot test imports..."

find test/polyglot -name "*.test.js" -type f -exec sed -i 's|from '\''\.\.\/\.\.\/polyglot-runner\.cjs'\''|from '\''\.\.\/\.\.\/lib\/polyglot\/index\.cjs'\''|g' {} \;
find test/polyglot -name "*.test.js" -type f -exec sed -i 's|from "\.\.\/\.\.\/polyglot-runner\.cjs"|from "\.\.\/\.\.\/lib\/polyglot\/index\.cjs"|g' {} \;

# ----------------------------------------------------------------------
# Selesai
# ----------------------------------------------------------------------
echo ""
echo "========================================="
echo "Perbaikan selesai!"
echo "Sekarang jalankan: git diff untuk melihat perubahan"
echo "Kemudian: git add . && git commit -m 'fix: batch fix all test imports' && git push"
echo "========================================="
