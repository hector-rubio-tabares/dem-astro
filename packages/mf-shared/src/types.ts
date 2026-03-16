/**
 * Tipos compartidos entre microfrontends
 */

export type { TabMessage, MultiTabMessage } from './message-validator'
export type { MicrofrontendType, MountConfig, MountStrategy } from './strategies'

/**
 * Configuración global
 */
export const MF_CONFIG = {
  BROADCAST_CHANNEL_NAME: 'mf-multi-tab-sync-v2',
  MAX_MESSAGES_IN_LOG: 5,
  DEFAULT_TIMEOUT_MS: 8000,
  ALLOWED_SOURCES: ['react', 'angular', 'astro'] as const,
  MAX_COUNT: 1_000_000,
} as const

/**
 * Eventos compartidos
 */
export type MicroFrontendEvents = {
  'click-count': import('./message-validator').TabMessage
  'multi-tab-sync': import('./message-validator').MultiTabMessage
  'mf-ready': { mfName: string; instanceId: string }
  'mf-error': { mfName: string; error: Error }
}
