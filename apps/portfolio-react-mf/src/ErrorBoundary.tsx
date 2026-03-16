import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  mfName?: string
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary para aislar errores del microfrontend React
 * Previene que un error en este MF tumbe toda la aplicación
 */
export class MFErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const mfName = this.props.mfName || 'React MF'
    console.error(`[${mfName}] Error caught by boundary:`, error, info)
    
    // TODO: Reportar a servicio de monitoring (Sentry, DataDog, etc.)
    // if (import.meta.env.PROD) {
    //   reportError(mfName, error, info)
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            padding: '20px',
            border: '2px solid #dc2626',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            margin: '20px 0'
          }}
        >
          <h3 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>
            ⚠️ Error en Microfrontend
          </h3>
          <p style={{ margin: '10px 0' }}>
            El microfrontend de React encontró un error y se detuvo temporalmente.
            El resto de la aplicación continúa funcionando normalmente.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Detalles del error (solo en desarrollo)
              </summary>
              <pre
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#fee',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}
              >
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
