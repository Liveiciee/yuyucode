import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // @capacitor-community/sqlite is a native Capacitor plugin — only exists
      // at runtime on Android/iOS. Externalize so Rollup doesn't try to bundle it.
      external: ['@capacitor-community/sqlite'],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom'))
            return 'vendor';
          if (
            id.includes('@codemirror') ||
            id.includes('codemirror-vim') ||
            id.includes('codemirror6-plugin') ||
            id.includes('emmetio') ||
            id.includes('@valtown')
          )
            return 'codemirror';
          if (id.includes('xterm'))
            return 'xterm';
          if (id.includes('d3'))
            return 'd3';
        },
      },
    },
  },
})
