/**
 * APPLICATION LAYER - Use Case: Login
 * Caso de uso para autenticar un usuario (REFACTORED con error handling)
 */

import type { IAuthService } from '../ports/IAuthService';
import type { IErrorHandler } from '../ports/IErrorHandler';
import type { ILogger } from '../ports/ILogger';
import type { User } from '../../core/entities/User';
import { ValidationError, AuthenticationError } from '../../core/errors';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: string;
}

export class LoginUseCase {
  constructor(
    private readonly authService: IAuthService,
    private readonly errorHandler: IErrorHandler,
    private readonly logger: ILogger
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    try {
      // 1. Validar entrada
      this.validateRequest(request);

      this.logger.debug('[LoginUseCase] Attempting login', {
        username: request.username,
      });

      // 2. Intentar autenticar
      const result = await this.authService.login(
        request.username,
        request.password
      );

      if (!result) {
        // Lanzar error específico de autenticación
        throw new AuthenticationError('Invalid credentials');
      }

      this.logger.info('[LoginUseCase] Login successful', {
        username: request.username,
      });

      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      // 3. Manejar error de forma centralizada
      this.errorHandler.handle(error as Error, {
        useCase: 'LoginUseCase',
        username: request.username,
      });

      // 4. Retornar respuesta apropiada
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code,
        };
      }

      if (error instanceof AuthenticationError) {
        return {
          success: false,
          error: 'Usuario o contraseña incorrectos',
          errorCode: error.code,
        };
      }

      // Error desconocido
      return {
        success: false,
        error: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  private validateRequest(request: LoginRequest): void {
    if (!request.username || request.username.trim().length === 0) {
      throw new ValidationError('El nombre de usuario es requerido', 'username');
    }

    if (!request.password || request.password.length === 0) {
      throw new ValidationError('La contraseña es requerida', 'password');
    }

    if (request.password.length < 8) {
      throw new ValidationError(
        'La contraseña debe tener al menos 8 caracteres',
        'password'
      );
    }
  }
}
