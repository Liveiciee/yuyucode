import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

const isArm64 = os.arch() === 'arm64' || os.arch() === 'arm';
const isCI    = process.env.GITHUB_ACTIONS === 'true';
const pool    = (isArm64 || isCI) ? 'threads' : 'vmThreads';

export default defineConfig({
  plugins: [react()],
  test: {
    environment:  'happy-dom',
    globals:      true,
    setupFiles:   './src/setupTest.js',
    pool,
    poolOptions: {
      threads: { useAtomics: true },
    },

    // isolate: true wajib — vi.mock/vi.hoisted bocor dengan isolate:false
    isolate:     isCI ? true : false,
    clearMocks:  true,
    css:         false,
    testTimeout: 5000,
    hookTimeout: 5000,

    // highlight test > 500ms
    slowTestThreshold: 500,

    // auto-retry test flaky (bgagent timing)
    retry: 1,

    reporters: process.env.CI ? ['verbose'] : ['dot'],

    // suppress console.log dari source saat test
    onConsoleLog: (_log, type) => type !== 'stderr' ? false : undefined,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines:      70,
        functions:  70,
        branches:   60,
        statements: 70,
      },
      perFile: true,
      include: [
        'src/hooks/**/*.js',
        'src/features.js',
        'src/utils.js',
        'src/api.js',
        'yuyu-server.js',
        'yuyu-map.cjs',
      ],
      exclude: [
        'yugit.cjs', 'yuyu-bench.cjs',
        'public/**', 'android/**', 'patch/**',
        'src/main.jsx', 'src/plugins/**',
        'src/constants.js', 'src/theme.js', 'src/setupTest.js',
        'src/components/**', 'src/App.jsx', 'src/themes/**',
        '**/*.test.*', '**/*.bench.*',
      ],
    },
  },
})
