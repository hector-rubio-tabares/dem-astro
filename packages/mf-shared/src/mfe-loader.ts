import { loadRemoteModule } from './remote-module-loader';

export type MFEType = 'projects' | 'projects-full' | 'about' | 'contact' | 'angular-demo' | 'react-demo';

export interface MFEConfig {
  readonly name: string;
  readonly type: 'webcomponent' | 'mount-function';
  readonly server: 'react' | 'angular';
  readonly tagName?: string;
  readonly mountFunctionName?: string;
}

export interface LoadResult {
  success: boolean;
  componentName: string;
  error?: Error;
}

export type MFELoadRequest =
  | [MFEType]
  | [MFEType, HTMLElement | string];

const MFE_CATALOG: Record<MFEType, MFEConfig> = {
  projects: {
    name: 'Projects (Angular)',
    type: 'webcomponent',
    server: 'angular',
    tagName: 'portfolio-projects',
  },
  'projects-full': {
    name: 'Projects Full (Angular)',
    type: 'webcomponent',
    server: 'angular',
    tagName: 'portfolio-projects-full',
  },
  about: {
    name: 'About (React)',
    type: 'mount-function',
    server: 'react',
    mountFunctionName: 'mountAbout',
  },
  contact: {
    name: 'Contact (React)',
    type: 'mount-function',
    server: 'react',
    mountFunctionName: 'mountContact',
  },
  'angular-demo': {
    name: 'Angular Demo',
    type: 'webcomponent',
    server: 'angular',
    tagName: 'portfolio-angular-mf',
  },
  'react-demo': {
    name: 'React Demo',
    type: 'mount-function',
    server: 'react',
    mountFunctionName: 'mount',
  },
};

class MFELoaderService {
  private loadedMFEs: Set<MFEType> = new Set();

  async load(
    mfeType: MFEType,
    containerOrId?: HTMLElement | string
  ): Promise<LoadResult> {
    const config = MFE_CATALOG[mfeType];

    if (!config) {
      const error = new Error(`MFE type "${mfeType}" not found in catalog`);
      return { success: false, componentName: mfeType, error };
    }

    try {
      const moduleUrl = this.buildModuleUrl(config);
      const mfeModule = await loadRemoteModule<Record<string, unknown>>(moduleUrl);

      if (config.type === 'webcomponent') {
        await this.loadWebComponent(config, mfeModule, containerOrId);
      } else {
        await this.loadMountFunction(config, mfeModule, containerOrId);
      }

      this.loadedMFEs.add(mfeType);

      return { success: true, componentName: config.name };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { success: false, componentName: config.name, error: err };
    }
  }

  async loadMultiple(requests: MFELoadRequest[]): Promise<LoadResult[]> {
    const promises = requests.map(([mfeType, container]) =>
      this.load(mfeType, container)
    );

    return Promise.all(promises);
  }

  isLoaded(mfeType: MFEType): boolean {
    return this.loadedMFEs.has(mfeType);
  }

  removeLoadingScreen(): void {
    const loadingScreen = document.getElementById('mfe-loading-screen');
    if (loadingScreen) {
      loadingScreen.remove();
    }
  }

  private buildModuleUrl(config: MFEConfig): string {
    const w = typeof window !== 'undefined'
      ? (window as unknown as Record<string, unknown>)
      : {} as Record<string, unknown>;
    const url: unknown = config.server === 'angular'
      ? w['__MFE_ANGULAR_URL__']
      : w['__MFE_REACT_URL__'];

    if (typeof url !== 'string' || url.length === 0) {
      throw new Error(
        `[MFELoader] URL no configurada para "${config.name}". ` +
        `Revisa PUBLIC_${config.server.toUpperCase()}_MF_URL en el .env.`
      );
    }

    return url;
  }

  private async loadWebComponent(
    config: MFEConfig,
    _module: Record<string, unknown>,
    containerOrId?: HTMLElement | string
  ): Promise<void> {
    if (!config.tagName) {
      throw new Error(`Web Component "${config.name}" has no tagName configured`);
    }

    await customElements.whenDefined(config.tagName);

    let container: HTMLElement | null = null;
    if (typeof containerOrId === 'string') {
      container = document.getElementById(containerOrId);
    } else if (containerOrId instanceof HTMLElement) {
      container = containerOrId;
    }

    if (!container) {
      throw new Error(`[MFELoader] Container not found for web component "${config.tagName}"`);
    }

    const element = document.createElement(config.tagName);
    container.replaceChildren(element);
  }

  private async loadMountFunction(
    config: MFEConfig,
    mfeModule: Record<string, unknown>,
    containerOrId?: HTMLElement | string
  ): Promise<void> {
    if (!config.mountFunctionName) {
      throw new Error(`Mount Function "${config.name}" has no mountFunctionName configured`);
    }

    const mountFn = mfeModule[config.mountFunctionName];
    if (typeof mountFn !== 'function') {
      throw new Error(
        `Mount function "${config.mountFunctionName}" not found in module ${config.name}`
      );
    }

    let container: HTMLElement | null = null;

    if (typeof containerOrId === 'string') {
      container = document.getElementById(containerOrId);
      if (!container) {
        throw new Error(`Container with ID "${containerOrId}" not found`);
      }
    } else if (containerOrId instanceof HTMLElement) {
      container = containerOrId;
    } else {
      throw new Error(`Container required for mount function "${config.name}"`);
    }

    (mountFn as (el: HTMLElement) => void)(container);
  }
}

export const mfeLoader = new MFELoaderService();
export { MFELoaderService };
