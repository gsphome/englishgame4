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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              English Learning App
            </h1>
          </div>

          {/* Center - Session Score (only show during learning) */}
          {currentView !== 'menu' && (
            <div className="flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-lg">
              <div className="text-sm">
                <span className="text-green-600 font-medium">{sessionScore.correct}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-red-500 font-medium">{sessionScore.incorrect}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-gray-600">{sessionScore.total}</span>
              </div>
              {sessionScore.total > 0 && (
                <div className="text-sm text-gray-600">
                  {sessionScore.accuracy.toFixed(1)}%
                </div>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowProfileForm(true)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user.name}</span>
                  <span className="text-xs text-gray-500">
                    {getTotalScore()} pts
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowProfileForm(true)}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="text-sm">Create Profile</span>
              </button>
            )}
            
            <button 
              onClick={onDashboardToggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              title="Dashboard"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {showProfileForm && (
        <UserProfileForm onClose={() => setShowProfileForm(false)} />
      )}
    </header>
  );
};