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
    { label: 'Años en producción', value: '2+', icon: '📅' },
    { label: 'Empresas clientes', value: '3', icon: '🏢' },
    { label: '3DS v2 implementado', value: 'Nuvei', icon: '💳' },
    { label: 'SSO para usuarios', value: '5.000+', icon: '🔒' },
  ] satisfies PortfolioStat[],
  [
    { title: 'Backend — Producción', icon: '⚙️', technologies: ['.NET Core', '.NET 8', 'ASP.NET', 'Laravel', 'Python'] },
    { title: 'Frontend — Producción', icon: '🎨', technologies: ['Angular', 'TypeScript', 'Tailwind CSS', 'PrimeReact'] },
    { title: 'Conocimiento Práctico', icon: '🔬', technologies: ['Node.js', 'NestJS', 'FastAPI', 'React'] },
    { title: 'Bases de Datos', icon: '🗄️', technologies: ['SQL Server', 'PostgreSQL', 'Oracle', 'Entity Framework Core'] },
    { title: 'Cloud & DevOps', icon: '☁️', technologies: ['Azure', 'Azure DevOps', 'CI/CD', 'GitLab', 'GitHub', 'Azure Functions'] },
    { title: 'Testing & Herramientas', icon: '🧪', technologies: ['Playwright', 'JMeter', 'Keycloak', 'Git', 'Scrum', 'Power Automate'] },
  ] satisfies TechCategory[],
  [
    { title: 'Impacto en Producción', icon: '🔥', description: 'Resolución de incidencias críticas financieras de larga data en plataformas internacionales con miles de usuarios activos.' },
    { title: 'Seguridad Aplicada', icon: '🔒', description: 'Integración 3D Secure v2, autenticación SSO con Keycloak, cifrado en tránsito y control de sesión entre pestañas.' },
    { title: 'Calidad de Código', icon: '📐', description: 'SOLID, Clean Architecture, hexagonal con ports & adapters. Código mantenible, testeable y escalable.' },
    { title: 'Integración Continua', icon: '🔄', description: 'Migración de pipelines CI/CD entre organizaciones Azure DevOps, automatización E2E con Playwright y carga con JMeter.' },
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const raw = await response.json() as {
        stats: PortfolioStat[];
        techStack: TechCategory[];
        principles: Principle[];
      };

      return new PortfolioData(raw.stats, raw.techStack, raw.principles);
    } catch {
      return FALLBACK_PORTFOLIO_DATA;
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
