import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3091,
    open: false,
    proxy: {
      '/api': {
        target: 'https://apitenexch.codefactory.games',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://apitenexch.codefactory.games',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
