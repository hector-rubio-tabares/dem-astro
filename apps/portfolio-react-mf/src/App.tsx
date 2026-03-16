import { useMemo, useState, useEffect } from 'react'
import './App.css'
import { reactBus } from './bus'

type Message = {
  id: number
  from: string
  scope: 'tab' | 'multi-tab'
  count: number
  timestamp: string
}

function getBus() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).__SHARED_BUS__ || reactBus
}

function getTabId() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).__TAB_ID__ || 'unknown'
}

function getBroadcastChannel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).__BROADCAST_CHANNEL__ || null
}

function App() {
  const [clicks, setClicks] = useState(0)
  const [externalClicks, setExternalClicks] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])

  const level = useMemo(() => {
    if (clicks >= 8) return 'alto'
    if (clicks >= 4) return 'medio'
    return 'inicial'
  }, [clicks])

  const levelClass = useMemo(() => `level-${level}`, [level])

  useEffect(() => {
    try {
      const bus = getBus()
      const channel = getBroadcastChannel()
      
      const tabHandler = (payload: { source: string; count: number }) => {
        console.log('🔵 React recibió de tab:', payload)
        if (payload.source !== 'react') {
          setExternalClicks(payload.count)
          setMessages(prev => [...prev, {
            id: Date.now(),
            from: payload.source,
            scope: 'tab',
            count: payload.count,
            timestamp: new Date().toLocaleTimeString()
          }])
        }
      }

      // Escuchar multi-tab DIRECTAMENTE del BroadcastChannel 
      const multiTabHandler = (event: MessageEvent) => {
        const payload = event.data
        if (payload.tabId !== getTabId()) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            from: payload.source,
            scope: 'multi-tab',
            count: payload.count,
            timestamp: new Date().toLocaleTimeString()
          }])
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
  }, [])

  const handleClick = () => {
    try {
      const bus = getBus()
      const newCount = clicks + 1
      setClicks(newCount)
      bus.emit('click-count', { source: 'react', count: newCount })
    } catch (err) {
      console.error('Error en handleClick:', err)
    }
  }

  const sendToTab = () => {
    try {
      const bus = getBus()
      const payload = { source: 'react', count: clicks }
      console.log('🔵 React enviando a tab:', payload)
      bus.emit('click-count', payload)
    } catch (err) {
      console.error('Error enviando a tab:', err)
    }
  }

  const sendToMultiTab = () => {
    try {
      const channel = getBroadcastChannel()
      if (channel) {
        channel.postMessage({ source: 'react', count: clicks, tabId: getTabId() })
      }
    } catch (err) {
      console.error('Error enviando multi-tab:', err)
    }
  }

  return (
    <section className="react-card">
      <h3>React Micro-Frontend</h3>
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
            {messages.slice(-5).reverse().map(msg => (
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
