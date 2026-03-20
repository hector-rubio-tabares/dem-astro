/**
 * Script de inicialización de MFEs
 * Usado por todas las páginas que cargan micro-frontends
 */

import {
  EventBus,
  MicrofrontendContext,
  MF_CONFIG,
  type MicroFrontendEvents,
} from '@mf/shared';
import { loadMultipleMicrofrontends, type MicrofrontendConfig } from './mf-loader';
import { DEFAULT_MODULE_TIMEOUT_MS } from './mf-runtime';

// ═══════════════════════════════════════════════════════════
// ENVIRONMENT DETECTION
// ═══════════════════════════════════════════════════════════

const IS_PRODUCTION = import.meta.env.PROD;
const ENV_MODE = IS_PRODUCTION ? '🔴 PROD' : '🟢 DEV';

console.log(`[MFE Init ${ENV_MODE}] Inicializando sistema de microfrontends...`);

// URLs de microfrontends según el modo
const REACT_SERVER = IS_PRODUCTION
  ? window.location.origin
  : import.meta.env.PUBLIC_REACT_MF_DEV_URL || 'http://127.0.0.1:5173';

const ANGULAR_SERVER = IS_PRODUCTION
  ? window.location.origin
  : import.meta.env.PUBLIC_ANGULAR_MF_DEV_URL || 'http://127.0.0.1:4201';

// Rutas de módulos según el modo
const REACT_MODULE_URL = IS_PRODUCTION
  ? '/mf/react/react-mf.js'
  : '/src/mf-entry.tsx';

const ANGULAR_MODULE_URL = IS_PRODUCTION
  ? '/mf/angular/main.js'
  : '/main.js';

const allowedOriginsCsv: string = IS_PRODUCTION
  ? window.location.origin
  : import.meta.env.PUBLIC_ALLOWED_REMOTE_ORIGINS || `${REACT_SERVER},${ANGULAR_SERVER}`;

const allowedOriginsList: string[] = allowedOriginsCsv
  .split(',')
  .map((item: string) => item.trim())
  .filter((item: string) => item.length > 0);

const ALLOWED_REMOTE_ORIGINS = new Set<string>(allowedOriginsList);
const MODULE_TIMEOUT_MS = Number(
  import.meta.env.PUBLIC_MF_MODULE_TIMEOUT_MS || DEFAULT_MODULE_TIMEOUT_MS
);

/**
 * Inicializa el sistema de MFEs en la página actual
 * @returns Promise que resuelve cuando todos los MFEs están cargados
 */
export async function initializeMicrofrontends(): Promise<void> {
  // 1. Crear BroadcastChannel para comunicación multi-tab
  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(MF_CONFIG.BROADCAST_CHANNEL_NAME);
    console.log('[Shell] BroadcastChannel creado:', MF_CONFIG.BROADCAST_CHANNEL_NAME);
  } catch (error) {
    console.warn('[Shell] BroadcastChannel no soportado en este navegador', error);
  }

  // 2. Inicializar contexto compartido
  const sharedBus = new EventBus<MicroFrontendEvents>();
  const tabId = crypto.randomUUID();

  MicrofrontendContext.initialize({ bus: sharedBus, tabId, channel });
  console.log('[Shell] Contexto inicializado con tabId:', tabId);

  // 3. Configurar MFEs
  const microfrontendConfigs: MicrofrontendConfig[] = [
    {
      type: 'react',
      selector: '.mf-slot[data-mf="react"]',
      moduleUrl: `${REACT_SERVER}${REACT_MODULE_URL}`,
      allowedOrigins: ALLOWED_REMOTE_ORIGINS,
      timeoutMs: MODULE_TIMEOUT_MS,
    },
    {
      type: 'angular',
      selector: '.mf-slot[data-mf="angular"]',
      moduleUrl: `${ANGULAR_SERVER}${ANGULAR_MODULE_URL}`,
      allowedOrigins: ALLOWED_REMOTE_ORIGINS,
      timeoutMs: MODULE_TIMEOUT_MS,
      customElementName: 'portfolio-angular-mf',
    },
  ];

  // 4. Cargar MFEs en paralelo
  const results = await loadMultipleMicrofrontends(microfrontendConfigs);

  // 5. Reportar resultados
  let successful = 0;
  let failed = 0;
  
  results.forEach((mountedCount) => {
    if (mountedCount > 0) {
      successful += mountedCount;
    } else {
      failed++;
    }
  });

  console.log(`[Shell] MFEs cargados: ${successful} instancias exitosas, ${failed} MFEs fallidos`);

  if (failed > 0) {
    console.warn('[Shell] Algunos MFEs fallaron al cargar:', results);
  }
}

/**
 * Expone el bus de eventos para uso en la página
 */
export function getEventBus(): EventBus<MicroFrontendEvents> {
  return MicrofrontendContext.getInstance<MicroFrontendEvents>().getBus();
}

/**
 * Expone el tabId para uso en la página
 */
export function getTabId(): string {
  return MicrofrontendContext.getInstance().getTabId();
}
