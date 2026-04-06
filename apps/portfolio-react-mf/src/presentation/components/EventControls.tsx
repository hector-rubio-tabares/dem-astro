/**
 * PRESENTATION - EventControls
 * Botones para disparar eventos al EventBus (tab) y BroadcastChannel (multi-tab).
 * Componente puro — recibe handlers como props.
 */

interface EventControlsProps {
  onIncrement: () => void;
  onSendToTab: () => void;
  onSendToMultiTab: () => void;
}

export function EventControls({ onIncrement, onSendToTab, onSendToMultiTab }: EventControlsProps) {
  return (
    <>
      <button className="react-btn" type="button" onClick={onIncrement}>
        Probar hook useState
      </button>

      <div className="event-controls">
        <button className="react-btn-secondary" type="button" onClick={onSendToTab}>
          📤 Enviar a Tab (EventBus)
        </button>
        <button className="react-btn-secondary" type="button" onClick={onSendToMultiTab}>
          🌐 Multi-tab (BroadcastChannel)
        </button>
      </div>
    </>
  );
}
