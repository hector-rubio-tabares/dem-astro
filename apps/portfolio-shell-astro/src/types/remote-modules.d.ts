// Os MFEs se cargan dinámicamente desde URLs configuradas por variable de entorno.
// URL del módulo de entrada de cada MFE (una sola variable por MFE, el valor cambia por entorno):
//   PUBLIC_REACT_MF_URL    → URL completa, ej: http://127.0.0.1:5173/src/mf-entry.tsx
//   PUBLIC_ANGULAR_MF_URL  → URL completa, ej: http://127.0.0.1:4201/main.js
//
// El contrato de mount/unmount está implícito en MountStrategy (packages/mf-shared/src/strategies.ts).

