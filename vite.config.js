import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base path for GitHub Pages: /repo-name/ (e.g. /olympiad-exam/)
// - Local dev: base is './' (relative paths work)
// - GitHub Actions: passes --base /${{ repo.name }}/ automatically
// - Manual Pages build: vite build --base /olympiad-exam/
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || './',
  server: { port: 5173 },
})
