/**
 * APPLICATION LAYER - Port: IMFELoader
 * Puerto para carga de Micro-Frontends
 */

import type { MFEConfig, MFEInstance } from '../../core/entities/MFEConfig';

export interface IMFELoader {
  /**
   * Carga un MFE y lo monta en todos los contenedores que coincidan
   */
  load(config: MFEConfig): Promise<MFEInstance[]>;

  /**
   * Descarga un MFE de un contenedor específico
   */
  unload(instanceId: string): Promise<void>;

  /**
   * Precarga un MFE sin montarlo (warm cache)
   */
  preload(config: MFEConfig): Promise<void>;
}

/**
 * Port: ILoadingUI
 * Puerto para UI de carga
 */
export interface ILoadingUI {
  /**
   * Muestra la pantalla de carga
   */
  show(): void;

  /**
   * Oculta la pantalla de carga
   */
  hide(): void;

  /**
   * Actualiza el progreso de carga
   */
  updateProgress(loaded: number, total: number): void;

  /**
   * Actualiza estadísticas en tiempo real
   */
  updateStats(stats: {
    total: number;
    loaded: number;
    failed: number;
    avgTime: number;
  }): void;
}
