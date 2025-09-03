import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Trophy, Target, Clock, TrendingUp, X } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';
// import { useToast } from '../../hooks/useToast'; // Commented out as not currently used
import { toast } from '../../stores/toastStore';
import { DashboardSkeleton } from './LoadingSkeleton';

interface DashboardProps {
  onClose: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const { userScores, getTotalScore } = useUserStore();
  const { language } = useSettingsStore();
  const { t } = useTranslation(language);
  // const { showInfo } = useToast(); // Commented out as not currently used
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate loading for demo purposes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Show dashboard toast only once per session
      toast.once('dashboard-opened', 'info', 'Dashboard cargado', 'Aquí puedes ver tu progreso de aprendizaje');
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Mock data for demo
  const progressData = [
    { date: '2025-01-20', score: 65 },
    { date: '2025-01-21', score: 72 },
    { date: '2025-01-22', score: 78 },
    { date: '2025-01-23', score: 85 },
    { date: '2025-01-24', score: 92 }
  ];

  const moduleData = Object.values(userScores).map(score => ({
    module: score.moduleId.split('-').pop() || 'Module',
    score: score.bestScore,
    attempts: score.attempts
  }));

  const totalScore = getTotalScore();
  const totalAttempts = Object.values(userScores).reduce((sum, score) => sum + score.attempts, 0);
  const avgScore = moduleData.length > 0 ? Math.round(moduleData.reduce((sum, m) => sum + m.score, 0) / moduleData.length) : 0;

  if (isLoading) {
    return (
      <>
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-50 w-10 h-10 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
          title="Close Dashboard"
          aria-label="Close dashboard"
        >
          <X className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
        </button>
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-6 relative">
      {/* Floating Close Button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title="Close Dashboard"
        aria-label="Close dashboard"
      >
        <X className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
      </button>
      <h2 
        className="text-3xl font-bold mb-8 text-gray-900 dark:text-white"
        id="dashboard-title"
      >
        {t('learningDashboard') || 'Learning Dashboard'}
      </h2>
      
      {/* Stats Cards */}
      <div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        role="region"
        aria-labelledby="dashboard-title"
      >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-500 mr-3" aria-hidden="true" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t('totalScore') || 'Total Score'}</p>
              <p 
                className="text-2xl font-bold text-gray-900 dark:text-white"
                aria-label={`Total score: ${totalScore} points`}
              >
                {totalScore}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-500 mr-3" aria-hidden="true" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t('avgScore') || 'Avg Score'}</p>
              <p 
                className="text-2xl font-bold text-gray-900 dark:text-white"
                aria-label={`Average score: ${avgScore} percent`}
              >
                {avgScore}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-500 mr-3" aria-hidden="true" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t('totalAttempts') || 'Total Attempts'}</p>
              <p 
                className="text-2xl font-bold text-gray-900 dark:text-white"
                aria-label={`Total attempts: ${totalAttempts}`}
              >
                {totalAttempts}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mr-3" aria-hidden="true" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{t('modules') || 'Modules'}</p>
              <p 
                className="text-2xl font-bold text-gray-900 dark:text-white"
                aria-label={`Modules completed: ${moduleData.length}`}
              >
                {moduleData.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 
            className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            id="progress-chart-title"
          >
            {t('progressOverTime') || 'Progress Over Time'}
          </h3>
          <div role="img" aria-labelledby="progress-chart-title" aria-describedby="progress-chart-desc">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p id="progress-chart-desc" className="sr-only">
            Line chart showing learning progress over the last 5 days, with scores ranging from 65 to 92 points
          </p>
        </div>

        {/* Module Performance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 
            className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            id="performance-chart-title"
          >
            {t('modulePerformance') || 'Module Performance'}
          </h3>
          <div role="img" aria-labelledby="performance-chart-title" aria-describedby="performance-chart-desc">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moduleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="module" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p id="performance-chart-desc" className="sr-only">
            Bar chart showing performance scores for {moduleData.length} completed learning modules
          </p>
        </div>
      </div>
    </div>
  );
};