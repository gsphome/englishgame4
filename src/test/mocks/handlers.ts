// Mock API handlers for testing
import { vi } from 'vitest';
import type { LearningModule } from '../../types';

// Mock data
const mockModules: LearningModule[] = [
  {
    id: 'flashcard-ielts-general',
    name: 'IELTS General Vocabulary',
    description: 'Essential vocabulary for IELTS General Training',
    learningMode: 'flashcard',
    level: ['b1', 'b2'],
    category: 'Vocabulary',
    tags: ['ielts', 'general', 'vocabulary'],
    dataPath: '/data/flashcard-ielts-general.json',
    estimatedTime: 10,
    difficulty: 3,
  },
  {
    id: 'quiz-grammar-basics',
    name: 'Grammar Basics Quiz',
    description: 'Test your knowledge of basic English grammar',
    learningMode: 'quiz',
    level: ['a2', 'b1'],
    category: 'Grammar',
    tags: ['grammar', 'basics', 'quiz'],
    dataPath: '/data/quiz-grammar-basics.json',
    estimatedTime: 15,
    difficulty: 2,
  },
];

const mockFlashcardData = {
  data: [
    {
      id: '1',
      en: 'accomplish',
      es: 'lograr',
      ipa: '/əˈkʌmplɪʃ/',
      example: 'She accomplished her goal of learning English.',
      example_es: 'Ella logró su objetivo de aprender inglés.',
      category: 'Vocabulary',
      level: 'b1'
    },
    {
      id: '2',
      en: 'adequate',
      es: 'adecuado',
      ipa: '/ˈædɪkwət/',
      example: 'The facilities are adequate for our needs.',
      example_es: 'Las instalaciones son adecuadas para nuestras necesidades.',
      category: 'Vocabulary',
      level: 'b2'
    },
  ],
  estimatedTime: 10,
  difficulty: 3,
  tags: ['ielts', 'vocabulary']
};

const mockQuizData = {
  data: [
    {
      id: '1',
      question: 'Which sentence is correct?',
      options: [
        'I have been living here since 5 years.',
        'I have been living here for 5 years.',
        'I am living here since 5 years.',
        'I live here since 5 years.'
      ],
      correct: 1,
      explanation: 'We use "for" with periods of time and "since" with points in time.',
      category: 'Grammar',
      level: 'b1'
    },
    {
      id: '2',
      question: 'Choose the correct form:',
      options: [
        'If I was you, I would study more.',
        'If I were you, I would study more.',
        'If I am you, I would study more.',
        'If I will be you, I would study more.'
      ],
      correct: 1,
      explanation: 'In second conditional, we use "were" for all persons after "if".',
      category: 'Grammar',
      level: 'b1'
    },
  ],
  estimatedTime: 15,
  difficulty: 2,
  tags: ['grammar', 'conditionals']
};

// Simple mock fetch implementation for testing
export const mockFetch = (url: string): Promise<Response> => {
  return new Promise((resolve) => {
    let data: any;
    
    if (url.includes('learning-modules.json')) {
      data = mockModules;
    } else if (url.includes('flashcard-ielts-general.json')) {
      data = mockFlashcardData;
    } else if (url.includes('quiz-grammar-basics.json')) {
      data = mockQuizData;
    } else if (url.includes('error-module.json')) {
      resolve(new Response(null, { status: 500 }));
      return;
    } else if (url.includes('not-found-module.json')) {
      resolve(new Response(null, { status: 404 }));
      return;
    } else {
      data = { data: [], estimatedTime: 5, difficulty: 1, tags: [] };
    }

    resolve(new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  });
};

// Setup global fetch mock
export const setupFetchMock = () => {
  global.fetch = vi.fn().mockImplementation(mockFetch);
};

// Reset fetch mock
export const resetFetchMock = () => {
  vi.resetAllMocks();
};