export class AuthToken {
  private constructor(
    private readonly value: string,
    private readonly expiresAt: Date
  ) {}

  static create(value: string, expiresAt: Date): AuthToken {
    if (!value || value.trim().length === 0) {
      throw new Error('Token value cannot be empty');
    }
    if (expiresAt <= new Date()) {
      throw new Error('Token expiration date must be in the future');
    }
    return new AuthToken(value, expiresAt);
  }

  static createDemo(): AuthToken {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return new AuthToken('demo-auth-token', expiresAt);
  }

  getValue(): string {
    return this.value;
  }

  getExpiresAt(): Date {
    return new Date(this.expiresAt);
  }

  isExpired(): boolean {
    return this.expiresAt <= new Date();
  }

  isValid(): boolean {
    return !this.isExpired() && this.value.length > 0;
  }

  equals(other: AuthToken): boolean {
    return this.value === other.value;
  }
}
