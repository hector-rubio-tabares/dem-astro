/**
 * Servicio genérico para cargar microfrontends
 * Ahora usa @mf/shared para eliminar duplicación y usar Strategy Pattern
 */
import { importRemoteWithTimeout, DEFAULT_MODULE_TIMEOUT_MS } from './mf-runtime'
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
  const slots = document.querySelectorAll<HTMLElement>(config.selector)

  if (slots.length === 0) {
    console.warn(`[MF-Loader] No se encontraron slots para: ${config.selector}`)
    return 0
  }

  // Inyectar contexto global ANTES de cargar el módulo (para backward compatibility con window.)
  injectGlobalContext()

  const timeoutMs = config.timeoutMs ?? DEFAULT_MODULE_TIMEOUT_MS

  try {
    // Importar el módulo remoto
    const remoteModule = await importRemoteWithTimeout(
      config.moduleUrl,
      config.allowedOrigins,
      timeoutMs
    )

    // Obtener estrategia desde Map (sin if/else)
    const strategy = MountStrategyFactory.getStrategy(config.type)

    // Montar en cada slot encontrado
    let mountedCount = 0
    for (let index = 0; index < slots.length; index++) {
      const slot = slots[index]
      const instanceId = crypto.randomUUID()

      try {
        await strategy.mount({
          container: slot,
          module: remoteModule,
          instanceId,
          index,
          customElementName: config.customElementName,
        })
        mountedCount++
      } catch (error) {
        console.error(`[MF-Loader] Error montando instancia ${index + 1}:`, error)
      }
    }

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
    } else {
      console.error(`[MF-Loader] Falló carga de ${type}:`, result.reason)
      summary.set(type, 0)
    }
  })

  return summary
}
