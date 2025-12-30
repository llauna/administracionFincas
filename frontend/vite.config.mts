import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            // Especifica los módulos que necesitas
            include: ['crypto', 'stream'],
        }),
    ],
    /*
    resolve: {
        alias: {
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
        },
    },
    */
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});