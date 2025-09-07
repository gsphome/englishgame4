import React, { useState, useEffect } from 'react';
import { User, Settings, Menu, BarChart3 } from 'lucide-react';
import '../../styles/components/header.css';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';

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
  const { theme } = useSettingsStore();
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
      // TODO: Show configuration toast with new toast system
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
          className="header-side-menu-overlay"
          onClick={() => setShowSideMenu(false)}
          role="presentation"
        >
          <nav
            id="navigation-menu"
            className="header-side-menu"
            onClick={(e) => e.stopPropagation()}
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="header-side-menu__header">
              <h2 className="header-side-menu__title">
                Navegación
              </h2>
            </div>
            <div className="header-side-menu__content">
              <button
                onClick={handleGoToMenu}
                className="header-side-menu__item"
                aria-label="Ir al menú principal"
              >
                <Menu className="header-side-menu__icon" aria-hidden="true" />
                <span className="header-side-menu__text">Menú Principal</span>
              </button>
              <button
                onClick={() => { setShowSettings(true); setShowSideMenu(false); }}
                className="header-side-menu__item"
                aria-label="Abrir configuración"
              >
                <Settings className="header-side-menu__icon" aria-hidden="true" />
                <span className="header-side-menu__text">Configuración</span>
              </button>
              <button
                className="header-side-menu__item"
                onClick={() => alert('Acerca de esta App\n\nEsta es una aplicación avanzada de aprendizaje diseñada para ayudarte a mejorar tu vocabulario y comprensión del inglés a través de ejercicios interactivos.\n\nDesarrollado por Genil Suarez.')}
                aria-label="Acerca de esta aplicación"
              >
                <User className="header-side-menu__icon" aria-hidden="true" />
                <span className="header-side-menu__text">Acerca de</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};