import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  const serverHost = env.VITE_MF_HOST || '127.0.0.1'
  const serverPort = Number(env.VITE_MF_PORT || 5173)
  const corsOrigins = (env.VITE_ALLOWED_SHELL_ORIGINS || 'http://127.0.0.1:4321,http://localhost:4321')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return {
    server: {
      host: serverHost,
      port: serverPort,
      strictPort: true,
      cors: {
        origin: corsOrigins,
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
      lib: {
        entry: 'src/mf-entry.tsx',
        name: 'PortfolioReactMf',
        formats: ['es'],
        fileName: () => 'react-mf.js',
      },
      rollupOptions: {
        output: {
          assetFileNames: 'react-mf.[ext]',
        },
      },
    },
  }
})
