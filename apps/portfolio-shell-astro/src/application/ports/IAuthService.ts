/**
 * APPLICATION LAYER - Port: IAuthService
 * Contrato para servicios de autenticación
 */

import type { User } from '../../core/entities/User';
import type { AuthToken } from '../../core/value-objects/AuthToken';

export interface IAuthService {
  /**
   * Autenticar usuario con credenciales
   */
  login(username: string, password: string): Promise<{ user: User; token: AuthToken } | null>;

  /**
   * Cerrar sesión del usuario actual
   */
  logout(): void;

  /**
   * Obtener el usuario actual autenticado
   */
  getCurrentUser(): User | null;

  /**
   * Obtener el token actual
   */
  getCurrentToken(): AuthToken | null;

  /**
   * Verificar si hay un usuario autenticado
   */
  isAuthenticated(): boolean;

  /**
   * Verificar si el usuario actual tiene un rol específico
   */
  hasRole(role: string): boolean;
}
