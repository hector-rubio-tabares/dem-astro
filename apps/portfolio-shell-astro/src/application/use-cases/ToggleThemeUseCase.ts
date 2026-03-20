/**
 * APPLICATION LAYER - Use Case: Toggle Theme
 * Caso de uso para cambiar entre light/dark mode
 */

import type { IThemeRepository } from '../ports/IThemeRepository';
import type { Theme } from '../../core/entities/Theme';

export class ToggleThemeUseCase {
  constructor(
    private readonly themeRepository: IThemeRepository
  ) {}

  execute(): Theme {
    // 1. Obtener tema actual
    const currentTheme = this.themeRepository.load();

    // 2. Toggle (lógica de dominio)
    const newTheme = currentTheme.toggle();

    // 3. Persistir
    this.themeRepository.save(newTheme);

    // 4. Aplicar en el DOM
    this.applyThemeToDOM(newTheme);

    return newTheme;
  }

  private applyThemeToDOM(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme.getMode());
    }
  }
}
