import React, { useState, useEffect } from 'react';
import { User, Settings, Menu, BarChart3 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';
import { UserProfileForm } from './UserProfileForm';
import { AdvancedSettingsModal } from './AdvancedSettingsModal';
import { ScoreDisplay } from './ScoreDisplay';

interface HeaderProps {
  onMenuToggle?: () => void;
  onDashboardToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDashboardToggle }) => {
  const { setCurrentView } = useAppStore();
  const { user, getTotalScore } = useUserStore();
  const { theme, language } = useSettingsStore();
  const { t } = useTranslation(language);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);

  // Apply theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleMenuToggle = () => {
    setShowSideMenu(!showSideMenu);
  };

  const handleGoToMenu = () => {
    setCurrentView('menu');
    setShowSideMenu(false);
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
    // Settings clicked - no logging needed for UI interactions
  };

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__left">
          <button
            onClick={handleMenuToggle}
            className="header__button"
            title="Main Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="header__title">
            Advanced Learning App
          </h1>
        </div>

        <ScoreDisplay />

        <div className="header__right">
          {user ? (
            <button
              onClick={() => setShowProfileForm(true)}
              className="header__user-button"
            >
              <User className="h-4 w-4" />
              <span>{user.name}</span>
              <span className="header__user-points">
                ({getTotalScore()} pts)
              </span>
            </button>
          ) : (
            <button
              onClick={() => setShowProfileForm(true)}
              className="btn btn--primary"
            >
              <User className="btn--icon h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}

          <button
            onClick={onDashboardToggle}
            className="header__button"
            title="Dashboard"
          >
            <BarChart3 className="h-5 w-5" />
          </button>

          <button
            onClick={handleSettings}
            className="header__button"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showProfileForm && (
        <UserProfileForm onClose={() => setShowProfileForm(false)} />
      )}

      <AdvancedSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {showSideMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowSideMenu(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{t('settings')}</h2>
            </div>
            <nav className="p-4 space-y-2">
              <button
                onClick={handleGoToMenu}
                className="w-full text-left p-3 hover:bg-gray-100 rounded-md flex items-center space-x-3"
              >
                <Menu className="h-5 w-5" />
                <span>{t('mainMenu')}</span>
              </button>
              <button
                onClick={() => { setShowSettings(true); setShowSideMenu(false); }}
                className="w-full text-left p-3 hover:bg-gray-100 rounded-md flex items-center space-x-3"
              >
                <Settings className="h-5 w-5" />
                <span>{t('settings')}</span>
              </button>
              <button
                className="w-full text-left p-3 hover:bg-gray-100 rounded-md flex items-center space-x-3"
                onClick={() => alert('About This App\n\nThis is an advanced learning application designed to help you improve your English vocabulary and understanding through interactive exercises.\n\nDeveloped by Genil Suarez.')}
              >
                <User className="h-5 w-5" />
                <span>{t('about')}</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};