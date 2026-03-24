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
        singleThread: isArm64, // ARM64 better with single thread to avoid OOM
        isolate: true,
      },
      vmThreads: {
        useAtomics: true,
      },
    },

    // isolate: true wajib — vi.mock/vi.hoisted bocor dengan isolate:false
    isolate:     true,
    clearMocks:  true,
    css:         false,
    testTimeout: 5000,
    hookTimeout: 5000,

    // highlight test > 500ms
    slowTestThreshold: 500,

    // auto-retry test flaky (bgagent timing)
    retry: isCI ? 2 : 1,

    reporters: process.env.CI ? ['verbose'] : ['dot'],

    // suppress console.log dari source saat test
    onConsoleLog: (_log, type) => type !== 'stderr' ? false : undefined,

    // Batch test files to reduce memory on ARM64
    sequence: {
      concurrent: false, // Run serially on ARM64 to avoid OOM
      shuffle: false,
      seed: Date.now(),
    },

    // Max workers based on CPU (ARM64: 2 max, x86: auto)
    maxWorkers: isArm64 ? 2 : undefined,
    minWorkers: isArm64 ? 1 : undefined,

    // File watching for dev mode
    watch: {
      ignore: ['node_modules', 'coverage', 'android', 'dist', '.yuyu'],
    },

    // Global teardown
    globalTeardown: './src/test/globalTeardown.js',

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json', 'html', 'clover'],
      reportsDirectory: './coverage',
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
        '**/*.test.*', '**/*.bench.*', '**/*.spec.*',
        'src/__snapshots__/**',
        '**/__mocks__/**',
        '**/__fixtures__/**',
      ],
      // Skip coverage collection for large files
      watermarks: {
        statements: [70, 85],
        functions: [70, 85],
        branches: [60, 80],
        lines: [70, 85],
      },
      clean: true,
      cleanOnRerun: true,
    },

    // Type checking (disabled for speed on ARM64)
    typecheck: {
      enabled: false,
    },

    // Diff config for better test output
    diff: {
      expand: false,
      contextLines: 3,
    },

    // Bail after first failure on CI
    bail: isCI ? 1 : 0,

    // Logging
    silent: false,
    verbose: false,

    // Mock
    mockReset: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,

    // Environment options
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously',
      },
    },

    // Transform ignore patterns
    transformIgnorePatterns: [
      '/node_modules/(?!(@capacitor|@codemirror|@valtown)/)',
    ],

    // Server options for test
    server: {
      deps: {
        inline: ['@capacitor-community/sqlite'],
      },
    },
  },
})
