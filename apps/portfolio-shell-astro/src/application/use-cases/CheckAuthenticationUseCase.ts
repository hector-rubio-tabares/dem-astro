/**
 * APPLICATION LAYER - Use Case: Check Authentication
 * Caso de uso para verificar si el usuario está autenticado
 */

import type { IAuthService } from '../ports/IAuthService';
import type { User } from '../../core/entities/User';

export interface CheckAuthResponse {
  isAuthenticated: boolean;
  user?: User;
  requiresRedirect: boolean;
  redirectUrl?: string;
}

export class CheckAuthenticationUseCase {
  constructor(
    private readonly authService: IAuthService
  ) {}

  execute(currentPath: string, requiresAuth: boolean): CheckAuthResponse {
    const isAuthenticated = this.authService.isAuthenticated();
    const user = this.authService.getCurrentUser();

    // Si la ruta NO requiere auth, permitir acceso
    if (!requiresAuth) {
      return {
        isAuthenticated,
        user: user ?? undefined,
        requiresRedirect: false,
      };
    }

    // Si la ruta requiere auth pero no está autenticado → redirigir a login
    if (requiresAuth && !isAuthenticated) {
      return {
        isAuthenticated: false,
        requiresRedirect: true,
        redirectUrl: '/login',
      };
    }

    // Usuario autenticado y ruta requiere auth → permitir acceso
    return {
      isAuthenticated: true,
      user: user ?? undefined,
      requiresRedirect: false,
    };
  }
}
