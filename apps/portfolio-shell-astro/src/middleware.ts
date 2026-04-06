import { defineMiddleware } from 'astro:middleware';
import { ConsoleLogger } from './infrastructure/adapters/ConsoleLogger';
import { VerifyAuthTokenUseCase } from './application/use-cases/VerifyAuthTokenUseCase';

const IS_PRODUCTION = import.meta.env.PROD;
const ENV_MODE = IS_PRODUCTION ? '🔴 PROD' : '🟢 DEV';

const logger = new ConsoleLogger();
const verifyAuthUseCase = new VerifyAuthTokenUseCase(logger);

const PROTECTED_ROUTES = [
  '/demo',
  '/demo-hot',
  '/dashboard',
  '/profile',
  '/admin',
];

function buildCspOrigins(): string {
  const reactUrl   = import.meta.env.PUBLIC_REACT_MF_URL   ?? '';
  const angularUrl = import.meta.env.PUBLIC_ANGULAR_MF_URL ?? '';
  const apiUrl     = import.meta.env.PUBLIC_API_BASE_URL   ?? '';
  const origins = new Set<string>();
  for (const raw of [reactUrl, angularUrl]) {
    try {
      if (raw) {
        const origin = new URL(raw).origin;
        origins.add(origin);
        if (!IS_PRODUCTION) {
          origins.add(origin.replace(/^http:/, 'ws:'));
        }
      }
    } catch { }
  }
  try { if (apiUrl) origins.add(new URL(apiUrl).origin); } catch { }
  return Array.from(origins).join(' ');
}

const MFE_ORIGINS = buildCspOrigins();

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' blob: ${MFE_ORIGINS}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `connect-src 'self' ${MFE_ORIGINS}`,
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "worker-src blob:",
  ].join('; '),
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = new URL(url).pathname;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    const response = await next();
    for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(header, value);
    }
    return response;
  }

  logger.info(`[Middleware ${ENV_MODE}] Verificando auth para ruta protegida`, { pathname });

  const authToken = cookies.get('auth-token')?.value;
  const authResult = verifyAuthUseCase.execute({ token: authToken });

  if (!authResult.isAuthenticated) {
    logger.warn(`[Middleware ${ENV_MODE}] Acceso denegado - redirigiendo a login`, {
      pathname,
      reason: authResult.error,
    });
    return redirect(`/login?returnUrl=${encodeURIComponent(pathname)}`);
  }

  (context.locals as Record<string, unknown>).user = authResult.user;
  (context.locals as Record<string, unknown>).isAuthenticated = true;

  logger.info(`[Middleware ${ENV_MODE}] Acceso permitido`, {
    pathname,
    username: authResult.user?.getUsername(),
  });

  const response = await next();
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }
  return response;
});
