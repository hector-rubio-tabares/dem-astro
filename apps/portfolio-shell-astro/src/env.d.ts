/// <reference types="astro/client" />

import type { User } from './core/entities/User';

declare namespace App {
  interface Locals {
    user?: User;
    isAuthenticated?: boolean;
    requiresAuth?: boolean;
  }
}
