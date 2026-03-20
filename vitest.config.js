import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

// vmThreads is potentially 4x faster but unstable on ARM64 (Termux).
// Auto-detect: use vmThreads on x64, fallback to threads on ARM64.
const isArm64 = os.arch() === 'arm64' || os.arch() === 'arm';
const pool    = isArm64 ? 'threads' : 'vmThreads';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',  // 3-5x faster than jsdom
    globals: true,
    setupFiles: './src/setupTest.js',
    pool,                      // vmThreads on x64, threads on ARM64 (safe)
    isolate: false,            // shared module cache — faster when mocks use DI
    css: false,                // skip CSS processing, zero tests need it
  },
})
