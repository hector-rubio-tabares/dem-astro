/**
 * DOMAIN LAYER - Service: MFERegistry
 * Registro central de MFEs cargados
 */

import type { MFEConfig, MFEInstance } from '../entities/MFEConfig';
import { LoadStatistics } from '../value-objects/Origin';

export class MFERegistry {
  private instances: Map<string, MFEInstance> = new Map();
  private configs: Map<string, MFEConfig> = new Map();

  registerConfig(config: MFEConfig): void {
    this.configs.set(config.name, config);
  }

  registerInstance(instance: MFEInstance): void {
    this.instances.set(instance.id, instance);
  }

  getInstance(id: string): MFEInstance | undefined {
    return this.instances.get(id);
  }

  getConfig(name: string): MFEConfig | undefined {
    return this.configs.get(name);
  }

  getAllInstances(): MFEInstance[] {
    return Array.from(this.instances.values());
  }

  getInstancesByType(type: string): MFEInstance[] {
    return this.getAllInstances().filter(
      instance => instance.config.type === type
    );
  }

  getStatistics(): LoadStatistics {
    const instances = this.getAllInstances();
    const total = instances.length;
    
    if (total === 0) {
      return LoadStatistics.empty();
    }

    const loaded = instances.filter(i => i.isLoaded()).length;
    const failed = instances.filter(i => i.hasError()).length;
    const loading = instances.filter(i => i.getStatus() === 'loading').length;

    const loadTimes = instances
      .map(i => i.getLoadTime())
      .filter((t): t is number => t !== null);

    const avgLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
      : 0;

    const maxLoadTime = loadTimes.length > 0 ? Math.max(...loadTimes) : 0;
    const minLoadTime = loadTimes.length > 0 ? Math.min(...loadTimes) : 0;

    return new LoadStatistics(
      total,
      loaded,
      failed,
      loading,
      avgLoadTime,
      maxLoadTime,
      minLoadTime
    );
  }

  clear(): void {
    this.instances.clear();
    this.configs.clear();
  }
}
