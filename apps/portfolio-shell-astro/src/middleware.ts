/**
 * MIDDLEWARE - Auth Guard (Server-Side Route Protection)
 * Protege rutas ANTES de renderizar (seguridad real del servidor)
 * 
 * ARQUITECTURA HEXAGONAL:
 * - Usa VerifyAuthTokenUseCase (Application Layer)
 * - ConsoleLogger (Infrastructure Layer)
 */

import { defineMiddleware } from 'astro:middleware';
import { ConsoleLogger } from './infrastructure/adapters/ConsoleLogger';
import { VerifyAuthTokenUseCase } from './application/use-cases/VerifyAuthTokenUseCase';

// ═══════════════════════════════════════════════════════════
// ENVIRONMENT DETECTION
// ═══════════════════════════════════════════════════════════

const IS_PRODUCTION = import.meta.env.PROD;
const ENV_MODE = IS_PRODUCTION ? '🔴 PROD' : '🟢 DEV';

// ═══════════════════════════════════════════════════════════
// DEPENDENCY INJECTION
// ═══════════════════════════════════════════════════════════

const logger = new ConsoleLogger();
const verifyAuthUseCase = new VerifyAuthTokenUseCase(logger);

// ═══════════════════════════════════════════════════════════
// RUTAS PROTEGIDAS (Requieren autenticación)
// ═══════════════════════════════════════════════════════════

const PROTECTED_ROUTES = [
  '/demo',
  '/demo-hot',
  '/dashboard',
  '/profile',
  '/admin',
];

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE HANDLER
// ═══════════════════════════════════════════════════════════

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = new URL(url).pathname;

  // 1. Verificar si la ruta necesita protección
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    // Ruta pública, continuar sin verificar
    return next();
  }

  logger.info(`[Middleware ${ENV_MODE}] Verificando auth para ruta protegida`, {
    pathname,
  });

  // 2. Obtener token desde cookies
  const authToken = cookies.get('auth-token')?.value;

  // 3. Verificar autenticación usando Use Case
  const authResult = verifyAuthUseCase.execute({
    token: authToken,
  });

  // 4. Si no está autenticado, redirigir a Login
  if (!authResult.isAuthenticated) {
    logger.warn(`[Middleware ${ENV_MODE}] Acceso denegado - redirigiendo a login`, {
      pathname,
      reason: authResult.error,
    });

    // Redirigir a login con returnUrl
    return redirect(`/login?returnUrl=${encodeURIComponent(pathname)}`);
  }

  // 5. Usuario autenticado, agregar datos al context
  (context.locals as any).user = authResult.user;
  (context.locals as any).isAuthenticated = true;

  logger.info(`[Middleware ${ENV_MODE}] Acceso permitido`, {
    pathname,
    username: authResult.user?.getUsername(),
  });

  // 6. Continuar al renderizado de la página
  return next();
});
