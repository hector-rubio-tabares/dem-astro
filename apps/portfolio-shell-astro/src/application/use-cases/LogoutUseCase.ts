/**
 * APPLICATION LAYER - Use Case: Logout
 * Caso de uso para cerrar sesión de un usuario
 */

import type { IAuthService } from '../ports/IAuthService';

export class LogoutUseCase {
  constructor(
    private readonly authService: IAuthService
  ) {}

  execute(): void {
    this.authService.logout();
  }
}
