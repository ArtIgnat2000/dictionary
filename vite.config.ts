import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: command === 'build' ? '/dictionary/' : '/',
  define: {
    __BUILD_NUMBER__: JSON.stringify(process.env.GITHUB_RUN_NUMBER ?? 'dev'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
}))
