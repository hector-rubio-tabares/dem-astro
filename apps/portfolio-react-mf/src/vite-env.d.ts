/// <reference types="vite/client" />

/**
 * TYPE DEFINITIONS - Vite Environment Variables
 * Extensión de tipos para variables de entorno en Vite
 */

interface ImportMetaEnv {
  // Development/Production mode
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;

  // MFE Configuration
  readonly VITE_MF_HOST: string;
  readonly VITE_MF_PORT: string;

  // CORS
  readonly VITE_ALLOWED_SHELL_ORIGINS: string;

  // API
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT_MS: string;

  // Observability
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_ENV_NAME: string;

  // Debugging
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
