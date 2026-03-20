/**
 * SHARED UTILITY - Remote Module Loader
 * Carga dinámica de módulos remotos con timeout y validación de seguridad
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo carga módulos remotos
 * - Open/Closed: Extensible para nuevos tipos de validación
 * 
 * Uso compartido por:
 * - MFELoaderService (@mf/shared)
 * - index.astro (páginas específicas)
 * - ModuleFederationLoader (arquitectura hexagonal)
 */

export const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Validar que el origen del módulo remoto esté en la whitelist
 * Security Layer: Previene XSS via module imports desde orígenes no autorizados
 * 
 * @throws Error si el origen no está permitido
 */
export function assertAllowedOrigin(url: string, allowedOrigins: Set<string>): void {
  const parsed = new URL(url, window.location.origin);
  
  if (!allowedOrigins.has(parsed.origin)) {
    throw new Error(
      `[RemoteLoader] ❌ Origen no autorizado: ${parsed.origin}. ` +
      `Permitidos: ${Array.from(allowedOrigins).join(', ')}`
    );
  }
}

/**
 * Cargar módulo remoto con timeout de seguridad
 * Patrón: Promise.race para prevenir hangs infinitos
 * 
 * @param url - URL absoluta o relativa del módulo
 * @param options - Configuración opcional (timeout, orígenes permitidos)
 * @returns Módulo cargado con tipo genérico
 * 
 * @example
 * ```typescript
 * // Carga sin validación de origen (desarrollo local)
 * const module = await loadRemoteModule<ReactMFE>('http://localhost:5173/src/mf-entry.tsx');
 * 
 * // Carga con validación de origen (producción)
 * const module = await loadRemoteModule<AngularMFE>(
 *   'https://cdn.example.com/angular-mf.js',
 *   { 
 *     allowedOrigins: new Set(['https://cdn.example.com']),
 *     timeout: 10000 
 *   }
 * );
 * ```
 */
export async function loadRemoteModule<T = any>(
  url: string,
  options?: {
    timeout?: number;
    allowedOrigins?: Set<string>;
  }
): Promise<T> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS;
  
  // Security validation (opcional, solo si se proveen orígenes permitidos)
  if (options?.allowedOrigins && options.allowedOrigins.size > 0) {
    assertAllowedOrigin(url, options.allowedOrigins);
  }

  console.log(`[RemoteLoader] 📦 Cargando: ${url} (timeout: ${timeout}ms)`);

  try {
    const module = await Promise.race<T>([
      import(/* @vite-ignore */ url) as Promise<T>,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`[RemoteLoader] ⏱️ Timeout cargando: ${url}`)),
          timeout
        )
      ),
    ]);

    console.log(`[RemoteLoader] ✅ Módulo cargado: ${url}`);
    return module;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[RemoteLoader] ❌ Error cargando ${url}:`, message);
    throw error;
  }
}

/**
 * Verificar que un módulo cumpla con el contrato de montaje
 * Pattern: Guard Clause
 * 
 * @throws Error si el módulo no tiene función mount
 */
export function assertMountContract(module: any, methodName = 'mount'): void {
  if (typeof module[methodName] !== 'function') {
    throw new Error(
      `[RemoteLoader] ❌ Módulo no cumple contrato: falta método '${methodName}'`
    );
  }
}
