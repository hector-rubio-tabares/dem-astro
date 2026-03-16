import {
  getElementByIdOrThrow,
  importRemoteWithTimeout,
  setStatus,
  DEFAULT_MODULE_TIMEOUT_MS,
} from './mf-runtime'
import { EventBus } from './event-bus'

type ReactMountModule = {
  mount: (container: HTMLElement, context?: Record<string, unknown>) => void
}

const REACT_SERVER = import.meta.env.PROD
  ? import.meta.env.PUBLIC_REACT_MF_PROD_URL || import.meta.env.PUBLIC_REACT_MF_DEV_URL || 'http://127.0.0.1:5173'
  : import.meta.env.PUBLIC_REACT_MF_DEV_URL || 'http://127.0.0.1:5173'

const ANGULAR_SERVER = import.meta.env.PROD
  ? import.meta.env.PUBLIC_ANGULAR_MF_PROD_URL || import.meta.env.PUBLIC_ANGULAR_MF_DEV_URL || 'http://127.0.0.1:4201'
  : import.meta.env.PUBLIC_ANGULAR_MF_DEV_URL || 'http://127.0.0.1:4201'

const allowedOriginsCsv: string =
  import.meta.env.PUBLIC_ALLOWED_REMOTE_ORIGINS || `${REACT_SERVER},${ANGULAR_SERVER}`

const allowedOriginsList: string[] = allowedOriginsCsv
  .split(',')
  .map((item: string) => item.trim())
  .filter((item: string) => item.length > 0)

const ALLOWED_REMOTE_ORIGINS = new Set<string>(allowedOriginsList)
const MODULE_TIMEOUT_MS = Number(import.meta.env.PUBLIC_MF_MODULE_TIMEOUT_MS || DEFAULT_MODULE_TIMEOUT_MS)

// Bus COMPARTIDO para comunicación entre microfrontends (React, Angular, Astro)
type MicroFrontendEvents = {
  'click-count': { source: string; count: number }
  'multi-tab-sync': { source: string; count: number; tabId: string }
}
const sharedBus = new EventBus<MicroFrontendEvents>()

// ID único para esta tab/ventana
const TAB_ID = Math.random().toString(36).substring(2, 9)

