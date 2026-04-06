export type Handler<T> = (payload: T) => void

export type EventMap = Record<string, unknown>

export interface EventBusOptions {
  maxHandlersPerEvent?: number
  debug?: boolean
}

export class EventBus<Events extends EventMap> {
  private handlers = new Map<keyof Events, Set<Handler<unknown>>>()
  private readonly maxHandlersPerEvent: number
  private readonly debug: boolean

  constructor(options: EventBusOptions = {}) {
    this.maxHandlersPerEvent = options.maxHandlersPerEvent ?? 50
    this.debug = options.debug ?? false
  }

  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    if (typeof handler !== 'function') {
      throw new Error(`[EventBus] Handler must be a function for event "${String(event)}"`)
    }

    const current = this.handlers.get(event) ?? new Set<Handler<unknown>>()

    if (current.size >= this.maxHandlersPerEvent) {
      throw new Error(
        `[EventBus] Max handlers (${this.maxHandlersPerEvent}) exceeded for event "${String(event)}"`
      )
    }

    current.add(handler as Handler<unknown>)
    this.handlers.set(event, current)

    if (this.debug) {
      console.log(`[EventBus] Subscribed to "${String(event)}" (total: ${current.size})`)
    }

    return () => {
      current.delete(handler as Handler<unknown>)
      if (current.size === 0) {
        this.handlers.delete(event)
      }
    }
  }

  off<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
    const current = this.handlers.get(event)
    if (!current) return

    current.delete(handler as Handler<unknown>)
    if (current.size === 0) {
      this.handlers.delete(event)
    }
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const current = this.handlers.get(event)
    if (!current || current.size === 0) return

    current.forEach((handler) => {
      try {
        ;(handler as Handler<Events[K]>)(payload)
      } catch (error) {
        console.error(`[EventBus] Handler error for event "${String(event)}":`, error)
      }
    })
  }

  clear(event?: keyof Events): void {
    if (event) {
      this.handlers.delete(event)
    } else {
      this.handlers.clear()
    }
  }

  listenerCount(event: keyof Events): number {
    return this.handlers.get(event)?.size ?? 0
  }
}
