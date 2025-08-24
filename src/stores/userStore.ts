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
      }
    }),
    {
      name: 'user-storage'
    }
  )
);