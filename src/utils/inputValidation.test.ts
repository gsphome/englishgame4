/**
 * Test for sorting mode settings validation fix
 */

import { validateGameSettings } from './inputValidation';

describe('Input Validation - Sorting Mode Fix', () => {
  test('should preserve sortingMode wordCount in validation', () => {
    const testSettings = {
      flashcardMode: { wordCount: 10 },
      quizMode: { questionCount: 15 },
      completionMode: { itemCount: 8 },
      sortingMode: { wordCount: 12, categoryCount: 4 },
      matchingMode: { wordCount: 6 }
    };

    const validated = validateGameSettings(testSettings);
    
    expect(validated.sortingMode.wordCount).toBe(12);
    expect(validated.sortingMode.categoryCount).toBe(4);
  });

  test('should use default values when sortingMode is invalid', () => {
    const invalidSettings = {
      flashcardMode: { wordCount: 10 },
      quizMode: { questionCount: 15 },
      completionMode: { itemCount: 8 },
      sortingMode: { wordCount: 'invalid', categoryCount: 'invalid' },
      matchingMode: { wordCount: 6 }
    };

    const validated = validateGameSettings(invalidSettings);
    
    expect(validated.sortingMode.wordCount).toBe(5); // default value
    expect(validated.sortingMode.categoryCount).toBe(3); // default value
  });

  test('should enforce min/max limits for sortingMode', () => {
    const testSettings = {
      flashcardMode: { wordCount: 10 },
      quizMode: { questionCount: 15 },
      completionMode: { itemCount: 8 },
      sortingMode: { wordCount: 100, categoryCount: 15 }, // exceeds max
      matchingMode: { wordCount: 6 }
    };

    const validated = validateGameSettings(testSettings);
    
    // Should clamp to max values
    expect(validated.sortingMode.wordCount).toBeLessThanOrEqual(50);
    expect(validated.sortingMode.categoryCount).toBeLessThanOrEqual(10);
  });
});