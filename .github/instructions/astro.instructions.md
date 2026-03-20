---
applyTo: "apps/portfolio-shell-astro/**"
---

# Contexto: Shell Astro

El archivo actual pertenece al Shell orquestador. Usa el agente **Astro Expert** para implementación y el **Architecture Expert** para decisiones de orquestación MFE.

- Framework: Astro 6.0 + Islands architecture + SSR middleware
- Rol: cargar, montar y coordinar MFEs remotos (React + Angular)
- Seguridad: CSP estricto, validación de origen, `importRemoteWithTimeout`
- Build: `pnpm --filter @portfolio/shell build`
