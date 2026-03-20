import type { EventBus } from './event-bus.js'

/**
  * Context singleton para compartir estado entre microfrontends
 * Reemplaza (window as any).__SHARED_BUS__, __TAB_ID__, __BROADCAST_CHANNEL__
 */
export class MicrofrontendContext<TEvents extends Record<string, unknown> = Record<string, unknown>> {
  private static instance: MicrofrontendContext<any> | null = null

  private readonly bus: EventBus<TEvents>;
  private readonly tabId: string;
  private readonly channel: BroadcastChannel | null;

  private constructor(
    bus: EventBus<TEvents>,
    tabId: string,
    channel: BroadcastChannel | null
  ) {
    this.bus = bus;
    this.tabId = tabId;
    this.channel = channel;
  }

  /**
   * Inicializar contexto (llamar una sola vez desde el shell)
   */
  static initialize<TEvents extends Record<string, unknown>>(config: {
    bus: EventBus<TEvents>
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
  static getInstance<TEvents extends Record<string, unknown> = Record<string, unknown>>(): MicrofrontendContext<TEvents> {
    if (!this.instance) {
      throw new Error('[MFContext] Not initialized. Call MicrofrontendContext.initialize() first')
    }
    return this.instance as MicrofrontendContext<TEvents>
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
export function getMicrofrontendBus<TEvents extends Record<string, unknown> = Record<string, unknown>>(): EventBus<TEvents> {
  // PRIMERO: Intentar window.__SHARED_BUS__ (inicializado por script inline)
  const win = window as any;
  if (win.__SHARED_BUS__) {
    console.log('[MFContext] ✅ Usando bus desde window.__SHARED_BUS__');
    return win.__SHARED_BUS__;
  }

  // SEGUNDO: Intentar contexto MicrofrontendContext
  try {
    const ctx = MicrofrontendContext.getInstance<TEvents>();
    console.log('[MFContext] ✅ Usando bus desde MicrofrontendContext');
    return ctx.getBus();
  } catch {
    // No hay contexto inicializado
    const availableGlobals = {
      __MFE_CONTEXT_INITIALIZED__: win.__MFE_CONTEXT_INITIALIZED__,
      __MFE_CONTEXT_READY__: win.__MFE_CONTEXT_READY__,
      __SHARED_BUS__: !!win.__SHARED_BUS__,
      __TAB_ID__: !!win.__TAB_ID__
    };
    console.error('[MFContext] Estado de variables globales:', availableGlobals);
    throw new Error('[MFContext] Bus not found. Call MicrofrontendContext.initialize() from shell first.');
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
