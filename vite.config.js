import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: true, // permite acesso pela rede (0.0.0.0, pra usar o Network)
    port: 5173,
    proxy: {
      // Redireciona chamadas para /api ao backend remoto para evitar CORS em dev
      '/api': {
        target: 'https://web2-musicalgame.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  }
})
