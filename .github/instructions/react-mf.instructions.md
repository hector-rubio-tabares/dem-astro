---
applyTo: "apps/portfolio-react-mf/**"
---

# Contexto: React MFE — Portafolio Público

El archivo actual pertenece al MFE de React. Este MFE es la vista pública del portafolio: proyectos, blog, habilidades e información de contacto. Usa el agente **React Expert** para cualquier tarea de implementación.

---

## Stack

- **React 19** — hooks, Suspense, `startTransition`, Server Components si aplica
- **Vite** — build + HMR
- **Vitest** — testing unitario e integración
- **TypeScript estricto** — sin `any`, sin `@ts-ignore`
- **Web Component** — montado como `<portfolio-react-mf>` desde el Shell
- **pnpm workspace** — alias `@portfolio/react-mf`

---

## Arquitectura Hexagonal — Regla de Dependencias

```
domain          ← no importa nada externo al paquete
  ↑
application     ← importa solo domain
  ↑
infrastructure  ← importa application (implementa ports)
  ↑
presentation    ← importa application (usa use-cases via ports)

NUNCA:
❌ domain        → cualquier otra capa
❌ application   → infrastructure o presentation
❌ presentation  → domain directamente (solo via use-cases en application)
❌ cualquier capa → otra app del monorepo (solo @mf/shared)
```

---

## Estructura de Carpetas

```
apps/portfolio-react-mf/
├── src/
│   ├── domain/
│   │   ├── entities/            → Project.ts, BlogPost.ts, Skill.ts (tipos puros)
│   │   └── repositories/        → IProjectRepository.ts (interfaces)
│   ├── application/
│   │   ├── ports/               → IEventBusPort.ts, ICachePort.ts
│   │   └── use-cases/           → GetProjects.ts, GetBlogPosts.ts...
│   ├── infrastructure/
│   │   ├── adapters/
│   │   │   ├── EventBusAdapter.ts     → implementa IEventBusPort
│   │   │   ├── ApiAdapter.ts          → fetch real o MSW
│   │   │   └── CacheAdapter.ts        → IndexedDB via idb-keyval
│   │   └── repositories/
│   │       └── ApiProjectRepository.ts
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── projects/        → ProjectCard, ProjectList, ProjectDetail
│   │   │   ├── blog/            → PostCard, PostList
│   │   │   └── shared/          → Skeleton, ErrorBoundary, EmptyState
│   │   └── hooks/
│   │       ├── useProjects.ts   → orquesta GetProjects use-case
│   │       └── useI18n.ts       → i18n reactivo via EventBus
│   ├── custom-element.tsx       → punto de entrada Web Component
│   └── main.tsx                 → bootstrap React en el Custom Element
├── vite.config.ts
└── vitest.config.ts
```

---

## Reglas de Implementación

### Hooks — Patrones Obligatorios

```typescript
// ✅ useEffect siempre con cleanup
useEffect(() => {
  const unsubscribe = EventBus.on('portfolio:updated', handleUpdate);
  return () => unsubscribe();                    // cleanup obligatorio
}, []);

// ✅ startTransition para actualizaciones no urgentes
const handleProjectUpdate = (updated: Project) => {
  startTransition(() => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  });
};

// ✅ Suspense + lazy para carga diferida de rutas
const ProjectDetail = lazy(() => import('./presentation/components/projects/ProjectDetail'));

// ✅ useMemo para cálculos costosos
const publishedProjects = useMemo(
  () => projects.filter(p => p.status === 'published'),
  [projects]
);

// ❌ NUNCA useEffect sin array de dependencias
useEffect(() => { /* se ejecuta en cada render */ }); // MAL

// ❌ NUNCA async directamente en useEffect
useEffect(async () => { /* viola las reglas de hooks */ }); // MAL
// ✅ Usar función interna async
useEffect(() => {
  const load = async () => { /* ... */ };
  load();
}, []);
```

### Hooks personalizados — Estructura

