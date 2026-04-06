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
    <nav className="tab-nav glass">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span>{tab.icon}</span>
          <span className="label-md">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export type { ActiveTab };
