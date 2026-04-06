# MFE Loader Service - Guía de Uso

Servicio centralizado para cargar Micro-Frontends con arquitectura **Factory + Strategy**.

## 📦 Arquitectura

```
@mf/shared/src/
├── mfe-loader.ts           # Servicio principal (Singleton)
├── remote-module-loader.ts # Utilidad de carga con timeout
└── index.ts               # Exports públicos
```

---

## 🎯 Principios SOLID

- **Single Responsibility**: Solo carga MFEs (no lógica de negocio)
- **Open/Closed**: Extensible vía catálogo (agregar nuevos MFEs sin modificar service)
- **Dependency Inversion**: Páginas dependen del servicio, no de implementación
- **Strategy Pattern**: Cada MFE tiene su estrategia (Web Component vs Mount Function)
- **Factory Pattern**: Crea instancias según tipo configurado

---

## 🚀 Uso Básico

### Cargar un solo MFE

```typescript
import { mfeLoader } from '@mf/shared';

// Web Component (Angular) - se registra automáticamente
await mfeLoader.load('projects');

// Mount Function (React) - necesita container
await mfeLoader.load('about', 'about-container');
// O con elemento DOM directo:
const container = document.getElementById('about-container');
await mfeLoader.load('about', container);
```

### Cargar múltiples MFEs en paralelo

```typescript
import { mfeLoader } from '@mf/shared';

const results = await mfeLoader.loadMultiple([
  ['projects'],                     // Web Component (no container)
  ['about', 'about-container'],     // Mount Function (con container)
  ['angular-demo'],                 // Otro Web Component
]);

// Verificar resultados
const failures = results.filter(r => !r.success);
if (failures.length > 0) {
  console.error('Componentes fallidos:', failures);
}
```

### Remover loading screen

```typescript
// Helper incluido en el servicio
mfeLoader.removeLoadingScreen();
```

---

## 📋 Catálogo de MFEs

El servicio incluye un catálogo tipado. Los MFEs disponibles son:

| Tipo           | Framework | Tipo Carga      | Tag/Function            |
|----------------|-----------|-----------------|-------------------------|
| `projects`     | Angular   | Web Component   | `<portfolio-projects>`  |
| `about`        | React     | Mount Function  | `mountAbout()`          |
| `angular-demo` | Angular   | Web Component   | `<portfolio-angular-mf>`|
| `react-demo`   | React     | Mount Function  | `mount()`               |

### Agregar nuevo MFE al catálogo

Editar `packages/mf-shared/src/mfe-loader.ts`:

```typescript
// 1. Agregar tipo
export type MFEType = 
  | 'projects' 
  | 'about' 
  | 'angular-demo' 
  | 'react-demo'
  | 'nuevo-mfe';  // ← Agregar aquí

// 2. Agregar configuración
const MFE_CATALOG: Record<MFEType, MFEConfig> = {
  // ... otros MFEs
  'nuevo-mfe': {
    name: 'Nuevo MFE',
    type: 'webcomponent',  // o 'mount-function'
    devServer: 'http://127.0.0.1:4300',
    devModulePath: '/main.js',
    prodModulePath: '/mf/nuevo/main.js',
    tagName: 'nuevo-mfe-tag',  // O mountFunctionName si es mount function
  },
};
```

---

## 📄 Ejemplo: Página Portfolio (index.astro)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout loadsMFEs={true}>
  <div class="container">
    <!-- Web Component placeholder -->
    <portfolio-projects></portfolio-projects>
    
    <!-- Mount Function placeholder -->
    <div id="about-container"></div>
  </div>
</BaseLayout>

<script>
  import { mfeLoader } from '@mf/shared';

  async function initializePage() {
    try {
      // Cargar MFEs en paralelo
      await mfeLoader.loadMultiple([
        ['projects'],
        ['about', 'about-container'],
      ]);

      mfeLoader.removeLoadingScreen();
    } catch (error) {
      console.error('Error cargando MFEs:', error);
      mfeLoader.removeLoadingScreen();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage, { once: true });
  } else {
    initializePage();
  }
