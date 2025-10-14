import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
    plugins: [svelte()],
    preview: {
        allowedHosts: [
            "graphite.thoq.dev",
            "localhost"
        ]
    },
    server: {
        allowedHosts: [
            "graphite.thoq.dev"
        ],
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
            '/scram/': {
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
