import type { Language } from '../types';

// Enhanced translations with nested structure
export const translations = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish',
      start: 'Start',
      pause: 'Pause',
      resume: 'Resume',
      reset: 'Reset'
    },
    navigation: {
      mainMenu: 'Main Menu',
      dashboard: 'Dashboard',
      settings: 'Settings',
      profile: 'Profile',
      help: 'Help',
      about: 'About'
    },
    learning: {
      flashcards: 'Flashcards',
      quiz: 'Quiz',
      completion: 'Completion',
      sorting: 'Sorting',
      matching: 'Matching',
      startLearning: 'Start Learning',
      continueSession: 'Continue Session',
      newSession: 'New Session'
    },
    scores: {
      correct: 'Correct',
      incorrect: 'Incorrect',
      total: 'Total',
      accuracy: 'Accuracy',
      sessionScore: 'Session Score',
      globalScore: 'Global Score',
      bestScore: 'Best Score',
      attempts: 'Attempts',
      timeSpent: 'Time Spent'
    },
    categories: {
      vocabulary: 'Vocabulary',
      grammar: 'Grammar',
      phrasalverbs: 'Phrasal Verbs',
      idioms: 'Idioms',
      all: 'All Categories'
    },
    levels: {
      all: 'All Levels',
      a1: 'Beginner (A1)',
      a2: 'Elementary (A2)',
      b1: 'Intermediate (B1)',
      b2: 'Upper Intermediate (B2)',
      c1: 'Advanced (C1)',
      c2: 'Proficient (C2)'
    },
    messages: {
      noDataAvailable: 'No data available',
      moduleNotFound: 'Module not found',
      loadingFailed: 'Failed to load content',
      sessionComplete: 'Session completed!',
      wellDone: 'Well done!',
      tryAgain: 'Try again',
      correctAnswer: 'Correct answer!',
      incorrectAnswer: 'Incorrect answer',
      gameComplete: 'Game completed!',
      newRecord: 'New record!'
    },
    errors: {
      somethingWentWrong: 'Something went wrong',
      networkError: 'Network error',
      serverError: 'Server error',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      forbidden: 'Forbidden',
      timeout: 'Request timeout',
      unknownError: 'Unknown error'
    }
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      retry: 'Reintentar',
      cancel: 'Cancelar',
      save: 'Guardar',
      close: 'Cerrar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      finish: 'Finalizar',
      start: 'Comenzar',
      pause: 'Pausar',
      resume: 'Continuar',
      reset: 'Reiniciar'
    },
    navigation: {
      mainMenu: 'Menú Principal',
      dashboard: 'Panel',
      settings: 'Configuración',
      profile: 'Perfil',
      help: 'Ayuda',
      about: 'Acerca de'
    },
    learning: {
      flashcards: 'Tarjetas',
      quiz: 'Cuestionario',
      completion: 'Completar',
      sorting: 'Clasificar',
      matching: 'Emparejar',
      startLearning: 'Comenzar Aprendizaje',
      continueSession: 'Continuar Sesión',
      newSession: 'Nueva Sesión'
    },
    scores: {
      correct: 'Correctas',
      incorrect: 'Incorrectas',
      total: 'Total',
      accuracy: 'Precisión',
      sessionScore: 'Puntuación de Sesión',
      globalScore: 'Puntuación Global',
      bestScore: 'Mejor Puntuación',
      attempts: 'Intentos',
      timeSpent: 'Tiempo Empleado'
    },
    categories: {
      vocabulary: 'Vocabulario',
      grammar: 'Gramática',
      phrasalverbs: 'Verbos Frasales',
      idioms: 'Modismos',
      all: 'Todas las Categorías'
    },
    levels: {
      all: 'Todos los Niveles',
      a1: 'Principiante (A1)',
      a2: 'Elemental (A2)',
      b1: 'Intermedio (B1)',
      b2: 'Intermedio Alto (B2)',
      c1: 'Avanzado (C1)',
      c2: 'Competente (C2)'
    },
    messages: {
      noDataAvailable: 'No hay datos disponibles',
      moduleNotFound: 'Módulo no encontrado',
      loadingFailed: 'Error al cargar contenido',
      sessionComplete: '¡Sesión completada!',
      wellDone: '¡Bien hecho!',
      tryAgain: 'Inténtalo de nuevo',
      correctAnswer: '¡Respuesta correcta!',
      incorrectAnswer: 'Respuesta incorrecta',
      gameComplete: '¡Juego completado!',
      newRecord: '¡Nuevo récord!'
    },
    errors: {
      somethingWentWrong: 'Algo salió mal',
      networkError: 'Error de red',
      serverError: 'Error del servidor',
      notFound: 'No encontrado',
      unauthorized: 'No autorizado',
      forbidden: 'Prohibido',
      timeout: 'Tiempo de espera agotado',
      unknownError: 'Error desconocido'
    }
  }
} as const;

// Type-safe translation keys based on the JSON structure
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKeys = NestedKeyOf<typeof translations.en>;

export const useTranslation = (language: Language) => {
  const t = (key: TranslationKeys | string, defaultValue?: string, interpolation?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    let result = value || defaultValue || key;
    
    // Simple interpolation support
    if (interpolation && typeof result === 'string') {
      Object.entries(interpolation).forEach(([placeholder, replacement]) => {
        result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacement));
      });
    }
    
    return result;
  };
  
  // Helper functions for common translation patterns
  const tn = (namespace: string, key: string, defaultValue?: string) => {
    return t(`${namespace}.${key}` as TranslationKeys, defaultValue);
  };
  
  const tc = (key: string, count: number, defaultValue?: string) => {
    const pluralKey = count === 1 ? key : `${key}_plural`;
    return t(pluralKey as TranslationKeys, defaultValue, { count });
  };
  
  return { 
    t, 
    tn, // namespace translation
    tc, // count-based translation
    language,
    // Check if translation exists
    exists: (key: string) => {
      const keys = key.split('.');
      let value: any = translations[language];
      for (const k of keys) {
        value = value?.[k];
      }
      return value !== undefined;
    }
  };
};

// Utility functions for common translations
export const getCommonTranslation = (key: string, language: Language = 'en') => {
  const { t } = useTranslation(language);
  return t(`common.${key}` as TranslationKeys);
};

export const getErrorTranslation = (key: string, language: Language = 'en') => {
  const { t } = useTranslation(language);
  return t(`errors.${key}` as TranslationKeys);
};

export const getCategoryTranslation = (category: string, language: Language = 'en') => {
  const { t } = useTranslation(language);
  const categoryKey = category.toLowerCase().replace(/\s+/g, '');
  return t(`categories.${categoryKey}` as TranslationKeys, category);
};

export const getLevelTranslation = (level: string, language: Language = 'en') => {
  const { t } = useTranslation(language);
  return t(`levels.${level.toLowerCase()}` as TranslationKeys, level.toUpperCase());
};