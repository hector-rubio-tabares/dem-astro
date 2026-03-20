import { useMemo, useState, useEffect } from 'react'
import './App.css'
import {
  getMicrofrontendBus,
  getMicrofrontendTabId,
  getMicrofrontendChannel,
  validateTabMessage,
  validateMultiTabMessage,
  sanitizeDisplayString,
  MF_CONFIG,
  type TabMessage,
  type MultiTabMessage,
} from '@mf/shared'

type Message = {
  id: number
  from: string
  scope: 'tab' | 'multi-tab'
  count: number
  timestamp: string
}

function getInstanceId(container?: HTMLElement): string {
  if (!container) return crypto.randomUUID()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instances = (window as any).__MF_INSTANCES__
  return instances?.get(container) || crypto.randomUUID()
}

function App({ container }: { container?: HTMLElement }) {
  const [clicks, setClicks] = useState(0)
  const [externalClicks, setExternalClicks] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])

  const instanceId = useMemo(() => getInstanceId(container), [container])

  const level = useMemo(() => {
    if (clicks >= 8) return 'alto'
    if (clicks >= 4) return 'medio'
    return 'inicial'
  }, [clicks])

  const levelClass = useMemo(() => `level-${level}`, [level])

  useEffect(() => {
    try {
      const bus = getMicrofrontendBus()
      const channel = getMicrofrontendChannel()
      const tabId = getMicrofrontendTabId()
      
      // Type assertion para handlers del bus
      const tabHandler = (payload: unknown) => {
        try {
          validateTabMessage(payload)
          const typedPayload = payload as TabMessage;
          
          // Filtrar mensajes de esta misma instancia
          if (typedPayload.instanceId !== instanceId) {
            // Solo actualizar externalClicks si viene del mismo framework pero diferente instancia
            if (typedPayload.source === 'react') {
              setExternalClicks(typedPayload.count)
            }
            setMessages(prev => [...prev, {
              id: Date.now(),
              from: sanitizeDisplayString(typedPayload.source),
              scope: 'tab',
              count: typedPayload.count,
              timestamp: new Date().toLocaleTimeString()
            }])
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn('[React] Invalid tab message:', error)
          }
        }
      }

      // Escuchar multi-tab DIRECTAMENTE del BroadcastChannel 
      const multiTabHandler = (event: MessageEvent) => {
        try {
          const payload = event.data
          validateMultiTabMessage(payload)
          const typedPayload = payload as MultiTabMessage;
          
          if (typedPayload.tabId !== tabId) {
            setMessages(prev => [...prev, {
              id: Date.now() + 1,
              from: sanitizeDisplayString(typedPayload.source),
              scope: 'multi-tab',
              count: typedPayload.count,
              timestamp: new Date().toLocaleTimeString()
            }])
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn('[React] Invalid multi-tab message:', error)
          }
        }
      }

      bus.on('click-count', tabHandler)
      
      if (channel) {
        channel.addEventListener('message', multiTabHandler)
      }
      
      return () => {
        try {
          bus.off('click-count', tabHandler)
          if (channel) {
            channel.removeEventListener('message', multiTabHandler)
          }
        } catch (err) {
          console.error('Error limpiando listeners:', err)
        }
      }
    } catch (err) {
      console.error('Error configurando event bus:', err)
    }
  }, [instanceId])

  const handleClick = () => {
    try {
      const bus = getMicrofrontendBus()
      const newCount = clicks + 1
      setClicks(newCount)
      const payload: TabMessage = { source: 'react', count: newCount, instanceId }
      validateTabMessage(payload)
      bus.emit('click-count', payload)
    } catch (err) {
      console.error('[React] Failed to handle click:', err)
    }
  }

  const sendToTab = () => {
    try {
      const bus = getMicrofrontendBus()
      const payload: TabMessage = { source: 'react', count: clicks, instanceId }
      validateTabMessage(payload)
      bus.emit('click-count', payload)
    } catch (err) {
      console.error('[React] Failed to send tab message:', err)
    }
  }

  const sendToMultiTab = () => {
    try {
      const channel = getMicrofrontendChannel()
      if (!channel) {
        if (import.meta.env.DEV) {
          console.warn('[React] BroadcastChannel not available')
        }
        return
      }
      const tabId = getMicrofrontendTabId()
      const payload: MultiTabMessage = { source: 'react', count: clicks, tabId, instanceId }
      validateMultiTabMessage(payload)
      channel.postMessage(payload)
    } catch (err) {
      console.error('[React] Failed to send multi-tab message:', err)
    }
  }

  return (
    <section className="react-card">
      <div className="mfe-header">
        <h3>React Micro-Frontend</h3>
        <span className="mfe-badge react">React 19</span>
      </div>
      <p>Renderizado dentro del shell Astro con hooks.</p>
      <div className="react-stats">
        <span>Clicks: {clicks}</span>
        <span className={`level-pill ${levelClass}`}>Nivel: {level}</span>
        {externalClicks > 0 && (
          <span className="external-clicks">Desde otros: {externalClicks}</span>
        )}
      </div>
      <button className="react-btn" type="button" onClick={handleClick}>
        Probar hook useState
      </button>

      <div className="event-controls">
        <button className="react-btn-secondary" type="button" onClick={sendToTab}>
          📤 Enviar a Tab (EventBus)
        </button>
        <button className="react-btn-secondary" type="button" onClick={sendToMultiTab}>
          🌐 Multi-tab (BroadcastChannel)
        </button>
      </div>

      {messages.length > 0 && (
        <div className="messages-log">
          <h4>Mensajes recibidos:</h4>
          <ul>
            {messages.slice(-MF_CONFIG.MAX_MESSAGES_IN_LOG).reverse().map(msg => (
              <li key={msg.id}>
                <strong>{msg.scope}</strong> de <em>{msg.from}</em>: count={msg.count} ({msg.timestamp})
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default App
