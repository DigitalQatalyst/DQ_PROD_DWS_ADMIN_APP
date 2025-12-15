import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ['@ckeditor/ckeditor5-react', '@ckeditor/ckeditor5-build-classic'],
    exclude: [],
  },
  build: {
    commonjsOptions: {
      include: [/ckeditor5/, /node_modules/],
    },
  },
})
