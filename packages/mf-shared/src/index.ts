/**
 * @mf/shared - Paquete compartido para microfrontends
 * 
 * Exporta:
 * - EventBus, validadores, contexto, strategies (TypeScript)
 * - Sistema de diseño CSS (importable desde @mf/shared/styles/*)
 * 
 * Uso de estilos:
 *   import '@mf/shared/styles/global.css'  // Tokens, temas, utilidades
 *   import '@mf/shared/styles/mfe-integration.css'  // Estilos específicos MFE
 */

// Core
export { EventBus } from './event-bus'
export type { Handler, EventMap, EventBusOptions } from './event-bus'

// Validation
export {
  validateTabMessage,
  validateMultiTabMessage,
  safeValidateTabMessage,
  safeValidateMultiTabMessage,
  sanitizeDisplayString,
} from './message-validator'
export type { TabMessage, MultiTabMessage } from './message-validator'

// Context (reemplaza window globals)
export {
  MicrofrontendContext,
  getMicrofrontendBus,
  getMicrofrontendTabId,
  getMicrofrontendChannel,
} from './context'

// Strategy Pattern (sin if/else)
export { MountStrategyFactory } from './strategies'
export type { MicrofrontendType, MountConfig, MountStrategy } from './strategies'

// MFE Loader Service (Singleton Factory)
export { mfeLoader, MFELoaderService } from './mfe-loader'
export type { MFEType, MFEConfig, LoadResult, MFELoadRequest } from './mfe-loader'

// Remote Module Loader (utility functions)
export { loadRemoteModule, assertAllowedOrigin, assertMountContract, DEFAULT_TIMEOUT_MS } from './remote-module-loader'

// Tipos y constantes
export { MF_CONFIG } from './types'
export type { MicroFrontendEvents } from './types'
