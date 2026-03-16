import { Component, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { angularBus } from '../lib/bus';

interface Message {
  id: number;
  from: string;
  scope: 'tab' | 'multi-tab';
  count: number;
  timestamp: string;
}

// Función helper para obtener el bus (compartido o local)
function getBus() {
  return (window as any).__SHARED_BUS__ || angularBus;
}

// Función helper para obtener el TAB_ID
function getTabId() {
  return (window as any).__TAB_ID__ || 'unknown';
}

// Función helper para obtener el BroadcastChannel
function getBroadcastChannel() {
  return (window as any).__BROADCAST_CHANNEL__ || null;
}

@Component({
  selector: 'portfolio-angular-mf',
  template: `
    <section class="angular-card">
      <h3>Angular Micro-Frontend</h3>
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
            @for (msg of messages().slice(-5).reverse(); track msg.id) {
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
  clicks = signal(0);
  externalClicks = signal(0);
  messages = signal<Message[]>([]);

  private bus: any;

  level = computed(() => {
    const value = this.clicks();
    if (value >= 8) return 'alto';
    if (value >= 4) return 'medio';
    return 'inicial';
  });

  private tabHandler = (payload: { source: string; count: number }) => {
    console.log('🟠 Angular recibió de tab:', payload);
    if (payload.source !== 'angular') {
      this.externalClicks.set(payload.count);
      this.messages.update(prev => [...prev, {
        id: Date.now(),
        from: payload.source,
        scope: 'tab',
        count: payload.count,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  private multiTabHandler = (event: MessageEvent) => {
    const payload = event.data;
    // Filtrar mensajes de la misma tab (solo mostrar los de otras tabs)
    if (payload.tabId !== getTabId()) {
      this.messages.update(prev => [...prev, {
        id: Date.now() + 1,
        from: payload.source,
        scope: 'multi-tab',
        count: payload.count,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  private channel: BroadcastChannel | null = null;

  ngOnInit() {
    this.bus = getBus();
    this.channel = getBroadcastChannel();

    this.bus.on('click-count', this.tabHandler);

    if (this.channel) {
      this.channel.addEventListener('message', this.multiTabHandler);
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
    const newCount = this.clicks() + 1;
    this.clicks.update((value) => value + 1);
    this.bus.emit('click-count', { source: 'angular', count: newCount });
  }

  sendToTab() {
    const payload = { source: 'angular', count: this.clicks() };
    console.log('🟠 Angular enviando a tab:', payload);
    this.bus.emit('click-count', payload);
  }

  sendToMultiTab() {
    const channel = getBroadcastChannel();
    if (channel) {
      channel.postMessage({ source: 'angular', count: this.clicks(), tabId: getTabId() });
    }
  }
}
