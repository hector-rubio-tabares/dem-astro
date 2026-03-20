/**
 * APPLICATION LAYER - Puertos (Interfaces)
 * Define contratos que la infraestructura debe cumplir
 */

import type { Message, PortfolioData } from '../domain/entities';

// ─────────────────────────────────────────────────────────────────────────────
// Messaging Ports
// ─────────────────────────────────────────────────────────────────────────────

export interface IEventBus {
  emit(event: string, payload: unknown): void;
  on(event: string, handler: (payload: unknown) => void): void;
  off(event: string, handler: (payload: unknown) => void): void;
}

export interface IMessageValidator {
  validateTabMessage(payload: unknown): boolean;
  validateMultiTabMessage(payload: unknown): boolean;
  sanitize(text: string): string;
}

export interface IBroadcastChannel {
  postMessage(data: unknown): void;
  addEventListener(event: string, handler: (event: MessageEvent) => void): void;
  removeEventListener(event: string, handler: (event: MessageEvent) => void): void;
}

export interface IMessageRepository {
  add(message: Message): void;
  getRecent(limit: number): Message[];
  clear(): void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Port — contrato que la infraestructura debe implementar
// ─────────────────────────────────────────────────────────────────────────────

export interface IPortfolioRepository {
  getPortfolioData(): Promise<PortfolioData>;
}
