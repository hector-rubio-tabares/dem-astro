import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { type Project } from '../../../domain/entities/project';

const GRID_CLASS_MAP: Record<Project['span'], string> = {
  'col-8': 'grid-col-8',
  'col-4': 'grid-col-4',
  'col-6': 'grid-col-6',
};

const ASPECT_CLASS_MAP: Record<Project['aspect'], string> = {
  'aspect-16-9': 'aspect-ratio-16-9',
  'aspect-square': 'aspect-ratio-square',
  'aspect-video': 'aspect-ratio-video',
};

@Component({
  selector: 'portfolio-project-card',
  standalone: true,
  imports: [],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'article',
    class: 'project-card',
    '[class]': '"project-card " + gridClass()',
  },
})
export class ProjectCardComponent {
  readonly project = input.required<Project>();

  readonly gridClass = computed(() => GRID_CLASS_MAP[this.project().span]);
  readonly aspectClass = computed(() => ASPECT_CLASS_MAP[this.project().aspect]);
}

