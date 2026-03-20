/**
 * Strategy Pattern para montar microfrontends
 * Elimina if/else con Map de estrategias
 */

export type MicrofrontendType = 'react' | 'angular' | 'vue' | 'svelte' | 'custom'

export interface MountConfig {
  container: HTMLElement
  module: Record<string, unknown>
  instanceId: string
  index: number
  customElementName?: string
}

/**
 * Estrategia base para montar microfrontends
 */
export interface MountStrategy {
  mount(config: MountConfig): void | Promise<void>
  unmount?(container: HTMLElement): void
}

/**
 * Estrategia para React/Vue (tienen función mount)
 */
class FunctionBasedMountStrategy implements MountStrategy {
  mount(config: MountConfig): void {
    if (typeof config.module.mount !== 'function') {
      throw new Error(`Module does not expose mount() function`)
    }

    // Limpiar contenedor antes de montar
    config.container.innerHTML = ''

    config.module.mount(config.container, {
      instanceId: config.instanceId,
      index: config.index,
    })
  }

  unmount(_container: HTMLElement): void {
    // React/Vue deben implementar su propia limpieza
  }
}

/**
 * Estrategia para Angular (Custom Elements)
 */
class CustomElementMountStrategy implements MountStrategy {
  async mount(config: MountConfig): Promise<void> {
    if (!config.customElementName) {
      throw new Error('customElementName is required for Custom Element strategy')
    }
    
    // Esperar a que el custom element esté definido (con timeout de 10s)
    if (!customElements.get(config.customElementName)) {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout esperando ${config.customElementName}`)), 10000)
      )
      
      await Promise.race([
        customElements.whenDefined(config.customElementName),
        timeout
      ])
    }
    
    // Limpiar contenedor antes de montar
    config.container.innerHTML = ''
    
    const element = document.createElement(config.customElementName)
    element.setAttribute('data-instance-id', config.instanceId)
    config.container.appendChild(element)
  }

  unmount(container: HTMLElement): void {
    container.innerHTML = '' // Limpia el custom element
  }
}

/**
 * Factory de estrategias usando Map (sin if/else)
 */
export class MountStrategyFactory {
  private static readonly strategies = new Map<MicrofrontendType, MountStrategy>([
    ['react', new FunctionBasedMountStrategy()],
    ['vue', new FunctionBasedMountStrategy()],
    ['svelte', new FunctionBasedMountStrategy()],
    ['angular', new CustomElementMountStrategy()],
    ['custom', new CustomElementMountStrategy()],
  ])

  /**
   * Obtener estrategia sin if/else
   */
  static getStrategy(type: MicrofrontendType): MountStrategy {
    const strategy = this.strategies.get(type)
    
    if (!strategy) {
      throw new Error(`No mount strategy found for type: ${type}`)
    }

    return strategy
  }

  /**
   * Registrar nueva estrategia dinámicamente
   */
  static registerStrategy(type: MicrofrontendType, strategy: MountStrategy): void {
    this.strategies.set(type, strategy)
  }
}
