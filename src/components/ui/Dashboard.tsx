import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Trophy, Target, Clock, TrendingUp, X } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTranslation } from '../../utils/i18n';

interface DashboardProps {
  onClose: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const { userScores, getTotalScore } = useUserStore();
  const { theme, language } = useSettingsStore();
  const { t } = useTranslation(language);

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

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-6 relative">
      {/* Floating Close Button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title="Close Dashboard"
      >
        <X className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
      </button>
      <h2 className="text-3xl font-bold mb-8" style={{ color: theme === 'dark' ? 'white' : '#111827' }}>{t('learningDashboard') || 'Learning Dashboard'}</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">{t('totalScore') || 'Total Score'}</p>
              <p className="text-2xl font-bold text-gray-900">{totalScore}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">{t('avgScore') || 'Avg Score'}</p>
              <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">{t('totalAttempts') || 'Total Attempts'}</p>
              <p className="text-2xl font-bold text-gray-900">{totalAttempts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">{t('modules') || 'Modules'}</p>
              <p className="text-2xl font-bold text-gray-900">{moduleData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('progressOverTime') || 'Progress Over Time'}</h3>
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

        {/* Module Performance */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('modulePerformance') || 'Module Performance'}</h3>
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
      </div>
    </div>
  );
};