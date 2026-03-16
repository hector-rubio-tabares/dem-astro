type EventHandler<T = any> = (payload: T) => void

export class EventBus<Events extends Record<string, any>> {
  private handlers: Map<keyof Events, Set<EventHandler>>

  constructor() {
    this.handlers = new Map()
  }

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }

  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>) {
    const eventHandlers = this.handlers.get(event)
    if (eventHandlers) {
      eventHandlers.delete(handler)
    }
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    const eventHandlers = this.handlers.get(event)
    if (eventHandlers) {
      eventHandlers.forEach((handler) => handler(payload))
    }
  }

  clear() {
    this.handlers.clear()
  }
}
