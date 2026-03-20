/**
 * DEPRECATED: Este archivo se mantiene por backward compatibility
 * 
 * ⚠️ MIGRACIÓN: Usar remote-module-loader.ts directamente
 * 
 * - importRemoteWithTimeout → loadRemoteModule (remote-module-loader.ts)
 * - assertAllowedRemoteOrigin → assertAllowedOrigin (remote-module-loader.ts)
 * - DEFAULT_MODULE_TIMEOUT_MS → DEFAULT_TIMEOUT_MS (remote-module-loader.ts)
 */

import { 
  loadRemoteModule, 
  assertAllowedOrigin, 
  DEFAULT_TIMEOUT_MS,
  assertMountContract as assertMountContractNew
} from '@mf/shared';

type MountableModule = {
  mount?: (container: HTMLElement, context?: Record<string, unknown>) => void
}

/** @deprecated Usar DEFAULT_TIMEOUT_MS de remote-module-loader.ts */
export const DEFAULT_MODULE_TIMEOUT_MS = DEFAULT_TIMEOUT_MS;

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

/**
 * @deprecated Usar assertAllowedOrigin de remote-module-loader.ts
 * Wrapper para backward compatibility
 */
export function assertAllowedRemoteOrigin(specifier: string, allowedOrigins: Set<string>) {
  console.log(`[MF-Runtime] Validando origen: ${specifier}`);
  console.log(`[MF-Runtime] Orígenes permitidos:`, Array.from(allowedOrigins));
  
  assertAllowedOrigin(specifier, allowedOrigins);
  
  console.log(`[MF-Runtime] Origen validado correctamente`);
}

/**
 * @deprecated Usar loadRemoteModule de remote-module-loader.ts
 * Wrapper para backward compatibility
 */
export async function importRemoteWithTimeout<T = unknown>(
  specifier: string,
  allowedOrigins: Set<string>,
  timeoutMs = DEFAULT_MODULE_TIMEOUT_MS,
): Promise<T> {
  console.log(`[MF-Runtime] Importando: ${specifier} (timeout: ${timeoutMs}ms)`);
  
  // Delegar a la implementación compartida
  return loadRemoteModule<T>(specifier, { 
    timeout: timeoutMs,
    allowedOrigins 
  });
}

export function ensureMountContract(module: MountableModule, container: HTMLElement) {
  if (typeof module.mount !== 'function') {
    throw new Error('El modulo remoto no expone mount(container, context).')
  }

  module.mount(container)
}
