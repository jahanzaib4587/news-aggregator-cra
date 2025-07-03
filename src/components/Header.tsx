import React from 'react';
import { Settings, Newspaper } from 'lucide-react';

interface HeaderProps {
  onOpenPreferences: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenPreferences }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <Newspaper size={32} />
          <h1>News Aggregator</h1>
        </div>
        
        <nav className="header-nav">
          <button
            onClick={onOpenPreferences}
            className="preferences-btn"
            aria-label="Open preferences"
          >
            <Settings size={24} />
            <span>Preferences</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header; 