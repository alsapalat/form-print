import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/form-print/',
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
})
