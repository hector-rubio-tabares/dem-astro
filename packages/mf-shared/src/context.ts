import type { EventBus } from './event-bus.js'

/**
  * Context singleton para compartir estado entre microfrontends
 * Reemplaza (window as any).__SHARED_BUS__, __TAB_ID__, __BROADCAST_CHANNEL__
 */
export class MicrofrontendContext {
  private static instance: MicrofrontendContext | null = null

  private constructor(
    private readonly bus: EventBus<any>,
    private readonly tabId: string,
    private readonly channel: BroadcastChannel | null
  ) {}

  /**
   * Inicializar contexto (llamar una sola vez desde el shell)
   */
  static initialize(config: {
    bus: EventBus<any>
    tabId: string
    channel: BroadcastChannel | null
  }): void {
    if (this.instance) {
      console.warn('[MFContext] Already initialized, skipping')
      return
    }
    this.instance = new this(config.bus, config.tabId, config.channel)
  }

  /**
   * Obtener instancia del contexto
   */
  static getInstance(): MicrofrontendContext {
    if (!this.instance) {
      throw new Error('[MFContext] Not initialized. Call MicrofrontendContext.initialize() first')
    }
    return this.instance
  }

  /**
   * Reset para testing
   */
  static reset(): void {
    this.instance = null
  }

  // Getters
  getBus() {
    return this.bus
  }

  getTabId() {
    return this.tabId
  }

  getChannel() {
    return this.channel
  }
}

/**
 * Helper para usar en microfrontends
 * Retorna el bus compartido, con fallback a window.__SHARED_BUS__
 */
export function getMicrofrontendBus(): EventBus<any> {
  try {
    const ctx = MicrofrontendContext.getInstance()
    return ctx.getBus()
  } catch {
    // Fallback: usar window.__SHARED_BUS__ si el contexto no está inicializado
    const win = window as any
    if (win.__SHARED_BUS__) {
      return win.__SHARED_BUS__
    }
    throw new Error('[MFContext] Bus not found. Call MicrofrontendContext.initialize() from shell first.')
  }
}

export function getMicrofrontendTabId(): string {
  try {
    const ctx = MicrofrontendContext.getInstance()
    return ctx.getTabId()
  } catch {
    // Fallback: usar window.__TAB_ID__
    const win = window as any
    return win.__TAB_ID__ || 'unknown'
  }
}

export function getMicrofrontendChannel(): BroadcastChannel | null {
  try {
    const ctx = MicrofrontendContext.getInstance()
    return ctx.getChannel()
  } catch {
    // Fallback: usar window.__BROADCAST_CHANNEL__
    const win = window as any
    return win.__BROADCAST_CHANNEL__ || null
  }
}
