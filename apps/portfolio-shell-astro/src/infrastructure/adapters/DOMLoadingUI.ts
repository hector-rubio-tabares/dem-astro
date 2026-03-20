/**
 * INFRASTRUCTURE LAYER - Adapter: DOMLoadingUI
 * Implementación simplificada de ILoadingUI
 * Usa el loading screen global de BaseLayout y skeletons CSS por MFE
 */

import type { ILoadingUI } from '../../application/ports/IMFELoader';

export class DOMLoadingUI implements ILoadingUI {
  show(): void {
    // El loading screen ya está en el DOM (creado por BaseLayout si loadsMFEs=true)
    const globalScreen = document.getElementById('mfe-loading-screen');
    if (globalScreen) {
      console.log('[LoadingUI] ✅ Loading screen global ya visible');
      globalScreen.classList.remove('hidden');
      return;
    }

    console.warn('[LoadingUI] ⚠️ No se encontró loading screen global');
  }

  hide(): void {
    // Ocultar loading screen global
    const globalScreen = document.getElementById('mfe-loading-screen');
    if (globalScreen) {
      globalScreen.classList.add('hidden');
      console.log('[LoadingUI] ✅ Loading screen global ocultado');
    }
  }

  updateProgress(loaded: number, total: number): void {
    // No necesario: el loading screen global es estático
    // Los skeletons individuales muestran el progreso por MFE
  }

  updateStats(stats: { total: number; loaded: number; failed: number; avgTime: number }): void {
    // No necesario: el loading screen global es estático
    // Los skeletons individuales muestran el progreso por MFE
  }
}
