import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mf/shared/styles/global.css'
import '@mf/shared/styles/mfe-integration.css'
import './presentation/App.css'
import App from './presentation/App'

const IS_PRODUCTION = import.meta.env.PROD;
const ENV_MODE = IS_PRODUCTION ? '🔴 PROD' : '🟢 DEV';

console.log(`[React MFE ${ENV_MODE}] Inicializando aplicación React...`);

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
