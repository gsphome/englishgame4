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
    <div className="score-display-compact">
      {isInGame ? (
        // Compact session score
        <div className="score-display-compact__session">
          <div className="score-display-compact__icon">🎯</div>
          <div className="score-display-compact__values">
            <span className="score-display-compact__correct">{sessionScore.correct}</span>
            <span className="score-display-compact__separator">/</span>
            <span className="score-display-compact__incorrect">{sessionScore.incorrect}</span>
          </div>
          {sessionScore.total > 0 && (
            <div className="score-display-compact__accuracy">
              {sessionScore.accuracy.toFixed(0)}%
            </div>
          )}
        </div>
      ) : (
        // Compact global score with level
        <div className="score-display-compact__global">
          <div className="score-display-compact__main">
            <div className="score-display-compact__icon">🌍</div>
            <div className="score-display-compact__values">
              <span className="score-display-compact__correct">{globalScore.correct}</span>
              <span className="score-display-compact__separator">/</span>
              <span className="score-display-compact__incorrect">{globalScore.incorrect}</span>
            </div>
            {globalScore.total > 0 && (
              <div className="score-display-compact__accuracy">
                {globalScore.accuracy.toFixed(0)}%
              </div>
            )}
          </div>
          
          <div className="score-display-compact__divider"></div>
          
          <div className="score-display-compact__level">
            <div className="score-display-compact__level-badge">
              Lv.{globalStats.level}
            </div>
            <div className="score-display-compact__points">
              {globalStats.totalScore}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};