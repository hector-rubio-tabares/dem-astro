import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { type Project } from './projects.data';
import { ProjectsService } from './projects.service';

/**
 * Projects Full Component - Vista completa con paginación
 * Angular 21 Signals para estado reactivo
 *
 * FEATURES:
 * - Muestra TODOS los proyectos (no solo preview)
 * - Paginación con Signals (currentPage, itemsPerPage)
 * - Computed para proyectos paginados
 * - Misma UI que ProjectsComponent (Bento Grid)
 */

@Component({
  selector: 'portfolio-projects-full',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './projects-full.component.html',
  styleUrls: ['./projects-full.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsFullComponent implements OnInit {
  private readonly projectsService = inject(ProjectsService);

  // ═══════════════════════════════════════════════════════════════════════════
  // SIGNALS - Reactive State
  // ═══════════════════════════════════════════════════════════════════════════

  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(6);

  // Catálogo completo del servicio (API-first + fallback estático)
  readonly allProjects = this.projectsService.allProjects;

  ngOnInit(): void {
    // El servicio es idempotente: si ya cargó, no re-fetches
    void this.projectsService.loadProjects();
  }

  // COMPUTED - Derived state
  readonly paginatedProjects = computed(() => {
    const projects = this.allProjects();
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return projects.slice(start, end);
  });

  readonly totalPages = computed(() => {
    const total = this.allProjects().length;
    const perPage = this.itemsPerPage();
    return Math.ceil(total / perPage);
  });

  readonly canGoPrevious = computed(() => this.currentPage() > 1);
  readonly canGoNext = computed(() => this.currentPage() < this.totalPages());

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGINATION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  previousPage(): void {
    if (this.canGoPrevious()) {
      this.currentPage.update(p => p - 1);
      this.scrollToTop();
    }
  }

  nextPage(): void {
    if (this.canGoNext()) {
      this.currentPage.update(p => p + 1);
      this.scrollToTop();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

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
