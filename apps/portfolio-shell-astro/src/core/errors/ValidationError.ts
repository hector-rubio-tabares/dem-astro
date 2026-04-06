/**
 * DOMAIN LAYER - Validation Error
 * Error cuando la validación de datos falla
 */

import { DomainError } from './DomainError';

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400, { field });
  }
}
