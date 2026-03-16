import { EventBus } from './lib/event-bus'

interface MicroFrontendEvents {
  'click-count': { source: string; count: number }
  'multi-tab-sync': { source: string; count: number; tabId: string }
}

export const reactBus = new EventBus<MicroFrontendEvents>()
