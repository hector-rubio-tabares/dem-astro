/**
 * PRESENTATION - MessageLog
 * Muestra el log de mensajes recibidos desde el EventBus y BroadcastChannel.
 * Componente puro — solo renderiza la lista.
 */

import type { Message } from '../../domain/entities';

interface MessageLogProps {
  messages: Message[];
}

export function MessageLog({ messages }: MessageLogProps) {
  if (messages.length === 0) return null;

  return (
    <div className="messages-log">
      <h4>Mensajes recibidos:</h4>
      <ul>
        {messages.slice().reverse().map((msg) => (
          <li key={msg.id}>
            <strong>{msg.scope}</strong> de <em>{msg.from}</em>: count={msg.count} ({msg.formattedTimestamp})
          </li>
        ))}
      </ul>
    </div>
  );
}
