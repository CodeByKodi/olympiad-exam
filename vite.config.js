import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For GitHub Pages: use --base /repo-name/ when building
// For local dev: base defaults to './'
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173 },
})
