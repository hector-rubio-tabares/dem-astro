---
applyTo: "packages/mf-shared/**"
---

# Contexto: @mf/shared — Contratos Compartidos

El archivo actual es parte del paquete de contratos compartidos. Usa el agente **Architecture Expert** para cualquier modificación. **Todo cambio aquí afecta los 3 apps del monorepo.**

---

## ⚠️ Protocolo Obligatorio Antes de Modificar

Antes de tocar cualquier archivo de este paquete:

1. Busca **todos** los consumers del símbolo afectado en el monorepo
   ```bash
   grep -r "NombreDelTipo" apps/ --include="*.ts" --include="*.tsx"
   ```
2. Determina si el cambio es **aditivo** (nuevo tipo/campo opcional) o **breaking** (renombrar, eliminar, cambiar firma)
3. Si es breaking: versiona el tipo antes de migrar
4. Consulta al **Architecture Expert** antes de implementar
5. Después del cambio: `pnpm --filter @mf/shared build && pnpm build` para verificar que compila todo

---

## Estructura del Paquete

```
packages/mf-shared/
├── src/
│   ├── types/
│   │   ├── events.ts            → PortfolioEvent<T>, EventType, MFESource
│   │   ├── entities.ts          → Project, BlogPost, Skill, User (DTOs compartidos)
│   │   └── api.ts               → contratos request/response de la API
│   ├── event-bus/
│   │   ├── EventBus.ts          → implementación pub-sub (max 50 handlers por evento)
│   │   ├── BroadcastBridge.ts   → puente BroadcastChannel para cross-tab
│   │   └── validators.ts        → validateTabMessage, sanitizeDisplayString, assertAllowedOrigin
│   ├── store/
│   │   └── SharedStore.ts       → estado mínimo compartido (locale, theme, auth status)
│   ├── i18n/
│   │   └── i18nConfig.ts        → config base de i18next usada por ambos MFEs
│   └── api/
│       ├── ports.ts             → IProjectRepository, IBlogRepository, ISkillRepository
│       └── adapters/
│           ├── mock/
│           │   └── MockProjectRepository.ts   → MSW handlers + datos fake
│           └── http/
│               └── HttpProjectRepository.ts   → fetch real (vacío hasta tener API)
├── package.json                 → name: "@mf/shared"
└── tsconfig.json
```

---

## Contrato de Evento — Schema Inmutable

**Todo evento del sistema sigue este schema sin excepción.** Nunca publiques objetos sin este wrapper.

```typescript
// types/events.ts

export type EventType =
  | 'portfolio:updated'
  | 'portfolio:deleted'
  | 'auth:login'
  | 'auth:logout'
  | 'auth:token-refreshed'
  | 'auth:force-logout'
  | 'i18n:locale-changed'
  | 'cache:invalidated'
  | 'public:contact-form-submitted';

export type MFESource = 'admin' | 'public' | 'shell';

export interface PortfolioEvent<T = unknown> {
  readonly type: EventType;
  readonly source: MFESource;
  readonly payload: T;
  readonly timestamp: number;        // Date.now()
  readonly correlationId: string;    // crypto.randomUUID()
  readonly version: '1.0';           // para migraciones futuras
}

// Tipos de payload por evento
export interface PortfolioUpdatedPayload { project: Project; }
export interface AuthLoginPayload       { userId: string; role: 'admin' | 'viewer'; }
export interface LocaleChangedPayload   { locale: string; previousLocale: string; }
export interface CacheInvalidatedPayload { keys: string[]; reason: string; }
```

---

## EventBus — Reglas de Implementación

```typescript
// event-bus/EventBus.ts

// Límite de handlers por tipo de evento
const MAX_HANDLERS_PER_TYPE = 50;

// El bus combina CustomEvent (intra-tab) + BroadcastChannel (cross-tab)
class EventBusImpl {
  private handlers = new Map<EventType, Set<Handler>>();
  private channel = new BroadcastChannel('portfolio-events');

  on<T>(type: EventType, handler: (event: PortfolioEvent<T>) => void): Unsubscribe {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    const set = this.handlers.get(type)!;

    if (set.size >= MAX_HANDLERS_PER_TYPE) {
      throw new Error(`EventBus: límite de ${MAX_HANDLERS_PER_TYPE} handlers para "${type}"`);
    }

    set.add(handler as Handler);
    return () => set.delete(handler as Handler);   // retorna unsubscribe
  }

  publish<T>(event: PortfolioEvent<T>): void {
    validateTabMessage(event);                      // validar antes de emitir
    this.dispatch(event);                           // intra-tab
    this.channel.postMessage(event);               // cross-tab
  }
}

export const EventBus = new EventBusImpl();
export type Unsubscribe = () => void;
```

