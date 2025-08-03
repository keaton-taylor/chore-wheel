import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/chore-wheel/', // This should match your GitHub repo name
  build: {
    outDir: 'dist',
  },
}) 