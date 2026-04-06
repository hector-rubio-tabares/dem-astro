export const environment = {
  production: true,
  envName: 'production',
  appName: 'portfolio-angular-mf',
  port: 4201,
  apiBaseUrl: '',
  apiTimeout: 15000,
  allowedShellOrigins: [
    'https://tudominio.com',
    'https://www.tudominio.com',
  ],
  sentryDsn: '',
  logLevel: 'error' as 'debug' | 'info' | 'warn' | 'error',
  enableDevTools: false,
};
