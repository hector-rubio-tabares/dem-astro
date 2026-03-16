type MountableModule = {
  mount?: (container: HTMLElement, context?: Record<string, unknown>) => void
}

export const DEFAULT_MODULE_TIMEOUT_MS = 8000

export function getElementByIdOrThrow(id: string): HTMLElement {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`No existe el contenedor requerido: #${id}`)
  }

  return element
}

export function setStatus(target: HTMLElement | null, message: string, type: 'ok' | 'error') {
  if (!target) {
    return
  }

  target.textContent = message
  target.className = `meta ${type}`
}

export function assertAllowedRemoteOrigin(specifier: string, allowedOrigins: Set<string>) {
  const parsed = new URL(specifier, window.location.origin)
  if (!allowedOrigins.has(parsed.origin)) {
    throw new Error(`Origen remoto no autorizado: ${parsed.origin}`)
  }
}

export async function importRemoteWithTimeout<T = unknown>(
  specifier: string,
  allowedOrigins: Set<string>,
  timeoutMs = DEFAULT_MODULE_TIMEOUT_MS,
): Promise<T> {
  assertAllowedRemoteOrigin(specifier, allowedOrigins)

  return await Promise.race([
    import(/* @vite-ignore */ specifier) as Promise<T>,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout cargando modulo remoto: ${specifier}`))
      }, timeoutMs)
    }),
  ])
}

export function ensureMountContract(module: MountableModule, container: HTMLElement) {
  if (typeof module.mount !== 'function') {
    throw new Error('El modulo remoto no expone mount(container, context).')
  }

  module.mount(container)
}
