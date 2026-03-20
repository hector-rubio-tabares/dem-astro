# Sistema de Diseño Compartido

Sistema de estilos CSS compartido entre Shell Astro, React MFE y Angular MFE.

## 📦 Estructura

```
@mf/shared/src/styles/
├── design-tokens.css    → Tokens base (colores, tipografía, espaciado, etc.)
├── theme-light.css      → Tema claro (variables semánticas)
├── theme-dark.css       → Tema oscuro (variables semánticas)
├── global.css           → Punto de entrada (importa todos + utilidades)
└── mfe-integration.css  → Estilos específicos para contenedores MFE
```

## 🎨 Uso

### En Astro (Shell)
```astro
---
import '@mf/shared/styles/global.css';
import '@mf/shared/styles/mfe-integration.css';
---
```

### En React (MFE)
```tsx
// main.tsx o App.tsx
import '@mf/shared/styles/global.css';
import './App.css'; // Estilos específicos del componente
```

### En Angular (MFE)
```css
/* styles.css (global) */
@import '@mf/shared/styles/global.css';
```

```css
/* app.css (componente) */
/* Las variables CSS ya están disponibles globalmente */
.mi-componente {
  color: var(--color-text-primary);
  padding: var(--spacing-4);
}
```

## 🎭 Temas

El sistema soporta dos temas:
- **Light** (por defecto)
- **Dark** (activado con `data-theme="dark"` en `<html>`)

El cambio de tema es automático vía JavaScript en el shell:
```js
document.documentElement.setAttribute('data-theme', 'dark');
```

También respeta la preferencia del sistema operativo con `prefers-color-scheme: dark`.

## 🧩 Variables Disponibles

### Colores Semánticos
```css
var(--color-bg-primary)         /* Fondo principal */
var(--color-text-primary)       /* Texto principal */
var(--color-border-primary)     /* Borde principal */
var(--color-button-primary-bg)  /* Botón primario */
```

### MFE Específicos
```css
var(--color-mfe-react-primary)   /* Color React: #14b8ff (light) / #4dc3ff (dark) */
var(--color-mfe-angular-primary) /* Color Angular: #ff8c2a (light) / #ffaa5a (dark) */
```

### Espaciado
```css
var(--spacing-1)  /* 4px */
var(--spacing-4)  /* 16px */
var(--spacing-8)  /* 32px */
```

### Tipografía
```css
var(--font-family-sans)
var(--font-size-base)    /* 16px */
var(--font-weight-semibold)
```

## 📱 Responsive

Utiliza las clases utility o media queries con breakpoints:
```css
@media (max-width: 768px) {
  /* Mobile */
}

@media (min-width: 1024px) {
  /* Desktop */
}
```

## ✨ Componentes Reutilizables

Clases disponibles globalmente:
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.card`
- `.input`
- `.container`
- `.flex`, `.flex-col`, `.items-center`, `.justify-between`
- `.grid`, `.grid-cols-1`, `.grid-cols-2` (md), `.grid-cols-3` (lg)
- `.gap-2`, `.gap-4`, `.gap-6`, `.gap-8`
- `.mt-4`, `.mb-8`, `.p-4`, `.p-6`

## 🔒 Convenciones

1. **No duplicar tokens**: Usa siempre `var(--token-name)`, nunca valores hardcoded
2. **Responsive first**: Diseña mobile-first, luego agrega media queries
3. **Temas consistentes**: Prueba en light y dark antes de commit
4. **Componentes modulares**: Los estilos de MFE solo estilizan su propio componente
5. **Accesibilidad**: Usa `.visually-hidden` para texto SR-only, `.focus-visible` para focus states

## 🧪 Testing

Para verificar que los estilos funcionan:
```bash
pnpm dev:hot
```

Navega a:
- http://localhost:4321 (Home con MFEs)
- http://localhost:4321/projects (Proyectos)
- http://localhost:4321/admin (Panel protegido)

Prueba el toggle de tema en el header.
