import { MFEConfig } from '../core/entities/MFEConfig';
import { MFERegistry } from '../core/services/MFERegistry';
import { ModuleFederationLoader } from '../infrastructure/adapters/ModuleFederationLoader';
import { DOMLoadingUI } from '../infrastructure/adapters/DOMLoadingUI';
import { InitializeMFEsUseCase } from '../application/use-cases/InitializeMFEsUseCase';
import { MicrofrontendContext, EventBus, MF_CONFIG, type MicroFrontendEvents } from '@mf/shared';
import { DEFAULT_MODULE_TIMEOUT_MS } from './mf-runtime';

const REACT_URL: string   = import.meta.env.PUBLIC_REACT_MF_URL   ?? 'http://127.0.0.1:5173/src/mf-entry.tsx';
const ANGULAR_URL: string = import.meta.env.PUBLIC_ANGULAR_MF_URL ?? 'http://127.0.0.1:4201/main.js';
const MODULE_TIMEOUT_MS   = Number(import.meta.env.PUBLIC_MF_MODULE_TIMEOUT_MS || DEFAULT_MODULE_TIMEOUT_MS);

const allowedOriginsCsv: string = import.meta.env.PUBLIC_ALLOWED_REMOTE_ORIGINS
  ?? `${new URL(REACT_URL).origin},${new URL(ANGULAR_URL).origin}`;
const ALLOWED_REMOTE_ORIGINS = new Set<string>(
  allowedOriginsCsv.split(',').map(s => s.trim()).filter(Boolean)
);

let initializationPromise: Promise<void> | null = null;

function ensureContextInitialized(): void {
  const w = window as unknown as Record<string, unknown>;
  if (w.__MFE_CONTEXT_READY__) return;

  let channel: BroadcastChannel | null = null;
  try { channel = new BroadcastChannel(MF_CONFIG.BROADCAST_CHANNEL_NAME); } catch { }

  const sharedBus = new EventBus<MicroFrontendEvents>();
  const tabId     = crypto.randomUUID();
  MicrofrontendContext.initialize({ bus: sharedBus, tabId, channel });

  w.__SHARED_BUS__        = sharedBus;
  w.__TAB_ID__            = tabId;
  w.__BROADCAST_CHANNEL__ = channel;
  w.__MFE_CONTEXT_READY__ = true;
}

export async function initializeMicrofrontendsHexagonal(): Promise<void> {
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      ensureContextInitialized();

      const registry    = new MFERegistry();
      const loader      = new ModuleFederationLoader(ALLOWED_REMOTE_ORIGINS);
      const loadingUI   = new DOMLoadingUI();
      const initUseCase = new InitializeMFEsUseCase(loader, registry, loadingUI);

      const mfeConfigs = [
        new MFEConfig('react',   'react',   REACT_URL,   '.mf-slot[data-mf="react"]',   true,  MODULE_TIMEOUT_MS),
        new MFEConfig('angular', 'angular', ANGULAR_URL, '.mf-slot[data-mf="angular"]', false, MODULE_TIMEOUT_MS, 'portfolio-angular-mf'),
      ];

      await initUseCase.execute(mfeConfigs);

      (window as unknown as Record<string, unknown>).__MFE_REGISTRY__ = registry;
    } catch (error) {
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

export function getEventBus(): EventBus<MicroFrontendEvents> {
  return MicrofrontendContext.getInstance<MicroFrontendEvents>().getBus();
}

export function getTabId(): string {
  return MicrofrontendContext.getInstance().getTabId();
}

export function getMFERegistry(): MFERegistry | null {
  return (window as unknown as Record<string, unknown>).__MFE_REGISTRY__ as MFERegistry | null;
}
