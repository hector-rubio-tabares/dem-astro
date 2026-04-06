/**
 * DOMAIN LAYER - Entidades de Negocio
 * Sin dependencias externas, solo lógica de negocio pura
 */

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Domain Entities
// ─────────────────────────────────────────────────────────────────────────────

export interface PortfolioStat {
  readonly label: string;
  readonly value: string;
  readonly icon: string;
}

export interface TechCategory {
  readonly title: string;
  readonly icon: string;
  readonly technologies: readonly string[];
}

export interface Principle {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

export class PortfolioData {
  readonly stats: readonly PortfolioStat[];
  readonly techStack: readonly TechCategory[];
  readonly principles: readonly Principle[];

  constructor(
    stats: readonly PortfolioStat[],
    techStack: readonly TechCategory[],
    principles: readonly Principle[],
  ) {
    this.stats = stats;
    this.techStack = techStack;
    this.principles = principles;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Messaging Domain Entities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entidad Message
 * Representa un mensaje recibido del sistema
 */
export class Message {
  public readonly id: number;
  public readonly from: string;
  public readonly scope: 'tab' | 'multi-tab';
  public readonly count: number;
  public readonly timestamp: Date;

  constructor(
    id: number,
    from: string,
    scope: 'tab' | 'multi-tab',
    count: number,
    timestamp: Date
  ) {
    if (count < 0) {
      throw new Error('Count must be non-negative');
    }
    this.id = id;
    this.from = from;
    this.scope = scope;
    this.count = count;
    this.timestamp = timestamp;
  }

  static create(from: string, scope: 'tab' | 'multi-tab', count: number): Message {
    return new Message(
      Date.now(),
      from,
      scope,
      count,
      new Date()
    );
  }

  get formattedTimestamp(): string {
    return this.timestamp.toLocaleTimeString();
  }
}

/**
 * Value Object: Count
 * Representa un contador con validaciones
 */
export class Count {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 1_000_000) {
      throw new Error('Count must be between 0 and 1,000,000');
    }
    this.value = value;
  }

  increment(): Count {
    return new Count(this.value + 1);
  }

  get raw(): number {
    return this.value;
  }
}

/**
 * Value Object: Level
 * Representa el nivel de actividad
 */
export class Level {
  private readonly _value: 'inicial' | 'medio' | 'alto';

  constructor(value: 'inicial' | 'medio' | 'alto') {
    this._value = value;
  }

  static fromCount(count: number): Level {
    if (count >= 8) return new Level('alto');
    if (count >= 4) return new Level('medio');
    return new Level('inicial');
  }

  get value(): 'inicial' | 'medio' | 'alto' {
    return this._value;
  }

  get cssClass(): string {
    return `level-${this._value}`;
  }
}
