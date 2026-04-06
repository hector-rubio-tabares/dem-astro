import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ProjectsAdapter } from '../../infrastructure/adapters/projects.adapter';
import { LoadingOverlayComponent } from '../components/loading-overlay/loading-overlay.component';
import { ProjectCardComponent } from '../components/project-card/project-card.component';

@Component({
  selector: 'portfolio-projects-full',
  standalone: true,
  imports: [LoadingOverlayComponent, ProjectCardComponent],
  templateUrl: './projects-full.component.html',
  styleUrls: ['./projects-full.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsFullComponent {
  private readonly adapter = inject(ProjectsAdapter);

  readonly allProjects = this.adapter.allProjects;

  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(6);

  private readonly minimumElapsed = signal(false);

  readonly isLoading = computed(() => this.adapter.isLoading() || !this.minimumElapsed());

  readonly paginatedProjects = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.allProjects().slice(start, start + this.itemsPerPage());
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.allProjects().length / this.itemsPerPage())
  );

  readonly canGoPrevious = computed(() => this.currentPage() > 1);
  readonly canGoNext = computed(() => this.currentPage() < this.totalPages());

  constructor() {
    effect((onCleanup) => {
      void this.adapter.loadProjects();
      const timerId = setTimeout(() => this.minimumElapsed.set(true), 2500);
      onCleanup(() => clearTimeout(timerId));
    });
  }

  previousPage(): void {
    if (this.canGoPrevious()) {
      this.currentPage.update((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.canGoNext()) {
      this.currentPage.update((p) => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
