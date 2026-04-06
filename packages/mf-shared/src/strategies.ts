export type MicrofrontendType = 'react' | 'angular' | 'vue' | 'svelte' | 'custom'

export interface MountConfig {
  container: HTMLElement
  module: Record<string, unknown>
  instanceId: string
  index: number
  customElementName?: string
}

export interface MountStrategy {
  mount(config: MountConfig): void | Promise<void>
  unmount?(container: HTMLElement): void
}

class FunctionBasedMountStrategy implements MountStrategy {
  mount(config: MountConfig): void {
    if (typeof config.module['mount'] !== 'function') {
      throw new Error(`Module does not expose mount() function`)
    }

    config.container.innerHTML = ''

    ;(config.module['mount'] as (container: HTMLElement, ctx: Record<string, unknown>) => void)(
      config.container,
      { instanceId: config.instanceId, index: config.index }
    )
  }

  unmount(_container: HTMLElement): void {}
}

class CustomElementMountStrategy implements MountStrategy {
  async mount(config: MountConfig): Promise<void> {
    if (!config.customElementName) {
      throw new Error('customElementName is required for Custom Element strategy')
    }

    if (!customElements.get(config.customElementName)) {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout esperando ${config.customElementName}`)), 10000)
      )

      await Promise.race([
        customElements.whenDefined(config.customElementName),
        timeout,
      ])
    }

    config.container.innerHTML = ''

    const element = document.createElement(config.customElementName)
    element.setAttribute('data-instance-id', config.instanceId)
    config.container.appendChild(element)
  }

  unmount(container: HTMLElement): void {
    container.innerHTML = ''
  }
}

export class MountStrategyFactory {
  private static readonly strategies = new Map<MicrofrontendType, MountStrategy>([
    ['react', new FunctionBasedMountStrategy()],
    ['vue', new FunctionBasedMountStrategy()],
    ['svelte', new FunctionBasedMountStrategy()],
    ['angular', new CustomElementMountStrategy()],
    ['custom', new CustomElementMountStrategy()],
  ])

  static getStrategy(type: MicrofrontendType): MountStrategy {
    const strategy = this.strategies.get(type)

    if (!strategy) {
      throw new Error(`No mount strategy found for type: ${type}`)
    }

    return strategy
  }

  static registerStrategy(type: MicrofrontendType, strategy: MountStrategy): void {
    this.strategies.set(type, strategy)
  }
}
