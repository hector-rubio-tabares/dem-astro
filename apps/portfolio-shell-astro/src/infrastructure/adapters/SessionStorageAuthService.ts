/**
 * INFRASTRUCTURE LAYER - Adapter: SessionStorage Auth Service
 * Implementación de IAuthService usando SessionStorage (DEMO)
 * 
 * IMPORTANTE: Esta es una implementación DEMO para desarrollo.
 * En producción, usar JWT con HttpOnly cookies y backend real.
 */

import type { IAuthService } from '../../application/ports/IAuthService';
import { User } from '../../core/entities/User';
import { AuthToken } from '../../core/value-objects/AuthToken';

interface StoredSession {
  username: string;
  roles: string[];
  token: string;
  expiresAt: string;
}

export class SessionStorageAuthService implements IAuthService {
  private readonly STORAGE_KEY = 'mfe-auth-session';
  private readonly DEMO_CREDENTIALS = {
    username: 'admin',
    password: 'admin123',
  };

  async login(username: string, password: string): Promise<{ user: User; token: AuthToken } | null> {
    // DEMO: Simular delay de red
    await this.simulateNetworkDelay(300);

    // DEMO: Validar credenciales hardcodeadas
    if (username === this.DEMO_CREDENTIALS.username && password === this.DEMO_CREDENTIALS.password) {
      const user = User.admin(username);
      const token = AuthToken.createDemo();

      // Guardar sesión
      this.saveSession(user, token);
      
      // CRÍTICO: Guardar token en cookie para middleware (server-side auth)
      this.setAuthCookie(token);

      console.log('[AuthService] ✅ Login exitoso:', username);
      return { user, token };
    }

    console.warn('[AuthService] ❌ Credenciales inválidas');
    return null;
  }

  logout(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
      
      // CRÍTICO: Eliminar cookie del servidor
      this.clearAuthCookie();
      
      console.log('[AuthService] ✅ Logout exitoso');
    } catch (error) {
      console.error('[AuthService] Error en logout:', error);
    }
  }

  getCurrentUser(): User | null {
    const session = this.loadSession();
    if (!session) return null;

    try {
      return User.create(session.username, session.roles);
    } catch (error) {
      console.error('[AuthService] Error creando usuario:', error);
      return null;
    }
  }

  getCurrentToken(): AuthToken | null {
    const session = this.loadSession();
    if (!session) return null;

    try {
      const expiresAt = new Date(session.expiresAt);
      const token = AuthToken.create(session.token, expiresAt);

      // Verificar si expiró
      if (token.isExpired()) {
        this.logout(); // Limpiar sesión expirada
        return null;
      }

      return token;
    } catch (error) {
      console.error('[AuthService] Error creando token:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getCurrentToken();
    return token !== null && token.isValid();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.hasRole(role);
  }

  // ═══════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════

  private saveSession(user: User, token: AuthToken): void {
    if (typeof sessionStorage === 'undefined') {
      console.warn('[AuthService] sessionStorage no disponible');
      return;
    }

    const session: StoredSession = {
      username: user.getUsername(),
      roles: user.getRoles(),
      token: token.getValue(),
      expiresAt: token.getExpiresAt().toISOString(),
    };

    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('[AuthService] Error guardando sesión:', error);
    }
  }

  private loadSession(): StoredSession | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }

    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      return JSON.parse(stored) as StoredSession;
    } catch (error) {
      console.error('[AuthService] Error cargando sesión:', error);
      return null;
    }
  }

  private async simulateNetworkDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════════════════
  // COOKIE MANAGEMENT (Server-Side Auth)
  // ═══════════════════════════════════════════════════════════

  /**
   * Guardar token en cookie para verificación server-side (middleware)
   * 
   * IMPORTANTE: En producción, el backend debe setear HttpOnly cookies
   * Esta implementación es DEMO - no puede setear HttpOnly desde JS
   */
  private setAuthCookie(token: AuthToken): void {
    if (typeof document === 'undefined') return;

    // Generar token simple para cookie (en producción: JWT)
    const cookieToken = this.generateCookieToken(token);

    // Cookie con seguridad básica (SameSite, max-age)
    // NOTE: HttpOnly debe setearse desde el backend — no es posible desde JS
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `auth-token=${cookieToken}; path=/; SameSite=Strict; max-age=86400${secure}`;
  }

  /**
   * Eliminar cookie de autenticación
   */
  private clearAuthCookie(): void {
    if (typeof document === 'undefined') return;

    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  /**
   * Generar token para cookie (Base64 JSON - en producción: JWT)
   */
  private generateCookieToken(token: AuthToken): string {
    const user = this.getCurrentUser();
    if (!user) return '';

    // TODO: Usar JWT (jsonwebtoken o jose)
    const payload = {
      username: user.getUsername(),
      roles: user.getRoles(),
      exp: token.getExpiresAt().getTime(),
    };

    // Demo: Base64 encode (INSEGURO - usar JWT en producción)
    return btoa(JSON.stringify(payload));
  }
}
