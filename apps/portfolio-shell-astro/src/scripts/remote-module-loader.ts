/**
 * ⚠️ DEPRECATED: Este archivo se mantiene por backward compatibility.
 * Las reimplementaciones locales han sido eliminadas para evitar identificadores
 * duplicados (bug de TypeScript). Solo re-exporta desde @mf/shared.
 *
 * 🔄 MIGRACIÓN: Importar directamente desde @mf/shared
 *
 * @example
 * // ❌ Antiguo (deprecated)
 * import { loadRemoteModule } from './remote-module-loader';
 *
 * // ✅ Nuevo (recomendado)
 * import { loadRemoteModule } from '@mf/shared';
 *
 * 📚 Documentación completa: packages/mf-shared/src/remote-module-loader.ts
 *
 * Este archivo será ELIMINADO en una versión futura.
 */

// Re-export desde @mf/shared — única fuente de verdad
export {
  loadRemoteModule,
  assertAllowedOrigin,
  assertMountContract,
  DEFAULT_TIMEOUT_MS,
} from '@mf/shared';

