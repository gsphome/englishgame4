import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, LearningModule, SessionScore } from '../types';

interface AppStore extends AppState {
  // Actions
  setCurrentModule: (module: LearningModule | null) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  updateSessionScore: (score: Partial<SessionScore>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Initial state
      currentModule: null,
      currentView: 'menu',
      sessionScore: {
        correct: 0,
        incorrect: 0,
        total: 0,
        accuracy: 0
      },
      isLoading: false,
      error: null,

      // Actions
      setCurrentModule: (module) => set((state) => {
        // Always reset session score when setting a new module
        const shouldResetScore = module && (!state.currentModule || module.id !== state.currentModule.id);
        
        return {
          currentModule: module,
          sessionScore: shouldResetScore 
            ? { correct: 0, incorrect: 0, total: 0, accuracy: 0 }
            : state.sessionScore
        };
      }),
      
      setCurrentView: (view) => set((state) => ({ 
        currentView: view,
        // Clear currentModule when going back to menu
        currentModule: view === 'menu' ? null : state.currentModule
      })),
      
      updateSessionScore: (scoreUpdate) => set((state) => {
        const newScore = { ...state.sessionScore, ...scoreUpdate };
        newScore.total = newScore.correct + newScore.incorrect;
        newScore.accuracy = newScore.total > 0 ? (newScore.correct / newScore.total) * 100 : 0;
        return { sessionScore: newScore };
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      resetSession: () => {
        // Clear any persisted sessionScore from localStorage
        const stored = localStorage.getItem('app-storage');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.state && parsed.state.sessionScore) {
              delete parsed.state.sessionScore;
              localStorage.setItem('app-storage', JSON.stringify(parsed));
            }
          } catch (e) {
            console.warn('Error cleaning sessionScore from localStorage:', e);
          }
        }
        
        return set({
          sessionScore: { correct: 0, incorrect: 0, total: 0, accuracy: 0 },
          error: null,
          currentModule: null
        });
      }
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        currentView: state.currentView,
        currentModule: state.currentModule
        // sessionScore should NOT be persisted - it's session-only data
      })
    }
  )
);