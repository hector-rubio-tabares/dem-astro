import { MicrofrontendContext, EventBus, type MicroFrontendEvents, MF_CONFIG } from '@mf/shared';

declare global {
  interface Window {
    __MFE_CONTEXT_INITIALIZED__?: boolean;
    __MFE_CONTEXT_READY__?: boolean;
    __MFE_TAB_ID__?: string;
  }
}

let isContextInitialized = false;

export function initializeContext(): void {
  if (isContextInitialized) {
    return;
  }

  try {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(MF_CONFIG.BROADCAST_CHANNEL_NAME);
    } catch {
    }

    const sharedBus = new EventBus<MicroFrontendEvents>();
    const tabId = crypto.randomUUID();
    MicrofrontendContext.initialize({ bus: sharedBus, tabId, channel });
    isContextInitialized = true;
    (window as unknown as Record<string, unknown>).__MFE_CONTEXT_READY__ = true;
    (window as unknown as Record<string, unknown>).__MFE_TAB_ID__ = tabId;
  } catch (error) {
    throw error;
  }
}

export function isInitialized(): boolean {
  return isContextInitialized;
}

export function waitForContext(timeoutMs: number = 3000): Promise<void> {
  return new Promise((resolve, reject) => {
    const win = window as unknown as Record<string, unknown>;

    if (win.__SHARED_BUS__ && win.__MFE_CONTEXT_READY__) {
      resolve();
      return;
    }

    const handleContextReady = (_event: Event) => {
      clearTimeout(timeoutId);
      window.removeEventListener('mfe:context:ready', handleContextReady);
      resolve();
    };
    const timeoutId = setTimeout(() => {
      window.removeEventListener('mfe:context:ready', handleContextReady);
      reject(new Error(`MFE context timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    window.addEventListener('mfe:context:ready', handleContextReady, { once: true });
  });
}
