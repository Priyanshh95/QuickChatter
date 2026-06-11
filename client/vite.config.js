import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev the client runs on :5173 and proxies API + websocket traffic to the
// Express/Socket.IO backend on :3000, so the browser only ever talks to one
// origin (no CORS needed). In production the built client is served by Express.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3000', ws: true, changeOrigin: true },
    },
  },
});
