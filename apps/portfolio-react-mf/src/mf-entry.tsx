import { createRoot, type Root } from 'react-dom/client'
import App from './App'
import type { EventBus } from './lib/event-bus'

type MountContext = {
  title?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bus?: EventBus<any>
}

const roots = new WeakMap<HTMLElement, Root>()

export function mount(container: HTMLElement, context?: MountContext) {
  const root = createRoot(container)
  roots.set(container, root)

  // Si el shell pasa un bus, guardarlo en window
  if (context?.bus) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__SHARED_BUS__ = context.bus
  }

  root.render(<App />)
}

export function unmount(container: HTMLElement) {
  const root = roots.get(container)
  if (!root) {
    return
  }

  root.unmount()
  roots.delete(container)
}
