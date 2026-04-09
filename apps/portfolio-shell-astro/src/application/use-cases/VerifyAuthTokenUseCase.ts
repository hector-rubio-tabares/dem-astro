/**
 * APPLICATION LAYER - Use Case: Verify Auth Token (Server-Side)
 * Caso de uso para verificar autenticación desde el servidor (middleware)
 */

import type { ILogger } from '../ports/ILogger';
import { User } from '../../core/entities/User';
import { AuthenticationError } from '../../core/errors';

export interface VerifyAuthTokenRequest {
  token?: string | null;
  cookies?: Record<string, string>;
}

export interface VerifyAuthTokenResponse {
  isAuthenticated: boolean;
  user?: User;
  error?: string;
}

export class VerifyAuthTokenUseCase {
  constructor(private readonly logger: ILogger) {}

  execute(request: VerifyAuthTokenRequest): VerifyAuthTokenResponse {
    try {
      // 1. Obtener token desde request (cookie o header)
      const token = request.token || request.cookies?.['auth-token'];

      if (!token) {
        this.logger.debug('[VerifyAuthTokenUseCase] No token found');
        return {
          isAuthenticated: false,
          error: 'No authentication token',
        };
      }

      // 2. Parsear datos del token (en producción usarías JWT)
      const userData = this.parseToken(token);

      if (!userData) {
        this.logger.warn('[VerifyAuthTokenUseCase] Invalid token');
        return {
          isAuthenticated: false,
          error: 'Invalid token',
        };
      }

      // 3. Retornar usuario autenticado
      this.logger.info('[VerifyAuthTokenUseCase] Token verified', {
        username: userData.getUsername(),
      });

      return {
        isAuthenticated: true,
        user: userData,
      };
    } catch (error) {
      this.logger.error('[VerifyAuthTokenUseCase] Verification failed', error);
      return {
        isAuthenticated: false,
        error: 'Token verification failed',
      };
    }
  }

  private parseToken(token: string): User | null {
    try {
      // TODO: En producción, usar JWT (jsonwebtoken o jose)
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Para demo: simple JSON Base64
      const decoded = JSON.parse(
        Buffer.from(token, 'base64').toString('utf-8')
      );

      // Validar estructura
      if (!decoded.username || !decoded.roles) {
        throw new AuthenticationError('Malformed token');
      }

      return User.create(decoded.username, decoded.roles);
    } catch (error) {
      this.logger.debug('[VerifyAuthTokenUseCase] Token parse failed', error);
      return null;
    }
  }
}
