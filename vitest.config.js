import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',  // 3-5x faster than jsdom
    globals: true,
    setupFiles: './src/setupTest.js',
    pool: 'threads',           // worker_threads > forks on ARM64
    css: false,                // skip CSS processing, zero tests need it
  },
})
