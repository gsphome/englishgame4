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
    settings: {
      settings: 'Settings',
      generalSettings: 'General Settings',
      itemSettings: 'Game Settings',
      categorySettings: 'Category Settings',
      theme: 'Theme',
      language: 'Language',
      level: 'Level',
      light: 'Light',
      dark: 'Dark',
      english: 'English',
      spanish: 'Spanish',
      all: 'All Levels',
      a1: 'Beginner (A1)',
      a2: 'Elementary (A2)',
      b1: 'Intermediate (B1)',
      b2: 'Upper Intermediate (B2)',
      c1: 'Advanced (C1)',
      c2: 'Proficient (C2)',
      flashcardMode: 'Flashcard Mode',
      quizMode: 'Quiz Mode',
      completionMode: 'Completion Mode',
      sortingMode: 'Sorting Mode',
      sortingCategories: 'Sorting Categories',
      matchingMode: 'Matching Mode',
      vocabulary: 'Vocabulary',
      grammar: 'Grammar',
      phrasalVerbs: 'Phrasal Verbs',
      idioms: 'Idioms',
      edit: 'Edit',
      cancel: 'Cancel',
      save: 'Save'
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
    dashboard: {
      learningDashboard: 'Learning Dashboard',
      totalScore: 'Points earned',
      avgScore: 'Avg accuracy',
      totalSessions: 'Sessions done',
      timeSpent: 'Time practiced',
      weeklyProgress: 'Weekly Progress',
      modulePerformance: 'Module Performance',
      learningAccuracy: 'Accuracy',
      studySessions: 'Sessions',
      noProgressData: 'No data yet',
      noModuleData: 'No modules completed',
      completeModulesMessage: 'Complete modules to see progress!',
      helpButton: 'Help',
      helpTitle: 'How Metrics Work',
      helpPointsTitle: 'Points System',
      helpPointsDesc: 'Earn points by completing quizzes and exercises. Higher accuracy = more points per question.',
      helpAccuracyTitle: 'Accuracy Score',
      helpAccuracyDesc: 'Percentage of correct answers in your recent sessions. Calculated from your last 7 days of activity.',
      helpSessionsTitle: 'Study Sessions',
      helpSessionsDesc: 'Each time you complete a learning module counts as one session. More sessions = more practice!',
      helpTimeTitle: 'Practice Time',
      helpTimeDesc: 'Total minutes spent actively learning. Time is tracked while you\'re engaged with exercises.',
      helpProgressTitle: 'Progress Tracking',
      helpProgressDesc: 'Charts show your daily performance trends. Blue bars = accuracy, green line = session count.',
      helpModuleTitle: 'Module Performance',
      helpModuleDesc: 'Your best score in each completed module. Focus on modules with lower scores to improve.',
      closeHelp: 'Got it!'
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
    profile: {
      userProfile: 'User Profile',
      personalInfo: 'Personal Information',
      learningPreferences: 'Learning Preferences',
      name: 'Name',
      enterName: 'Enter your name',
      englishLevel: 'English Level',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      interfaceLanguage: 'Interface Language',
      dailyGoal: 'Daily Goal',
      difficultyLevel: 'Difficulty Level',
      easy: 'Easy',
      hard: 'Hard',
      interestedCategories: 'Categories of Interest',
      enableNotifications: 'Enable Notifications',
      notificationDescription: 'Get reminders to maintain your study streak',
      saveProfile: 'Save Profile',
      profileSubtitle: 'Customize your learning experience',
      nameRequired: 'Name must be at least 2 characters',
      categoriesRequired: 'Select at least one category'
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
    settings: {
      settings: 'Configuración',
      generalSettings: 'Configuración General',
      itemSettings: 'Configuración de Juego',
      categorySettings: 'Configuración de Categorías',
      theme: 'Tema',
      language: 'Idioma',
      level: 'Nivel',
      light: 'Claro',
      dark: 'Oscuro',
      english: 'Inglés',
      spanish: 'Español',
      all: 'Todos los Niveles',
      a1: 'Principiante (A1)',
      a2: 'Elemental (A2)',
      b1: 'Intermedio (B1)',
      b2: 'Intermedio Alto (B2)',
      c1: 'Avanzado (C1)',
      c2: 'Competente (C2)',
      flashcardMode: 'Modo Tarjetas',
      quizMode: 'Modo Cuestionario',
      completionMode: 'Modo Completar',
      sortingMode: 'Modo Clasificar',
      sortingCategories: 'Categorías de Clasificación',
      matchingMode: 'Modo Emparejar',
      vocabulary: 'Vocabulario',
      grammar: 'Gramática',
      phrasalVerbs: 'Verbos Frasales',
      idioms: 'Modismos',
      edit: 'Editar',
      cancel: 'Cancelar',
      save: 'Guardar'
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
    dashboard: {
      learningDashboard: 'Panel de Aprendizaje',
      totalScore: 'Puntos obtenidos',
      avgScore: 'Precisión promedio',
      totalSessions: 'Sesiones hechas',
      timeSpent: 'Tiempo practicado',
      weeklyProgress: 'Progreso Semanal',
      modulePerformance: 'Rendimiento por Módulo',
      learningAccuracy: 'Precisión',
      studySessions: 'Sesiones',
      noProgressData: 'Sin datos aún',
      noModuleData: 'Sin módulos completados',
      completeModulesMessage: '¡Completa módulos para ver progreso!',
      helpButton: 'Ayuda',
      helpTitle: 'Cómo Funcionan las Métricas',
      helpPointsTitle: 'Sistema de Puntos',
      helpPointsDesc: 'Gana puntos completando cuestionarios y ejercicios. Mayor precisión = más puntos por pregunta.',
      helpAccuracyTitle: 'Puntuación de Precisión',
      helpAccuracyDesc: 'Porcentaje de respuestas correctas en tus sesiones recientes. Calculado de tus últimos 7 días de actividad.',
      helpSessionsTitle: 'Sesiones de Estudio',
      helpSessionsDesc: 'Cada vez que completas un módulo de aprendizaje cuenta como una sesión. ¡Más sesiones = más práctica!',
      helpTimeTitle: 'Tiempo de Práctica',
      helpTimeDesc: 'Minutos totales dedicados al aprendizaje activo. El tiempo se registra mientras participas en ejercicios.',
      helpProgressTitle: 'Seguimiento de Progreso',
      helpProgressDesc: 'Los gráficos muestran tus tendencias de rendimiento diario. Barras azules = precisión, línea verde = número de sesiones.',
      helpModuleTitle: 'Rendimiento por Módulo',
      helpModuleDesc: 'Tu mejor puntuación en cada módulo completado. Enfócate en módulos con puntuaciones más bajas para mejorar.',
      closeHelp: '¡Entendido!'
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
    profile: {
      userProfile: 'Perfil de Usuario',
      personalInfo: 'Información Personal',
      learningPreferences: 'Preferencias de Aprendizaje',
      name: 'Nombre',
      enterName: 'Ingresa tu nombre completo',
      englishLevel: 'Nivel de Inglés',
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
      interfaceLanguage: 'Idioma de la Interfaz',
      dailyGoal: 'Meta Diaria',
      difficultyLevel: 'Nivel de Dificultad',
      easy: 'Fácil',
      hard: 'Difícil',
      interestedCategories: 'Categorías de Interés',
      enableNotifications: 'Habilitar Notificaciones',
      notificationDescription: 'Recibe recordatorios para mantener tu racha de estudio',
      saveProfile: 'Guardar Perfil',
      profileSubtitle: 'Personaliza tu experiencia de aprendizaje',
      nameRequired: 'El nombre debe tener al menos 2 caracteres',
      categoriesRequired: 'Selecciona al menos una categoría'
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

    // If value is still an object, it means we didn't find the right key
    // Return the defaultValue or the key itself as a string
    let result: string;
    if (typeof value === 'string') {
      result = value;
    } else if (defaultValue) {
      result = defaultValue;
    } else {
      result = key; // Return the key as fallback
    }

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

// Translation key builders (use these with useTranslation hook in components)
export const getCommonKey = (key: string) => `common.${key}` as TranslationKeys;
export const getErrorKey = (key: string) => `errors.${key}` as TranslationKeys;
export const getCategoryKey = (category: string) => {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '');
  return `categories.${categoryKey}` as TranslationKeys;
};
export const getLevelKey = (level: string) => `levels.${level.toLowerCase()}` as TranslationKeys;