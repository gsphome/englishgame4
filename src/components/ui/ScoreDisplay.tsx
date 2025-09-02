import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';

export const ScoreDisplay: React.FC = () => {
  const { sessionScore, globalScore, currentView } = useAppStore();
  const { getGlobalStats } = useUserStore();

  // Get global stats from userStore (for level calculation)
  const globalStats = getGlobalStats();

  // Determine what to show based on current view
  const isInGame = currentView !== 'menu';

  return (
    <div className="flex items-center space-x-4 bg-blue-100 dark:bg-gray-700 px-4 py-2 rounded-lg border">
      {isInGame ? (
        // Show session score when in games
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">🎯 Session:</span>
          <span className="text-green-600 font-bold">{sessionScore.correct}</span>
          <span className="text-gray-400">/</span>
          <span className="text-red-500 font-bold">{sessionScore.incorrect}</span>
          {sessionScore.total > 0 && (
            <span className="text-blue-600 ml-2">
              ({sessionScore.accuracy.toFixed(0)}%)
            </span>
          )}
        </div>
      ) : (
        // Show global score and level when in menu
        <>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">🌍 Global:</span>
            <span className="text-green-600 font-bold">{globalScore.correct}</span>
            <span className="text-gray-400">/</span>
            <span className="text-red-500 font-bold">{globalScore.incorrect}</span>
            {globalScore.total > 0 && (
              <span className="text-blue-600 ml-2">
                ({globalScore.accuracy.toFixed(0)}%)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
            <span className="text-sm font-medium">🏆 Level:</span>
            <span className="text-orange-600 text-xs font-bold">
              Lv.{globalStats.level}
            </span>
            <span className="text-purple-600 font-bold text-sm ml-1">{globalStats.totalScore}</span>
            <span className="text-purple-500 text-xs">pts</span>
          </div>
        </>
      )}
    </div>
  );
};