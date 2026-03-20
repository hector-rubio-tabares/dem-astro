/// <reference types="astro/client" />

/**
 * TYPE DEFINITIONS - Astro Context
 * Extensión de tipos para Astro (context.locals, imports)
 */

import type { User } from './core/entities/User';

declare namespace App {
  interface Locals {
    // Usuario autenticado (agregado por middleware)
    user?: User;
    isAuthenticated?: boolean;
    
    // Backward compatibility
    requiresAuth?: boolean;
  }
}
