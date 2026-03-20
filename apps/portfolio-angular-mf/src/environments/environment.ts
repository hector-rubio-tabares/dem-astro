/**
 * ENVIRONMENT - Development
 * Configuración para desarrollo local (ng serve)
 * 
 * NOTA: Angular usa este archivo directamente, NO archivos .env
 * Para cambiar valores localmente, edita este archivo (no se versiona cambios locales)
 */

export const environment = {
  // ────────────────────────────────────────────────────────────────────
  // GENERAL
  // ────────────────────────────────────────────────────────────────────
  production: false,
  envName: 'development',
  appName: 'portfolio-angular-mf',

  // ────────────────────────────────────────────────────────────────────
  // DEV SERVER
  // ────────────────────────────────────────────────────────────────────
  port: 4201,

  // ────────────────────────────────────────────────────────────────────
  // API BACKEND
  // ────────────────────────────────────────────────────────────────────
  apiBaseUrl: 'http://localhost:8080',
  apiTimeout: 10000, // ms

  // ────────────────────────────────────────────────────────────────────
  // CORS - Shell Origins
  // ────────────────────────────────────────────────────────────────────
  allowedShellOrigins: [
    'http://127.0.0.1:4321',
    'http://localhost:4321',
  ],

  // ────────────────────────────────────────────────────────────────────
  // OBSERVABILIDAD
  // ────────────────────────────────────────────────────────────────────
  sentryDsn: '',

  // ────────────────────────────────────────────────────────────────────
  // DEBUGGING
  // ────────────────────────────────────────────────────────────────────
  logLevel: 'debug' as 'debug' | 'info' | 'warn' | 'error',
  enableDevTools: true,
};