</script>
```

---

## 📄 Ejemplo: Página Admin (solo Angular demo)

```astro
<BaseLayout loadsMFEs={true}>
  <div class="container">
    <portfolio-angular-mf></portfolio-angular-mf>
  </div>
</BaseLayout>

<script>
  import { mfeLoader } from '@mf/shared';

  async function initializeAdmin() {
    await mfeLoader.load('angular-demo');
    mfeLoader.removeLoadingScreen();
  }

  document.addEventListener('DOMContentLoaded', initializeAdmin, { once: true });
</script>
```

---

## 🔒 Seguridad

El loader incluye validaciones de seguridad:

- **Timeout**: 8 segundos por defecto (configurable)
- **Origin Validation**: Opcional (dev permite localhost/127.0.0.1)
- **Error Isolation**: Retorna `LoadResult` sin romper la aplicación

### Configurar orígenes permitidos

```typescript
import { loadRemoteModule } from '@mf/shared';

const module = await loadRemoteModule(
  'https://cdn.example.com/mfe.js',
  {
    timeout: 10000,
    allowedOrigins: new Set(['https://cdn.example.com']),
  }
);
```

---

## 🎨 Guard de Ejecución Única

El servicio previene cargas duplicadas internamente:

```typescript
mfeLoader.isLoaded('projects'); // false

await mfeLoader.load('projects');

mfeLoader.isLoaded('projects'); // true

// Intentar cargar de nuevo:
await mfeLoader.load('projects'); // No-op (ya cargado, no error)
```

---

## 🛠 API Completa

### `mfeLoader.load(mfeType, containerOrId?)`

Carga un MFE específico.

**Parámetros:**
- `mfeType`: Tipo de MFE del catálogo ('projects', 'about', etc.)
- `containerOrId`: (Opcional) Elemento DOM o ID para mount functions

**Returns:** `Promise<LoadResult>`

```typescript
interface LoadResult {
  success: boolean;
  componentName: string;
  error?: Error;
}
```

### `mfeLoader.loadMultiple(requests)`

Carga múltiples MFEs en paralelo.

**Parámetros:**
- `requests`: Array de tuplas `[mfeType]` o `[mfeType, container]`

**Returns:** `Promise<LoadResult[]>`

### `mfeLoader.isLoaded(mfeType)`

Verifica si un MFE ya fue cargado.

**Returns:** `boolean`

### `mfeLoader.removeLoadingScreen()`

Remueve el overlay de carga (#mfe-loading-screen).

**Returns:** `void`

---

## 📊 Beneficios vs Implementación Manual

| Aspecto                  | Manual (antes)       | MFELoaderService (ahora) |
|--------------------------|----------------------|--------------------------|
| **Líneas por página**    | ~80 líneas           | ~25 líneas (68% menos)   |
| **Duplicación de código**| Alta (cada página)   | Cero (DRY)               |
| **Tipado**               | Ninguno              | Completo (TypeScript)    |
| **Guard duplicados**     | Manual por página    | Automático (servicio)    |
| **Mantenibilidad**       | Baja                 | Alta (Single Source)     |
| **Extensibilidad**       | Difícil              | Fácil (Catálogo)         |

---

## 🧪 Testing

```typescript
import { MFELoaderService } from '@mf/shared';

describe('MFELoaderService', () => {
  let loader: MFELoaderService;

  beforeEach(() => {
    loader = new MFELoaderService();
  });

  it('should load web component', async () => {
    const result = await loader.load('projects');
    expect(result.success).toBe(true);
  });

  it('should prevent duplicate loads', async () => {
    await loader.load('projects');
    expect(loader.isLoaded('projects')).toBe(true);
    
    // Segunda carga no debe fallar
    const result = await loader.load('projects');
    expect(result.success).toBe(true);
  });
});
```

---

## 🔗 Referencias

- [Design Patterns: Factory](https://refactoring.guru/design-patterns/factory-method)
- [Design Patterns: Strategy](https://refactoring.guru/design-patterns/strategy)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
