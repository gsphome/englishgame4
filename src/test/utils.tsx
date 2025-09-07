import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import type { LearningModule, User } from '../types';

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0, // Updated from cacheTime
    },
    mutations: {
      retry: false,
    },
  },
});

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  withErrorBoundary?: boolean;
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    withErrorBoundary = true,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const content = (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    return withErrorBoundary ? (
      <ErrorBoundary>{content}</ErrorBoundary>
    ) : content;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock data factories
export const createMockModule = (overrides: Partial<LearningModule> = {}): LearningModule => ({
  id: 'test-module',
  name: 'Test Module',
  description: 'A test module for testing',
  learningMode: 'flashcard',
  level: ['b1'],
  category: 'Vocabulary',
  tags: ['test'],
  data: [
    {
      id: '1',
      en: 'hello',
      es: 'hola',
      ipa: '/həˈloʊ/',
      example: 'Hello, how are you?',
      example_es: 'Hola, ¿cómo estás?'
    }
  ],
  estimatedTime: 5,
  difficulty: 3,
  ...overrides,
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user',
  name: 'Test User',
  email: 'test@example.com',
  level: 'intermediate',
  preferences: {
    language: 'en',
    dailyGoal: 10,
    categories: ['Vocabulary'],
    difficulty: 3,
    notifications: true,
  },
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Test utilities
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() {
      return { ...store };
    }
  };
};

// Custom matchers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveAccessibleName = (element: HTMLElement, name: string) => {
  expect(element).toHaveAccessibleName(name);
};

export const expectElementToHaveAriaLabel = (element: HTMLElement, label: string) => {
  expect(element).toHaveAttribute('aria-label', label);
};

// Re-export everything from testing-library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';