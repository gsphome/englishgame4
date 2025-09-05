import React from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { Trophy, Target, Clock, TrendingUp, X, HelpCircle } from 'lucide-react';
import '../../styles/components/dashboard.css';
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
  const { language, theme } = useSettingsStore();
  const { getProgressData, getWeeklyAverage } = useProgressStore();
  const { t } = useTranslation(language);
  // const { showInfo } = useToast(); // Commented out as not currently used
  const [isLoading, setIsLoading] = React.useState(true);
  const [showHelpModal, setShowHelpModal] = React.useState(false);

  // Theme-aware colors for charts
  const chartColors = React.useMemo(() => ({
    text: '#3B82F6', // Blue text for good contrast in both modes
    grid: theme === 'dark' ? '#4B5563' : '#E5E7EB',
    axis: theme === 'dark' ? '#6B7280' : '#E5E7EB'
  }), [theme]);

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

  // Group performance data by learning mode for more concise view
  const moduleData = React.useMemo(() => {
    const modeGroups: { [key: string]: { totalScore: number; count: number; attempts: number } } = {};

    Object.values(userScores).forEach(score => {
      // Extract learning mode from moduleId (e.g., "flashcard-ielts-home" -> "flashcard")
      const mode = score.moduleId.split('-')[0] || 'unknown';
      const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);

      if (!modeGroups[modeLabel]) {
        modeGroups[modeLabel] = { totalScore: 0, count: 0, attempts: 0 };
      }

      modeGroups[modeLabel].totalScore += score.bestScore;
      modeGroups[modeLabel].count += 1;
      modeGroups[modeLabel].attempts += score.attempts;
    });

    return Object.entries(modeGroups).map(([mode, data]) => ({
      mode,
      score: Math.round(data.totalScore / data.count),
      modules: data.count,
      attempts: data.attempts
    })).sort((a, b) => b.score - a.score); // Sort by score descending
  }, [userScores]);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-7xl w-full max-h-[98vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header with Title and Action Buttons */}
          <div className="flex items-center justify-between mb-6">
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

          {/* Stats Cards - Improved UX/UI */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
            role="region"
            aria-labelledby="dashboard-title"
            aria-label="Estadísticas de aprendizaje"
          >
            {/* Total Score Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" aria-hidden="true" />
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 uppercase tracking-wide">
                      Puntos Totales
                    </p>
                  </div>
                  <p
                    className="text-2xl sm:text-3xl font-bold text-yellow-900 dark:text-yellow-100"
                    aria-label={`Puntos totales acumulados: ${totalScore}`}
                  >
                    {totalScore.toLocaleString()}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    puntos acumulados
                  </p>
                </div>
              </div>
            </div>

            {/* Average Score Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" aria-hidden="true" />
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                      Precisión Promedio
                    </p>
                  </div>
                  <div className="flex items-baseline">
                    <p
                      className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100"
                      aria-label={`Precisión promedio: ${avgScore} por ciento`}
                    >
                      {avgScore}
                    </p>
                    <span className="text-lg font-semibold text-blue-700 dark:text-blue-300 ml-1">%</span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    de respuestas correctas
                  </p>
                </div>
              </div>
            </div>

            {/* Total Sessions Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" aria-hidden="true" />
                    <p className="text-xs font-medium text-green-800 dark:text-green-300 uppercase tracking-wide">
                      Sesiones Completadas
                    </p>
                  </div>
                  <p
                    className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100"
                    aria-label={`Total de sesiones completadas: ${totalSessions}`}
                  >
                    {totalSessions}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    {totalSessions === 1 ? 'sesión realizada' : 'sesiones realizadas'}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Spent Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" aria-hidden="true" />
                    <p className="text-xs font-medium text-purple-800 dark:text-purple-300 uppercase tracking-wide">
                      Tiempo de Práctica
                    </p>
                  </div>
                  <div className="flex items-baseline">
                    <p
                      className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100"
                      aria-label={`Tiempo total de práctica: ${Math.round(totalTimeSpent / 60)} minutos`}
                    >
                      {Math.round(totalTimeSpent / 60)}
                    </p>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300 ml-1">min</span>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                    de aprendizaje activo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Progress Chart */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-base font-semibold text-gray-900 dark:text-white"
                  id="progress-chart-title"
                >
                  {t('dashboard.weeklyProgress')}
                </h3>
                {/* Legend - Accuracy first (primary) */}
                <div className="dashboard-legend">
                  <div className="dashboard-legend-item">
                    <div className="dashboard-legend-dot dashboard-legend-dot-accuracy"></div>
                    <span className="dashboard-legend-text dashboard-legend-text-primary">Precisión</span>
                  </div>
                  <div className="dashboard-legend-item">
                    <div className="dashboard-legend-dot dashboard-legend-dot-sessions"></div>
                    <span className="dashboard-legend-text">Sesiones</span>
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
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={progressOverTime} margin={{ top: 15, right: 30, left: 30, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} className="opacity-30" />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 11,
                          fill: chartColors.text,
                          fontWeight: '500',
                          textAnchor: 'end'
                        }}
                        angle={-45}
                        height={60}
                        interval={0}
                        axisLine={{ stroke: chartColors.axis }}
                        tickLine={{ stroke: chartColors.axis }}
                      />
                      {/* Left Y-axis for Accuracy (Bars) - PRIMARY */}
                      <YAxis
                        yAxisId="accuracy"
                        orientation="left"
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: chartColors.text }}
                        axisLine={{ stroke: '#3b82f6' }}
                        tickLine={{ stroke: '#3b82f6' }}
                        label={{
                          value: 'Precisión (%)',
                          angle: -90,
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fontSize: '12px', fill: '#3b82f6', fontWeight: 'bold' }
                        }}
                      />
                      {/* Right Y-axis for Sessions (Line) - SECONDARY */}
                      <YAxis
                        yAxisId="sessions"
                        orientation="right"
                        tick={{ fontSize: 11, fill: chartColors.text }}
                        axisLine={{ stroke: '#10b981' }}
                        tickLine={{ stroke: '#10b981' }}
                        label={{
                          value: 'Sesiones',
                          angle: 90,
                          position: 'insideRight',
                          style: { textAnchor: 'middle', fontSize: '12px', fill: '#10b981', fontWeight: 'bold' }
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
                            return [`${value}%`, '🎯 Precisión de Aprendizaje'];
                          }
                          if (name === 'sessions') {
                            return [`${value} sesión${value !== 1 ? 'es' : ''}`, '📚 Sesiones de Estudio'];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(label) => `📅 ${label}`}
                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
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
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-base font-semibold text-gray-900 dark:text-white"
                  id="performance-chart-title"
                >
                  {t('dashboard.modulePerformance')}
                </h3>
                {/* Legend for Module Performance */}
                <div className="dashboard-legend">
                  <div className="dashboard-legend-item">
                    <div className="dashboard-legend-dot" style={{ backgroundColor: '#10B981', borderRadius: '0.125rem' }}></div>
                    <span className="dashboard-legend-text dashboard-legend-text-primary">Puntuación Promedio</span>
                  </div>
                </div>
              </div>
              {moduleData.length === 0 ? (
                <div className="dashboard-no-data text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Target className="dashboard-no-data-icon" />
                    <p className="text-lg font-medium mb-2">{t('dashboard.noModuleData')}</p>
                    <p className="text-sm">{t('dashboard.completeModulesMessage')}</p>
                  </div>
                </div>
              ) : (
                <div role="img" aria-labelledby="performance-chart-title" aria-describedby="performance-chart-desc">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={moduleData}
                      margin={{ top: 15, right: 30, left: 30, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} className="opacity-30" />
                      <XAxis
                        dataKey="mode"
                        tick={{
                          fontSize: 11,
                          textAnchor: 'end',
                          fill: chartColors.text,
                          fontWeight: '500'
                        }}
                        angle={-45}
                        height={60}
                        interval={0}
                        axisLine={{ stroke: chartColors.axis }}
                        tickLine={{ stroke: chartColors.axis }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{
                          fontSize: 11,
                          fill: chartColors.text
                        }}
                        axisLine={{ stroke: '#10B981' }}
                        tickLine={{ stroke: '#10B981' }}
                        label={{
                          value: 'Promedio (%)',
                          angle: -90,
                          position: 'insideLeft',
                          style: {
                            textAnchor: 'middle',
                            fontSize: '12px',
                            fill: '#10B981',
                            fontWeight: 'bold'
                          }
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
                            return [`${value}%`, '🎯 Puntuación Promedio'];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(label) => `📚 Modo ${label}`}
                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                      />
                      <Bar
                        dataKey="score"
                        fill="#10B981"
                        fillOpacity={0.85}
                        radius={[4, 4, 0, 0]}
                        name="score"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <p id="performance-chart-desc" className="dashboard-sr-only">
                Bar chart showing average performance scores grouped by learning mode: {moduleData.map(d => d.mode).join(', ')}
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