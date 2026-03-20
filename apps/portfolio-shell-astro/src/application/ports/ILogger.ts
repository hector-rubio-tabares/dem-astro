/**
 * APPLICATION LAYER - Port: ILogger
 * Contrato para servicios de logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface ILogger {
  /**
   * Log a debug message (development only)
   */
  debug(message: string, ...args: unknown[]): void;

  /**
   * Log an info message
   */
  info(message: string, ...args: unknown[]): void;

  /**
   * Log a warning message
   */
  warn(message: string, ...args: unknown[]): void;

  /**
   * Log an error message
   */
  error(message: string, ...args: unknown[]): void;
}
