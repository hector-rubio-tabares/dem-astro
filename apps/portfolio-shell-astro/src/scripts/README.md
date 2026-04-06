# Arquitectura de Scripts - Shell Astro

## 📂 Estructura de Scripts (`apps/portfolio-shell-astro/src/scripts/`)

### 🎯 Scripts de Producción

#### **mf-init.ts** (Inicializador Universal)
**Propósito**: Función de setup universal para TODAS las páginas del sitio.

**Usado en**:
- [/ (Home)](../pages/index.astro)
- [/projects](../pages/projects.astro)
- [/admin](../pages/admin.astro)

**Responsabilidades**:
- ✅ Detectar modo (desarrollo vs producción)
- ✅ Configurar URLs de MFEs según entorno
- ✅ Crear EventBus compartido
- ✅ Inicializar BroadcastChannel multi-tab
- ✅ Crear MicrofrontendContext singleton
- ✅ Cargar todos los MFEs en paralelo

**Ejemplo de uso**:
```typescript
// En cualquier página Astro
import { initializeMicrofrontends } from '../scripts/mf-init';

document.addEventListener('DOMContentLoaded', async () => {
  await initializeMicrofrontends();
});
```

---

#### **mf-loader.ts** (Cargador de MFEs)
**Propósito**: Lógica de carga e integración de micro-frontends.

**Responsabilidades**:
- ✅ Buscar slots en el DOM: `.mf-slot[data-mf="react"]`
- ✅ Importar módulos remotos con `import()` dinámico
- ✅ Aplicar **Strategy Pattern** para montaje:
  - `FunctionBasedMountStrategy` → React (función `mount()`)
  - `CustomElementMountStrategy` → Angular (Web Component)
- ✅ Inyectar contexto global (backward compatibility)
- ✅ Manejo de errores individual (un MFE falla ≠ todos fallan)

**API Principal**:
```typescript
export async function loadMicrofrontend(config: MicrofrontendConfig): Promise<number>
export async function loadMultipleMicrofrontends(configs: MicrofrontendConfig[]): Promise<Map<MicrofrontendType, number>>
```

**Flujo interno**:
```
1. Encontrar slots → querySelectorAll(config.selector)
2. Validar origen → assertAllowedRemoteOrigin()
3. Importar módulo → importRemoteWithTimeout()
4. Obtener strategy → MountStrategyFactory.getStrategy()
5. Montar en slots → strategy.mount()
```

---

#### **mf-runtime.ts** (Utilidades de Runtime)
**Propósito**: Funciones de bajo nivel para seguridad y carga.

**Funciones exportadas**:

- **`importRemoteWithTimeout()`**:
  ```typescript
  // Race entre import() y timeout (default: 8s)
  await importRemoteWithTimeout(
    'http://localhost:5173/src/mf-entry.tsx',
    new Set(['http://localhost:5173']),
    8000
  );
  ```

- **`assertAllowedRemoteOrigin()`**:
  ```typescript
  // Valida whitelist de URLs (capa de seguridad)
  assertAllowedRemoteOrigin(url, allowedOrigins);
  // Throws si el origen no está en la whitelist
  ```

- **`getElementByIdOrThrow()`**:
  ```typescript
  // Búsqueda defensiva de elementos
  const container = getElementByIdOrThrow('react-root');
  ```

- **`setStatus()`**:
  ```typescript
  // Actualización de UI sin lanzar errores
  setStatus(element, 'MFE cargado', 'ok');
  ```

**Constantes**:
```typescript
export const DEFAULT_MODULE_TIMEOUT_MS = 8000; // 8 segundos
```

---

### 🧪 Scripts de Testing

#### **event-bus.test.ts**
15 tests del EventBus:
- Pub-sub básico
- Límite de 50 handlers por evento
- Aislamiento de errores (un handler falla → otros continúan)
- Limpieza de listeners

#### **message-validator.test.ts**
28 tests de validadores:
- Type guards (`validateTabMessage`, `validateMultiTabMessage`)
- Sanitización XSS (`sanitizeDisplayString`)
- Rangos de valores (count: 0-1,000,000)
- Validación de UUID v4 (tabId)

