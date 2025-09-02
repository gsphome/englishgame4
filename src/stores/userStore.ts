import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, ModuleScore } from '../types';

interface UserStore {
  user: User | null;
  userScores: Record<string, ModuleScore>;
  
  // Actions
  setUser: (user: User | null) => void;
  updateUserScore: (moduleId: string, score: number, timeSpent: number) => void;
  getUserProgress: (moduleId: string) => ModuleScore | null;
  getTotalScore: () => number;
  getGlobalStats: () => {
    totalScore: number;
    avgScore: number;
    totalAttempts: number;
    totalModules: number;
    bestStreak: number;
    level: number;
    progressToNextLevel: number;
  };
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      userScores: {},

      setUser: (user) => set({ user }),

      updateUserScore: (moduleId, score, timeSpent) => set((state) => {
        const existingScore = state.userScores[moduleId];
        const newScore: ModuleScore = {
          moduleId,
          bestScore: existingScore ? Math.max(existingScore.bestScore, score) : score,
          attempts: existingScore ? existingScore.attempts + 1 : 1,
          lastAttempt: new Date().toISOString(),
          timeSpent: existingScore ? existingScore.timeSpent + timeSpent : timeSpent
        };

        return {
          userScores: {
            ...state.userScores,
            [moduleId]: newScore
          }
        };
      }),

      getUserProgress: (moduleId) => {
        const { userScores } = get();
        return userScores[moduleId] || null;
      },

      getTotalScore: () => {
        const { userScores } = get();
        return Object.values(userScores).reduce((total, score) => total + score.bestScore, 0);
      },

      getGlobalStats: () => {
        const { userScores } = get();
        const scores = Object.values(userScores);
        
        if (scores.length === 0) {
          return {
            totalScore: 0,
            avgScore: 0,
            totalAttempts: 0,
            totalModules: 0,
            bestStreak: 0,
            level: 1,
            progressToNextLevel: 0
          };
        }

        const totalScore = scores.reduce((sum, score) => sum + score.bestScore, 0);
        const totalAttempts = scores.reduce((sum, score) => sum + score.attempts, 0);
        const avgScore = Math.round(totalScore / scores.length);
        
        // Calculate level (every 100 points = 1 level)
        const level = Math.floor(totalScore / 100) + 1;
        const progressToNextLevel = totalScore % 100;
        
        // Calculate best streak (consecutive high scores)
        const sortedScores = scores
          .sort((a, b) => new Date(b.lastAttempt).getTime() - new Date(a.lastAttempt).getTime())
          .map(s => s.bestScore);
        
        let bestStreak = 0;
        let currentStreak = 0;
        
        for (const score of sortedScores) {
          if (score >= 80) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        }

        return {
          totalScore,
          avgScore,
          totalAttempts,
          totalModules: scores.length,
          bestStreak,
          level,
          progressToNextLevel
        };
      }
    }),
    {
      name: 'user-storage'
    }
  )
);