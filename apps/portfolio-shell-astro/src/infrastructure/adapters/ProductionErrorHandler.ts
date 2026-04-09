/**
 * INFRASTRUCTURE LAYER - Adapter: Production Error Handler
 * Implementación de IErrorHandler para manejo centralizado de errores
 */

import type { IErrorHandler } from '../../application/ports/IErrorHandler';
import type { ILogger } from '../../application/ports/ILogger';
import {
  DomainError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  InfrastructureError,
} from '../../core/errors';

export class ProductionErrorHandler implements IErrorHandler {
  constructor(private readonly logger: ILogger) {}

  handle(error: Error, context?: Record<string, unknown>): void {
    // 1. Clasificar y manejar según tipo
    if (error instanceof ValidationError) {
      this.handleValidationError(error);
    } else if (error instanceof AuthenticationError) {
      this.handleAuthError(error);
    } else if (error instanceof AuthorizationError) {
      this.handleAuthorizationError(error);
    } else if (error instanceof InfrastructureError) {
      this.handleInfrastructureError(error, context);
    } else if (error instanceof DomainError) {
      this.handleDomainError(error, context);
    } else {
      this.handleUnknownError(error, context);
    }

    // 2. Enviar a servicio de monitoreo en producción
    if (import.meta.env.PROD && this.shouldReportToMonitoring(error)) {
      this.sendToMonitoring(error, context);
    }
  }

  async recover<T>(
    operation: () => Promise<T>,
    fallback: T,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Retry attempt ${attempt}/${maxRetries}`, {
          error: (error as Error).message,
        });

        if (attempt < maxRetries) {
          // Exponential backoff
          await this.delay(Math.pow(2, attempt) * 100);
        }
      }
    }

    this.logger.error('Max retries exceeded, using fallback', {
      error: lastError?.message,
      fallback,
    });

    if (lastError) {
      this.handle(lastError, { maxRetries, fallback });
    }

    return fallback;
  }

  // ═══════════════════════════════════════════════════════════
  // PRIVATE HANDLERS
  // ═══════════════════════════════════════════════════════════

  private handleValidationError(error: ValidationError): void {
    this.logger.warn('Validation error', {
      field: error.field,
      message: error.message,
    });
  }

  private handleAuthError(error: AuthenticationError): void {
    this.logger.warn('Authentication failed', {
      message: error.message,
    });

    // Redirigir a login si estamos en el browser
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  private handleAuthorizationError(error: AuthorizationError): void {
    this.logger.warn('Authorization denied', {
      message: error.message,
    });
  }

  private handleInfrastructureError(
    error: InfrastructureError,
    context?: Record<string, unknown>
  ): void {
    this.logger.error('Infrastructure error', {
      message: error.message,
      originalError: error.originalError,
      context,
    });
  }

  private handleDomainError(error: DomainError, context?: Record<string, unknown>): void {
    this.logger.error('Domain error', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      context: { ...error.context, ...context },
    });
  }

  private handleUnknownError(error: Error, context?: Record<string, unknown>): void {
    this.logger.error('Unknown error', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  private shouldReportToMonitoring(error: Error): boolean {
    // No reportar errores de validación a Sentry
    if (error instanceof ValidationError) {
      return false;
    }
    
    // Reportar todo lo demás
    return true;
  }

  private sendToMonitoring(error: Error, context?: Record<string, unknown>): void {
    // Integración con Sentry (si está disponible)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        extra: context,
        tags: {
          errorType: error.name,
          ...(error instanceof DomainError && {
            errorCode: error.code,
          }),
        },
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