**Ejecutar tests**:
```bash
pnpm test                # Todos los tests
pnpm test:watch          # Watch mode
pnpm test:coverage       # Con coverage
```

---

## 🔄 Flujo de Carga Completo

```
┌─────────────────────────────────────────────────┐
│ 1. Usuario navega a /projects                  │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. Astro renderiza projects.astro              │
│    - Ejecuta script: import { init... }        │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. mf-init.ts: initializeMicrofrontends()      │
│    - Detecta modo (DEV/PROD)                   │
│    - Crea EventBus                             │
│    - Crea BroadcastChannel                     │
│    - Inicializa MicrofrontendContext           │
│    - Prepara configs de React y Angular        │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 4. mf-loader.ts: loadMultipleMicrofrontends()  │
│    - Para cada config (paralelo):              │
│      ├─ Buscar slots en DOM                    │
│      ├─ Validar origen (mf-runtime)            │
│      ├─ Import con timeout (mf-runtime)        │
│      ├─ Obtener strategy (@mf/shared)          │
│      └─ Montar en cada slot encontrado         │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 5. MFEs montados y funcionando ✅               │
│    - React MFE renderizado                     │
│    - Angular MFE renderizado                   │
│    - EventBus compartido activo                │
│    - BroadcastChannel activo                   │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Diferencias vs Arquitectura Legacy

### ❌ Antes (Demo-Hot)
```
demo-hot.astro  →  demo-hot.ts  →  setupAstroControls()
                                 →  checkEndpoint()
                                 →  código específico de demo
```

**Problemas**:
- ❌ Código duplicado entre páginas
- ❌ Lógica de demo mezclada con producción
- ❌ No reutilizable

### ✅ Ahora (Productivo)
```
index.astro     ┐
projects.astro  ├──→  mf-init.ts  →  loadMultipleMicrofrontends()
admin.astro     ┘
```

**Ventajas**:
- ✅ Una sola fuente de verdad
- ✅ Código limpio y reutilizable
- ✅ Producción-ready desde el primer día

---

## 📝 Agregar Nueva Página con MFEs

1. **Crear página Astro**:
```astro
---
// pages/nueva-pagina.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Nueva Página">
  <div class="container">
    <h1>Mi Nueva Página</h1>
    
    <div class="mfe-grid">
      <div class="mfe-slot" data-mf="react"></div>
      <div class="mfe-slot" data-mf="angular"></div>
    </div>
  </div>
</BaseLayout>

<script>
  import { initializeMicrofrontends } from '../scripts/mf-init';
  
  document.addEventListener('DOMContentLoaded', async () => {
    await initializeMicrofrontends();
  });
</script>
```

2. **¡Listo!** Los MFEs se cargan automáticamente.

---

## 🔒 Seguridad en Scripts

### Origin Validation
```typescript
// mf-runtime.ts:assertAllowedRemoteOrigin()
const allowedOrigins = new Set([
  'http://localhost:5173',  // React dev
  'http://localhost:4201',  // Angular dev
]);

// Solo importa si el origen está en la whitelist
if (!allowedOrigins.has(parsed.origin)) {
  throw new Error(`Origen no autorizado: ${parsed.origin}`);
}
```

### Timeout Protection
```typescript
// mf-runtime.ts:importRemoteWithTimeout()
await Promise.race([
  import(/* @vite-ignore */ specifier),  // Import real
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), 8000);
  })
]);
```

### Error Isolation
```typescript
// mf-loader.ts
try {
  await strategy.mount(config);
  mountedCount++;
} catch (error) {
  console.error(`Error montando ${config.type}:`, error);
  // El error NO bloquea otros MFEs
}
```

---

## 🚀 Scripts NPM Relevantes

```bash
# Desarrollo
pnpm dev:hot              # 3 servidores (Shell + React + Angular)

# Testing
pnpm test                 # Ejecutar tests en scripts/
pnpm test:watch           # Watch mode

# Build (cuando sea necesario)
pnpm build:react-mf       # Build React MFE
pnpm build:angular-mf     # Build Angular MFE
```

---

**Resumen**: Scripts de producción listos. Sin código legacy. Arquitectura limpia y extensible.
