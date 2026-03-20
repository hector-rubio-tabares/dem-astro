---
applyTo: "apps/portfolio-angular-mf/**"
---

# Contexto: Angular MFE

El archivo actual pertenece al MFE de Angular. Usa el agente **Angular Expert** para cualquier tarea de implementación.

- Framework: Angular 21 + Signals + Zoneless + OnPush obligatorio
- Montaje: Custom Element (`<portfolio-angular-mf>`) desde el Shell Astro
- Comunicación: EventBus de `@mf/shared`
- Build: `pnpm --filter @portfolio/angular-mf build`
