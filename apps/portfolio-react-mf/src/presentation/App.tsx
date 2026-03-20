/**
 * PRESENTATION LAYER - Componente Principal
 * Composition root: conecta hooks de aplicación con sub-componentes de UI.
 * Single Responsibility: solo orquesta — no contiene lógica de negocio ni JSX interactivo inline.
 */

import { useMemo } from 'react';
import { useClickCounter, useMessageListener } from './hooks';
import { InfrastructureFactory } from '../infrastructure/adapters';
import { MfeStats } from './components/MfeStats';
import { EventControls } from './components/EventControls';
import { MessageLog } from './components/MessageLog';
import './App.css';

interface AppProps {
  container?: HTMLElement;
}

function getInstanceId(container?: HTMLElement): string {
  if (!container) return crypto.randomUUID();
  const instances = window.__MF_INSTANCES__;
  return instances?.get(container) || crypto.randomUUID();
}

export function App({ container }: AppProps) {
  const instanceId = useMemo(() => getInstanceId(container), [container]);
  const messageRepository = useMemo(() => InfrastructureFactory.createMessageRepository(), []);

  const { count, level, levelClass, increment, sendToTab, sendToMultiTab } =
    useClickCounter(instanceId);
  const { externalClicks, messages } = useMessageListener(instanceId, messageRepository);

  return (
    <section className="react-card">
      <div className="mfe-header">
        <h3>React Micro-Frontend</h3>
        <span className="mfe-badge react">React 19</span>
      </div>
      <p>Arquitectura Hexagonal con Module Federation.</p>

      <MfeStats count={count} level={level} levelClass={levelClass} externalClicks={externalClicks} />

      <EventControls
        onIncrement={increment}
        onSendToTab={sendToTab}
        onSendToMultiTab={sendToMultiTab}
      />

      <MessageLog messages={messages} />
    </section>
  );
}

export default App;
