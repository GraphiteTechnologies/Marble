
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      '/baremux/': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/epoxy/': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/wisp/': {
        target: 'ws://localhost:4000',
        changeOrigin: true,
        ws: true,
      },
      '/uv/': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/api/': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
})
