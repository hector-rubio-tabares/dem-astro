import { createRoot, type Root } from 'react-dom/client'
import '@mf/shared/styles/global.css'
import '@mf/shared/styles/mfe-integration.css'
import './presentation/App.css'
import App from './presentation/App'
import { About } from './presentation/About'
import { MFErrorBoundary } from './ErrorBoundary'
import type { EventBus } from '@mf/shared'

type MountContext = {
  title?: string
  instanceId?: string
  bus?: EventBus<Record<string, unknown>>
}

declare global {
  interface Window {
    __SHARED_BUS__?: EventBus<Record<string, unknown>>;
    __MF_INSTANCES__?: Map<HTMLElement, string>;
  }
}

const roots = new WeakMap<HTMLElement, Root>()

export function mount(container: HTMLElement, context?: MountContext) {
  const root = createRoot(container)
  roots.set(container, root)

  // Si el shell pasa un bus, guardarlo en window
  if (context?.bus) {
    window.__SHARED_BUS__ = context.bus
  }

  // Crear un ID único para esta instancia si no viene del contexto
  const instanceId = context?.instanceId || crypto.randomUUID()
  container.setAttribute('data-instance-id', instanceId)

  // Guardar instanceId en un Map global para que App lo pueda recuperar
  if (!window.__MF_INSTANCES__) {
    window.__MF_INSTANCES__ = new Map()
  }
  window.__MF_INSTANCES__.set(container, instanceId)

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

/**
 * Mount About Component (standalone para portfolio)
 * Uso: mountAbout(document.getElementById('about-container'))
 */
export function mountAbout(container: HTMLElement, context?: MountContext) {
  const root = createRoot(container)
  roots.set(container, root)

  // Si el shell pasa un bus, guardarlo en window
  if (context?.bus) {
    window.__SHARED_BUS__ = context.bus
  }

  root.render(
    <MFErrorBoundary mfName="React MFE - About">
      <About />
    </MFErrorBoundary>
  )
}

/**
 * Unmount About Component
 */
export function unmountAbout(container: HTMLElement) {
  unmount(container)
}

// Export About component for direct usage
export { About } from './presentation/About'
