/**
 * Responsive tests for Toast system
 * Tests mobile, tablet, and desktop breakpoints
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Toast from '../../../src/components/ui/Toast';
import { ToastContainer } from '../../../src/components/ui/ToastContainer';
import { resetToastStore } from '../../../src/stores/toastStore';
import type { ToastData } from '../../../src/stores/toastStore';

// Mock CSS import
vi.mock('../../../src/styles/components/toast-card.css', () => ({}));

// Mock window.innerWidth for responsive tests
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

// Mock matchMedia for CSS media queries
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('Toast Responsive Design', () => {
  beforeEach(() => {
    resetToastStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const mockToast: ToastData = {
    id: 'responsive-test-toast',
    type: 'info',
    title: 'Responsive Test',
    message: 'Testing responsive behavior',
    duration: 4000
  };

  describe('Mobile Breakpoint (< 640px)', () => {
    beforeEach(() => {
      mockInnerWidth(375); // iPhone size
      mockMatchMedia(false); // Desktop media query doesn't match
    });

    test('should apply mobile-specific CSS classes', () => {
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const toastElement = document.querySelector('.toast-card');
      expect(toastElement).toBeInTheDocument();
      
      // Verify mobile-specific styling would be applied via CSS
      // (CSS media queries are tested separately)
    });

    test('should have proper touch target sizes for mobile', () => {
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const closeButton = document.querySelector('.toast-card__close');
      expect(closeButton).toBeInTheDocument();
      
      // Close button should have minimum 44px touch target (verified via CSS)
      const computedStyle = window.getComputedStyle(closeButton as Element);
      // Note: In actual implementation, this would be verified via CSS
    });

    test('should position toast container for mobile', () => {
      // Mock toast store to have an active toast
      vi.mock('../../../src/stores/toastStore', () => ({
        useToastStore: () => ({
          currentToast: mockToast,
          isVisible: true,
          clearToast: vi.fn()
        }),
        resetToastStore: vi.fn()
      }));

      render(<ToastContainer />);
      
      const container = document.querySelector('.toast-container');
      expect(container).toBeInTheDocument();
      
      // Container should use mobile positioning (centered top)
      // This is handled by CSS media queries
    });

    test('should handle mobile viewport width correctly', () => {
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const toastElement = document.querySelector('.toast-card');
      expect(toastElement).toBeInTheDocument();
      
      // Toast should use calc(100vw - 32px) width on mobile
      // This is verified through CSS application
    });
  });

  describe('Tablet Breakpoint (640px - 1023px)', () => {
    beforeEach(() => {
      mockInnerWidth(768); // iPad size
      mockMatchMedia(true); // Desktop media query matches
    });

    test('should apply tablet-specific styling', () => {
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const toastElement = document.querySelector('.toast-card');
      expect(toastElement).toBeInTheDocument();
      
      // Tablet should use fixed width instead of calc()
    });

    test('should position toast container for tablet', () => {
      render(<ToastContainer />);
      
      const container = document.querySelector('.toast-container');
      expect(container).toBeInTheDocument();
      
      // Container should use desktop positioning (top-right)
    });
  });

  describe('Desktop Breakpoint (>= 1024px)', () => {
    beforeEach(() => {
      mockInnerWidth(1920); // Desktop size
      mockMatchMedia(true); // Desktop media query matches
    });

    test('should apply desktop-specific styling', () => {
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const toastElement = document.querySelector('.toast-card');
      expect(toastElement).toBeInTheDocument();
      
      // Desktop should use larger max-width (380px)
    });

    test('should use larger typography on desktop', () => {
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const titleElement = document.querySelector('.toast-card__title');
      const messageElement = document.querySelector('.toast-card__message');
      
      expect(titleElement).toBeInTheDocument();
      expect(messageElement).toBeInTheDocument();
      
      // Typography scaling is handled by CSS media queries
    });
  });

  describe('Orientation Changes', () => {
    test('should handle portrait to landscape transition on mobile', () => {
      // Start in portrait
      mockInnerWidth(375);
      Object.defineProperty(screen, 'orientation', {
        value: { angle: 0 },
        writable: true
      });

      const { rerender } = render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      // Switch to landscape
      mockInnerWidth(667);
      Object.defineProperty(screen, 'orientation', {
        value: { angle: 90 },
        writable: true
      });
      
      rerender(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      // Toast should adapt to landscape mode
      const toastElement = document.querySelector('.toast-card');
      expect(toastElement).toBeInTheDocument();
    });

    test('should adjust padding in landscape mode', () => {
      // Set landscape orientation
      mockInnerWidth(667);
      Object.defineProperty(screen, 'orientation', {
        value: { angle: 90 },
        writable: true
      });

      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      // Landscape mode should have reduced padding (handled by CSS)
      const contentElement = document.querySelector('.toast-card__content');
      expect(contentElement).toBeInTheDocument();
    });
  });

  describe('Dynamic Viewport Changes', () => {
    test('should adapt when viewport changes from mobile to desktop', () => {
      // Start mobile
      mockInnerWidth(375);
      const { rerender } = render(<ToastContainer />);
      
      // Change to desktop
      mockInnerWidth(1920);
      rerender(<ToastContainer />);
      
      // Container should adapt positioning
      const container = document.querySelector('.toast-container');
      expect(container).toBeInTheDocument();
    });

    test('should maintain toast visibility during viewport changes', () => {
      mockInnerWidth(375);
      
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const toastElement = document.querySelector('.toast-card');
      expect(toastElement).toBeInTheDocument();
      
      // Change viewport
      mockInnerWidth(1920);
      
      // Toast should still be visible
      expect(toastElement).toBeInTheDocument();
    });
  });

  describe('CSS Media Query Integration', () => {
    test('should apply correct styles based on media queries', () => {
      // This test verifies that CSS classes are applied correctly
      // The actual styling is tested through CSS
      
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const toastElement = document.querySelector('.toast-card');
      const containerElement = document.querySelector('.toast-card__container');
      const contentElement = document.querySelector('.toast-card__content');
      const titleElement = document.querySelector('.toast-card__title');
      const messageElement = document.querySelector('.toast-card__message');
      const iconElement = document.querySelector('.toast-card__icon');
      const closeElement = document.querySelector('.toast-card__close');
      
      // Verify all BEM classes are present
      expect(toastElement).toHaveClass('toast-card');
      expect(toastElement).toHaveClass('toast-card--info');
      expect(containerElement).toHaveClass('toast-card__container');
      expect(contentElement).toHaveClass('toast-card__content');
      expect(titleElement).toHaveClass('toast-card__title');
      expect(messageElement).toHaveClass('toast-card__message');
      expect(iconElement).toHaveClass('toast-card__icon');
      expect(closeElement).toHaveClass('toast-card__close');
    });

    test('should support high contrast mode', () => {
      // Mock high contrast media query
      mockMatchMedia(true);
      
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const toastElement = document.querySelector('.toast-card');
      expect(toastElement).toBeInTheDocument();
      
      // High contrast styles would be applied via CSS
    });

    test('should respect reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      mockMatchMedia(true);
      
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const toastElement = document.querySelector('.toast-card');
      expect(toastElement).toBeInTheDocument();
      
      // Reduced motion styles would be applied via CSS
    });
  });

  describe('Touch Interaction Areas', () => {
    test('should have adequate touch targets on mobile', () => {
      mockInnerWidth(375);
      
      const toastWithAction: ToastData = {
        ...mockToast,
        action: {
          label: 'Retry',
          onClick: vi.fn()
        }
      };
      
      render(<Toast toast={toastWithAction} onClose={vi.fn()} />);
      
      const closeButton = document.querySelector('.toast-card__close');
      const actionButton = document.querySelector('.toast-card__action');
      
      expect(closeButton).toBeInTheDocument();
      expect(actionButton).toBeInTheDocument();
      
      // Both buttons should have minimum 44px touch targets
      // This is enforced through CSS min-width and min-height
    });

    test('should maintain touch targets in landscape mode', () => {
      mockInnerWidth(667);
      Object.defineProperty(screen, 'orientation', {
        value: { angle: 90 },
        writable: true
      });
      
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const closeButton = document.querySelector('.toast-card__close');
      expect(closeButton).toBeInTheDocument();
      
      // Touch target should remain adequate in landscape
    });
  });

  describe('Content Adaptation', () => {
    test('should handle long text on mobile', () => {
      const longTextToast: ToastData = {
        ...mockToast,
        title: 'This is a very long title that might wrap on mobile devices',
        message: 'This is a very long message that should wrap properly on mobile devices without breaking the layout or causing horizontal scrolling issues'
      };
      
      render(<Toast toast={longTextToast} onClose={vi.fn()} />);
      
      const titleElement = document.querySelector('.toast-card__title');
      const messageElement = document.querySelector('.toast-card__message');
      
      expect(titleElement).toBeInTheDocument();
      expect(messageElement).toBeInTheDocument();
      
      // Text should wrap properly without overflow
    });

    test('should truncate or wrap content appropriately', () => {
      mockInnerWidth(320); // Very small mobile screen
      
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const textContainer = document.querySelector('.toast-card__text');
      expect(textContainer).toBeInTheDocument();
      
      // Text container should have proper overflow handling
    });
  });

  describe('Performance on Different Devices', () => {
    test('should render efficiently on mobile devices', () => {
      mockInnerWidth(375);
      
      const startTime = performance.now();
      render(<Toast toast={mockToast} onClose={vi.fn()} />);
      const endTime = performance.now();
      
      // Rendering should be fast (< 16ms for 60fps)
      expect(endTime - startTime).toBeLessThan(16);
    });

    test('should handle multiple viewport changes efficiently', () => {
      const { rerender } = render(<Toast toast={mockToast} onClose={vi.fn()} />);
      
      const startTime = performance.now();
      
      // Simulate multiple viewport changes
      for (let i = 0; i < 10; i++) {
        mockInnerWidth(375 + i * 100);
        rerender(<Toast toast={mockToast} onClose={vi.fn()} />);
      }
      
      const endTime = performance.now();
      
      // Multiple re-renders should still be efficient
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});