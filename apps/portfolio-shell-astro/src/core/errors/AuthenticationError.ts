/**
 * DOMAIN LAYER - Authentication Error
 * Error cuando las credenciales son inválidas
 */

import { DomainError } from './DomainError';

export class AuthenticationError extends DomainError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}
