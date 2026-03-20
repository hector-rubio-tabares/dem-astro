/**
 * DOMAIN LAYER - Infrastructure Error
 * Error en la capa de infraestructura (red, storage, etc.)
 */

import { DomainError } from './DomainError';

export class InfrastructureError extends DomainError {
  constructor(
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message, 'INFRASTRUCTURE_ERROR', 500, {
      originalError: originalError instanceof Error ? originalError.message : String(originalError),
    });
  }
}
