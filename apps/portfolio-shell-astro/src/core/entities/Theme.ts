/**
 * DOMAIN LAYER - Entity: Theme
 * Entidad del dominio que representa el tema de la aplicación
 */

export type ThemeMode = 'light' | 'dark';

export class Theme {
  private constructor(
    private readonly mode: ThemeMode
  ) {}

  static create(mode: ThemeMode): Theme {
    if (!['light', 'dark'].includes(mode)) {
      throw new Error(`Invalid theme mode: ${mode}`);
    }
    return new Theme(mode);
  }

  static default(): Theme {
    return new Theme('light');
  }

  getMode(): ThemeMode {
    return this.mode;
  }

  toggle(): Theme {
    return new Theme(this.mode === 'light' ? 'dark' : 'light');
  }

  isDark(): boolean {
    return this.mode === 'dark';
  }

  equals(other: Theme): boolean {
    return this.mode === other.mode;
  }
}