async function checkEndpoint(label: 'react' | 'angular', url: string) {
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

async function mountReact() {
  const reactSlot = getElementByIdOrThrow('react-slot')
  
  // Configurar BroadcastChannel primero
  const channel = setupBroadcastChannel()
  
  // Inyectar el bus compartido, TAB_ID y BroadcastChannel ANTES de montar
  ;(window as any).__SHARED_BUS__ = sharedBus
  ;(window as any).__TAB_ID__ = TAB_ID
  ;(window as any).__BROADCAST_CHANNEL__ = channel
  
  const reactModule = await importRemoteWithTimeout<ReactMountModule>(
    `${REACT_SERVER}/src/mf-entry.tsx`,
    ALLOWED_REMOTE_ORIGINS,
    MODULE_TIMEOUT_MS,
  )

  if (typeof reactModule.mount !== 'function') {
    throw new Error('React MF no expone mount(container, context).')
  }

  reactModule.mount(reactSlot, { title: 'React hot mode' })
}

async function mountAngular() {
  const angularSlot = getElementByIdOrThrow('angular-slot')
  
  // Inyectar el bus compartido, TAB_ID y BroadcastChannel en el objeto global para que Angular lo use
  ;(window as any).__SHARED_BUS__ = sharedBus
  ;(window as any).__TAB_ID__ = TAB_ID
  ;(window as any).__BROADCAST_CHANNEL__ = (window as any).__BROADCAST_CHANNEL__ || setupBroadcastChannel()
  
  // Importar el módulo de Angular (mismo que el health check)
  await importRemoteWithTimeout(
    `${ANGULAR_SERVER}/main.js`,
    ALLOWED_REMOTE_ORIGINS,
    MODULE_TIMEOUT_MS,
  )
  
  const element = document.createElement('portfolio-angular-mf')
  angularSlot.appendChild(element)
}

function setupAstroControls(channel: BroadcastChannel | null) {
  let astroClicks = 0
  const messages: any[] = []

  const clicksEl = document.getElementById('astro-clicks')
  const messagesContainer = document.getElementById('astro-messages')
  const messagesList = document.getElementById('astro-messages-list')
  
  const incrementBtn = document.getElementById('astro-increment')
  const sendTabBtn = document.getElementById('astro-send-tab')
  const sendMultiTabBtn = document.getElementById('astro-send-multitab')
  
  console.log('🟣 Astro setupControls - Botones encontrados:', {
    incrementBtn: !!incrementBtn,
    sendTabBtn: !!sendTabBtn,
    sendMultiTabBtn: !!sendMultiTabBtn,
    clicksEl: !!clicksEl
  })

  const updateUI = () => {
    if (clicksEl) clicksEl.textContent = String(astroClicks)

    if (messages.length > 0 && messagesContainer) {
      messagesContainer.style.display = 'block'
      if (messagesList) {
        messagesList.innerHTML = messages
          .slice(-5)
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
    console.log('🟣 Astro botón incrementar clickeado')
    astroClicks++
    updateUI()
  })

  // Enviar a tab via EventBus compartido
  sendTabBtn?.addEventListener('click', () => {
    const payload = { source: 'astro', count: astroClicks }
    console.log('🟣 Astro enviando a tab:', payload)
    sharedBus.emit('click-count', payload)
  })

  // Enviar multi-tab DIRECTAMENTE al BroadcastChannel (no al bus)
  sendMultiTabBtn?.addEventListener('click', () => {
    console.log('🟣 Astro botón multi-tab clickeado, channel:', !!channel)
    if (channel) {
      const payload = { source: 'astro', count: astroClicks, tabId: TAB_ID }
      channel.postMessage(payload)
    }
  })

  // Escuchar mensajes de EventBus compartido (tab)
  const tabHandler = (payload: { source: string; count: number }) => {
    console.log('🟣 Astro recibió de tab:', payload)
    if (payload.source === 'astro') return

    messages.push({
      id: Date.now(),
      from: payload.source,
      scope: 'tab',
      count: payload.count,
      timestamp: new Date().toLocaleTimeString()
    })
    updateUI()
  }

  sharedBus.on('click-count', tabHandler)

  // Escuchar mensajes multi-tab DIRECTAMENTE del BroadcastChannel
  if (channel) {
    channel.onmessage = (event) => {
      const payload = event.data
      console.log('🟣 Astro recibió de BroadcastChannel:', payload, '| Mi tabId:', TAB_ID)
      // Filtrar mensajes de la misma tab (solo mostrar los de otras tabs)
      if (payload.tabId !== TAB_ID) {
        messages.push({
          id: Date.now() + 1,
          from: payload.source,
          scope: 'multi-tab',
          count: payload.count,
          timestamp: new Date().toLocaleTimeString()
        })
        updateUI()
      } else {
        console.log('🟣 Astro filtró su propio mensaje')
      }
    }
  }
}

function setupBroadcastChannel(): BroadcastChannel | null {
  // BroadcastChannel: Comunicación MULTI-TAB (entre ventanas/tabs del navegador)
  const hasBroadcastChannel = typeof globalThis.BroadcastChannel !== 'undefined'

  if (!hasBroadcastChannel) {
    console.log('✅ EventBus compartido: React ↔ Angular ↔ Astro')
    console.log('⚠️ BroadcastChannel no disponible (multi-tab deshabilitado)')
    return null
  }

  const channel = new BroadcastChannel('mf-multi-tab-sync-v2')
  
  console.log('✅ EventBus compartido: React ↔ Angular ↔ Astro')
  console.log('✅ BroadcastChannel (multi-tab): Sincronización entre ventanas')

  return channel
}

async function bootstrap() {
  const statusEl = document.getElementById('status')
  
  // NO configurar BroadcastChannel aquí, se hace en mountReact
  await Promise.all([
    checkEndpoint('react', `${REACT_SERVER}/src/mf-entry.tsx`),
    checkEndpoint('angular', `${ANGULAR_SERVER}/main.js`),
  ])

  try {
    await Promise.all([mountReact(), mountAngular()])
    const channel = (window as any).__BROADCAST_CHANNEL__
    setupAstroControls(channel)
    setStatus(statusEl, 'Integracion hot activa. Edita React o Angular y recarga para ver cambios.', 'ok')
  } catch (error) {
    setStatus(statusEl, `Error de integracion hot: ${(error as Error).message}`, 'error')
  }
}

bootstrap()
