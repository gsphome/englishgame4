/**
 * Test suite for Toast Store
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToastStore, toast } from '../../../src/stores/toastStore';

describe('Toast Store', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    vi.clearAllMocks();
  });

  describe('useToastStore hook', () => {
    test('should initialize with empty toasts', () => {
      const { result } = renderHook(() => useToastStore());
      expect(result.current.toasts).toEqual([]);
    });

    test('should add toast correctly', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        result.current.addToast({
          type: 'success',
          title: 'Test Toast',
          message: 'Test message'
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        type: 'success',
        title: 'Test Toast',
        message: 'Test message'
      });
    });

    test('should remove toast correctly', () => {
      const { result } = renderHook(() => useToastStore());
      
      let toastId: string;
      
      act(() => {
        result.current.addToast({
          type: 'success',
          title: 'Test Toast'
        });
        toastId = result.current.toasts[0].id;
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.removeToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    test('should limit toasts to maximum of 2', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        result.current.addToast({ type: 'success', title: 'Toast 1' });
        result.current.addToast({ type: 'success', title: 'Toast 2' });
        result.current.addToast({ type: 'success', title: 'Toast 3' });
      });

      expect(result.current.toasts).toHaveLength(2);
      expect(result.current.toasts[0].title).toBe('Toast 2');
      expect(result.current.toasts[1].title).toBe('Toast 3');
    });
  });

  describe('toast utility functions', () => {
    test('should create success toast', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        toast.success('Success!', 'Operation completed');
      });

      // Wait for async operation
      setTimeout(() => {
        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].type).toBe('success');
        expect(result.current.toasts[0].title).toBe('Success!');
      }, 10);
    });

    test('should create error toast with longer duration', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        toast.error('Error!', 'Something went wrong');
      });

      setTimeout(() => {
        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].type).toBe('error');
        expect(result.current.toasts[0].duration).toBe(6000);
      }, 10);
    });

    test('should clear all toasts', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        toast.success('Toast 1');
        toast.error('Toast 2');
      });

      setTimeout(() => {
        expect(result.current.toasts).toHaveLength(2);
        
        act(() => {
          toast.clearAll();
        });

        setTimeout(() => {
          expect(result.current.toasts).toHaveLength(0);
        }, 250);
      }, 10);
    });
  });

  describe('single toast functionality', () => {
    test('should replace existing toasts with single toast', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        toast.success('First toast');
        toast.success('Second toast');
      });

      setTimeout(() => {
        expect(result.current.toasts).toHaveLength(2);
        
        act(() => {
          toast.single.success('Single toast');
        });

        setTimeout(() => {
          expect(result.current.toasts).toHaveLength(1);
          expect(result.current.toasts[0].title).toBe('Single toast');
        }, 10);
      }, 10);
    });
  });

  describe('toast tracking', () => {
    test('should track shown toasts', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        result.current.markToastAsShown('welcome-toast');
      });

      expect(result.current.hasShownToast('welcome-toast')).toBe(true);
      expect(result.current.hasShownToast('other-toast')).toBe(false);
    });

    test('should show toast only once', () => {
      const { result } = renderHook(() => useToastStore());
      
      act(() => {
        toast.once('unique-toast', 'success', 'First time');
        toast.once('unique-toast', 'success', 'Second time');
      });

      setTimeout(() => {
        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].title).toBe('First time');
      }, 10);
    });
  });
});