import type React from 'react';

interface TimelineEntry {
  period: string;
  role: string;
  company: string;
  description: React.ReactNode;
}

const EXPERIENCE: TimelineEntry[] = [
  {
    period: 'Jun 2024 – Actualidad',
    role: 'Fullstack Software Engineer',
    company: 'Newshore by Flyr — Remoto',
    description: (
      <>
        Desarrollo y mantenimiento de sistemas en producción para clientes internacionales.
        Integración 3D Secure v2 con Nuvei (backend completo: REST + Webhooks).
        SSO con Keycloak JS en Angular: tokens, sesión multi-pestaña, login/logout.
        Migración de pipelines CI/CD y paquetes NPM entre organizaciones Azure DevOps.
        Testing E2E con Playwright y carga con JMeter. Stack: Angular, .NET, Umbraco.
      </>
    ),
  },
  {
    period: 'Mar 2023 – Jul 2024',
    role: 'Desarrollador Fullstack',
    company: 'Softlond S.A.S — Colombia',
    description: (
      <>
        <strong>Confa / Cajasan:</strong> Plataformas de bibliotecas digitales en Laravel.
        Optimización avanzada de queries PostgreSQL, migración de datos legados, extensión
        del lector EPUB Bibi (subrayado, anotaciones, temas, búsqueda, lectura por voz).
        <br />
        <strong>Postobón:</strong> APIs .NET 8 para inventarios empresariales.
        Flujos de procesamiento por etapas, stored procedures SQL Server, Entity Framework Core
        y Azure Functions.
      </>
    ),
  },
  {
    period: 'Jun 2023 – May 2024',
    role: 'Analista de Desarrollo de Software',
    company: 'Emergia — Colombia',
    description: (
      <>
        Desarrollo de aplicaciones internas para gestión de tickets. Backend .NET y Python,
        frontend Angular con cifrado en tránsito. Procedimientos almacenados Oracle, controles
        de concurrencia, automatización con Power Automate y monitoreo integral con Zabbix y Nagios.
      </>
    ),
  },
  {
    period: 'Feb 2017 – Mar 2024',
    role: 'Ingeniería de Sistemas y Computación',
    company: 'Universidad de Caldas — Manizales',
    description: (
      <>
        Formación en desarrollo de software, algoritmos, bases de datos y arquitectura de sistemas.
      </>
    ),
  },
];

export function ExperienceTab() {
  return (
    <div className="experience-content">
      <div className="timeline">
        {EXPERIENCE.map((entry, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-year label-sm">{entry.period}</div>
            <div className="timeline-content">
              <h3 className="title-lg">{entry.role}</h3>
              <h4
                className="headline-sm"
                style={{ color: 'var(--color-primary-cyan)', marginBottom: 'var(--spacing-2)' }}
              >
                {entry.company}
              </h4>
              <p className="body-md">{entry.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
