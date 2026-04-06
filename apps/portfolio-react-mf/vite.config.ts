import { defineConfig, loadEnv } from 'vite'
import federation from '@originjs/vite-plugin-federation'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  const serverHost = env.VITE_MF_HOST || '127.0.0.1'
  const serverPort = Number(env.VITE_MF_PORT || 5173)
  const corsOrigins = (env.VITE_ALLOWED_SHELL_ORIGINS || 'http://127.0.0.1:4321,http://127.0.0.1:4322,http://localhost:4321,http://localhost:4322')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const corsOrigin: string[] = [...corsOrigins];

  return {
    resolve: {
      alias: {
        '@mf/shared': path.resolve(__dirname, '../../packages/mf-shared/src'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json']
    },
    plugins: [
      // Module Federation siempre habilitado (dev y prod)
      federation({
        name: 'reactMF',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/presentation/App.tsx',
          './mount': './src/mf-entry.tsx',
        },
        shared: ['react', 'react-dom'],
      }),
    ],
    server: {
      host: serverHost,
      port: serverPort,
      strictPort: true,
      allowedHosts: ['localhost', '127.0.0.1'],
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'HEAD', 'OPTIONS'],
        credentials: false,
      },
    },
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
      'process.env': '{}',
      global: 'globalThis',
    },
    build: {
      target: 'esnext',
      minify: isProd,
      cssCodeSplit: false,
    },
  }
})
