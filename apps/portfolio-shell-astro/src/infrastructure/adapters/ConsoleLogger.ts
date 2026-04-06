import type { ILogger, LogLevel } from '../../application/ports/ILogger';
import { LogLevel as Level } from '../../application/ports/ILogger';

export class ConsoleLogger implements ILogger {
  private readonly minLevel: LogLevel;

  constructor() {
    this.minLevel = import.meta.env.PROD ? Level.ERROR : Level.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(Level.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(Level.INFO)) {
      console.log(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(Level.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(Level.ERROR)) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }
}
