/**
 * Simple test to verify sorting settings are working correctly
 */

import { useSettingsStore } from '../stores/settingsStore';

describe('Sorting Settings Integration', () => {
  test('should have correct default sorting settings', () => {
    const store = useSettingsStore.getState();
    
    expect(store.gameSettings.sortingMode.wordCount).toBe(5);
    expect(store.gameSettings.sortingMode.categoryCount).toBe(3);
  });

  test('should be able to update sorting settings', () => {
    const { setGameSetting } = useSettingsStore.getState();
    
    // Update wordCount
    setGameSetting('sortingMode', 'wordCount', 8);
    
    // Update categoryCount  
    setGameSetting('sortingMode', 'categoryCount', 4);
    
    const updatedStore = useSettingsStore.getState();
    
    expect(updatedStore.gameSettings.sortingMode.wordCount).toBe(8);
    expect(updatedStore.gameSettings.sortingMode.categoryCount).toBe(4);
  });

  test('should preserve both wordCount and categoryCount when updating one', () => {
    const { setGameSetting } = useSettingsStore.getState();
    
    // Set initial values
    setGameSetting('sortingMode', 'wordCount', 10);
    setGameSetting('sortingMode', 'categoryCount', 5);
    
    let store = useSettingsStore.getState();
    expect(store.gameSettings.sortingMode.wordCount).toBe(10);
    expect(store.gameSettings.sortingMode.categoryCount).toBe(5);
    
    // Update only wordCount
    setGameSetting('sortingMode', 'wordCount', 12);
    
    store = useSettingsStore.getState();
    expect(store.gameSettings.sortingMode.wordCount).toBe(12);
    expect(store.gameSettings.sortingMode.categoryCount).toBe(5); // Should remain unchanged
  });
});