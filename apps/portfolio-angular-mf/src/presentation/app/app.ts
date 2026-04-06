import { Component, computed, signal, OnInit, OnDestroy, ElementRef, inject } from '@angular/core';
import {
  getMicrofrontendBus,
  getMicrofrontendTabId,
  getMicrofrontendChannel,
  validateTabMessage,
  validateMultiTabMessage,
  sanitizeDisplayString,
  MF_CONFIG,
  EventBus,
  type TabMessage,
  type MultiTabMessage,
  type MicroFrontendEvents,
} from '@mf/shared';
import { environment } from '../../environments/environment';

interface Message {
  id: number;
  from: string;
  scope: 'tab' | 'multi-tab';
  count: number;
  timestamp: string;
}

@Component({
  selector: 'portfolio-angular-mf',
  template: `
    <section class="angular-card">
      <div class="mfe-header">
        <h3>Angular Micro-Frontend</h3>
        <div class="mfe-badges">
          <span class="mfe-badge angular">Angular 21</span>
          <span
            class="mfe-badge"
            [class.env-dev]="!envProduction()"
            [class.env-prod]="envProduction()"
          >
            {{ envName() }}
          </span>
        </div>
      </div>
      <p>Renderizado dentro del shell Astro con signals.</p>
      <div class="angular-stats">
        <span>Clicks: {{ clicks() }}</span>
        <span
          class="level-pill"
          [class.level-inicial]="level() === 'inicial'"
          [class.level-medio]="level() === 'medio'"
          [class.level-alto]="level() === 'alto'"
        >
          Nivel: {{ level() }}
        </span>
        @if (externalClicks() > 0) {
          <span class="external-clicks">Desde otros: {{ externalClicks() }}</span>
        }
      </div>
      <button class="angular-btn" type="button" (click)="increment()">Probar signal()</button>

      <div class="event-controls">
        <button class="angular-btn-secondary" type="button" (click)="sendToTab()">
          📤 Enviar a Tab (EventBus)
        </button>
        <button class="angular-btn-secondary" type="button" (click)="sendToMultiTab()">
          🌐 Multi-tab (BroadcastChannel)
        </button>
      </div>

      @if (messages().length > 0) {
        <div class="messages-log">
          <h4>Mensajes recibidos:</h4>
          <ul>
            @for (msg of messages().slice(-MF_CONFIG.MAX_MESSAGES_IN_LOG).reverse(); track msg.id) {
              <li>
                <strong>{{ msg.scope }}</strong> de <em>{{ msg.from }}</em>: count={{ msg.count }} ({{ msg.timestamp }})
              </li>
            }
          </ul>
        </div>
      }
    </section>
  `,
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private instanceId: string = '';

  clicks = signal(0);
  externalClicks = signal(0);
  messages = signal<Message[]>([]);

  // Environment signals (detecta dev vs prod)
  readonly envProduction = signal(environment.production);
  readonly envName = computed(() =>
    this.envProduction() ? '🔴 PROD' : '🟢 DEV'
  );

  private bus!: EventBus<MicroFrontendEvents>;

  // Expose MF_CONFIG to template
  readonly MF_CONFIG = MF_CONFIG;

  level = computed(() => {
    const value = this.clicks();
    if (value >= 8) return 'alto';
    if (value >= 4) return 'medio';
    return 'inicial';
  });

  private tabHandler = (payload: TabMessage) => {
    try {
      validateTabMessage(payload);
      // Filtrar mensajes de esta misma instancia
      if (payload.instanceId !== this.instanceId) {
        // Solo actualizar externalClicks si viene del mismo framework pero diferente instancia
        if (payload.source === 'angular') {
          this.externalClicks.set(payload.count);
        }
        this.messages.update(prev => [...prev, {
          id: Date.now(),
          from: sanitizeDisplayString(payload.source),
          scope: 'tab',
          count: payload.count,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (error) {
      console.warn('[Angular] Invalid tab message:', error);
    }
  };

  private multiTabHandler = (event: MessageEvent) => {
    try {
      const payload = event.data;
      validateMultiTabMessage(payload);
      // Filtrar mensajes de la misma tab (solo mostrar los de otras tabs)
      const tabId = getMicrofrontendTabId();
      if (payload.tabId !== tabId) {
        this.messages.update(prev => [...prev, {
          id: Date.now() + 1,
          from: sanitizeDisplayString(payload.source),
          scope: 'multi-tab',
          count: payload.count,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (error) {
      console.warn('[Angular] Invalid multi-tab message:', error);
    }
  };

  private channel: BroadcastChannel | null = null;

  ngOnInit() {
    try {
      // Obtener instanceId del elemento host
      const hostElement = this.elementRef.nativeElement as HTMLElement;
      this.instanceId = hostElement.getAttribute('data-instance-id') || crypto.randomUUID();

      this.bus = getMicrofrontendBus<MicroFrontendEvents>();
      this.channel = getMicrofrontendChannel();

      this.bus.on('click-count', this.tabHandler);

      if (this.channel) {
        this.channel.addEventListener('message', this.multiTabHandler);
      }
    } catch (error) {
      console.error('[Angular] Error in ngOnInit:', error);
    }
  }

  ngOnDestroy() {
    if (this.bus) {
      this.bus.off('click-count', this.tabHandler);
    }
    if (this.channel) {
      this.channel.removeEventListener('message', this.multiTabHandler);
    }
  }

  increment() {
    try {
      const newCount = this.clicks() + 1;
      this.clicks.update((value) => value + 1);
      const payload: TabMessage = { source: 'angular', count: newCount, instanceId: this.instanceId };
      validateTabMessage(payload);
      this.bus.emit('click-count', payload);
    } catch (error) {
      console.error('[Angular] Failed to increment:', error);
    }
  }

  sendToTab() {
    try {
      const payload: TabMessage = { source: 'angular', count: this.clicks(), instanceId: this.instanceId };
      validateTabMessage(payload);
      this.bus.emit('click-count', payload);
    } catch (error) {
      console.error('[Angular] Failed to send tab message:', error);
    }
  }

  sendToMultiTab() {
    try {
      const channel = getMicrofrontendChannel();
      if (!channel) {
        console.warn('[Angular] BroadcastChannel not available');
        return;
      }
      const tabId = getMicrofrontendTabId();
      const payload: MultiTabMessage = { source: 'angular', count: this.clicks(), tabId, instanceId: this.instanceId };
      validateMultiTabMessage(payload);
      channel.postMessage(payload);
    } catch (error) {
      console.error('[Angular] Failed to send multi-tab message:', error);
    }
  }
}

