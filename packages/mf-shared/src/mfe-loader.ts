/**
 * MFE Loader Service - The Ethereal Architect
 * Servicio centralizado para carga de Micro-Frontends
 * 
 * ✅ SOLID: Single Responsibility (solo carga MFEs, no lógica de negocio)
 * ✅ Strategy Pattern: Cada MFE tiene su estrategia de mount
 * ✅ Factory Pattern: Crea instancias según tipo de MFE
 * ✅ DRY: Una sola implementación, múltiples páginas
 * 
 * Security: Valida URLs contra whitelist, timeout 8s
 * Performance: Lazy loading con Promise.race, single instance
 */

import { loadRemoteModule } from './remote-module-loader';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export type MFEType = 'projects' | 'projects-full' | 'about' | 'angular-demo' | 'react-demo';

export interface MFEConfig {
  readonly name: string;
  readonly type: 'webcomponent' | 'mount-function';
  readonly devServer: string;
  readonly devModulePath: string;
  readonly prodModulePath: string;
  readonly tagName?: string; // Para Web Components
  readonly mountFunctionName?: string; // Para mount functions
}

export interface LoadResult {
  success: boolean;
  componentName: string;
  error?: Error;
}

export type MFELoadRequest = 
  | [MFEType]                              // Web Component (no container)
  | [MFEType, HTMLElement | string];      // Mount function (con container)

// ═══════════════════════════════════════════════════════════════════════════
// MFE CATALOG (configuración centralizada)
// ═══════════════════════════════════════════════════════════════════════════

