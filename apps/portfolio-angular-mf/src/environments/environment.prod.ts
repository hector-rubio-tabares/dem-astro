/**
 * ENVIRONMENT - Production
 * Configuración para producción (ng build --configuration=production)
 * 
 * Este archivo reemplaza environment.ts automáticamente en builds de producción
 * mediante fileReplacements en angular.json
 */

export const environment = {
  // ────────────────────────────────────────────────────────────────────
  // GENERAL
  // ────────────────────────────────────────────────────────────────────
  production: true,
  envName: 'production',
  appName: 'portfolio-angular-mf',

  // ────────────────────────────────────────────────────────────────────
  // DEV SERVER (no aplica en producción)
  // ────────────────────────────────────────────────────────────────────
  port: 4201,

  // ────────────────────────────────────────────────────────────────────
  // API BACKEND (CONFIGURAR URL REAL)
  // ────────────────────────────────────────────────────────────────────
  apiBaseUrl: 'https://api.tudominio.com', // TODO: Configurar URL real
  apiTimeout: 15000, // ms (mayor timeout en producción)

  // ────────────────────────────────────────────────────────────────────
  // CORS - Shell Origins (CONFIGURAR DOMINIOS REALES)
  // ────────────────────────────────────────────────────────────────────
  allowedShellOrigins: [
    'https://tudominio.com', // TODO: Configurar dominio real
    'https://www.tudominio.com',
  ],

  // ────────────────────────────────────────────────────────────────────
  // OBSERVABILIDAD (CONFIGURAR SENTRY DSN REAL)
  // ────────────────────────────────────────────────────────────────────
  sentryDsn: '', // TODO: https://your-sentry-dsn@sentry.io/project-id

  // ────────────────────────────────────────────────────────────────────
  // DEBUGGING (DESHABILITADO en producción)
  // ────────────────────────────────────────────────────────────────────
  logLevel: 'error' as 'debug' | 'info' | 'warn' | 'error',
  enableDevTools: false,
};
