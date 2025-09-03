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
  const { user } = useUserStore();
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
  };

  return (
    <header className="header-redesigned">
      <div className="header-redesigned__container">
        {/* Left Section: Menu + Brand */}
        <div className="header-redesigned__left">
          <button
            onClick={handleMenuToggle}
            className="header-redesigned__menu-btn"
            title="Menu"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="header-redesigned__brand">
            <span className="header-redesigned__logo">🎓</span>
            <h1 className="header-redesigned__title">LearnEng</h1>
          </div>
        </div>

        {/* Center Section: Score Display */}
        <div className="header-redesigned__center">
          <ScoreDisplay />
        </div>

        {/* Right Section: Unified Control Area */}
        <div className="header-redesigned__right">
          {/* User Profile Section */}
          {user ? (
            <div className="header-redesigned__user-section">
              <button
                onClick={() => setShowProfileForm(true)}
                className="header-redesigned__user-btn"
                title={`${user.name} - Profile Settings`}
              >
                <div className="header-redesigned__avatar">
                  <User className="w-4 h-4" />
                </div>
                <div className="header-redesigned__user-info">
                  <span className="header-redesigned__username">{user.name}</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="header-redesigned__user-section">
              <button
                onClick={() => setShowProfileForm(true)}
                className="header-redesigned__login-btn"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Login</span>
              </button>
            </div>
          )}

          {/* Unified Control Panel */}
          <div className="header-redesigned__control-panel">
            <div className="header-redesigned__control-group">
              <button
                onClick={onDashboardToggle}
                className="header-redesigned__control-btn"
                title="Dashboard"
                aria-label="Open dashboard"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              <button
                onClick={handleSettings}
                className="header-redesigned__control-btn"
                title="Settings"
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
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