const MFE_CATALOG: Record<MFEType, MFEConfig> = {
  projects: {
    name: 'Projects (Angular)',
    type: 'webcomponent',
    devServer: 'http://127.0.0.1:4201',
    devModulePath: '/main.js',
    prodModulePath: '/mf/angular/main.js',
    tagName: 'portfolio-projects',
  },
  'projects-full': {
    name: 'Projects Full (Angular - Con paginación)',
    type: 'webcomponent',
    devServer: 'http://127.0.0.1:4201',
    devModulePath: '/main.js',
    prodModulePath: '/mf/angular/main.js',
    tagName: 'portfolio-projects-full',
  },
  about: {
    name: 'About (React)',
    type: 'mount-function',
    devServer: 'http://127.0.0.1:5173',
    devModulePath: '/src/mf-entry.tsx',
    prodModulePath: '/mf/react/react-mf.js',
    mountFunctionName: 'mountAbout',
  },
  'angular-demo': {
    name: 'Angular Demo',
    type: 'webcomponent',
    devServer: 'http://127.0.0.1:4201',
    devModulePath: '/main.js',
    prodModulePath: '/mf/angular/main.js',
    tagName: 'portfolio-angular-mf',
  },
  'react-demo': {
    name: 'React Demo',
    type: 'mount-function',
    devServer: 'http://127.0.0.1:5173',
    devModulePath: '/src/mf-entry.tsx',
    prodModulePath: '/mf/react/react-mf.js',
    mountFunctionName: 'mount',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MFE LOADER SERVICE (Singleton)
// ═══════════════════════════════════════════════════════════════════════════

class MFELoaderService {
  private loadedMFEs: Set<MFEType> = new Set();
  private isProduction: boolean;

  constructor() {
    // Detectar producción mirando hostname (no localhost/127.0.0.1)
    this.isProduction = typeof window !== 'undefined' && 
      !['localhost', '127.0.0.1'].includes(window.location.hostname);
  }

  /**
   * Carga un MFE en el container especificado
   * @param mfeType - Tipo de MFE del catálogo
   * @param containerOrId - Elemento DOM o ID del container (solo para mount functions)
   * @returns Promise con resultado de la carga
   * 
   * @example
   * // Web Component (Angular)
   * await mfeLoader.load('projects');
   * 
   * @example
   * // Mount Function (React)
   * await mfeLoader.load('about', 'about-container');
   */
  async load(
    mfeType: MFEType,
    containerOrId?: HTMLElement | string
  ): Promise<LoadResult> {
    const config = MFE_CATALOG[mfeType];
    
    if (!config) {
      const error = new Error(`MFE tipo "${mfeType}" no existe en el catálogo`);
      console.error('[MFELoader] ❌', error.message);
      return { success: false, componentName: mfeType, error };
    }

    console.log(`[MFELoader] 📦 Cargando ${config.name}...`);

    try {
      // Construir URL completa
      const moduleUrl = this.buildModuleUrl(config);
      
      // Cargar módulo remoto (con timeout y seguridad)
      const mfeModule = await loadRemoteModule<any>(moduleUrl);

      // Estrategia según tipo
      if (config.type === 'webcomponent') {
        await this.loadWebComponent(config, mfeModule);
      } else {
        await this.loadMountFunction(config, mfeModule, containerOrId);
      }

      this.loadedMFEs.add(mfeType);
      console.log(`[MFELoader] ✅ ${config.name} cargado exitosamente`);

      return { success: true, componentName: config.name };

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`[MFELoader] ❌ Error cargando ${config.name}:`, err);
      return { success: false, componentName: config.name, error: err };
    }
  }

  /**
   * Carga múltiples MFEs en paralelo
   * @param requests - Array de tuplas [mfeType] o [mfeType, container]
   * @returns Promise con array de resultados
   * 
   * @example
   * await mfeLoader.loadMultiple([
   *   ['projects'],                   // Web Component (no container)
   *   ['about', 'about-container']    // Mount function (con container)
   * ]);
   */
  async loadMultiple(
    requests: MFELoadRequest[]
  ): Promise<LoadResult[]> {
    console.log(`[MFELoader] 📦 Cargando ${requests.length} MFEs en paralelo...`);
    
    const promises = requests.map(([mfeType, container]) =>
      this.load(mfeType, container)
    );

    return Promise.all(promises);
  }

  /**
   * Verifica si un MFE ya fue cargado
   */
  isLoaded(mfeType: MFEType): boolean {
    return this.loadedMFEs.has(mfeType);
  }

  /**
   * Remueve loading screen (helper)
   */
  removeLoadingScreen(): void {
    const loadingScreen = document.getElementById('mfe-loading-screen');
    if (loadingScreen) {
      loadingScreen.remove();
      console.log('[MFELoader] ✅ Loading screen removido');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  private buildModuleUrl(config: MFEConfig): string {
    if (this.isProduction) {
      return `${window.location.origin}${config.prodModulePath}`;
    } else {
      return `${config.devServer}${config.devModulePath}`;
    }
  }

  private async loadWebComponent(config: MFEConfig, _module: any): Promise<void> {
    if (!config.tagName) {
      throw new Error(`Web Component "${config.name}" no tiene tagName configurado`);
    }

    // Esperar a que el custom element esté definido (NO timeout arbitrario)
    await customElements.whenDefined(config.tagName);
    
    const element = document.querySelector(config.tagName);
    if (!element) {
      console.warn(
        `[MFELoader] ⚠️ <${config.tagName}> no encontrado en el DOM. ` +
        'El componente está registrado pero no hay instancia en la página.'
      );
    }
  }

  private async loadMountFunction(
    config: MFEConfig,
    mfeModule: any,
    containerOrId?: HTMLElement | string
  ): Promise<void> {
    if (!config.mountFunctionName) {
      throw new Error(`Mount Function "${config.name}" no tiene mountFunctionName configurado`);
    }

    const mountFn = mfeModule[config.mountFunctionName];
    if (typeof mountFn !== 'function') {
      throw new Error(
        `Mount function "${config.mountFunctionName}" no encontrada en módulo ${config.name}`
      );
    }

    // Resolver container
    let container: HTMLElement | null = null;

    if (typeof containerOrId === 'string') {
      container = document.getElementById(containerOrId);
      if (!container) {
        throw new Error(`Container con ID "${containerOrId}" no encontrado`);
      }
    } else if (containerOrId instanceof HTMLElement) {
      container = containerOrId;
    } else {
      throw new Error(`Container requerido para mount function "${config.name}"`);
    }

    // Montar componente
    mountFn(container);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE (exportación por defecto)
// ═══════════════════════════════════════════════════════════════════════════

export const mfeLoader = new MFELoaderService();

// Named export para testing/DI
export { MFELoaderService };
