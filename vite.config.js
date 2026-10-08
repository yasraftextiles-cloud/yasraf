import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function backendApiPlugin() {
  return {
    name: 'backend-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if ((url === '/.netlify/functions/checkout' || url === '/api/checkout') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            const remoteIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';
            try {
              const payload = JSON.parse(body || '{}');
              const authHeader = req.headers['authorization'] || null;
              const { handleCheckout } = await import('./server/backendHandler.js');
              const result = await handleCheckout(payload, remoteIp, authHeader);
              res.statusCode = result.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result.data));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Invalid JSON request body.' }));
            }
          });
          return;
        }

        if ((url === '/.netlify/functions/track-order' || url === '/api/track') && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            const remoteIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';
            try {
              const payload = JSON.parse(body || '{}');
              const { handleTrackOrder } = await import('./server/backendHandler.js');
              const result = await handleTrackOrder(payload, remoteIp);
              res.statusCode = result.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result.data));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Invalid JSON request body.' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    backendApiPlugin()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
        }
      }
    }
  },
  server: {
    watch: {
      ignored: ['**/.agents/**', '**/.git/**', '**/scratch/**', '**/.system_generated/**']
    }
  }
});
