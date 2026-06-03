import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        // Laravel backend - usar: php artisan serve (puerto 8000) o php -S 127.0.0.1:8010 -t public public/index.php
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})


