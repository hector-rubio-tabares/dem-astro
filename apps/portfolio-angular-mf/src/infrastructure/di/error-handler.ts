import { ErrorHandler, Injectable } from '@angular/core';

/**
 * Global Error Handler para el microfrontend Angular
 * Aísla errores para que no afecten a toda la aplicación
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error): void {
    console.error('[Angular MF] Error caught by handler:', error);

    // TODO: Reportar a servicio de monitoring (Sentry, DataDog, etc.)
    // if (isProduction()) {
    //   reportError('Angular MF', error)
    // }

    // Mostrar mensaje de error en UI si es necesario
    this.showErrorMessage(error);

    // NO re-throw para aislar el error del resto de la app
  }

  private showErrorMessage(error: Error): void {
    // En producción, podrías mostrar un toast o notificación
    // Por ahora solo loggeamos
    if (typeof window !== 'undefined') {
      console.warn('[Angular MF] Error message:', error.message);
    }
  }
}
