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
  const { sessionScore, currentView } = useAppStore();
  const { user, getTotalScore } = useUserStore();
  const [showProfileForm, setShowProfileForm] = useState(false);

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__left">
          <button
            onClick={onMenuToggle}
            className="header__button"
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
          
          <button className="header__button">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {showProfileForm && (
        <UserProfileForm onClose={() => setShowProfileForm(false)} />
      )}
    </header>
  );
};