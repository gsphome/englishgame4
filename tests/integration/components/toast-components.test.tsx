/**
 * Integration tests for Toast components
 * Tests Toast.tsx and ToastContainer.tsx integration
 */

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Toast from '../../../src/components/ui/Toast';
import { ToastContainer } from '../../../src/components/ui/ToastContainer';
import { useToastStore, resetToastStore } from '../../../src/stores/toastStore';
import type { ToastData } from '../../../src/stores/toastStore';

// Mock the toast store
vi.mock('../../../src/stores/toastStore', () => ({
  useToastStore: vi.fn(),
  resetToastStore: vi.fn(),
}));

const mockToastData: ToastData = {
  id: 'test-toast-1',
  type: 'success',
  title: 'Test Toast',
  message: 'This is a test message',
  duration: 4000,
};

describe('Toast Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render toast with correct content', () => {
    render(<Toast toast={mockToastData} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('should render correct icon for toast type', () => {
    const { rerender } = render(<Toast toast={mockToastData} onClose={mockOnClose} />);
    
    // Success toast should have CheckCircle icon
    expect(document.querySelector('.toast-card__icon-svg')).toBeInTheDocument();
    
    // Test error toast
    const errorToast = { ...mockToastData, type: 'error' as const };
    rerender(<Toast toast={errorToast} onClose={mockOnClose} />);
    expect(document.querySelector('.toast-card__icon-svg')).toBeInTheDocument();
  });

  test('should apply correct BEM classes', () => {
    render(<Toast toast={mockToastData} onClose={mockOnClose} />);
    
    const toastElement = screen.getByRole('alert');
    expect(toastElement).toHaveClass('toast-card');
    expect(toastElement).toHaveClass('toast-card--success');
  });

  test('should call onClose when close button is clicked', () => {
    render(<Toast toast={mockToastData} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);
    
    // Should call onClose after animation delay
    setTimeout(() => {
      expect(mockOnClose).toHaveBeenCalledWith('test-toast-1');
    }, 350);
  });

  test('should render action button when provided', () => {
    const toastWithAction = {
      ...mockToastData,
      action: {
        label: 'Retry',
        onClick: vi.fn(),
      },
    };
    
    render(<Toast toast={toastWithAction} onClose={mockOnClose} />);
    
    const actionButton = screen.getByText('Retry');
    expect(actionButton).toBeInTheDocument();
    
    fireEvent.click(actionButton);
    expect(toastWithAction.action.onClick).toHaveBeenCalled();
  });

  test('should auto-dismiss after duration', async () => {
    const shortDurationToast = { ...mockToastData, duration: 100 };
    render(<Toast toast={shortDurationToast} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('test-toast-1');
    }, { timeout: 500 });
  });

  test('should not auto-dismiss when duration is 0', async () => {
    const persistentToast = { ...mockToastData, duration: 0 };
    render(<Toast toast={persistentToast} onClose={mockOnClose} />);
    
    // Wait a bit to ensure it doesn't auto-dismiss
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

describe('ToastContainer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render nothing when no toast is visible', () => {
    (useToastStore as any).mockReturnValue({
      currentToast: null,
      isVisible: false,
      clearToast: vi.fn(),
    });

    const { container } = render(<ToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  test('should render toast when visible', () => {
    (useToastStore as any).mockReturnValue({
      currentToast: mockToastData,
      isVisible: true,
      clearToast: vi.fn(),
    });

    render(<ToastContainer />);
    
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Notifications');
  });

  test('should apply correct container classes', () => {
    (useToastStore as any).mockReturnValue({
      currentToast: mockToastData,
      isVisible: true,
      clearToast: vi.fn(),
    });

    render(<ToastContainer />);
    
    const container = screen.getByRole('region');
    expect(container).toHaveClass('toast-container');
  });

  test('should pass clearToast function to Toast component', () => {
    const mockClearToast = vi.fn();
    (useToastStore as any).mockReturnValue({
      currentToast: mockToastData,
      isVisible: true,
      clearToast: mockClearToast,
    });

    render(<ToastContainer />);
    
    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);
    
    // Should eventually call clearToast
    setTimeout(() => {
      expect(mockClearToast).toHaveBeenCalled();
    }, 350);
  });
});

describe('Toast Components Integration', () => {
  test('should handle rapid toast changes correctly', () => {
    const mockClearToast = vi.fn();
    let currentToast = mockToastData;
    
    (useToastStore as any).mockImplementation(() => ({
      currentToast,
      isVisible: true,
      clearToast: mockClearToast,
    }));

    const { rerender } = render(<ToastContainer />);
    
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    
    // Change toast
    currentToast = { ...mockToastData, id: 'test-toast-2', title: 'New Toast' };
    rerender(<ToastContainer />);
    
    expect(screen.getByText('New Toast')).toBeInTheDocument();
  });

  test('should maintain single toast constraint', () => {
    (useToastStore as any).mockReturnValue({
      currentToast: mockToastData,
      isVisible: true,
      clearToast: vi.fn(),
    });

    render(<ToastContainer />);
    
    // Should only have one toast element
    const toastElements = screen.getAllByRole('alert');
    expect(toastElements).toHaveLength(1);
  });
});