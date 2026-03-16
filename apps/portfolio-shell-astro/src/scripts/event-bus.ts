type Handler<T> = (payload: T) => void

type EventMap = Record<string, unknown>

export class EventBus<Events extends EventMap> {
  private handlers = new Map<keyof Events, Set<Handler<unknown>>>()

  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>) {
    const current = this.handlers.get(event) ?? new Set<Handler<unknown>>()
    current.add(handler as Handler<unknown>)
    this.handlers.set(event, current)

    return () => {
      current.delete(handler as Handler<unknown>)
      if (current.size === 0) {
        this.handlers.delete(event)
      }
    }
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    const current = this.handlers.get(event)
    if (!current) {
      return
    }

    current.forEach((handler) => {
      ;(handler as Handler<Events[K]>)(payload)
    })
  }
}
