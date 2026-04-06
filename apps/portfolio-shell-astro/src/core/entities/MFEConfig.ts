/**
 * DOMAIN LAYER - Entity: MFEConfig
 * Configuración de un Micro-Frontend
 */

export type MFEType = 'react' | 'angular' | 'vue' | 'svelte';
export type MFEStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'timeout';

export class MFEConfig {
  constructor(
    public readonly name: string,
    public readonly type: MFEType,
    public readonly url: string,
    public readonly selector: string,
    public readonly critical: boolean = false,
    public readonly timeoutMs: number = 8000,
    public readonly customElementName?: string
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('MFE name cannot be empty');
    }
    if (!url || !url.startsWith('http')) {
      throw new Error('MFE URL must be a valid HTTP(S) URL');
    }
    if (timeoutMs < 1000 || timeoutMs > 30000) {
      throw new Error('Timeout must be between 1s and 30s');
    }
  }

  isCritical(): boolean {
    return this.critical;
  }

  getDisplayName(): string {
    return `${this.name} (${this.type})`;
  }
}

/**
 * Entity: MFEInstance
 * Representa una instancia montada de un MFE
 */
export class MFEInstance {
  private status: MFEStatus = 'idle';
  private loadStartTime?: number;
  private loadEndTime?: number;
  private errorMessage?: string;

  constructor(
    public readonly id: string,
    public readonly config: MFEConfig,
    public readonly container: HTMLElement
  ) {}

  startLoading(): void {
    this.status = 'loading';
    this.loadStartTime = Date.now();
  }

  markLoaded(): void {
    this.status = 'loaded';
    this.loadEndTime = Date.now();
  }

  markError(message: string): void {
    this.status = 'error';
    this.errorMessage = message;
    this.loadEndTime = Date.now();
  }

  markTimeout(): void {
    this.status = 'timeout';
    this.loadEndTime = Date.now();
  }

  getStatus(): MFEStatus {
    return this.status;
  }

  getLoadTime(): number | null {
    if (!this.loadStartTime || !this.loadEndTime) {
      return null;
    }
    return this.loadEndTime - this.loadStartTime;
  }

  getError(): string | undefined {
    return this.errorMessage;
  }

  isLoaded(): boolean {
    return this.status === 'loaded';
  }

  hasError(): boolean {
    return this.status === 'error' || this.status === 'timeout';
  }
}
