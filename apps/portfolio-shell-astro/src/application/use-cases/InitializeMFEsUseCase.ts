/**
 * APPLICATION LAYER - Use Case: InitializeMFEsUseCase
 * Caso de uso para inicializar todos los MFEs con UI de carga
 */

import type { MFEConfig } from '../../core/entities/MFEConfig';
import type { MFERegistry } from '../../core/services/MFERegistry';
import type { IMFELoader, ILoadingUI } from '../ports/IMFELoader';

export class InitializeMFEsUseCase {
  constructor(
    private readonly loader: IMFELoader,
    private readonly registry: MFERegistry,
    private readonly loadingUI: ILoadingUI
  ) {}

  async execute(configs: MFEConfig[]): Promise<void> {
    console.log('[InitializeMFEs] Iniciando carga de MFEs...');

    // 1. Registrar configuraciones
    configs.forEach(config => this.registry.registerConfig(config));

    // 2. Mostrar pantalla de carga
    this.loadingUI.show();
    this.loadingUI.updateProgress(0, configs.length);

    // 3. Cargar MFEs críticos primero
    const critical = configs.filter(c => c.isCritical());
    const nonCritical = configs.filter(c => !c.isCritical());

    let loaded = 0;

    // 4. Cargar críticos en paralelo
    const criticalResults = await Promise.allSettled(
      critical.map(async (config) => {
        const instances = await this.loader.load(config);
        instances.forEach(instance => this.registry.registerInstance(instance));
        loaded++;
        this.loadingUI.updateProgress(loaded, configs.length);
        
        const stats = this.registry.getStatistics();
        this.loadingUI.updateStats({
          total: stats.total,
          loaded: stats.loaded,
          failed: stats.failed,
          avgTime: stats.avgLoadTime,
        });
        
        return instances;
      })
    );

    // 5. Cargar no críticos en paralelo
    const nonCriticalResults = await Promise.allSettled(
      nonCritical.map(async (config) => {
        const instances = await this.loader.load(config);
        instances.forEach(instance => this.registry.registerInstance(instance));
        loaded++;
        this.loadingUI.updateProgress(loaded, configs.length);
        
        const stats = this.registry.getStatistics();
        this.loadingUI.updateStats({
          total: stats.total,
          loaded: stats.loaded,
          failed: stats.failed,
          avgTime: stats.avgLoadTime,
        });
        
        return instances;
      })
    );

    // 6. Análisis de resultados
    const allResults = [...criticalResults, ...nonCriticalResults];
    const failures = allResults.filter(r => r.status === 'rejected');

    if (failures.length > 0) {
      console.warn(`[InitializeMFEs] ${failures.length} MFE(s) fallaron al cargar`);
      failures.forEach(failure => {
        if (failure.status === 'rejected') {
          console.error('[InitializeMFEs]', failure.reason);
        }
      });
    }

    // 7. Ocultar UI inmediatamente (sin setTimeout)
    this.loadingUI.hide();

    console.log('[InitializeMFEs] Inicialización completa');
  }
}
