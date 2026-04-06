import type { PortfolioStat } from '../../domain/entities';

interface AboutHeroProps {
  stats: readonly PortfolioStat[];
}

export function AboutHero({ stats }: AboutHeroProps) {
  return (
    <div className="about-hero">
      <div className="hero-content">
        <span className="label-sm hero-prefix">04 // ABOUT_SYSTEM</span>
        <h1 className="display-md">
          Construyendo <span className="text-gradient">Sistemas</span> que Funcionan
        </h1>
        <p className="body-lg hero-description">
          Software Engineer Fullstack especializado en .NET y Angular, con experiencia en producción
          en plataformas internacionales, integraciones críticas y optimización de sistemas empresariales.
        </p>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card glass">
              <span className="stat-icon">{stat.icon}</span>
              <div className="stat-content">
                <div className="stat-value title-lg">{stat.value}</div>
                <div className="stat-label label-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
