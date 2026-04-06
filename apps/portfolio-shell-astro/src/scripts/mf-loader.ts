/**
 * Servicio genérico para cargar microfrontends
 * Ahora usa @mf/shared para eliminar duplicación y usar Strategy Pattern
 * 
 * ✅ Refactorizado para usar remote-module-loader.ts (DRY principle)
 */
import { loadRemoteModule, DEFAULT_TIMEOUT_MS } from '@mf/shared';
import { MountStrategyFactory, MicrofrontendContext, type MicrofrontendType } from '@mf/shared'

export type { MicrofrontendType }

export interface MicrofrontendConfig {
  type: MicrofrontendType
  selector: string
  moduleUrl: string
  allowedOrigins: Set<string>
  timeoutMs?: number
  customElementName?: string
  mountFn?: (module: any, container: HTMLElement, instanceId: string, index: number) => void
}

/**
 * Carga un microfrontend en todos los slots que coincidan con el selector
 */
export async function loadMicrofrontend(
  config: MicrofrontendConfig
): Promise<number> {
  console.log(`[MF-Loader] Intentando cargar ${config.type} desde ${config.moduleUrl}`)
  
  const slots = document.querySelectorAll<HTMLElement>(config.selector)

  if (slots.length === 0) {
    console.warn(`[MF-Loader] No se encontraron slots para: ${config.selector}`)
    return 0
  }

  console.log(`[MF-Loader] Encontrados ${slots.length} slots para ${config.type}`)

  // Inyectar contexto global ANTES de cargar el módulo (para backward compatibility con window.)
  injectGlobalContext()

  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS

  try {
    console.log(`[MF-Loader] Importando módulo ${config.type}...`)
    
    // ✅ Usar utilidad compartida (no duplicada)
    const remoteModule = await loadRemoteModule(
      config.moduleUrl,
      {
        timeout: timeoutMs,
        allowedOrigins: config.allowedOrigins
      }
    );
    console.log(`[MF-Loader] Módulo ${config.type} importado exitosamente`, remoteModule)

    // Obtener estrategia desde Map (sin if/else)
    const strategy = MountStrategyFactory.getStrategy(config.type)

    // Montar en cada slot en paralelo (sin await en loop)
    const mountPromises = Array.from(slots).map((slot, index) => {
      const instanceId = crypto.randomUUID()

      return Promise.resolve(
        strategy.mount({
          container: slot,
          module: remoteModule,
          instanceId,
          index,
          customElementName: config.customElementName,
        })
      ).catch((error: unknown) => {
        console.error(`[MF-Loader] Error montando instancia ${index + 1}:`, error)
        return null; // Retornar null en caso de error para contar fallidos
      })
    })

    // Esperar a que todas las instancias se monten en paralelo
    const mountResults = await Promise.allSettled(mountPromises)
    const mountedCount = mountResults.filter(r => r.status === 'fulfilled' && r.value !== null).length

    console.log(`[MF-Loader] ✅ ${mountedCount}/${slots.length} instancias montadas: ${config.type}`)
    return mountedCount
  } catch (error) {
    console.error(`[MF-Loader] ❌ Error cargando ${config.type}:`, error)
    // Log del stack trace completo
    if (error instanceof Error) {
      console.error(`[MF-Loader] Stack:`, error.stack)
    }
    throw error
  }
}

/**
 * Inyectar contexto global para backward compatibility
 * Los MFs aún pueden usar window.__SHARED_BUS__ si no usan @mf/shared
 */
function injectGlobalContext() {
  const win = window as any
  const ctx = MicrofrontendContext.getInstance()

  if (!win.__SHARED_BUS__) {
    win.__SHARED_BUS__ = ctx.getBus()
  }

  if (!win.__TAB_ID__) {
    win.__TAB_ID__ = ctx.getTabId()
  }

  if (!win.__BROADCAST_CHANNEL__) {
    win.__BROADCAST_CHANNEL__ = ctx.getChannel()
  }
}

/**
 * Cargar múltiples microfrontends en paralelo
 */
export async function loadMultipleMicrofrontends(
  configs: MicrofrontendConfig[]
): Promise<Map<MicrofrontendType, number>> {
  const results = await Promise.allSettled(
    configs.map(config => loadMicrofrontend(config))
  )

  const summary = new Map<MicrofrontendType, number>()

  results.forEach((result, index) => {
    const type = configs[index].type
    if (result.status === 'fulfilled') {
      summary.set(type, result.value)
      console.log(`[MF-Loader] ✅ ${type} cargado: ${result.value} instancias`)
    } else {
      console.error(`[MF-Loader] ❌ Falló carga de ${type}:`, result.reason)
      if (result.reason instanceof Error) {
        console.error(`[MF-Loader] Error message: ${result.reason.message}`)
        console.error(`[MF-Loader] Error stack:`, result.reason.stack)
      }
      summary.set(type, 0)
    }
  })

  return summary
}
