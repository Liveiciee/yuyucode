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
    isolate: false,
    css: false,
    coverage: {
      provider: 'v8',
      exclude: [
        // CLI tools
        'yugit.cjs',
        'yuyu-bench.cjs',
        // Server — tested separately by yuyu-server.test.cjs
        'yuyu-server.js',
        // Build artifacts & APK assets
        'public/**',
        'android/**',
        // Stale patch dir
        'patch/**',
        // Entry point
        'src/main.jsx',
        // Native Capacitor bridge
        'src/plugins/**',
        // Pure config/data
        'src/constants.js',
        'src/theme.js',
        'src/setupTest.js',
        // UI components
        'src/components/**',
        'src/App.jsx',
        // Theme pure data
        'src/themes/**',
        // Test files
        '**/*.test.*',
        '**/*.bench.*',
      ],
    },
  },
})
