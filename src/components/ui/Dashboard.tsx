import React from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { Trophy, Target, Clock, TrendingUp, X, HelpCircle } from 'lucide-react';
import './Dashboard.css';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useProgressStore } from '../../stores/progressStore';
import { useTranslation } from '../../utils/i18n';
// import { useToast } from '../../hooks/useToast'; // Commented out as not currently used
import { toast } from '../../stores/toastStore';


interface DashboardProps {
  onClose: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const { userScores, getTotalScore } = useUserStore();
  const { language } = useSettingsStore();
  const { getProgressData, getWeeklyAverage } = useProgressStore();
  const { t } = useTranslation(language);
  // const { showInfo } = useToast(); // Commented out as not currently used
  const [isLoading, setIsLoading] = React.useState(true);
  const [showHelpModal, setShowHelpModal] = React.useState(false);

  // Simulate loading for demo purposes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Show dashboard toast only once per session
      toast.once('dashboard-opened', 'info', 'Dashboard cargado', 'Aquí puedes ver tu progreso de aprendizaje');
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Get real progress data from store
  const progressData = getProgressData(7); // Last 7 days
  const progressOverTime = progressData.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: day.averageScore || 0,
    sessions: day.sessionsCount,
  }));

  const moduleData = Object.values(userScores).map(score => ({
    module: score.moduleId.split('-').pop() || 'Module',
    score: score.bestScore,
    attempts: score.attempts
  }));

  // Calculate performance metrics from real data
  const weeklyAverage = getWeeklyAverage();
  const totalSessions = progressData.reduce((sum, day) => sum + day.sessionsCount, 0);
  const totalTimeSpent = progressData.reduce((sum, day) => sum + day.timeSpent, 0);

  const totalScore = getTotalScore();
  const avgScore = weeklyAverage || (moduleData.length > 0 ? Math.round(moduleData.reduce((sum, m) => sum + m.score, 0) / moduleData.length) : 0);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
          <div className="p-6 sm:p-8">
            {/* Header with Title and Action Buttons */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('dashboard.learningDashboard')}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="w-10 h-10 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                  title={t('dashboard.helpButton')}
                  aria-label="Help"
                >
                  <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200" />
                </button>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/20 border border-gray-200 hover:border-red-200 dark:border-gray-700 dark:hover:border-red-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                  title="Close Dashboard"
                  aria-label="Close dashboard"
                >
                  <X className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
                </button>
              </div>
            </div>
            {/* Loading Skeleton */}
            <div className="animate-pulse">
              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-300 dark:bg-gray-600 rounded mr-2 sm:mr-3"></div>
                      <div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Charts Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
                  <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
                  <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Header with Title and Action Buttons */}
          <div className="flex items-center justify-between mb-8">
            <h2 
              className="text-3xl font-bold text-gray-900 dark:text-white"
              id="dashboard-title"
            >
              {t('dashboard.learningDashboard')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHelpModal(true)}
                className="w-10 h-10 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                title={t('dashboard.helpButton')}
                aria-label="Help"
              >
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200" />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/20 border border-gray-200 hover:border-red-200 dark:border-gray-700 dark:hover:border-red-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                title="Close Dashboard"
                aria-label="Close dashboard"
              >
                <X className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
              </button>
            </div>
          </div>
      
          {/* Stats Cards */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
            role="region"
            aria-labelledby="dashboard-title"
          >
            <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mr-2 sm:mr-3" aria-hidden="true" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('dashboard.totalScore')}</p>
                  <p 
                    className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                    aria-label={`Total score: ${totalScore} points`}
                  >
                    {totalScore}
                  </p>
                </div>
              </div>
            </div>
        
            <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mr-2 sm:mr-3" aria-hidden="true" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('dashboard.avgScore')}</p>
                  <p 
                    className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                    aria-label={`Average score: ${avgScore} percent`}
                  >
                    {avgScore}%
                  </p>
                </div>
              </div>
            </div>
        
            <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mr-2 sm:mr-3" aria-hidden="true" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('dashboard.totalSessions')}</p>
                  <p 
                    className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                    aria-label={`Total sessions: ${totalSessions}`}
                  >
                    {totalSessions}
                  </p>
                </div>
              </div>
            </div>
        
            <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mr-2 sm:mr-3" aria-hidden="true" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{t('dashboard.timeSpent')}</p>
                  <p 
                    className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white"
                    aria-label={`Time spent: ${Math.round(totalTimeSpent / 60)} minutes`}
                  >
                    {Math.round(totalTimeSpent / 60)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Chart */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 
              className="text-lg font-semibold text-gray-900 dark:text-white"
              id="progress-chart-title"
            >
              {t('dashboard.weeklyProgress')}
            </h3>
            {/* Legend - Accuracy first (primary) */}
            <div className="dashboard-legend">
              <div className="dashboard-legend-item">
                <div className="dashboard-legend-dot dashboard-legend-dot-accuracy"></div>
                <span className="dashboard-legend-text dashboard-legend-text-primary">{t('dashboard.learningAccuracy')}</span>
              </div>
              <div className="dashboard-legend-item">
                <div className="dashboard-legend-dot dashboard-legend-dot-sessions"></div>
                <span className="dashboard-legend-text">{t('dashboard.studySessions')}</span>
              </div>
            </div>
          </div>
          {totalSessions === 0 ? (
            <div className="dashboard-no-data text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <TrendingUp className="dashboard-no-data-icon" />
                <p className="text-lg font-medium mb-2">{t('dashboard.noProgressData')}</p>
                <p className="text-sm">{t('dashboard.completeModulesMessage')}</p>
              </div>
            </div>
          ) : (
          <div role="img" aria-labelledby="progress-chart-title" aria-describedby="progress-chart-desc">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={progressOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                {/* Left Y-axis for Accuracy (Bars) - PRIMARY */}
                <YAxis 
                  yAxisId="accuracy"
                  orientation="left"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#3b82f6' }}
                  tickLine={{ stroke: '#3b82f6' }}
                  label={{ 
                    value: `${t('dashboard.learningAccuracy')} (%)`, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '12px', fill: '#3b82f6', fontWeight: 'bold' }
                  }}
                />
                {/* Right Y-axis for Sessions (Line) - SECONDARY */}
                <YAxis 
                  yAxisId="sessions"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#10b981' }}
                  tickLine={{ stroke: '#10b981' }}
                  label={{ 
                    value: t('dashboard.studySessions'), 
                    angle: 90, 
                    position: 'insideRight',
                    style: { textAnchor: 'middle', fontSize: '12px', fill: '#10b981' }
                  }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'score') {
                      return [`${value}%`, '🎯 Learning Accuracy'];
                    }
                    if (name === 'sessions') {
                      return [`${value} session${value !== 1 ? 's' : ''}`, '📚 Study Sessions'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `📅 ${label}`}
                />
                {/* Bars for Accuracy - PRIMARY MESSAGE */}
                <Bar 
                  yAxisId="accuracy"
                  dataKey="score" 
                  fill="#3b82f6"
                  fillOpacity={0.85}
                  radius={[4, 4, 0, 0]}
                  name="score"
                />
                {/* Line for Sessions - SECONDARY INFO */}
                <Line 
                  yAxisId="sessions"
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                  name="sessions"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          )}
          <p id="progress-chart-desc" className="dashboard-sr-only">
            Combined chart showing learning progress over the last 7 days with bars for accuracy percentage (primary) and line for session counts (secondary)
          </p>
        </div>

            {/* Module Performance */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 
            className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            id="performance-chart-title"
          >
            {t('dashboard.modulePerformance')}
          </h3>
          <div role="img" aria-labelledby="performance-chart-title" aria-describedby="performance-chart-desc">
            <ResponsiveContainer className="dashboard-chart-container">
              <BarChart data={moduleData}>
                <CartesianGrid strokeDasharray="3 3" className="dashboard-chart-grid" />
                <XAxis 
                  dataKey="module" 
                  tick={{ className: 'dashboard-chart-tick' }}
                />
                <YAxis 
                  tick={{ className: 'dashboard-chart-tick' }}
                />
                <Tooltip wrapperClassName="dashboard-tooltip" />
                <Bar 
                  dataKey="score" 
                  className="dashboard-module-bar"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p id="performance-chart-desc" className="dashboard-sr-only">
            Bar chart showing performance scores for {moduleData.length} completed learning modules
            </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="dashboard-help-modal">
          <div className="dashboard-help-modal-content">
            <div className="p-6">
              <div className="dashboard-help-modal-header">
                <h3 className="dashboard-help-modal-title">
                  {t('dashboard.helpTitle')}
                </h3>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="dashboard-help-modal-close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Metrics Grid - 2 columns */}
              <div className="dashboard-help-metrics-grid">
                {/* Points System */}
                <div className="dashboard-help-metric-item">
                  <div className="dashboard-help-metric-icon dashboard-help-metric-icon-yellow">
                    <Trophy className="h-5 w-5 dashboard-help-icon-yellow" />
                  </div>
                  <div>
                    <h4 className="dashboard-help-metric-title">
                      {t('dashboard.helpPointsTitle')}
                    </h4>
                    <p className="dashboard-help-metric-description">
                      {t('dashboard.helpPointsDesc')}
                    </p>
                  </div>
                </div>

                {/* Accuracy Score */}
                <div className="dashboard-help-metric-item">
                  <div className="dashboard-help-metric-icon dashboard-help-metric-icon-blue">
                    <Target className="h-5 w-5 dashboard-help-icon-blue" />
                  </div>
                  <div>
                    <h4 className="dashboard-help-metric-title">
                      {t('dashboard.helpAccuracyTitle')}
                    </h4>
                    <p className="dashboard-help-metric-description">
                      {t('dashboard.helpAccuracyDesc')}
                    </p>
                  </div>
                </div>

                {/* Study Sessions */}
                <div className="dashboard-help-metric-item">
                  <div className="dashboard-help-metric-icon dashboard-help-metric-icon-green">
                    <Clock className="h-5 w-5 dashboard-help-icon-green" />
                  </div>
                  <div>
                    <h4 className="dashboard-help-metric-title">
                      {t('dashboard.helpSessionsTitle')}
                    </h4>
                    <p className="dashboard-help-metric-description">
                      {t('dashboard.helpSessionsDesc')}
                    </p>
                  </div>
                </div>

                {/* Practice Time */}
                <div className="dashboard-help-metric-item">
                  <div className="dashboard-help-metric-icon dashboard-help-metric-icon-purple">
                    <TrendingUp className="h-5 w-5 dashboard-help-icon-purple" />
                  </div>
                  <div>
                    <h4 className="dashboard-help-metric-title">
                      {t('dashboard.helpTimeTitle')}
                    </h4>
                    <p className="dashboard-help-metric-description">
                      {t('dashboard.helpTimeDesc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Info - Full width */}
              <div className="dashboard-help-charts-section">
                <div className="dashboard-help-charts-grid">
                  <div>
                    <h4 className="dashboard-help-chart-title">
                      {t('dashboard.helpProgressTitle')}
                    </h4>
                    <p className="dashboard-help-chart-description">
                      {t('dashboard.helpProgressDesc')}
                    </p>
                  </div>
                  <div>
                    <h4 className="dashboard-help-chart-title">
                      {t('dashboard.helpModuleTitle')}
                    </h4>
                    <p className="dashboard-help-chart-description">
                      {t('dashboard.helpModuleDesc')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="dashboard-help-footer">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="dashboard-help-close-button"
                >
                  {t('dashboard.closeHelp')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};