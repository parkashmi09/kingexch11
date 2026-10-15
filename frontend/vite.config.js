import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import isolateKx from './scripts/isolate-kx.js';

// The clickbet sheets — the UI being replaced by the kingexch one (src/kx).
const CLICKBET_CSS = (file) => /\/src\/(styles\/clickbet\.css|cb\/[^/]+\.css)$/.test(file);

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      // Keep them from matching inside kingexch components; see the plugin.
      plugins: [isolateKx(CLICKBET_CSS)],
    },
  },
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
