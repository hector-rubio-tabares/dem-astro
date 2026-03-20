/**
 * PRESENTATION LAYER - About Component
 * Conectado a la arquitectura hexagonal mediante usePortfolio().
 * Los datos vienen de IPortfolioRepository (API o fallback en memoria).
 */

import { useState } from 'react';
import { usePortfolio } from './hooks';
import './About.css';

type ActiveTab = 'architecture' | 'tech' | 'experience';

export function About() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('architecture');
  const { data, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <section className="about-container">
        <div className="about-hero">
          <div className="hero-content">
            <p className="body-lg">Cargando datos del portfolio...</p>
          </div>
        </div>
      </section>
    );
  }

  const stats = data?.stats ?? [];
  const techStack = data?.techStack ?? [];
  const principles = data?.principles ?? [];

  return (
    <section className="about-container">
      {/* Hero with Gradient Background */}
      <div className="about-hero">
        <div className="hero-content">
          <span className="label-sm hero-prefix">
            04 // ABOUT_SYSTEM
          </span>
          
          <h1 className="display-md">
            Building <span className="text-gradient">Resilient</span> Systems
          </h1>
          
          <p className="body-lg hero-description">
            Principal Software Architect & Cybersecurity Lead specializing in micro-frontend architectures, 
            domain-driven design, and production-grade security.
          </p>

          {/* Stats Grid */}
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

      {/* Content Tabs */}
      <div className="about-content">
        {/* Tab Navigation (Glass) */}
        <nav className="tab-nav glass">
          <button
            className={`tab-btn ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            <span>🏗️</span>
            <span className="label-md">Architecture</span>
          </button>
          
          <button
            className={`tab-btn ${activeTab === 'tech' ? 'active' : ''}`}
            onClick={() => setActiveTab('tech')}
          >
            <span>💻</span>
            <span className="label-md">Tech Stack</span>
          </button>
          
          <button
            className={`tab-btn ${activeTab === 'experience' ? 'active' : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            <span>📚</span>
            <span className="label-md">Experience</span>
          </button>
        </nav>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Architecture Principles Tab */}
          {activeTab === 'architecture' && (
            <div className="principles-grid">
              {principles.map((principle, index) => (
                <article key={index} className="principle-card">
                  <div className="principle-icon">{principle.icon}</div>
                  <h3 className="title-lg">{principle.title}</h3>
                  <p className="body-md">{principle.description}</p>
                </article>
              ))}
            </div>
          )}

          {/* Tech Stack Tab */}
          {activeTab === 'tech' && (
            <div className="tech-grid">
              {techStack.map((category, index) => (
                <div key={index} className="tech-category">
                  <div className="tech-category-header">
                    <span className="tech-icon">{category.icon}</span>
                    <h3 className="headline-sm">{category.title}</h3>
                  </div>
                  
                  <div className="tech-list">
                    {category.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="tech-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="experience-content">
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-year label-sm">2024 - Present</div>
                  <div className="timeline-content">
                    <h3 className="title-lg">Principal Software Architect</h3>
                    <p className="body-md">
                      Leading micro-frontend architecture initiatives, implementing hexagonal design patterns,
                      and establishing security best practices across multiple teams.
                    </p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-year label-sm">2021 - 2024</div>
                  <div className="timeline-content">
                    <h3 className="title-lg">Senior Full-Stack Developer</h3>
                    <p className="body-md">
                      Built scalable microservices with event-driven architecture, implemented CI/CD pipelines,
                      and mentored junior developers in clean code practices.
                    </p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-year label-sm">2018 - 2021</div>
                  <div className="timeline-content">
                    <h3 className="title-lg">Frontend Engineer</h3>
                    <p className="body-md">
                      Developed responsive web applications with React and Angular, optimized performance,
                      and contributed to design system development.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="cta-section">
                <h3 className="headline-md">Let's Build Something Amazing</h3>
                <p className="body-lg">
                  Looking for a technical architect who values code quality, security, and maintainability?
                </p>
                <div className="cta-buttons">
                  <button className="btn-gradient">
                    Get in Touch
                  </button>
                  <button className="btn-ghost">
                    Download CV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* React MFE Badge (bottom-right corner) */}
      <div className="mfe-indicator">
        <div className="mfe-badge react">
          <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="2" />
            <ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(60 12 12)" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(-60 12 12)" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          React 19
        </div>
      </div>
    </section>
  );
}
