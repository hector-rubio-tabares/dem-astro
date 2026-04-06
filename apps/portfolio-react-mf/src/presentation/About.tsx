import { useState } from 'react';
import { usePortfolio } from './hooks';
import { AboutHero } from './components/AboutHero';
import { AboutTabs, type ActiveTab } from './components/AboutTabs';
import { PrinciplesTab } from './components/PrinciplesTab';
import { TechStackTab } from './components/TechStackTab';
import { ExperienceTab } from './components/ExperienceTab';
import './About.css';

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
      <AboutHero stats={stats} />

      <div className="about-content">
        <AboutTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="tab-content">
          {activeTab === 'architecture' && <PrinciplesTab principles={principles} />}
          {activeTab === 'tech' && <TechStackTab techStack={techStack} />}
          {activeTab === 'experience' && <ExperienceTab />}
        </div>
      </div>

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
