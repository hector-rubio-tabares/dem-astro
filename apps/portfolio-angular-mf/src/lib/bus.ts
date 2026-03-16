import { EventBus } from './event-bus'

interface MicroFrontendEvents {
  'click-count': { source: string; count: number }
  'multi-tab-sync': { source: string; count: number; tabId: string };
}

export const angularBus = new EventBus<MicroFrontendEvents>()
