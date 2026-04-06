import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  site: 'https://portfolio.tudominio.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    resolve: {
      alias: {
        '@mf/shared': path.resolve(__dirname, '../../packages/mf-shared/src'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: true,
          pure_funcs: isDev ? [] : ['console.log', 'console.warn'],
        },
        mangle: {
          toplevel: true,
        },
        format: {
          comments: false,
        },
      },
    },
    server: {}
  }
});
