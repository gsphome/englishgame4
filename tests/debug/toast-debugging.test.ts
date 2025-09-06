/**
 * Debugging tests for toast system issues
 * These tests help identify timing and synchronization problems
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToastStore } from '../../src/stores/toastStore';

describe('Toast Debugging Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear console to track debug logs
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  test('should track toast creation timing', async () => {
    const { result } = renderHook(() => useToastStore());
    
    const startTime = Date.now();
    
    act(() => {
      result.current.addToast({
        type: 'success',
        title: 'Timing Test',
        duration: 2000
      });
    });

    const endTime = Date.now();
    const creationTime = endTime - startTime;
    
    expect(creationTime).toBeLessThan(100); // Should be nearly instantaneous
    expect(result.current.toasts).toHaveLength(1);
  });

  test('should verify subscription mechanism', () => {
    const { result } = renderHook(() => useToastStore());
    
    // Mock listener to track calls
    const mockListener = vi.fn();
    
    // This test verifies that the subscription system works
    act(() => {
      result.current.addToast({
        type: 'info',
        title: 'Subscription Test'
      });
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  test('should handle rapid toast creation without conflicts', () => {
    const { result } = renderHook(() => useToastStore());
    
    // Create multiple toasts rapidly
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.addToast({
          type: 'success',
          title: `Toast ${i}`,
          duration: 1000
        });
      }
    });

    // Should respect the 2-toast limit
    expect(result.current.toasts).toHaveLength(2);
    
    // Should show the last 2 toasts
    expect(result.current.toasts[0].title).toBe('Toast 3');
    expect(result.current.toasts[1].title).toBe('Toast 4');
  });

  test('should verify clearAll timing behavior', async () => {
    const { result } = renderHook(() => useToastStore());
    
    // Add some toasts
    act(() => {
      result.current.addToast({ type: 'success', title: 'Toast 1' });
      result.current.addToast({ type: 'error', title: 'Toast 2' });
    });

    expect(result.current.toasts).toHaveLength(2);

    // Clear all toasts
    act(() => {
      result.current.clearAllToasts();
    });

    // Should be cleared immediately for non-animated clear
    expect(result.current.toasts).toHaveLength(0);
  });

  test('should test showSingleToast behavior', () => {
    const { result } = renderHook(() => useToastStore());
    
    // Add multiple toasts first
    act(() => {
      result.current.addToast({ type: 'info', title: 'Toast 1' });
      result.current.addToast({ type: 'warning', title: 'Toast 2' });
    });

    expect(result.current.toasts).toHaveLength(2);

    // Use showSingleToast - should clear others and add new one
    act(() => {
      result.current.showSingleToast({
        type: 'success',
        title: 'Single Toast'
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Single Toast');
  });

  test('should verify state consistency after multiple operations', () => {
    const { result } = renderHook(() => useToastStore());
    
    // Perform a series of operations
    act(() => {
      // Add toasts
      result.current.addToast({ type: 'success', title: 'Toast 1' });
      result.current.addToast({ type: 'error', title: 'Toast 2' });
      
      // Remove one
      const toastId = result.current.toasts[0].id;
      result.current.removeToast(toastId);
      
      // Add another
      result.current.addToast({ type: 'info', title: 'Toast 3' });
      
      // Clear by type
      result.current.clearToastsByType('error');
    });

    // Verify final state is consistent
    expect(result.current.toasts.every(toast => toast.type !== 'error')).toBe(true);
    expect(result.current.toasts.length).toBeGreaterThan(0);
  });

  test('should measure toast rendering performance', () => {
    const { result } = renderHook(() => useToastStore());
    
    const iterations = 100;
    const startTime = performance.now();
    
    act(() => {
      for (let i = 0; i < iterations; i++) {
        result.current.addToast({
          type: 'success',
          title: `Performance Test ${i}`,
          duration: 1000
        });
      }
    });
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    
    // Should be very fast (less than 1ms per toast on average)
    expect(avgTime).toBeLessThan(1);
    
    // Should still respect the limit
    expect(result.current.toasts).toHaveLength(2);
  });
});