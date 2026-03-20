/**
 * TYPE DEFINITIONS - Window Extensions
 * Tipos para extensiones del objeto window global
 */

import type { MFERegistry } from '../core/services/MFERegistry';
import type { MicrofrontendContext } from '@mf/shared/context';

// Tipos para módulos remotos
export type RemoteModule = {
  mount: (container: HTMLElement, context: any) => Promise<void> | void;
  unmount?: (container: HTMLElement) => Promise<void> | void;
  bootstrap?: () => Promise<void> | void;
};

// Extensiones del objeto Window
declare global {
  interface Window {
    // MFE Registry
    __MFE_REGISTRY__?: MFERegistry;
    
    // Context initialization flags
    __MFE_CONTEXT_READY__?: boolean;
    __MFE_CONTEXT_INITIALIZED__?: boolean;
    
    // Tab ID for multi-tab communication
    __TAB_ID__?: string;
    __MFE_TAB_ID__?: string;
    
    // Shared EventBus
    __SHARED_BUS__?: any;
    
    // Microfrontend Context
    __MICROFRONTEND_CONTEXT__?: typeof MicrofrontendContext;
    
    // BroadcastChannel for cross-tab
    __BROADCAST_CHANNEL__?: BroadcastChannel;
    
    // Sentry (error monitoring)
    Sentry?: {
      captureException: (error: Error, options?: Record<string, any>) => void;
      captureMessage: (message: string, level?: string) => void;
    };
  }
}

export {};
