import type { MFERegistry } from '../core/services/MFERegistry';
import type { MicrofrontendContext } from '@mf/shared/context';

export type RemoteModule = {
  mount: (container: HTMLElement, context: Record<string, unknown>) => Promise<void> | void;
  unmount?: (container: HTMLElement) => Promise<void> | void;
  bootstrap?: () => Promise<void> | void;
};

declare global {
  interface Window {
    __MFE_REGISTRY__?: MFERegistry;
    __MFE_CONTEXT_READY__?: boolean;
    __MFE_CONTEXT_INITIALIZED__?: boolean;
    __TAB_ID__?: string;
    __MFE_TAB_ID__?: string;
    __SHARED_BUS__?: import('@mf/shared').EventBus<import('@mf/shared').MicroFrontendEvents>;
    __MICROFRONTEND_CONTEXT__?: typeof MicrofrontendContext;
    __BROADCAST_CHANNEL__?: BroadcastChannel;
    __MFE_REACT_URL__?: string;
    __MFE_ANGULAR_URL__?: string;
    Sentry?: {
      captureException: (error: Error, options?: Record<string, unknown>) => void;
      captureMessage: (message: string, level?: string) => void;
    };
  }
}

export {};
