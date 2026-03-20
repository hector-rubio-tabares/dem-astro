/**
 * INFRASTRUCTURE LAYER - Adaptadores
 * Implementaciones concretas de los puertos usando @mf/shared y fetch
 */

import {
  getMicrofrontendBus,
  getMicrofrontendChannel,
  getMicrofrontendTabId,
  validateTabMessage,
  validateMultiTabMessage,
  sanitizeDisplayString,
  type EventBus,
} from '@mf/shared';
import type { IEventBus, IBroadcastChannel, IMessageValidator, IMessageRepository, IPortfolioRepository } from '../application/ports';
import type { Message } from '../domain/entities';
import { PortfolioData, type PortfolioStat, type TechCategory, type Principle } from '../domain/entities';

// ─────────────────────────────────────────────────────────────────────────────
// Messaging Adapters
// ─────────────────────────────────────────────────────────────────────────────

export class SharedBusAdapter implements IEventBus {
  private readonly bus: EventBus<Record<string, unknown>>;

  constructor() {
    this.bus = getMicrofrontendBus();
  }

  emit(event: string, payload: unknown): void {
    this.bus.emit(event, payload);
  }

  on(event: string, handler: (payload: unknown) => void): void {
    this.bus.on(event, handler);
  }

  off(event: string, handler: (payload: unknown) => void): void {
    this.bus.off(event, handler);
  }
}

export class BroadcastChannelAdapter implements IBroadcastChannel {
  private readonly channel: BroadcastChannel | null;

  constructor() {
    this.channel = getMicrofrontendChannel();
  }

  postMessage(data: unknown): void {
    this.channel?.postMessage(data);
  }

  addEventListener(event: string, handler: (event: MessageEvent) => void): void {
    this.channel?.addEventListener(event, handler as EventListener);
  }

  removeEventListener(event: string, handler: (event: MessageEvent) => void): void {
    this.channel?.removeEventListener(event, handler as EventListener);
  }

  get isAvailable(): boolean {
    return this.channel !== null;
  }
}

export class MessageValidatorAdapter implements IMessageValidator {
  validateTabMessage(payload: unknown): boolean {
    try {
      validateTabMessage(payload as Parameters<typeof validateTabMessage>[0]);
      return true;
    } catch {
      return false;
    }
  }

  validateMultiTabMessage(payload: unknown): boolean {
    try {
      validateMultiTabMessage(payload as Parameters<typeof validateMultiTabMessage>[0]);
      return true;
    } catch {
      return false;
    }
  }

  sanitize(text: string): string {
    return sanitizeDisplayString(text);
  }
}

export class InMemoryMessageRepository implements IMessageRepository {
  private messages: Message[] = [];

  add(message: Message): void {
    this.messages.push(message);
  }

  getRecent(limit: number): Message[] {
    return this.messages.slice(-limit);
  }

  clear(): void {
    this.messages = [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Adapters
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_PORTFOLIO_DATA: PortfolioData = new PortfolioData(
  [
    { label: 'Years Experience', value: '8+', icon: '📅' },
    { label: 'Projects Delivered', value: '50+', icon: '🚀' },
    { label: 'Code Quality', value: '99.5%', icon: '✨' },
    { label: 'Team Size', value: '15+', icon: '👥' },
  ] satisfies PortfolioStat[],
  [
    { title: 'Frontend', icon: '🎨', technologies: ['React 19', 'Angular 21', 'Astro 6.0', 'TypeScript', 'CSS3', 'Web Components'] },
    { title: 'Backend', icon: '⚙️', technologies: ['Node.js', 'NestJS', 'GraphQL', 'PostgreSQL', 'Redis', 'Kafka'] },
    { title: 'Architecture', icon: '🏗️', technologies: ['Hexagonal', 'DDD', 'SOLID', 'Clean Code', 'Event-Driven', 'Microservices'] },
    { title: 'DevOps', icon: '🔧', technologies: ['Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'AWS', 'Terraform'] },
  ] satisfies TechCategory[],
  [
    { title: 'Clean Architecture', icon: '🔷', description: 'Hexagonal architecture con ports & adapters. Separación clara entre domain, application e infrastructure layers.' },
    { title: 'SOLID Principles', icon: '📐', description: 'Single Responsibility, Open/Closed, Dependency Inversion. Código mantenible y escalable.' },
    { title: 'Design Patterns', icon: '🎯', description: 'Strategy, Observer, Facade, Adapter. Soluciones probadas a problemas comunes.' },
    { title: 'Security First', icon: '🔒', description: 'XSS protection, CSP policies, secure communication, error isolation.' },
  ] satisfies Principle[],
);

export class ApiPortfolioRepository implements IPortfolioRepository {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    this.timeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 10_000);
  }

  async getPortfolioData(): Promise<PortfolioData> {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/portfolio`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`[PortfolioApi] HTTP ${response.status}: ${response.statusText}`);
      }

      const raw = await response.json() as {
        stats: PortfolioStat[];
        techStack: TechCategory[];
        principles: Principle[];
      };

      return new PortfolioData(raw.stats, raw.techStack, raw.principles);
    } finally {
      clearTimeout(timerId);
    }
  }
}

export class InMemoryPortfolioRepository implements IPortfolioRepository {
  async getPortfolioData(): Promise<PortfolioData> {
    return FALLBACK_PORTFOLIO_DATA;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Infrastructure Factory — DI root
// ─────────────────────────────────────────────────────────────────────────────

export class InfrastructureFactory {
  static createEventBus(): IEventBus {
    return new SharedBusAdapter();
  }

  static createBroadcastChannel(): IBroadcastChannel {
    return new BroadcastChannelAdapter();
  }

  static createMessageValidator(): IMessageValidator {
    return new MessageValidatorAdapter();
  }

  static createMessageRepository(): IMessageRepository {
    return new InMemoryMessageRepository();
  }

  static createPortfolioRepository(): IPortfolioRepository {
    const apiUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
    return apiUrl ? new ApiPortfolioRepository() : new InMemoryPortfolioRepository();
  }

  static getTabId(): string {
    return getMicrofrontendTabId();
  }
}
