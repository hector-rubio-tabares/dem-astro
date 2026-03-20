/**
 * Inicialización Principal con Arquitectura Hexagonal
 * Usa casos de uso, puertos y adapters
 */

import { MFEConfig } from '../core/entities/MFEConfig';
import { MFERegistry } from '../core/services/MFERegistry';
import { ModuleFederationLoader } from '../infrastructure/adapters/ModuleFederationLoader';
import { DOMLoadingUI } from '../infrastructure/adapters/DOMLoadingUI';
import { InitializeMFEsUseCase } from '../application/use-cases/InitializeMFEsUseCase';
import { MicrofrontendContext, EventBus, type MicroFrontendEvents } from '@mf/shared';
import { waitForContext } from './mf-context-init';

// Configuración del entorno
const IS_PRODUCTION = import.meta.env.PROD;

const REACT_SERVER = IS_PRODUCTION
  ? window.location.origin
  : import.meta.env.PUBLIC_REACT_MF_DEV_URL || 'http://127.0.0.1:5173';

const ANGULAR_SERVER = IS_PRODUCTION
  ? window.location.origin
  : import.meta.env.PUBLIC_ANGULAR_MF_DEV_URL || 'http://127.0.0.1:4201';

const REACT_MODULE_URL = IS_PRODUCTION
  ? '/mf/react/react-mf.js'
  : '/src/mf-entry.tsx';

const ANGULAR_MODULE_URL = IS_PRODUCTION
  ? '/mf/angular/main.js'
  : '/main.js';

// Flag para prevenir múltiples cargas de MFEs
let initializationPromise: Promise<void> | null = null;

/**
 * Inicializar el sistema de MFEs con arquitectura hexagonal
 * NOTA: El contexto debe estar inicializado ANTES por mf-context-init.ts
 */
export async function initializeMicrofrontendsHexagonal(): Promise<void> {
  // Si ya hay una inicialización en progreso, retornar esa promesa
  if (initializationPromise) {
    console.log('[Shell] ⚠️ Inicialización ya en progreso, esperando...');
    return initializationPromise;
  }

  // Crear nueva promesa de inicialización
  initializationPromise = (async () => {
    console.log('[Shell] 🚀 Inicializando MFEs con arquitectura hexagonal...');

    try {
      // 1. Verificar que el contexto esté listo (debería estar por BaseLayout)
      console.log('[Shell] 🔍 Verificando contexto MFE...');
      
      try {
        await waitForContext(3000);
        console.log('[Shell] ✅ Contexto MFE disponible');
      } catch (error) {
        console.error('[Shell] ❌ Timeout esperando contexto:', error);
        throw new Error('Contexto MFE no disponible. Asegúrate de que BaseLayout esté cargado.');
      }

      // 2. Crear instancias de la arquitectura hexagonal
      const registry = new MFERegistry();
      const loader = new ModuleFederationLoader();
      const loadingUI = new DOMLoadingUI();

      // 3. Crear caso de uso
      const initializeUseCase = new InitializeMFEsUseCase(loader, registry, loadingUI);

      // 4. Configurar MFEs
      const mfeConfigs = [
        new MFEConfig(
          'react',
          'react',
          `${REACT_SERVER}${REACT_MODULE_URL}`,
          '.mf-slot[data-mf="react"]',
          true, // crítico
          8000
        ),
        new MFEConfig(
          'angular',
          'angular',
          `${ANGULAR_SERVER}${ANGULAR_MODULE_URL}`,
          '.mf-slot[data-mf="angular"]',
          false, // no crítico
          8000,
          'portfolio-angular-mf'
        ),
      ];

      // 5. Ejecutar caso de uso
      await initializeUseCase.execute(mfeConfigs);
      
      // 6. Obtener estadísticas finales
      const stats = registry.getStatistics();
      console.log('[Shell] 📊 Estadísticas finales:', {
        total: stats.total,
        loaded: stats.loaded,
        failed: stats.failed,
        successRate: `${stats.successRate.toFixed(1)}%`,
        avgLoadTime: `${stats.avgLoadTime.toFixed(0)}ms`,
      });

      // 7. Exponer registro globalmente para debugging
      (window as any).__MFE_REGISTRY__ = registry;
    } catch (error) {
      console.error('[Shell] ❌ Error fatal en inicialización:', error);
      initializationPromise = null; // Permitir reintentos
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Obtener el EventBus compartido
 */
export function getEventBus(): EventBus<MicroFrontendEvents> {
  const context = MicrofrontendContext.getInstance();
  return context.getBus() as unknown as EventBus<MicroFrontendEvents>;
}

/**
 * Obtener el Tab ID actual
 */
export function getTabId(): string {
  const context = MicrofrontendContext.getInstance();
  return context.getTabId();
}

/**
 * Exponer solo para debugging
 */
export function getMFERegistry(): MFERegistry | null {
  return (window as any).__MFE_REGISTRY__ || null;
}
