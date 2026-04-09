import {
  loadRemoteModule,
  assertAllowedOrigin,
  DEFAULT_TIMEOUT_MS,
  assertMountContract,
} from '@mf/shared';

type MountableModule = {
  mount: (container: HTMLElement, context?: Record<string, unknown>) => void
}

export const DEFAULT_MODULE_TIMEOUT_MS = DEFAULT_TIMEOUT_MS;

export function getElementByIdOrThrow(id: string): HTMLElement {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Container not found: #${id}`)
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
  assertAllowedOrigin(specifier, allowedOrigins);
}

export async function importRemoteWithTimeout<T = unknown>(
  specifier: string,
  allowedOrigins: Set<string>,
  timeoutMs = DEFAULT_MODULE_TIMEOUT_MS,
): Promise<T> {
  return loadRemoteModule<T>(specifier, {
    timeout: timeoutMs,
    allowedOrigins,
  });
}

export function ensureMountContract(module: MountableModule, container: HTMLElement) {
  assertMountContract(module as Record<string, unknown>);
  module.mount(container)
}
