/**
 * PRESENTATION - MfeStats
 * Muestra el contador de clicks, nivel y clicks externos del React MFE.
 * Componente puro (sin lógica de negocio — solo presenta datos).
 */

interface MfeStatsProps {
  count: number;
  level: string;
  levelClass: string;
  externalClicks: number;
}

export function MfeStats({ count, level, levelClass, externalClicks }: MfeStatsProps) {
  return (
    <div className="react-stats">
      <span>Clicks: {count}</span>
      <span className={`level-pill ${levelClass}`}>
        Nivel: {level}
      </span>
      {externalClicks > 0 && (
        <span className="external-clicks">
          Desde otros: {externalClicks}
        </span>
      )}
    </div>
  );
}
