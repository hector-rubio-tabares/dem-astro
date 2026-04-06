import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { ProjectsAdapter } from '../../infrastructure/adapters/projects.adapter';
import { LoadingOverlayComponent } from '../components/loading-overlay/loading-overlay.component';
import { ProjectCardComponent } from '../components/project-card/project-card.component';

const LOADING_PHRASES: readonly string[] = [
  'Curando la estetica tecnica...',
  'Sincronizando arquitecturas digitales...',
  'Alineando la precision editorial...',
  'Optimizando estructuras de datos...',
  'Renderizando visiones de software...',
] as const;

@Component({
  selector: 'portfolio-projects',
  standalone: true,
  imports: [LoadingOverlayComponent, ProjectCardComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  readonly showViewAllLink = input(true);

  private readonly adapter = inject(ProjectsAdapter);

  readonly projects = this.adapter.previewProjects;

  private readonly minimumElapsed = signal(false);

  readonly isLoading = computed(() => this.adapter.isLoading() || !this.minimumElapsed());

  readonly loadingPhrases = LOADING_PHRASES;

  constructor() {
    effect((onCleanup) => {
      void this.adapter.loadProjects();
      const timerId = setTimeout(() => this.minimumElapsed.set(true), 2500);
      onCleanup(() => clearTimeout(timerId));
    });
  }
}