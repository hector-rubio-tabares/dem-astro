/**
 * Inicialización Temprana del Contexto MFE
 * Este módulo se carga INMEDIATAMENTE desde el <head> para garantizar
 * que el contexto esté disponible antes de que cualquier MFE lo necesite
 */

import { MicrofrontendContext, EventBus, type MicroFrontendEvents, MF_CONFIG } from '@mf/shared';

// Tipos globales para Window
declare global {
  interface Window {
    __MFE_CONTEXT_INITIALIZED__?: boolean;
    __MFE_CONTEXT_READY__?: boolean;
    __MFE_TAB_ID__?: string;
  }
}

// Flag global para prevenir múltiples inicializaciones
let isContextInitialized = false;

/**
 * Inicializar el contexto compartido de forma síncrona
 * Esta función debe ejecutarse lo antes posible en el ciclo de vida de la página
 */
export function initializeContext(): void {
  // Prevenir múltiples inicializaciones
  if (isContextInitialized) {
    console.log('[ContextInit] ⚠️ Contexto ya inicializado');
    return;
  }

  console.log('[ContextInit] 🔧 Inicializando contexto compartido...');

  try {
    // 1. Crear BroadcastChannel para comunicación multi-tab
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(MF_CONFIG.BROADCAST_CHANNEL_NAME);
      console.log('[ContextInit] ✅ BroadcastChannel creado');
    } catch (error) {
      console.warn('[ContextInit] ⚠️ BroadcastChannel no soportado', error);
    }

    // 2. Crear EventBus tipado
    const sharedBus = new EventBus<MicroFrontendEvents>();
    
    // 3. Generar Tab ID único
    const tabId = crypto.randomUUID();

    // 4. Inicializar contexto con todas las dependencias
    MicrofrontendContext.initialize({ bus: sharedBus, tabId, channel });
    
    console.log(`[ContextInit] ✅ Contexto inicializado con tabId: ${tabId}`);
    
    isContextInitialized = true;

    // 5. Exponer flag global para debugging
    (window as any).__MFE_CONTEXT_READY__ = true;
    (window as any).__MFE_TAB_ID__ = tabId;
  } catch (error) {
    console.error('[ContextInit] ❌ Error fatal inicializando contexto:', error);
    throw error;
  }
}

/**
 * Verificar si el contexto ya está inicializado
 */
export function isInitialized(): boolean {
  return isContextInitialized;
}

/**
 * Esperar a que el contexto esté inicializado (Observer Pattern con CustomEvent)
 * 
 * ✅ SOLID: Inversión de Dependencia - no polling, reacciona a eventos
 * ✅ Performance: Sin setInterval, 0 CPU overhead
 * ✅ Garantizado: El evento 'mfe:context:ready' se emite 1 vez cuando esté listo
 * 
 * @param timeoutMs - Timeout máximo de espera (default 3000ms)
 * @returns Promise que resuelve cuando el contexto esté listo
 * @throws Error si se alcanza el timeout
 */
export function waitForContext(timeoutMs: number = 3000): Promise<void> {
  return new Promise((resolve, reject) => {
    const win = window as any;

    // Fast path: Verificar si ya está disponible
    if (win.__SHARED_BUS__ && win.__MFE_CONTEXT_READY__) {
      console.log('[ContextInit] ✅ Contexto ya disponible (verificación inmediata)');
      resolve();
      return;
    }

    // ✅ Observer Pattern: Escuchar evento CustomEvent (no polling)
    console.log('[ContextInit] ⏳ Esperando evento mfe:context:ready...');
    const startTime = Date.now();

    const handleContextReady = (event: Event) => {
      const elapsedMs = Date.now() - startTime;
      console.log(`[ContextInit] ✅ Contexto listo (evento recibido en ${elapsedMs}ms)`);
      window.removeEventListener('mfe:context:ready', handleContextReady);
      resolve();
    };

    // Timeout de seguridad (Promise.race pattern)
    const timeoutId = setTimeout(() => {
      window.removeEventListener('mfe:context:ready', handleContextReady);
      const errorMsg = `[ContextInit] ❌ Timeout (${timeoutMs}ms). Estado: __MFE_CONTEXT_READY__=${win.__MFE_CONTEXT_READY__}, __SHARED_BUS__=${!!win.__SHARED_BUS__}`;
      console.error(errorMsg);
      reject(new Error(errorMsg));
    }, timeoutMs);

    // Listener del evento (se auto-limpia en éxito o timeout)
    window.addEventListener('mfe:context:ready', handleContextReady, { once: true });
  });
}
