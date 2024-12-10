import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      external: ['jspdf'],
      output: {
        globals: {
          jspdf: 'jspdf'
        }
      }
    },
    optimizeDeps: {
      include: ['jspdf']
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
