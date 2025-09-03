import React, { useState, useEffect } from 'react';
import { User, Settings, Menu, BarChart3 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { toast } from '../../stores/toastStore';
import { useTranslation } from '../../utils/i18n';
import { UserProfileForm } from './UserProfileForm';
import { AdvancedSettingsModal } from './AdvancedSettingsModal';
import { ScoreDisplay } from './ScoreDisplay';

interface HeaderProps {
  onMenuToggle?: () => void;
  onDashboardToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDashboardToggle }) => {
  const { setCurrentView, currentView } = useAppStore();
  const { user } = useUserStore();
  const { theme, language } = useSettingsStore();
  const { t } = useTranslation(language);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);

  // Determine header layout mode
  const isInGame = currentView !== 'menu';
  const headerMode = isInGame ? 'learning' : 'menu';

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
    if (!showSettings) {
      // Replace any existing info toast to avoid accumulation
      toast.single.info('Configuración', 'Panel de configuración abierto');
    }
  };

  return (
    <header className={`header-redesigned header-redesigned--${headerMode}`}>
      <div className={`header-redesigned__container header-redesigned__container--${headerMode}`}>
        {/* Left Section: Menu + Brand */}
        <div className="header-redesigned__left">
          <button
            onClick={handleMenuToggle}
            className="header-redesigned__menu-btn"
            title="Open navigation menu"
            aria-label="Open navigation menu"
            aria-expanded={showSideMenu}
            aria-controls="navigation-menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="header-redesigned__brand">
            <span className="header-redesigned__logo" role="img" aria-label="Education">🎓</span>
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
                aria-label={`User profile: ${user.name}. Click to open profile settings`}
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
                aria-label="Login to your account"
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={() => setShowSideMenu(false)}
          role="presentation"
        >
          <nav 
            id="navigation-menu"
            className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50" 
            onClick={(e) => e.stopPropagation()}
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('navigation') || 'Navigation'}
              </h2>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={handleGoToMenu}
                className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center space-x-3 text-gray-900 dark:text-white"
                aria-label="Go to main menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span>{t('mainMenu') || 'Main Menu'}</span>
              </button>
              <button
                onClick={() => { setShowSettings(true); setShowSideMenu(false); }}
                className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center space-x-3 text-gray-900 dark:text-white"
                aria-label="Open settings"
              >
                <Settings className="h-5 w-5" aria-hidden="true" />
                <span>{t('settings') || 'Settings'}</span>
              </button>
              <button
                className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center space-x-3 text-gray-900 dark:text-white"
                onClick={() => alert('About This App\n\nThis is an advanced learning application designed to help you improve your English vocabulary and understanding through interactive exercises.\n\nDeveloped by Genil Suarez.')}
                aria-label="About this application"
              >
                <User className="h-5 w-5" aria-hidden="true" />
                <span>{t('about') || 'About'}</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};