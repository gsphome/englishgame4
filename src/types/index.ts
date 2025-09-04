// Core Types
export type LearningMode = 'flashcard' | 'quiz' | 'completion' | 'sorting' | 'matching';
export type DifficultyLevel = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';
export type Category = 'Vocabulary' | 'Grammar' | 'PhrasalVerbs' | 'Idioms';

export interface LearningModule {
  id: string;
  name: string;
  description?: string;
  learningMode: LearningMode;
  level: DifficultyLevel[] | DifficultyLevel;
  category: Category;
  tags?: string[];
  data?: LearningData[];
  dataPath?: string;
  estimatedTime?: number;
  difficulty?: number;
}

// Base interface for all learning data types
export interface BaseLearningData {
  id: string;
  category?: Category;
  level?: DifficultyLevel;
}

// Specific data types for different learning modes
export interface FlashcardData extends BaseLearningData {
  en: string;
  es: string;
  ipa?: string;
  example?: string;
  example_es?: string;
}

export interface QuizData extends BaseLearningData {
  question?: string;
  sentence?: string; // For sentence-based quizzes
  idiom?: string; // For idiom quizzes
  options: string[];
  correct: number | string;
  explanation?: string;
}

export interface CompletionData extends BaseLearningData {
  sentence: string;
  correct: string;
  missing?: string;
  options?: string[];
  hint?: string;
  tip?: string;
  explanation?: string;
}

export interface SortingData extends BaseLearningData {
  word: string;
  category: Category;
  subcategory?: string;
}

export interface MatchingData extends BaseLearningData {
  left: string;
  right: string;
  type: 'word-definition' | 'word-translation' | 'question-answer';
  pairs?: { left: string; right: string }[];
}

// Union type for all learning data
export type LearningData = 
  | FlashcardData 
  | QuizData 
  | CompletionData 
  | SortingData 
  | MatchingData;

// Language and Theme types
export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark';
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

// User & Auth
export interface User {
  id: string;
  name: string;
  email?: string;
  level: UserLevel;
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserPreferences {
  language: Language;
  dailyGoal: number;
  categories: Category[];
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
export type AppView = 'menu' | LearningMode;

export interface AppState {
  currentModule: LearningModule | null;
  currentView: AppView;
  sessionScore: SessionScore;
  globalScore: SessionScore;
  isLoading: boolean;
  error: string | null;
}

// Settings types
export interface GameModeSettings {
  wordCount?: number;
  questionCount?: number;
  itemCount?: number;
  categoryCount?: number;
}

export interface GameSettings {
  flashcardMode: GameModeSettings;
  quizMode: GameModeSettings;
  completionMode: GameModeSettings;
  sortingMode: GameModeSettings & { categoryCount: number };
  matchingMode: GameModeSettings;
}

export interface MaxLimits {
  flashcard: number;
  quiz: number;
  completion: number;
  sorting: number;
  matching: number;
  maxCategories: number;
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  isGameRelated?: boolean;
}

// API Response types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}