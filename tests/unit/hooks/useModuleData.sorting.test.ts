/**
 * Test to verify useModuleData correctly handles sorting mode settings
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useSettingsStore } from '../../../src/stores/settingsStore';

// Mock the settings store
vi.mock('../../../src/stores/settingsStore');
const mockUseSettingsStore = vi.mocked(useSettingsStore);

// Mock the API service
vi.mock('../../../src/services/api', () => ({
  apiService: {
    filterModuleData: vi.fn((data, filters) => {
      // Simple mock that respects the limit
      return data.slice(0, filters.limit);
    })
  },
  fetchModuleData: vi.fn(),
  fetchModules: vi.fn()
}));

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((options) => {
    // Mock implementation that calls the select function
    const mockModule = {
      id: 'test-sorting',
      name: 'Test Sorting',
      learningMode: 'sorting',
      data: Array.from({ length: 50 }, (_, i) => ({
        word: `word${i}`,
        category: `category${i % 5}`
      }))
    };

    if (options.select) {
      const result = options.select(mockModule);
      return { data: result, isLoading: false, error: null };
    }

    return { data: mockModule, isLoading: false, error: null };
  })
}));

describe('useModuleData Sorting Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should apply correct limit for sorting mode based on settings', async () => {
    // Mock settings store to return specific sorting settings
    mockUseSettingsStore.mockReturnValue({
      categories: ['Vocabulary'],
      level: 'all',
      gameSettings: {
        flashcardMode: { wordCount: 10 },
        quizMode: { questionCount: 10 },
        completionMode: { itemCount: 10 },
        sortingMode: { wordCount: 6, categoryCount: 3 },
        matchingMode: { wordCount: 6 }
      }
    } as any);

    // Import and test the hook
    const { useModuleData } = await import('../../../src/hooks/useModuleData');
    const result = useModuleData('test-sorting');

    // The limit should be wordCount * categoryCount * 2 = 6 * 3 * 2 = 36
    expect(result.data?.data).toHaveLength(36);
  });

  test('should handle different sorting settings', async () => {
    // Mock different settings
    mockUseSettingsStore.mockReturnValue({
      categories: ['Vocabulary'],
      level: 'all',
      gameSettings: {
        flashcardMode: { wordCount: 10 },
        quizMode: { questionCount: 10 },
        completionMode: { itemCount: 10 },
        sortingMode: { wordCount: 4, categoryCount: 2 },
        matchingMode: { wordCount: 6 }
      }
    } as any);

    const { useModuleData } = await import('../../../src/hooks/useModuleData');
    const result = useModuleData('test-sorting');

    // The limit should be wordCount * categoryCount * 2 = 4 * 2 * 2 = 16
    expect(result.data?.data).toHaveLength(16);
  });
});