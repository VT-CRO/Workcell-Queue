import { defineConfig,loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const backendURL = env.VITE_BACKEND_URL;
  return {
    plugins: [react()],
    css: {
      postcss: './postcss.config.cjs', // This will ensure Tailwind uses PostCSS
    },
    server: {
      proxy: {
        '/api': {
            target: backendURL,
            changeOrigin: true,
            secure: false, // Set to true if using HTTPS on the backend
            rewrite: (path) => path.replace(/^\/api/, ''), // Optional: Rewrite paths if needed
        },
      },
    },
  }
})
