import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

const isArm64 = os.arch() === 'arm64' || os.arch() === 'arm';
const isCI    = process.env.GITHUB_ACTIONS === 'true';
const pool    = (isArm64 || isCI) ? 'threads' : 'vmThreads';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTest.js',
    pool,
    // isolate: false speeds up local dev, but in CI parallel threads can
    // cache modules before vi.mock applies → mocks silently broken.
    // Keep isolate: true in CI for correctness.
    isolate: !isCI,
    css: false,
    coverage: {
      provider: 'v8',
      exclude: [
        'yugit.cjs',
        'yuyu-bench.cjs',
        'yuyu-server.js',
        'public/**',
        'android/**',
        'patch/**',
        'src/main.jsx',
        'src/plugins/**',
        'src/constants.js',
        'src/theme.js',
        'src/setupTest.js',
        'src/components/**',
        'src/App.jsx',
        'src/themes/**',
        '**/*.test.*',
        '**/*.bench.*',
      ],
    },
  },
})
