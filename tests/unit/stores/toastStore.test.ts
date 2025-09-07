/**
 * Test suite for New Toast Store
 * Tests the new single-toast system without delays
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToastStore, toast, resetToastStore } from '../../../src/stores/toastStore';

describe('New Toast Store', () => {
  beforeEach(() => {
    // Reset toast store state before each test
    resetToastStore();
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe('useToastStore hook', () => {
    test('should initialize with no current toast', () => {
      const { result } = renderHook(() => useToastStore());
      expect(result.current.currentToast).toBeNull();
      expect(result.current.isVisible).toBe(false);
    });

    test('should show single toast immediately without delays', () => {
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

    test('should replace existing toast when showing new one', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Show first toast
      act(() => {
        result.current.showToast({
          type: 'info',
          title: 'First Toast'
        });
      });

      expect(result.current.currentToast?.title).toBe('First Toast');

      // Show second toast (should replace first)
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
      
      toast.success('Success!', 'Great job');
      
      // Should execute immediately without delays
      expect(result.current.currentToast?.type).toBe('success');
      expect(result.current.currentToast?.title).toBe('Success!');
      expect(result.current.currentToast?.message).toBe('Great job');
    });

    test('should create error toast with longer duration', () => {
      const { result } = renderHook(() => useToastStore());
      
      toast.error('Error!', 'Something went wrong');
      
      expect(result.current.currentToast?.type).toBe('error');
      expect(result.current.currentToast?.duration).toBe(6000);
    });

    test('should clear toast immediately', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Add toast first
      toast.success('Test');
      expect(result.current.currentToast).not.toBeNull();

      // Clear toast
      toast.clear();
      expect(result.current.currentToast).toBeNull();
    });

    test('should clear on navigation immediately', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Add toast first
      toast.info('Navigation test');
      expect(result.current.currentToast).not.toBeNull();

      // Clear on navigation
      toast.clearOnNavigation();
      expect(result.current.currentToast).toBeNull();
    });
  });

  describe('welcome toast functionality', () => {
    test('should show welcome toast only once', () => {
      const { result } = renderHook(() => useToastStore());
      
      // First call should show toast
      act(() => {
        result.current.showWelcomeOnce(5);
      });
      
      expect(result.current.currentToast?.title).toBe('Bienvenido');
      expect(result.current.currentToast?.message).toBe('5 módulos disponibles para aprender');

      // Clear toast
      act(() => {
        result.current.clearToast();
      });

      // Second call should not show toast (already shown)
      act(() => {
        result.current.showWelcomeOnce(5);
      });
      
      expect(result.current.currentToast).toBeNull();
    });

    test('should track welcome toast in localStorage', () => {
      const { result } = renderHook(() => useToastStore());
      
      expect(result.current.hasShownWelcome()).toBe(false);
      
      act(() => {
        result.current.showWelcomeOnce(3);
      });
      
      expect(result.current.hasShownWelcome()).toBe(true);
      expect(localStorage.getItem('welcome-toast-shown')).toBe('true');
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useToastStore());
      
      // Should not throw error
      expect(() => {
        act(() => {
          result.current.showWelcomeOnce(2);
        });
      }).not.toThrow();

      // Restore localStorage
      localStorage.setItem = originalSetItem;
    });
  });

  describe('single toast system', () => {
    test('should never have more than one toast', () => {
      const { result } = renderHook(() => useToastStore());
      
      // Show multiple toasts rapidly
      act(() => {
        result.current.showToast({ type: 'info', title: 'Toast 1' });
        result.current.showToast({ type: 'success', title: 'Toast 2' });
        result.current.showToast({ type: 'error', title: 'Toast 3' });
      });

      // Should only have the last toast
      expect(result.current.currentToast?.title).toBe('Toast 3');
      expect(result.current.currentToast?.type).toBe('error');
    });

    test('should use single toast functions correctly', () => {
      const { result } = renderHook(() => useToastStore());
      
      toast.single.success('Single Success');
      expect(result.current.currentToast?.title).toBe('Single Success');
      
      toast.single.error('Single Error');
      expect(result.current.currentToast?.title).toBe('Single Error');
      expect(result.current.currentToast?.type).toBe('error');
    });
  });

  // Integration test to ensure the core functionality works
  test('toast store integration works without delays', () => {
    expect(typeof toast.success).toBe('function');
    expect(typeof toast.error).toBe('function');
    expect(typeof toast.clear).toBe('function');
    expect(typeof toast.clearOnNavigation).toBe('function');
    expect(typeof toast.welcomeOnce).toBe('function');
    
    // Test that functions can be called without throwing
    expect(() => {
      toast.success('Test');
      toast.error('Test');
      toast.clear();
      toast.clearOnNavigation();
      toast.welcomeOnce(1);
    }).not.toThrow();
  });
});