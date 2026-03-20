/**
 * INFRASTRUCTURE LAYER - Adapter: ModuleFederationLoader
 * Adaptador que implementa IMFELoader usando Module Federation
 * 
 * ✅ Refactorizado para usar remote-module-loader.ts (DRY principle)
 */

import type { MFEConfig, MFEInstance } from '../../core/entities/MFEConfig';
import type { IMFELoader } from '../../application/ports/IMFELoader';
import { MFEInstance as MFEInstanceImpl } from '../../core/entities/MFEConfig';
import { loadRemoteModule } from '@mf/shared';

export class ModuleFederationLoader implements IMFELoader {
  private loadedModules: Map<string, any> = new Map();

  async load(config: MFEConfig): Promise<MFEInstance[]> {
    console.log(`[Loader] Cargando ${config.getDisplayName()}...`);

    const slots = document.querySelectorAll<HTMLElement>(config.selector);

    if (slots.length === 0) {
      console.warn(`[Loader] No se encontraron slots para: ${config.selector}`);
      return [];
    }

    const instances: MFEInstance[] = [];

    try {
      // Import el módulo remoto
      const module = await this.importModule(config.url, config.timeoutMs);
      this.loadedModules.set(config.name, module);

      // Montar en cada slot (sin bloquear)
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const instanceId = crypto.randomUUID();
        const instance = new MFEInstanceImpl(instanceId, config, slot);

        instance.startLoading();

        // Usar .then() para no bloquear el hilo de ejecución
        this.mountInstance(module, slot, config, instanceId, i)
          .then(() => {
            instance.markLoaded();
            console.log(`[Loader] ✅ Instancia ${i + 1}/${slots.length} montada: ${config.name}`);
          })
          .catch((error) => {
            const message = error instanceof Error ? error.message : 'Unknown error';
            instance.markError(message);
            console.error(`[Loader] ❌ Error montando instancia ${i + 1}:`, error);
          });

        instances.push(instance);
      }
    } catch (error) {
      console.error(`[Loader] ❌ Error cargando ${config.name}:`, error);
      // Crear instancias con error para cada slot
      slots.forEach((slot, i) => {
        const instanceId = crypto.randomUUID();
        const instance = new MFEInstanceImpl(instanceId, config, slot);
        instance.startLoading();
        const message = error instanceof Error ? error.message : 'Module load failed';
        instance.markError(message);
        instances.push(instance);
      });
    }

    return instances;
  }

  async unload(instanceId: string): Promise<void> {
    // Implementación futura para unmount
    console.log(`[Loader] Unload not implemented yet: ${instanceId}`);
  }

  async preload(config: MFEConfig): Promise<void> {
    if (!this.loadedModules.has(config.name)) {
      await this.importModule(config.url, config.timeoutMs);
    }
  }

  private async importModule(url: string, timeoutMs: number): Promise<any> {
    // ✅ Usar utilidad compartida (no duplicar código)
    return loadRemoteModule(url, { timeout: timeoutMs });
  }

  private async mountInstance(
    module: any,
    container: HTMLElement,
    config: MFEConfig,
    instanceId: string,
    index: number
  ): Promise<void> {
    if (config.type === 'angular' && config.customElementName) {
      // Angular con Custom Elements
      const element = document.createElement(config.customElementName);
      element.setAttribute('data-instance-id', instanceId);
      container.innerHTML = '';
      container.appendChild(element);
      
      // Remover skeleton loading
      container.classList.remove('loading');
    } else if (module.mount && typeof module.mount === 'function') {
      // React/Vue con función mount
      container.innerHTML = '';
      await module.mount(container, { instanceId, index });
      
      // Remover skeleton loading
      container.classList.remove('loading');
    } else {
      throw new Error('Module does not expose mount() function or custom element');
    }
  }
}
