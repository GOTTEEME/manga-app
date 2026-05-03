import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const imageProxyConfig = (remotePath) => ({
  target: 'https://uploads.mangadex.org',
  changeOrigin: true,
  secure: false,
  rewrite: (path) => path.replace(new RegExp(`^/api${remotePath}`), remotePath),
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      try {
        proxyReq.setHeader('referer', 'https://mangadex.org/');
        proxyReq.setHeader('origin', 'https://uploads.mangadex.org');
        proxyReq.setHeader('user-agent', 'Mozilla/5.0');
      } catch {}
    });
  },
});

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // More specific paths must come before /api to match first
      '/api/covers':     imageProxyConfig('/covers'),
      '/api/data-saver': imageProxyConfig('/data-saver'),
      '/api/data':       imageProxyConfig('/data'),
      '/api': {
        target: 'https://api.mangadex.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
