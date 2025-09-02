// Core Types
export interface LearningModule {
  id: string;
  name: string;
  description?: string;
  learningMode: 'flashcard' | 'quiz' | 'completion' | 'sorting' | 'matching';
  level: string[] | string;
  category: string;
  tags?: string[];
  data?: any[];
  dataPath?: string;
  estimatedTime?: number;
  difficulty?: number;
}

export interface FlashcardData {
  id: string;
  en: string;
  es: string;
  ipa?: string;
  example?: string;
  example_es?: string;
}

// User & Auth
export interface User {
  id: string;
  name: string;
  email?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserPreferences {
  language: 'en' | 'es';
  dailyGoal: number;
  categories: string[];
  difficulty: number;
  notifications: boolean;
}

// Scoring & Progress
export interface SessionScore {
  correct: number;
  incorrect: number;
  total: number;
  accuracy: number;
}

export interface ModuleScore {
  moduleId: string;
  bestScore: number;
  attempts: number;
  lastAttempt: string;
  timeSpent: number;
}

// App State
export interface AppState {
  currentModule: LearningModule | null;
  currentView: 'menu' | 'flashcard' | 'quiz' | 'completion' | 'sorting' | 'matching';
  sessionScore: SessionScore;
  globalScore: SessionScore;
  isLoading: boolean;
  error: string | null;
}