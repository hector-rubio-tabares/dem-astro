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
    // Cargar tema guardado (o default) y retornar.
    // La capa de presentación (cliente) aplica el atributo DOM.
    return this.themeRepository.load();
  }
}
