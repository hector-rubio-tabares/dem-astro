import type { TechCategory } from '../../domain/entities';

interface TechStackTabProps {
  techStack: readonly TechCategory[];
}

export function TechStackTab({ techStack }: TechStackTabProps) {
  return (
    <div className="tech-grid">
      {techStack.map((category, index) => (
        <div key={index} className="tech-category">
          <div className="tech-category-header">
            <span className="tech-icon">{category.icon}</span>
            <h3 className="headline-sm">{category.title}</h3>
          </div>
          <div className="tech-list">
            {category.technologies.map((tech, techIndex) => (
              <span key={techIndex} className="tech-tag">{tech}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
