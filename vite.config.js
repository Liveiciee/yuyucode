import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // Optimasi untuk development di HP
  server: {
    host: true, // Biar bisa diakses dari jaringan lokal
    port: 5173,
    watch: {
      usePolling: false, // Matikan polling biar hemat CPU
    },
    hmr: {
      overlay: true, // Error overlay di browser
    },
  },
  
  build: {
    target: 'es2020', // Snapdragon 680 support ES2020
    minify: 'esbuild', // ← GANTI ke esbuild (built-in, gak perlu install terser)
    sourcemap: false, // Matikan sourcemap di production
    chunkSizeWarningLimit: 500, // KB
    cssCodeSplit: true, // Split CSS
    assetsInlineLimit: 4096, // 4kb, files lebih kecil jadi inline
    rollupOptions: {
      // @capacitor-community/sqlite is a native Capacitor plugin — only exists
      // at runtime on Android/iOS. Externalize so Rollup doesn't try to bundle it.
      external: ['@capacitor-community/sqlite'],
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom'))
            return 'vendor';
          
          // CodeMirror (editor berat)
          if (
            id.includes('@codemirror') ||
            id.includes('codemirror-vim') ||
            id.includes('codemirror6-plugin') ||
            id.includes('emmetio') ||
            id.includes('@valtown')
          )
            return 'codemirror';
          
          // Terminal
          if (id.includes('xterm'))
            return 'xterm';
          
          // D3 (heavy)
          if (id.includes('d3'))
            return 'd3';
          
          // UI libraries
          if (id.includes('lucide-react'))
            return 'icons';
          
          // Markdown (optional)
          if (id.includes('react-markdown') || id.includes('remark'))
            return 'markdown';
          
          // Capacitor plugins (native)
          if (id.includes('@capacitor'))
            return 'capacitor';
        },
      },
    },
  },
  
  // Optimasi dev server
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/commands',
      '@codemirror/language',
      '@codemirror/lang-javascript',
      '@codemirror/lang-html',
      '@codemirror/lang-css',
      '@xterm/xterm',
      '@xterm/addon-fit',
      'fuse.js',
      'diff',
    ],
    exclude: ['@capacitor-community/sqlite'],
    rolldownOptions: {
      target: 'es2020', // Match build target in Vite 8 dependency optimizer
    },
  },
  
  // Resolve alias untuk cleaner imports
  resolve: {
    alias: {
      '@': '/src',
      '@hooks': '/src/hooks',
      '@components': '/src/components',
      '@utils': '/src/utils',
      '@plugins': '/src/plugins',
      '@themes': '/src/themes',
    },
  },
  
  // CSS optimasi
  css: {
    devSourcemap: false, // Matikan sourcemap CSS di dev
    modules: {
      localsConvention: 'camelCase',
    },
  },
  
  // Preview server untuk testing build
  preview: {
    host: true,
    port: 4173,
  },
})
