import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Code dùng chung với backend (danh mục thu/chi)
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  // Đọc file .env ở thư mục gốc dự án (dùng chung với backend)
  envDir: '..',
  server: {
    // Khi chạy `npm run dev`, mọi request /api được chuyển sang backend ở cổng 4000
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
