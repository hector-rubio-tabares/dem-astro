/**
 * PRESENTATION LAYER - Client Entry Point (Simplificado)
 * 
 * ✅ Refactorizado: Tema y Auth Nav ahora están en MainNav.astro
 * Este script solo maneja el Auth Gate (control de acceso a páginas protegidas)
 * 
 * SOLID: Single Responsibility - Solo maneja protección de rutas
 */

// Infrastructure
import { SessionStorageAuthService } from '../infrastructure/adapters/SessionStorageAuthService';
import { ConsoleLogger } from '../infrastructure/adapters/ConsoleLogger';
import { ProductionErrorHandler } from '../infrastructure/adapters/ProductionErrorHandler';

// Use Cases
import { CheckAuthenticationUseCase } from '../application/use-cases/CheckAuthenticationUseCase';

// ═══════════════════════════════════════════════════════════
// DEPENDENCY INJECTION
// ═══════════════════════════════════════════════════════════

const logger = new ConsoleLogger();
const errorHandler = new ProductionErrorHandler(logger);
const authService = new SessionStorageAuthService();
const checkAuthUseCase = new CheckAuthenticationUseCase(authService);

// ═══════════════════════════════════════════════════════════
// AUTH GATE (Control de acceso a páginas protegidas)
// ═══════════════════════════════════════════════════════════

export function checkAuthGate(): void {
  const authGate = document.getElementById('auth-gate');
  const mainView = document.getElementById('main-view');
  
  if (!authGate || !mainView) return;

  try {
    const result = checkAuthUseCase.execute(window.location.pathname, true);

    if (result.isAuthenticated) {
      authGate.style.display = 'none';
      mainView.style.display = 'block';
    } else {
      authGate.style.display = 'flex';
      mainView.style.display = 'none';
    }
  } catch (error) {
    errorHandler.handle(error as Error, { action: 'checkAuthGate' });
  }
}

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════

function initialize(): void {
  checkAuthGate();
  logger.info('[LayoutClient] Inicializado');
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
