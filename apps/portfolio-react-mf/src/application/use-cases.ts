/**
 * APPLICATION LAYER - Casos de Uso
 * Orquesta la lógica de negocio sin depender de frameworks
 */

import { Count, Message, PortfolioData } from '../domain/entities';
import type { IEventBus, IBroadcastChannel, IMessageValidator, IPortfolioRepository } from './ports';

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Use Case
// ─────────────────────────────────────────────────────────────────────────────

export class GetPortfolioUseCase {
  private readonly repository: IPortfolioRepository;

  constructor(repository: IPortfolioRepository) {
    this.repository = repository;
  }

  execute(): Promise<PortfolioData> {
    return this.repository.getPortfolioData();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Messaging Use Cases
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Caso de Uso: Incrementar Contador
 */
export class IncrementClickUseCase {
  private readonly eventBus: IEventBus;
  private readonly instanceId: string;

  constructor(eventBus: IEventBus, instanceId: string) {
    this.eventBus = eventBus;
    this.instanceId = instanceId;
  }

  execute(currentCount: Count): Count {
    const newCount = currentCount.increment();
    
    // Emitir evento al bus
    this.eventBus.emit('click-count', {
      source: 'react',
      count: newCount.raw,
      instanceId: this.instanceId,
    });

    return newCount;
  }
}

/**
 * Caso de Uso: Enviar Mensaje Multi-Tab
 */
export class SendMultiTabMessageUseCase {
  private readonly channel: IBroadcastChannel | null;
  private readonly tabId: string;
  private readonly instanceId: string;

  constructor(
    channel: IBroadcastChannel | null,
    tabId: string,
    instanceId: string
  ) {
    this.channel = channel;
    this.tabId = tabId;
    this.instanceId = instanceId;
  }

  execute(count: Count): void {
    if (!this.channel) {
      console.warn('[SendMultiTab] BroadcastChannel not available');
      return;
    }

    this.channel.postMessage({
      source: 'react',
      count: count.raw,
      instanceId: this.instanceId,
      tabId: this.tabId,
    });
  }
}

/**
 * Caso de Uso: Procesar Mensaje Recibido (Tab)
 */
export class ProcessTabMessageUseCase {
  private readonly validator: IMessageValidator;
  private readonly instanceId: string;

  constructor(validator: IMessageValidator, instanceId: string) {
    this.validator = validator;
    this.instanceId = instanceId;
  }

  execute(payload: unknown): Message | null {
    if (!this.validator.validateTabMessage(payload)) {
      return null;
    }

    const data = payload as { source: string; count: number; instanceId: string };

    // Filtrar mensajes de la misma instancia
    if (data.instanceId === this.instanceId) {
      return null;
    }

    return Message.create(
      this.validator.sanitize(data.source),
      'tab',
      data.count
    );
  }
}

/**
 * Caso de Uso: Procesar Mensaje Multi-Tab
 */
export class ProcessMultiTabMessageUseCase {
  private readonly validator: IMessageValidator;
  private readonly tabId: string;

  constructor(validator: IMessageValidator, tabId: string) {
    this.validator = validator;
    this.tabId = tabId;
  }

  execute(payload: unknown): Message | null {
    if (!this.validator.validateMultiTabMessage(payload)) {
      return null;
    }

    const data = payload as { source: string; count: number; tabId: string };

    // Filtrar mensajes de la misma tab
    if (data.tabId === this.tabId) {
      return null;
    }

    return Message.create(
      this.validator.sanitize(data.source),
      'multi-tab',
      data.count
    );
  }
}
