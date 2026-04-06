import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { type Project, PROJECTS_CATALOG, PROJECTS_PREVIEW } from '../../domain/entities/project';

@Injectable({ providedIn: 'root' })
export class ProjectsAdapter {
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly allProjects = signal<readonly Project[]>([]);
  readonly previewProjects = signal<readonly Project[]>([]);

  private alreadyLoaded = false;

  async loadProjects(): Promise<void> {
    if (this.alreadyLoaded) return;

    this.isLoading.set(true);
    this.error.set(null);

    if (!environment.apiBaseUrl) {
      this.allProjects.set(PROJECTS_CATALOG);
      this.previewProjects.set(PROJECTS_PREVIEW);
      this.alreadyLoaded = true;
      this.isLoading.set(false);
      return;
    }

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
    } catch {
      this.allProjects.set(PROJECTS_CATALOG);
      this.previewProjects.set(PROJECTS_PREVIEW);
      this.alreadyLoaded = true;
    } finally {
      clearTimeout(timerId);
      this.isLoading.set(false);
    }
  }
}

