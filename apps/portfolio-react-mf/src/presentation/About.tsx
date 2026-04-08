import { useState } from 'react';
import { usePortfolio } from './hooks';
import { AboutHeader } from './components/AboutHeader';
import { AboutTabs, type ActiveTab } from './components/AboutTabs';
import { PrinciplesTab as ArchitectureTab } from './components/PrinciplesTab';
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
      <AboutHeader stats={stats} />

      <div className="about-content">
        <AboutTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="tab-content"
        >
          {activeTab === 'architecture' && <ArchitectureTab principles={principles} />}
          {activeTab === 'tech' && <TechStackTab techStack={techStack} />}
          {activeTab === 'experience' && <ExperienceTab />}
        </div>
      </div>
    </section>
  );
}
