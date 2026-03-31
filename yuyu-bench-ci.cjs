#!/usr/bin/env node

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const RAW_PATH = path.resolve('.yuyu/raw-bench.json');
const OUT_PATH = '/tmp/bench-ci.json';

function runBench() {
  console.log('🏃 Running benchmarks...');
  console.log(`📱 Platform: ${process.arch}`);
  console.log(`🧠 Node: ${process.version}`);

  // Ensure output dir exists before vitest writes to it
  fs.mkdirSync(path.dirname(RAW_PATH), { recursive: true });

  try {
    // Use --config so reporters are resolved as built-ins (not via
    // loadCustomReporterModule). Passing --reporter=json via CLI in
    // Vitest 3.x triggers import('json') which fails with
    // ERR_MODULE_NOT_FOUND — config-based reporters bypass that path.
    execSync(
      `npx vitest bench --run --config vitest.bench.config.js`,
      { stdio: 'inherit' }
    );
  } catch (err) {
    console.error('❌ Vitest bench failed');
    safeWrite([]);
    process.exit(1);
  }
}

function safeWrite(data) {
  try {
    fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('❌ Failed writing output JSON');
    process.exit(1);
  }
}

function loadRaw() {
  if (!fs.existsSync(RAW_PATH)) {
    console.warn('⚠️ raw bench file not found');
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(RAW_PATH, 'utf-8'));
  } catch (e) {
    console.warn('⚠️ failed parsing raw bench json');
    return null;
  }
}

function normalize(raw) {
  const results = [];

  if (!raw) return results;

  // already array
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item) continue;

      results.push({
        name: item.name || 'unknown',
        unit: item.unit || 'ops/sec',
        value: Number(item.value ?? item.hz ?? 0),
      });
    }
    return results;
  }

  // vitest structure
  if (raw.files && Array.isArray(raw.files)) {
    for (const file of raw.files) {
      const groups = file.groups || [];

      for (const group of groups) {
        const benchmarks = group.benchmarks || [];

        for (const bench of benchmarks) {
          const hz = Number(bench.hz ?? 0);

          results.push({
            name: `${group.name} > ${bench.name}`,
            unit: 'ops/sec',
            value: Number.isFinite(hz) ? hz : 0,
          });
        }
      }
    }
  }

  return results;
}

function main() {
  runBench();

  const raw = loadRaw();
  let results = normalize(raw);

  if (!Array.isArray(results) || results.length === 0) {
    console.warn('⚠️ No valid benchmark data (safe fallback)');
    results = [];
  }

  // hard guard
  if (!Array.isArray(results)) {
    console.error('❌ Output must be array');
    results = [];
  }

  for (const r of results) {
    if (typeof r.name !== 'string') r.name = 'unknown';
    if (typeof r.unit !== 'string') r.unit = 'ops/sec';
    if (typeof r.value !== 'number' || !Number.isFinite(r.value)) {
      r.value = 0;
    }
  }

  safeWrite(results);

  console.log('📦 Raw →', RAW_PATH);
  console.log('✅ CI →', OUT_PATH);
}

main();
