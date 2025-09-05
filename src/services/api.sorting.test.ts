/**
 * Test to verify API service correctly handles sorting modules
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { apiService } from './api';

describe('API Service - Sorting Module Handling', () => {
  const mockSortingData = [
    { word: 'apple', category: 'fruits', level: 'a1' },
    { word: 'banana', category: 'fruits', level: 'a1' },
    { word: 'carrot', category: 'vegetables', level: 'a2' },
    { word: 'broccoli', category: 'vegetables', level: 'a2' },
    { word: 'chicken', category: 'meat', level: 'b1' },
    { word: 'beef', category: 'meat', level: 'b1' },
    { word: 'salmon', category: 'fish', level: 'b2' },
    { word: 'tuna', category: 'fish', level: 'b2' },
  ];

  beforeEach(() => {
    apiService.clearCache();
  });

  test('should not filter by categories for sorting modules', () => {
    const result = apiService.filterModuleData(
      mockSortingData,
      { 
        categories: ['fruits'], // Only fruits selected
        level: 'all',
        limit: 10 
      },
      'test-sorting-module'
    );

    // Should return all data, not just fruits
    expect(result).toHaveLength(8);
    expect(result.some(item => item.category === 'vegetables')).toBe(true);
    expect(result.some(item => item.category === 'meat')).toBe(true);
    expect(result.some(item => item.category === 'fish')).toBe(true);
  });

  test('should filter by level for sorting modules', () => {
    const result = apiService.filterModuleData(
      mockSortingData,
      { 
        categories: ['fruits'], 
        level: 'a1',
        limit: 10 
      },
      'test-sorting-module'
    );

    // Should only return a1 level items
    expect(result).toHaveLength(2);
    expect(result.every(item => item.level === 'a1')).toBe(true);
  });

  test('should apply limit for sorting modules', () => {
    const result = apiService.filterModuleData(
      mockSortingData,
      { 
        categories: ['fruits'], 
        level: 'all',
        limit: 5 
      },
      'test-sorting-module'
    );

    // Should respect the limit
    expect(result).toHaveLength(5);
  });

  test('should filter normally for non-sorting modules', () => {
    const result = apiService.filterModuleData(
      mockSortingData,
      { 
        categories: ['fruits'], 
        level: 'all',
        limit: 10 
      },
      'test-flashcard-module' // Not a sorting module
    );

    // Should filter by categories for non-sorting modules
    expect(result).toHaveLength(2);
    expect(result.every(item => item.category === 'fruits')).toBe(true);
  });
});