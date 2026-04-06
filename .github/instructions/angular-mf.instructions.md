---
applyTo: "apps/portfolio-angular-mf/**"
---

# Contexto: Angular MFE — Panel Admin

El archivo actual pertenece al MFE de Angular. Este MFE es el panel de administración del portafolio: gestión de proyectos, posts y contenido. Usa el agente **Angular Expert** para cualquier tarea de implementación.

---

## Stack

- **Angular 21** — signals-first, zoneless (sin Zone.js), OnPush obligatorio
- **Vite + @analogjs/vite-plugin-angular** — build ultrarrápido
- **TypeScript estricto** — sin `any`, sin `@ts-ignore`, sin `as any`
- **Web Components** — montado como `<portfolio-angular-mf>` desde el Shell
- **pnpm workspace** — alias `@portfolio/angular-mf`

---

## Estructura de Carpetas

```
apps/portfolio-angular-mf/
├── src/
│   ├── domain/
│   │   ├── entities/            → Project, BlogPost, Skill (interfaces puras)
│   │   └── repositories/        → IProjectRepository, IBlogRepository (interfaces)
│   ├── application/
│   │   ├── ports/               → interfaces de salida (IEventBusPort, IStoragePort)
│   │   └── use-cases/           → GetProjects, UpdateProject, PublishPost...
│   ├── infrastructure/
│   │   ├── adapters/
│   │   │   ├── event-bus.adapter.ts   → implementa IEventBusPort via @mf/shared
│   │   │   ├── api.adapter.ts         → implementa repositorios via HTTP/MSW
│   │   │   └── storage.adapter.ts     → localStorage/IndexedDB
│   │   └── di/
│   │       └── providers.ts           → provideApp(), configura DI del MFE
│   ├── presentation/
│   │   ├── components/          → componentes UI (OnPush, signals)
│   │   ├── pipes/               → pipes puros (sin efectos secundarios)
│   │   └── directives/          → directivas estructurales y de atributo
│   ├── custom-element.ts        → punto de entrada Web Component
│   └── main.ts                  → bootstrap zoneless
├── angular.json
└── vite.config.ts
```

---

## Reglas de Implementación

### Signals — Paradigma Obligatorio

```typescript
// ✅ Estado local con signal
readonly projects = signal<Project[]>([]);
readonly isLoading = signal(false);

// ✅ Derivado con computed (sin efectos secundarios)
readonly publishedProjects = computed(() =>
  this.projects().filter(p => p.status === 'published')
);

// ✅ effect() SOLO para sincronización con DOM o sistemas externos
effect(() => {
  const count = this.projects().length;
  // sincronizar con algo externo — no para lógica de negocio
}, { allowSignalWrites: false });

// ❌ NUNCA BehaviorSubject donde un signal basta
projects$ = new BehaviorSubject<Project[]>([]);

// ❌ NUNCA mutar el signal directamente
this.projects().push(newProject); // MAL
this.projects.update(list => [...list, newProject]); // BIEN
```

### Change Detection — Zoneless + OnPush

```typescript
@Component({
  selector: 'app-project-list',
  changeDetection: ChangeDetectionStrategy.OnPush,  // OBLIGATORIO en todos
  standalone: true,
  template: `...`,
})
export class ProjectListComponent {
  // Sin inyectar NgZone, ApplicationRef, o ChangeDetectorRef para forzar CD
}
```

- `main.ts` debe usar `provideExperimentalZonelessChangeDetection()` — nunca importar Zone.js
- Si necesitas forzar una detección de cambios, usa `signal.set()` — no `markForCheck()`

### Web Component / Custom Element

```typescript
// custom-element.ts — punto de entrada del MFE
export class PortfolioAngularMf extends HTMLElement {
  private appRef: ApplicationRef | null = null;

  connectedCallback(): void {
    // Validar que viene del Shell (origen seguro)
    this.appRef = createApplication(AppComponent, {
      providers: [provideApp()],
    });
    EventBus.on('auth:logout', this.handleLogout);
  }

  disconnectedCallback(): void {
    EventBus.off('auth:logout', this.handleLogout);
    this.appRef?.destroy();
    this.appRef = null;
  }

  // Props del shell via atributo → signal interno
  static get observedAttributes() { return ['locale', 'theme']; }
  attributeChangedCallback(name: string, _old: string, next: string): void {
    if (name === 'locale') this.localeSignal.set(next);
  }
}

customElements.define('portfolio-angular-mf', PortfolioAngularMf);
```

### Comunicación via EventBus

```typescript
// ✅ Suscribirse con cleanup automático via DestroyRef
export class ProjectService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly eventBus = inject(EventBusAdapter);

  constructor() {
    // El unsubscribe se llama automáticamente cuando el servicio se destruye
    const unsub = this.eventBus.on('portfolio:updated', (event) => {
      validateTabMessage(event);            // SIEMPRE validar antes de usar
      this.projects.set(event.payload);
    });
    this.destroyRef.onDestroy(unsub);
  }
}

// ✅ Emitir evento tipado
this.eventBus.publish({
  type: 'portfolio:updated',
  source: 'admin',
  payload: updatedProject,
  timestamp: Date.now(),
  correlationId: crypto.randomUUID(),
  version: '1.0',
});

// ❌ NUNCA usar window.postMessage, CustomEvent global o dispatchEvent
window.dispatchEvent(new CustomEvent('portfolio:updated', { detail: data })); // MAL
```

### Inyección de Dependencias

```typescript
// ✅ inject() en constructor o campo — no constructor injection manual
export class ProjectListComponent {
  private readonly projectUseCase = inject(GetProjectsUseCase);
  private readonly eventBus = inject(EventBusAdapter);
}

// ✅ Proveer implementaciones en providers.ts, nunca en componentes
export function provideApp(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: IProjectRepository, useClass: ApiProjectRepository },
    { provide: IEventBusPort, useClass: EventBusAdapter },
  ]);
}
```

---

## Patrones de Carga de Datos

```typescript
// ✅ Patrón recomendado: signal + use-case en constructor con effect
export class ProjectListComponent {
  private readonly getProjects = inject(GetProjectsUseCase);

  readonly projects = signal<Project[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadProjects();
  }

  private async loadProjects(): Promise<void> {
    try {
      const data = await this.getProjects.execute();
      this.projects.set(data);
    } catch (err) {
      this.error.set('Error al cargar proyectos');
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

---

## Reglas Absolutas

- **NUNCA** Zone.js — ni importado, ni en `angular.json`, ni en `polyfills`
- **NUNCA** `ChangeDetectionStrategy.Default` — siempre `OnPush`
- **NUNCA** `any`, `as any`, `@ts-ignore`, `// eslint-disable`
- **NUNCA** mutar arrays/objetos de signals directamente — siempre `.set()` o `.update()`
- **NUNCA** `window.postMessage` ni `CustomEvent` global para comunicación MFE
- **NUNCA** importar desde `apps/portfolio-react-mf/` o `apps/portfolio-shell-astro/`
- **SIEMPRE** `disconnectedCallback` limpia todos los listeners del EventBus
- **SIEMPRE** validar con `validateTabMessage` antes de usar el payload de un evento
- **SIEMPRE** `inject()` para DI, no parámetros en constructor con decoradores manuales

---

## Verificación

```bash
pnpm --filter @portfolio/angular-mf build
pnpm --filter @portfolio/angular-mf test
```
