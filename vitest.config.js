import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

// vmThreads is potentially 4x faster but unstable on ARM64 (Termux) and CI.
// ARM64 atau CI (GITHUB_ACTIONS) → threads; x64 local → vmThreads
const isArm64 = os.arch() === 'arm64' || os.arch() === 'arm';
const isCI    = process.env.GITHUB_ACTIONS === 'true';
const pool    = (isArm64 || isCI) ? 'threads' : 'vmThreads';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',      // happy-dom faster but not in lockfile → CI fails
    globals: true,
    setupFiles: './src/setupTest.js',
    pool,                      // vmThreads on x64, threads on ARM64 (safe)
    isolate: false,            // shared module cache — faster when mocks use DI
    css: false,                // skip CSS processing, zero tests need it
  },
})
