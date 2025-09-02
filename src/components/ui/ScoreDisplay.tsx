import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';

export const ScoreDisplay: React.FC = () => {
  const { sessionScore } = useAppStore();
  const { getGlobalStats } = useUserStore();

  // Get global stats
  const globalStats = getGlobalStats();

  // Debug logging (remove in production)
  React.useEffect(() => {
    console.log('🎯 ScoreDisplay RENDER - sessionScore:', sessionScore);
    console.log('🏆 ScoreDisplay RENDER - globalStats:', globalStats);
  }, [sessionScore, globalStats]);

  // Force re-render check
  const renderKey = `${sessionScore.correct}-${sessionScore.incorrect}-${sessionScore.total}`;
  console.log('🔄 ScoreDisplay renderKey:', renderKey);

  // Simple debug version first
  return (
    <div className="flex items-center space-x-4 bg-blue-100 dark:bg-gray-700 px-4 py-2 rounded-lg border">
      {/* Debug info */}
      <div className="text-xs text-gray-500">
        Debug: {renderKey}
      </div>

      {/* Simple Session Score */}
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

      {/* Simple Global Score */}
      <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
        <span className="text-sm font-medium">🏆 Total:</span>
        <span className="text-purple-600 font-bold text-lg">{globalStats.totalScore}</span>
        <span className="text-purple-500 text-xs">pts</span>
        <span className="text-orange-600 text-xs font-bold ml-2">
          Lv.{globalStats.level}
        </span>
      </div>
    </div>
  );
};