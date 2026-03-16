import { createRoot, type Root } from 'react-dom/client'
import App from './App'
import { MFErrorBoundary } from './ErrorBoundary'
import type { EventBus } from '@mf/shared'

type MountContext = {
  title?: string
  instanceId?: string
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

  // Crear un ID único para esta instancia si no viene del contexto
  const instanceId = context?.instanceId || crypto.randomUUID()
  container.setAttribute('data-instance-id', instanceId)

  // Guardar instanceId en un Map global para que App lo pueda recuperar
  if (!(window as any).__MF_INSTANCES__) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__MF_INSTANCES__ = new Map()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__MF_INSTANCES__.set(container, instanceId)

  root.render(
    <MFErrorBoundary mfName="React MF">
      <App container={container} />
    </MFErrorBoundary>
  )
}

export function unmount(container: HTMLElement) {
  const root = roots.get(container)
  if (!root) {
    return
  }

  root.unmount()
  roots.delete(container)
}
