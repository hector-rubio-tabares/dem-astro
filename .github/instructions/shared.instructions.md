---
applyTo: "packages/mf-shared/**"
---

# Contexto: @mf/shared — Contratos Compartidos

El archivo actual es parte del paquete de contratos compartidos. Usa el agente **Architecture Expert** para cualquier modificación.

⚠️ **ATENCIÓN**: Cambios en `@mf/shared` afectan **todos** los MFEs. Antes de modificar:
1. Busca todos los consumers del símbolo afectado
2. Evalúa si es breaking change
3. Consulta al Architecture Expert

- `types.ts`: TabMessage, MultiTabMessage, MicroFrontendEvents, MountContext
- `event-bus.ts`: Pub-sub genérico (max 50 handlers)
- `message-validator.ts`: validateTabMessage, sanitizeDisplayString
- `strategies.ts`: FunctionBasedMountStrategy, CustomElementMountStrategy
