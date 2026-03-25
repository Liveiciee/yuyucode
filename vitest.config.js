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
      threads: {
        useAtomics: true,
        singleThread: isArm64,
        isolate: true,
      },
      vmThreads: {
        useAtomics: true,
      },
    },

    isolate:     true,
    clearMocks:  true,
    css:         false,
    testTimeout: 10000,
    hookTimeout: 10000,
    slowTestThreshold: 500,
    retry: isCI ? 2 : 1,

    reporters: process.env.CI ? ['verbose'] : ['dot'],

    onConsoleLog: (_log, type) => type !== 'stderr' ? false : undefined,

    sequence: {
      concurrent: false,
      shuffle: false,
      seed: Date.now(),
    },

    maxWorkers: isArm64 ? 2 : undefined,
    minWorkers: isArm64 ? 1 : undefined,

    watch: {
      ignore: ['node_modules', 'coverage', 'android', 'dist', '.yuyu'],
    },

    teardown: {
      force: true,
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json', 'html', 'clover'],
      reportsDirectory: './coverage',
      thresholds: {
        lines:      60,
        functions:  60,
        branches:   50,
        statements: 60,
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
        '**/*.test.*', '**/*.bench.*', '**/*.spec.*',
        'src/__snapshots__/**',
        '**/__mocks__/**',
        '**/__fixtures__/**',
      ],
      watermarks: {
        statements: [60, 80],
        functions: [60, 80],
        branches: [50, 70],
        lines: [60, 80],
      },
      clean: true,
      cleanOnRerun: true,
    },

    typecheck: {
      enabled: false,
    },

    diff: {
      expand: false,
      contextLines: 3,
    },

    bail: isCI ? 1 : 0,

    silent: false,
    verbose: false,

    mockReset: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,

    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously',
      },
    },

    transformIgnorePatterns: [
      '/node_modules/(?!(@capacitor|@codemirror|@valtown)/)',
    ],

    server: {
      deps: {
        inline: ['@capacitor-community/sqlite'],
      },
    },
  },
})
