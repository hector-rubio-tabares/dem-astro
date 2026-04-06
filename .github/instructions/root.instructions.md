---
applyTo: "**"
---

# Monorepo: Portfolio MFE — Reglas Globales

Este monorepo es un portafolio personal con arquitectura micro-frontend. Toda tarea de implementación pasa por el agente coordinador **MFE Architect**, que delega a los especialistas según el archivo activo.

---

## Estructura del Monorepo

```
portfolio-monorepo/
├── apps/
│   ├── portfolio-shell-astro/     → Shell orquestador (Astro 6.0)
│   ├── portfolio-angular-mf/      → MFE Admin (Angular 21)
│   └── portfolio-react-mf/        → MFE Público (React 19)
├── packages/
│   └── mf-shared/                 → Contratos, EventBus, validadores
├── .claude/
│   ├── agents/                    → Definiciones de agentes especialistas
│   └── instructions/              → Este directorio
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Reglas Universales (aplican a TODOS los archivos)

### Calidad de código
- TypeScript estricto en todo el monorepo: `strict: true`, sin `any`, sin `@ts-ignore`
- Nunca generes código con `// TODO`, `// ...`, `// implementar`, o fragmentos incompletos
- Cada archivo entregado debe compilar sin errores antes de considerarse válido
- Nombres en **inglés** para código (variables, funciones, clases, tipos)
- **Cero comentarios en el código** — ni `//`, ni `/* */`, ni JSDoc, ni comentarios HTML (`<!-- -->`). El código debe ser autoexplicativo
- **Un archivo, una responsabilidad** — nunca agrupar múltiples clases, componentes o lógicas no relacionadas en un mismo archivo. Separar siempre en archivos dedicados

### Arquitectura
- Los MFEs nunca se importan entre sí directamente — solo via `@mf/shared`
- Ningún MFE accede al DOM del shell ni de otro MFE
- Toda comunicación entre MFEs pasa por `EventBus` de `@mf/shared`
- La API nunca se llama con `fetch` directo desde los componentes — siempre via adapters

### Seguridad
- Sin `console.log` con datos sensibles (tokens, emails, IDs de usuario)
- Sin secretos hardcodeados — siempre variables de entorno
- Sin `eval()`, `innerHTML` sin sanitizar, ni `dangerouslySetInnerHTML` sin justificación
- CORS: solo orígenes explícitos en whitelist, nunca `*`

### Commits y verificación
- Antes de dar una tarea por terminada, indica el comando de build/test exacto
- Formato de commit: `type(scope): descripción en español` — ej. `feat(react-mf): agrega vista de proyectos`

---

## Mapa de Agentes

| Archivo activo | Agente principal | Agente de soporte |
|---------------|-----------------|-------------------|
| `apps/portfolio-shell-astro/**` | Astro Expert | Architecture Expert |
| `apps/portfolio-angular-mf/**` | Angular Expert | Review Expert |
| `apps/portfolio-react-mf/**` | React Expert | Review Expert |
| `packages/mf-shared/**` | Architecture Expert | Review Expert |
| Decisión cross-MFE | MFE Architect | todos |
| Auditoría / revisión | Review Expert | — |

---

## Comandos Útiles

```bash
pnpm dev                                    # arranca todos en paralelo
pnpm dev:hot                                # con HMR para shell + MFEs
pnpm build                                  # build completo del monorepo
pnpm --filter @portfolio/shell build        # solo el shell
pnpm --filter @portfolio/react-mf build     # solo React MFE
pnpm --filter @portfolio/angular-mf build   # solo Angular MFE
pnpm --filter @mf/shared build              # solo contratos compartidos
pnpm test                                   # tests en todos los packages
pnpm lint                                   # lint en todo el monorepo
```
