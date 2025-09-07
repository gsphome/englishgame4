import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, beforeEach, afterEach } from 'vitest';
import type { LearningModule, ToastData } from '../../src/types';

// Mock providers for testing
// eslint-disable-next-line react-refresh/only-export-components
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { customRender as render };

// Test utilities for common operations
export const testUtils = {
  // Create mock learning module
  createMockModule: (overrides: Partial<LearningModule> = {}): LearningModule => ({
    id: 'test-module',
    name: 'Test Module',
    learningMode: 'quiz',
    level: ['b1'],
    category: 'Test Category',
    description: 'Test description',
    data: [],
    ...overrides,
  }),

  // Create mock toast data
  createMockToast: (overrides: Partial<ToastData> = {}): ToastData => ({
    id: 'test-toast-' + Date.now(),
    type: 'success',
    title: 'Test Toast',
    message: 'Test message',
    duration: 2000,
    ...overrides,
  }),

  // Wait for toast to appear
  waitForToast: async (text: string, timeout = 3000) => {
    return waitFor(() => {
      expect(screen.getByText(text)).toBeInTheDocument();
    }, { timeout });
  },

  // Wait for toast to disappear
  waitForToastToDisappear: async (text: string, timeout = 5000) => {
    return waitFor(() => {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    }, { timeout });
  },
};

export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
};

// Mock console methods for testing
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });
  
  afterEach(() => {
    Object.assign(console, originalConsole);
  });
};