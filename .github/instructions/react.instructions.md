---
applyTo: "apps/portfolio-react-mf/**"
---

# Contexto: React MFE

El archivo actual pertenece al MFE de React. Usa el agente **React Expert** para cualquier tarea de implementación.

- Arquitectura: `domain → application → infrastructure → presentation`
- Framework: React 19 + Vite + TypeScript estricto
- Comunicación: EventBus de `@mf/shared`, nunca `window.postMessage`
- Tests: Vitest en la raíz del monorepo
- Build: `pnpm --filter @portfolio/react-mf build`
