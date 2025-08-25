import React, { useState } from 'react';
import { User, Settings, Menu, BarChart3 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { UserProfileForm } from './UserProfileForm';

interface HeaderProps {
  onMenuToggle?: () => void;
  onDashboardToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, onDashboardToggle }) => {
  const { sessionScore, currentView, setCurrentView } = useAppStore();
  const { user, getTotalScore } = useUserStore();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);

  const handleMenuToggle = () => {
    setShowSideMenu(!showSideMenu);
  };

  const handleGoToMenu = () => {
    setCurrentView('menu');
    setShowSideMenu(false);
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
    console.log('Settings clicked');
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

        {currentView !== 'menu' && (
          <div className="header__score">
            <span className="score__correct">{sessionScore.correct}</span>
            <span className="score__separator">/</span>
            <span className="score__incorrect">{sessionScore.incorrect}</span>
            <span className="score__separator">/</span>
            <span className="score__total">{sessionScore.total}</span>
            {sessionScore.total > 0 && (
              <span className="score__accuracy">
                ({sessionScore.accuracy.toFixed(1)}%)
              </span>
            )}
          </div>
        )}

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
              Login
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
      
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option>English</option>
                  <option>Español</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="btn btn--primary"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showSideMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowSideMenu(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
            </div>
            <nav className="p-4 space-y-2">
              <button 
                onClick={handleGoToMenu}
                className="w-full text-left p-3 hover:bg-gray-100 rounded-md flex items-center space-x-3"
              >
                <Menu className="h-5 w-5" />
                <span>Main Menu</span>
              </button>
              <button 
                onClick={() => { setShowSettings(true); setShowSideMenu(false); }}
                className="w-full text-left p-3 hover:bg-gray-100 rounded-md flex items-center space-x-3"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              <button 
                onClick={() => { onDashboardToggle?.(); setShowSideMenu(false); }}
                className="w-full text-left p-3 hover:bg-gray-100 rounded-md flex items-center space-x-3"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
              <button 
                className="w-full text-left p-3 hover:bg-gray-100 rounded-md flex items-center space-x-3"
                onClick={() => alert('About: Advanced Learning App v2.0')}
              >
                <User className="h-5 w-5" />
                <span>About</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};