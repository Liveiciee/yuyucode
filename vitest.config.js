import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

// ──────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT DETECTION
// ──────────────────────────────────────────────────────────────────────────────
const isArm64 = os.arch() === 'arm64' || os.arch() === 'arm'
const isCI = process.env.GITHUB_ACTIONS === 'true' || !!process.env.CI

// ──────────────────────────────────────────────────────────────────────────────
// POOL STRATEGY (Optimized for architecture & CI)
// ──────────────────────────────────────────────────────────────────────────────
// vmThreads: New in Vitest v2+, combines speed of threads with VM isolation
const pool = isArm64 || isCI ? 'threads' : 'vmThreads'

// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────────────────────────────────────
export default defineConfig({
  plugins: [react()],

  test: {
    // ─── Environment ──────────────────────────────────────────────────────────
    environment: 'happy-dom',
    setupFiles: ['./src/setupTest.js'],

    // ─── Pool & Workers ───────────────────────────────────────────────────────
    pool,
    poolOptions: {
      threads: {
        useAtomics: true,
        singleThread: isArm64,
        isolate: true,
      },
      vmThreads: {
        useAtomics: true,
        singleThread: isArm64,
      },
    },
    maxWorkers: isArm64 ? 2 : undefined,
    minWorkers: isArm64 ? 1 : undefined,

    // ─── Test Execution ───────────────────────────────────────────────────────
    globals: true,
    isolate: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    unstubEnvs: true,
    unstubGlobals: true,

    testTimeout: 10_000,
    hookTimeout: 10_000,
    slowTestThreshold: 500,
    retry: isCI ? 2 : 1,
    bail: isCI ? 1 : 0,

    // ─── Sequence Control ─────────────────────────────────────────────────────
    sequence: {
      concurrent: false,
      shuffle: false,
      seed: Date.now(),
    },

    // ─── Console & Logging ────────────────────────────────────────────────────
    silent: false,
    verbose: !isCI,
    reporters: isCI ? ['verbose', 'junit'] : ['dot'],
    outputFile: isCI ? { junit: './test-results/junit.xml' } : undefined,

    onConsoleLog: (log, type) => {
      // Always show errors
      if (type === 'stderr') return true
      // Show our custom logs
      if (log.includes('[RuntimeKeys]')) return true
      // Suppress everything else
      return false
    },

    // ─── Watch Mode ───────────────────────────────────────────────────────────
    watch: {
      ignore: [
        'node_modules',
        'coverage',
        'android',
        'dist',
        '.yuyu',
        '*.test.*',
        '*.spec.*',
      ],
    },

    // ─── CSS Handling ─────────────────────────────────────────────────────────
    css: false,

    // ─── Diff Configuration ───────────────────────────────────────────────────
    diff: {
      expand: false,
      contextLines: 3,
    },

    // ─── Transform & Dependencies ─────────────────────────────────────────────
    transformIgnorePatterns: [
      'node_modules/(?!( @capacitor| @codemirror| @valtown )/)',
    ],
    server: {
      deps: {
        inline: ['@capacitor-community/sqlite'],
      },
    },

    // ─── Coverage ─────────────────────────────────────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: [
        ['text', { skipFull: true }],
        ['html', { skipEmpty: true }],
        ['lcov', { projectRoot: './' }],
        ['json', { file: 'coverage.json' }],
        ['clover', { file: 'clover.xml' }],
      ],
      reportsDirectory: './coverage',
      clean: true,
      cleanOnRerun: true,
      all: true,

      // Thresholds (fail CI if below)
      thresholds: {
        global: {
          lines: 60,
          functions: 60,
          branches: 50,
          statements: 60,
        },
        perFile: true,
      },

      // Watermarks (for color coding in reports)
      watermarks: {
        statements: [60, 80],
        functions: [60, 80],
        branches: [50, 70],
        lines: [60, 80],
      },

      // Include paths
      include: [
        'src/hooks/**/*.js',
        'src/features.js',
        'src/utils.js',
        'src/api.js',
        'yuyu-server.js',
        'yuyu-map.cjs',
      ],

      // Exclude paths
      exclude: [
        // Build artifacts
        'yugit.cjs',
        'yuyu-bench.cjs',
        'public/**',
        'android/**',
        'patch/**',
        'dist/**',

        // Entry points & configs
        'src/main.jsx',
        'src/App.jsx',
        'src/constants.js',
        'src/theme.js',
        'src/themes/**',
        'src/setupTest.js',

        // Components (UI tests separate)
        'src/components/**',

        // Test files
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.bench.*',
        'src/__snapshots__/**',
        '**/__mocks__/**',
        '**/__fixtures__/**',
      ],
    },

    // ─── Type Checking (Optional) ─────────────────────────────────────────────
    typecheck: {
      enabled: false,
    },
  },
})
