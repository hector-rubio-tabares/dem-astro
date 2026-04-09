/**
 * DOMAIN LAYER - Value Object: Origin
 * Representa un origen HTTP validado
 */

export class Origin {
  private readonly value: string;

  constructor(url: string) {
    if (!this.isValidOrigin(url)) {
      throw new Error(`Invalid origin: ${url}`);
    }
    this.value = this.normalize(url);
  }

  private isValidOrigin(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private normalize(url: string): string {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  }

  equals(other: Origin): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static fromList(urls: string[]): Origin[] {
    return urls
      .map(url => {
        try {
          return new Origin(url);
        } catch {
          return null;
        }
      })
      .filter((origin): origin is Origin => origin !== null);
  }
}

/**
 * Value Object: LoadStatistics
 * Estadísticas de carga de MFEs
 */
export class LoadStatistics {
  constructor(
    public readonly total: number,
    public readonly loaded: number,
    public readonly failed: number,
    public readonly loading: number,
    public readonly avgLoadTime: number,
    public readonly maxLoadTime: number,
    public readonly minLoadTime: number
  ) {}

  get successRate(): number {
    if (this.total === 0) return 0;
    return (this.loaded / this.total) * 100;
  }

  get failureRate(): number {
    if (this.total === 0) return 0;
    return (this.failed / this.total) * 100;
  }

  get isComplete(): boolean {
    return this.loading === 0;
  }

  static empty(): LoadStatistics {
    return new LoadStatistics(0, 0, 0, 0, 0, 0, 0);
  }
}
