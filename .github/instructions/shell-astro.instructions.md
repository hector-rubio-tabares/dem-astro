---
applyTo: "apps/portfolio-shell-astro/**"
---

# Contexto: Shell Astro — Orquestador MFE

El archivo actual pertenece al Shell. El Shell **no implementa lógica de negocio**: carga, inicializa y coordina los MFEs remotos. Usa **Astro Expert** para implementación y **Architecture Expert** para decisiones de orquestación.

---

## Stack

- **Astro 6.0** — SSR habilitado, Islands architecture
- **TypeScript estricto** — sin `any`, sin `@ts-ignore`
- **Middleware** — auth, CSP, headers de seguridad
- **pnpm workspace** — alias `@portfolio/shell`

---

## Mapa de Responsabilidades del Shell

```
apps/portfolio-shell-astro/
├── src/
│   ├── pages/
│   │   ├── index.astro          → landing (carga React MFE público)
│   │   ├── admin/
│   │   │   └── [...slug].astro  → panel admin (carga Angular MFE, requiere auth)
│   │   └── api/                 → endpoints SSR si los hay
│   ├── layouts/
│   │   └── BaseLayout.astro     → inicializa EventBus UNA SOLA VEZ aquí
│   ├── middleware.ts             → auth + CSP + headers
│   ├── scripts/
│   │   ├── mf-loader.ts         → loadMultipleMicrofrontends (Promise.allSettled)
│   │   ├── mf-runtime.ts        → importRemoteWithTimeout (timeout 8 s, whitelist)
│   │   └── event-bus.ts         → init y cleanup del bus en el shell
│   ├── components/              → Astro Islands (client:idle / client:visible)
│   └── core/
│       ├── application/
│       │   ├── ports/           → interfaces de los servicios del shell
│       │   └── use-cases/       → orquestación de carga MFE
│       └── infrastructure/
│           └── adapters/        → implementaciones (storage, HTTP, MFE remoto)
```

---

## Reglas de Implementación

### Frontmatter (servidor)
- Toda validación de sesión y lectura de datos va aquí, nunca en el cliente
- Usa `Astro.locals` para pasar contexto del middleware a la página
- `import.meta.env` con prefijo `PUBLIC_` solo para variables realmente públicas
- Redirige con `return Astro.redirect('/login')` si no hay sesión en páginas protegidas

### Islands (`client:*`)
- `client:idle` para contenido no crítico (portafolio, blog)
- `client:visible` para contenido below-the-fold
- `client:load` solo para el panel admin (requiere auth inmediata)
- Nunca `client:only` salvo que el componente sea 100% client-side sin alternativa SSR

### Carga de MFEs (`mf-loader.ts`)
```typescript
// SIEMPRE Promise.allSettled — nunca Promise.all (un fallo no rompe el otro)
const results = await Promise.allSettled([
  importRemoteWithTimeout(REACT_MFE_URL, 8000),
  importRemoteWithTimeout(ANGULAR_MFE_URL, 8000),
]);

results.forEach((result, i) => {
  if (result.status === 'rejected') {
    // Mostrar fallback por MFE individual, loguear error, NO lanzar
    reportMfeLoadError(MFE_NAMES[i], result.reason);
  }
});
```

### Validación de origen (`mf-runtime.ts`)
```typescript
// Llamar SIEMPRE antes de importar cualquier módulo remoto
assertAllowedRemoteOrigin(url, ALLOWED_REMOTE_ORIGINS);
// ALLOWED_REMOTE_ORIGINS viene de variables de entorno, no hardcodeado
```

### EventBus en el Shell
- Inicializar **una sola vez** en `BaseLayout.astro` — nunca en páginas individuales
- Limpiar handlers en el evento `astro:before-swap` (View Transitions)
- No suscribirse a eventos en el frontmatter — solo en scripts de cliente

---

## Middleware (`middleware.ts`)

Orden obligatorio de ejecución:

```
1. Validar sesión / JWT           → redirigir si página protegida sin auth
2. Sanitizar headers de entrada   → strip headers peligrosos
3. Inyectar headers de seguridad  → CSP, HSTS, X-Frame-Options, etc.
4. next()                         → pasar al handler de Astro
```

Headers de seguridad mínimos obligatorios:
```
Content-Security-Policy: [ver sección CSP]
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## CSP (Content Security Policy)

```
default-src 'self';
script-src  'self' [hashes de scripts inline] [dominios MFE en whitelist];
style-src   'self' 'unsafe-inline';   ← solo si los MFEs lo requieren
connect-src 'self' [orígenes exactos de los MFEs] [API endpoint];
img-src     'self' data: [CDN si existe];
font-src    'self';
frame-src   'none';
object-src  'none';
base-uri    'self';
```

**NUNCA**: `unsafe-inline` en `script-src`, `unsafe-eval` en producción, ni `*` en ningún directive.

---

## Reglas Absolutas

- **NUNCA** implementes lógica de negocio en el shell (proyectos, blog, auth de usuario)
- **NUNCA** uses `unsafe-inline` o `unsafe-eval` en `script-src` de producción
- **NUNCA** importes módulos remotos sin pasar por `assertAllowedRemoteOrigin`
- **NUNCA** uses `Promise.all` para cargar MFEs — usa siempre `Promise.allSettled`
- **NUNCA** inicialices el EventBus más de una vez (check `window.__eventBusInitialized`)
- **SIEMPRE** proporciona un fallback visual por cada MFE que pueda fallar al cargar
- **SIEMPRE** limpia los handlers del EventBus en `astro:before-swap`
- **SIEMPRE** valida el origen antes de cualquier `importRemote`

---

## Verificación

```bash
pnpm --filter @portfolio/shell build
pnpm --filter @portfolio/shell preview   # verificar headers CSP en producción
```
