/**
 * Servicio genérico para cargar microfrontends
 * Ahora usa @mf/shared para eliminar duplicación y usar Strategy Pattern
 * 
 * ✅ Refactorizado para usar remote-module-loader.ts (DRY principle)
 */
import { loadRemoteModule, DEFAULT_TIMEOUT_MS } from '@mf/shared';
import { MountStrategyFactory, MicrofrontendContext, type MicrofrontendType, type MicroFrontendEvents } from '@mf/shared'

export type { MicrofrontendType }

export interface MicrofrontendConfig {
  type: MicrofrontendType
  selector: string
  moduleUrl: string
  allowedOrigins: Set<string>
  timeoutMs?: number
  customElementName?: string
  mountFn?: (module: Record<string, unknown>, container: HTMLElement, instanceId: string, index: number) => void
}

/**
 * Carga un microfrontend en todos los slots que coincidan con el selector
 */
export async function loadMicrofrontend(
  config: MicrofrontendConfig
): Promise<number> {
  const slots = document.querySelectorAll<HTMLElement>(config.selector)

  if (slots.length === 0) {
    return 0
  }

  injectGlobalContext()

  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS

  try {
    const remoteModule = await loadRemoteModule(
      config.moduleUrl,
      {
        timeout: timeoutMs,
        allowedOrigins: config.allowedOrigins
      }
    );

    // Obtener estrategia desde Map (sin if/else)
    const strategy = MountStrategyFactory.getStrategy(config.type)

    // Montar en cada slot en paralelo (sin await en loop)
    const mountPromises = Array.from(slots).map((slot, index) => {
      const instanceId = crypto.randomUUID()

      return Promise.resolve(
        strategy.mount({
          container: slot,
          module: remoteModule as Record<string, unknown>,
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
    return mountedCount
  } catch (error) {
    console.error(`[MF-Loader] Error cargando ${config.type}:`, error instanceof Error ? error.message : error)
    throw error
  }
}

/**
 * Inyectar contexto global para backward compatibility
 * Los MFs aún pueden usar window.__SHARED_BUS__ si no usan @mf/shared
 */
function injectGlobalContext() {
  const ctx = MicrofrontendContext.getInstance<MicroFrontendEvents>()

  if (!window.__SHARED_BUS__) {
    window.__SHARED_BUS__ = ctx.getBus()
  }

  if (!window.__TAB_ID__) {
    window.__TAB_ID__ = ctx.getTabId()
  }

  if (!window.__BROADCAST_CHANNEL__) {
    window.__BROADCAST_CHANNEL__ = ctx.getChannel() ?? undefined
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
      const reason = result.reason instanceof Error ? result.reason.message : result.reason
      console.error(`[MF-Loader] Falló carga de ${type}:`, reason)
      summary.set(type, 0)
    }
  })

  return summary
}
