import React, { useState } from 'react';
import { Trophy, Target, TrendingUp, Star, Info } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useUserStore } from '../../stores/userStore';
import { useTranslation } from '../../utils/i18n';
import { useSettingsStore } from '../../stores/settingsStore';

export const ScoreDisplay: React.FC = () => {
  const { sessionScore } = useAppStore();
  const { getGlobalStats } = useUserStore();
  const { language } = useSettingsStore();
  const { t } = useTranslation(language);
  const [showTooltip, setShowTooltip] = useState(false);

  // Get global stats
  const globalStats = getGlobalStats();

  // Debug logging (remove in production)
  React.useEffect(() => {
    console.log('ScoreDisplay - sessionScore:', sessionScore);
    console.log('ScoreDisplay - globalStats:', globalStats);
  }, [sessionScore, globalStats]);
  
  // Get performance indicator
  const getPerformanceIcon = (accuracy: number) => {
    if (accuracy >= 90) return <Star className="h-4 w-4 text-yellow-500" />;
    if (accuracy >= 75) return <Trophy className="h-4 w-4 text-orange-500" />;
    if (accuracy >= 60) return <Target className="h-4 w-4 text-blue-500" />;
    return <TrendingUp className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div 
      className="score-display"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Session Score */}
      <div className="score-display__session">
        <div className="score-display__label">
          <span className="score-display__icon">🎯</span>
          <span>{t('session')}</span>
        </div>
        <div className="score-display__values">
          <span className="score-display__correct">{sessionScore.correct}</span>
          <span className="score-display__separator">/</span>
          <span className="score-display__incorrect">{sessionScore.incorrect}</span>
          {sessionScore.total > 0 && (
            <div className="score-display__accuracy">
              {getPerformanceIcon(sessionScore.accuracy)}
              <span>{sessionScore.accuracy.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Global Score */}
      <div className="score-display__global">
        <div className="score-display__label">
          <span className="score-display__icon">🏆</span>
          <span>{t('total')}</span>
          <Info className="h-3 w-3 text-gray-400" />
        </div>
        <div className="score-display__values">
          <span className="score-display__total-points">{globalStats.totalScore}</span>
          <span className="score-display__points-label">pts</span>
          <div className="score-display__level">
            <span className="score-display__level-text">Lv.{globalStats.level}</span>
            <div className="score-display__progress-bar">
              <div 
                className="score-display__progress-fill"
                style={{ width: `${globalStats.progressToNextLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip with detailed stats */}
      {showTooltip && (
        <div className="score-display__tooltip">
          <div className="score-display__tooltip-content">
            <h4 className="score-display__tooltip-title">📊 {t('statistics')}</h4>
            <div className="score-display__tooltip-stats">
              <div className="score-display__tooltip-stat">
                <span className="score-display__tooltip-label">🎯 {t('avgScore')}:</span>
                <span className="score-display__tooltip-value">{globalStats.avgScore}%</span>
              </div>
              <div className="score-display__tooltip-stat">
                <span className="score-display__tooltip-label">📚 {t('modules')}:</span>
                <span className="score-display__tooltip-value">{globalStats.totalModules}</span>
              </div>
              <div className="score-display__tooltip-stat">
                <span className="score-display__tooltip-label">🔥 {t('bestStreak')}:</span>
                <span className="score-display__tooltip-value">{globalStats.bestStreak}</span>
              </div>
              <div className="score-display__tooltip-stat">
                <span className="score-display__tooltip-label">🎮 {t('totalAttempts')}:</span>
                <span className="score-display__tooltip-value">{globalStats.totalAttempts}</span>
              </div>
            </div>
            <div className="score-display__tooltip-progress">
              <span className="score-display__tooltip-progress-text">
                {globalStats.progressToNextLevel}/100 to Level {globalStats.level + 1}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};