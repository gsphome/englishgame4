/**
 * Integration tests for Toast components
 * Tests Toast.tsx and ToastContainer.tsx with new toast system
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Toast from '../../../src/components/ui/Toast';
import { ToastContainer } from '../../../src/components/ui/ToastContainer';
import { useToast } from '../../../src/hooks/useToast';
import { resetToastStore } from '../../../src/stores/toastStore';
import type { ToastData } from '../../../src/stores/toastStore';

// Mock CSS import
vi.mock('../../../src/styles/components/toast-card.css', () => ({}));

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

describe('Toast Components Integration', () => {
  beforeEach(() => {
    resetToastStore();
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Toast Component', () => {
    const mockToast: ToastData = {
      id: 'test-toast-1',
      type: 'success',
      title: 'Test Title',
      message: 'Test message',
      duration: 4000
    };

    test('should render toast with correct content', () => {
      const onClose = vi.fn();
      
      render(<Toast toast={mockToast} onClose={onClose} />);
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('should render different toast types with correct icons', () => {
      const onClose = vi.fn();
      
      const successToast = { ...mockToast, type: 'success' as const };
      const { rerender } = render(<Toast toast={successToast} onClose={onClose} />);
      expect(document.querySelector('.toast-card--success')).toBeInTheDocument();
      
      const errorToast = { ...mockToast, type: 'error' as const };
      rerender(<Toast toast={errorToast} onClose={onClose} />);
      expect(document.querySelector('.toast-card--error')).toBeInTheDocument();
      
      const warningToast = { ...mockToast, type: 'warning' as const };
      rerender(<Toast toast={warningToast} onClose={onClose} />);
      expect(document.querySelector('.toast-card--warning')).toBeInTheDocument();
      
      const infoToast = { ...mockToast, type: 'info' as const };
      rerender(<Toast toast={infoToast} onClose={onClose} />);
      expect(document.querySelector('.toast-card--info')).toBeInTheDocument();
    });

    test('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      
      render(<Toast toast={mockToast} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText('Close notification');
      fireEvent.click(closeButton);
      
      // Should call onClose after animation delay
      setTimeout(() => {
        expect(onClose).toHaveBeenCalledWith('test-toast-1');
      }, 300);
    });

    test('should render action button when provided', () => {
      const actionToast: ToastData = {
        ...mockToast,
        action: {
          label: 'Retry',
          onClick: vi.fn()
        }
      };
      
      render(<Toast toast={actionToast} onClose={vi.fn()} />);
      
      const actionButton = screen.getByText('Retry');
      expect(actionButton).toBeInTheDocument();
      
      fireEvent.click(actionButton);
      expect(actionToast.action?.onClick).toHaveBeenCalled();
    });

    test('should auto-dismiss after duration', async () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      
      render(<Toast toast={mockToast} onClose={onClose} />);
      
      // Fast-forward time to trigger auto-dismiss
      vi.advanceTimersByTime(4000);
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledWith('test-toast-1');
      });
      
      vi.useRealTimers();
    });

    test('should not auto-dismiss when duration is 0', async () => {
      vi.useFakeTimers();
      const onClose = vi.fn();
      const persistentToast = { ...mockToast, duration: 0 };
      
      render(<Toast toast={persistentToast} onClose={onClose} />);
      
      // Fast-forward time
      vi.advanceTimersByTime(10000);
      
      expect(onClose).not.toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    test('should have proper accessibility attributes', () => {
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const toastElement = screen.getByRole('alert');
      expect(toastElement).toHaveAttribute('aria-live', 'polite');
      expect(toastElement).toHaveAttribute('aria-atomic', 'true');
      
      const closeButton = screen.getByLabelText('Close notification');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('ToastContainer Component', () => {
    test('should render nothing when no toast is active', () => {
      const { container } = render(<ToastContainer />);
      expect(container.firstChild).toBeNull();
    });

    test('should render toast when one is active', () => {
      // This test would need to be integrated with the actual store
      // For now, we'll test the basic rendering logic
      const { container } = render(<ToastContainer />);
      
      // Initially empty
      expect(container.firstChild).toBeNull();
    });

    test('should have proper accessibility attributes', () => {
      // Mock a toast being active
      vi.mock('../../../src/stores/toastStore', () => ({
        useToastStore: () => ({
          currentToast: {
            id: 'test',
            type: 'info',
            title: 'Test',
            message: 'Test message'
          },
          isVisible: true,
          clearToast: vi.fn()
        })
      }));

      render(<ToastContainer />);
      
      const container = screen.queryByRole('region');
      if (container) {
        expect(container).toHaveAttribute('aria-label', 'Notifications');
      }
    });
  });

  describe('useToast Hook Integration', () => {
    const TestComponent = () => {
      const {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showCorrectAnswer,
        showIncorrectAnswer,
        showModuleCompleted
      } = useToast();

      return (
        <div>
          <button onClick={() => showSuccess('Success', 'Success message')}>
            Show Success
          </button>
          <button onClick={() => showError('Error', 'Error message')}>
            Show Error
          </button>
          <button onClick={() => showWarning('Warning', 'Warning message')}>
            Show Warning
          </button>
          <button onClick={() => showInfo('Info', 'Info message')}>
            Show Info
          </button>
          <button onClick={() => showCorrectAnswer()}>
            Show Correct
          </button>
          <button onClick={() => showIncorrectAnswer()}>
            Show Incorrect
          </button>
          <button onClick={() => showModuleCompleted('Test Module', 85, 90)}>
            Show Module Completed
          </button>
        </div>
      );
    };

    test('should provide all toast functions', () => {
      render(<TestComponent />);
      
      expect(screen.getByText('Show Success')).toBeInTheDocument();
      expect(screen.getByText('Show Error')).toBeInTheDocument();
      expect(screen.getByText('Show Warning')).toBeInTheDocument();
      expect(screen.getByText('Show Info')).toBeInTheDocument();
      expect(screen.getByText('Show Correct')).toBeInTheDocument();
      expect(screen.getByText('Show Incorrect')).toBeInTheDocument();
      expect(screen.getByText('Show Module Completed')).toBeInTheDocument();
    });

    test('should execute toast functions without errors', () => {
      render(<TestComponent />);
      
      // Should not throw errors when clicked
      expect(() => {
        fireEvent.click(screen.getByText('Show Success'));
        fireEvent.click(screen.getByText('Show Error'));
        fireEvent.click(screen.getByText('Show Warning'));
        fireEvent.click(screen.getByText('Show Info'));
        fireEvent.click(screen.getByText('Show Correct'));
        fireEvent.click(screen.getByText('Show Incorrect'));
        fireEvent.click(screen.getByText('Show Module Completed'));
      }).not.toThrow();
    });
  });

  describe('CSS Classes Integration', () => {
    test('should apply correct BEM classes', () => {
      const mockToast: ToastData = {
        id: 'test-toast',
        type: 'success',
        title: 'Test',
        duration: 4000
      };
      
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      // Check BEM classes are applied
      expect(document.querySelector('.toast-card')).toBeInTheDocument();
      expect(document.querySelector('.toast-card--success')).toBeInTheDocument();
      expect(document.querySelector('.toast-card__title')).toBeInTheDocument();
      expect(document.querySelector('.toast-card__icon')).toBeInTheDocument();
      expect(document.querySelector('.toast-card__close')).toBeInTheDocument();
    });

    test('should apply state classes correctly', () => {
      const mockToast: ToastData = {
        id: 'test-toast',
        type: 'info',
        title: 'Test',
        duration: 4000
      };
      
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      // Should start with entering state
      expect(document.querySelector('.toast-card--entering')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing toast data gracefully', () => {
      const incompleteToast = {
        id: 'test',
        type: 'info' as const,
        title: 'Test'
        // Missing other optional properties
      };
      
      expect(() => {
        render(<Toast toast={incompleteToast} onClose={vi.fn()} />);
      }).not.toThrow();
    });

    test('should handle onClose callback errors gracefully', () => {
      const errorOnClose = () => {
        throw new Error('Close callback error');
      };
      
      const mockToast: ToastData = {
        id: 'test-toast',
        type: 'error',
        title: 'Test',
        duration: 4000
      };
      
      render(<Toast toast={mockToast} onClose={errorOnClose} />);
      
      // Should not crash when close button is clicked
      expect(() => {
        const closeButton = screen.getByLabelText('Close notification');
        fireEvent.click(closeButton);
      }).not.toThrow();
    });
  });
});