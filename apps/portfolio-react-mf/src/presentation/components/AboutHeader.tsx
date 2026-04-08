import type { PortfolioStat } from '../../domain/entities';

interface AboutHeaderProps {
  stats: readonly PortfolioStat[];
}

export function AboutHeader({ stats }: AboutHeaderProps) {
  return (
    <div className="about-hero">
      <div className="hero-content">
        <span className="label-sm hero-prefix">04 // ABOUT_SYSTEM</span>
        <h1 className="display-md hero-name text-gradient">
          Hector David Rubio Tabares
        </h1>
        <p className="hero-tagline display-sm">
          Software Engineer <span className="text-gradient">Fullstack</span>
          {' '}— <span className="hero-tech">.NET</span> · <span className="hero-tech">Angular</span>
        </p>
        <p className="body-lg hero-description">
          Integro pagos 3DS v2 y SSO Keycloak en producción para clientes internacionales.
          Pipelines CI/CD, testing E2E y sistemas empresariales en plataformas con miles de usuarios activos.
        </p>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card glass">
              <span className="stat-icon">{stat.icon}</span>
              <div className="stat-content">
                <div className="stat-value title-lg text-gradient">{stat.value}</div>
                <div className="stat-label label-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
