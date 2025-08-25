export const translations = {
  en: {
    // General
    settings: 'Settings',
    menu: 'Menu',
    mainMenu: 'Main Menu',
    about: 'About',
    theme: 'Theme',
    language: 'Language',
    level: 'Level',
    categories: 'Categories',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    close: 'Close',
    
    // Themes
    light: 'Light',
    dark: 'Dark',
    
    // Languages
    english: 'English',
    spanish: 'Español',
    
    // Levels
    all: 'All Levels',
    a1: 'Beginner (A1)',
    a2: 'Elementary (A2)',
    b1: 'Intermediate (B1)',
    b2: 'Upper-Intermediate (B2)',
    c1: 'Advanced (C1)',
    c2: 'Proficiency (C2)',
    
    // Categories
    vocabulary: '📚 Vocabulary',
    grammar: '📝 Grammar',
    phrasalVerbs: '🔗 Phrasal Verbs',
    idioms: '💭 Idioms',
    
    // Game Settings
    gameSettings: 'Game Settings',
    flashcardMode: 'Flashcard Items',
    quizMode: 'Quiz Questions',
    completionMode: 'Completion Items',
    sortingMode: 'Sorting Items',
    matchingMode: 'Matching Pairs',
    
    // Sections
    generalSettings: 'General',
    itemSettings: 'Items per Game',
    categorySettings: 'Content Categories',
    
    // Navigation / Action Buttons
    nextButton: 'Next',
    prevButton: 'Previous',
    flipButton: 'Flip',
    finishButton: 'Finish',
    noDataAvailable: 'No data available'
  },
  es: {
    // General
    settings: 'Configuración',
    menu: 'Menú',
    mainMenu: 'Menú Principal',
    about: 'Acerca de',
    theme: 'Tema',
    language: 'Idioma',
    level: 'Nivel',
    categories: 'Categorías',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    close: 'Cerrar',
    
    // Themes
    light: 'Claro',
    dark: 'Oscuro',
    
    // Languages
    english: 'English',
    spanish: 'Español',
    
    // Levels
    all: 'Todos los Niveles',
    a1: 'Principiante (A1)',
    a2: 'Elemental (A2)',
    b1: 'Intermedio (B1)',
    b2: 'Intermedio Alto (B2)',
    c1: 'Avanzado (C1)',
    c2: 'Competencia (C2)',
    
    // Categories
    vocabulary: '📚 Vocabulario',
    grammar: '📝 Gramática',
    phrasalVerbs: '🔗 Phrasal Verbs',
    idioms: '💭 Modismos',
    
    // Game Settings
    gameSettings: 'Configuración de Juegos',
    flashcardMode: 'Items de Flashcard',
    quizMode: 'Preguntas de Quiz',
    completionMode: 'Items de Completar',
    sortingMode: 'Items de Ordenar',
    matchingMode: 'Pares de Matching',
    
    // Sections
    generalSettings: 'General',
    itemSettings: 'Items por Juego',
    categorySettings: 'Categorías de Contenido',
    
    // Navigation / Action Buttons
    nextButton: 'Siguiente',
    prevButton: 'Anterior',
    flipButton: 'Voltear',
    finishButton: 'Terminar',
    noDataAvailable: 'No hay datos disponibles'
  }
};

export const useTranslation = (language: 'en' | 'es') => {
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };
  
  return { t };
};