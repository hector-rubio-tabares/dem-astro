import type { TabMessage, MultiTabMessage } from './message-validator'
import type { MicrofrontendType, MountConfig, MountStrategy } from './strategies'

export type { TabMessage, MultiTabMessage }
export type { MicrofrontendType, MountConfig, MountStrategy }

export const MF_CONFIG = {
  BROADCAST_CHANNEL_NAME: 'mf-multi-tab-sync-v2',
  MAX_MESSAGES_IN_LOG: 5,
  DEFAULT_TIMEOUT_MS: 8000,
  ALLOWED_SOURCES: ['react', 'angular', 'astro'] as const,
  MAX_COUNT: 1_000_000,
} as const

export type MicroFrontendEvents = {
  'click-count': TabMessage
  'multi-tab-sync': MultiTabMessage
  'mf-ready': { mfName: string; instanceId: string }
  'mf-error': { mfName: string; error: Error }
}

export type EventType =
  | 'portfolio:updated'
  | 'auth:login'
  | 'auth:logout'
  | 'mf:ready'
  | 'mf:error'
  | 'theme:changed'
  | 'nav:changed'

export type MFESource = 'admin' | 'public' | 'shell'

export interface PortfolioEvent<T = unknown> {
  type: EventType
  source: MFESource
  payload: T
  timestamp: number
  correlationId: string
  version: '1.0'
}
