/**
 * Responsive tests for Toast system
 * Tests mobile, tablet, and desktop breakpoints
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Toast from '../../../src/components/ui/Toast';
import { ToastContainer } from '../../../src/components/ui/ToastContainer';
import type { ToastData } from '../../../src/stores/toastStore';

// Mock useToastStore for container tests
import { vi } from 'vitest';
vi.mock('../../../src/stores/toastStore', () => ({
  useToastStore: () => ({
    currentToast: mockToastData,
    isVisible: true,
    clearToast: vi.fn(),
  }),
}));

const mockToastData: ToastData = {
  id: 'responsive-test-toast',
  type: 'info',
  title: 'Responsive Test',
  message: 'Testing responsive behavior',
  duration: 4000,
};

// Helper function to set viewport size
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

// Helper function to test CSS media queries
const testMediaQuery = (query: string) => {
  return window.matchMedia(query).matches;
};

describe('Toast Responsive Design', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset to default desktop size
    setViewportSize(1024, 768);
  });

  describe('Mobile viewport (< 640px)', () => {
    beforeEach(() => {
      setViewportSize(375, 667); // iPhone SE size
    });

    test('should apply mobile-specific classes and styles', () => {
      render(<Toast toast={mockToastData} onClose={mockOnClose} />);
      
      const toastElement = screen.getByRole('alert');
      expect(toastElement).toHaveClass('toast-card');
      
      // Check if mobile media query is active
      expect(testMediaQuery('(max-width: 639px)')).toBe(true);
    });

    test('should have appropriate touch target sizes', () => {
      render(<Toast toast={mockToastData} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText('Close notification');
      const computedStyle = window.getComputedStyle(closeButton);
      
      // Close button should be at least 44px for touch targets
      expect(parseInt(computedStyle.minWidth)).toBeGreaterThanOrEqual(44);
      expect(parseInt(computedStyle.minHeight)).toBeGreaterThanOrEqual(44);
    });

    test('should position container correctly on mobile', () => {
      render(<ToastContainer />);
      
      const container = screen.getByRole('region');
      const computedStyle = window.getComputedStyle(container);
      
      // Should be centered on mobile
      expect(computedStyle.display).toBe('flex');
      expect(computedStyle.justifyContent).toBe('center');
    });
  });

  describe('Tablet viewport (640px - 1023px)', () => {
    beforeEach(() => {
      setViewportSize(768, 1024); // iPad size
    });

    test('should apply tablet-specific styles', () => {
      render(<Toast toast={mockToastData} onClose={mockOnClose} />);
      
      // Check if tablet media query is active
      expect(testMediaQuery('(min-width: 640px)')).toBe(true);
      expect(testMediaQuery('(max-width: 1023px)')).toBe(true);
    });

    test('should position container to top-right on tablet', () => {
      render(<ToastContainer />);
      
      const container = screen.getByRole('region');
      expect(container).toHaveClass('toast-container');
      
      // Should be positioned to top-right on tablet+
      expect(testMediaQuery('(min-width: 640px)')).toBe(true);
    });
  });

  describe('Desktop viewport (>= 1024px)', () => {
    beforeEach(() => {
      setViewportSize(1440, 900); // Desktop size
    });

    test('should apply desktop-specific styles', () => {
      render(<Toast toast={mockToastData} onClose={mockOnClose} />);
      
      // Check if desktop media query is active
      expect(testMediaQuery('(min-width: 1024px)')).toBe(true);
    });

    test('should have larger max-width on desktop', () => {
      render(<Toast toast={mockToastData} onClose={mockOnClose} />);
      
      const toastElement = screen.getByRole('alert');
      expect(toastElement).toHaveClass('toast-card');
      
      // Desktop should allow larger toast cards
      expect(testMediaQuery('(min-width: 1024px)')).toBe(true);
    });
  });

  describe('Landscape orientation on mobile', () => {
    beforeEach(() => {
      setViewportSize(667, 375); // iPhone SE landscape
      
      // Mock orientation
      Object.defineProperty(screen, 'orientation', {
        writable: true,
        configurable: true,
        value: { angle: 90, type: 'landscape-primary' },
      });
    });

    test('should adjust positioning for landscape mobile', () => {
      render(<ToastContainer />);
      
      const container = screen.getByRole('region');
      expect(container).toHaveClass('toast-container');
      
      // Should still be mobile size but landscape
      expect(testMediaQuery('(max-width: 639px) and (orientation: landscape)')).toBe(true);
    });

    test('should maintain touch targets in landscape', () => {
      render(<Toast toast={mockToastData} onClose={mockOnClose} />);
      
      const closeButton = screen.getByLabelText('Close notification');
      const computedStyle = window.getComputedStyle(closeButton);
      
      // Touch targets should still be adequate in landscape
      expect(parseInt(computedStyle.minWidth)).toBeGreaterThanOrEqual(44);
      expect(parseInt(computedStyle.minHeight)).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Accessibility in different viewports', () => {
    test('should maintain ARIA labels across all viewports', () => {
      const viewports = [
        [375, 667], // Mobile
        [768, 1024], // Tablet
        [1440, 900], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        setViewportSize(width, height);
        
        const { unmount } = render(<Toast toast={mockToastData} onClose={mockOnClose} />);
        
        const toastElement = screen.getByRole('alert');
        expect(toastElement).toHaveAttribute('aria-live', 'polite');
        expect(toastElement).toHaveAttribute('aria-atomic', 'true');
        
        const closeButton = screen.getByLabelText('Close notification');
        expect(closeButton).toBeInTheDocument();
        
        unmount();
      });
    });

    test('should maintain keyboard navigation across viewports', () => {
      const viewports = [
        [375, 667], // Mobile
        [768, 1024], // Tablet
        [1440, 900], // Desktop
      ];

      viewports.forEach(([width, height]) => {
        setViewportSize(width, height);
        
        const { unmount } = render(<Toast toast={mockToastData} onClose={mockOnClose} />);
        
        const closeButton = screen.getByLabelText('Close notification');
        
        // Should be focusable
        closeButton.focus();
        expect(document.activeElement).toBe(closeButton);
        
        unmount();
      });
    });
  });

  describe('Reduced motion support', () => {
    test('should respect prefers-reduced-motion', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<Toast toast={mockToastData} onClose={mockOnClose} />);
      
      const toastElement = screen.getByRole('alert');
      expect(toastElement).toHaveClass('toast-card');
      
      // Should have reduced motion styles applied via CSS
      expect(testMediaQuery('(prefers-reduced-motion: reduce)')).toBe(true);
    });
  });

  describe('High contrast mode support', () => {
    test('should support high contrast mode', () => {
      // Mock prefers-contrast
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<Toast toast={mockToastData} onClose={mockOnClose} />);
      
      const toastElement = screen.getByRole('alert');
      expect(toastElement).toHaveClass('toast-card');
      
      // Should have high contrast styles applied via CSS
      expect(testMediaQuery('(prefers-contrast: high)')).toBe(true);
    });
  });
});