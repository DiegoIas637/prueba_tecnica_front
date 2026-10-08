import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7036',
        changeOrigin: true,
        // Certificado de desarrollo autofirmado de .NET: no verificar.
        secure: false,
      },
    },
  },
})
