/**
 * Test suite for New Toast Store
 * Tests the new single-toast system without delays
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToastStore, toast, resetToastStore } from '../../../src/stores/toastStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('New Toast Store', () => {
  beforeEach(() => {
    // Reset toast store state before each test
    resetToastStore();
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('useToastStore hook', () => {
    test('should initialize with no toast', () => {
      const { result } = renderHook(() => useToastStore());
      expect(result.current.currentToast).toBeNull();
      expect(result.current.isVisible).toBe(false);
    });

    test('should show toast immediately without delays', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        result.current.showToast({
          type: 'success',
          title: 'Test Toast',
          message: 'Test message'
        });
      });

      expect(result.current.currentToast).toMatchObject({
        type: 'success',
        title: 'Test Toast',
        message: 'Test message'
      });
      expect(result.current.isVisible).toBe(true);
      expect(result.current.currentToast?.id).toBeDefined();
    });

    test('should replace existing toast with new one (single toast system)', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Add first toast
      act(() => {
        result.current.showToast({
          type: 'info',
          title: 'First Toast'
        });
      });

      expect(result.current.currentToast?.title).toBe('First Toast');

      // Add second toast - should replace first
      act(() => {
        result.current.showToast({
          type: 'success',
          title: 'Second Toast'
        });
      });

      expect(result.current.currentToast?.title).toBe('Second Toast');
      expect(result.current.currentToast?.type).toBe('success');
    });

    test('should clear toast immediately', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Add a toast first
      act(() => {
        result.current.showToast({
          type: 'info',
          title: 'Test Toast'
        });
      });

      expect(result.current.currentToast).not.toBeNull();

      // Clear the toast
      act(() => {
        result.current.clearToast();
      });

      expect(result.current.currentToast).toBeNull();
      expect(result.current.isVisible).toBe(false);
    });

    test('should clear toast on navigation immediately', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Add a toast first
      act(() => {
        result.current.showToast({
          type: 'warning',
          title: 'Navigation Test'
        });
      });

      expect(result.current.currentToast).not.toBeNull();

      // Clear on navigation
      act(() => {
        result.current.clearOnNavigation();
      });

      expect(result.current.currentToast).toBeNull();
      expect(result.current.isVisible).toBe(false);
    });
  });

  describe('toast utility functions', () => {
    test('should create success toast immediately', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        toast.success('Success!', 'Great job');
      });
      
      expect(result.current.currentToast?.type).toBe('success');
      expect(result.current.currentToast?.title).toBe('Success!');
      expect(result.current.currentToast?.message).toBe('Great job');
    });

    test('should create error toast with longer duration', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        toast.error('Error!', 'Something went wrong');
      });
      
      expect(result.current.currentToast?.type).toBe('error');
      expect(result.current.currentToast?.duration).toBe(6000);
    });

    test('should clear toast immediately', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Add a toast first
      act(() => {
        toast.info('Test', 'Message');
      });

      expect(result.current.currentToast).not.toBeNull();

      // Clear toast
      act(() => {
        toast.clear();
      });
      
      expect(result.current.currentToast).toBeNull();
    });

    test('should clear on navigation immediately', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Add a toast first
      act(() => {
        toast.warning('Test', 'Message');
      });

      expect(result.current.currentToast).not.toBeNull();

      // Clear on navigation
      act(() => {
        toast.clearOnNavigation();
      });
      
      expect(result.current.currentToast).toBeNull();
    });
  });

  describe('welcome toast functionality', () => {
    test('should show welcome toast only once', () => {
      const { result } = renderHook(() => useToastStore());
      
      // First call should show toast
      act(() => {
        toast.welcomeOnce(5);
      });
      
      expect(result.current.currentToast?.title).toBe('Bienvenido');
      expect(result.current.currentToast?.message).toBe('5 módulos disponibles para aprender');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('welcome-toast-shown', 'true');

      // Clear toast
      act(() => {
        result.current.clearToast();
      });

      // Mock localStorage to return 'true' (already shown)
      localStorageMock.getItem.mockReturnValue('true');

      // Second call should not show toast
      act(() => {
        toast.welcomeOnce(5);
      });
      
      expect(result.current.currentToast).toBeNull();
    });

    test('should handle localStorage errors gracefully', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Mock localStorage to throw error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      // Should not throw error
      expect(() => {
        act(() => {
          toast.welcomeOnce(3);
        });
      }).not.toThrow();

      // Should still show toast (fallback behavior)
      expect(result.current.currentToast?.title).toBe('Bienvenido');
    });

    test('should check if welcome toast has been shown', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Initially not shown
      expect(result.current.hasShownWelcome()).toBe(false);
      
      // Mock localStorage to return 'true'
      localStorageMock.getItem.mockReturnValue('true');
      
      expect(result.current.hasShownWelcome()).toBe(true);
    });
  });

  describe('single toast system', () => {
    test('should only show one toast at a time', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Add multiple toasts rapidly
      act(() => {
        toast.success('Toast 1');
        toast.error('Toast 2');
        toast.warning('Toast 3');
      });

      // Should only have the last toast
      expect(result.current.currentToast?.title).toBe('Toast 3');
      expect(result.current.currentToast?.type).toBe('warning');
    });

    test('should use single toast functions correctly', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        toast.single.success('Single Success');
      });
      
      expect(result.current.currentToast?.title).toBe('Single Success');
      expect(result.current.currentToast?.type).toBe('success');
    });
  });

  describe('auto-dismiss functionality', () => {
    test('should auto-dismiss toast after duration', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        result.current.showToast({
          type: 'info',
          title: 'Auto Dismiss Test',
          duration: 2000
        });
      });

      expect(result.current.currentToast?.title).toBe('Auto Dismiss Test');

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.currentToast).toBeNull();
      
      vi.useRealTimers();
    });

    test('should not auto-dismiss if duration is 0', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        result.current.showToast({
          type: 'info',
          title: 'No Auto Dismiss',
          duration: 0
        });
      });

      expect(result.current.currentToast?.title).toBe('No Auto Dismiss');

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should still be there
      expect(result.current.currentToast?.title).toBe('No Auto Dismiss');
      
      vi.useRealTimers();
    });
  });

  describe('error handling', () => {
    test('should handle toast functions gracefully when store is not ready', () => {
      // Should not throw errors
      expect(() => {
        toast.success('Test');
        toast.error('Test');
        toast.warning('Test');
        toast.info('Test');
        toast.clear();
        toast.clearOnNavigation();
        toast.welcomeOnce(5);
      }).not.toThrow();
    });
  });
});