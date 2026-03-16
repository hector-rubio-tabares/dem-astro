import {
  setStatus,
  DEFAULT_MODULE_TIMEOUT_MS,
} from './mf-runtime'
import { 
  EventBus,
  MicrofrontendContext,
  validateTabMessage,
  validateMultiTabMessage,
  sanitizeDisplayString,
  MF_CONFIG,
  type TabMessage,
  type MultiTabMessage,
  type MicroFrontendEvents,
} from '@mf/shared'
import { loadMultipleMicrofrontends, type MicrofrontendConfig } from './mf-loader'

// Detectar modo automáticamente
const IS_PRODUCTION = import.meta.env.PROD
const IS_DEV = import.meta.env.DEV

// URLs de microfrontends según el modo
const REACT_SERVER = IS_PRODUCTION
  ? window.location.origin  // Prod: mismo origin
  : import.meta.env.PUBLIC_REACT_MF_DEV_URL || 'http://127.0.0.1:5173'

const ANGULAR_SERVER = IS_PRODUCTION
  ? window.location.origin  // Prod: mismo origin
  : import.meta.env.PUBLIC_ANGULAR_MF_DEV_URL || 'http://127.0.0.1:4201'

// Rutas de módulos según el modo
const REACT_MODULE_URL = IS_PRODUCTION
  ? '/mf/react/react-mf.js'       // Prod: bundle local
  : '/src/mf-entry.tsx'            // Dev: dev server

const ANGULAR_MODULE_URL = IS_PRODUCTION
  ? '/mf/angular/main.js'          // Prod: bundle local
  : '/main.js'                      // Dev: dev server

const allowedOriginsCsv: string = IS_PRODUCTION
  ? window.location.origin
  : import.meta.env.PUBLIC_ALLOWED_REMOTE_ORIGINS || `${REACT_SERVER},${ANGULAR_SERVER}`

const allowedOriginsList: string[] = allowedOriginsCsv
  .split(',')
  .map((item: string) => item.trim())
  .filter((item: string) => item.length > 0)

const ALLOWED_REMOTE_ORIGINS = new Set<string>(allowedOriginsList)
const MODULE_TIMEOUT_MS = Number(import.meta.env.PUBLIC_MF_MODULE_TIMEOUT_MS || DEFAULT_MODULE_TIMEOUT_MS)

// Bus COMPARTIDO para comunicación entre microfrontends (React, Angular, Astro)
const sharedBus = new EventBus<MicroFrontendEvents>()

// ID único para esta tab/ventana
const TAB_ID = crypto.randomUUID()

async function checkEndpoint(label: 'react' | 'angular', url: string) {
  // Solo hacer health checks en modo desarrollo
  if (IS_PRODUCTION) {
    return
  }

  const badgeId = label === 'react' ? 'react-health' : 'angular-health'
  const badge = document.getElementById(badgeId)

  if (!badge) {
    return
  }

  try {
    await fetch(url, { method: 'GET', mode: 'cors' })
    badge.textContent = 'responde'
    badge.className = 'status-badge ok'
  } catch {
    badge.textContent = 'no responde'
    badge.className = 'status-badge error'
  }
}

// Configuración universal (funciona en dev y prod)
const microfrontendConfigs: MicrofrontendConfig[] = [
  {
    type: 'react',
    selector: '.mf-slot[data-mf="react"]',
    moduleUrl: `${REACT_SERVER}${REACT_MODULE_URL}`,
    allowedOrigins: ALLOWED_REMOTE_ORIGINS,
    timeoutMs: MODULE_TIMEOUT_MS,
  },
  {
    type: 'angular',
    selector: '.mf-slot[data-mf="angular"]',
    moduleUrl: `${ANGULAR_SERVER}${ANGULAR_MODULE_URL}`,
    allowedOrigins: ALLOWED_REMOTE_ORIGINS,
    timeoutMs: MODULE_TIMEOUT_MS,
    customElementName: 'portfolio-angular-mf',
  },
]