---

## Validadores — Reglas Estrictas

```typescript
// event-bus/validators.ts

export function validateTabMessage(event: unknown): asserts event is PortfolioEvent {
  if (!event || typeof event !== 'object') throw new Error('Evento inválido: no es objeto');

  const e = event as Record<string, unknown>;

  if (!VALID_EVENT_TYPES.includes(e.type as EventType))
    throw new Error(`Tipo de evento desconocido: ${e.type}`);

  if (!VALID_MFE_SOURCES.includes(e.source as MFESource))
    throw new Error(`Fuente de evento inválida: ${e.source}`);

  if (typeof e.timestamp !== 'number' || e.timestamp > Date.now() + 5000)
    throw new Error('Timestamp inválido o en el futuro');

  if (typeof e.correlationId !== 'string' || e.correlationId.length < 10)
    throw new Error('correlationId inválido');

  if (e.version !== '1.0')
    throw new Error(`Versión de evento no soportada: ${e.version}`);
}

export function sanitizeDisplayString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .slice(0, 500);   // límite de longitud
}

export function assertAllowedOrigin(url: string, allowedOrigins: string[]): void {
  const { origin } = new URL(url);
  if (!allowedOrigins.includes(origin)) {
    throw new Error(`Origen no permitido: ${origin}`);
  }
}
```

---

## API Ports — Interfaces Inmutables

```typescript
// api/ports.ts — Los MFEs dependen de estas interfaces, NUNCA de implementaciones

export interface IProjectRepository {
  getAll(): Promise<Project[]>;
  getById(id: string): Promise<Project>;
  create(data: CreateProjectDTO): Promise<Project>;
  update(id: string, data: UpdateProjectDTO): Promise<Project>;
  delete(id: string): Promise<void>;
}

export interface IBlogRepository {
  getAll(): Promise<BlogPost[]>;
  getById(id: string): Promise<BlogPost>;
  publish(id: string): Promise<BlogPost>;
}

// Hoy: MockProjectRepository (desarrollo con MSW)
// Mañana: HttpProjectRepository (API real) — los MFEs no cambian
```

---

## Clasificación de Cambios

| Tipo | Ejemplo | Riesgo | Protocolo |
|------|---------|--------|-----------|
| **Aditivo** | Nuevo campo opcional, nuevo EventType | Bajo | PR normal + build check |
| **Aditivo estructural** | Nueva interfaz de repositorio | Medio | Avisar a los MFEs, migration guide |
| **Breaking** | Renombrar tipo, cambiar firma de método | Alto | Versionar tipo, migrar todos los consumers antes del merge |
| **Seguridad** | Cambio en `validateTabMessage` | Crítico | Architecture Expert + Review Expert antes del merge |

---

## Reglas Absolutas

- **NUNCA** modifiques este paquete sin el protocolo de búsqueda de consumers
- **NUNCA** elimines o renombres un tipo sin versionar primero
- **NUNCA** publiques un evento sin `correlationId` y `version`
- **NUNCA** bajes el nivel de validación en `validateTabMessage`
- **NUNCA** importes desde `apps/*` — este paquete no depende de ninguna app
- **SIEMPRE** `pnpm --filter @mf/shared build && pnpm build` para verificar que todo compila
- **SIEMPRE** el `EventBus` retorna una función de unsubscribe — nunca void
- **SIEMPRE** el límite de 50 handlers por tipo se respeta con throw explícito

---

## Verificación

```bash
pnpm --filter @mf/shared build
pnpm --filter @mf/shared build && pnpm build    # verificar que NO rompe nada upstream
grep -r "NombreDelTipoCambiado" apps/ --include="*.ts" --include="*.tsx"
```
