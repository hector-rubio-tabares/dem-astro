# Estrategia de Entornos (Monorepo -> Repos Separados)

## Objetivo
Cada app tiene su propia configuracion de entorno y despliegue independiente:
- shell Astro
- react MF
- angular MF

## Shell Astro
Archivos:
- apps/portfolio-shell-astro/.env (local)
- apps/portfolio-shell-astro/.env.production (prod)
- apps/portfolio-shell-astro/.env.example

Variables publicas:
- PUBLIC_REACT_MF_DEV_URL
- PUBLIC_ANGULAR_MF_DEV_URL
- PUBLIC_REACT_MF_PROD_URL
- PUBLIC_ANGULAR_MF_PROD_URL
- PUBLIC_ALLOWED_REMOTE_ORIGINS
- PUBLIC_MF_MODULE_TIMEOUT_MS

## React MF
Archivos:
- apps/portfolio-react-mf/.env
- apps/portfolio-react-mf/.env.production
- apps/portfolio-react-mf/.env.example

Variables:
- VITE_MF_HOST
- VITE_MF_PORT
- VITE_ALLOWED_SHELL_ORIGINS

## Angular MF
Archivos:
- apps/portfolio-angular-mf/src/environments/environment.ts
- apps/portfolio-angular-mf/src/environments/environment.prod.ts
- apps/portfolio-angular-mf/.env.example (solo referencia)

## Paso de debug a prod
1. Definir URLs reales de despliegue en cada app.
2. En shell, actualizar URLs de remotos y allowlist.
3. En React MF, actualizar CORS permitidos al dominio real del shell.
4. En Angular MF, cambiar apiBaseUrl en environment.prod.ts.
5. Validar integracion en stage antes de prod.

## Cuando se separen en 3 repos
- Cada repo mantiene su propio .env/.env.production y pipelines.
- El shell consume URLs versionadas de cada MF (manifiesto o variables por entorno).
- No compartir secretos entre repos; usar variables del proveedor de hosting.
