import type { EventBus } from './event-bus.js'

export class MicrofrontendContext<TEvents extends Record<string, unknown> = Record<string, unknown>> {
  private static instance: MicrofrontendContext<Record<string, unknown>> | null = null

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

  static initialize<TEvents extends Record<string, unknown>>(config: {
    bus: EventBus<TEvents>
    tabId: string
    channel: BroadcastChannel | null
  }): void {
    if (this.instance) {
      return
    }
    this.instance = new this(config.bus, config.tabId, config.channel) as unknown as MicrofrontendContext<Record<string, unknown>>
  }

  static getInstance<TEvents extends Record<string, unknown> = Record<string, unknown>>(): MicrofrontendContext<TEvents> {
    if (!this.instance) {
      throw new Error('[MFContext] Not initialized. Call MicrofrontendContext.initialize() first')
    }
    return this.instance as MicrofrontendContext<TEvents>
  }

  static reset(): void {
    this.instance = null
  }

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

export function getMicrofrontendBus<TEvents extends Record<string, unknown> = Record<string, unknown>>(): EventBus<TEvents> {
  const win = window as unknown as Record<string, unknown>;
  if (win['__SHARED_BUS__']) {
    return win['__SHARED_BUS__'] as EventBus<TEvents>;
  }

  try {
    const ctx = MicrofrontendContext.getInstance<TEvents>();
    return ctx.getBus();
  } catch {
    throw new Error('[MFContext] Bus not found. Call MicrofrontendContext.initialize() from shell first.');
  }
}

export function getMicrofrontendTabId(): string {
  try {
    const ctx = MicrofrontendContext.getInstance()
    return ctx.getTabId()
  } catch {
    const win = window as unknown as Record<string, unknown>
    return (win['__TAB_ID__'] as string) || 'unknown'
  }
}

export function getMicrofrontendChannel(): BroadcastChannel | null {
  try {
    const ctx = MicrofrontendContext.getInstance()
    return ctx.getChannel()
  } catch {
    const win = window as unknown as Record<string, unknown>
    return (win['__BROADCAST_CHANNEL__'] as BroadcastChannel) || null
  }
}
