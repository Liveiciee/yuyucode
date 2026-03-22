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
    deps: {
      optimizer: {
        ssr: {
          include: [
            'react',
            'react-dom',
            '@testing-library/react',
            'lucide-react',
          ],
        },
      },
    },
    isolate:     false,
    css:         false,
    testTimeout: 5000,
    hookTimeout: 5000,
    reporters:   process.env.CI ? ['verbose'] : ['dot'],
    sequence: {
      concurrent: false,
      shuffle:    false,
    },

    // Persist transform cache ke filesystem — transform 7s → <1s di run ke-2+
    experimental: {
      fsModuleCache: true,
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'yugit.cjs', 'yuyu-bench.cjs', 'yuyu-server.js', 'yuyu-map.cjs',
        'public/**', 'android/**', 'patch/**',
        'src/main.jsx', 'src/plugins/**',
        'src/constants.js', 'src/theme.js', 'src/setupTest.js',
        'src/components/**', 'src/App.jsx', 'src/themes/**',
        '**/*.test.*', '**/*.bench.*',
      ],
    },
  },
})
