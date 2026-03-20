/**
 * APPLICATION LAYER - Port: IThemeRepository
 * Contrato para persistencia del tema (localStorage, cookies, etc.)
 */

import type { Theme } from '../../core/entities/Theme';

export interface IThemeRepository {
  /**
   * Guardar el tema actual
   */
  save(theme: Theme): void;

  /**
   * Obtener el tema guardado (o default si no existe)
   */
  load(): Theme;

  /**
   * Verificar si existe un tema guardado
   */
  exists(): boolean;

  /**
   * Eliminar el tema guardado
   */
  clear(): void;
}
