// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production';

// https://astro.build/config
export default defineConfig({
  // ═══════════════════════════════════════════════════════════
  // SSR Configuration - Requerido para Middleware Auth Guards
  // ═══════════════════════════════════════════════════════════
  output: 'server', // Habilita SSR para todas las páginas
  build: {
    // Minificar HTML, CSS y JS en producción (inline incluido)
    inlineStylesheets: 'auto',
  },
  
  // Configuración de adaptador (opcional - usa Node.js por defecto)
  // adapter: node({ mode: 'standalone' }),
  
  vite: {
    resolve: {
      alias: {
        '@mf/shared': path.resolve(__dirname, '../../packages/mf-shared/src'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']
    },
    build: {
      // Minificación agresiva en producción
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: !isDev, // Eliminar console.log en producción
          drop_debugger: true,
          pure_funcs: isDev ? [] : ['console.log', 'console.warn'],
        },
        mangle: {
          toplevel: true, // Ofuscar nombres de variables globales
        },
        format: {
          comments: false, // Eliminar comentarios
        },
      },
    },
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
