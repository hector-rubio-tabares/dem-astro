export type Handler<T> = (payload: T) => void

export type EventMap = Record<string, unknown>

export interface EventBusOptions {
  /** Maximum handlers per event to prevent memory leaks */
  maxHandlersPerEvent?: number
  /** Enable debug logging */
  debug?: boolean
}

/**
 * Type-safe event bus for pub-sub communication between microfrontends
 * @template Events - Event map defining event names and their payload types
 */
export class EventBus<Events extends EventMap> {
  private handlers = new Map<keyof Events, Set<Handler<unknown>>>()
  private readonly maxHandlersPerEvent: number
  private readonly debug: boolean

  constructor(options: EventBusOptions = {}) {
    this.maxHandlersPerEvent = options.maxHandlersPerEvent ?? 50
    this.debug = options.debug ?? false
  }

  /**
   * Subscribe to an event
   */
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
      console.log(`[EventBus] Handler registered for "${String(event)}" (total: ${current.size})`)
    }

    return () => {
      current.delete(handler as Handler<unknown>)
      if (current.size === 0) {
        this.handlers.delete(event)
      }
    }
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
    const current = this.handlers.get(event)
    if (!current) return

    current.delete(handler as Handler<unknown>)
    if (current.size === 0) {
      this.handlers.delete(event)
    }

    if (this.debug) {
      console.log(`[EventBus] Handler removed for "${String(event)}" (remaining: ${current.size})`)
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const current = this.handlers.get(event)
    if (!current || current.size === 0) {
      if (this.debug) {
        console.log(`[EventBus] No handlers for "${String(event)}"`)
      }
      return
    }

    if (this.debug) {
      console.log(`[EventBus] Emitting "${String(event)}" to ${current.size} handlers`, payload)
    }

    current.forEach((handler) => {
      try {
        ;(handler as Handler<Events[K]>)(payload)
      } catch (error) {
        console.error(`[EventBus] Handler error for event "${String(event)}":`, error)
      }
    })
  }

  /**
   * Remove all handlers
   */
  clear(event?: keyof Events): void {
    if (event) {
      this.handlers.delete(event)
    } else {
      this.handlers.clear()
    }
  }

  /**
   * Get handler count
   */
  listenerCount(event: keyof Events): number {
    return this.handlers.get(event)?.size ?? 0
  }
}
