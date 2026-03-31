import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';

// Mirror pool logic from vitest.config.js
const isArm64 = os.arch() === 'arm64' || os.arch() === 'arm';
const isCI = process.env.GITHUB_ACTIONS === 'true' || !!process.env.CI;
const pool = isArm64 || isCI ? 'threads' : 'vmThreads';

const RAW_PATH = '.yuyu/raw-bench.json';

export default defineConfig({
  plugins: [react()],

  test: {
    include: ['test/bench/**/*.bench.{js,jsx,ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],

    // Reporters set here (not via CLI) so Vitest resolves them as
    // built-ins — avoids the loadCustomReporterModule package-lookup
    // bug in Vitest 3.x where --reporter=json on the CLI triggers
    // import('json') and fails with ERR_MODULE_NOT_FOUND.
    reporters: ['json'],
    outputFile: { json: RAW_PATH },

    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.js', './src/setupTest.js'],

    globals: true,
    isolate: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    unstubEnvs: true,
    unstubGlobals: true,

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

    testTimeout: 30_000,
    hookTimeout: 10_000,

    css: false,

    transformIgnorePatterns: [
      'node_modules/(?!( @capacitor| @codemirror| @valtown )/)',
    ],
    server: {
      deps: {
        inline: ['@capacitor-community/sqlite'],
      },
    },
  },
});
