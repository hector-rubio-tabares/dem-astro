import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';

const DEFAULT_PHRASES: readonly string[] = [
  'Cargando contenido...',
  'Preparando componentes...',
  'Sincronizando datos...',
  'Casi listo...',
] as const;

@Component({
  selector: 'mf-loading-overlay',
  standalone: true,
  templateUrl: './loading-overlay.component.html',
  styleUrls: ['./loading-overlay.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingOverlayComponent {
  readonly phrases = input<readonly string[]>(DEFAULT_PHRASES);

  private readonly index = signal(0);

  readonly currentText = computed(() => {
    const list = this.phrases();
    return list[this.index() % list.length];
  });

  constructor() {
    effect((onCleanup) => {
      const id = setInterval(() => this.index.update((i) => i + 1), 800);
      onCleanup(() => clearInterval(id));
    });
  }
}

