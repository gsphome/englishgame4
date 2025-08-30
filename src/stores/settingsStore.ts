import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameSettings {
  flashcardMode: { wordCount: number };
  quizMode: { questionCount: number };
  completionMode: { itemCount: number };
  sortingMode: { wordCount: number; categoryCount: number };
  matchingMode: { wordCount: number };
}

export interface MaxLimits {
  flashcard: number;
  quiz: number;
  completion: number;
  sorting: number;
  matching: number;
  maxCategories: number;
}

export interface SettingsState {
  // General
  theme: 'light' | 'dark';
  language: 'en' | 'es';
  level: 'all' | 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';
  
  // Categories
  categories: string[];
  
  // Game Settings
  gameSettings: GameSettings;
  
  // Max limits based on available data
  maxLimits: MaxLimits;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'en' | 'es') => void;
  setLevel: (level: string) => void;
  setCategories: (categories: string[]) => void;
  setGameSetting: (mode: keyof GameSettings, setting: string, value: number) => void;
  updateMaxLimits: (limits: MaxLimits) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Default values
      theme: 'light',
      language: 'en',
      level: 'all',
      categories: ['Vocabulary', 'Grammar', 'PhrasalVerbs', 'Idioms'],
      gameSettings: {
        flashcardMode: { wordCount: 10 },
        quizMode: { questionCount: 10 },
        completionMode: { itemCount: 10 },
        sortingMode: { wordCount: 5, categoryCount: 3 },
        matchingMode: { wordCount: 6 }
      },
      
      maxLimits: {
        flashcard: 50,
        quiz: 50,
        completion: 50,
        sorting: 50,
        matching: 50,
        maxCategories: 10
      },
      
      // Actions
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to DOM
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      setLanguage: (language) => set({ language }),
      
      setLevel: (level) => set({ level: level as any }),
      
      setCategories: (categories) => set({ categories }),
      
      setGameSetting: (mode, setting, value) => {
        const currentSettings = get().gameSettings;
        set({
          gameSettings: {
            ...currentSettings,
            [mode]: {
              ...currentSettings[mode],
              [setting]: value
            }
          }
        });
      },
      
      updateMaxLimits: (limits) => set({ maxLimits: limits })
    }),
    {
      name: 'settings-storage'
    }
  )
);