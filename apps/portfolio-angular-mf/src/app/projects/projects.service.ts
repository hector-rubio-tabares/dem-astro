/**
 * APPLICATION LAYER - Projects Service
 * Servicio Angular con señales (signals) para datos de proyectos.
 *
 * SOLID:
 * - Single Responsibility: Solo gestiona el estado y carga de proyectos.
 * - Dependency Inversion: Consume `environment` como configuración inyectada.
 *
 * HEXAGONAL:
 * - Hace de "infrastructure adapter" en la arquitectura Angular:
 *   domain: Project (de projects.data.ts)
 *   port:   loadProjects() — contrato de carga
 *   adapter: fetch → environment.apiBaseUrl → fallback a datos estáticos
 */

import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { type Project, PROJECTS_CATALOG, PROJECTS_PREVIEW } from './projects.data';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  // ─── Estado reactivo ───────────────────────────────────────────────
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly allProjects = signal<readonly Project[]>([]);
  readonly previewProjects = signal<readonly Project[]>([]);

  private alreadyLoaded = false;

  // ─── Carga de datos ────────────────────────────────────────────────

  /**
   * Carga proyectos desde el API backend usando `environment.apiBaseUrl`.
   * Si la llamada falla (API offline, timeout, error HTTP), usa los datos
   * estáticos de `projects.data.ts` como fallback seguro.
   *
   * Idempotente: si ya se cargaron datos, no vuelve a hacer fetch.
   */
  async loadProjects(): Promise<void> {
    if (this.alreadyLoaded) return;

    this.isLoading.set(true);
    this.error.set(null);

    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), environment.apiTimeout);

    try {
      const response = await fetch(`${environment.apiBaseUrl}/api/projects`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json() as Project[];
      this.allProjects.set(data);
      this.previewProjects.set(data.slice(0, 5));
      this.alreadyLoaded = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      console.warn('[ProjectsService] API no disponible, usando datos estáticos:', message);
      this.error.set(message);

      // Fallback seguro: datos del catálogo local (siempre disponibles)
      this.allProjects.set(PROJECTS_CATALOG);
      this.previewProjects.set(PROJECTS_PREVIEW);
      this.alreadyLoaded = true;
    } finally {
      clearTimeout(timerId);
      this.isLoading.set(false);
    }
  }
}
