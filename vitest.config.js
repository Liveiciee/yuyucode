import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

const isArm64 = os.arch() === 'arm64' || os.arch() === 'arm';
const isCI    = process.env.GITHUB_ACTIONS === 'true';
const pool    = (isArm64 || isCI) ? 'threads' : 'vmThreads';

export default defineConfig({
  plugins: [react()],
  test: {
    environment:  'jsdom',
    globals:      true,
    setupFiles:   './src/setupTest.js',
    pool,
    poolOptions: {
      threads: {
        // Atomics untuk komunikasi antar thread lebih cepat
        useAtomics: true,
      },
    },
    // isolate: true di CI mencegah race condition mock cache antar thread
    // isolate: false lokal untuk speed
    isolate: isCI,
    css:     false,

    // Timeout lebih ketat — test yang lambat akan fail lebih cepat daripada hang
    testTimeout:  5000,
    hookTimeout:  5000,

    // Matikan coverage reporter bawaan saat npx vitest run (bukan test:ci)
    // Coverage hanya aktif via npm run test:ci
    reporters:   process.env.CI ? ['verbose'] : ['dot'],

    // Jalankan describe block secara concurrent bila aman
    sequence: {
      concurrent: false, // tetap false — ada state global di features.js
      shuffle:    false,
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'yugit.cjs',
        'yuyu-bench.cjs',
        'yuyu-server.js',
        'yuyu-map.cjs',
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
