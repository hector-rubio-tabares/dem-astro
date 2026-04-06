/**
 * DOMAIN LAYER - Entity: User
 * Entidad del dominio que representa un usuario autenticado
 */

export class User {
  private constructor(
    private readonly username: string,
    private readonly roles: string[]
  ) {}

  static create(username: string, roles: string[] = ['user']): User {
    if (!username || username.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }
    return new User(username.trim(), roles);
  }

  static admin(username: string): User {
    return new User(username, ['admin', 'user']);
  }

  getUsername(): string {
    return this.username;
  }

  getRoles(): string[] {
    return [...this.roles]; // Inmutabilidad
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  equals(other: User): boolean {
    return this.username === other.username;
  }
}
