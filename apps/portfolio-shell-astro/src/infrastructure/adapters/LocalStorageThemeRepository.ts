/**
 * INFRASTRUCTURE LAYER - Adapter: LocalStorage Theme Repository
 * Implementación de IThemeRepository usando LocalStorage
 */

import type { IThemeRepository } from '../../application/ports/IThemeRepository';
import { Theme, type ThemeMode } from '../../core/entities/Theme';

export class LocalStorageThemeRepository implements IThemeRepository {
  private readonly STORAGE_KEY = 'mfe-theme';

  save(theme: Theme): void {
    if (typeof localStorage === 'undefined') {
      console.warn('[ThemeRepository] localStorage no disponible');
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, theme.getMode());
    } catch (error) {
      console.error('[ThemeRepository] Error guardando tema:', error);
    }
  }

  load(): Theme {
    if (typeof localStorage === 'undefined') {
      return Theme.default();
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (stored && (stored === 'light' || stored === 'dark')) {
        return Theme.create(stored as ThemeMode);
      }
    } catch (error) {
      console.error('[ThemeRepository] Error cargando tema:', error);
    }

    return Theme.default();
  }

  exists(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  clear(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('[ThemeRepository] Error limpiando tema:', error);
    }
  }
}
