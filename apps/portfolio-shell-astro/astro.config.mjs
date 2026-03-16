// @ts-check
import { defineConfig } from 'astro/config';

const isDev = process.env.NODE_ENV !== 'production';

// https://astro.build/config
export default defineConfig({
  vite: {
    server: {
      headers: isDev ? {} : {
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' http://localhost:5173 http://localhost:4201 http://127.0.0.1:5173 http://127.0.0.1:4201",
          "style-src 'self' 'unsafe-inline'",
          "connect-src 'self' http://localhost:5173 http://localhost:4201 http://127.0.0.1:5173 http://127.0.0.1:4201",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
        ].join('; ')
      }
    }
  }
});
