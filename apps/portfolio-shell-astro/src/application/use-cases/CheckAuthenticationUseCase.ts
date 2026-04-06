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

    if (!requiresAuth) {
      return {
        isAuthenticated,
        user: user ?? undefined,
        requiresRedirect: false,
      };
    }

    if (requiresAuth && !isAuthenticated) {
      return {
        isAuthenticated: false,
        requiresRedirect: true,
        redirectUrl: '/login',
      };
    }

    return {
      isAuthenticated: true,
      user: user ?? undefined,
      requiresRedirect: false,
    };
  }
}
