export const environment = {
  production: false,
  envName: 'development',
  appName: 'portfolio-angular-mf',
  port: 4201,
  apiBaseUrl: '',
  apiTimeout: 10000,
  allowedShellOrigins: [
    'http://127.0.0.1:4321',
    'http://localhost:4321',
  ],
  sentryDsn: '',
  logLevel: 'debug' as 'debug' | 'info' | 'warn' | 'error',
  enableDevTools: true,
};
