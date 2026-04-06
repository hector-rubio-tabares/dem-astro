import type { Principle } from '../../domain/entities';

interface PrinciplesTabProps {
  principles: readonly Principle[];
}

export function PrinciplesTab({ principles }: PrinciplesTabProps) {
  return (
    <div className="principles-grid">
      {principles.map((principle, index) => (
        <article key={index} className="principle-card">
          <div className="principle-icon">{principle.icon}</div>
          <h3 className="title-lg">{principle.title}</h3>
          <p className="body-md">{principle.description}</p>
        </article>
      ))}
    </div>
  );
}
