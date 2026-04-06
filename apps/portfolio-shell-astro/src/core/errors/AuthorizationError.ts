/**
 * DOMAIN LAYER - Authorization Error
 * Error cuando el usuario no tiene permisos
 */

import { DomainError } from './DomainError';

export class AuthorizationError extends DomainError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}
