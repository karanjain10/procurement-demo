import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// VITE_BASE_PATH is set to /procurement-demo/ in the GitHub Pages workflow.
// Vercel leaves it unset, so it defaults to '/' (root).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
