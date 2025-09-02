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
        
        console.log('🏪 AppStore - setCurrentModule called:', {
          newModule: module?.id,
          currentModule: state.currentModule?.id,
          shouldResetScore,
          currentSessionScore: state.sessionScore
        });
        
        const newSessionScore = shouldResetScore 
          ? { correct: 0, incorrect: 0, total: 0, accuracy: 0 }
          : state.sessionScore;
          
        console.log('🏪 AppStore - Setting sessionScore to:', newSessionScore);
        
        return {
          currentModule: module,
          sessionScore: newSessionScore
        };
      }),
      
      setCurrentView: (view) => set((state) => ({ 
        currentView: view,
        // Clear currentModule when going back to menu
        currentModule: view === 'menu' ? null : state.currentModule
      })),
      
      updateSessionScore: (scoreUpdate) => set((state) => {
        console.log('🏪 AppStore - updateSessionScore called:', {
          currentScore: state.sessionScore,
          scoreUpdate,
        });
        
        // INCREMENT the values instead of replacing them
        const newScore = { ...state.sessionScore };
        if (scoreUpdate.correct) {
          newScore.correct += scoreUpdate.correct;
        }
        if (scoreUpdate.incorrect) {
          newScore.incorrect += scoreUpdate.incorrect;
        }
        
        newScore.total = newScore.correct + newScore.incorrect;
        newScore.accuracy = newScore.total > 0 ? (newScore.correct / newScore.total) * 100 : 0;
        
        console.log('🏪 AppStore - New score calculated (INCREMENTED):', newScore);
        
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