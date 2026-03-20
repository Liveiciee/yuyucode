import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom'))
            return 'vendor';
          if (id.includes('@codemirror'))
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
