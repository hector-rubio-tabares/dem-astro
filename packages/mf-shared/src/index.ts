/**
 * @mf/shared - Paquete compartido para microfrontends
 */

// Core
export { EventBus } from './event-bus.js'
export type { Handler, EventMap, EventBusOptions } from './event-bus.js'

// Validation
export {
  validateTabMessage,
  validateMultiTabMessage,
  safeValidateTabMessage,
  safeValidateMultiTabMessage,
  sanitizeDisplayString,
} from './message-validator.js'
export type { TabMessage, MultiTabMessage } from './message-validator.js'

// Context (reemplaza window globals)
export {
  MicrofrontendContext,
  getMicrofrontendBus,
  getMicrofrontendTabId,
  getMicrofrontendChannel,
} from './context.js'

// Strategy Pattern (sin if/else)
export { MountStrategyFactory } from './strategies.js'
export type { MicrofrontendType, MountConfig, MountStrategy } from './strategies.js'

// Tipos y constantes
export { MF_CONFIG } from './types.js'
export type { MicroFrontendEvents } from './types.js'
