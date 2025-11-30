import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // ฟังทุก interface
    port: 5173,       // พอร์ตเดิม
    strictPort: true, // ถ้าพอร์ตถูกใช้ จะไม่เปลี่ยนพอร์ตอัตโนมัติ
    proxy: {
      '/api': {
        target: 'https://api.mangadex.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/covers': {
        target: 'https://uploads.mangadex.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/covers/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            try {
              proxyReq.setHeader('referer', 'https://mangadex.org/');
              proxyReq.setHeader('origin', 'https://uploads.mangadex.org');
              proxyReq.setHeader('user-agent', 'Mozilla/5.0');
            } catch {}
          });
        },
      },
      '/data': {
        target: 'https://uploads.mangadex.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/data\//, 'data/'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            try {
              proxyReq.setHeader('referer', 'https://mangadex.org/');
              proxyReq.setHeader('origin', 'https://uploads.mangadex.org');
              proxyReq.setHeader('user-agent', 'Mozilla/5.0');
            } catch {}
          });
        },
      },
      '/data-saver': {
        target: 'https://uploads.mangadex.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/data-saver\//, 'data-saver/'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            try {
              proxyReq.setHeader('referer', 'https://mangadex.org/');
              proxyReq.setHeader('origin', 'https://uploads.mangadex.org');
              proxyReq.setHeader('user-agent', 'Mozilla/5.0');
            } catch {}
          });
        },
      },
    },
  }
})
