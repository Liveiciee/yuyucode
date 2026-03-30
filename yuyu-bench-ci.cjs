#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const RAW_PATH = path.resolve('.yuyu/raw-bench.json');
const OUT_PATH = '/tmp/bench-ci.json';

function runBench() {
  console.log('🏃 Running benchmarks...');
  console.log(`📱 Platform: ${process.arch}`);
  console.log(`🧠 Node: ${process.version}`);

  try {
    execSync(
      `npx vitest bench --run --reporter=json --outputFile=${RAW_PATH}`,
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

  // case 1: already array
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item) continue;

      results.push({
        name: item.name ?? 'unknown',
        unit: item.unit ?? 'ops/sec',
        value: Number(item.value ?? item.hz ?? 0),
      });
    }
    return results;
  }

  // case 2: vitest structured output
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

  // VALIDATION HARD GUARD (biar gak keulang error lo tadi)
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
