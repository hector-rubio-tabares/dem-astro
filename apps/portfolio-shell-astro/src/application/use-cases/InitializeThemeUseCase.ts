/**
 * APPLICATION LAYER - Use Case: Initialize Theme
 * Caso de uso para inicializar el tema al cargar la aplicación
 */

import type { IThemeRepository } from '../ports/IThemeRepository';
import type { Theme } from '../../core/entities/Theme';

export class InitializeThemeUseCase {
  constructor(
    private readonly themeRepository: IThemeRepository
  ) {}

  execute(): Theme {
    // 1. Cargar tema guardado (o default)
    const theme = this.themeRepository.load();

    // 2. Aplicar inmediatamente en el DOM
    this.applyThemeToDOM(theme);

    return theme;
  }

  private applyThemeToDOM(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme.getMode());
    }
  }
}
