/**
 * APPLICATION LAYER - Port: IErrorHandler
 * Contrato para manejo centralizado de errores
 */

export interface IErrorHandler {
  /**
   * Manejar un error (log, notify user, send to monitoring)
   */
  handle(error: Error, context?: Record<string, unknown>): void;

  /**
   * Intentar recuperarse de un error con reintentos
   */
  recover<T>(
    operation: () => Promise<T>,
    fallback: T,
    maxRetries?: number
  ): Promise<T>;
}
