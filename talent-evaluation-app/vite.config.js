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
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf')) return 'jspdf'
            if (id.includes('xlsx')) return 'xlsx'
            if (id.includes('chart.js') || id.includes('vue-chartjs')) return 'charts'
            return 'vendor'
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['jspdf', 'xlsx', 'chart.js', 'vue-chartjs'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