```typescript
// ✅ Hook que orquesta un use-case con estado completo
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const repo = new ApiProjectRepository();
    const useCase = new GetProjects(repo);

    useCase.execute()
      .then(data => setProjects(data))
      .catch(() => setError('Error al cargar proyectos'))
      .finally(() => setIsLoading(false));

    // Escuchar actualizaciones del admin via EventBus
    const unsubscribe = EventBus.on('portfolio:updated', (event) => {
      validateTabMessage(event);             // validar siempre
      startTransition(() => setProjects(event.payload));
    });

    return () => unsubscribe();
  }, []);

  return { projects, isLoading, error };
}
```

### Comunicación via EventBus

```typescript
// ✅ Suscribirse con cleanup en useEffect
useEffect(() => {
  const unsub = EventBus.on('i18n:locale-changed', (event) => {
    validateTabMessage(event);
    setLocale(event.payload.locale);
  });
  return () => unsub();
}, []);

// ✅ Emitir evento tipado (el MFE público raramente emite, pero si lo hace:)
EventBus.publish({
  type: 'public:contact-form-submitted',
  source: 'public',
  payload: { email: sanitized },
  timestamp: Date.now(),
  correlationId: crypto.randomUUID(),
  version: '1.0',
});

// ❌ NUNCA
window.postMessage(data, '*');                              // MAL
window.dispatchEvent(new CustomEvent('update', { detail })); // MAL
```

### Custom Element (punto de entrada)

```typescript
// custom-element.tsx
export class PortfolioReactMf extends HTMLElement {
  private root: ReactDOM.Root | null = null;

  connectedCallback(): void {
    this.root = ReactDOM.createRoot(this);
    this.root.render(
      <React.StrictMode>
        <App locale={this.getAttribute('locale') ?? 'es'} />
      </React.StrictMode>
    );
  }

  disconnectedCallback(): void {
    this.root?.unmount();
    this.root = null;
  }

  static get observedAttributes() { return ['locale', 'theme']; }

  attributeChangedCallback(name: string, _old: string, next: string): void {
    // Re-render con nuevas props del shell
    if (this.root) {
      this.root.render(<App locale={next} />);
    }
  }
}

customElements.define('portfolio-react-mf', PortfolioReactMf);
```

### ErrorBoundary — Obligatorio en toda vista

```typescript
// Envuelve cada vista principal con ErrorBoundary
<ErrorBoundary fallback={<ErrorState message="No se pudo cargar el contenido" />}>
  <Suspense fallback={<ProjectsSkeleton />}>
    <ProjectList />
  </Suspense>
</ErrorBoundary>
```

---

## Testing con Vitest

```typescript
// ✅ Tests de use-cases con repositorio en memoria
describe('GetProjects', () => {
  it('retorna proyectos ordenados por fecha descendente', async () => {
    const repo = new InMemoryProjectRepository([mockProjectOld, mockProjectNew]);
    const useCase = new GetProjects(repo);
    const result = await useCase.execute();
    expect(result[0].id).toBe(mockProjectNew.id);
  });

  it('propaga el error del repositorio', async () => {
    const repo = new FailingProjectRepository();
    const useCase = new GetProjects(repo);
    await expect(useCase.execute()).rejects.toThrow();
  });
});

// ✅ Tests de hooks con renderHook
describe('useProjects', () => {
  it('cambia a estado cargado tras obtener proyectos', async () => {
    const { result } = renderHook(() => useProjects());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.projects.length).toBeGreaterThan(0);
  });
});
```

---

## Reglas Absolutas

- **NUNCA** `any`, `as any`, `@ts-ignore`
- **NUNCA** `useEffect` sin cleanup si hay suscripciones, timers o listeners
- **NUNCA** `async` directamente en `useEffect` — función interna async
- **NUNCA** importar desde `apps/portfolio-angular-mf/` o `apps/portfolio-shell-astro/`
- **NUNCA** `window.postMessage`, `CustomEvent` global para comunicación MFE
- **NUNCA** acceder al DOM del Shell (`document.getElementById`, `window.parent`)
- **SIEMPRE** `validateTabMessage` antes de usar el payload de cualquier evento
- **SIEMPRE** `ErrorBoundary` + `Suspense` en vistas principales
- **SIEMPRE** lógica de negocio en hooks, no en componentes

---

## Verificación

```bash
pnpm --filter @portfolio/react-mf build
pnpm --filter @portfolio/react-mf test
pnpm --filter @portfolio/react-mf test --coverage
```
