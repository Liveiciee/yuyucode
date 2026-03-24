import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist', 'android', '*.cjs', 'coverage', 'docs',
    'node_modules', 'public', '.yuyu', '.tla', 'tmp',
    'patch/**', '*.apk', '**/*.snap', '**/__snapshots__',
    'android/app/src/main/assets/public/**', '.gradle', 'build'
  ]),

  // Node.js files (server + utilities)
  {
    files: ['yuyu-server.js', 'yugit.cjs', 'yuyu-map.cjs', 'yuyu-bench.cjs', 'scripts/**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['warn', { 
        varsIgnorePattern: '^_', 
        argsIgnorePattern: '^_', 
        caughtErrorsIgnorePattern: '^_' 
      }],
      'no-empty': 'off',
      'no-undef': 'off',
      'no-console': 'off',
    },
  },

  // Source files (React + browser)
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^(_|[A-Z])',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
      'no-prototype-builtins': 'warn',
      'no-case-declarations': 'warn',
      'prefer-const': ['warn', { destructuring: 'all' }],
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Test files
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}', '**/*.branch.test.js', '**/*.extended.test.js'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { 
        ...globals.browser, 
        ...globals.node, 
        vi: true, 
        describe: true, 
        it: true, 
        expect: true,
        beforeEach: true,
        afterEach: true
      },
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-empty': 'off',
      'no-console': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },

  // Benchmark files (performance tests)
  {
    files: ['**/*.bench.js', '**/*.bench.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node, bench: true, describe: true },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-empty': 'off',
    },
  },
])
