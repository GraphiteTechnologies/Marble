
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      '/bare/': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true,
      },
      '/uv/': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
})
