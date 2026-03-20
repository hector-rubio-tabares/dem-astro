import { ChangeDetectionStrategy, Component, computed, inject, Input, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { type Project } from './projects.data';
import { ProjectsService } from './projects.service';

/**
 * Projects Component - The Ethereal Architect
 * Bento Grid Gallery con Angular 21 Signals
 *
 * ARCHITECTURE:
 * - Signals para estado reactivo (isLoading, projects)
 * - Computed para loading phrases rotation
 * - Design System CSS (NO Tailwind)
 * - @Input showViewAllLink para mostrar link "Ver todos"
 */

@Component({
  selector: 'portfolio-projects',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent implements OnInit, OnDestroy {
  @Input() showViewAllLink: boolean = true;

  private readonly projectsService = inject(ProjectsService);

  // Datos del servicio (API-first con fallback estático)
  readonly projects = this.projectsService.previewProjects;

  readonly isLoading = signal(true); // Controla el overlay de frases
  readonly loadingPhraseIndex = signal(0);

  private readonly loadingPhrases = [
    "Curando la estética técnica...",
    "Sincronizando arquitecturas digitales...",
    "Alineando la precisión editorial...",
    "Optimizando estructuras de datos...",
    "Renderizando visiones de software..."
  ];

  readonly currentLoadingText = computed(() => {
    return this.loadingPhrases[this.loadingPhraseIndex() % this.loadingPhrases.length];
  });

  private loadingTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    // Lanzar carga desde el servicio (API-first + fallback estático)
    void this.projectsService.loadProjects();

    const phraseInterval = setInterval(() => {
      this.loadingPhraseIndex.update(i => i + 1);
    }, 800);

    this.loadingTimeoutId = setTimeout(() => {
      this.isLoading.set(false);
      clearInterval(phraseInterval);
      this.loadingTimeoutId = null;
    }, 2500);
  }

  ngOnDestroy(): void {
    if (this.loadingTimeoutId !== null) {
      clearTimeout(this.loadingTimeoutId);
    }
  }

  getGridClass(span: Project['span']): string {
    const classMap: Record<Project['span'], string> = {
      'col-8': 'grid-col-8',
      'col-4': 'grid-col-4',
      'col-6': 'grid-col-6'
    };
    return classMap[span];
  }

  getAspectClass(aspect: Project['aspect']): string {
    const classMap: Record<Project['aspect'], string> = {
      'aspect-16-9': 'aspect-ratio-16-9',
      'aspect-square': 'aspect-ratio-square',
      'aspect-video': 'aspect-ratio-video'
    };
    return classMap[aspect];
  }

  trackById(index: number, project: Project): number {
    return project.id;
  }
}