function setupAstroControls(channel: BroadcastChannel | null) {
  // Configurar cada instancia de Astro de forma independiente
  const astroInstances = document.querySelectorAll('.astro-control-instance')
  
  astroInstances.forEach((instance) => {
    const container = instance as HTMLElement
    const instanceId = crypto.randomUUID()
    let astroClicks = 0
    const messages: any[] = []

    const clicksEl = container.querySelector('.astro-clicks')
    const messagesContainer = container.querySelector('.astro-messages')  
    const messagesList = container.querySelector('.astro-messages-list')
    
    const incrementBtn = container.querySelector('.astro-increment')
    const sendTabBtn = container.querySelector('.astro-send-tab')
    const sendMultiTabBtn = container.querySelector('.astro-send-multitab')

    const updateUI = () => {
      if (clicksEl) clicksEl.textContent = String(astroClicks)

      if (messages.length > 0 && messagesContainer) {
        ;(messagesContainer as HTMLElement).style.display = 'block'
        if (messagesList) {
          messagesList.innerHTML = messages
            .slice(-MF_CONFIG.MAX_MESSAGES_IN_LOG)
            .reverse()
            .map(msg => `
              <li>
                <strong>${msg.scope}</strong> de <em class="${msg.from}">${msg.from}</em>: count=${msg.count} (${msg.timestamp})
              </li>
            `)
            .join('')
        }
      }
    }

    // Incrementar contador local
    incrementBtn?.addEventListener('click', () => {
      astroClicks++
      updateUI()
    })

    // Enviar a tab via EventBus compartido
    sendTabBtn?.addEventListener('click', () => {
      try {
        const payload: TabMessage = { source: 'astro', count: astroClicks, instanceId }
        validateTabMessage(payload)
        sharedBus.emit('click-count', payload)
      } catch (error) {
        console.error('[Astro] Failed to send tab message:', error)
      }
    })

    // Enviar multi-tab DIRECTAMENTE al BroadcastChannel (no al bus)
    sendMultiTabBtn?.addEventListener('click', () => {
      try {
        if (!channel) {
          console.warn('[Astro] BroadcastChannel not available')
          return
        }
        const payload: MultiTabMessage = { source: 'astro', count: astroClicks, tabId: TAB_ID, instanceId }
        validateMultiTabMessage(payload)
        channel.postMessage(payload)
      } catch (error) {
        console.error('[Astro] Failed to send multi-tab message:', error)
      }
    })

    // Escuchar mensajes de EventBus compartido (tab)
    const tabHandler = (payload: TabMessage) => {
      try {
        validateTabMessage(payload)
        // Filtrar mensajes de esta misma instancia
        if (payload.instanceId !== instanceId) {
          messages.push({
            id: Date.now(),
            from: sanitizeDisplayString(payload.source),
            scope: 'tab',
            count: payload.count,
            timestamp: new Date().toLocaleTimeString()
          })
          updateUI()
        }
      } catch (error) {
        console.warn('[Astro] Invalid tab message:', error)
      }
    }

    sharedBus.on('click-count', tabHandler)

    // Escuchar mensajes multi-tab DIRECTAMENTE del BroadcastChannel
    if (channel) {
      const multiTabHandler = (event: MessageEvent) => {
        try {
          const payload = event.data
          validateMultiTabMessage(payload)
          
          // Filtrar mensajes de la misma tab (solo mostrar los de otras tabs)
          if (payload.tabId !== TAB_ID) {
            messages.push({
              id: Date.now() + 1,
              from: sanitizeDisplayString(payload.source),
              scope: 'multi-tab',
              count: payload.count,
              timestamp: new Date().toLocaleTimeString()
            })
            updateUI()
          }
        } catch (error) {
          console.warn('[Astro] Invalid multi-tab message:', error)
        }
      }
      
      channel.addEventListener('message', multiTabHandler)
    }
  })
}

function setupBroadcastChannel(): BroadcastChannel | null {
  // BroadcastChannel: Comunicación MULTI-TAB (siempre habilitado en dev y prod)
  const hasBroadcastChannel = typeof globalThis.BroadcastChannel !== 'undefined'

  if (!hasBroadcastChannel) {
    console.warn('⚠️ BroadcastChannel no disponible (multi-tab deshabilitado)')
    return null
  }

  const channel = new BroadcastChannel(MF_CONFIG.BROADCAST_CHANNEL_NAME)
  console.log('✅ BroadcastChannel (multi-tab): Sincronización entre ventanas')

  return channel
}

async function bootstrap() {
  const statusEl = document.getElementById('status')
  
  // Configurar BroadcastChannel (dev y prod)
  const channel = setupBroadcastChannel()
  
  // INICIALIZAR el contexto compartido ANTES de cargar microfrontends
  MicrofrontendContext.initialize({
    bus: sharedBus,
    tabId: TAB_ID,
    channel,
  })
  
  // Health checks solo en desarrollo
  if (IS_DEV) {
    await Promise.all([
      checkEndpoint('react', `${REACT_SERVER}${REACT_MODULE_URL}`),
      checkEndpoint('angular', `${ANGULAR_SERVER}${ANGULAR_MODULE_URL}`),
    ])
  }

  try {
    // Cargar todos los microfrontends (funciona en dev y prod)
    // Ya no necesitan el contexto como parámetro - lo obtienen de MicrofrontendContext.getInstance()
    const results = await loadMultipleMicrofrontends(microfrontendConfigs)
    
    // Log según modo
    const mode = IS_PRODUCTION ? 'producción (bundles locales)' : 'desarrollo (dev servers)'
    console.log(`📦 Microfrontends cargados en ${mode}:`)
    results.forEach((count, type) => {
      console.log(`  - ${type}: ${count} instancia(s)`)
    })
    
    // Configurar controles de Astro (siempre)
    setupAstroControls(channel)
    
    const message = IS_PRODUCTION
      ? 'Integración activa con bundles locales.'
      : 'Integración hot activa. Edita React o Angular y recarga para ver cambios.'
    
    setStatus(statusEl, message, 'ok')
  } catch (error) {
    setStatus(statusEl, `Error de integración: ${(error as Error).message}`, 'error')
  }
}

bootstrap()
