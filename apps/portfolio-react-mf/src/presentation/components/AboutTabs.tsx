type ActiveTab = 'architecture' | 'tech' | 'experience';

interface AboutTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const TABS: { id: ActiveTab; icon: string; label: string }[] = [
  { id: 'architecture', icon: '🏗️', label: 'Architecture' },
  { id: 'tech', icon: '💻', label: 'Tech Stack' },
  { id: 'experience', icon: '📚', label: 'Experience' },
];

export function AboutTabs({ activeTab, onTabChange }: AboutTabsProps) {
  return (
    <div role="tablist" aria-label="Secciones de about" className="tab-nav glass">
      {TABS.map(tab => (
        <button
          key={tab.id}
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          tabIndex={activeTab === tab.id ? 0 : -1}
        >
          <span aria-hidden="true">{tab.icon}</span>
          <span className="label-md">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export type { ActiveTab };
